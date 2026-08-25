import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());                      // automatically adds 15+ HTTP security headers to your server responses
app.use(cors());                        // allows other origins to connect to our backend
app.use(express.json());                // used to parse incoming requests with JSON payloads

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Backend is running smoothly'
    });
});

app.listen(PORT, () => {
    console.log('Server is running on port' + PORT);
});
