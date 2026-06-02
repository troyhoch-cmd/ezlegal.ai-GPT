import { useState } from 'react';
import {
  Scale, BookOpen, MapPin, FileText, ChevronDown, ChevronUp,
  Sparkles, AlertCircle, ExternalLink, Gavel, CheckCircle, Clock,
  TrendingUp, TrendingDown, Minus, Search, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ComparableCase {
  caseName: string;
  jurisdiction: string;
  year: number;
  relevanceScore: number;
  factPattern: string;
  keyFacts: string[];
  outcome: string;
  outcomeType: 'favorable' | 'unfavorable' | 'settled' | 'mixed';
  damages?: string;
  keyTakeaway: string;
  citation?: string;
}

interface ComparableCasesPanelProps {
  caseType: string;
  jurisdiction: string;
  factorAnswers: Record<string, string | boolean>;
  predictionScore: number;
  additionalContext?: string;
  onClose?: () => void;
}

export default function ComparableCasesPanel({
  caseType,
  jurisdiction,
  factorAnswers,
  predictionScore,
  additionalContext
}: ComparableCasesPanelProps) {
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<ComparableCase[]>([]);
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const findSimilarCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/outcome-prediction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'findSimilarCases',
            caseType,
            jurisdiction,
            factorAnswers,
            predictionScore,
            additionalContext,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to find similar cases');
      }

      const data = await response.json();
      setCases(data.cases || []);
      setHasSearched(true);
    } catch (err) {
      console.error('Error finding similar cases:', err);
      setError('Unable to find similar cases at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeColor = (type: string) => {
    switch (type) {
      case 'favorable':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'unfavorable':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'settled':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  const getOutcomeIcon = (type: string) => {
    switch (type) {
      case 'favorable':
        return TrendingUp;
      case 'unfavorable':
        return TrendingDown;
      case 'settled':
        return Scale;
      default:
        return Minus;
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-100';
    if (score >= 70) return 'text-sky-600 bg-sky-100';
    return 'text-amber-600 bg-amber-100';
  };

  if (!hasSearched) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#0067FF]/10 rounded-2xl flex items-center justify-center">
            <Search className="w-8 h-8 text-[#0067FF]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Find Similar Cases in Your Jurisdiction
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Our AI will analyze cases with similar fact patterns in {jurisdiction || 'your state'} to show
            you how courts have ruled in comparable situations.
          </p>

          <div className="bg-white/80 rounded-lg p-4 mb-6 max-w-sm mx-auto">
            <div className="flex items-start gap-3 text-left">
              <Sparkles className="w-5 h-5 text-[#0067FF] flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-slate-800">Powered by ezLegal.ai</p>
                <p className="text-slate-500 text-xs mt-1">
                  Advanced reasoning analyzes case law to find relevant precedents
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={findSimilarCases}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0067FF] to-teal-600 text-white rounded-xl font-semibold hover:from-[#0052CC] hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching Case Law...
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                Find Similar Cases
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 mt-4">
            Results are AI-generated summaries for educational purposes only
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-[#0067FF]/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-[#0067FF] border-t-transparent rounded-full animate-spin" />
            <BookOpen className="absolute inset-4 w-8 h-8 text-[#0067FF]" />
          </div>
          <p className="font-semibold text-slate-700">Searching Case Law...</p>
          <p className="text-sm text-slate-500 mt-2">
            ezLegal.ai is analyzing precedents in {jurisdiction}
          </p>
          <div className="mt-4 space-y-2 max-w-xs mx-auto">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Analyzing your fact pattern
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Matching against case law database
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Generating case summaries
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 rounded-xl border border-rose-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-800">Unable to Find Cases</p>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
            <button
              onClick={findSimilarCases}
              className="mt-3 inline-flex items-center gap-2 text-sm text-rose-700 hover:text-rose-800 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">No Similar Cases Found</p>
            <p className="text-sm text-amber-600 mt-1">
              We couldn't find cases with sufficiently similar fact patterns in your jurisdiction.
              This may indicate your case has unique circumstances.
            </p>
            <p className="text-sm text-amber-700 mt-3 font-medium">
              We recommend consulting with an attorney for personalized guidance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#0067FF]" />
          <h3 className="font-bold text-slate-800">
            Similar Cases Found ({cases.length})
          </h3>
        </div>
        <button
          onClick={findSimilarCases}
          className="text-sm text-[#0067FF] hover:text-[#0052CC] font-medium flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#0067FF] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            These cases have been identified by AI as having similar fact patterns to your situation.
            Case summaries are for educational purposes and may not reflect all relevant details.
            Always consult with an attorney before making legal decisions.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {cases.map((caseItem, idx) => {
          const OutcomeIcon = getOutcomeIcon(caseItem.outcomeType);
          const isExpanded = expandedCase === idx;

          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all"
            >
              <button
                onClick={() => setExpandedCase(isExpanded ? null : idx)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getRelevanceColor(caseItem.relevanceScore)}`}>
                        {caseItem.relevanceScore}% Match
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getOutcomeColor(caseItem.outcomeType)}`}>
                        <OutcomeIcon className="w-3 h-3" />
                        {caseItem.outcomeType.charAt(0).toUpperCase() + caseItem.outcomeType.slice(1)}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-800 mb-1">
                      {caseItem.caseName}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {caseItem.jurisdiction}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {caseItem.year}
                      </span>
                      {caseItem.citation && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {caseItem.citation}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {!isExpanded && (
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {caseItem.factPattern}
                  </p>
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Fact Pattern
                    </h5>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {caseItem.factPattern}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Key Facts Similar to Your Case
                    </h5>
                    <ul className="space-y-1.5">
                      {caseItem.keyFacts.map((fact, factIdx) => (
                        <li key={factIdx} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`rounded-lg p-3 ${
                    caseItem.outcomeType === 'favorable' ? 'bg-emerald-50 border border-emerald-100' :
                    caseItem.outcomeType === 'unfavorable' ? 'bg-rose-50 border border-rose-100' :
                    caseItem.outcomeType === 'settled' ? 'bg-sky-50 border border-sky-100' :
                    'bg-amber-50 border border-amber-100'
                  }`}>
                    <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Case Outcome
                    </h5>
                    <p className="text-sm font-medium text-slate-800">
                      {caseItem.outcome}
                    </p>
                    {caseItem.damages && (
                      <p className="text-xs text-slate-600 mt-1">
                        Recovery: {caseItem.damages}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#0067FF]/5 rounded-lg p-3 border border-[#0067FF]/10">
                    <h5 className="text-xs font-semibold text-[#0067FF] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Gavel className="w-3 h-3" />
                      Key Takeaway
                    </h5>
                    <p className="text-sm text-slate-700">
                      {caseItem.keyTakeaway}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-start gap-3">
          <Scale className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-700">
              <strong>What This Means for Your Case:</strong> Based on these precedents,
              cases with your fact pattern have historically achieved
              {predictionScore >= 60 ? ' favorable outcomes' : predictionScore >= 40 ? ' mixed results' : ' faced challenges'}.
              The strongest cases typically had thorough documentation and clear evidence supporting their claims.
            </p>
            <a
              href="/dashboard/lawyer-profiles"
              className="inline-flex items-center gap-1 text-sm text-[#0067FF] hover:text-[#0052CC] font-medium mt-2"
            >
              Discuss these cases with an attorney
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
