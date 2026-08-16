import { Router } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/register', async (req, res) => {
    try{
        const {email, password, name} = req.body;

        if(!email || !password || !name) {
            return res.status(400).json({error: 'Email, name, password are required'});
        }

        const existingUser = await prisma.user.findUnique({where: {email}});

        if(existingUser){
            return res.status(400).json({error: 'User with this email already exists'});
        }

        const passwordHash = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash
            }
        });

        const tokenSecret = process.env.JWT_SECRET || 'fallback-secret';

        const accessToken = jwt.sign(
            { sub: user.id, role: user.role },
            tokenSecret,
            { expiresIn: '15m' }
        );

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            accessToken,
        });

    }catch(error){
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({where: {email}});

        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await argon2.verify(user.passwordHash, password);

        if (!isValidPassword) { 
            return res.status(401).json({ error: 'Invalid credentials' }); 
        }

        const tokenSecret = process.env.JWT_SECRET || 'fallback-secret';

        const accessToken = jwt.sign(
            { sub: user.id, role: user.role },
            tokenSecret,
            { expiresIn: '15m' }
        );

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
        });

    }catch(error){
        return res.status(500).json({error: 'Internal server error'});
    }
});

export default router;