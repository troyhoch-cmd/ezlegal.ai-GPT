import { supabase } from '../lib/supabase';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DocumentContext {
  filename: string;
  extractedText: string;
  documentType?: string;
}

export interface ExtractedCaseContext {
  caseType: string;
  caseSubtype?: string;
  jurisdiction: string;
  parties: {
    plaintiff?: string;
    defendant?: string;
    insurer?: string;
    claimant?: string;
  };
  keyDates: {
    incidentDate?: string;
    filingDate?: string;
    deadlines?: string[];
  };
  keyFacts: string[];
  legalIssues: string[];
  documentTypes: string[];
  claimAmount?: number;
  policyLimits?: number;
  coverageIssues?: string[];
  strengthFactors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; reasoning: string }[];
  confidence: number;
}

export interface LegalCitation {
  section: string;
  title: string;
  summary: string;
  relevance: string;
  supportsFavorable: boolean;
  url?: string;
}

export interface ContextualPrediction {
  score: number;
  confidence: 'low' | 'medium' | 'high';
  predictedOutcome: 'favorable' | 'unfavorable' | 'likely_settled' | 'uncertain';
  reasoning: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  criticalQuestions: string[];
  recommendations: string[];
  nextSteps: { action: string; urgency: 'immediate' | 'soon' | 'when_ready'; description: string }[];
  comparableCasesSummary: string;
  legalCitations: LegalCitation[];
  extractedContext: ExtractedCaseContext;
}

const CASE_TYPE_PATTERNS: Record<string, { keywords: string[]; subTypes: string[] }> = {
  insurance: {
    keywords: ['policy', 'coverage', 'claim', 'insurer', 'premium', 'deductible', 'reservation of rights', 'denial', 'homeowner', 'auto insurance', 'liability', 'underwriting', 'exclusion', 'endorsement'],
    subTypes: ['coverage_dispute', 'bad_faith', 'claim_denial', 'underinsured', 'subrogation']
  },
  personal_injury: {
    keywords: ['injury', 'accident', 'negligence', 'damages', 'medical bills', 'pain and suffering', 'liability', 'tort'],
    subTypes: ['auto_accident', 'slip_fall', 'medical_malpractice', 'product_liability', 'premises_liability']
  },
  employment: {
    keywords: ['termination', 'discrimination', 'harassment', 'wrongful', 'employer', 'employee', 'wage', 'overtime', 'retaliation'],
    subTypes: ['wrongful_termination', 'discrimination', 'harassment', 'wage_dispute', 'retaliation']
  },
  contract: {
    keywords: ['breach', 'agreement', 'contract', 'performance', 'damages', 'consideration', 'obligation'],
    subTypes: ['breach', 'formation', 'interpretation', 'rescission', 'specific_performance']
  },
  housing: {
    keywords: ['landlord', 'tenant', 'eviction', 'lease', 'rent', 'security deposit', 'habitability', 'repairs'],
    subTypes: ['eviction', 'habitability', 'security_deposit', 'discrimination', 'lease_dispute']
  },
  family: {
    keywords: ['divorce', 'custody', 'child support', 'alimony', 'visitation', 'paternity', 'adoption'],
    subTypes: ['divorce', 'custody', 'support', 'adoption', 'domestic_violence']
  },
  consumer: {
    keywords: ['debt', 'collection', 'credit', 'fraud', 'consumer protection', 'warranty', 'lemon law'],
    subTypes: ['debt_collection', 'fraud', 'warranty', 'lemon_law', 'identity_theft']
  },
};

const JURISDICTION_PATTERNS = [
  { pattern: /arizona|az|maricopa|pima|pinal|coconino|yavapai|mohave|yuma|cochise|navajo|apache|gila|graham|greenlee|la paz|santa cruz/i, code: 'AZ', name: 'Arizona' },
  { pattern: /california|ca|los angeles|san francisco|san diego|sacramento/i, code: 'CA', name: 'California' },
  { pattern: /texas|tx|houston|dallas|austin|san antonio/i, code: 'TX', name: 'Texas' },
  { pattern: /florida|fl|miami|orlando|tampa|jacksonville/i, code: 'FL', name: 'Florida' },
  { pattern: /new york|ny|manhattan|brooklyn|bronx|queens/i, code: 'NY', name: 'New York' },
  { pattern: /nevada|nv|las vegas|reno|clark county/i, code: 'NV', name: 'Nevada' },
  { pattern: /colorado|co|denver|boulder|colorado springs/i, code: 'CO', name: 'Colorado' },
  { pattern: /utah|ut|salt lake/i, code: 'UT', name: 'Utah' },
  { pattern: /new mexico|nm|albuquerque|santa fe/i, code: 'NM', name: 'New Mexico' },
];

