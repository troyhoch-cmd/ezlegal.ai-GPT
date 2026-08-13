export interface ParsedActionStep {
  step: number;
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  deadline?: string;
}

export interface ParsedSource {
  title: string;
  url?: string;
  citation?: string;
  confidence?: number;
}

export interface ParsedChatResponse {
  summary: string;
  actionSteps: ParsedActionStep[];
  sources: ParsedSource[];
}

const ACTION_HEADING = /^(?:#{1,6}\s*)?(?:\*\*|__)?(?:immediate\s+)?(?:action\s+(?:steps|checklist)|next\s+steps|what\s+(?:you\s+)?can\s+do|what\s+to\s+do|step-by-step\s+guidance|verification\s+checklist|pasos\s+a\s+seguir|pr[oó]ximos\s+pasos|qu[eé]\s+puede\s+hacer)(?:\*\*|__)?\s*:?[\s]*$/i;
const SOURCE_HEADING = /^(?:#{1,6}\s*)?(?:\*\*|__)?(?:sources?|citations?|references?|legal\s+authorities|fuentes?|referencias?)(?:\*\*|__)?\s*:?[\s]*$/i;
const ANY_HEADING = /^(?:#{1,6}\s+.+|(?:\*\*|__).+(?:\*\*|__)\s*:?)$/;
const LIST_ITEM = /^\s*(?:\d+[.)]|[-*•])\s+(.+)$/;
const MARKDOWN_LINK = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g;

function cleanMarkdown(value: string): string {
  return value.replace(/^\s*(?:\*\*|__)/, '').replace(/(?:\*\*|__)\s*$/, '').trim();
}

function sourceKey(source: ParsedSource): string {
  return (source.url || source.title).trim().toLowerCase();
}

/** Converts the model's human-readable response into the three consumer tabs. */
export function parseChatResponse(content: string): ParsedChatResponse {
  const summaryLines: string[] = [];
  const actionSteps: ParsedActionStep[] = [];
  const sources: ParsedSource[] = [];
  const seenSources = new Set<string>();
  let section: 'summary' | 'actions' | 'sources' | 'other' = 'summary';

  const addSource = (source: ParsedSource) => {
    const key = sourceKey(source);
    if (!key || seenSources.has(key)) return;
    seenSources.add(key);
    sources.push(source);
  };

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line === '---') continue;

    if (ACTION_HEADING.test(line)) {
      section = 'actions';
      continue;
    }
    if (SOURCE_HEADING.test(line)) {
      section = 'sources';
      continue;
    }
    if (ANY_HEADING.test(line)) {
      section = section === 'summary' ? 'summary' : 'other';
      continue;
    }

    // A source is useful regardless of where the model placed its link.
    for (const match of line.matchAll(MARKDOWN_LINK)) {
      addSource({ title: cleanMarkdown(match[1]), url: match[2], citation: line });
    }

    const listMatch = line.match(LIST_ITEM);
    if (section === 'actions' && listMatch) {
      const text = cleanMarkdown(listMatch[1]);
      const colon = text.indexOf(':');
      const title = colon > 0 ? cleanMarkdown(text.slice(0, colon)) : text;
      const description = colon > 0 ? cleanMarkdown(text.slice(colon + 1)) : text;
      const step = actionSteps.length + 1;
      actionSteps.push({
        step,
        title,
        description,
        priority: step <= 2 ? 'high' : step <= 4 ? 'medium' : 'low',
      });
    } else if (section === 'sources' && listMatch && !line.match(MARKDOWN_LINK)) {
      const citation = cleanMarkdown(listMatch[1]);
      addSource({ title: citation.split(/\s+[—-]\s+/)[0], citation });
    } else if (section === 'summary' && summaryLines.length < 4) {
      summaryLines.push(cleanMarkdown(line));
    }
  }

  const fallbackSummary = content.replace(/---[\s\S]*?---/g, '').trim().slice(0, 500);
  return {
    summary: summaryLines.join(' ').slice(0, 500) || fallbackSummary,
    actionSteps: actionSteps.slice(0, 8),
    sources: sources.slice(0, 12),
  };
}
