import { useEffect, useState } from 'react';
import { FileText, QrCode, ScanText, Table as TableIcon, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { buildPdf, templateDefaults, type PdfTemplate } from '../lib/toolkit/pdf';
import { generateQrDataUrl, dataUrlToBlob, type QrEcc } from '../lib/toolkit/qr';
import { runOcr, type OcrLanguage } from '../lib/toolkit/ocr';
import { parseCsv, toCsv, downloadCsv } from '../lib/toolkit/csv';
import { savePdfJob, saveQrCode, saveOcrJob, saveCsvImport, loadHistory, type ToolkitHistory } from '../lib/toolkit/persist';

type Tab = 'pdf' | 'qr' | 'ocr' | 'csv';

const TABS: Array<{ id: Tab; label: string; icon: typeof FileText }> = [
  { id: 'pdf', label: 'PDF Builder', icon: FileText },
  { id: 'qr', label: 'QR Codes', icon: QrCode },
  { id: 'ocr', label: 'OCR', icon: ScanText },
  { id: 'csv', label: 'CSV Tools', icon: TableIcon },
];

export default function Toolkit() {
  const [tab, setTab] = useState<Tab>('pdf');
  const [history, setHistory] = useState<ToolkitHistory>({ pdfs: [], qrs: [], ocrs: [], csvs: [] });

  const refresh = async () => setHistory(await loadHistory());
  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Toolkit</h1>
          <p className="mt-2 text-slate-600">Generate PDFs, QR codes, run OCR, and manage CSVs. All results are stored securely to your account.</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                tab === id
                  ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {tab === 'pdf' && <PdfPanel onSaved={refresh} />}
            {tab === 'qr' && <QrPanel onSaved={refresh} />}
            {tab === 'ocr' && <OcrPanel onSaved={refresh} />}
            {tab === 'csv' && <CsvPanel onSaved={refresh} />}
          </div>
          <aside className="lg:col-span-1">
            <HistoryPanel tab={tab} history={history} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Card({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Status({ kind, children }: { kind: 'idle' | 'loading' | 'success' | 'error'; children: React.ReactNode }) {
  const styles = {
    idle: 'text-slate-500',
    loading: 'text-teal-700',
    success: 'text-emerald-700',
    error: 'text-rose-700',
  }[kind];
  const Icon = kind === 'loading' ? Loader2 : kind === 'success' ? CheckCircle2 : kind === 'error' ? AlertCircle : null;
  return (
    <div className={`flex items-center gap-2 text-sm ${styles}`}>
      {Icon && <Icon className={`w-4 h-4 ${kind === 'loading' ? 'animate-spin' : ''}`} />}
      <span>{children}</span>
    </div>
  );
}

function PdfPanel({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState('Matter Summary');
  const [template, setTemplate] = useState<PdfTemplate>('contract-summary');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const applyTemplate = (t: PdfTemplate) => {
    setTemplate(t);
    const d = templateDefaults(t);
    setTitle(d.title);
    setBody(d.sections.map((s) => `${s.heading ? `# ${s.heading}\n` : ''}${s.body}`).join('\n\n'));
  };

  const generate = async () => {
    setStatus('loading');
    try {
      const sections = body.split(/\n\n+/).map((chunk) => {
        const match = chunk.match(/^#\s+(.+)\n([\s\S]*)$/);
        return match ? { heading: match[1], body: match[2] } : { body: chunk };
      });
      const { blob } = buildPdf({ title, template, sections, footer: 'ezLegal.ai - Legal information, not legal advice.' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      await savePdfJob({ title, template, meta: { sections: sections.length } });
      setStatus('success');
      onSaved();
    } catch {
      setStatus('error');
    }
  };

  return (
    <Card title="PDF Builder" subtitle="Generate professional PDFs from built-in templates.">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
          <div className="grid grid-cols-2 gap-2">
            {(['contract-summary', 'intake-packet', 'risk-report', 'blank'] as PdfTemplate[]).map((t) => (
              <button
                key={t}
                onClick={() => applyTemplate(t)}
                className={`text-left px-3 py-2 rounded-lg border text-sm capitalize ${
                  template === t ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
          <p className="text-xs text-slate-500 mb-1">Use "# Heading" on its own line to add sections. Separate sections with a blank line.</p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <Status kind={status}>
            {status === 'idle' && 'Ready to generate.'}
            {status === 'loading' && 'Generating PDF...'}
            {status === 'success' && 'PDF downloaded and saved to history.'}
            {status === 'error' && 'Something went wrong. Try again.'}
          </Status>
          <button
            onClick={generate}
            disabled={status === 'loading'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            Generate PDF
          </button>
        </div>
      </div>
    </Card>
  );
}

function QrPanel({ onSaved }: { onSaved: () => void }) {
  const [label, setLabel] = useState('Intake link');
  const [payload, setPayload] = useState('https://ezlegal.ai');
  const [size, setSize] = useState(256);
  const [ecc, setEcc] = useState<QrEcc>('M');
  const [dataUrl, setDataUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const generate = async () => {
    setStatus('loading');
    try {
      const url = await generateQrDataUrl(payload, { size, ecc });
      setDataUrl(url);
      await saveQrCode({ label, payload, size, ecc, data_url: url });
      setStatus('success');
      onSaved();
    } catch {
      setStatus('error');
    }
  };

  const download = () => {
    if (!dataUrl) return;
    const blob = dataUrlToBlob(dataUrl);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label.replace(/\s+/g, '-').toLowerCase() || 'qr'}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="QR Codes" subtitle="Create shareable QR codes with error-correction control.">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payload (URL or text)</label>
            <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Size (px)</label>
              <input
                type="number"
                min={128}
                max={1024}
                value={size}
                onChange={(e) => setSize(Number(e.target.value) || 256)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Error correction</label>
              <select value={ecc} onChange={(e) => setEcc(e.target.value as QrEcc)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Status kind={status}>
              {status === 'idle' && 'Enter a payload and generate.'}
              {status === 'loading' && 'Generating QR...'}
              {status === 'success' && 'QR saved to history.'}
              {status === 'error' && 'Failed to generate QR.'}
            </Status>
            <button onClick={generate} disabled={status === 'loading'} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-60">
              Generate
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 min-h-[280px]">
          {dataUrl ? (
            <>
              <img src={dataUrl} alt={label} className="rounded-lg shadow-sm bg-white" style={{ width: Math.min(size, 220), height: Math.min(size, 220) }} />
              <button onClick={download} className="mt-4 inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 font-medium">
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </>
          ) : (
            <div className="text-center text-slate-500 text-sm">
              <QrCode className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              Preview appears here.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function OcrPanel({ onSaved }: { onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>('eng');
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const run = async () => {
    if (!file) return;
    setStatus('loading');
    setProgress(0);
    try {
      const result = await runOcr(file, language, setProgress);
      setText(result.text);
      setConfidence(result.confidence);
      await saveOcrJob({ file_name: file.name, language, text: result.text, confidence: result.confidence });
      setStatus('success');
      onSaved();
    } catch {
      setStatus('error');
    }
  };

  return (
    <Card title="OCR" subtitle="Extract text from images. Processed locally in your browser.">
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image file</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white hover:file:bg-teal-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value as OcrLanguage)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="eng+spa">English + Spanish</option>
            </select>
          </div>
        </div>

        {status === 'loading' && (
          <div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">Recognizing text... {progress}%</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Status kind={status}>
            {status === 'idle' && (file ? 'Ready to run OCR.' : 'Choose an image file.')}
            {status === 'loading' && 'Running OCR in your browser...'}
            {status === 'success' && `Done. Confidence ${confidence ?? 0}%.`}
            {status === 'error' && 'OCR failed.'}
          </Status>
          <button onClick={run} disabled={!file || status === 'loading'} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-60">
            Run OCR
          </button>
        </div>

        {text && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Extracted text</label>
            <textarea readOnly value={text} rows={10} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm bg-slate-50" />
          </div>
        )}
      </div>
    </Card>
  );
}

function CsvPanel({ onSaved }: { onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [errors, setErrors] = useState<Array<{ line: number; message: string }>>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleFile = async () => {
    if (!file) return;
    setStatus('loading');
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setErrors(parsed.errors);
      await saveCsvImport({
        file_name: file.name,
        row_count: parsed.rows.length,
        error_count: parsed.errors.length,
        sample: parsed.rows.slice(0, 5),
      });
      setStatus('success');
      onSaved();
    } catch {
      setStatus('error');
    }
  };

  const exportClean = () => {
    if (headers.length === 0) return;
    downloadCsv('cleaned.csv', toCsv(headers, rows));
  };

  return (
    <Card title="CSV Tools" subtitle="Parse, validate, and export CSV files with schema feedback.">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">CSV file</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white hover:file:bg-teal-700"
          />
        </div>
        <div className="flex items-center justify-between">
          <Status kind={status}>
            {status === 'idle' && (file ? 'Ready to parse.' : 'Choose a CSV file.')}
            {status === 'loading' && 'Parsing CSV...'}
            {status === 'success' && `Parsed ${rows.length} rows. ${errors.length} issues.`}
            {status === 'error' && 'Failed to parse CSV.'}
          </Status>
          <div className="flex gap-2">
            <button onClick={handleFile} disabled={!file || status === 'loading'} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:opacity-60">
              Parse
            </button>
            <button onClick={exportClean} disabled={rows.length === 0} className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg disabled:opacity-60">
              Export
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <div className="font-medium mb-1">Warnings</div>
            <ul className="list-disc ml-5 space-y-0.5">
              {errors.slice(0, 5).map((e, i) => (
                <li key={i}>Line {e.line}: {e.message}</li>
              ))}
              {errors.length > 5 && <li>...and {errors.length - 5} more.</li>}
            </ul>
          </div>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-slate-50">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2 border-b border-slate-100 text-slate-700">{r[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && <div className="px-3 py-2 text-xs text-slate-500 bg-slate-50">Showing 10 of {rows.length} rows.</div>}
          </div>
        )}
      </div>
    </Card>
  );
}

function HistoryPanel({ tab, history }: { tab: Tab; history: ToolkitHistory }) {
  const items =
    tab === 'pdf'
      ? history.pdfs.map((p) => ({ id: p.id, title: p.title, sub: p.template, date: p.created_at }))
      : tab === 'qr'
      ? history.qrs.map((q) => ({ id: q.id, title: q.label || 'QR', sub: q.payload, date: q.created_at }))
      : tab === 'ocr'
      ? history.ocrs.map((o) => ({ id: o.id, title: o.file_name, sub: `${o.language} - ${o.confidence}%`, date: o.created_at }))
      : history.csvs.map((c) => ({ id: c.id, title: c.file_name, sub: `${c.row_count} rows, ${c.error_count} issues`, date: c.created_at }));

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent activity</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No items yet. Generate something to see it here.</p>
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 8).map((it) => (
            <li key={it.id} className="border-b border-slate-100 pb-3 last:border-none last:pb-0">
              <div className="text-sm font-medium text-slate-900 truncate">{it.title}</div>
              <div className="text-xs text-slate-500 truncate">{it.sub}</div>
              <div className="text-xs text-slate-400 mt-1">{new Date(it.date).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-slate-500">Saved securely via Supabase (row-level security).</p>
    </section>
  );
}
