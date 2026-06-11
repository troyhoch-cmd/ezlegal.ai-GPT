import { getTesseract } from './dynamic-imports';

export interface OCRResult {
  text: string;
  confidence: number;
  pageNumber: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export async function performOCR(
  imageData: string | Blob | File,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  const Tesseract = await getTesseract();

  const result = await Tesseract.recognize(
    imageData,
    'eng',
    {
      logger: (m) => {
        if (onProgress && m.status && typeof m.progress === 'number') {
          onProgress({
            status: m.status,
            progress: Math.round(m.progress * 100)
          });
        }
      }
    }
  );

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    pageNumber: 1
  };
}

export async function performOCROnMultipleImages(
  images: Array<{ data: string; pageNumber: number }>,
  onProgress?: (progress: OCRProgress, pageNumber: number) => void
): Promise<OCRResult[]> {
  const Tesseract = await getTesseract();
  const results: OCRResult[] = [];

  for (const image of images) {
    const dataUrl = image.data.startsWith('data:')
      ? image.data
      : `data:image/png;base64,${image.data}`;

    const result = await Tesseract.recognize(
      dataUrl,
      'eng',
      {
        logger: (m) => {
          if (onProgress && m.status && typeof m.progress === 'number') {
            onProgress(
              { status: m.status, progress: Math.round(m.progress * 100) },
              image.pageNumber
            );
          }
        }
      }
    );

    results.push({
      text: result.data.text,
      confidence: result.data.confidence,
      pageNumber: image.pageNumber
    });
  }

  return results;
}

export function combineOCRResults(results: OCRResult[]): string {
  return results
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map(r => `--- Page ${r.pageNumber} (${Math.round(r.confidence)}% confidence) ---\n${r.text}`)
    .join('\n\n');
}

export function getAverageConfidence(results: OCRResult[]): number {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + r.confidence, 0);
  return Math.round(total / results.length);
}
