import { supabase } from '../lib/supabase';
import type { Citation } from '../lib/legalbreeze-api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface DocumentAttachment {
  type: 'image' | 'pdf_page';
  data: string;
  mimeType: string;
  filename?: string;
  pageNumber?: number;
}

interface ThinkingStep {
  type: 'analysis' | 'research' | 'consideration' | 'conclusion';
  content: string;
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

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  complianceScore?: number;
  modelUsed?: string;
  followUpQuestions?: string[];
  thinkingDetails?: ThinkingDetails;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface ChatServiceConfig {
  useRAGPipeline: boolean;
  useOpenAI: boolean;
  jurisdiction?: string;
  category?: string;
  subcategory?: string;
  includeCompliance?: boolean;
  modelOverride?: string;
  answerMode?: 'simple' | 'stepbystep' | 'legal_aid_prep' | 'draft' | 'spanish';
  maxTokens?: number;
  temperature?: number;
}

interface OpenAIChatRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  sessionId: string;
  userId?: string;
  jurisdiction?: string;
  category?: string;
  modelOverride?: string;
  answerMode?: 'simple' | 'stepbystep' | 'legal_aid_prep' | 'draft' | 'spanish';
  maxTokens?: number;
  temperature?: number;
  documentAttachments?: DocumentAttachment[];
}

interface OpenAIChatResponse {
  response: string;
  modelUsed: string;
  modelDisplayName: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  jurisdiction: string;
  responseTimeMs: number;
  error?: string;
}

const DEFAULT_CONFIG: ChatServiceConfig = {
  useRAGPipeline: false,
  useOpenAI: true,
  jurisdiction: 'Arizona',
  includeCompliance: true,
};

type FallbackType = 'network_fallback' | 'api_fallback';

function isLikelyNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /TypeError|fetch|network|failed to fetch|load failed|abort|ECONNRESET|ENOTFOUND|ETIMEDOUT/i.test(message);
}

export type AnswerBasis = ThinkingDetails;

