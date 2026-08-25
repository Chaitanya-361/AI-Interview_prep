// Node ES Modules ("type": "module") require createRequire to safely 
// load legacy CommonJS packages (like pdf-parse) that lack default ES exports

import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface ExtractedResumeText {
  text: string;
  characterCount: number;
}

export const extractTextFromFile = async (fileBuffer: Buffer, mimeType: string): Promise<ExtractedResumeText> => {
    let extractedText = '';

    if(mimeType === 'application/pdf'){
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
    }else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
    } else {
        throw new Error('Unsupported file format. Please upload a PDF or a DOCX file. ');
    }

    // Clean up excessive blank lines and whitespace
    const cleanedText = extractedText.replace(/\n\s*\n/g, '\n').trim();

    // Validate that text was actually extracted (scanned/image PDFs have 0 text)
    if (!cleanedText || cleanedText.length < 50) {
        throw new Error('RESUME_PARSE_EMPTY: Could not extract text from file. Please ensure it is not a scanned image.');
    }
    return {
        text: cleanedText,
        characterCount: cleanedText.length,
    };

};