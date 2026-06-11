const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const USE_EDGE_FUNCTION = true;

interface ChatRequest {
  query: string;
  sessionId: string;
  tenantId: string;
  jurisdiction?: string;
  category?: string;
  subcategory?: string;
  includeCompliance?: boolean;
}

interface OutcomePredictionRequest {
  caseId?: string;
  caseSource?: 'lso_client_intakes' | 'pro_bono_applications' | 'cases';
  tenantId?: string;
  caseData?: {
    caseType: string;
    jurisdiction: string;
    urgencyLevel: string;
    incomeEligible: boolean;
    hasDocumentation: boolean;
    documentationQuality: 'none' | 'partial' | 'complete' | 'excellent';
    hasOpposingCounsel: boolean;
    attorneySpecialtyMatch: boolean;
    attorneyYearsExperience: number;
    caseComplexity?: 'simple' | 'medium' | 'complex' | 'very_complex';
    householdSize?: number;
    issueDescription?: string;
  };
}

interface PredictionFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

interface OutcomePredictionResponse {
  prediction: {
    score: number;
    confidence: 'low' | 'medium' | 'high';
    predictedOutcome: 'favorable' | 'unfavorable' | 'likely_settled' | 'uncertain';
    factors: PredictionFactor[];
    recommendations: string[];
  };
  modelInfo: {
    version: string;
    overallAccuracy: number;
    caseTypeAccuracy: number | null;
  };
  tenantId: string;
}

interface ChatResponse {
  response: string;
  citations: Citation[];
  complianceManifest?: ComplianceManifest;
  enforcementScore?: number;
  modelUsed?: string;
}

interface Citation {
  source: string;
  title: string;
  authorityType: 'statute' | 'case_law' | 'regulation' | 'secondary';
  jurisdiction: string;
  url?: string;
  excerpt?: string;
  recency?: string;
}

interface ComplianceManifest {
  jurisdictionValidated: boolean;
  citationComplete: boolean;
  biasScreened: boolean;
  provenanceHash: string;
  enforcementScore: number;
  auditTrailId: string;
}

interface DocumentAnalysisRequest {
  document: File | string;
  analysisType: 'summarize' | 'extract_terms' | 'check_enforceability' | 'identify_risks';
  tenantId: string;
  jurisdiction?: string;
}

interface DocumentAnalysisResponse {
  summary?: string;
  extractedTerms?: string[];
  enforcementIssues?: string[];
  risks?: RiskItem[];
  complianceScore?: number;
}

interface RiskItem {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  clause?: string;
  recommendation?: string;
}

class LegalbreezeAPI {
  private tenantId: string;
  private apiUrl: string;

  constructor(tenantId: string = 'ezlegal') {
    this.tenantId = tenantId;
    this.apiUrl = `${SUPABASE_URL}/functions/v1`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiUrl}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Tenant-ID': this.tenantId,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private async requestEdgeFunction<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
    const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Tenant-ID': this.tenantId,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Edge function error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    if (USE_EDGE_FUNCTION) {
      return this.requestEdgeFunction<ChatResponse>('legalbreeze-rag', {
        query: request.query,
        sessionId: request.sessionId,
        jurisdiction: request.jurisdiction,
        category: request.category,
        subcategory: request.subcategory,
        includeCompliance: request.includeCompliance,
      });
    }

    const url = `https://legalbreeze.com/slim-api/data/chat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId,
      },
      body: JSON.stringify({
        ...request,
        tenantId: this.tenantId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Legalbreeze API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResponse> {
    if (request.document instanceof File) {
      const formData = new FormData();
      formData.append('document', request.document);
      formData.append('analysisType', request.analysisType);
      formData.append('tenantId', this.tenantId);
      if (request.jurisdiction) {
        formData.append('jurisdiction', request.jurisdiction);
      }

      const response = await fetch(`${this.apiUrl}/document/analyze`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': this.tenantId,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Document analysis failed: ${response.status}`);
      }

      return response.json();
    }

    return this.request<DocumentAnalysisResponse>('document/analyze', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        tenantId: this.tenantId,
      }),
    });
  }

  async getPromptTaxonomy(): Promise<{ categories: string[]; subcategories: Record<string, string[]> }> {
    return this.request('taxonomy');
  }

  async validateJurisdiction(query: string, jurisdiction: string): Promise<{
    isValid: boolean;
    warnings: string[];
    suggestedJurisdiction?: string;
  }> {
    return this.request('validate/jurisdiction', {
      method: 'POST',
      body: JSON.stringify({ query, jurisdiction }),
    });
  }

  async getComplianceReport(auditTrailId: string): Promise<{
    timestamp: string;
    query: string;
    response: string;
    citations: Citation[];
    complianceChecks: {
      name: string;
      passed: boolean;
      details: string;
    }[];
    provenanceChain: string[];
  }> {
    return this.request(`compliance/report/${auditTrailId}`);
  }

  setTenant(tenantId: string): void {
    this.tenantId = tenantId;
  }

  async predictOutcome(request: OutcomePredictionRequest): Promise<OutcomePredictionResponse> {
    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/outcome-prediction`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Tenant-ID': this.tenantId,
      },
      body: JSON.stringify({
        ...request,
        tenantId: this.tenantId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Outcome prediction failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async predictOutcomeFromCaseData(caseData: OutcomePredictionRequest['caseData']): Promise<OutcomePredictionResponse> {
    return this.predictOutcome({ caseData });
  }

  async predictOutcomeForCase(
    caseId: string,
    caseSource: 'lso_client_intakes' | 'pro_bono_applications' | 'cases'
  ): Promise<OutcomePredictionResponse> {
    return this.predictOutcome({ caseId, caseSource });
  }

  async getModelPerformance(): Promise<{
    version: string;
    accuracy: number;
    byCaseType: Record<string, number>;
    totalPredictions: number;
  }> {
    return this.request('prediction/model-performance');
  }
}

export const legalbreezeAPI = new LegalbreezeAPI();

export type {
  ChatRequest,
  ChatResponse,
  Citation,
  ComplianceManifest,
  DocumentAnalysisRequest,
  DocumentAnalysisResponse,
  RiskItem,
  OutcomePredictionRequest,
  OutcomePredictionResponse,
  PredictionFactor,
};
