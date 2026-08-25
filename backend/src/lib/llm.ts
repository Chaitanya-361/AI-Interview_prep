import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface ResumeAnalysisResult {
    atsScore: number;
    strengths: string[];
    weaknesses: string[];
    skillGaps: string[];
    suggestions: {
        original: string;
        suggested: string;
        reason: string;
    }[];
}

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || '';

    if(!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    return new GoogleGenerativeAI(apiKey)
};

// TODO: Add OpenAI also as an LLM provider for later versions 

export const analyzeResumeText = async (resumeText: string): Promise<ResumeAnalysisResult> => {
    const provider = process.env.LLM_PROVIDER || 'gemini';

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) scanner and tech career coach. 
    Analyze the provided resume and return ONLY a valid JSON object matching this exact TypeScript structure without markdown formatting or code fences:
    {
        "atsScore": number (between 0 and 100),
        "strengths": string[] (list of 3-5 top strengths),
        "weaknesses": string[] (list of 3-5 areas of improvement),
        "skillGaps": string[] (list of missing industry standard technical skills),
        "suggestions": [
            {
            "original": string (weak bullet point from resume),
            "suggested": string (improved high-impact metric-driven bullet point),
            "reason": string (why this change improves the ATS score)
            }
        ]
    }
    Resume Text:
    ${resumeText}`;

    let rawResponse = '';

    if(provider === 'gemini') {
        const ai = getGeminiClient();
        const model = ai.getGenerativeModel({
            model: 'gemini-3.6-flash'
        });

        const result = await model.generateContent(systemPrompt);
        rawResponse = result.response.text();
    } else{ /* add OpenAI functionality later */ }

    // AI generally responds with a markdown, so this is to remove the markdown syntax
    const cleanedJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const parsedData: ResumeAnalysisResult = JSON.parse(cleanedJson);
        return parsedData;
    } catch ( error ) {
        throw new Error('Failed to parse AI response as structured JSON');
    }
}

export const generateCoverLetter = async (resumeText: string, jobDescription: string): Promise<string> => {
    const provider = process.env.LLM_PROVIDER || 'gemini';

    const systemPrompt = `You are an expert career coach and professional copywriter.
    Write a highly tailored, professional, and compelling cover letter for the following job description, leveraging the experiences and skills from the provided resume.
    The cover letter should:
    - Be formatted in plain text (no markdown, no bolding).
    - Have a standard professional structure (Header, Salutation, Intro, Body, Closing).
    - Highlight specific accomplishments from the resume that directly align with the job description.
    - Not invent or hallucinate any experiences that aren't in the resume.
    - Be approximately 3-4 paragraphs long.
    
    Job Description:
    ${jobDescription}
    
    Resume Text:
    ${resumeText}`;

    if (provider === 'gemini') {
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
        const result = await model.generateContent(systemPrompt);
        return result.response.text();
    }

    throw new Error('Unsupported LLM provider');
}

export interface InterviewMessageInput {
    role: 'user' | 'model'; // 'model' is what Gemini calls the AI assistant
    parts: { text: string }[];
}

export const generateInterviewResponse = async (
    company: string,
    role: string,
    difficulty: string,
    type: string,
    history: InterviewMessageInput[],
    userMessage: string
): Promise<string> => {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({
        model: 'gemini-3.6-flash',
        systemInstruction: `You are an expert technical interviewer at ${company} interviewing a candidate for a ${role} position. 
        The interview type is ${type} and the difficulty is ${difficulty}. 
        Ask one question at a time. Do not break character. Give brief, realistic feedback on their previous answer if applicable, then ask the next question. Keep your responses concise and conversational.`
    });

    const chat = model.startChat({
        history: history,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
};

export const evaluateInterview = async (
    company: string,
    role: string,
    historyText: string
) => {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `You are a hiring manager at ${company} reviewing an interview transcript for a ${role} position.
    Review the following transcript and evaluate the candidate. 
    Return ONLY a valid JSON object matching this exact structure:
    {
        "overallScore": number (0-100),
        "communication": number (0-100),
        "technical": number (0-100),
        "feedback": {
            "strengths": ["...", "..."],
            "areasToImprove": ["...", "..."],
            "finalVerdict": "string (brief summary)"
        }
    }
    
    Transcript:
    ${historyText}`;

    const result = await model.generateContent(prompt);
    const cleanedJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedJson);
};
