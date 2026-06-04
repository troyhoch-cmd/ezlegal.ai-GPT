import { supabase } from '../lib/supabase';

export interface CaseMatchingInput {
  organizationId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCounty?: string;
  clientZipCode?: string;
  preferredLanguage?: string;
  caseType: string;
  caseSubcategory?: string;
  caseDescription: string;
  urgencyLevel: 'critical' | 'high' | 'normal' | 'low';
  deadlineDate?: string;
  courtDate?: string;
  hasDocumentation: boolean;
  documentationQuality: 'none' | 'partial' | 'complete' | 'excellent';
  hasOpposingCounsel: boolean;
  incomeAmount?: number;
  householdSize?: number;
}

export interface MatchResult {
  matchId: string;
  attorneyId: string;
  attorneyName: string;
  confidenceScore: number;
  rankPosition: number;
  expertiseScore?: number;
  availabilityScore?: number;
  factors?: Record<string, unknown>;
}

export interface CaseQueueItem {
  id: string;
  organizationId: string;
  caseType: string;
  urgencyLevel: string;
  complexityScore: number;
  matchingStatus: string;
  assignedAttorneyId?: string;
  createdAt: string;
  aiRecommendedPracticeAreas?: string[];
}

export interface AttorneyProfile {
  id: string;
  attorneyId: string;
  name: string;
  email: string;
  practiceAreas: string[];
  expertiseScores: Record<string, number>;
  currentCaseCount: number;
  maxCaseCapacity: number;
  availabilityStatus: string;
  overallMatchScore: number;
  successRate: number;
  languages: string[];
  preferredCounties: string[];
}

const CASE_TYPES = [
  { value: 'housing', label: 'Housing & Eviction' },
  { value: 'family', label: 'Family Law' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'employment', label: 'Employment & Wages' },
  { value: 'consumer', label: 'Consumer & Debt' },
  { value: 'benefits', label: 'Public Benefits' },
  { value: 'criminal', label: 'Criminal Defense' },
  { value: 'elder', label: 'Elder Law' },
  { value: 'disability', label: 'Disability Rights' },
  { value: 'healthcare', label: 'Healthcare Access' },
  { value: 'education', label: 'Education Law' },
  { value: 'veterans', label: 'Veterans Benefits' },
  { value: 'tribal', label: 'Tribal Law' },
  { value: 'other', label: 'Other Legal Issue' },
];

export const getCaseTypes = () => CASE_TYPES;

export function calculateComplexityScore(input: CaseMatchingInput): number {
  let score = 50;

  if (input.urgencyLevel === 'critical') score += 20;
  else if (input.urgencyLevel === 'high') score += 10;
  else if (input.urgencyLevel === 'low') score -= 10;

  if (input.hasOpposingCounsel) score += 15;
  if (input.courtDate) score += 10;
  if (input.documentationQuality === 'none') score += 10;
  else if (input.documentationQuality === 'excellent') score -= 10;

  const complexCaseTypes = ['immigration', 'family', 'criminal'];
  if (complexCaseTypes.includes(input.caseType)) score += 10;

  return Math.min(100, Math.max(0, score));
}

export function calculatePovertyPercentage(income: number, householdSize: number): number {
  const povertyGuidelines2026: Record<number, number> = {
    1: 15060,
    2: 20440,
    3: 25820,
    4: 31200,
    5: 36580,
    6: 41960,
    7: 47340,
    8: 52720,
  };

  const baseAmount = povertyGuidelines2026[Math.min(householdSize, 8)] || 52720;
  const additionalPerPerson = 5380;

  let povertyLine = baseAmount;
  if (householdSize > 8) {
    povertyLine += (householdSize - 8) * additionalPerPerson;
  }

  return Math.round((income / povertyLine) * 100);
}

export function analyzeCase(input: CaseMatchingInput): {
  recommendedPracticeAreas: string[];
  estimatedHours: number;
  riskAssessment: string;
  aiAnalysis: Record<string, unknown>;
} {
  const recommendedPracticeAreas = [input.caseType];

  if (input.caseType === 'housing' && input.hasOpposingCounsel) {
    recommendedPracticeAreas.push('civil_litigation');
  }
  if (input.caseType === 'family' && input.courtDate) {
    recommendedPracticeAreas.push('court_representation');
  }
  if (input.preferredLanguage && input.preferredLanguage !== 'en') {
    recommendedPracticeAreas.push('multilingual');
  }

  let estimatedHours = 10;
  const complexityScore = calculateComplexityScore(input);
  if (complexityScore > 70) estimatedHours = 25;
  else if (complexityScore > 50) estimatedHours = 15;

  let riskAssessment = 'moderate';
  if (input.urgencyLevel === 'critical' || input.courtDate) {
    riskAssessment = 'high';
  } else if (input.documentationQuality === 'excellent' && !input.hasOpposingCounsel) {
    riskAssessment = 'low';
  }

  const aiAnalysis = {
    caseStrength: input.hasDocumentation ? 'good' : 'needs_documentation',
    timelinePressure: input.courtDate ? 'urgent' : 'flexible',
    resourceNeeds: estimatedHours > 20 ? 'intensive' : 'standard',
    specialConsiderations: [] as string[],
  };

  if (input.preferredLanguage !== 'en') {
    (aiAnalysis.specialConsiderations as string[]).push('interpreter_needed');
  }
  if (input.hasOpposingCounsel) {
    (aiAnalysis.specialConsiderations as string[]).push('opposing_counsel_present');
  }

  return {
    recommendedPracticeAreas,
    estimatedHours,
    riskAssessment,
    aiAnalysis,
  };
}

