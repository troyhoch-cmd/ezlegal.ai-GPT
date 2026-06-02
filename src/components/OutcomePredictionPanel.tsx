import { useState } from 'react';
import {
  Brain, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle,
  Lightbulb, Target, Activity, ChevronDown, ChevronUp, X, RefreshCw,
  Shield, FileCheck, Scale, AlertTriangle
} from 'lucide-react';
import { CasePrediction, CasePredictionInput, predictionService } from '../services/prediction-service';

interface OutcomePredictionPanelProps {
  caseData?: CasePredictionInput;
  caseId?: string;
  caseSource?: 'lso_client_intakes' | 'pro_bono_applications';
  onClose?: () => void;
  compact?: boolean;
}

export default function OutcomePredictionPanel({
  caseData,
  caseId,
  caseSource,
  onClose,
  compact = false
}: OutcomePredictionPanelProps) {
  const [prediction, setPrediction] = useState<CasePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFactors, setShowFactors] = useState(!compact);

  const runPrediction = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result: CasePrediction;

      if (caseId && caseSource === 'lso_client_intakes') {
        result = await predictionService.predictForLSOCase(caseId);
      } else if (caseId && caseSource === 'pro_bono_applications') {
        result = await predictionService.predictForProBonoApplication(caseId);
      } else if (caseData) {
        result = await predictionService.predictFromCaseData(caseData);
      } else {
        throw new Error('No case data provided');
      }

      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success-600';
    if (score >= 50) return 'text-warning-600';
    return 'text-error-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-success-100';
    if (score >= 50) return 'bg-warning-100';
    return 'bg-error-100';
  };

  const getOutcomeLabel = (outcome: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      favorable: { label: 'Likely Favorable', color: 'text-success-600 bg-success-50' },
      unfavorable: { label: 'At Risk', color: 'text-error-600 bg-error-50' },
      likely_settled: { label: 'Likely Settlement', color: 'text-blue-600 bg-blue-50' },
      uncertain: { label: 'Uncertain', color: 'text-warning-600 bg-warning-50' },
    };
    return labels[outcome] || { label: outcome, color: 'text-stone-600 bg-stone-50' };
  };

  const getConfidenceBadge = (confidence: string) => {
    const badges: Record<string, string> = {
      high: 'bg-success-100 text-success-700',
      medium: 'bg-warning-100 text-warning-700',
      low: 'bg-stone-100 text-stone-600',
    };
    return badges[confidence] || badges.medium;
  };

  if (compact && !prediction) {
    return (
      <button
        onClick={runPrediction}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
        {isLoading ? 'Analyzing...' : 'Predict'}
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden ${compact ? '' : 'max-w-lg'}`}>
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <Brain className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Outcome Prediction</h3>
            <p className="text-xs text-blue-100">AI-powered case analysis</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5">
        {!prediction && !isLoading && !error && (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-blue-200 mx-auto mb-3" />
            <p className="text-stone-600 mb-4">
              Analyze case factors to predict the likelihood of a favorable outcome
            </p>
            <button
              onClick={runPrediction}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
            >
              <Target className="w-5 h-5" />
              Run Prediction Analysis
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-stone-600 font-medium">Analyzing case factors...</p>
            <p className="text-sm text-stone-400 mt-1">This typically takes a few seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-8 h-8 text-error-500 mx-auto mb-2" />
            <p className="text-error-700 font-medium">{error}</p>
            <button
              onClick={runPrediction}
              className="mt-3 text-error-600 hover:text-error-700 text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {prediction && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getScoreBgColor(prediction.score)}`}>
                  <span className={`text-2xl font-bold ${getScoreColor(prediction.score)}`}>
                    {prediction.score}
                  </span>
                </div>
                <div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getOutcomeLabel(prediction.predictedOutcome).color}`}>
                    {getOutcomeLabel(prediction.predictedOutcome).label}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${getConfidenceBadge(prediction.confidence)}`}>
                      {prediction.confidence.charAt(0).toUpperCase() + prediction.confidence.slice(1)} confidence
                    </span>
                    <span className="text-xs text-stone-400">
                      Model accuracy: {prediction.modelAccuracy}%
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={runPrediction}
                className="text-blue-600 hover:text-blue-700"
                title="Refresh prediction"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-lg p-4">
              <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    prediction.score >= 70 ? 'bg-success-500' :
                    prediction.score >= 50 ? 'bg-warning-500' :
                    'bg-error-500'
                  }`}
                  style={{ width: `${prediction.score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-stone-500 mt-1">
                <span>Unfavorable</span>
                <span>Settlement</span>
                <span>Favorable</span>
              </div>
            </div>

            <div>
              <button
                onClick={() => setShowFactors(!showFactors)}
                className="flex items-center justify-between w-full py-2 text-stone-700 font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Contributing Factors ({prediction.factors.length})
                </span>
                {showFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showFactors && (
                <div className="space-y-2 mt-2">
                  {prediction.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        factor.impact === 'positive' ? 'bg-success-50 border border-success-100' :
                        factor.impact === 'negative' ? 'bg-error-50 border border-error-100' :
                        'bg-stone-50 border border-stone-100'
                      }`}
                    >
                      <div className={`mt-0.5 ${
                        factor.impact === 'positive' ? 'text-success-600' :
                        factor.impact === 'negative' ? 'text-error-600' :
                        'text-stone-400'
                      }`}>
                        {factor.impact === 'positive' ? <TrendingUp className="w-4 h-4" /> :
                         factor.impact === 'negative' ? <TrendingDown className="w-4 h-4" /> :
                         <Minus className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-stone-900">{factor.factor}</span>
                          <span className={`text-xs font-semibold ${
                            factor.impact === 'positive' ? 'text-success-600' :
                            factor.impact === 'negative' ? 'text-error-600' :
                            'text-stone-500'
                          }`}>
                            {factor.impact === 'positive' ? '+' : factor.impact === 'negative' ? '-' : ''}{factor.weight} pts
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">{factor.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {prediction.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4" />
                  AI Recommendations
                </h4>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prediction.compliance && (
              <div className="border-t border-stone-200 pt-4">
                <h4 className="font-semibold text-stone-700 flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4" />
                  Compliance Validation
                </h4>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                    prediction.compliance.arizonaValidated ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'
                  }`}>
                    <Scale className="w-3.5 h-3.5" />
                    <span>State Standards</span>
                    {prediction.compliance.arizonaValidated ?
                      <CheckCircle className="w-3.5 h-3.5 ml-auto" /> :
                      <AlertTriangle className="w-3.5 h-3.5 ml-auto" />
                    }
                  </div>

                  <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                    prediction.compliance.biasMitigated ? 'bg-success-50 text-success-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    <Shield className="w-3.5 h-3.5" />
                    <span>Bias Mitigated</span>
                    {prediction.compliance.biasMitigated && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                  </div>

                  <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                    prediction.compliance.ethicallyCompliant ? 'bg-success-50 text-success-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Ethical Guidelines</span>
                    {prediction.compliance.ethicallyCompliant && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                  </div>

                  <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                    prediction.compliance.documentValidated ? 'bg-success-50 text-success-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Document Verified</span>
                    {prediction.compliance.documentValidated && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                  </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-600">Enforcement Score</span>
                    <span className={`text-sm font-bold ${
                      prediction.compliance.enforcementScore >= 0.7 ? 'text-success-600' :
                      prediction.compliance.enforcementScore >= 0.5 ? 'text-warning-600' :
                      'text-error-600'
                    }`}>
                      {Math.round(prediction.compliance.enforcementScore * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prediction.compliance.enforcementScore >= 0.7 ? 'bg-success-500' :
                        prediction.compliance.enforcementScore >= 0.5 ? 'bg-warning-500' :
                        'bg-error-500'
                      }`}
                      style={{ width: `${prediction.compliance.enforcementScore * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-2">
                    Provenance: {prediction.compliance.provenanceHash}
                  </p>
                </div>

                {prediction.compliance.warnings.length > 0 && (
                  <div className="mt-3 bg-warning-50 border border-warning-200 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-warning-800 flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Compliance Warnings
                    </h5>
                    <ul className="space-y-1">
                      {prediction.compliance.warnings.map((warning, idx) => (
                        <li key={idx} className="text-xs text-warning-700">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