class ContextualPredictionService {
  async extractCaseContext(
    chatMessages: ChatMessage[],
    documents: DocumentContext[]
  ): Promise<ExtractedCaseContext> {
    const allText = [
      ...chatMessages.map(m => m.content),
      ...documents.map(d => d.extractedText)
    ].join('\n\n');

    const caseType = this.detectCaseType(allText);
    const jurisdiction = this.detectJurisdiction(allText);
    const parties = this.extractParties(allText);
    const keyFacts = this.extractKeyFacts(allText, caseType);
    const legalIssues = this.extractLegalIssues(allText, caseType);
    const documentTypes = this.detectDocumentTypes(documents);
    const strengthFactors = this.analyzeStrengthFactors(allText, caseType, documentTypes);
    const financials = this.extractFinancials(allText);

    const confidence = this.calculateExtractionConfidence(
      caseType,
      jurisdiction,
      keyFacts.length,
      documentTypes.length
    );

    return {
      caseType: caseType.type,
      caseSubtype: caseType.subType,
      jurisdiction: jurisdiction.code,
      parties,
      keyDates: this.extractDates(allText),
      keyFacts,
      legalIssues,
      documentTypes,
      claimAmount: financials.claimAmount,
      policyLimits: financials.policyLimits,
      coverageIssues: caseType.type === 'insurance' ? this.extractCoverageIssues(allText) : undefined,
      strengthFactors,
      confidence
    };
  }

  private detectCaseType(text: string): { type: string; subType?: string } {
    const lowerText = text.toLowerCase();
    const scores: Record<string, number> = {};

    for (const [caseType, config] of Object.entries(CASE_TYPE_PATTERNS)) {
      scores[caseType] = 0;
      for (const keyword of config.keywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          scores[caseType] += matches.length * (keyword.length > 10 ? 3 : 1);
        }
      }
    }

    const sortedTypes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (sortedTypes[0][1] === 0) {
      return { type: 'general' };
    }

    const topType = sortedTypes[0][0];
    const config = CASE_TYPE_PATTERNS[topType];

    let subType: string | undefined;
    if (config.subTypes.length > 0) {
      for (const st of config.subTypes) {
        const stKeywords = st.replace(/_/g, ' ');
        if (lowerText.includes(stKeywords)) {
          subType = st;
          break;
        }
      }
    }