export async function submitCaseForMatching(input: CaseMatchingInput): Promise<{
  success: boolean;
  caseId?: string;
  error?: string;
}> {
  const complexityScore = calculateComplexityScore(input);
  const analysis = analyzeCase(input);

  let povertyPercentage: number | undefined;
  if (input.incomeAmount && input.householdSize) {
    povertyPercentage = calculatePovertyPercentage(input.incomeAmount, input.householdSize);
  }

  const { data, error } = await supabase
    .from('case_matching_queue')
    .insert({
      organization_id: input.organizationId,
      source_type: 'manual',
      client_name: input.clientName,
      client_email: input.clientEmail,
      client_phone: input.clientPhone,
      client_county: input.clientCounty,
      client_zip_code: input.clientZipCode,
      preferred_language: input.preferredLanguage || 'en',
      case_type: input.caseType,
      case_subcategory: input.caseSubcategory,
      case_description: input.caseDescription,
      urgency_level: input.urgencyLevel,
      complexity_score: complexityScore,
      deadline_date: input.deadlineDate,
      court_date: input.courtDate,
      has_documentation: input.hasDocumentation,
      documentation_quality: input.documentationQuality,
      has_opposing_counsel: input.hasOpposingCounsel,
      income_amount: input.incomeAmount,
      household_size: input.householdSize,
      poverty_percentage: povertyPercentage,
      income_eligible: povertyPercentage ? povertyPercentage <= 200 : null,
      ai_case_analysis: analysis.aiAnalysis,
      ai_recommended_practice_areas: analysis.recommendedPracticeAreas,
      ai_estimated_hours: analysis.estimatedHours,
      ai_risk_assessment: analysis.riskAssessment,
      matching_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, caseId: data.id };
}

export async function runAIMatching(caseId: string): Promise<{
  success: boolean;
  matches?: MatchResult[];
  error?: string;
}> {
  const { data, error } = await supabase
    .rpc('run_case_matching', { p_case_id: caseId });

  if (error) {
    return { success: false, error: error.message };
  }

  const matches: MatchResult[] = (data || []).map((row: Record<string, unknown>) => ({
    matchId: row.match_id as string,
    attorneyId: row.attorney_id as string,
    attorneyName: row.attorney_name as string,
    confidenceScore: row.confidence_score as number,
    rankPosition: row.rank_position as number,
  }));

  return { success: true, matches };
}

export async function getCaseQueue(organizationId: string): Promise<{
  success: boolean;
  cases?: CaseQueueItem[];
  error?: string;
}> {
  const { data, error } = await supabase
    .from('case_matching_queue')
    .select('id, organization_id, case_type, urgency_level, complexity_score, matching_status, assigned_attorney_id, created_at, ai_recommended_practice_areas')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  const cases: CaseQueueItem[] = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    organizationId: row.organization_id as string,
    caseType: row.case_type as string,
    urgencyLevel: row.urgency_level as string,
    complexityScore: row.complexity_score as number,
    matchingStatus: row.matching_status as string,
    assignedAttorneyId: row.assigned_attorney_id as string | undefined,
    createdAt: row.created_at as string,
    aiRecommendedPracticeAreas: row.ai_recommended_practice_areas as string[] | undefined,
  }));

  return { success: true, cases };
}

