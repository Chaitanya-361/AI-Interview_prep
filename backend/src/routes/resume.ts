import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import { extractTextFromFile } from '../lib/parsing.js';
import { prisma } from '../lib/prisma.js';

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
        const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('RESUME_UPLOAD_TYPE: Invalid file type. Please upload a PDF or DOCX file.'));
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

export default router;




