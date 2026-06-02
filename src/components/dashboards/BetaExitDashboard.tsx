import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Shield,
  Activity,
  Users,
  Smartphone,
  Calendar,
  Target,
  Loader2,
} from 'lucide-react';
import {
  BETA_EXIT_CHECKLIST,
  formatThreshold,
  getExitRuleDescription,
  type GateStatus,
  type BetaExitEvaluation,
} from '../../lib/beta-exit-checklist';
import {
  evaluateBetaExit,
  saveEvaluation,
  getLatestEvaluation,
  getTotalSessions,
  getMobileSessions,
  getRunTimeDays,
  runCrisisDetectorQA,
} from '../../services/beta-metrics-service';
import { useAuth } from '../../contexts/AuthContext';

function StatusIcon({ status }: { status: GateStatus }) {
  switch (status) {
    case 'pass':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'fail':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'pending':
      return <Clock className="w-5 h-5 text-amber-500" />;
    case 'insufficient_data':
      return <AlertCircle className="w-5 h-5 text-slate-400" />;
    default:
      return <AlertCircle className="w-5 h-5 text-slate-400" />;
  }
}

function OverallStatusBadge({ result }: { result: BetaExitEvaluation['overallResult'] }) {
  if (result === 'pass') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
        <CheckCircle className="w-5 h-5" />
        Ready to Ship
      </div>
    );
  }
  if (result === 'fail') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full font-semibold">
        <XCircle className="w-5 h-5" />
        Not Ready
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-semibold">
      <AlertCircle className="w-5 h-5" />
      Insufficient Data
    </div>
  );
}

export default function BetaExitDashboard() {
  const { user } = useAuth();
  const [evaluation, setEvaluation] = useState<BetaExitEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sampleStats, setSampleStats] = useState({
    totalSessions: 0,
    mobileSessions: 0,
    runTimeDays: 0,
  });
  const [crisisQA, setCrisisQA] = useState<ReturnType<typeof runCrisisDetectorQA> | null>(null);

  const testId = BETA_EXIT_CHECKLIST.testId;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [latest, total, mobile, days] = await Promise.all([
        getLatestEvaluation(testId),
        getTotalSessions(testId),
        getMobileSessions(testId),
        getRunTimeDays(testId),
      ]);

      setEvaluation(latest);
      setSampleStats({
        totalSessions: total,
        mobileSessions: mobile,
        runTimeDays: days,
      });

      const qaResult = runCrisisDetectorQA();
      setCrisisQA(qaResult);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runEvaluation = async () => {
    setEvaluating(true);
    try {
      const result = await evaluateBetaExit(testId);
      await saveEvaluation(result, user?.id);
      setEvaluation(result);
    } catch (error) {
      console.error('Error running evaluation:', error);
    } finally {
      setEvaluating(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const mobilePercent = sampleStats.totalSessions > 0
    ? (sampleStats.mobileSessions / sampleStats.totalSessions) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Beta Exit Checklist</h2>
          <p className="text-sm text-slate-500 mt-1">
            Cognitive Load Redesign A/B Test - {testId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {evaluation && <OverallStatusBadge result={evaluation.overallResult} />}
          <button
            onClick={runEvaluation}
            disabled={evaluating}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {evaluating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Run Evaluation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {sampleStats.totalSessions.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">Total Sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {sampleStats.totalSessions >= BETA_EXIT_CHECKLIST.minimumSampleRequirements.totalSessions ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="text-slate-500">
              Need {BETA_EXIT_CHECKLIST.minimumSampleRequirements.totalSessions.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{mobilePercent.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">Mobile Sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {mobilePercent >= 30 ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="text-slate-500">Need 30%+</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{sampleStats.runTimeDays}</p>
              <p className="text-xs text-slate-500">Days Running</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {sampleStats.runTimeDays >= 7 ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="text-slate-500">Need 7+ days</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {crisisQA ? `${crisisQA.recall.toFixed(0)}%` : '--'}
              </p>
              <p className="text-xs text-slate-500">Crisis Recall</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {crisisQA && crisisQA.recall >= 95 ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="text-slate-500">Need 95%+</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Checklist Categories</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {BETA_EXIT_CHECKLIST.categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const categoryResult = evaluation?.categoryResults[category.id];
            const passedCount = categoryResult?.passedCount || 0;
            const totalCount = category.items.length;

            return (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{category.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            category.gateType === 'hard'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {category.gateType === 'hard' ? 'Hard Gate' : 'Soft Gate'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">
                      {passedCount}/{totalCount} passed
                    </span>
                    {categoryResult && (
                      <StatusIcon status={categoryResult.passed ? 'pass' : 'fail'} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="ml-7 space-y-2">
                      {category.items.map((item) => {
                        const itemStatus = categoryResult?.items[item.id] || 'pending';

                        return (
                          <div
                            key={item.id}
                            className="flex items-start justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-start gap-3">
                              <StatusIcon status={itemStatus} />
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {item.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {item.thresholds.map((threshold, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded"
                                    >
                                      {threshold.metric}: {formatThreshold(threshold)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 text-white">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-2">Exit Rule</h4>
            <p className="text-sm text-slate-300 whitespace-pre-line">{getExitRuleDescription()}</p>
          </div>
        </div>
      </div>

      {crisisQA && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Crisis Detector QA Results</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">Recall: {crisisQA.recall.toFixed(1)}%</span>
              <span className="text-amber-600">
                False Positive: {crisisQA.falsePositiveRate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {crisisQA.details.map((result, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    result.passed ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className="truncate text-slate-700">{result.input}</span>
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded ${
                      result.expected ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {result.expected ? 'Crisis' : 'Normal'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {evaluation?.notes && evaluation.notes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">Notes</h4>
              <ul className="space-y-1">
                {evaluation.notes.map((note, idx) => (
                  <li key={idx} className="text-sm text-amber-700">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {evaluation && (
        <p className="text-xs text-slate-400 text-center">
          Last evaluated: {evaluation.evaluatedAt.toLocaleString()}
        </p>
      )}
    </div>
  );
}
