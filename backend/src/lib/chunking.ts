export interface TextChunk {
    text: string;
    chunkIndex: number;
}

export const chunkText = ( text: string, chunkSize: number = 500, overlap: number = 50 ): TextChunk[] => {
    if( !text || text.trim().length === 0 ) {
        return [];
    }

    const chunks: TextChunk[] = [];
    let startIndex = 0;
    let chunkIndex = 0;

    // Split text by paragraphs first for cleaner natural boundaries
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';

    for ( const paragraph of paragraphs ) {
        const trimmedPara = paragraph.trim();
        if(!trimmedPara) continue;

        // If adding this paragraph exceeds chunkSize save current chunk and start new one
        if(currentChunk.length + trimmedPara.length > chunkSize && currentChunk.length > 0) {
            chunks.push({
                text: currentChunk.trim(),
                chunkIndex: chunkIndex++,
            });

            const overlapText = currentChunk.slice(-overlap);
            currentChunk = overlapText + '\n' + trimmedPara;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
        }
    }

    // Add the last chunk
    if(currentChunk.trim().length > 0) {
        chunks.push({
            text: currentChunk.trim(),
            chunkIndex: chunkIndex++,
        });
    }

    return chunks;
};