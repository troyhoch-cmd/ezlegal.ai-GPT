import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  Search, BookOpen, Clock, Tag, MapPin, Scale, FileText,
  Building2, Landmark, Loader2, ChevronDown, ChevronUp,
  ExternalLink, Sparkles, Filter, History, Bookmark
} from 'lucide-react';
import { JURISDICTION_GROUPS, getJurisdictionName } from '../data/jurisdictions';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface ResearchQuery {
  id: string;
  query: string;
  results: string;
  category: string | null;
  created_at: string;
  jurisdiction?: string | null;
  source_types?: string[] | null;
}

interface ResearchResult {
  type: 'case_law' | 'statute' | 'regulation' | 'precedent' | 'secondary';
  title: string;
  citation: string;
  jurisdiction: string;
  date?: string;
  summary: string;
  relevance: 'high' | 'medium' | 'low';
  keyPoints?: string[];
}

interface ParsedResults {
  summary: string;
  results: ResearchResult[];
  practicalGuidance: string;
  disclaimer: string;
}

const categories = [
  'Contract Law',
  'Criminal Law',
  'Family Law',
  'Corporate Law',
  'Intellectual Property',
  'Employment Law',
  'Real Estate Law',
  'Tax Law',
  'Immigration Law',
  'Personal Injury',
  'Bankruptcy',
  'Civil Rights',
  'Environmental Law',
  'Healthcare Law',
  'Securities Law',
];

const sourceTypes = [
  { id: 'case_law', label: 'Case Law', icon: Scale, description: 'Court decisions and judicial opinions' },
  { id: 'statutes', label: 'Statutes', icon: FileText, description: 'Federal and state legislation' },
  { id: 'regulations', label: 'Regulations', icon: Building2, description: 'Administrative rules and agency guidance' },
  { id: 'precedents', label: 'Legal Precedents', icon: Landmark, description: 'Binding and persuasive authority' },
];

