import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface DocumentImage {
  data: string;
  mimeType: string;
  pageNumber: number;
  filename: string;
}

export async function convertPdfToImages(file: File, maxPages: number = 5): Promise<DocumentImage[]> {
  const images: DocumentImage[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    const pagesToRender = Math.min(pdf.numPages, maxPages);

    for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const scale = 2.0;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const dataUrl = canvas.toDataURL('image/png', 0.9);
      const base64Data = dataUrl.split(',')[1];

      images.push({
        data: base64Data,
        mimeType: 'image/png',
        pageNumber: pageNum,
        filename: file.name,
      });
    }
  } catch (error) {
    console.error('Failed to convert PDF to images:', error);
  }

  return images;
}

export async function convertImageToBase64(file: File): Promise<DocumentImage | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({
        data: base64Data,
        mimeType: file.type,
        pageNumber: 1,
        filename: file.name,
      });
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return readTextFile(file);
  }

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractPdfText(file);
  }

  if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return extractDocText(file);
  }

  throw new Error(`Unsupported file type: ${fileType || fileName}`);
}

async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

async function extractPdfText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);

    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    const textParts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');

      if (pageText.trim()) {
        textParts.push(`--- Page ${pageNum} ---\n${pageText}`);
      }
    }

    const result = textParts.join('\n\n').trim();

    if (!result) {
      return '[SCANNED_PDF_DETECTED]';
    }

    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. The file may be corrupted or encrypted.');
  }
}

async function extractDocText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const content = decoder.decode(uint8Array);

  const textParts: string[] = [];
  const textRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
  let match;
  while ((match = textRegex.exec(content)) !== null) {
    textParts.push(match[1]);
  }

  if (textParts.length > 0) {
    return textParts.join(' ').trim();
  }

  const readableText = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\x20-\x7E\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = readableText.split(' ').filter(w => w.length >= 3 && /^[A-Za-z]/.test(w));
  return words.slice(0, 1000).join(' ');
}

export async function extractTextFromFiles(files: File[]): Promise<string> {
  const results: string[] = [];

  for (const file of files) {
    try {
      const text = await extractTextFromFile(file);
      if (text.trim()) {
        results.push(`--- Document: ${file.name} ---\n${text}`);
      }
    } catch (error) {
      console.error(`Failed to extract text from ${file.name}:`, error);
      results.push(`--- Document: ${file.name} ---\n[Unable to extract text from this file]`);
    }
  }

  return results.join('\n\n');
}
