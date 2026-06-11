import { useState } from 'react';
import { BookOpen, ExternalLink, Calendar, MapPin, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, Flag, X, HelpCircle, Scale, FileText, Globe } from 'lucide-react';

export type SourceType = 'statute' | 'regulation' | 'case' | 'secondary' | 'web' | 'knowledge_base' | 'uploaded';

export interface Citation {
  id?: string;
  title: string;
  url?: string;
  jurisdiction?: string;
  effectiveDate?: string;
  lastVerified?: string;
  source?: string;
  relevanceScore?: number;
  excerpt?: string;
  sourceType?: SourceType;
}

interface CitationDisplayProps {
  citations?: Citation[];
  jurisdiction?: string;
  lastUpdated?: string;
  verificationStatus?: 'verified' | 'unverified' | 'outdated' | 'unavailable';
  showCompact?: boolean;
  onReportIssue?: (issue: ReportIssue) => void;
}

export interface ReportIssue {
  citationId?: string;
  issueType: 'wrong_jurisdiction' | 'outdated_law' | 'missing_citation' | 'harmful_advice' | 'other';
  description: string;
  responseId?: string;
}

const VERIFICATION_INFO = {
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    className: 'bg-green-100 text-green-700 border-green-200',
    tooltip: 'Sources have been checked against official legal databases within the last 30 days.',
    action: 'These citations have been verified, but laws change. Always check current status before relying on them.',
  },
  unverified: {
    icon: Info,
    label: 'Unverified',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    tooltip: 'This response is based on general legal knowledge. Specific sources could not be verified.',
    action: 'Verify any specific legal citations with official sources before taking action.',
  },
  outdated: {
    icon: AlertCircle,
    label: 'May Be Outdated',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
    tooltip: 'Some cited sources may have been updated or superseded since our last verification.',
    action: 'Check for recent changes to these laws or regulations before relying on this information.',
  },
  unavailable: {
    icon: AlertCircle,
    label: 'Sources Unavailable',
    className: 'bg-red-100 text-red-700 border-red-200',
    tooltip: 'We could not locate specific legal sources for this response.',
    action: 'This is general guidance only. Consult official sources or an attorney for your specific situation.',
  },
};

const SOURCE_TYPE_INFO: Record<SourceType, { label: string; icon: typeof Scale; color: string; description: string }> = {
  statute: { label: 'Statute', icon: Scale, color: 'bg-blue-100 text-blue-700', description: 'Primary law enacted by legislature' },
  regulation: { label: 'Regulation', icon: FileText, color: 'bg-blue-100 text-blue-700', description: 'Agency rules with force of law' },
  case: { label: 'Case Law', icon: Scale, color: 'bg-blue-100 text-blue-700', description: 'Court decision establishing precedent' },
  secondary: { label: 'Secondary', icon: BookOpen, color: 'bg-slate-100 text-slate-600', description: 'Commentary, treatises, or legal guides' },
  web: { label: 'Web', icon: Globe, color: 'bg-slate-100 text-slate-500', description: 'Retrieved from web search' },
  knowledge_base: { label: 'Knowledge', icon: Info, color: 'bg-slate-100 text-slate-500', description: 'From AI training knowledge' },
  uploaded: { label: 'Your Doc', icon: FileText, color: 'bg-teal-100 text-teal-700', description: 'From your uploaded document' },
};

const ISSUE_TYPES = [
  { id: 'wrong_jurisdiction', label: 'Wrong jurisdiction/location' },
  { id: 'outdated_law', label: 'Law has changed/outdated' },
  { id: 'missing_citation', label: 'Missing or incorrect citation' },
  { id: 'harmful_advice', label: 'Potentially harmful advice' },
  { id: 'other', label: 'Other issue' },
] as const;

