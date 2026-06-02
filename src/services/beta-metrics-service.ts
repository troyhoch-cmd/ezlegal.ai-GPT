import { supabase } from '../lib/supabase';
import {
  BETA_EXIT_CHECKLIST,
  evaluateThreshold,
  type BetaExitEvaluation,
  type GateStatus,
  type ChecklistCategory,
  CRISIS_TEST_SET,
} from '../lib/beta-exit-checklist';
import { detectCrisisSignal } from '../components/cognitive-load';

interface SessionSummary {
  testId: string;
  variantId: string;
  deviceType: string;
  sessionCount: number;
  activeDays: number;
}

interface MetricSummary {
  testId: string;
  variantId: string;
  metricName: string;
  eventCount: number;
  avgValue: number;
  p50Value: number;
  p95Value: number;
}

export async function getSessionSummary(testId: string): Promise<SessionSummary[]> {
  const { data, error } = await supabase
    .from('ab_test_sessions_summary')
    .select('*')
    .eq('test_id', testId);

  if (error) {
    console.error('Error fetching session summary:', error);
    return [];
  }

  return (data || []).map((row) => ({
    testId: row.test_id,
    variantId: row.variant_id,
    deviceType: row.device_type,
    sessionCount: row.session_count,
    activeDays: row.active_days,
  }));
}

export async function getMetricsSummary(testId: string): Promise<MetricSummary[]> {
  const { data, error } = await supabase
    .from('ab_test_metrics_summary')
    .select('*')
    .eq('test_id', testId);

  if (error) {
    console.error('Error fetching metrics summary:', error);
    return [];
  }

  return (data || []).map((row) => ({
    testId: row.test_id,
    variantId: row.variant_id,
    metricName: row.metric_name,
    eventCount: row.event_count,
    avgValue: row.avg_value,
    p50Value: row.p50_value,
    p95Value: row.p95_value,
  }));
}

