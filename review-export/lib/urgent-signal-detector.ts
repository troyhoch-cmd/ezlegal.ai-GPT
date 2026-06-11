export type UrgentCategory =
  | 'eviction'
  | 'court_deadline'
  | 'domestic_violence'
  | 'wage_garnishment'
  | 'restraining_order'
  | 'immigration'
  | 'criminal'
  | 'custody_emergency';

export interface UrgentSignal {
  category: UrgentCategory;
  matchedPhrase: string;
  severity: 'high' | 'critical';
}

const PATTERNS: Array<{ category: UrgentCategory; severity: 'high' | 'critical'; re: RegExp }> = [
  { category: 'domestic_violence', severity: 'critical', re: /\b(domestic violence|being abused|my (husband|wife|partner|boyfriend|girlfriend) hit|afraid for my (safety|life)|he hit me|she hit me)\b/i },
  { category: 'restraining_order', severity: 'critical', re: /\b(restraining order|order of protection|protective order|stalking)\b/i },
  { category: 'custody_emergency', severity: 'critical', re: /\b(took my (kid|child|children)|emergency custody|child is in danger)\b/i },
  { category: 'criminal', severity: 'high', re: /\b(arrested|arraignment|criminal charge|jail|bail|miranda)\b/i },
  { category: 'eviction', severity: 'high', re: /\b(eviction notice|being evicted|lockout|sheriff.*evict|writ of restitution|notice to (quit|vacate)|5[- ]day notice|30[- ]day notice)\b/i },
  { category: 'wage_garnishment', severity: 'high', re: /\b(wage garnishment|garnish(ed|ing)? (my )?(wages|pay(check)?)|bank (account )?levy|frozen (bank )?account)\b/i },
  { category: 'court_deadline', severity: 'high', re: /\b(court date|summons|subpoena|served (with )?papers|response is due|answer is due|hearing (tomorrow|today|this week))\b/i },
  { category: 'immigration', severity: 'high', re: /\b(ice (is )?at (my|the) door|deportation|removal proceeding|notice to appear|asylum deadline)\b/i },
];

export function detectUrgentSignals(text: string): UrgentSignal[] {
  if (!text || text.length < 3) return [];
  const hits: UrgentSignal[] = [];
  for (const { category, severity, re } of PATTERNS) {
    const match = text.match(re);
    if (match) hits.push({ category, matchedPhrase: match[0], severity });
  }
  return hits;
}

export function getHighestSeverity(signals: UrgentSignal[]): 'high' | 'critical' | null {
  if (signals.length === 0) return null;
  return signals.some((s) => s.severity === 'critical') ? 'critical' : 'high';
}

export const CATEGORY_COPY: Record<UrgentCategory, { title: string; help: string }> = {
  eviction: {
    title: 'Eviction notices have tight deadlines',
    help: 'Eviction response deadlines can be as short as 5 days. Contact a legal aid office or tenants-rights hotline today.',
  },
  court_deadline: {
    title: 'Court papers have strict deadlines',
    help: 'Missing a response deadline can mean a default judgment against you. File a response or contact legal aid immediately.',
  },
  domestic_violence: {
    title: 'Your safety comes first',
    help: 'If you are in immediate danger, call 911. The National DV Hotline is 1-800-799-7233 (24/7, free, confidential).',
  },
  wage_garnishment: {
    title: 'Garnishments can often be reduced or stopped',
    help: 'Some garnishments can be challenged or exempted. Contact a consumer-rights legal aid office today.',
  },
  restraining_order: {
    title: 'Protective orders move quickly',
    help: 'Courts can often issue same-day emergency orders. Contact your local court self-help center or legal aid now.',
  },
  immigration: {
    title: 'Immigration deadlines are unforgiving',
    help: 'Missing an immigration deadline can cause permanent consequences. Contact an accredited immigration legal aid org today.',
  },
  criminal: {
    title: 'Criminal matters require a lawyer',
    help: 'Do not answer police questions without a lawyer. If you cannot afford one, ask the court for a public defender.',
  },
  custody_emergency: {
    title: 'Emergency custody matters move fast',
    help: 'Courts have emergency custody procedures. Contact a family-law legal aid office or court self-help center today.',
  },
};