function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RPT-${timestamp}-${random}`;
}

export default function CitationDisplay({
  citations = [],
  jurisdiction,
  lastUpdated,
  verificationStatus = 'unverified',
  showCompact = false,
  onReportIssue,
}: CitationDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(!showCompact);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState<{ issueType: ReportIssue['issueType'] | ''; description: string }>({
    issueType: '',
    description: '',
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  const badge = VERIFICATION_INFO[verificationStatus];
  const BadgeIcon = badge.icon;
  const hasCitations = citations && citations.length > 0;

  const primarySources = citations.filter(c => ['statute', 'regulation', 'case'].includes(c.sourceType || ''));
  const secondarySources = citations.filter(c => !['statute', 'regulation', 'case'].includes(c.sourceType || ''));

  const handleSubmitReport = () => {
    if (!reportForm.issueType || !reportForm.description.trim()) return;

    const refNum = generateReferenceNumber();
    setReferenceNumber(refNum);

    const issue: ReportIssue = {
      issueType: reportForm.issueType as ReportIssue['issueType'],
      description: reportForm.description,
    };

    if (onReportIssue) {
      onReportIssue(issue);
    }

    setReportSubmitted(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportSubmitted(false);
    setReferenceNumber(null);
    setReportForm({ issueType: '', description: '' });
  };

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 text-left group"
        aria-expanded={isExpanded}
        aria-controls="citations-panel"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              {hasCitations ? `Sources (${citations.length})` : 'Source Information'}
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.className} cursor-help`}
              aria-describedby="verification-tooltip"
            >
              <BadgeIcon className="w-3 h-3" />
              {badge.label}
              <HelpCircle className="w-3 h-3 opacity-60" />
            </button>

            {showTooltip && (
              <div
                id="verification-tooltip"
                role="tooltip"
                className="absolute left-0 top-full mt-2 z-50 w-80 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="font-medium mb-1">{badge.label}</p>
                <p className="text-slate-300 mb-2">{badge.tooltip}</p>
                <div className="border-t border-slate-700 pt-2 mt-2 space-y-1.5">
                  <p className="font-medium text-green-400">What is verified:</p>
                  <ul className="text-slate-300 space-y-0.5 pl-3">
                    <li>- Citation accuracy (statute/case exists)</li>
                    <li>- Jurisdiction applicability</li>
                    <li>- Source publication date</li>
                  </ul>
                  <p className="font-medium text-amber-400 mt-2">Not verified:</p>
                  <ul className="text-slate-400 space-y-0.5 pl-3">
                    <li>- Facts you provided</li>
                    <li>- Your specific deadlines</li>
                    <li>- Completeness for your situation</li>
                  </ul>
                </div>
                <p className="text-slate-400 italic mt-2 pt-2 border-t border-slate-700">{badge.action}</p>
                <p className="text-xs text-blue-400 mt-2">
                  <a href="#footer" className="underline hover:text-blue-300">See update schedule</a> in footer
                </p>
                <div className="absolute -top-1.5 left-4 w-3 h-3 bg-slate-900 rotate-45" />
              </div>
            )}
          </div>

          {jurisdiction && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              <MapPin className="w-3 h-3" />
              {jurisdiction}
            </div>
          )}

          {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              Last checked: {lastUpdated}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-1 rounded hover:bg-slate-100 transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div id="citations-panel" className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {hasCitations ? (
            <>
              {primarySources.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Scale className="w-3 h-3" />
                    Primary Legal Sources
                  </p>
                  <div className="space-y-2">
                    {primarySources.map((citation, index) => (
                      <CitationCard key={citation.id || index} citation={citation} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {secondarySources.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    Secondary Sources
                  </p>
                  <div className="space-y-2">
                    {secondarySources.map((citation, index) => (
                      <CitationCard key={citation.id || index} citation={citation} index={primarySources.length + index} />
                    ))}
                  </div>
                </div>
              )}

              {primarySources.length === 0 && secondarySources.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      No primary legal sources (statutes, regulations, or case law) were cited.
                      For legal matters, verify with official sources.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No Specific Sources Available</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    This response is based on general legal knowledge and may not cite specific statutes or cases.
                    For important decisions, please verify with official sources or consult a licensed attorney.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed flex-1">
              <strong>Verification Notice:</strong> Legal information may change. Always verify current law with official sources
              {jurisdiction && ` for ${jurisdiction}`}. This is not legal advice.
            </p>
            <button
              onClick={() => setShowReportModal(true)}
              className="ml-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              Report Issue
            </button>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-slate-900">Report an Issue</h3>
              </div>
              <button
                onClick={closeReportModal}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-medium text-slate-900">Report Submitted Successfully</p>
                </div>

                {referenceNumber && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-slate-500 mb-1">Reference Number</p>
                    <p className="font-mono font-semibold text-slate-900">{referenceNumber}</p>
                    <p className="text-xs text-slate-400 mt-1">Save this for your records</p>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">What happens next</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Our legal ops team will review your report within 24-48 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">How this helps</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Your feedback is reviewed by our legal ops team to improve response quality. Reports inform our citation databases, retrieval systems, and human-authored guidelines.
                      </p>
                      <p className="text-slate-400 text-xs mt-1 italic">
                        Your case details are never used for AI model training.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">For urgent issues</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        If this involves immediate legal risk, please consult a licensed attorney.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeReportModal}
                  className="w-full mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <p className="text-sm text-slate-600">
                  Help us improve by reporting issues with this response. Your feedback helps ensure accurate legal information.
                </p>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    What type of issue? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {ISSUE_TYPES.map((type) => (
                      <label
                        key={type.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          reportForm.issueType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="issueType"
                          value={type.id}
                          checked={reportForm.issueType === type.id}
                          onChange={(e) => setReportForm(prev => ({ ...prev, issueType: e.target.value as typeof prev.issueType }))}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Please describe the issue <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide specific details about what's wrong..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeReportModal}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    disabled={!reportForm.issueType || !reportForm.description.trim()}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      reportForm.issueType && reportForm.description.trim()
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CitationCard({ citation, index }: { citation: Citation; index: number }) {
  const sourceTypeInfo = citation.sourceType ? SOURCE_TYPE_INFO[citation.sourceType] : null;
  const SourceIcon = sourceTypeInfo?.icon || BookOpen;

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 leading-tight">{citation.title}</p>
            {citation.source && (
              <p className="text-xs text-slate-500 mt-0.5">{citation.source}</p>
            )}
          </div>
          {citation.url && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-1.5 hover:bg-blue-100 rounded transition-colors group"
              aria-label={`View source: ${citation.title}`}
            >
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {sourceTypeInfo && (
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${sourceTypeInfo.color}`}
              title={sourceTypeInfo.description}
            >
              <SourceIcon className="w-3 h-3" />
              {sourceTypeInfo.label}
            </span>
          )}
          {citation.jurisdiction && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              <MapPin className="w-3 h-3" />
              {citation.jurisdiction}
            </span>
          )}
          {citation.effectiveDate && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              Effective: {citation.effectiveDate}
            </span>
          )}
          {citation.lastVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="w-3 h-3" />
              Verified: {citation.lastVerified}
            </span>
          )}
          {citation.relevanceScore && (
            <span className="text-xs text-slate-400">
              Relevance: {Math.round(citation.relevanceScore * 100)}%
            </span>
          )}
        </div>

        {citation.excerpt && (
          <p className="mt-2 text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2">
            "{citation.excerpt}"
          </p>
        )}
      </div>
    </div>
  );
}