export default function Research() {
  const [queries, setQueries] = useState<ResearchQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('FED');
  const [selectedSources, setSelectedSources] = useState<string[]>(['case_law', 'statutes', 'regulations', 'precedents']);
  const [searchResults, setSearchResults] = useState('');
  const [parsedResults, setParsedResults] = useState<ParsedResults | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('research_queries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setQueries(data);
    }
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const toggleResultExpanded = (index: number) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const parseAIResults = (rawResults: string): ParsedResults => {
    const sections = {
      summary: '',
      results: [] as ResearchResult[],
      practicalGuidance: '',
      disclaimer: ''
    };

    const summaryMatch = rawResults.match(/RESEARCH SUMMARY[:\s]*([\s\S]*?)(?=RELEVANT\s+(?:AUTHORITIES|CASE\s+LAW)|APPLICABLE\s+STATUTES|ADMINISTRATIVE\s+REGULATIONS|KEY\s+LEGAL\s+PRECEDENTS|CASE[:\s]|STATUTE[:\s]|REGULATION[:\s]|PRACTICAL\s+GUIDANCE|DISCLAIMER|$)/i);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    const caseMatches = rawResults.matchAll(/(?:CASE|DECISION):\s*([^\n]+)\n(?:CITATION:\s*([^\n]+)\n)?(?:COURT|JURISDICTION):\s*([^\n]+)\n(?:DATE:\s*([^\n]+)\n)?(?:SUMMARY|HOLDING):\s*([\s\S]*?)(?=(?:CASE|DECISION|STATUTE|REGULATION|PRACTICAL|DISCLAIMER|$))/gi);
    for (const match of caseMatches) {
      sections.results.push({
        type: 'case_law',
        title: match[1]?.trim() || '',
        citation: match[2]?.trim() || '',
        jurisdiction: match[3]?.trim() || '',
        date: match[4]?.trim(),
        summary: match[5]?.trim() || '',
        relevance: 'high'
      });
    }

    const statuteMatches = rawResults.matchAll(/STATUTE:\s*([^\n]+)\n(?:CITATION:\s*([^\n]+)\n)?(?:JURISDICTION:\s*([^\n]+)\n)?(?:SUMMARY|PROVISION):\s*([\s\S]*?)(?=(?:CASE|STATUTE|REGULATION|PRACTICAL|DISCLAIMER|$))/gi);
    for (const match of statuteMatches) {
      sections.results.push({
        type: 'statute',
        title: match[1]?.trim() || '',
        citation: match[2]?.trim() || '',
        jurisdiction: match[3]?.trim() || '',
        summary: match[4]?.trim() || '',
        relevance: 'high'
      });
    }

    const regulationMatches = rawResults.matchAll(/REGULATION:\s*([^\n]+)\n(?:CITATION:\s*([^\n]+)\n)?(?:AGENCY:\s*([^\n]+)\n)?(?:SUMMARY|PROVISION):\s*([\s\S]*?)(?=(?:CASE|STATUTE|REGULATION|PRACTICAL|DISCLAIMER|$))/gi);
    for (const match of regulationMatches) {
      sections.results.push({
        type: 'regulation',
        title: match[1]?.trim() || '',
        citation: match[2]?.trim() || '',
        jurisdiction: match[3]?.trim() || '',
        summary: match[4]?.trim() || '',
        relevance: 'medium'
      });
    }

    const guidanceMatch = rawResults.match(/PRACTICAL GUIDANCE[:\s]*([\s\S]*?)(?=DISCLAIMER|$)/i);
    if (guidanceMatch) {
      sections.practicalGuidance = guidanceMatch[1].trim();
    }

    const disclaimerMatch = rawResults.match(/DISCLAIMER[:\s]*([\s\S]*?)$/i);
    if (disclaimerMatch) {
      sections.disclaimer = disclaimerMatch[1].trim();
    }

    if (sections.results.length === 0 && !sections.summary) {
      sections.summary = rawResults;
    }

    return sections;
  };

  const performResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || selectedSources.length === 0) return;

    setLoading(true);
    setParsedResults(null);
    setSearchResults('');

    try {
      const jurisdictionName = getJurisdictionName(selectedJurisdiction) || selectedJurisdiction;
      const sourceLabels = selectedSources.map(s => sourceTypes.find(st => st.id === s)?.label || s).join(', ');

      const prompt = `You are a legal research assistant. Conduct comprehensive legal research on the following query.

RESEARCH QUERY: ${searchQuery}

JURISDICTION: ${jurisdictionName}
${selectedCategory ? `PRACTICE AREA: ${selectedCategory}` : ''}
SOURCES TO SEARCH: ${sourceLabels}

Please provide a thorough legal research response in the following structured format:

RESEARCH SUMMARY:
Provide a 2-3 paragraph overview of the legal landscape for this query, including the current state of the law and any recent developments.

${selectedSources.includes('case_law') ? `
RELEVANT CASE LAW:
For each relevant case, provide:
CASE: [Full case name]
CITATION: [Official citation]
COURT: [Court name and jurisdiction]
DATE: [Decision date]
SUMMARY: [2-3 sentence summary of holding and relevance]
` : ''}

${selectedSources.includes('statutes') ? `
APPLICABLE STATUTES:
For each relevant statute, provide:
STATUTE: [Statute name/title]
CITATION: [Citation, e.g., 42 U.S.C. § 1983]
JURISDICTION: [Federal/State]
SUMMARY: [Key provisions and how they apply]
` : ''}

${selectedSources.includes('regulations') ? `
ADMINISTRATIVE REGULATIONS:
For each relevant regulation, provide:
REGULATION: [Regulation name/title]
CITATION: [CFR or state regulatory citation]
AGENCY: [Issuing agency]
SUMMARY: [Key requirements and applicability]
` : ''}

${selectedSources.includes('precedents') ? `
KEY LEGAL PRECEDENTS:
Identify binding and persuasive precedents that would apply to this matter in ${jurisdictionName}.
` : ''}

PRACTICAL GUIDANCE:
Based on this research, provide practical guidance for someone dealing with this legal issue, including:
- Key considerations
- Potential legal strategies
- Important deadlines or limitations
- Recommended next steps

DISCLAIMER:
This research is for informational purposes only and does not constitute legal advice. Laws and regulations change frequently. Consult with a licensed attorney in your jurisdiction for advice specific to your situation.`;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setSearchResults(lang === 'en' ? 'Please sign in to perform research.' : 'Inicia sesion para investigar.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          sessionId: crypto.randomUUID(),
          jurisdiction: jurisdictionName,
          maxTokens: 4000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform research');
      }

      const data = await response.json();
      let results = data.response || '';

      const followUpStart = results.indexOf('---FOLLOW_UP_QUESTIONS---');
      if (followUpStart !== -1) {
        results = results.substring(0, followUpStart).trim();
      }

      setSearchResults(results);
      setParsedResults(parseAIResults(results));

      if (user) {
        const { data: insertedData, error } = await supabase
          .from('research_queries')
          .insert({
            user_id: user.id,
            query: searchQuery,
            results: results,
            category: selectedCategory || null,
          })
          .select()
          .single();

        if (!error && insertedData) {
          setQueries([insertedData, ...queries]);
        }
      }
    } catch (error) {
      console.error('Research error:', error);
      setSearchResults('An error occurred while performing the research. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (type: ResearchResult['type']) => {
    switch (type) {
      case 'case_law': return Scale;
      case 'statute': return FileText;
      case 'regulation': return Building2;
      case 'precedent': return Landmark;
      default: return BookOpen;
    }
  };

  const getSourceColor = (type: ResearchResult['type']) => {
    switch (type) {
      case 'case_law': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'statute': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'regulation': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'precedent': return 'bg-navy-100 text-navy-700 border-navy-300';
      default: return 'bg-navy-50 text-navy-700 border-navy-200';
    }
  };

  const getRelevanceBadge = (relevance: ResearchResult['relevance']) => {
    switch (relevance) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-navy-100 text-navy-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!user && (
        <div className="bg-gradient-to-r from-teal-50 to-teal-50 border-2 border-teal-200 rounded-xl px-6 py-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-navy-900">{t('research.title')}</p>
                <p className="text-sm text-navy-600">{t('research.signupPrompt')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all font-semibold shadow-md text-sm"
              >
                {t('research.createAccount')}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-navy-900">{t('research.heading')}</h1>
            <p className="text-navy-600">{t('research.subtitle')}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-navy-500">
          {lang === 'en'
            ? 'This tool provides legal information, not legal advice. Results are AI-generated and should be verified independently.'
            : 'Esta herramienta proporciona informacion legal, no asesoramiento legal. Los resultados son generados por IA y deben verificarse de forma independiente.'}
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeTab === 'search'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
          }`}
        >
          <Search className="w-4 h-4" />
          {t('research.newResearch')}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
          }`}
        >
          <History className="w-4 h-4" />
          {t('research.researchHistory')}
          {queries.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === 'history' ? 'bg-teal-500 text-white' : 'bg-navy-100'
            }`}>
              {queries.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'search' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 mb-8">
            <form onSubmit={performResearch} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  {t('research.queryLabel')}
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('research.queryPlaceholder')}
                    className="w-full pl-12 pr-4 py-4 border border-navy-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t('research.jurisdiction')}
                  </label>
                  <select
                    value={selectedJurisdiction}
                    onChange={(e) => setSelectedJurisdiction(e.target.value)}
                    className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {JURISDICTION_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((jurisdiction) => (
                          <option key={jurisdiction.code} value={jurisdiction.code}>
                            {jurisdiction.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    {t('research.practiceArea')}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">{t('research.allPracticeAreas')}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {t('research.sourceFilters')}
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFilters && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {sourceTypes.map((source) => {
                      const Icon = source.icon;
                      const isSelected = selectedSources.includes(source.id);
                      const sourceLabels: Record<string, string> = {
                        case_law: t('research.caseLaw'),
                        statutes: t('research.statutes'),
                        regulations: t('research.regulations'),
                        precedents: t('research.legalPrecedents'),
                      };
                      const sourceDescs: Record<string, string> = {
                        case_law: t('research.caseLawDesc'),
                        statutes: t('research.statutesDesc'),
                        regulations: t('research.regulationsDesc'),
                        precedents: t('research.legalPrecedentsDesc'),
                      };
                      return (
                        <button
                          key={source.id}
                          type="button"
                          onClick={() => toggleSource(source.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-navy-200 bg-white hover:border-navy-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-teal-500 text-white' : 'bg-navy-100 text-navy-500'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-teal-700' : 'text-navy-700'}`}>
                              {sourceLabels[source.id] || source.label}
                            </span>
                          </div>
                          <p className="text-xs text-navy-500">{sourceDescs[source.id] || source.description}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !searchQuery.trim() || selectedSources.length === 0}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg shadow-teal-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {t('research.researching')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    {t('research.conductResearch')}
                  </>
                )}
              </button>

              {selectedSources.length === 0 && (
                <p className="text-sm text-amber-600 text-center">{t('research.selectSource')}</p>
              )}
            </form>
          </div>

          {(searchResults || parsedResults) && (
            <div className="space-y-6">
              {parsedResults?.summary && (
                <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900">{t('research.summary')}</h3>
                  </div>
                  <div className="text-navy-700 leading-relaxed whitespace-pre-wrap">{parsedResults.summary}</div>
                </div>
              )}

              {parsedResults && parsedResults.results.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Scale className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-navy-900">{t('research.relevantAuthorities')}</h3>
                    </div>
                    <span className="text-sm text-navy-500">{parsedResults.results.length} {t('research.sourcesFound')}</span>
                  </div>

                  <div className="space-y-4">
                    {parsedResults.results.map((result, index) => {
                      const Icon = getSourceIcon(result.type);
                      const isExpanded = expandedResults.has(index);
                      return (
                        <div
                          key={index}
                          className={`border rounded-xl overflow-hidden transition-all ${getSourceColor(result.type)}`}
                        >
                          <button
                            onClick={() => toggleResultExpanded(index)}
                            className="w-full p-4 flex items-start justify-between text-left"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-semibold text-navy-900">{result.title}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRelevanceBadge(result.relevance)}`}>
                                    {result.relevance === 'high' ? t('research.highRelevance') : result.relevance === 'medium' ? t('research.mediumRelevance') : t('research.lowRelevance')}
                                  </span>
                                </div>
                                {result.citation && (
                                  <p className="text-sm text-navy-600 font-mono">{result.citation}</p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-navy-500 mt-1">
                                  {result.jurisdiction && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {result.jurisdiction}
                                    </span>
                                  )}
                                  {result.date && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {result.date}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-navy-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-0">
                              <div className="pl-11">
                                <div className="bg-white/50 rounded-lg p-4 border border-navy-100">
                                  <p className="text-sm text-navy-700 leading-relaxed whitespace-pre-wrap">
                                    {result.summary}
                                  </p>
                                  {result.keyPoints && result.keyPoints.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-navy-100">
                                      <p className="text-xs font-medium text-navy-500 mb-2">{t('research.keyPoints')}:</p>
                                      <ul className="space-y-1">
                                        {result.keyPoints.map((point, i) => (
                                          <li key={i} className="text-sm text-navy-600 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-navy-400 rounded-full mt-1.5 flex-shrink-0" />
                                            {point}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {parsedResults?.practicalGuidance && (
                <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Bookmark className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900">{t('research.practicalGuidance')}</h3>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                    <p className="text-navy-700 leading-relaxed whitespace-pre-wrap">{parsedResults.practicalGuidance}</p>
                  </div>
                </div>
              )}

              {!parsedResults?.summary && !parsedResults?.results.length && searchResults && (
                <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('research.results')}</h3>
                  <div className="bg-navy-50 border border-navy-200 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-sm text-navy-700 font-sans leading-relaxed">
                      {searchResults}
                    </pre>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>{t('research.disclaimer')}:</strong> {parsedResults?.disclaimer || t('research.disclaimerText')}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div>
          <div className="space-y-4">
            {queries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-navy-200">
                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-navy-400" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('research.noHistory')}</h3>
                <p className="text-navy-600 mb-4">{lang === 'en' ? 'Start researching legal topics to build your history' : 'Comienza a investigar temas legales para crear tu historial'}</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                >
                  {t('research.startResearching')}
                </button>
              </div>
            ) : (
              queries.map((query) => (
                <div
                  key={query.id}
                  className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy-900 mb-1">{query.query}</h3>
                        <div className="flex items-center gap-3 text-sm text-navy-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(query.created_at).toLocaleDateString()}
                          </span>
                          {query.category && (
                            <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                              {query.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery(query.query);
                        setSelectedCategory(query.category || '');
                        setActiveTab('search');
                      }}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('research.researchAgain')}
                    </button>
                  </div>
                  <div className="bg-navy-50 border border-navy-200 rounded-lg p-4 mt-4">
                    <p className={`text-sm text-navy-700 whitespace-pre-wrap ${expandedHistoryIds.has(query.id) ? '' : 'line-clamp-4'}`}>{query.results}</p>
                    {query.results && query.results.length > 300 && (
                      <button
                        onClick={() => setExpandedHistoryIds(prev => {
                          const next = new Set(prev);
                          if (next.has(query.id)) next.delete(query.id);
                          else next.add(query.id);
                          return next;
                        })}
                        className="text-teal-600 hover:text-teal-700 text-xs font-medium mt-2"
                      >
                        {expandedHistoryIds.has(query.id) ? t('research.showLess') : t('research.showFull')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
