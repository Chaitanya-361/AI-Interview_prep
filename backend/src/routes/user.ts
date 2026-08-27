import { Router } from 'express';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/user/history
// Fetches the user's past resume analyses and interview scorecards
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Fetch completed interview sessions with their scorecards
        const interviews = await prisma.interviewSession.findMany({
            where: { 
                userId,
                status: 'completed'
            },
            include: {
                scorecard: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch past resume analyses (linked through the user's resumes)
        const resumeAnalyses = await prisma.resumeAnalysis.findMany({
            where: {
                resume: { userId }
            },
            include: {
                resume: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch saved cover letters
        const coverLetters = await prisma.coverLetter.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch all user resumes (even if not analyzed yet)
        const resumes = await prisma.resume.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ interviews, resumeAnalyses, coverLetters, resumes });
    } catch (error: any) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
