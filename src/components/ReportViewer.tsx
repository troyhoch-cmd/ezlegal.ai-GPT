import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Section = {
  id: string;
  title: string;
  level: number;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractSections(markdown: string): Section[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const sections: Section[] = [];
  const usedIds = new Map<string, number>();

  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();

    const baseId = slugify(title);
    const count = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, count + 1);

    const id = count === 0 ? baseId : `${baseId}-${count + 1}`;

    sections.push({ id, title, level });
  }

  return sections;
}

type ReportViewerProps = {
  markdown: string;
  title?: string;
};

export default function ReportViewer({
  markdown,
  title = 'AI Legaltech Analysis',
}: ReportViewerProps) {
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = useMemo(() => extractSections(markdown), [markdown]);

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ai-legaltech-analysis.md';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Strategic Analysis
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300 lg:hidden"
            >
              Contents
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              {copied ? 'Copied' : 'Copy full report'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Download .md
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto`}
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Contents
            </h2>

            <nav className="space-y-1">
              {sections.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Add Markdown headings to generate navigation.
                </p>
              ) : (
                sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={[
                      'block rounded-lg px-3 py-2 text-sm transition hover:bg-slate-800 hover:text-cyan-300',
                      section.level === 1
                        ? 'font-semibold text-slate-100'
                        : section.level === 2
                          ? 'pl-6 text-slate-300'
                          : 'pl-9 text-slate-400',
                    ].join(' ')}
                  >
                    {section.title}
                  </a>
                ))
              )}
            </nav>
          </div>
        </aside>

        <article className="rounded-3xl border border-slate-800 bg-white px-5 py-6 text-slate-950 shadow-2xl shadow-slate-950/50 sm:px-8 lg:px-12">
          <div className="prose prose-slate max-w-none prose-headings:scroll-mt-28 prose-headings:font-bold prose-h1:text-4xl prose-h2:mt-12 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-3 prose-h3:mt-8 prose-p:leading-7 prose-li:leading-7 prose-a:text-cyan-700 prose-strong:text-slate-950">
            <ReactMarkdown
              components={{
                h1: ({ children, ...props }) => {
                  const text = extractText(children);
                  const id = slugify(text);
                  return (
                    <h1 id={id} className="text-4xl font-bold tracking-tight text-slate-950" {...props}>
                      {children}
                    </h1>
                  );
                },
                h2: ({ children, ...props }) => {
                  const text = extractText(children);
                  const id = slugify(text);
                  return (
                    <h2 id={id} className="mt-12 border-b border-slate-200 pb-3 text-2xl font-bold tracking-tight text-slate-950" {...props}>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children, ...props }) => {
                  const text = extractText(children);
                  const id = slugify(text);
                  return (
                    <h3 id={id} className="mt-8 text-xl font-bold text-slate-900" {...props}>
                      {children}
                    </h3>
                  );
                },
                table: ({ children }) => (
                  <div className="my-6 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border-t border-slate-200 px-4 py-3 align-top text-sm text-slate-700">
                    {children}
                  </td>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="rounded-xl border-l-4 border-cyan-400 bg-cyan-50 px-5 py-3 text-slate-800">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-900">
                    {children}
                  </code>
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}

function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return extractText((children as { props: { children?: React.ReactNode } }).props.children ?? '');
  }
  return String(children ?? '');
}
