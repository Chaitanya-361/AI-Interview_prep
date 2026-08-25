import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import { extractTextFromFile } from '../lib/parsing.js';
import { prisma } from '../lib/prisma.js';
import { chunkText } from '../lib/chunking.js';
import { analyzeResumeText } from '../lib/llm.js';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer ({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
        console.log('Incoming File details:', file.originalname, 'MimeType:', file.mimetype);

        const allowedMimeTypes = [
          'application/pdf',
          'application/x-pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'application/octet-stream',
        ];

        const isPdfOrDocx = file.originalname.match(/\.(pdf|docx|doc)$/i);

        if (allowedMimeTypes.includes(file.mimetype) || isPdfOrDocx) {
            cb(null, true);
        } else {
            cb(new Error('RESUME_UPLOAD_TYPE: Invalid file type. Please upload a PDF or DOCX file.'));
        }
    },
});

router.post('/upload', authenticateToken, upload.single('resume'), async (req: AuthenticatedRequest, res) => {
    try {
        if(!req.file) { 
            return res.status(400).json({ error: 'Please selct pdf or docx file to upload'}); 
        }

        const userId = req.user?.id;
        if(!userId) { return res.status(401).json({ error: 'Unauthorized' })}

        const parsedResume = await extractTextFromFile(req.file.buffer, req.file.mimetype);
        
        const uniqueFileName = `${userId}_${Date.now()}_${req.file.originalname}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        
        fs.writeFileSync(filePath, req.file.buffer);

        const newResume = await prisma.resume.create({
            data: {
                userId,
                fileUrl: `/uploads/resumes/${uniqueFileName}`,
                rawText: parsedResume.text,
            },
        });

        return res.status(201).json({
            message: 'Resume uploaded and parsed successfully',
            resume: {
                id: newResume.id,
                fileUrl: newResume.fileUrl,
                characterCount: parsedResume.characterCount,
                uploadedAt: newResume.uploadedAt,
            },
        });

    } catch(error: any) {
        if(error.message?.startsWith('RESUME_PARSE_EMPTY')) {
            return res.status(422).json({ error: error.message });
        }

        return res.status(500).json({ error: error.message || 'Failed to upload and parse resume'});
    }
});

router.post('/:id/analyze', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try{
        const resumeId = req.params.id;
        const userId = req.user?.id;

        if(!userId){
            return res.status(401).json({error: 'Unauthorized'});
        }

        const resume = await prisma.resume.findFirst({
            where: {
                id: resumeId,
                userId: userId,
            },
        });

        if(!resume || !resume.rawText){
            return res.status(404).json({error: 'Resume not found or contains no readable text'});
        }
        
        const textChunks = chunkText(resume.rawText, 500, 50);

        // clear old chunks if re-analyzing
        await prisma.resumeChunk.deleteMany({
            where: {
                resumeId: resume.id,
            }
        });

        if(textChunks.length > 0) {
            await prisma.resumeChunk.createMany({
                data: textChunks.map((chunk) => ({
                    resumeId: resume.id,
                    chunkText: chunk.text,
                })),
            });
        }

        const aiAnalysis = await analyzeResumeText(resume.rawText);

        const savedAnalysis = await prisma.resumeAnalysis.create({
            data: {
                resumeId: resume.id,
                atsScore: aiAnalysis.atsScore,
                strengths: aiAnalysis.strengths,
                weaknesses: aiAnalysis.weaknesses,
                skillGaps: aiAnalysis.skillGaps,
                suggestions: aiAnalysis.suggestions,
            },
        });

        return res.status(200).json({
            message: 'Resume analyzed successfully',
            analysis: savedAnalysis,
        });
    } catch (error: any) {
        console.error('Resume Analysis Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to analyze resume' });
    }
});

export default router;