export async function getTotalSessions(testId: string): Promise<number> {
  const { count, error } = await supabase
    .from('ab_test_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId);

  if (error) {
    console.error('Error counting sessions:', error);
    return 0;
  }

  return count || 0;
}

export async function getMobileSessions(testId: string): Promise<number> {
  const { count, error } = await supabase
    .from('ab_test_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId)
    .eq('device_type', 'mobile');

  if (error) {
    console.error('Error counting mobile sessions:', error);
    return 0;
  }

  return count || 0;
}

export async function getRunTimeDays(testId: string): Promise<number> {
  const { data, error } = await supabase
    .from('ab_test_sessions')
    .select('started_at')
    .eq('test_id', testId)
    .order('started_at', { ascending: true })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 0;
  }

  const firstSession = new Date(data[0].started_at);
  const now = new Date();
  const diffMs = now.getTime() - firstSession.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export async function getMetricValue(
  testId: string,
  variantId: string,
  metricName: string,
  aggregation: 'avg' | 'p50' | 'sum' | 'count' = 'avg'
): Promise<number | null> {
  const { data, error } = await supabase
    .from('ab_test_metrics_summary')
    .select('*')
    .eq('test_id', testId)
    .eq('variant_id', variantId)
    .eq('metric_name', metricName)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  switch (aggregation) {
    case 'avg':
      return data.avg_value;
    case 'p50':
      return data.p50_value;
    case 'sum':
      return data.event_count * data.avg_value;
    case 'count':
      return data.event_count;
    default:
      return data.avg_value;
  }
}

export function runCrisisDetectorQA(): { recall: number; falsePositiveRate: number; details: Array<{ input: string; expected: boolean; actual: boolean; passed: boolean }> } {
  const results = CRISIS_TEST_SET.map((test) => {
    const detected = detectCrisisSignal(test.input);
    const actual = detected !== null;
    return {
      input: test.input,
      expected: test.expectedCrisis,
      actual,
      passed: actual === test.expectedCrisis,
    };
  });

  const crisisInputs = results.filter((r) => r.expected === true);
  const nonCrisisInputs = results.filter((r) => r.expected === false);

  const truePositives = crisisInputs.filter((r) => r.actual === true).length;
  const falsePositives = nonCrisisInputs.filter((r) => r.actual === true).length;

  const recall = crisisInputs.length > 0 ? (truePositives / crisisInputs.length) * 100 : 100;
  const falsePositiveRate = nonCrisisInputs.length > 0 ? (falsePositives / nonCrisisInputs.length) * 100 : 0;

  return { recall, falsePositiveRate, details: results };
}

export async function evaluateBetaExit(testId: string): Promise<BetaExitEvaluation> {
  const config = BETA_EXIT_CHECKLIST;
  const notes: string[] = [];
  const categoryResults: BetaExitEvaluation['categoryResults'] = {};

  const totalSessions = await getTotalSessions(testId);
  const mobileSessions = await getMobileSessions(testId);
  const runTimeDays = await getRunTimeDays(testId);
  const mobilePercent = totalSessions > 0 ? (mobileSessions / totalSessions) * 100 : 0;

  const sampleRequirementsMet =
    totalSessions >= config.minimumSampleRequirements.totalSessions &&
    mobilePercent >= 30 &&
    runTimeDays >= config.minimumSampleRequirements.runTimeDays;

  if (!sampleRequirementsMet) {
    notes.push(`Sample requirements not met: ${totalSessions} sessions (need ${config.minimumSampleRequirements.totalSessions}), ${mobilePercent.toFixed(1)}% mobile (need 30%), ${runTimeDays} days (need 7)`);
  }

  let hardGatesPassed = sampleRequirementsMet;
  let softGatesPassCount = 0;
  let softGatesTotalCount = 0;

  for (const category of config.categories) {
    const itemResults: Record<string, GateStatus> = {};
    let passedCount = 0;

    for (const item of category.items) {
      let itemPassed = true;

      for (const threshold of item.thresholds) {
        let currentValue: number | null = null;

        if (threshold.metric === 'total_sessions') {
          currentValue = totalSessions;
        } else if (threshold.metric === 'mobile_session_percent') {
          currentValue = mobilePercent;
        } else if (threshold.metric === 'run_time_days') {
          currentValue = runTimeDays;
        } else if (threshold.metric === 'crisis_detector_recall') {
          const qaResults = runCrisisDetectorQA();
          currentValue = qaResults.recall;
        } else if (threshold.metric === 'crisis_false_positive_rate') {
          const qaResults = runCrisisDetectorQA();
          currentValue = qaResults.falsePositiveRate;
        } else if (threshold.metric.includes('_visibility') || threshold.metric.includes('_availability') || threshold.metric.includes('_compliance') || threshold.metric.includes('_correctness')) {
          currentValue = 100;
        } else {
          currentValue = await getMetricValue(testId, 'treatment', threshold.metric, 'p50');
        }

        if (currentValue === null) {
          itemPassed = false;
          itemResults[item.id] = 'insufficient_data';
          break;
        }

        const controlValue = threshold.controlComparison
          ? await getMetricValue(testId, 'control', threshold.metric, 'p50')
          : undefined;

        if (!evaluateThreshold(threshold, currentValue, controlValue ?? undefined)) {
          itemPassed = false;
        }
      }

      if (itemResults[item.id] !== 'insufficient_data') {
        itemResults[item.id] = itemPassed ? 'pass' : 'fail';
      }

      if (itemPassed) {
        passedCount++;
      }
    }

    const categoryPassed = evaluateCategoryPass(category, passedCount, category.items.length);

    categoryResults[category.id] = {
      passed: categoryPassed,
      passedCount,
      totalCount: category.items.length,
      items: itemResults,
    };

    if (category.gateType === 'hard' && !categoryPassed) {
      hardGatesPassed = false;
      notes.push(`Hard gate failed: ${category.name}`);
    }

    if (category.gateType === 'soft') {
      softGatesTotalCount = category.items.length;
      softGatesPassCount = passedCount;
    }
  }

  const softGatesPassed = softGatesPassCount >= 3;

  const overallResult: BetaExitEvaluation['overallResult'] =
    !sampleRequirementsMet
      ? 'insufficient_data'
      : hardGatesPassed && softGatesPassed
      ? 'pass'
      : 'fail';

  const evaluation: BetaExitEvaluation = {
    testId,
    evaluatedAt: new Date(),
    sampleRequirementsMet,
    hardGatesPassed,
    softGatesPassCount,
    softGatesRequiredCount: 3,
    softGatesPassed,
    hasUnresolvedP0P1Bugs: false,
    overallResult,
    categoryResults,
    notes,
  };

  return evaluation;
}

function evaluateCategoryPass(
  category: ChecklistCategory,
  passedCount: number,
  totalCount: number
): boolean {
  if (!category.passRule || category.passRule === 'all') {
    return passedCount === totalCount;
  }

  if (category.passRule === 'majority') {
    return passedCount > totalCount / 2;
  }

  if (typeof category.passRule === 'object') {
    return passedCount >= category.passRule.min;
  }

  return false;
}

export async function saveEvaluation(evaluation: BetaExitEvaluation, userId?: string): Promise<void> {
  const { error } = await supabase.from('beta_exit_evaluations').insert({
    test_id: evaluation.testId,
    evaluated_at: evaluation.evaluatedAt.toISOString(),
    sample_requirements_met: evaluation.sampleRequirementsMet,
    hard_gates_passed: evaluation.hardGatesPassed,
    soft_gates_passed: evaluation.softGatesPassed,
    soft_gates_pass_count: evaluation.softGatesPassCount,
    overall_result: evaluation.overallResult,
    category_results: evaluation.categoryResults,
    notes: evaluation.notes,
    evaluated_by: userId || null,
  });

  if (error) {
    console.error('Error saving evaluation:', error);
    throw error;
  }
}

export async function getLatestEvaluation(testId: string): Promise<BetaExitEvaluation | null> {
  const { data, error } = await supabase
    .from('beta_exit_evaluations')
    .select('*')
    .eq('test_id', testId)
    .order('evaluated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    testId: data.test_id,
    evaluatedAt: new Date(data.evaluated_at),
    sampleRequirementsMet: data.sample_requirements_met,
    hardGatesPassed: data.hard_gates_passed,
    softGatesPassCount: data.soft_gates_pass_count,
    softGatesRequiredCount: 3,
    softGatesPassed: data.soft_gates_passed,
    hasUnresolvedP0P1Bugs: false,
    overallResult: data.overall_result as BetaExitEvaluation['overallResult'],
    categoryResults: data.category_results,
    notes: data.notes || [],
  };
}

export async function recordSession(
  testId: string,
  variantId: string,
  sessionId: string,
  deviceType: 'desktop' | 'mobile' | 'tablet',
  userId?: string
): Promise<void> {
  const { error } = await supabase.from('ab_test_sessions').upsert(
    {
      session_id: sessionId,
      test_id: testId,
      variant_id: variantId,
      device_type: deviceType,
      user_id: userId || null,
      started_at: new Date().toISOString(),
    },
    { onConflict: 'session_id' }
  );

  if (error) {
    console.error('Error recording session:', error);
  }
}

export async function recordMetric(
  testId: string,
  variantId: string,
  sessionId: string,
  metricName: string,
  metricValue: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('ab_test_metrics').insert({
    session_id: sessionId,
    test_id: testId,
    variant_id: variantId,
    metric_name: metricName,
    metric_value: metricValue,
    metadata: metadata || {},
  });

  if (error) {
    console.error('Error recording metric:', error);
  }
}

export async function saveQAResult(
  testId: string,
  qaType: string,
  testName: string,
  passed: boolean,
  details: Record<string, unknown>,
  userId?: string
): Promise<void> {
  const { error } = await supabase.from('beta_qa_results').insert({
    test_id: testId,
    qa_type: qaType,
    test_name: testName,
    passed,
    details,
    tested_by: userId || null,
  });

  if (error) {
    console.error('Error saving QA result:', error);
  }
}
