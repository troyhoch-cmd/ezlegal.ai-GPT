import QRCode from 'qrcode';

export type QrEcc = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  size?: number;
  ecc?: QrEcc;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

export async function generateQrDataUrl(payload: string, options: QrOptions = {}): Promise<string> {
  const { size = 256, ecc = 'M', margin = 2, darkColor = '#0b3b46', lightColor = '#ffffff' } = options;
  if (!payload.trim()) {
    throw new Error('Payload is required');
  }
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: ecc,
    width: size,
    margin,
    color: { dark: darkColor, light: lightColor },
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);/)?.[1] ?? 'image/png';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
