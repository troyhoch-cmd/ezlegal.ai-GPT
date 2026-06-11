import { getQRCode } from './dynamic-imports';

const BASE_URL = 'https://ezlegal.ai';

export async function generateQRDataURL(
  url: string,
  size: number = 200
): Promise<string> {
  const QRCode = await getQRCode();
  return QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    color: { dark: '#0A1628', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });
}

export function buildPartnerURL(
  partnerId: string,
  language: 'en' | 'es' = 'es'
): string {
  const path = language === 'es' ? '/es' : '';
  return `${BASE_URL}${path}?ref=${encodeURIComponent(partnerId)}`;
}

export async function generatePartnerQR(
  partnerId: string,
  language: 'en' | 'es' = 'es',
  size: number = 200
): Promise<string> {
  const url = buildPartnerURL(partnerId, language);
  return generateQRDataURL(url, size);
}
