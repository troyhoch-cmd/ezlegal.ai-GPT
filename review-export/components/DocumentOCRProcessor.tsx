import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Copy, Download, X, ScanLine, Eye } from 'lucide-react';
import { convertPdfToImages, DocumentImage } from '../lib/document-extractor';
import { performOCROnMultipleImages, combineOCRResults, getAverageConfidence, OCRProgress, OCRResult } from '../lib/ocr-service';

interface DocumentOCRProcessorProps {
  onTextExtracted?: (text: string) => void;
  onClose?: () => void;
}

type ProcessingStatus = 'idle' | 'converting' | 'scanning' | 'complete' | 'error';

export default function DocumentOCRProcessor({ onTextExtracted, onClose }: DocumentOCRProcessorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState({ page: 0, totalPages: 0, pageProgress: 0, statusText: '' });
  const [extractedText, setExtractedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewImages, setPreviewImages] = useState<DocumentImage[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setExtractedText('');
    setStatus('idle');
    setPreviewImages([]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/tiff'];
      if (validTypes.includes(droppedFile.type) || droppedFile.name.toLowerCase().endsWith('.pdf')) {
        handleFileSelect(droppedFile);
      } else {
        setError('Please upload a PDF or image file (PNG, JPG, WEBP, TIFF)');
      }
    }
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const processDocument = async () => {
    if (!file) return;

    setStatus('converting');
    setError('');
    setExtractedText('');

    try {
      let images: DocumentImage[] = [];

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setProgress({ page: 0, totalPages: 0, pageProgress: 0, statusText: 'Converting PDF pages to images...' });
        images = await convertPdfToImages(file, 20);
        setPreviewImages(images);

        if (images.length === 0) {
          throw new Error('Could not extract pages from PDF. The file may be corrupted.');
        }
      } else {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        images = [{
          data: base64.split(',')[1],
          mimeType: file.type,
          pageNumber: 1,
          filename: file.name
        }];
        setPreviewImages(images);
      }

      setStatus('scanning');
      setProgress({ page: 1, totalPages: images.length, pageProgress: 0, statusText: 'Initializing OCR engine...' });

      const ocrResults: OCRResult[] = await performOCROnMultipleImages(
        images.map(img => ({ data: img.data, pageNumber: img.pageNumber })),
        (prog: OCRProgress, pageNumber: number) => {
          setProgress({
            page: pageNumber,
            totalPages: images.length,
            pageProgress: prog.progress,
            statusText: `${prog.status} (Page ${pageNumber}/${images.length})`
          });
        }
      );

      const combinedText = combineOCRResults(ocrResults);
      const avgConfidence = getAverageConfidence(ocrResults);

      setExtractedText(combinedText);
      setConfidence(avgConfidence);
      setStatus('complete');

      if (onTextExtracted) {
        onTextExtracted(combinedText);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process document');
      setStatus('error');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^/.]+$/, '')}_extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetProcessor = () => {
    setFile(null);
    setStatus('idle');
    setExtractedText('');
    setError('');
    setPreviewImages([]);
    setProgress({ page: 0, totalPages: 0, pageProgress: 0, statusText: '' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Document Scanner (OCR)</h2>
            <p className="text-sm text-blue-100">Extract text from scanned documents and images</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <div className="p-6">
        {status === 'idle' && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                file ? 'border-brand-400 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                id="ocr-file-input"
                onChange={handleInputChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff"
                className="hidden"
              />
              <label htmlFor="ocr-file-input" className="cursor-pointer">
                {file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-brand-100 rounded-xl flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); resetProcessor(); }}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Drop your scanned document here</p>
                      <p className="text-sm text-slate-500">or click to browse</p>
                    </div>
                    <p className="text-xs text-slate-400">Supports PDF, PNG, JPG, WEBP, TIFF</p>
                  </div>
                )}
              </label>
            </div>

            {file && (
              <button
                onClick={processDocument}
                className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ScanLine className="w-5 h-5" />
                Start OCR Processing
              </button>
            )}

            {error && (
              <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}
          </>
        )}

        {(status === 'converting' || status === 'scanning') && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {status === 'converting' ? 'Preparing Document' : 'Scanning for Text'}
            </h3>
            <p className="text-slate-600 mb-4">{progress.statusText}</p>

            {progress.totalPages > 0 && (
              <div className="max-w-xs mx-auto">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>Page {progress.page} of {progress.totalPages}</span>
                  <span>{progress.pageProgress}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all duration-300"
                    style={{
                      width: `${((progress.page - 1) / progress.totalPages * 100) + (progress.pageProgress / progress.totalPages)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'complete' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Text Extracted Successfully</h3>
                  <p className="text-sm text-slate-500">
                    Confidence: {confidence}% | {previewImages.length} page(s) processed
                  </p>
                </div>
              </div>
              {previewImages.length > 0 && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide' : 'Preview'}
                </button>
              )}
            </div>

            {showPreview && previewImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 bg-white">
                    <img
                      src={`data:${img.mimeType};base64,${img.data}`}
                      alt={`Page ${img.pageNumber}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <textarea
                readOnly
                value={extractedText}
                className="w-full h-64 p-4 border border-slate-300 rounded-lg bg-slate-50 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-success-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                <button
                  onClick={downloadText}
                  className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Download as text file"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetProcessor}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Scan Another Document
              </button>
              {onTextExtracted && (
                <button
                  onClick={() => onTextExtracted(extractedText)}
                  className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
                >
                  Use Extracted Text
                </button>
              )}
            </div>

            {confidence < 70 && (
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-warning-700">
                  <p className="font-semibold">Low Confidence Score</p>
                  <p>The OCR confidence is below 70%. The document may have poor image quality, unusual fonts, or handwritten text. Please review the extracted text carefully.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-error-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Processing Failed</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={resetProcessor}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          OCR (Optical Character Recognition) extracts text from scanned documents and images.
          For best results, ensure documents are clear and well-lit. Processing happens locally in your browser - your documents are never uploaded to our servers.
        </p>
      </div>
    </div>
  );
}