function parseThinkingDetails(response: string): { content: string; thinking: ThinkingDetails | null } {
  const basisStart = '---ANSWER_BASIS---';
  const basisEnd = '---END_ANSWER_BASIS---';
  const legacyStart = '---THINKING_DETAILS---';
  const legacyEnd = '---END_THINKING_DETAILS---';

  let thinkingStartMarker = basisStart;
  let thinkingEndMarker = basisEnd;
  let startIdx = response.indexOf(basisStart);
  let endIdx = response.indexOf(basisEnd);

  if (startIdx === -1 || endIdx === -1) {
    thinkingStartMarker = legacyStart;
    thinkingEndMarker = legacyEnd;
    startIdx = response.indexOf(legacyStart);
    endIdx = response.indexOf(legacyEnd);
  }

  if (startIdx === -1 || endIdx === -1) {
    return { content: response, thinking: null };
  }

  const contentBefore = response.substring(0, startIdx).trim();
  const contentAfter = response.substring(endIdx + thinkingEndMarker.length).trim();
  const cleanContent = (contentBefore + '\n\n' + contentAfter).trim();

  const thinkingText = response.substring(startIdx + thinkingStartMarker.length, endIdx).trim();

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

  const lines = thinkingText.split('\n').filter(l => l.trim());
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

function parseFollowUpQuestions(response: string): { content: string; followUpQuestions: string[] } {
  const followUpMarkerStart = '---FOLLOW_UP_QUESTIONS---';
  const followUpMarkerEnd = '---END_FOLLOW_UP_QUESTIONS---';

  const startIndex = response.indexOf(followUpMarkerStart);
  const endIndex = response.indexOf(followUpMarkerEnd);

  if (startIndex === -1 || endIndex === -1) {
    return { content: response, followUpQuestions: [] };
  }

  const contentBeforeFollowUps = response.substring(0, startIndex).trim();
  const followUpSection = response.substring(startIndex + followUpMarkerStart.length, endIndex).trim();

  const questions = followUpSection
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(q => q.length > 0);

  return { content: contentBeforeFollowUps, followUpQuestions: questions };
}

class ChatService {
  private config: ChatServiceConfig;
  private sessionId: string;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private userId: string | null = null;

  constructor(config: Partial<ChatServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = crypto.randomUUID();
  }

  setConfig(config: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  private async getAuthToken(): Promise<string> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || SUPABASE_ANON_KEY;
  }

  async sendMessage(
    query: string,
    documentContent?: string,
    documentAttachments?: DocumentAttachment[]
  ): Promise<ChatMessage> {
    let fullQuery = query;
    if (documentContent && documentContent.trim() && (!documentAttachments || documentAttachments.length === 0)) {
      fullQuery = `${query}\n\n--- ATTACHED DOCUMENT CONTENT ---\n${documentContent}\n--- END OF DOCUMENT ---`;
    }

    this.conversationHistory.push({ role: 'user', content: fullQuery });

    if (this.config.useOpenAI) {
      return this.sendToOpenAI(fullQuery, documentAttachments);
    }

    if (this.config.useRAGPipeline) {
      return this.sendToRAGPipeline(fullQuery);
    }

    return this.generateLocalResponse(fullQuery);
  }

  private async sendToOpenAI(
    _query: string,
    documentAttachments?: DocumentAttachment[]
  ): Promise<ChatMessage> {
    try {
      const messages = this.conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      const request: OpenAIChatRequest = {
        messages,
        sessionId: this.sessionId,
        userId: this.userId || undefined,
        jurisdiction: this.config.jurisdiction,
        category: this.config.category,
        modelOverride: this.config.modelOverride,
        answerMode: this.config.answerMode,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        documentAttachments,
      };

      const authToken = await this.getAuthToken();

      const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);

        let errorDetail = 'Unable to connect to AI service';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.includes('API key')) {
            errorDetail = 'AI service configuration error. Please contact support.';
          }
        } catch {
          // Use default error message
        }

        const errorContent = `**AI Service Temporarily Unavailable**\n\nWe're experiencing a temporary issue connecting to our AI service. Please try again in a moment.\n\nError: ${errorDetail}\n\nIn the meantime, you can:\n- Refresh the page and try again\n- Contact support if this persists\n- Browse our Legal Guides`;

        this.conversationHistory.push({ role: 'assistant', content: errorContent });
        return {
          role: 'assistant',
          content: errorContent,
          modelUsed: 'System Message',
        };
      }

      const data: OpenAIChatResponse = await response.json();

      if (data.error) {
        console.error('OpenAI response error:', data.error);

        const errorContent = `**AI Response Error**\n\nOur AI encountered an issue processing your request: ${data.error}\n\nPlease try rephrasing your question or contact support if this continues.`;

        this.conversationHistory.push({ role: 'assistant', content: errorContent });
        return {
          role: 'assistant',
          content: errorContent,
          modelUsed: 'System Message',
        };
      }

      if (!data.response) {
        console.error('OpenAI returned empty response');

        const errorContent = `**Empty Response**\n\nThe AI service returned an empty response. This may be due to:\n- The question being too complex\n- A temporary service issue\n\nPlease try rephrasing your question or breaking it into smaller parts.`;

        this.conversationHistory.push({ role: 'assistant', content: errorContent });
        return {
          role: 'assistant',
          content: errorContent,
          modelUsed: 'System Message',
        };
      }

      const { content: contentWithoutThinking, thinking } = parseThinkingDetails(data.response);
      const { content, followUpQuestions } = parseFollowUpQuestions(contentWithoutThinking);

      this.conversationHistory.push({ role: 'assistant', content });

      return {
        role: 'assistant',
        content,
        modelUsed: data.modelDisplayName,
        followUpQuestions,
        thinkingDetails: thinking || undefined,
        usage: data.usage,
      };
    } catch (error) {
      const fallbackType: FallbackType = isLikelyNetworkError(error)
        ? 'network_fallback'
        : 'api_fallback';

      console.error('OpenAI chat error; using local fallback', { fallbackType, error });
      this.conversationHistory.pop();

      try {
        const localResponse = await this.generateLocalResponse(_query);
        localResponse.modelUsed = `Local (${fallbackType})`;
        return localResponse;
      } catch (fallbackError) {
        console.error('Local fallback also failed', fallbackError);
        const content = 'I\'m having trouble reaching the AI service right now. Please try again shortly. This is general information only and not legal advice.';
        this.conversationHistory.push({ role: 'assistant', content });
        return { role: 'assistant', content, modelUsed: `Fallback (${fallbackType})` };
      }
    }
  }

  private async sendToRAGPipeline(query: string): Promise<ChatMessage> {
    try {
      const ragRequest = {
        query,
        sessionId: this.sessionId,
        tenantId: 'ezlegal',
        jurisdiction: this.config.jurisdiction || 'Arizona',
        category: this.config.category,
        subcategory: this.config.subcategory,
        includeCompliance: this.config.includeCompliance !== false,
        conversationHistory: this.conversationHistory.slice(-6).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      const ragToken = await this.getAuthToken();

      const response = await fetch(`${SUPABASE_URL}/functions/v1/legalbreeze-rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ragToken}`,
          'X-Tenant-ID': 'ezlegal',
        },
        body: JSON.stringify(ragRequest),
      });

      if (!response.ok) {
        throw new Error(`RAG API returned ${response.status}`);
      }

      const data = await response.json();
      let content = data.response;

      if (data.citations && data.citations.length > 0) {
        content += '\n\n---\n**Sources:**\n';
        data.citations.forEach((citation: Citation, index: number) => {
          content += `${index + 1}. ${citation.title}`;
          if (citation.jurisdiction) {
            content += ` (${citation.jurisdiction})`;
          }
          if (citation.url) {
            content += ` - [View](${citation.url})`;
          }
          content += '\n';
        });
      }

      if (data.complianceManifest) {
        const score = data.complianceManifest.enforcementScore;
        if (score < 70) {
          content += `\n\n*Note: This response has a compliance score of ${score}%. Please consult with a licensed attorney for verification.*`;
        }
      }

      this.conversationHistory.push({ role: 'assistant', content });

      return {
        role: 'assistant',
        content,
        citations: data.citations,
        complianceScore: data.complianceManifest?.enforcementScore,
        modelUsed: data.modelUsed || data.backendUsed || 'RAG Pipeline',
      };
    } catch (error) {
      console.error('RAG pipeline error:', error);
      return this.sendToOpenAI(query);
    }
  }

  private generateLocalResponse(query: string): ChatMessage {
    const lowerQuery = query.toLowerCase();

    const responses: Record<string, string> = {
      'prompt pay': `### Arizona Prompt Pay Act - A.R.S. § 23-351 et seq.

**Direct Answer**
The Arizona Prompt Pay Act requires employers to pay employees their earned wages on regularly scheduled paydays. Employees who are terminated must receive their final wages within specific timeframes, and employers who violate these requirements can face penalties.

**Legal Background**
Under Arizona Revised Statutes § 23-351 through § 23-361:

**Regular Pay Requirements:**
- Employers must pay wages at least twice per month on regular paydays designated in advance
- Wages must be paid within 16 days following the end of the pay period
- Wages can be paid by cash, check, direct deposit, or payroll card

**Final Pay Requirements (A.R.S. § 23-353):**
- **Termination by employer**: Wages due within 7 working days OR the next regular payday, whichever is sooner
- **Voluntary resignation**: Wages due by the next regular payday
- **Laid off employees**: Within 7 working days or next regular payday

**Potential Steps to Discuss with Counsel**
If you believe your employer violated the Prompt Pay Act:

1. **Document Everything**: Keep records of hours worked, pay stubs, pay dates, and any communications
2. **Send Written Demand**: Request unpaid wages in writing (keeps record and may trigger penalties)
3. **File a Wage Claim**: Contact the Industrial Commission of Arizona (ICA) to file a formal complaint
4. **File in Court**: For amounts under $3,500, use Small Claims Court; larger amounts go to Superior Court

**Penalties for Employers**
- **Treble Damages**: Courts can award up to THREE TIMES the unpaid wages
- **Waiting Time Penalties**: Additional wages for each day payment is delayed
- **Attorney's Fees**: Successful employees may recover legal costs

**Important Deadlines**
- **Statute of Limitations**: 1 year for wage claims under A.R.S. § 23-355
- **Federal Claims (FLSA)**: 2 years (or 3 years for willful violations)

**When Professional Legal Help May Be Warranted**
Consider consulting an attorney if:
- The amount owed exceeds $5,000
- Your employer disputes the wages owed
- You were misclassified as an independent contractor
- You believe multiple employees are affected (potential class action)

*This is legal information for educational purposes — not legal advice. No attorney-client relationship is created. Have an attorney review your specific situation before taking action.*`,

      eviction: `### Arizona Eviction Laws - A.R.S. Title 33, Chapter 10

**Direct Answer**
Arizona landlords must follow strict procedures to evict tenants, including providing proper written notice. Tenants have important rights throughout the eviction process and can contest improper evictions in court.

**Legal Background**
Arizona evictions are governed by the Arizona Residential Landlord and Tenant Act (A.R.S. § 33-1301 et seq.):

**Notice Requirements:**
- **5-Day Notice**: Required for non-payment of rent (A.R.S. § 33-1368(B))
- **10-Day Notice**: For curable lease violations (A.R.S. § 33-1368(A))
- **Immediate Notice**: For material health/safety violations, illegal activity
- **30-Day Notice**: For month-to-month tenancies without cause

**Potential Eviction Defense Steps (Review with an Attorney)**
1. **Verify Notice**: Confirm proper notice was served correctly
2. **Respond in Writing**: Document any disputes with the landlord's claims
3. **Appear in Court**: ALWAYS attend the eviction hearing - failure to appear results in default judgment
4. **Present Defenses**: Improper notice, habitability issues, retaliation, discrimination
5. **Request Continuance**: If you need more time to prepare

**Important Deadlines**
- You have 5 days to pay rent after receiving a 5-day notice
- Court hearing typically scheduled within 3-6 days of filing
- Appeal must be filed within 5 days of judgment

**Tenant Rights**
- Right to cure violations within notice period
- Right to a court hearing before forced removal
- Protection from "self-help" evictions (changing locks, removing belongings)
- Right to assert counterclaims for landlord violations

*This is legal information, not legal advice. No attorney-client relationship is created. Complex eviction situations benefit from professional legal representation.*`,

      landlord: `### Arizona Landlord-Tenant Law - A.R.S. Title 33, Chapter 10

**Direct Answer**
Arizona's Residential Landlord and Tenant Act provides comprehensive protections for both landlords and tenants, covering security deposits, repairs, habitability standards, and dispute resolution.

**Legal Background**

**Security Deposits (A.R.S. § 33-1321):**
- Maximum deposit: 1.5 months' rent
- Must be returned within 14 business days of move-out
- Landlord must provide itemized statement of any deductions
- Wrongful withholding: Tenant can recover up to twice the deposit

**Repair Obligations (A.R.S. § 33-1324):**
- Landlord must maintain habitability and make repairs
- Tenant must notify landlord in writing
- Landlord has 10 days to respond for non-emergency repairs
- Emergency repairs: Landlord must respond within 24 hours

**Tenant Remedies for Repairs:**
1. Written notice to landlord
2. If no response in 10 days: Tenant may hire repair and deduct up to $300 or half month's rent
3. For major violations: Tenant may terminate lease or seek rent reduction

**Habitability Standards Include:**
- Working plumbing, heating, electrical systems
- Hot and cold running water
- Functioning smoke detectors
- Pest-free conditions
- Structurally sound premises

*This is legal information, not legal advice. For specific disputes, consider consulting with a tenant rights organization or attorney before taking action.*`,

      divorce: `### Arizona Divorce Law - A.R.S. Title 25

**Direct Answer**
Arizona is a "no-fault" divorce state, meaning neither spouse needs to prove wrongdoing. The court divides community property equally and determines custody based on the child's best interests.

**Legal Background**

**Residency Requirements (A.R.S. § 25-312):**
- At least one spouse must be an Arizona resident for 90+ days before filing
- File in Superior Court in the county where either spouse resides

**Divorce Process:**
1. **Petition**: File dissolution of marriage petition
2. **Service**: Serve spouse with papers (or acceptance of service)
3. **Response**: 20 days for spouse to respond (30 if served out of state)
4. **Waiting Period**: 60 days minimum from service date
5. **Discovery**: Exchange financial information
6. **Trial/Settlement**: Resolve or litigate disputed issues

**Property Division (Community Property State):**
- Assets acquired during marriage are community property
- Community property divided "equitably" (usually 50/50)
- Separate property (owned before marriage, gifts, inheritance) stays with owner
- Debts are also divided

**Child Custody (Legal Decision-Making):**
- Based on child's best interests (A.R.S. § 25-403)
- Joint custody preferred unless against child's interests
- Factors: Child's wishes, parents' wishes, relationships, health, history of abuse

**Important Deadlines:**
- Response to petition: 20-30 days
- Waiting period: 60 days minimum
- Default judgment: If spouse doesn't respond in 20 days

*This is legal information, not legal advice. Divorce involves significant financial and family consequences — an attorney can review your specific circumstances.*`,

      custody: `### Arizona Child Custody (Legal Decision-Making) - A.R.S. § 25-401 et seq.

**Direct Answer**
Arizona uses "legal decision-making" (custody) and "parenting time" (visitation) to determine children's care. Courts prioritize the child's best interests and generally favor arrangements that maximize both parents' involvement.

**Legal Background**

**Legal Decision-Making Authority (A.R.S. § 25-401):**
- **Joint**: Both parents share major decisions (education, healthcare, religion)
- **Sole**: One parent makes all major decisions
- Courts prefer joint decision-making absent evidence it's harmful

**Parenting Time:**
- Schedule for physical time with each parent
- Not necessarily 50/50 - based on child's best interests
- Courts consider parents' work schedules, proximity, child's age

**Best Interest Factors (A.R.S. § 25-403):**
1. Past, present, and potential future relationship with each parent
2. Child's adjustment to home, school, community
3. Mental and physical health of all parties
4. Which parent is more likely to allow frequent contact with other parent
5. History of domestic violence or abuse
6. Child's wishes (if appropriate age and maturity)

**Modification of Custody:**
- Must show "substantial and continuing change in circumstances"
- Generally cannot modify within 1 year unless child's safety at risk

**Relocation:**
- 45-day written notice required before moving 100+ miles
- Other parent can object; court hearing required

*This is legal information, not legal advice. Custody matters are complex — consider consulting with a family law attorney to review your specific situation.*`,

      employment: `### Arizona Employment Law

**Direct Answer**
Arizona is an "at-will" employment state, meaning employers can terminate employees for any reason (or no reason) that isn't illegal. However, significant protections exist against discrimination, retaliation, and wage violations.

**Legal Background**

**At-Will Employment Exceptions:**
- **Discrimination**: Cannot fire based on race, color, religion, sex, national origin, age (40+), disability, pregnancy (Title VII, ADEA, ADA)
- **Retaliation**: Cannot fire for filing complaints, whistleblowing, workers' comp claims
- **Contract**: Written or implied employment contracts may limit termination
- **Public Policy**: Cannot fire for refusing illegal acts, exercising legal rights

**Wage and Hour Laws:**
- Arizona minimum wage: $14.35/hour (2024)
- Overtime: 1.5x for hours over 40/week (federal FLSA)
- Prompt Pay Act: Wages must be paid on regular pay schedule
- Final Pay: Within 7 working days or next payday if terminated

**Discrimination Claims:**
1. File with EEOC (federal) within 300 days, OR
2. File with Arizona Civil Rights Division within 180 days
3. Obtain "right to sue" letter before filing lawsuit
4. File lawsuit within 90 days of receiving letter

**Wrongful Termination — Risk Areas to Review:**
- Consider documenting everything (emails, performance reviews, witnesses)
- Filing an unemployment claim promptly is generally advisable
- Suggested question for counsel: review any severance agreement before signing

*This is legal information, not legal advice. If you believe your rights were violated, an employment attorney can review your specific circumstances — many offer free consultations.*`,

      contract: `### Arizona Contract Law

**Direct Answer**
Arizona follows common law principles for contracts, requiring offer, acceptance, consideration, and capacity. Written contracts are generally required for agreements involving land, debts over certain amounts, or performance taking longer than one year.

**Legal Background**

**Essential Elements of a Valid Contract:**
1. **Offer**: Clear terms proposed by one party
2. **Acceptance**: Unambiguous agreement to terms
3. **Consideration**: Something of value exchanged
4. **Capacity**: Parties must be legally able to contract (adults, mentally competent)
5. **Legality**: Purpose cannot be illegal

**Statute of Frauds (A.R.S. § 44-101):**
Written contract required for:
- Sale of real property
- Agreements that cannot be performed within one year
- Promises to pay another's debt
- Sale of goods over $500 (UCC)

**Breach of Contract Remedies:**
- **Compensatory Damages**: Money to put you in position if contract performed
- **Consequential Damages**: Foreseeable losses resulting from breach
- **Specific Performance**: Court orders party to perform (rare, usually for unique property)
- **Rescission**: Contract cancelled, parties restored to original positions

**Statute of Limitations:**
- Written contracts: 6 years (A.R.S. § 12-548)
- Oral contracts: 3 years (A.R.S. § 12-543)

**Common Contract Disputes:**
- Non-payment for services
- Failure to deliver goods
- Breach of warranty
- Misrepresentation

*This is legal information, not legal advice. Contract disputes often involve significant amounts — have an attorney review agreements and communications before taking action.*`,

      business: `### Starting a Business in Arizona

**Direct Answer**
Arizona is a business-friendly state with straightforward registration processes. Most businesses need to register with the Arizona Corporation Commission, obtain appropriate licenses, and comply with tax requirements.

**Legal Background**

**Business Structure Options:**
1. **Sole Proprietorship**: Simplest, no separate registration required (just trade name if not using own name)
2. **LLC**: Limited liability, pass-through taxation, flexible management - most popular for small businesses
3. **Corporation**: Strongest liability protection, more formalities, potential double taxation
4. **Partnership**: Two or more owners, various types (general, limited, LLP)

**Step-by-Step Business Formation (LLC):**
1. **Choose Name**: Must include "LLC" and be distinguishable from existing entities
2. **File Articles of Organization**: With Arizona Corporation Commission ($50 online)
3. **Obtain EIN**: Free from IRS (irs.gov)
4. **Create Operating Agreement**: Not required but strongly recommended
5. **Register for State Taxes**: Arizona Department of Revenue
6. **Obtain Business Licenses**: City, county, and industry-specific

**Tax Requirements:**
- Arizona Transaction Privilege Tax (TPT): Sales tax, varies by city (8-11%)
- Withholding: Required if you have employees
- Annual Report: LLCs don't require annual reports in Arizona!

**Important Deadlines:**
- Articles of Organization: File before conducting business
- EIN: Before opening bank accounts or hiring
- TPT License: Before first sale

**Costs to Expect:**
- Articles of Organization: $50 (online) or $60 (paper)
- Business license: Varies by city ($50-$500)
- Operating Agreement preparation: $500-$1,500 if using attorney

*This is legal information, not legal advice. Business formation has long-term legal and tax implications — consider consulting with a business attorney and CPA before finalizing decisions.*`,

      default: `### Legal Information Request

**Direct Answer**
I understand you have a legal question. Let me provide helpful guidance based on Arizona law.

**How I Can Help**
I'm trained to provide comprehensive legal information on topics including:

**Common Practice Areas:**
- **Employment**: Wages, discrimination, wrongful termination
- **Housing**: Tenant rights, evictions, landlord disputes
- **Family**: Divorce, custody, child support
- **Business**: Formation, contracts, licensing
- **Consumer**: Debt collection, fraud, warranties
- **Criminal**: Rights, process, expungement

**Getting Better Answers**
For the most helpful response, please include:
1. **Specific Issue**: What exactly happened or what do you need to know?
2. **Key Facts**: Dates, amounts, parties involved
3. **Timeline**: Any deadlines or court dates approaching
4. **Prior Actions**: What have you already tried?

**Example Questions That Get Great Answers:**
- "What are my rights if my landlord refuses to return my security deposit?"
- "How do I file for divorce in Arizona and what is the process?"
- "My employer hasn't paid me in 3 weeks - what can I do?"
- "Summarize the Arizona Prompt Pay Act"

**Important Disclaimer**
This is legal information for educational purposes — not legal advice. No attorney-client relationship is created. For guidance specific to your situation, consult with a licensed attorney.

*Please rephrase your question with more specific details, and I'll provide a comprehensive, citation-backed response.*`,
    };

    let responseKey = 'default';
    const keywordMatches: [string, number][] = [];

    for (const key of Object.keys(responses)) {
      if (key === 'default') continue;
      const keywords = key.split(/\s+/);
      let matchCount = 0;
      for (const kw of keywords) {
        if (lowerQuery.includes(kw)) {
          matchCount++;
        }
      }
      if (matchCount > 0) {
        keywordMatches.push([key, matchCount]);
      }
    }

    keywordMatches.sort((a, b) => b[1] - a[1]);
    if (keywordMatches.length > 0) {
      responseKey = keywordMatches[0][0];
    }

    const content = responses[responseKey];
    this.conversationHistory.push({ role: 'assistant', content });

    return {
      role: 'assistant',
      content,
      modelUsed: 'EZLegal Knowledge Base',
    };
  }

  resetSession(): void {
    this.sessionId = crypto.randomUUID();
    this.conversationHistory = [];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

export const chatService = new ChatService();

export { ChatService };
export type { ChatMessage, ChatServiceConfig, DocumentAttachment, ThinkingDetails, ThinkingStep };