export async function getCaseMatches(caseId: string): Promise<{
  success: boolean;
  matches?: MatchResult[];
  error?: string;
}> {
  const { data, error } = await supabase
    .from('case_matches')
    .select(`
      id,
      attorney_id,
      overall_confidence_score,
      expertise_match_score,
      availability_match_score,
      geographic_match_score,
      workload_match_score,
      language_match_score,
      rank_position,
      status,
      match_factors,
      lso_volunteer_attorneys!inner(name, email)
    `)
    .eq('case_id', caseId)
    .order('rank_position', { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  const matches: MatchResult[] = (data || []).map((row: Record<string, unknown>) => {
    const attorney = row.lso_volunteer_attorneys as Record<string, unknown>;
    return {
      matchId: row.id as string,
      attorneyId: row.attorney_id as string,
      attorneyName: attorney?.name as string || 'Unknown',
      confidenceScore: row.overall_confidence_score as number,
      rankPosition: row.rank_position as number,
      expertiseScore: row.expertise_match_score as number,
      availabilityScore: row.availability_match_score as number,
      factors: row.match_factors as Record<string, unknown>,
    };
  });

  return { success: true, matches };
}

export async function acceptMatch(matchId: string, response?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const { data, error } = await supabase
    .rpc('accept_case_match', {
      p_match_id: matchId,
      p_response: response
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: data === true };
}

export async function declineMatch(matchId: string, reason?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const { data, error } = await supabase
    .rpc('decline_case_match', {
      p_match_id: matchId,
      p_reason: reason
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: data === true };
}

export async function getAttorneyProfiles(organizationId: string): Promise<{
  success: boolean;
  attorneys?: AttorneyProfile[];
  error?: string;
}> {
  const { data, error } = await supabase
    .from('attorney_matching_profiles')
    .select(`
      *,
      lso_volunteer_attorneys!inner(name, email, practice_areas, availability_status)
    `)
    .eq('organization_id', organizationId);

  if (error) {
    return { success: false, error: error.message };
  }

  const attorneys: AttorneyProfile[] = (data || []).map((row: Record<string, unknown>) => {
    const attorney = row.lso_volunteer_attorneys as Record<string, unknown>;
    return {
      id: row.id as string,
      attorneyId: row.attorney_id as string,
      name: attorney?.name as string || 'Unknown',
      email: attorney?.email as string || '',
      practiceAreas: (attorney?.practice_areas as string[]) || [],
      expertiseScores: (row.expertise_scores as Record<string, number>) || {},
      currentCaseCount: row.current_case_count as number,
      maxCaseCapacity: row.max_case_capacity as number,
      availabilityStatus: attorney?.availability_status as string || 'unknown',
      overallMatchScore: row.overall_match_score as number,
      successRate: (row.success_rate as number) || 0,
      languages: (row.languages as string[]) || ['en'],
      preferredCounties: (row.preferred_counties as string[]) || [],
    };
  });

  return { success: true, attorneys };
}

export async function submitMatchFeedback(
  matchId: string,
  feedback: {
    overallSatisfaction: number;
    matchQualityRating: number;
    wasGoodMatch: boolean;
    feedbackText?: string;
    improvementSuggestions?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('match_feedback')
    .insert({
      match_id: matchId,
      feedback_type: 'staff',
      overall_satisfaction: feedback.overallSatisfaction,
      match_quality_rating: feedback.matchQualityRating,
      was_good_match: feedback.wasGoodMatch,
      feedback_text: feedback.feedbackText,
      improvement_suggestions: feedback.improvementSuggestions,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Analytics: returns aggregate counts only. Never includes client names, narratives, phone, email, address, or case facts.
export async function getMatchingStats(organizationId: string): Promise<{
  success: boolean;
  stats?: {
    totalCases: number;
    pendingCases: number;
    matchedCases: number;
    avgConfidenceScore: number;
    matchAccuracyRate: number;
    avgTimeToMatch: number;
  };
  error?: string;
}> {
  const { data: queueData } = await supabase
    .from('case_matching_queue')
    .select('id, matching_status, created_at, assigned_at')
    .eq('organization_id', organizationId);

  const { data: matchData } = await supabase
    .from('case_matches')
    .select('overall_confidence_score, status')
    .eq('organization_id', organizationId);

  const { data: feedbackData } = await supabase
    .from('match_feedback')
    .select('was_good_match')
    .eq('organization_id', organizationId);

  const cases = queueData || [];
  const matches = matchData || [];
  const feedback = feedbackData || [];

  const totalCases = cases.length;
  const pendingCases = cases.filter((c: Record<string, unknown>) => c.matching_status === 'pending').length;
  const matchedCases = cases.filter((c: Record<string, unknown>) => c.matching_status === 'matched').length;

  const acceptedMatches = matches.filter((m: Record<string, unknown>) => m.status === 'accepted');
  const avgConfidenceScore = acceptedMatches.length > 0
    ? Math.round(acceptedMatches.reduce((sum: number, m: Record<string, unknown>) => sum + (m.overall_confidence_score as number), 0) / acceptedMatches.length)
    : 0;

  const goodFeedback = feedback.filter((f: Record<string, unknown>) => f.was_good_match === true).length;
  const matchAccuracyRate = feedback.length > 0
    ? Math.round((goodFeedback / feedback.length) * 100)
    : 0;

  const matchedWithTime = cases.filter((c: Record<string, unknown>) => c.assigned_at && c.created_at);
  const avgTimeToMatch = matchedWithTime.length > 0
    ? Math.round(matchedWithTime.reduce((sum: number, c: Record<string, unknown>) => {
        const created = new Date(c.created_at as string);
        const assigned = new Date(c.assigned_at as string);
        return sum + (assigned.getTime() - created.getTime()) / (1000 * 60 * 60);
      }, 0) / matchedWithTime.length)
    : 0;

  return {
    success: true,
    stats: {
      totalCases,
      pendingCases,
      matchedCases,
      avgConfidenceScore,
      matchAccuracyRate,
      avgTimeToMatch,
    },
  };
}
