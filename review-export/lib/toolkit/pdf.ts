import jsPDF from 'jspdf';

export type PdfTemplate = 'blank' | 'contract-summary' | 'intake-packet' | 'risk-report';

export interface PdfBuildInput {
  title: string;
  template: PdfTemplate;
  sections: Array<{ heading?: string; body: string }>;
  footer?: string;
}

export function buildPdf(input: PdfBuildInput): { blob: Blob; dataUrl: string } {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 54;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(input.title || 'Untitled Document', margin, y);
  y += 12;

  doc.setDrawColor(20, 120, 130);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Template: ${input.template}`, margin, y);
  doc.text(new Date().toLocaleString(), pageWidth - margin, y, { align: 'right' });
  y += 24;

  doc.setTextColor(20);
  for (const section of input.sections) {
    if (y > pageHeight - margin - 60) {
      doc.addPage();
      y = margin;
    }
    if (section.heading) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(section.heading, margin, y);
      y += 16;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(section.body || '', pageWidth - margin * 2);
    for (const line of lines) {
      if (y > pageHeight - margin - 40) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    }
    y += 10;
  }

  if (input.footer) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(input.footer, margin, pageHeight - 30);
  }

  const blob = doc.output('blob');
  const dataUrl = doc.output('datauristring');
  return { blob, dataUrl };
}

export function templateDefaults(template: PdfTemplate): PdfBuildInput {
  switch (template) {
    case 'contract-summary':
      return {
        title: 'Contract Summary',
        template,
        sections: [
          { heading: 'Parties', body: 'List the parties involved in the agreement.' },
          { heading: 'Key Terms', body: 'Summarize term length, payment, and deliverables.' },
          { heading: 'Risk Notes', body: 'Highlight indemnification, liability caps, and auto-renewal.' },
        ],
        footer: 'Legal information, not legal advice.',
      };
    case 'intake-packet':
      return {
        title: 'Client Intake Packet',
        template,
        sections: [
          { heading: 'Client Details', body: 'Name, contact, preferred language, jurisdiction.' },
          { heading: 'Matter Summary', body: 'Describe the issue in plain language.' },
          { heading: 'Next Steps', body: 'Actions, deadlines, documents to gather.' },
        ],
        footer: 'Confidential - prepared for internal review.',
      };
    case 'risk-report':
      return {
        title: 'Risk Report',
        template,
        sections: [
          { heading: 'Overview', body: 'Scope of review and documents analyzed.' },
          { heading: 'Findings', body: 'Material risks identified by severity.' },
          { heading: 'Recommendations', body: 'Suggested remediation and follow-ups.' },
        ],
        footer: 'Automated analysis - attorney review recommended.',
      };
    default:
      return { title: 'Untitled Document', template: 'blank', sections: [{ body: '' }] };
  }
}
