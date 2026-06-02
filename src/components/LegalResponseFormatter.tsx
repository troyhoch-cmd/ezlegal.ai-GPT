import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, ListChecks, Scale, FileText, Shield } from 'lucide-react';
import { useState } from 'react';

interface LegalResponseFormatterProps {
  content: string;
  className?: string;
}

interface Section {
  type: 'header' | 'paragraph' | 'list' | 'disclaimer';
  title?: string;
  content: string;
  items?: string[];
  level?: number;
}

function parsePartHeader(line: string): { partNumber: string; title: string } | null {
  const match = line.match(/^\*?\*?PART\s+(\d+)[:\s]*(.+?)\*?\*?$/i);
  if (match) {
    return { partNumber: match[1], title: match[2].replace(/\*+/g, '').trim() };
  }
  return null;
}

function parseSectionHeader(line: string): string | null {
  const headerPatterns = [
    /^\*\*([^*]+)\*\*$/,
    /^#+\s*(.+)$/,
    /^([A-Z][A-Z\s&]+):?\s*$/,
  ];

  for (const pattern of headerPatterns) {
    const match = line.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function parseContent(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];
  let inList = false;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        sections.push({ type: 'paragraph', content: text });
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      sections.push({ type: 'list', content: '', items: [...currentList] });
      currentList = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      if (inList) {
        flushList();
      }
      flushParagraph();
      continue;
    }

    const partHeader = parsePartHeader(trimmedLine);
    if (partHeader) {
      flushList();
      flushParagraph();
      sections.push({
        type: 'header',
        title: `PART ${partHeader.partNumber}: ${partHeader.title}`,
        content: '',
        level: 1,
      });
      continue;
    }

    if (trimmedLine.toLowerCase().includes('legal disclaimer') ||
        trimmedLine.toLowerCase().includes('disclaimer:') ||
        trimmedLine.toLowerCase() === 'disclaimer') {
      flushList();
      flushParagraph();
      const disclaimerContent: string[] = [];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (!nextLine && disclaimerContent.length > 0) {
          const peekNext = lines[i + 1]?.trim() || '';
          if (parsePartHeader(peekNext) || parseSectionHeader(peekNext)) {
            break;
          }
        }
        if (nextLine) {
          disclaimerContent.push(nextLine);
        }
        i++;
      }
      i--;
      sections.push({
        type: 'disclaimer',
        content: disclaimerContent.join(' ').replace(/^\*+|\*+$/g, ''),
      });
      continue;
    }

    const sectionHeader = parseSectionHeader(trimmedLine);
    if (sectionHeader && trimmedLine.length < 80) {
      flushList();
      flushParagraph();
      sections.push({
        type: 'header',
        title: sectionHeader,
        content: '',
        level: 2,
      });
      continue;
    }

    const listMatch = trimmedLine.match(/^[-*•]\s+(.+)$/) || trimmedLine.match(/^\d+[.)]\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        flushParagraph();
        inList = true;
      }
      currentList.push(listMatch[1]);
      continue;
    }

    if (inList) {
      flushList();
    }

    const formattedLine = trimmedLine
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

    currentParagraph.push(formattedLine);
  }

  flushList();
  flushParagraph();

  return sections;
}

function getSectionIcon(title: string) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('analysis') || lowerTitle.includes('summary')) {
    return Scale;
  }
  if (lowerTitle.includes('checklist') || lowerTitle.includes('what you can do')) {
    return ListChecks;
  }
  if (lowerTitle.includes('legal') || lowerTitle.includes('guidance')) {
    return FileText;
  }
  if (lowerTitle.includes('risk') || lowerTitle.includes('warning')) {
    return AlertTriangle;
  }
  if (lowerTitle.includes('conclusion') || lowerTitle.includes('next')) {
    return CheckCircle;
  }
  return Shield;
}

function getSectionColor(index: number, title: string) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('risk') || lowerTitle.includes('warning')) {
    return 'from-amber-500 to-orange-500';
  }
  if (lowerTitle.includes('checklist') || lowerTitle.includes('what you can do')) {
    return 'from-emerald-500 to-teal-500';
  }
  if (lowerTitle.includes('conclusion') || lowerTitle.includes('next')) {
    return 'from-green-500 to-emerald-500';
  }
  const colors = [
    'from-[#0067FF] to-[#0052CC]',
    'from-teal-500 to-cyan-500',
    'from-slate-600 to-slate-700',
    'from-sky-500 to-blue-500',
  ];
  return colors[index % colors.length];
}

export default function LegalResponseFormatter({ content, className = '' }: LegalResponseFormatterProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const sections = parseContent(content);

  const toggleSection = (index: number) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (sections.length <= 2) {
    return (
      <div className={`text-[15px] text-slate-700 leading-relaxed whitespace-pre-line ${className}`}>
        {content}
      </div>
    );
  }

  let sectionIndex = 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {sections.map((section, index) => {
        if (section.type === 'header' && section.level === 1) {
          const currentSectionIndex = sectionIndex++;
          const Icon = getSectionIcon(section.title || '');
          const colorClass = getSectionColor(currentSectionIndex, section.title || '');
          const isCollapsed = collapsedSections.has(currentSectionIndex);

          const contentSections: Section[] = [];
          let j = index + 1;
          while (j < sections.length && !(sections[j].type === 'header' && sections[j].level === 1)) {
            contentSections.push(sections[j]);
            j++;
          }

          return (
            <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection(currentSectionIndex)}
                className={`w-full px-4 py-3 flex items-center gap-3 bg-gradient-to-r ${colorClass} text-white text-left`}
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm flex-1">{section.title}</span>
                {isCollapsed ? (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" />
                )}
              </button>
              {!isCollapsed && (
                <div className="p-4 space-y-3">
                  {contentSections.map((subSection, subIndex) => (
                    <div key={subIndex}>
                      {subSection.type === 'header' && subSection.level === 2 && (
                        <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#0067FF] rounded-full" />
                          {subSection.title}
                        </h4>
                      )}
                      {subSection.type === 'paragraph' && (
                        <p
                          className="text-sm text-slate-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: subSection.content }}
                        />
                      )}
                      {subSection.type === 'list' && subSection.items && (
                        <ul className="space-y-2 ml-1">
                          {subSection.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2 text-sm text-slate-700">
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span dangerouslySetInnerHTML={{ __html: item }} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (section.type === 'disclaimer') {
          return (
            <div key={index} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm mb-1">Legal Disclaimer</p>
                  <p className="text-sm text-amber-700 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          );
        }

        if (index > 0 && sections[index - 1].type === 'header') {
          return null;
        }

        if (section.type === 'paragraph') {
          return (
            <p
              key={index}
              className="text-sm text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          );
        }

        if (section.type === 'list' && section.items) {
          return (
            <ul key={index} className="space-y-2 ml-1">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 bg-[#0067FF] rounded-full flex-shrink-0 mt-2" />
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
}
