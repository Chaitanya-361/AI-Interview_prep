// @ts-ignore

import pdfParse from 'pdf-parse';  // its built as a commonjs module so need to write ts-ignore
import mammoth from 'mammoth';

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