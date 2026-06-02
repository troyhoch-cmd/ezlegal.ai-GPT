import Tesseract from 'tesseract.js';

export type OcrLanguage = 'eng' | 'spa' | 'eng+spa';

export interface OcrResult {
  text: string;
  confidence: number;
  language: OcrLanguage;
}

export async function runOcr(
  file: File | Blob,
  language: OcrLanguage = 'eng',
  onProgress?: (p: number) => void
): Promise<OcrResult> {
  const result = await Tesseract.recognize(file, language, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  return {
    text: result.data.text || '',
    confidence: Math.round(result.data.confidence || 0),
    language,
  };
}
