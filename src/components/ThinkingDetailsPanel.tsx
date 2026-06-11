import { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, Sparkles, Scale, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface ThinkingStep {
  type: 'analysis' | 'research' | 'consideration' | 'conclusion';
  content: string;
  timestamp?: number;
}

interface ThinkingDetails {
  legalArea: string;
  jurisdiction: string;
  keyIssues: string[];
  considerations: string[];
  relevantStatutes: string[];
  riskFactors: string[];
  confidenceLevel: 'high' | 'medium' | 'low' | 'needs_verification';
  thinkingSteps: ThinkingStep[];
  processingTimeMs?: number;
}

interface ThinkingDetailsPanelProps {
  thinking: ThinkingDetails | null;
  isExpanded?: boolean;
  onToggle?: () => void;
  isLoading?: boolean;
}

export function parseThinkingFromResponse(response: string): {
  content: string;
  thinking: ThinkingDetails | null;
} {
  const thinkingStartMarker = '---THINKING_DETAILS---';
  const thinkingEndMarker = '---END_THINKING_DETAILS---';

  const startIdx = response.indexOf(thinkingStartMarker);
  const endIdx = response.indexOf(thinkingEndMarker);

  if (startIdx === -1 || endIdx === -1) {
    return { content: response, thinking: null };
  }

  const contentBefore = response.substring(0, startIdx).trim();
  const contentAfter = response.substring(endIdx + thinkingEndMarker.length).trim();
  const cleanContent = (contentBefore + '\n\n' + contentAfter).trim();

  const thinkingJson = response.substring(startIdx + thinkingStartMarker.length, endIdx).trim();

  try {
    const thinking = JSON.parse(thinkingJson) as ThinkingDetails;
    return { content: cleanContent, thinking };
  } catch {
    const thinking: ThinkingDetails = {
      legalArea: 'General Legal Information',
      jurisdiction: 'Arizona',
      keyIssues: [],
      considerations: [],
      relevantStatutes: [],
      riskFactors: [],
      confidenceLevel: 'medium',
      thinkingSteps: [],
    };

    const lines = thinkingJson.split('\n').filter(l => l.trim());
    for (const line of lines) {
      if (line.startsWith('LEGAL_AREA:')) {
        thinking.legalArea = line.replace('LEGAL_AREA:', '').trim();
      } else if (line.startsWith('JURISDICTION:')) {
        thinking.jurisdiction = line.replace('JURISDICTION:', '').trim();
      } else if (line.startsWith('KEY_ISSUE:')) {
        thinking.keyIssues.push(line.replace('KEY_ISSUE:', '').trim());
      } else if (line.startsWith('CONSIDERATION:')) {
        thinking.considerations.push(line.replace('CONSIDERATION:', '').trim());
      } else if (line.startsWith('STATUTE:')) {
        thinking.relevantStatutes.push(line.replace('STATUTE:', '').trim());
      } else if (line.startsWith('RISK:')) {
        thinking.riskFactors.push(line.replace('RISK:', '').trim());
      } else if (line.startsWith('CONFIDENCE:')) {
        const level = line.replace('CONFIDENCE:', '').trim().toLowerCase();
        if (level === 'high' || level === 'medium' || level === 'low' || level === 'needs_verification') {
          thinking.confidenceLevel = level as ThinkingDetails['confidenceLevel'];
        }
      } else if (line.startsWith('STEP:')) {
        thinking.thinkingSteps.push({
          type: 'analysis',
          content: line.replace('STEP:', '').trim(),
        });
      }
    }

    return { content: cleanContent, thinking };
  }
}

export default function ThinkingDetailsPanel({
  thinking,
  isExpanded: controlledExpanded,
  onToggle,
  isLoading = false,
}: ThinkingDetailsPanelProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;
  const handleToggle = onToggle ?? (() => setInternalExpanded(!internalExpanded));

  if (!thinking && !isLoading) return null;

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      case 'needs_verification': return 'text-amber-700 bg-amber-50 border-amber-300';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getConfidenceLabel = (level: string) => {
    if (level === 'needs_verification') return 'Needs Verification';
    return level.charAt(0).toUpperCase() + level.slice(1) + ' Confidence';
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <Brain className="w-3.5 h-3.5" />;
      case 'research': return <Scale className="w-3.5 h-3.5" />;
      case 'consideration': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'conclusion': return <CheckCircle2 className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-white mb-4">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">AI Reasoning Process</p>
            {thinking && (
              <p className="text-xs text-slate-500">
                {thinking.legalArea} | {thinking.jurisdiction}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-full">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="text-xs font-medium text-blue-600 ml-1">Analyzing...</span>
            </div>
          )}
          {thinking && !isLoading && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getConfidenceColor(thinking.confidenceLevel)}`}>
              {getConfidenceLabel(thinking.confidenceLevel)}
            </span>
          )}
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isExpanded && thinking && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-200 pt-4">
          {thinking.thinkingSteps.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Reasoning Steps
              </h4>
              <div className="space-y-2">
                {thinking.thinkingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getStepIcon(step.type)}
                    </div>
                    <p className="text-sm text-slate-700">{step.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {thinking.keyIssues.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Scale className="w-3.5 h-3.5" />
                Key Legal Issues Identified
              </h4>
              <ul className="space-y-1">
                {thinking.keyIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {idx + 1}
                    </span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {thinking.confidenceLevel === 'needs_verification' ? (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p>No authoritative sources were retrieved for this query. The response includes a verification checklist — confirm those items before relying on this information.</p>
            </div>
          ) : thinking.relevantStatutes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Relevant Statutes & Case Law
              </h4>
              <div className="flex flex-wrap gap-2">
                {thinking.relevantStatutes.map((statute, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    {statute}
                  </span>
                ))}
              </div>
            </div>
          )}

          {thinking.considerations.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5" />
                Critical Considerations
              </h4>
              <ul className="space-y-1">
                {thinking.considerations.map((consideration, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {consideration}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {thinking.riskFactors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Risk Factors & Warnings
              </h4>
              <ul className="space-y-1">
                {thinking.riskFactors.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {thinking.processingTimeMs && (
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <Clock className="w-3.5 h-3.5" />
              Analysis completed in {(thinking.processingTimeMs / 1000).toFixed(2)}s
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { ThinkingDetails, ThinkingStep };
