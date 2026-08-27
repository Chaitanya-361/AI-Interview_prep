import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import interviewRoutes from './routes/interview.js';
import userRoutes from './routes/user.js';
import coverLetterRoutes from './routes/coverLetter.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());                      // automatically adds 15+ HTTP security headers to your server responses
app.use(cors());                        // allows other origins to connect to our backend
app.use(express.json());                // used to parse incoming requests with JSON payloads

// Logging
app.use(morgan('dev'));                 // simple HTTP request logging

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cover-letter', coverLetterRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Backend is running smoothly'
    });
});

app.listen(PORT, () => {
    console.log('Server is running on port' + PORT);
});
