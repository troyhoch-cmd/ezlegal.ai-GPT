import { useState, useEffect } from 'react';
import {
  Brain, Scale, TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  ChevronDown, ChevronUp, Target, Lightbulb, Shield, X, Sparkles,
  FileText, MessageSquare, Zap, HelpCircle, ArrowRight, Users,
  RefreshCw, Loader2, FileSearch
} from 'lucide-react';
import { useActivityLog } from '../hooks/useActivityLog';
import {
  contextualPredictionService,
  ChatMessage,
  DocumentContext,
  ContextualPrediction,
  ExtractedCaseContext
} from '../services/contextual-prediction-service';

interface ContextualOutcomePredictionProps {
  chatMessages?: ChatMessage[];
  documents?: DocumentContext[];
  initialQuery?: string;
  onClose?: () => void;
  embedded?: boolean;
}

export default function ContextualOutcomePrediction({
  chatMessages = [],
  documents = [],
  initialQuery: _initialQuery,
  onClose,
  embedded = false
}: ContextualOutcomePredictionProps) {
  const { logPrediction } = useActivityLog();

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(true);
  const [extractedContext, setExtractedContext] = useState<ExtractedCaseContext | null>(null);
  const [prediction, setPrediction] = useState<ContextualPrediction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStrengths, setShowStrengths] = useState(true);
  const [showWeaknesses, setShowWeaknesses] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'strategy' | 'citations'>('overview');

  useEffect(() => {
    if (chatMessages.length > 0 || documents.length > 0) {
      analyzeContext();
    } else {
      setAnalyzing(false);
    }
  }, []);

  const analyzeContext = async () => {
    setAnalyzing(true);
    try {
      const context = await contextualPredictionService.extractCaseContext(
        chatMessages,
        documents
      );
      setExtractedContext(context);
    } catch (error) {
      console.error('Context extraction error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const runPrediction = async () => {
    if (!extractedContext) return;

    setLoading(true);
    try {
      const result = await contextualPredictionService.generatePrediction(extractedContext);
      setPrediction(result);

      logPrediction({
        caseType: extractedContext.caseType,
        confidenceScore: result.score,
        outcome: result.predictedOutcome
      });
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getOutcomeInfo = (outcome: string) => {
    const info: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
      favorable: { label: 'Likely Favorable', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: TrendingUp },
      unfavorable: { label: 'Challenging Outlook', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: TrendingDown },
      likely_settled: { label: 'Settlement Likely', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200', icon: Scale },
      uncertain: { label: 'Uncertain - Seek Counsel', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: AlertCircle },
    };
    return info[outcome] || info.uncertain;
  };

  const formatCaseType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (analyzing) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${embedded ? '' : 'max-w-3xl mx-auto'}`}>
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-600 p-5">
          <div className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Outcome Scenarios (Estimates)</h2>
              <p className="text-blue-100 text-sm">Analyzing your case context...</p>
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-brand-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <FileSearch className="absolute inset-4 w-12 h-12 text-brand-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Extracting Case Details</h3>
          <p className="text-slate-600">Analyzing {documents.length} document(s) and {chatMessages.length} message(s)...</p>

          <div className="mt-6 space-y-2 max-w-xs mx-auto text-left">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Identifying case type and jurisdiction
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Extracting key facts and parties
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Analyzing legal issues
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!extractedContext && !prediction) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${embedded ? '' : 'max-w-3xl mx-auto'}`}>
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-600 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Scale className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Outcome Scenarios (Estimates)</h2>
                <p className="text-blue-100 text-sm">Upload documents to get started</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Case Context Found</h3>
          <p className="text-slate-600 mb-6">
            Upload documents or start a conversation about your legal matter to get an AI-powered outcome prediction.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-4 bg-slate-50 rounded-xl text-left">
              <FileText className="w-6 h-6 text-brand-600 mb-2" />
              <p className="font-semibold text-slate-900 text-sm">Upload Documents</p>
              <p className="text-xs text-slate-500">Policies, complaints, contracts, letters</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-left">
              <MessageSquare className="w-6 h-6 text-brand-600 mb-2" />
              <p className="font-semibold text-slate-900 text-sm">Describe Your Case</p>
              <p className="text-xs text-slate-500">Chat with AI about your legal issue</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col ${embedded ? '' : 'max-w-3xl mx-auto max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-4rem)]'}`}>
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-600 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Outcome Scenarios (Estimates)</h2>
              <p className="text-blue-100 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Context-Aware Analysis
              </p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {extractedContext && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="bg-white/20 px-2 py-1 rounded-full text-white font-medium">
              {formatCaseType(extractedContext.caseType)}
            </span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-white">
              {extractedContext.jurisdiction}
            </span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-white">
              {extractedContext.documentTypes.length} Doc(s)
            </span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-white">
              {extractedContext.keyFacts.length} Facts
            </span>
          </div>
        )}
      </div>

      {!prediction ? (
        <div className="p-4 overflow-y-auto flex-1">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-brand-600" />
              Case Context Extracted
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Case Type</p>
                <p className="font-semibold text-slate-900">
                  {formatCaseType(extractedContext?.caseType || 'General')}
                  {extractedContext?.caseSubtype && (
                    <span className="text-slate-500 font-normal"> ({formatCaseType(extractedContext.caseSubtype)})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Jurisdiction</p>
                <p className="font-semibold text-slate-900">{extractedContext?.jurisdiction || 'Not specified'}</p>
              </div>
            </div>

            {extractedContext?.parties && Object.keys(extractedContext.parties).length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Parties Identified</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(extractedContext.parties).map(([role, name]) => name && (
                    <span key={role} className="px-3 py-1 bg-white rounded-full text-sm border border-slate-200">
                      <span className="text-slate-500 capitalize">{role}:</span> {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {extractedContext?.documentTypes && extractedContext.documentTypes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Documents Analyzed</p>
                <div className="flex flex-wrap gap-2">
                  {extractedContext.documentTypes.map((docType, idx) => (
                    <span key={idx} className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium">
                      {docType}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {extractedContext?.legalIssues && extractedContext.legalIssues.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Legal Issues Identified</p>
                <ul className="space-y-1">
                  {extractedContext.legalIssues.slice(0, 5).map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {extractedContext?.coverageIssues && extractedContext.coverageIssues.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-2">Coverage Concerns</p>
                <ul className="space-y-1">
                  {extractedContext.coverageIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                      <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-teal-500 transition-all"
                style={{ width: `${extractedContext?.confidence || 0}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600">{extractedContext?.confidence || 0}% context confidence</span>
          </div>

          <button
            onClick={runPrediction}
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Prediction...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Generate Outcome Prediction
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center mt-3">
            Our AI will analyze your case context and provide a detailed outcome prediction
          </p>
        </div>
      ) : (
        <div className="p-4 overflow-y-auto flex-1">
          <div className="text-center mb-4">
            <div className="relative inline-block mb-3">
              <svg className="w-28 h-28" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  className={`stroke-current ${getScoreColor(prediction.score)}`}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(prediction.score / 100) * 283} 283`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(prediction.score)}`}>
                  {prediction.score}
                </span>
                <span className="text-xs text-slate-500">/100</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getOutcomeInfo(prediction.predictedOutcome).bg}`}>
                {(() => {
                  const Icon = getOutcomeInfo(prediction.predictedOutcome).icon;
                  return <Icon className={`w-4 h-4 ${getOutcomeInfo(prediction.predictedOutcome).color}`} />;
                })()}
                <span className={`font-semibold ${getOutcomeInfo(prediction.predictedOutcome).color}`}>
                  {getOutcomeInfo(prediction.predictedOutcome).label}
                </span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium ${
                prediction.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                prediction.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-rose-100 text-rose-700'
              }`}>
                <Target className="w-3.5 h-3.5" />
                {prediction.confidence.charAt(0).toUpperCase() + prediction.confidence.slice(1)} Confidence
              </div>
            </div>
          </div>

          {prediction.reasoning && (
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 mb-1">AI Analysis</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{prediction.reasoning}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex border-b border-slate-200 mb-4 overflow-x-auto">
            {(['overview', 'factors', 'citations', 'strategy'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'citations' ? 'Legal Authority' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'citations' && prediction.legalCitations?.length > 0 && (
                  <span className="ml-1 text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
                    {prediction.legalCitations.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4">
              {prediction.keyStrengths.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowStrengths(!showStrengths)}
                    className="flex items-center justify-between w-full py-2 text-slate-700 font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Key Strengths ({prediction.keyStrengths.length})
                    </span>
                    {showStrengths ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showStrengths && (
                    <div className="space-y-2 mt-2">
                      {prediction.keyStrengths.map((strength, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-emerald-800">{strength}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {prediction.keyWeaknesses.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowWeaknesses(!showWeaknesses)}
                    className="flex items-center justify-between w-full py-2 text-slate-700 font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                      Challenges to Address ({prediction.keyWeaknesses.length})
                    </span>
                    {showWeaknesses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showWeaknesses && (
                    <div className="space-y-2 mt-2">
                      {prediction.keyWeaknesses.map((weakness, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-rose-800">{weakness}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'factors' && (
            <div className="space-y-4">
              {prediction.criticalQuestions.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4" />
                    Critical Questions to Answer
                  </h4>
                  <ul className="space-y-2">
                    {prediction.criticalQuestions.map((question, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                        <span className="flex-shrink-0 w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-800">
                          {idx + 1}
                        </span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {extractedContext?.keyFacts && extractedContext.keyFacts.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-between w-full py-2 text-slate-700 font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Extracted Facts ({extractedContext.keyFacts.length})
                    </span>
                    {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showDetails && (
                    <div className="mt-2 p-4 bg-slate-50 rounded-lg max-h-60 overflow-y-auto">
                      <ul className="space-y-2 text-sm text-slate-700">
                        {extractedContext.keyFacts.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-slate-400">{idx + 1}.</span>
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'citations' && (
            <div className="space-y-4">
              {prediction.legalCitations && prediction.legalCitations.length > 0 ? (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Scale className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">Applicable Legal Authority</p>
                        <p className="text-sm text-slate-600 mt-1">
                          These statutes, regulations, and case law may apply to your {extractedContext?.caseType?.replace(/_/g, ' ')} matter in {extractedContext?.jurisdiction}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {prediction.legalCitations.map((citation, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border-2 ${
                          citation.supportsFavorable
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                citation.supportsFavorable
                                  ? 'bg-emerald-200 text-emerald-800'
                                  : 'bg-amber-200 text-amber-800'
                              }`}>
                                {citation.supportsFavorable ? 'SUPPORTS' : 'CONSIDER'}
                              </span>
                              <span className="font-bold text-slate-900 text-sm">{citation.section}</span>
                            </div>
                            <h4 className="font-semibold text-slate-800 mb-2">{citation.title}</h4>
                            <p className="text-sm text-slate-700 mb-2">{citation.summary}</p>
                            <p className="text-xs text-slate-600 italic">
                              <span className="font-medium">Relevance:</span> {citation.relevance}
                            </p>
                          </div>
                          {citation.url && (
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                              title="View source"
                            >
                              <ArrowRight className="w-4 h-4 text-brand-600" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-100 rounded-lg">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Note:</span> Legal citations are provided for informational purposes. Laws change frequently and may have been amended. Always verify current law with an attorney or official source before relying on these citations.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No specific legal citations identified for this case type.</p>
                  <p className="text-sm text-slate-500 mt-1">Consult with an attorney for applicable legal authorities.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-4">
              {prediction.nextSteps.length > 0 && (
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-brand-600" />
                    Recommended Next Steps
                  </h4>
                  <div className="space-y-3">
                    {prediction.nextSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.urgency === 'immediate' ? 'bg-rose-100 text-rose-700' :
                          step.urgency === 'soon' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{step.action}</p>
                          {step.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                          )}
                          <span className={`text-xs font-medium ${
                            step.urgency === 'immediate' ? 'text-rose-600' :
                            step.urgency === 'soon' ? 'text-amber-600' :
                            'text-slate-500'
                          }`}>
                            {step.urgency === 'immediate' ? 'Do this now' : step.urgency === 'soon' ? 'Within 1-2 weeks' : 'When ready'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prediction.recommendations.length > 0 && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                  <h4 className="font-semibold text-teal-900 flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4" />
                    Strategic Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-teal-800">
                        <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.comparableCasesSummary && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">{prediction.comparableCasesSummary}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setPrediction(null);
                analyzeContext();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Re-analyze
            </button>
            <a
              href="/dashboard/lawyer-profiles"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-teal-600 text-white rounded-xl font-semibold hover:from-brand-700 hover:to-teal-700 transition-all"
            >
              <Users className="w-4 h-4" />
              Connect with Attorney
            </a>
          </div>
        </div>
      )}

      <div className="bg-slate-100 border-t border-slate-200 px-6 py-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            This AI-powered prediction provides legal information for educational purposes only. It does not constitute legal advice, create an attorney-client relationship, or guarantee any outcome. For advice specific to your situation, consult with a licensed attorney.
          </p>
        </div>
      </div>
    </div>
  );
}
