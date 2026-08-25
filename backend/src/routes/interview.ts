import { Router } from 'express';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { generateInterviewResponse, evaluateInterview, type InterviewMessageInput } from '../lib/llm.js';

const router = Router();

// 1. Start a new interview session
router.post('/setup', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;

        if(!userId) return res.status(401).json({error: 'Unauthorized'});

        const { company, role, difficulty, type, resumeId } = req.body;

        const session = await prisma.interviewSession.create({
            data: {
                userId,
                resumeId: resumeId || null,
                company,
                role,
                difficulty,
                type,
                status: 'ongoing',
            },
        });

        const greeting = `Welcome to your interview at ${company} for the ${role} position! Are you ready to begin?`;
        await prisma.interviewMessage.create({
            data: {
                sessionId: session.id,
                role: 'model',
                content: greeting
            }
        });

        res.status(201).json(session);
    } catch (error: any) {
        console.error("Setup Error:", error);
        res.status(500).json({error: error.message || 'Failed to start interview'});
    }
});

// 2. Get an existing session and its messages
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const sessionId = req.params.id;
        if (!sessionId || typeof sessionId !== 'string') return res.status(400).json({ error: 'Valid ID required' });

        const session = await prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: 'asc' } }, scorecard: true }
        });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
// 3. Send a message to the AI and get a response
router.post('/:id/message', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const sessionId = req.params.id;
        const { content } = req.body;
        
        if (!sessionId || typeof sessionId !== 'string') return res.status(400).json({ error: 'Valid ID required' });

        const session = await prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (session.status === 'completed') return res.status(400).json({ error: 'Interview is already over' });
        // Save the user's message
        const userMsg = await prisma.interviewMessage.create({
            data: { sessionId, role: 'user', content }
        });
        // Format history for Gemini
        const rawHistory: InterviewMessageInput[] = session.messages.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Collapse consecutive messages of the same role (prevents API crashes if DB gets corrupted with double user messages)
        const history: InterviewMessageInput[] = [];
        for (const msg of rawHistory) {
            const lastMsg = history[history.length - 1];
            if (lastMsg && lastMsg.role === msg.role) {
                lastMsg.parts[0]!.text += '\n\n' + msg.parts[0]!.text;
            } else {
                history.push(msg);
            }
        }

        // Gemini SDK requires the first message in the chat history to be from the 'user'
        const firstMsg = history[0];
        if (firstMsg && firstMsg.role === 'model') {
            history.unshift({
                role: 'user',
                parts: [{ text: 'Hello, I am ready for the interview.' }]
            });
        }
        // Get AI response
        const aiReply = await generateInterviewResponse(
            session.company, 
            session.role, 
            session.difficulty, 
            session.type, 
            history, 
            content
        );
        // Save AI response
        const newMsg = await prisma.interviewMessage.create({
            data: { sessionId, role: 'model', content: aiReply }
        });
        // Return both messages so frontend can update its state properly
        res.json([userMsg, newMsg]);
    } catch (error: any) {
        console.error("Message error: ", error);
        res.status(500).json({ error: error.message });
    }
});
// 4. End the interview and generate scorecard
router.post('/:id/end', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const sessionId = req.params.id;
        if (!sessionId || typeof sessionId !== 'string') return res.status(400).json({ error: 'Valid ID required' });
        
        const session = await prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        // Convert the chat history into a single transcript text for evaluation
        const transcript = session.messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');
        // Call AI to evaluate the transcript
        const evaluation = await evaluateInterview(session.company, session.role, transcript);
        // Save the scorecard
        const scorecard = await prisma.interviewScorecard.create({
            data: {
                sessionId,
                overallScore: evaluation.overallScore,
                communication: evaluation.communication,
                technical: evaluation.technical,
                feedback: evaluation.feedback
            }
        });
        // Mark session as completed
        await prisma.interviewSession.update({
            where: { id: sessionId },
            data: { status: 'completed' }
        });
        res.json(scorecard);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Delete an interview session
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const sessionId = req.params.id as string;
        const userId = req.user?.id;
        if (!sessionId || !userId) return res.status(400).json({ error: 'Valid ID required' });

        const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (session.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        await prisma.interviewSession.delete({ where: { id: sessionId } });
        res.json({ success: true });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete interview' });
    }
});

export default router;