    return { type: topType, subType };
  }

  private detectJurisdiction(text: string): { code: string; name: string } {
    for (const jur of JURISDICTION_PATTERNS) {
      if (jur.pattern.test(text)) {
        return { code: jur.code, name: jur.name };
      }
    }
    return { code: 'AZ', name: 'Arizona' };
  }

  private extractParties(text: string): ExtractedCaseContext['parties'] {
    const parties: ExtractedCaseContext['parties'] = {};

    const plaintiffMatch = text.match(/plaintiff[:\s]+([A-Z][a-zA-Z\s,]+?)(?:\n|,|v\.|vs)/i);
    if (plaintiffMatch) parties.plaintiff = plaintiffMatch[1].trim();

    const defendantMatch = text.match(/defendant[:\s]+([A-Z][a-zA-Z\s,]+?)(?:\n|,|$)/i);
    if (defendantMatch) parties.defendant = defendantMatch[1].trim();

    const insurerPatterns = [
      /insured by[:\s]+([A-Z][a-zA-Z\s]+(?:Insurance|Mutual|Indemnity|Company)?)/i,
      /policy.*?(?:with|from)[:\s]+([A-Z][a-zA-Z\s]+(?:Insurance|Mutual|Company)?)/i,
      /(Farm Bureau|State Farm|Allstate|GEICO|Progressive|USAA|Liberty Mutual|Nationwide)[^,\n]*/i
    ];
    for (const pattern of insurerPatterns) {
      const match = text.match(pattern);
      if (match) {
        parties.insurer = match[1].trim();
        break;
      }
    }

    return parties;
  }

  private extractKeyFacts(text: string, caseType: { type: string }): string[] {
    const facts: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

    const factPatterns: Record<string, RegExp[]> = {
      insurance: [
        /policy.*?(?:covers|excludes|provides)/i,
        /claim.*?(?:denied|approved|pending)/i,
        /coverage.*?(?:limits?|amount|extent)/i,
        /reservation of rights/i,
        /bad faith/i,
        /damages.*?(?:caused|resulted)/i,
      ],
      personal_injury: [
        /(?:injury|injuries).*?(?:sustained|suffered)/i,
        /medical.*?(?:treatment|bills|expenses)/i,
        /accident.*?(?:occurred|happened)/i,
        /negligent|negligence/i,
      ],
      employment: [
        /termination|terminated/i,
        /discrimination|discriminated/i,
        /harassment/i,
        /retaliation/i,
      ],
      general: [
        /caused|resulted in/i,
        /agreement|contract/i,
        /breach|violation/i,
      ]
    };

    const patterns = factPatterns[caseType.type] || factPatterns.general;

    for (const sentence of sentences.slice(0, 100)) {
      for (const pattern of patterns) {
        if (pattern.test(sentence) && facts.length < 10) {
          const cleanFact = sentence.trim().replace(/\s+/g, ' ');
          if (cleanFact.length < 300 && !facts.includes(cleanFact)) {
            facts.push(cleanFact);
          }
          break;
        }
      }
    }

    return facts;
  }

  private extractLegalIssues(text: string, caseType: { type: string; subType?: string }): string[] {
    const issues: string[] = [];
    const lowerText = text.toLowerCase();

    const issuePatterns: Record<string, string[]> = {
      insurance: [
        'Whether coverage exists under the policy',
        'Bad faith claim handling',
        'Policy exclusion applicability',
        'Duty to defend vs. duty to indemnify',
        'Reservation of rights validity',
        'Coverage limits dispute',
        'Subrogation rights',
      ],
      personal_injury: [
        'Establishing negligence',
        'Causation of injuries',
        'Damages calculation',
        'Comparative fault',
        'Statute of limitations',
      ],
      employment: [
        'Wrongful termination claim',
        'Discrimination under Title VII/state law',
        'Retaliation claim',
        'Wage and hour violations',
        'Hostile work environment',
      ],
      housing: [
        'Lease violation',
        'Habitability issues',
        'Security deposit return',
        'Eviction defense',
        'Fair housing violations',
      ],
    };

    const relevantIssues = issuePatterns[caseType.type] || [];

    for (const issue of relevantIssues) {
      const keywords = issue.toLowerCase().split(/\s+/);
      const matchCount = keywords.filter(k => lowerText.includes(k)).length;
      if (matchCount >= Math.min(2, keywords.length / 2)) {
        issues.push(issue);
      }
    }

    if (caseType.type === 'insurance') {
      if (lowerText.includes('reservation of rights')) {
        issues.push('Insurer has reserved rights - potential coverage dispute');
      }
      if (lowerText.includes('exclusion')) {
        issues.push('Policy exclusion defense may be raised');
      }
      if (lowerText.includes('bad faith')) {
        issues.push('Potential bad faith claim against insurer');
      }
    }

    return [...new Set(issues)].slice(0, 8);
  }

  private detectDocumentTypes(documents: DocumentContext[]): string[] {
    const types: string[] = [];

    for (const doc of documents) {
      const lowerText = doc.extractedText.toLowerCase();
      const filename = doc.filename.toLowerCase();

      if (lowerText.includes('policy') && (lowerText.includes('coverage') || lowerText.includes('premium'))) {
        types.push('Insurance Policy');
      }
      if (lowerText.includes('complaint') && (lowerText.includes('plaintiff') || lowerText.includes('defendant'))) {
        types.push('Complaint');
      }
      if (lowerText.includes('reservation of rights')) {
        types.push('Reservation of Rights Letter');
      }
      if (lowerText.includes('answer') && lowerText.includes('defendant')) {
        types.push('Answer');
      }
      if (lowerText.includes('motion') || lowerText.includes('memorandum')) {
        types.push('Motion/Brief');
      }
      if (filename.includes('contract') || lowerText.includes('agreement')) {
        types.push('Contract/Agreement');
      }
      if (lowerText.includes('demand') && lowerText.includes('settlement')) {
        types.push('Demand Letter');
      }
      if (lowerText.includes('medical') && lowerText.includes('record')) {
        types.push('Medical Records');
      }
    }

    return [...new Set(types)];
  }

  private extractDates(text: string): ExtractedCaseContext['keyDates'] {
    const dates: ExtractedCaseContext['keyDates'] = {};

    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/g;
    text.match(datePattern);

    const incidentPatterns = [
      /(?:incident|accident|occurred|happened).*?(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /on\s+(\w+\s+\d{1,2},?\s+\d{4})/i,
    ];
    for (const pattern of incidentPatterns) {
      const match = text.match(pattern);
      if (match) {
        dates.incidentDate = match[1];
        break;
      }
    }

    const filingMatch = text.match(/filed.*?(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (filingMatch) {
      dates.filingDate = filingMatch[1];
    }

    return dates;
  }

  private extractFinancials(text: string): { claimAmount?: number; policyLimits?: number } {
    const result: { claimAmount?: number; policyLimits?: number } = {};

    const amountPattern = /\$[\d,]+(?:\.\d{2})?/g;
    const amounts = text.match(amountPattern) || [];

    const cleanedAmounts = amounts
      .map(a => parseFloat(a.replace(/[$,]/g, '')))
      .filter(a => a > 0)
      .sort((a, b) => b - a);

    if (cleanedAmounts.length > 0) {
      const limitsMatch = text.match(/(?:policy\s+)?limits?.*?\$[\d,]+/i);
      if (limitsMatch) {
        const limitAmount = limitsMatch[0].match(/\$[\d,]+/);
        if (limitAmount) {
          result.policyLimits = parseFloat(limitAmount[0].replace(/[$,]/g, ''));
        }
      }

      const claimMatch = text.match(/(?:claim|damages|seeking|amount).*?\$[\d,]+/i);
      if (claimMatch) {
        const claimAmount = claimMatch[0].match(/\$[\d,]+/);
        if (claimAmount) {
          result.claimAmount = parseFloat(claimAmount[0].replace(/[$,]/g, ''));
        }
      }
    }

    return result;
  }

  private extractCoverageIssues(text: string): string[] {
    const issues: string[] = [];
    const lowerText = text.toLowerCase();

    const coveragePatterns = [
      { pattern: /excluded.*?coverage/i, issue: 'Coverage exclusion may apply' },
      { pattern: /reservation of rights/i, issue: 'Insurer reserving right to deny coverage' },
      { pattern: /policy\s+limit/i, issue: 'Policy limits may cap recovery' },
      { pattern: /late\s+notice/i, issue: 'Late notice defense possible' },
      { pattern: /misrepresentation/i, issue: 'Misrepresentation defense raised' },
      { pattern: /intentional\s+act/i, issue: 'Intentional act exclusion' },
      { pattern: /pre-?existing/i, issue: 'Pre-existing condition/damage issue' },
      { pattern: /not\s+covered|no\s+coverage/i, issue: 'Coverage denial' },
      { pattern: /duty\s+to\s+defend/i, issue: 'Duty to defend dispute' },
    ];

    for (const { pattern, issue } of coveragePatterns) {
      if (pattern.test(lowerText)) {
        issues.push(issue);
      }
    }

    return [...new Set(issues)];
  }

  private analyzeStrengthFactors(
    text: string,
    caseType: { type: string },
    documentTypes: string[]
  ): ExtractedCaseContext['strengthFactors'] {
    const factors: ExtractedCaseContext['strengthFactors'] = [];
    const lowerText = text.toLowerCase();

    if (documentTypes.includes('Insurance Policy')) {
      factors.push({
        factor: 'Policy documentation available',
        impact: 'positive',
        reasoning: 'Having the actual policy allows for precise coverage analysis'
      });
    }

    if (documentTypes.includes('Complaint')) {
      factors.push({
        factor: 'Formal complaint filed',
        impact: 'neutral',
        reasoning: 'Litigation has commenced - formal procedures apply'
      });
    }

    if (documentTypes.includes('Reservation of Rights Letter')) {
      factors.push({
        factor: 'Reservation of rights received',
        impact: 'negative',
        reasoning: 'Insurer may later deny coverage based on reserved issues'
      });
    }

    if (documentTypes.length >= 3) {
      factors.push({
        factor: 'Comprehensive documentation',
        impact: 'positive',
        reasoning: 'Multiple supporting documents strengthen the case'
      });
    }

    if (caseType.type === 'insurance') {
      if (lowerText.includes('bad faith')) {
        factors.push({
          factor: 'Bad faith allegations',
          impact: 'positive',
          reasoning: 'Bad faith claims can result in damages beyond policy limits'
        });
      }
      if (lowerText.includes('exclusion')) {
        factors.push({
          factor: 'Exclusion defense raised',
          impact: 'negative',
          reasoning: 'Insurer may avoid coverage through policy exclusions'
        });
      }
    }

    return factors;
  }

  private calculateExtractionConfidence(
    caseType: { type: string },
    jurisdiction: { code: string },
    factCount: number,
    docCount: number
  ): number {
    let confidence = 50;

    if (caseType.type !== 'general') confidence += 15;
    if (jurisdiction.code) confidence += 10;
    confidence += Math.min(factCount * 3, 15);
    confidence += Math.min(docCount * 5, 10);

    return Math.min(confidence, 95);
  }

  async generatePrediction(context: ExtractedCaseContext): Promise<ContextualPrediction> {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const legalCitations = await this.fetchRelevantCitations(context);

    try {
      const { data: session } = await supabase.auth.getSession();

      const prompt = this.buildPredictionPrompt(context, legalCitations);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.session?.access_token || SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          sessionId: crypto.randomUUID(),
          jurisdiction: context.jurisdiction,
          systemPromptOverride: this.getSystemPrompt(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return this.parseAIPrediction(data.response, context, legalCitations);
      }
    } catch (error) {
      console.error('AI prediction error:', error);
    }

    return this.generateLocalPrediction(context, legalCitations);
  }

  private async fetchRelevantCitations(context: ExtractedCaseContext): Promise<LegalCitation[]> {
    const citations: LegalCitation[] = [];

    if (context.jurisdiction !== 'AZ') {
      return this.getStaticCitationsForCaseType(context.caseType, context.jurisdiction);
    }

    try {
      const practiceAreas = this.mapCaseTypeToPracticeAreas(context.caseType);

      const { data: statutes, error } = await supabase
        .from('arizona_legal_sources')
        .select('section, section_title, summary, content, url, practice_areas')
        .eq('is_active', true)
        .overlaps('practice_areas', practiceAreas)
        .limit(10);

      if (!error && statutes && statutes.length > 0) {
        for (const statute of statutes) {
          const relevance = this.determineRelevance(statute, context);
          if (relevance) {
            citations.push({
              section: statute.section,
              title: statute.section_title,
              summary: statute.summary || statute.content?.substring(0, 200) + '...',
              relevance: relevance.explanation,
              supportsFavorable: relevance.supportsFavorable,
              url: statute.url
            });
          }
        }
      }

      if (citations.length === 0) {
        return this.getStaticCitationsForCaseType(context.caseType, context.jurisdiction);
      }
    } catch (error) {
      console.error('Error fetching citations:', error);
      return this.getStaticCitationsForCaseType(context.caseType, context.jurisdiction);
    }

    return citations.slice(0, 6);
  }

  private mapCaseTypeToPracticeAreas(caseType: string): string[] {
    const mapping: Record<string, string[]> = {
      insurance: ['insurance', 'contracts', 'bad faith', 'coverage'],
      personal_injury: ['torts', 'negligence', 'personal injury', 'damages'],
      employment: ['employment', 'labor', 'discrimination', 'wages'],
      housing: ['landlord-tenant', 'real property', 'housing', 'eviction'],
      contract: ['contracts', 'commercial', 'breach'],
      consumer: ['consumer protection', 'debt collection', 'fraud'],
      family: ['family law', 'divorce', 'custody', 'domestic relations'],
    };
    return mapping[caseType] || ['general'];
  }

  private determineRelevance(
    statute: { section: string; section_title: string; content?: string; practice_areas?: string[] },
    context: ExtractedCaseContext
  ): { explanation: string; supportsFavorable: boolean } | null {
    const content = (statute.content || '').toLowerCase();
    const title = statute.section_title.toLowerCase();

    if (context.caseType === 'insurance') {
      if (title.includes('bad faith') || content.includes('bad faith')) {
        return {
          explanation: 'Governs insurer duty of good faith and fair dealing',
          supportsFavorable: context.legalIssues.some(i => i.toLowerCase().includes('bad faith'))
        };
      }
      if (title.includes('coverage') || title.includes('policy')) {
        return {
          explanation: 'Defines insurance coverage requirements and policy interpretation',
          supportsFavorable: true
        };
      }
      if (title.includes('claim') || content.includes('claims handling')) {
        return {
          explanation: 'Establishes standards for insurance claims processing',
          supportsFavorable: context.coverageIssues?.some(i => i.includes('claim')) || false
        };
      }
    }

    if (context.caseType === 'housing') {
      if (title.includes('landlord') || title.includes('tenant')) {
        return {
          explanation: 'Defines landlord-tenant rights and obligations',
          supportsFavorable: true
        };
      }
    }

    if (context.caseType === 'employment') {
      if (title.includes('employment') || title.includes('wage')) {
        return {
          explanation: 'Establishes employment law standards in Arizona',
          supportsFavorable: true
        };
      }
    }

    return null;
  }

  private getStaticCitationsForCaseType(caseType: string, jurisdiction: string): LegalCitation[] {
    const azInsuranceCitations: LegalCitation[] = [
      {
        section: 'A.R.S. 20-461',
        title: 'Unfair Claims Settlement Practices',
        summary: 'Prohibits insurers from engaging in unfair claims practices including failing to promptly investigate claims, denying claims without reasonable basis, and failing to affirm or deny coverage within a reasonable time.',
        relevance: 'Establishes standards for fair claims handling that insurer must follow',
        supportsFavorable: true,
        url: 'https://www.azleg.gov/ars/20/00461.htm'
      },
      {
        section: 'A.R.S. 20-1118',
        title: 'Property Insurance Claims Time Limits',
        summary: 'Requires insurers to acknowledge claims within 10 working days and complete investigation within 30 days. Insurer must accept or deny claim within 15 days after investigation.',
        relevance: 'Sets strict timelines for insurer response to property claims',
        supportsFavorable: true,
        url: 'https://www.azleg.gov/ars/20/01118.htm'
      },
      {
        section: 'Rawlings v. Apodaca',
        title: 'Arizona Bad Faith Standard (162 Ariz. 324)',
        summary: 'Arizona Supreme Court established that insurers have duty of good faith and fair dealing. Breach can result in damages beyond policy limits including punitive damages.',
        relevance: 'Landmark case establishing bad faith liability for insurers',
        supportsFavorable: true
      },
      {
        section: 'A.R.S. 12-341.01',
        title: "Attorney's Fees in Contract Actions",
        summary: 'Allows prevailing party in contract dispute (including insurance) to recover reasonable attorney fees from losing party.',
        relevance: 'May allow recovery of legal fees if claim succeeds',
        supportsFavorable: true,
        url: 'https://www.azleg.gov/ars/12/00341-01.htm'
      },
      {
        section: 'Sparks v. Republic Nat\'l Life Ins. Co.',
        title: 'Duty to Defend Standard (132 Ariz. 529)',
        summary: 'Insurer\'s duty to defend is broader than duty to indemnify. Must defend if complaint allegations potentially fall within coverage.',
        relevance: 'Defines when insurer must provide legal defense',
        supportsFavorable: true
      }
    ];

    const azHousingCitations: LegalCitation[] = [
      {
        section: 'A.R.S. 33-1321',
        title: 'Arizona Residential Landlord Tenant Act',
        summary: 'Establishes rights and obligations of landlords and tenants including security deposits, repairs, and eviction procedures.',
        relevance: 'Primary statute governing rental housing disputes',
        supportsFavorable: true,
        url: 'https://www.azleg.gov/ars/33/01321.htm'
      },
      {
        section: 'A.R.S. 33-1324',
        title: 'Security Deposit Limits and Returns',
        summary: 'Limits security deposits to 1.5 months rent. Landlord must return within 14 days with itemized deductions.',
        relevance: 'Governs security deposit disputes',
        supportsFavorable: true,
        url: 'https://www.azleg.gov/ars/33/01324.htm'
      }
    ];

    const azEmploymentCitations: LegalCitation[] = [
      {
        section: 'A.R.S. 23-1501',
        title: 'Employment Protection Act',
        summary: 'Establishes at-will employment but prohibits termination for discriminatory reasons or in violation of public policy.',
        relevance: 'Defines wrongful termination standards',
        supportsFavorable: true,
        url: 'https://www.azleg.gov/ars/23/01501.htm'
      },
      {
        section: 'A.R.S. 23-364',
        title: 'Minimum Wage and Payment of Wages',
        summary: 'Requires timely payment of wages and establishes penalties for wage violations.',
        relevance: 'Governs wage dispute claims',
        supportsFavorable: true,
        url: 'https://www.azleg.gov/ars/23/00364.htm'
      }
    ];

    const citationMap: Record<string, LegalCitation[]> = {
      insurance: azInsuranceCitations,
      housing: azHousingCitations,
      employment: azEmploymentCitations,
    };

    if (jurisdiction === 'AZ' && citationMap[caseType]) {
      return citationMap[caseType];
    }

    return [{
      section: `${jurisdiction} State Law`,
      title: `${caseType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Statutes`,
      summary: `Relevant ${jurisdiction} state laws governing ${caseType.replace(/_/g, ' ')} matters. Consult with a licensed attorney for specific statutory analysis.`,
      relevance: 'General legal framework for this case type',
      supportsFavorable: true
    }];
  }

  private buildPredictionPrompt(context: ExtractedCaseContext, citations: LegalCitation[]): string {
    const citationText = citations.length > 0
      ? `\n\nRELEVANT LEGAL AUTHORITIES:\n${citations.map((c, i) => `${i + 1}. ${c.section} - ${c.title}\n   ${c.summary}`).join('\n\n')}`
      : '';

    return `Analyze this ${context.caseType} case and provide an outcome prediction:

CASE TYPE: ${context.caseType}${context.caseSubtype ? ` (${context.caseSubtype})` : ''}
JURISDICTION: ${context.jurisdiction}

PARTIES:
${context.parties.plaintiff ? `- Plaintiff: ${context.parties.plaintiff}` : ''}
${context.parties.defendant ? `- Defendant: ${context.parties.defendant}` : ''}
${context.parties.insurer ? `- Insurer: ${context.parties.insurer}` : ''}

DOCUMENTS REVIEWED: ${context.documentTypes.join(', ') || 'None specified'}

KEY FACTS:
${context.keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}

LEGAL ISSUES IDENTIFIED:
${context.legalIssues.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

${context.coverageIssues ? `COVERAGE ISSUES:\n${context.coverageIssues.map((c, i) => `${i + 1}. ${c}`).join('\n')}` : ''}

${context.claimAmount ? `CLAIM AMOUNT: $${context.claimAmount.toLocaleString()}` : ''}
${context.policyLimits ? `POLICY LIMITS: $${context.policyLimits.toLocaleString()}` : ''}
${citationText}

Based on this analysis and the applicable legal authorities, provide:
1. A success probability score (0-100)
2. Key strengths of the case (cite relevant statutes/case law)
3. Key weaknesses or challenges
4. Critical questions that need answers
5. Strategic recommendations
6. Immediate next steps

Format your response as JSON with keys: score, strengths, weaknesses, criticalQuestions, recommendations, nextSteps, reasoning`;
  }

  private getSystemPrompt(): string {
    return `You are an expert legal analyst specializing in case outcome prediction.
Analyze the provided case information and give an objective assessment.
Be specific to the facts provided. Consider jurisdiction-specific factors.
For insurance cases, analyze coverage issues, policy language, and bad faith potential.
Provide actionable, specific recommendations.
Always note that this is predictive analysis, not legal advice.`;
  }

  private parseAIPrediction(aiResponse: string, context: ExtractedCaseContext, legalCitations: LegalCitation[]): ContextualPrediction {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.max(0, Math.min(100, parsed.score || 50)),
          confidence: parsed.score > 70 ? 'high' : parsed.score > 40 ? 'medium' : 'low',
          predictedOutcome: parsed.score >= 70 ? 'favorable' : parsed.score >= 50 ? 'likely_settled' : parsed.score >= 30 ? 'uncertain' : 'unfavorable',
          reasoning: parsed.reasoning || '',
          keyStrengths: parsed.strengths || [],
          keyWeaknesses: parsed.weaknesses || [],
          criticalQuestions: parsed.criticalQuestions || [],
          recommendations: parsed.recommendations || [],
          nextSteps: (parsed.nextSteps || []).map((s: string, i: number) => ({
            action: s,
            urgency: i === 0 ? 'immediate' : i < 3 ? 'soon' : 'when_ready',
            description: ''
          })),
          comparableCasesSummary: '',
          legalCitations,
          extractedContext: context,
        };
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
    }

    return this.generateLocalPrediction(context, legalCitations);
  }

  private generateLocalPrediction(context: ExtractedCaseContext, legalCitations: LegalCitation[] = []): ContextualPrediction {
    let score = 50;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const questions: string[] = [];
    const recommendations: string[] = [];
    const nextSteps: { action: string; urgency: 'immediate' | 'soon' | 'when_ready'; description: string }[] = [];

    const hasPolicy = context.documentTypes.includes('Insurance Policy');
    const hasRoR = context.documentTypes.includes('Reservation of Rights Letter');
    context.documentTypes.includes('Complaint');
    const hasMultipleDocs = context.documentTypes.length >= 3;

    if (hasMultipleDocs) {
      score += 10;
      strengths.push('Comprehensive documentation available for analysis');
    }

    if (hasPolicy) {
      score += 5;
      strengths.push('Policy documentation allows for precise coverage analysis');
    }

    if (hasRoR) {
      score -= 10;
      weaknesses.push('Reservation of rights indicates potential coverage dispute');
      questions.push('What specific coverage issues are being reserved?');
      recommendations.push('Prepare counter-arguments for each reserved issue');
    }

    if (context.keyFacts.length > 5) {
      score += 5;
      strengths.push('Multiple relevant facts documented');
    }

    if (context.coverageIssues && context.coverageIssues.length > 0) {
      score -= context.coverageIssues.length * 5;
      for (const issue of context.coverageIssues.slice(0, 3)) {
        weaknesses.push(issue);
      }
    }

    for (const factor of context.strengthFactors) {
      if (factor.impact === 'positive') {
        score += 5;
        strengths.push(factor.factor);
      } else if (factor.impact === 'negative') {
        score -= 5;
        weaknesses.push(factor.factor);
      }
    }

    if (context.caseType === 'insurance') {
      if (!hasPolicy) {
        questions.push('Can you obtain and upload the full insurance policy?');
        recommendations.push('Obtain and review the complete insurance policy');
        nextSteps.push({ action: 'Obtain complete policy documentation', urgency: 'immediate', description: 'Request full policy from insurer if not already available' });
      } else {
        questions.push('Are there any additional endorsements or riders not yet reviewed?');
        nextSteps.push({ action: 'Review policy exclusions section', urgency: 'immediate', description: 'Identify any exclusions insurer may rely on' });
      }

      if (hasRoR) {
        questions.push('What is the deadline to respond to the reservation of rights?');
        recommendations.push('Send written response disputing each reserved issue');
        nextSteps.push({ action: 'Draft response to reservation of rights', urgency: 'immediate', description: 'Address each point raised by insurer' });
      }

      questions.push('Has the insurer acted in bad faith during claims handling?');
      recommendations.push('Document all communications with the insurance company');
      recommendations.push('Track any delays or unreasonable denials for bad faith claim');
    }

    if (nextSteps.length === 0) {
      if (context.documentTypes.length === 0) {
        nextSteps.push({ action: 'Upload relevant documents', urgency: 'immediate', description: 'Provide contracts, correspondence, or other key documents' });
      }
      nextSteps.push({ action: 'Compile timeline of all events', urgency: 'immediate', description: 'Create chronological summary for legal strategy' });
    }

    if (!hasMultipleDocs && context.documentTypes.length > 0) {
      nextSteps.push({ action: 'Gather additional supporting documentation', urgency: 'soon', description: 'Strengthen case with corroborating evidence' });
    }

    nextSteps.push({ action: 'Consult with specialized attorney', urgency: 'soon', description: 'Get professional assessment of legal strategy' });

    score = Math.max(10, Math.min(90, score));

    const confidence = context.confidence > 80 ? 'high' : context.confidence > 60 ? 'medium' : 'low';
    const predictedOutcome = score >= 70 ? 'favorable' : score >= 50 ? 'likely_settled' : score >= 30 ? 'uncertain' : 'unfavorable';

    return {
      score,
      confidence,
      predictedOutcome,
      reasoning: `Based on analysis of ${context.documentTypes.length} document(s) and ${context.keyFacts.length} key facts, this ${context.caseType} case in ${context.jurisdiction} shows ${predictedOutcome === 'favorable' ? 'strong indicators for success' : predictedOutcome === 'likely_settled' ? 'moderate strength suggesting settlement potential' : 'challenges that require strategic attention'}.`,
      keyStrengths: strengths.slice(0, 5),
      keyWeaknesses: weaknesses.slice(0, 5),
      criticalQuestions: questions.slice(0, 5),
      recommendations: recommendations.slice(0, 5),
      nextSteps: nextSteps.slice(0, 4),
      comparableCasesSummary: `Similar ${context.caseType} cases in ${context.jurisdiction} with comparable documentation levels typically see ${score >= 60 ? 'favorable outcomes or settlements' : 'mixed results requiring strong legal strategy'}.`,
      legalCitations,
      extractedContext: context,
    };
  }
}

export const contextualPredictionService = new ContextualPredictionService();
