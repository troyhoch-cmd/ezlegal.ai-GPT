import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FileText,
  Copy,
  Download,
  CheckCircle,
  FileDown,
  ArrowLeft,
  Printer,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Hash,
  BookOpen,
  Clock,
  ArrowUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteReviewText } from '../lib/site-review-content';
import jsPDF from 'jspdf';

interface TocEntry {
  number: number;
  title: string;
  lineIndex: number;
}

function parseToc(text: string): TocEntry[] {
  const lines = text.split('\n');
  const entries: TocEntry[] = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(\d+)\.\s+(.+)$/);
    if (match && lines[i - 1]?.startsWith('====')) {
      entries.push({ number: parseInt(match[1]), title: match[2].trim(), lineIndex: i });
    }
  }
  return entries;
}

function countStats(text: string) {
  const lines = text.split('\n');
  const words = text.split(/\s+/).filter(Boolean).length;
  const sections = lines.filter((l, i) => l.match(/^\d+\./) && lines[i - 1]?.startsWith('====')).length;
  const resolved = (text.match(/\[RESOLVED\]/g) || []).length;
  return { lines: lines.length, words, sections, resolved };
}

export default function SiteReview() {
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const reviewText = getSiteReviewText();
  const toc = parseToc(reviewText);
  const stats = countStats(reviewText);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reviewText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = reviewText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [reviewText]);

  const handleDownloadText = useCallback(() => {
    const blob = new Blob([reviewText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ezlegal-platform-review-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reviewText]);

  const handleDownloadMarkdown = useCallback(() => {
    const lines = reviewText.split('\n');
    let md = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('=====') && lines[i + 1]) {
        const title = lines[i + 1].trim();
        if (title) md += `\n# ${title}\n\n`;
        i++;
        continue;
      }
      if (line.startsWith('-----')) continue;
      const subMatch = line.match(/^([A-Z][A-Z &/(),\-:.'0-9]+):(.*)$/);
      if (subMatch && line.length < 80) {
        md += `\n## ${subMatch[1]}\n${subMatch[2].trim() ? subMatch[2].trim() + '\n' : ''}\n`;
        continue;
      }
      if (line.startsWith('  - ')) {
        md += `- ${line.trim().replace(/^- /, '')}\n`;
        continue;
      }
      md += line + '\n';
    }
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ezlegal-platform-review-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reviewText]);

  const handleDownloadPdf = useCallback(async () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const m = 15;
      const mw = pw - m * 2;
      const lh = 4.2;
      const hh = 25;
      let y = hh;
      let pn = 1;

      const header = (n: number) => {
        doc.setFillColor(16, 42, 67);
        doc.rect(0, 0, pw, 18, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('ezLegal.ai - Complete Platform Review Package (Round 6.4.3)', m, 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(159, 179, 200);
        doc.text(`February 2026 | Prepared for External AI Review | Round 6.4.3 Update`, m, 13);
        doc.text(`Page ${n}`, pw - m - 10, 13);
      };

      const footer = () => {
        doc.setFontSize(6);
        doc.setTextColor(130, 154, 177);
        doc.text('ezLegal.ai | Legalbreeze® | 177 N. Church Ave. Suite 808, Tucson, AZ 85701', m, ph - 5);
      };

      header(pn);
      const lines = reviewText.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('=====')) continue;

        const isTitle = i > 0 && lines[i - 1]?.startsWith('=====') && line.trim() !== '';
        const isSub = /^[A-Z][A-Z &/(),\-:.'0-9]+:/.test(line) && line.length < 60;

        let fs = 8;
        let fw: 'normal' | 'bold' = 'normal';
        let tc: [number, number, number] = [51, 78, 104];
        let eb = 0;

        if (isTitle) { fs = 11; fw = 'bold'; tc = [16, 42, 67]; eb = 4; }
        else if (isSub) { fs = 9; fw = 'bold'; tc = [13, 148, 136]; eb = 3; }
        else if (line.startsWith('  ')) { fs = 7.5; tc = [72, 101, 129]; }
        else if (line.trim() === '') { y += lh * 0.6; continue; }

        doc.setFont('helvetica', fw);
        doc.setFontSize(fs);
        doc.setTextColor(...tc);

        const wl = doc.splitTextToSize(line, mw);
        const bh = wl.length * lh + eb;

        if (y + bh > ph - 12) {
          footer();
          doc.addPage();
          pn++;
          header(pn);
          y = hh;
        }

        y += eb;
        for (const l of wl) { doc.text(l, m, y); y += lh; }
      }

      footer();
      doc.save(`ezlegal-platform-review-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGeneratingPdf(false);
    }
  }, [reviewText]);

  const scrollToSection = (entry: TocEntry) => {
    if (!preRef.current) return;
    const lines = reviewText.split('\n');
    const pre = preRef.current;
    const textBefore = lines.slice(0, entry.lineIndex).join('\n');
    const charsBefore = textBefore.length;
    const totalChars = reviewText.length;
    const scrollRatio = charsBefore / totalChars;
    pre.scrollTop = pre.scrollHeight * scrollRatio;
    setTocOpen(false);
  };

  const highlightedText = searchQuery.length >= 2
    ? reviewText.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    : null;

  const matchCount = highlightedText
    ? highlightedText.filter((_, i) => i % 2 === 1).length
    : 0;

  return (
    <div className="min-h-screen bg-navy-50 print:bg-white">
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-navy-300 hover:text-white mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>

          <div className="flex items-start gap-4 mb-8">
            <div className="bg-teal-500/15 p-3.5 rounded-xl border border-teal-500/20">
              <FileText className="w-8 h-8 text-teal-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Platform Review Package
              </h1>
              <p className="text-navy-300 mt-2 max-w-2xl leading-relaxed">
                Complete documentation of the ezLegal.ai platform for external AI review (Round 6.4.3).
                Includes registry-backed trust claims, banned-phrase enforcement, Definition of Done
                checklist, diff-based review protocol, and 6 resolved trust claim violations.
                Copy or download as PDF / TXT / Markdown for GPT-5.2.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy All Text'}
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="inline-flex items-center gap-2 bg-white text-navy-900 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:-translate-y-0.5 hover:bg-navy-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy-900" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  Download PDF
                </>
              )}
            </button>

            <button
              onClick={handleDownloadText}
              className="inline-flex items-center gap-2 bg-navy-700 hover:bg-navy-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Download .txt
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-2 bg-navy-700 hover:bg-navy-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
            >
              <FileText className="w-5 h-5" />
              Download .md
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-navy-700 hover:bg-navy-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <div className="text-xl font-bold text-teal-400">{stats.sections}</div>
              <div className="text-xs text-navy-400 mt-0.5">Sections</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <div className="text-xl font-bold text-teal-400">{(stats.words / 1000).toFixed(1)}k</div>
              <div className="text-xs text-navy-400 mt-0.5">Words</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <div className="text-xl font-bold text-teal-400">{stats.resolved}</div>
              <div className="text-xs text-navy-400 mt-0.5">Items Resolved</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
              <div className="text-xl font-bold text-teal-400">
                <Clock className="w-5 h-5 inline-block mb-0.5" />
              </div>
              <div className="text-xs text-navy-400 mt-0.5">Feb 2026</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 print:px-0 print:py-0">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-72 flex-shrink-0 print:hidden">
            <div className="lg:sticky lg:top-4 space-y-4">
              <div className="bg-white border border-navy-200 rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-navy-900 hover:bg-navy-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-600" />
                    Table of Contents
                  </span>
                  {tocOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {tocOpen && (
                  <div className="border-t border-navy-100 max-h-[60vh] overflow-y-auto">
                    {toc.map((entry) => (
                      <button
                        key={entry.number}
                        onClick={() => scrollToSection(entry)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 transition-colors flex items-start gap-2 group"
                      >
                        <span className="text-teal-500 font-mono text-xs mt-0.5 flex-shrink-0 w-5 text-right">
                          {entry.number}.
                        </span>
                        <span className="text-navy-700 group-hover:text-teal-700 leading-tight">
                          {entry.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-teal-800 mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Quick Use
                </h3>
                <ol className="text-xs text-teal-700 space-y-2 list-decimal list-inside">
                  <li>Click <strong>"Copy All Text"</strong></li>
                  <li>Open GPT-5.2 (or any LLM)</li>
                  <li>Paste and ask your review question</li>
                </ol>
                <p className="text-[11px] text-teal-600 mt-3 border-t border-teal-200 pt-2">
                  Or download as PDF / TXT / Markdown and upload.
                </p>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white border border-navy-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0">
              <div className="bg-navy-100 px-4 py-3 flex items-center justify-between border-b border-navy-200 print:hidden">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-navy-700">
                    ezlegal-platform-review.txt
                  </span>
                  <span className="text-xs text-navy-400">{stats.lines.toLocaleString()} lines</span>
                </div>
                <div className="flex items-center gap-2">
                  {searchOpen ? (
                    <div className="flex items-center gap-1 bg-white border border-navy-200 rounded-lg px-2 py-1">
                      <Search className="w-3.5 h-3.5 text-navy-400" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="text-sm text-navy-800 outline-none w-40 bg-transparent"
                      />
                      {searchQuery && (
                        <span className="text-[10px] text-navy-400 whitespace-nowrap">
                          {matchCount} match{matchCount !== 1 ? 'es' : ''}
                        </span>
                      )}
                      <button
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        className="text-navy-400 hover:text-navy-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="text-navy-400 hover:text-navy-600 p-1"
                      title="Search"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <pre
                ref={preRef}
                className="p-6 text-[13px] text-navy-700 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[80vh] overflow-y-auto scroll-smooth selection:bg-teal-100"
              >
                {highlightedText
                  ? highlightedText.map((part, i) =>
                      i % 2 === 1 ? (
                        <mark key={i} className="bg-amber-200 text-navy-900 rounded px-0.5">{part}</mark>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )
                  : reviewText
                }
              </pre>
            </div>
          </main>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-navy-800 text-white p-3 rounded-full shadow-xl hover:bg-navy-700 transition-all hover:-translate-y-0.5 print:hidden z-40"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
