export async function loadJsPDF() {
  const { default: jsPDF } = await import('jspdf');
  return jsPDF;
}

export async function loadHtml2Canvas() {
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas;
}

export async function loadTesseract() {
  const Tesseract = await import('tesseract.js');
  return Tesseract;
}

export async function loadQRCode() {
  const QRCode = await import('qrcode');
  return QRCode.default;
}

let jsPDFCache: any = null;
let html2CanvasCache: any = null;
let tesseractCache: any = null;
let qrCodeCache: any = null;

export async function getJsPDF() {
  if (!jsPDFCache) {
    jsPDFCache = await loadJsPDF();
  }
  return jsPDFCache;
}

export async function getHtml2Canvas() {
  if (!html2CanvasCache) {
    html2CanvasCache = await loadHtml2Canvas();
  }
  return html2CanvasCache;
}

export async function getTesseract() {
  if (!tesseractCache) {
    tesseractCache = await loadTesseract();
  }
  return tesseractCache;
}

export async function getQRCode() {
  if (!qrCodeCache) {
    qrCodeCache = await loadQRCode();
  }
  return qrCodeCache;
}
