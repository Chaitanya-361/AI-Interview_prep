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
