import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { generateCoverLetter } from '../lib/llm.js';
import { extractTextFromFile } from '../lib/parsing.js';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// 0. Upload and parse Job Description PDF
router.post('/upload-jd', authenticateToken, upload.single('jd'), async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a PDF or DOCX file' });
        }
        const parsed = await extractTextFromFile(req.file.buffer, req.file.mimetype);
        res.json({ text: parsed.text });
    } catch (error: any) {
        console.error('JD upload error:', error);
        res.status(500).json({ error: 'Failed to parse JD file' });
    }
});

// 1. Generate Cover Letter
router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const { resumeId, jobDescription } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!resumeId || !jobDescription) return res.status(400).json({ error: 'Missing required fields' });

        const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
        if (!resume) return res.status(404).json({ error: 'Resume not found' });
        if (resume.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
        if (!resume.rawText) return res.status(400).json({ error: 'Resume has no parsed text' });

        const coverLetterContent = await generateCoverLetter(resume.rawText, jobDescription);

        res.json({ content: coverLetterContent });
    } catch (error: any) {
        console.error('Cover letter generation error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
    }
});

// 2. Save Cover Letter to Database
router.post('/save', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const { resumeId, jobDescription, content } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!content || !jobDescription) return res.status(400).json({ error: 'Missing content or job description' });

        const coverLetter = await prisma.coverLetter.create({
            data: {
                userId,
                resumeId: resumeId || null,
                jobDescription,
                content,
            }
        });

        res.status(201).json({ message: 'Cover letter saved', coverLetter });
    } catch (error: any) {
        console.error('Cover letter save error:', error);
        res.status(500).json({ error: 'Failed to save cover letter' });
    }
});

// 3. Get User's Cover Letters
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const coverLetters = await prisma.coverLetter.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ coverLetters });
    } catch (error: any) {
        console.error('Fetch cover letters error:', error);
        res.status(500).json({ error: 'Failed to fetch cover letters' });
    }
});

// 4. Delete Cover Letter
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.id;

        if (!id || !userId) return res.status(400).json({ error: 'Valid ID required' });

        const coverLetter = await prisma.coverLetter.findUnique({ where: { id } });
        if (!coverLetter) return res.status(404).json({ error: 'Cover letter not found' });
        if (coverLetter.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        await prisma.coverLetter.delete({ where: { id } });
        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete cover letter error:', error);
        res.status(500).json({ error: 'Failed to delete cover letter' });
    }
});

export default router;
