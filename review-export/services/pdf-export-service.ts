import { getJsPDF, getHtml2Canvas } from '../lib/dynamic-imports';
import { generatePartnerQR } from '../lib/qr-generator';
import type { PartnerAsset } from './asset-service';

const BRAND = {
  navy900: '#0A1628',
  navy700: '#1E293B',
  navy400: '#64748B',
  navy100: '#E2E8F0',
  navy50: '#F0F4F8',
  teal600: '#0D9488',
  teal100: '#CCFBF1',
  white: '#FFFFFF',
  amber50: '#FFFBEB',
  amber700: '#B45309',
  red600: '#DC2626',
};

function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export async function exportPreviewAsPDF(
  previewElement: HTMLElement,
  fileName: string
): Promise<void> {
  const [html2canvas, jsPDF] = await Promise.all([
    getHtml2Canvas(),
    getJsPDF()
  ]);

  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: imgHeight > 297 ? 'portrait' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = 297;
  let yOffset = 0;

  while (yOffset < imgHeight) {
    if (yOffset > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight);
    yOffset += pageHeight;
  }

  pdf.save(`${fileName}.pdf`);
}

export async function exportAssetContentAsPDF(
  asset: PartnerAsset,
  options?: { partnerId?: string; includeQR?: boolean }
): Promise<void> {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;

  const setColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setTextColor(r, g, b);
  };

  const setFillColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setFillColor(r, g, b);
  };

  const setDrawColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setDrawColor(r, g, b);
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > 277) {
      pdf.addPage();
      y = 20;
    }
  };

  setFillColor(BRAND.navy900);
  pdf.rect(0, 0, pageW, 28, 'F');

  setColor(BRAND.white);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(asset.name, margin, 12);

  pdf.setFontSize(8);
  setColor(BRAND.teal100);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${asset.asset_type.toUpperCase()} | ${asset.audience}`, margin, 18);

  setColor(BRAND.navy400);
  pdf.setFontSize(7);
  const dateStr = `v${asset.readiness?.version || 1} | ${new Date(asset.updated_at).toLocaleDateString()}`;
  pdf.text(dateStr, pageW - margin - pdf.getTextWidth(dateStr), 24);

  y = 36;

  if (asset.description) {
    setColor(BRAND.navy400);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    const descLines = pdf.splitTextToSize(asset.description, contentW);
    pdf.text(descLines, margin, y);
    y += descLines.length * 4.5 + 4;
  }

  for (const section of asset.content_sections) {
    checkPageBreak(20);

    setFillColor(BRAND.teal600);
    pdf.rect(margin, y - 1, 2, 5, 'F');

    setColor(BRAND.teal600);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section.heading, margin + 5, y + 3);
    y += 8;

    setColor(BRAND.navy700);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    for (const line of section.content) {
      if (!line.trim()) {
        y += 3;
        continue;
      }
      checkPageBreak(8);
      const wrapped = pdf.splitTextToSize(line, contentW - 5);
      pdf.text(wrapped, margin + 5, y);
      y += wrapped.length * 4.2 + 2;
    }
    y += 4;
  }

  if (options?.includeQR && options?.partnerId) {
    checkPageBreak(40);
    y += 4;
    setDrawColor(BRAND.navy100);
    pdf.line(margin, y, pageW - margin, y);
    y += 8;

    const qrDataUrl = await generatePartnerQR(
      options.partnerId,
      asset.slug === 'spanish-flyer' ? 'es' : 'en',
      300
    );
    pdf.addImage(qrDataUrl, 'PNG', margin, y, 25, 25);

    setColor(BRAND.navy900);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Scan to get started', margin + 30, y + 8);

    setColor(BRAND.teal600);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const lang = asset.slug === 'spanish-flyer' ? 'es' : 'en';
    const url = `ezlegal.ai/${lang === 'es' ? 'es' : ''}?ref=${options.partnerId}`;
    pdf.text(url, margin + 30, y + 14);

    setColor(BRAND.navy400);
    pdf.setFontSize(7);
    pdf.text(`Partner: ${options.partnerId}`, margin + 30, y + 20);
  }

  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    setFillColor(BRAND.navy50);
    pdf.rect(0, 287, pageW, 10, 'F');

    setColor(BRAND.navy400);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'ezLegal.ai provides legal information, not legal advice. Not a law firm. Not a substitute for an attorney.',
      pageW / 2,
      292,
      { align: 'center' }
    );
    pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, 292, { align: 'right' });
  }

  const safeName = asset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  pdf.save(`ezlegal-${safeName}.pdf`);
}

export async function exportKitAsPDF(
  assets: PartnerAsset[],
  kitOptions: {
    language: string;
    jurisdiction: string;
    stage: string;
    partnerId?: string;
  }
): Promise<void> {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;

  const setColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setTextColor(r, g, b);
  };

  const setFillColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setFillColor(r, g, b);
  };

  setFillColor(BRAND.navy900);
  pdf.rect(0, 0, pageW, 60, 'F');

  setColor(BRAND.white);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ezLegal.ai', margin, 25);
  pdf.setFontSize(14);
  pdf.text('Partner Kit', margin, 35);

  setColor(BRAND.teal100);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const meta = [
    `Language: ${kitOptions.language === 'both' ? 'EN + ES' : kitOptions.language.toUpperCase()}`,
    `Jurisdiction: ${kitOptions.jurisdiction === 'all' ? 'All' : kitOptions.jurisdiction}`,
    `Stage: ${kitOptions.stage === 'all' ? 'All' : kitOptions.stage}`,
    `Assets: ${assets.length}`,
    `Generated: ${new Date().toLocaleDateString()}`,
  ].join('  |  ');
  pdf.text(meta, margin, 50);

  let y = 72;

  setColor(BRAND.navy900);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Contents', margin, y);
  y += 6;

  for (let i = 0; i < assets.length; i++) {
    setColor(BRAND.teal600);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${i + 1}. ${assets[i].name} (${assets[i].asset_type.toUpperCase()})`, margin + 4, y);
    y += 5;
  }

  for (const asset of assets) {
    pdf.addPage();
    y = 0;

    setFillColor(BRAND.teal600);
    pdf.rect(0, 0, pageW, 22, 'F');

    setColor(BRAND.white);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(asset.name, margin, 10);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${asset.asset_type.toUpperCase()} | ${asset.audience}`, margin, 17);

    y = 30;

    const checkPageBreak = (needed: number) => {
      if (y + needed > 277) {
        pdf.addPage();
        y = 20;
      }
    };

    for (const section of asset.content_sections) {
      checkPageBreak(16);

      setFillColor(BRAND.navy900);
      pdf.rect(margin, y - 1, 2, 5, 'F');

      setColor(BRAND.navy900);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.heading, margin + 5, y + 3);
      y += 8;

      setColor(BRAND.navy700);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      for (const line of section.content) {
        if (!line.trim()) {
          y += 3;
          continue;
        }
        checkPageBreak(8);
        const wrapped = pdf.splitTextToSize(line, contentW - 5);
        pdf.text(wrapped, margin + 5, y);
        y += wrapped.length * 4.2 + 2;
      }
      y += 4;
    }
  }

  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    setFillColor(BRAND.navy50);
    pdf.rect(0, 287, pageW, 10, 'F');
    setColor(BRAND.navy400);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'ezLegal.ai provides legal information, not legal advice.',
      pageW / 2,
      292,
      { align: 'center' }
    );
    pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, 292, { align: 'right' });
  }

  const dateSuffix = new Date().toISOString().split('T')[0];
  pdf.save(`ezlegal-partner-kit-${dateSuffix}.pdf`);
}
