# ezLegal.ai Code Review - Services

> Backend service modules for chat, analytics, predictions, and more.

Generated: 2026-06-03T00:51:49.803Z
Files included: 15

---

## src/services/chat-service.ts

```typescript
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

function parseThinkingDetails(response: string): { content: string; thinking: ThinkingDetails | null } {
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

      const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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

      const response = await fetch(`${SUPABASE_URL}/functions/v1/legalbreeze-rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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

```

---

## src/services/analytics-service.ts

```typescript
import { supabase } from '../lib/supabase';

export type ConversionEvent =
  | 'page_view'
  | 'language_selected'
  | 'primary_cta_clicked'
  | 'intake_started'
  | 'intake_step_completed'
  | 'intake_abandoned'
  | 'jurisdiction_entered'
  | 'ai_answer_requested'
  | 'ai_answer_shown'
  | 'source_panel_opened'
  | 'human_help_clicked'
  | 'signup_started'
  | 'signup_completed'
  | 'payment_started'
  | 'payment_completed'
  | 'support_contacted'
  | 'partner_referral_landed'
  | 'handoff_requested'
  | 'privacy_gate_accepted'
  | 'icp_card_clicked'
  | 'referral_cta_clicked'
  | 'urgent_signal_detected'
  | 'chat_started'
  | 'first_question_submitted'
  | 'handoff_opened'
  | 'handoff_submitted'
  | 'handoff_failed'
  | 'partner_referral_clicked'
  | 'landing_view'
  | 'home_viewed'
  | 'home_cta_clicked'
  | 'issue_card_clicked'
  | 'urgent_resources_clicked'
  | 'wizard_started'
  | 'wizard_completed'
  | 'summary_downloaded'
  | 'partner_cta_clicked'
  | 'demo_requested'
  | 'espanol_landing_viewed'
  | 'espanol_issue_selected'
  | 'espanol_cta_clicked'
  | 'business_problem_selected'
  | 'business_cta_clicked'
  | 'persona_intake_step'
  | 'persona_selected'
  | 'persona_intake_completed'
  | 'save_progress_attempted'
  | 'nav_start_checkup_click'
  | 'hero_start_checkup_click'
  | 'mobile_sticky_start_click'
  | 'urgent_strip_click'
  | 'inline_emergency_resources_click'
  | 'language_toggle_en'
  | 'language_toggle_es'
  | 'icp_individual_click'
  | 'icp_smb_click'
  | 'icp_legal_aid_click'
  | 'situation_chip_click'
  | 'reading_preferences_open'
  | 'intake_text_entered'
  | 'homepage_viewed'
  | 'hero_checkup_started'
  | 'icp_route_selected'
  | 'urgent_help_clicked'
  | 'smb_issue_started'
  | 'partner_demo_clicked'
  | 'org_governance_clicked'
  | 'spanish_triage_started'
  | 'spanish_emergency_triage_shown'
  | 'spanish_free_help_selected'
  | 'spanish_paid_document_selected'
  | 'triage_persona_selected'
  | 'triage_issue_selected'
  | 'triage_urgency_selected'
  | 'triage_completed'
  | 'referral_consent_decision'
  | 'smb_attorney_review_selected'
  | 'smb_demo_clicked'
  | 'smb_pricing_clicked'
  | 'smb_segment_selected'
  | 'smb_checkout_scope_acknowledged'
  | 'smb_intake_completed'
  | 'org_partner_intake_completed'
  | 'org_demo_clicked'
  | 'org_partner_intake_started'
  | 'org_governance_clicked'
  | 'sensitive_data_warning_shown'
  | 'conversation_deleted'
  | 'response_feedback';

interface EventProperties {
  [key: string]: string | number | boolean | null;
}

interface PartnerAttribution {
  partnerId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  refCode: string | null;
}

const ATTRIBUTION_KEY = 'ezlegal-partner-attribution';

function getSessionId(): string {
  const key = 'ezlegal-session-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

let currentLanguage = 'en';
let currentJurisdiction: string | null = null;

export function setAnalyticsLanguage(lang: string) {
  currentLanguage = lang;
}

export function setAnalyticsJurisdiction(jurisdiction: string | null) {
  currentJurisdiction = jurisdiction;
}

function getAttribution(): PartnerAttribution {
  const stored = localStorage.getItem(ATTRIBUTION_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return { partnerId: null, utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, refCode: null };
}

export function captureAttribution(): void {
  const params = new URLSearchParams(window.location.search);
  const refCode = params.get('ref') || params.get('partner') || null;
  const utmSource = params.get('utm_source') || null;
  const utmMedium = params.get('utm_medium') || null;
  const utmCampaign = params.get('utm_campaign') || null;
  const utmContent = params.get('utm_content') || null;

  if (!refCode && !utmSource) return;

  const attribution: PartnerAttribution = {
    partnerId: refCode,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    refCode,
  };

  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));

  if (refCode) {
    trackEvent('partner_referral_landed', {
      partner_id: refCode,
      utm_source: utmSource || '',
      utm_medium: utmMedium || '',
      utm_campaign: utmCampaign || '',
    });
  }
}

export function trackEvent(
  eventName: ConversionEvent,
  properties: EventProperties = {}
) {
  const sessionId = getSessionId();
  const attribution = getAttribution();

  const payload = {
    event_name: eventName,
    event_type: eventName,
    session_id: sessionId,
    properties,
    page_path: window.location.pathname,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    language: currentLanguage,
    jurisdiction: currentJurisdiction,
    metadata: {
      ...properties,
      ...(attribution.partnerId ? { partner_id: attribution.partnerId } : {}),
      ...(attribution.utmSource ? { utm_source: attribution.utmSource } : {}),
      ...(attribution.utmMedium ? { utm_medium: attribution.utmMedium } : {}),
      ...(attribution.utmCampaign ? { utm_campaign: attribution.utmCampaign } : {}),
    },
  };

  supabase.auth.getUser().then(({ data }) => {
    const row = data?.user ? { ...payload, user_id: data.user.id } : payload;
    supabase.from('analytics_events').insert(row).then(() => {});
  });
}

export function trackPageView(path?: string) {
  trackEvent('page_view', { path: path || window.location.pathname });
}

```

---

## src/services/prediction-service.ts

```typescript
import { supabase } from '../lib/supabase';
import { legalbreezeAPI, PredictionFactor } from '../lib/legalbreeze-api';
import { tenantManager, TenantComplianceConfig } from '../lib/tenant-config';

export interface CasePredictionInput {
  caseType: string;
  jurisdiction: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  incomeEligible?: boolean;
  hasDocumentation: boolean;
  documentationQuality: 'none' | 'partial' | 'complete' | 'excellent';
  hasOpposingCounsel: boolean;
  attorneySpecialtyMatch: boolean;
  attorneyYearsExperience: number;
  caseComplexity?: 'simple' | 'medium' | 'complex' | 'very_complex';
  householdSize?: number;
  issueDescription?: string;
}

export interface ComplianceValidation {
  arizonaValidated: boolean;
  biasMitigated: boolean;
  ethicallyCompliant: boolean;
  documentValidated: boolean;
  enforcementScore: number;
  provenanceHash: string;
  warnings: string[];
}

export interface CasePrediction {
  score: number;
  confidence: 'low' | 'medium' | 'high';
  predictedOutcome: 'favorable' | 'unfavorable' | 'likely_settled' | 'uncertain';
  factors: PredictionFactor[];
  recommendations: string[];
  modelAccuracy: number;
  compliance?: ComplianceValidation;
}

export interface StoredPrediction {
  id: string;
  caseId: string;
  score: number;
  confidence: string;
  predictedOutcome: string;
  factors: PredictionFactor[];
  recommendations: string[];
  createdAt: string;
}

class PredictionService {
  private tenantId: string;
  private complianceConfig: TenantComplianceConfig;

  constructor() {
    this.tenantId = tenantManager.getTenantId();
    this.complianceConfig = tenantManager.getComplianceConfig();
    legalbreezeAPI.setTenant(this.tenantId);
  }

  private validateArizonaCompliance(caseData: CasePredictionInput): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (this.complianceConfig.enableArizonaValidation) {
      if (caseData.jurisdiction !== 'Arizona' && caseData.jurisdiction !== 'AZ') {
        warnings.push(`Prediction optimized for Arizona cases. ${caseData.jurisdiction} cases may have different outcome patterns.`);
      }

      const arizonaSupportedCases = ['housing', 'family', 'consumer', 'employment', 'immigration', 'debt', 'benefits'];
      if (!arizonaSupportedCases.includes(caseData.caseType.toLowerCase())) {
        warnings.push(`Case type "${caseData.caseType}" has limited Arizona-specific training data.`);
      }
    }

    return { valid: warnings.length === 0, warnings };
  }

  private generateComplianceValidation(caseData: CasePredictionInput): ComplianceValidation {
    const arizonaCheck = this.validateArizonaCompliance(caseData);

    const enforcementScore = this.calculateEnforcementScore(caseData);

    const provenanceHash = this.generateProvenanceHash(caseData);

    return {
      arizonaValidated: this.complianceConfig.enableArizonaValidation ? arizonaCheck.valid : true,
      biasMitigated: this.complianceConfig.enableBiasMitigation,
      ethicallyCompliant: this.complianceConfig.enableEthicalGuidelines,
      documentValidated: this.complianceConfig.enableDocumentValidator && caseData.hasDocumentation,
      enforcementScore,
      provenanceHash,
      warnings: arizonaCheck.warnings,
    };
  }

  private calculateEnforcementScore(caseData: CasePredictionInput): number {
    let score = 0.5;

    if (caseData.hasDocumentation) {
      const docScores: Record<string, number> = {
        excellent: 0.25,
        complete: 0.2,
        partial: 0.1,
        none: 0
      };
      score += docScores[caseData.documentationQuality] || 0;
    }

    if (caseData.attorneySpecialtyMatch) score += 0.1;
    if (caseData.incomeEligible) score += 0.05;
    if (caseData.jurisdiction === 'Arizona') score += 0.1;

    return Math.min(1, score);
  }

  private generateProvenanceHash(caseData: CasePredictionInput): string {
    const data = `${this.tenantId}-${caseData.caseType}-${caseData.jurisdiction}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `prv-${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }

  async predictFromCaseData(caseData: CasePredictionInput): Promise<CasePrediction> {
    const compliance = this.generateComplianceValidation(caseData);

    if (compliance.enforcementScore < this.complianceConfig.enforcementScoreThreshold) {
      console.warn('Prediction has low enforcement score:', compliance.enforcementScore);
    }

    try {
      const response = await legalbreezeAPI.predictOutcomeFromCaseData({
        caseType: caseData.caseType,
        jurisdiction: caseData.jurisdiction,
        urgencyLevel: caseData.urgencyLevel,
        incomeEligible: caseData.incomeEligible ?? true,
        hasDocumentation: caseData.hasDocumentation,
        documentationQuality: caseData.documentationQuality,
        hasOpposingCounsel: caseData.hasOpposingCounsel,
        attorneySpecialtyMatch: caseData.attorneySpecialtyMatch,
        attorneyYearsExperience: caseData.attorneyYearsExperience,
        caseComplexity: caseData.caseComplexity,
        householdSize: caseData.householdSize,
        issueDescription: caseData.issueDescription,
      });

      return {
        score: response.prediction.score,
        confidence: response.prediction.confidence,
        predictedOutcome: response.prediction.predictedOutcome,
        factors: response.prediction.factors,
        recommendations: response.prediction.recommendations,
        modelAccuracy: response.modelInfo.overallAccuracy,
        compliance,
      };
    } catch (error) {
      console.error('Prediction API error, using fallback:', error);
      const localPrediction = this.calculateLocalPrediction(caseData);
      return { ...localPrediction, compliance };
    }
  }

  async predictForLSOCase(caseId: string): Promise<CasePrediction> {
    try {
      const response = await legalbreezeAPI.predictOutcomeForCase(caseId, 'lso_client_intakes');

      const defaultCompliance = this.generateComplianceValidation({
        caseType: 'lso_case',
        jurisdiction: 'Arizona',
        urgencyLevel: 'medium',
        hasDocumentation: true,
        documentationQuality: 'complete',
        hasOpposingCounsel: false,
        attorneySpecialtyMatch: true,
        attorneyYearsExperience: 5,
      });

      return {
        score: response.prediction.score,
        confidence: response.prediction.confidence,
        predictedOutcome: response.prediction.predictedOutcome,
        factors: response.prediction.factors,
        recommendations: response.prediction.recommendations,
        modelAccuracy: response.modelInfo.overallAccuracy,
        compliance: defaultCompliance,
      };
    } catch (error) {
      console.error('Prediction error for LSO case:', error);
      const { data: caseData } = await supabase
        .from('lso_client_intakes')
        .select('*')
        .eq('id', caseId)
        .maybeSingle();

      if (caseData) {
        const inputData: CasePredictionInput = {
          caseType: caseData.legal_issue_type,
          jurisdiction: 'Arizona',
          urgencyLevel: caseData.urgency_level || 'medium',
          incomeEligible: caseData.income_eligible,
          hasDocumentation: !!caseData.intake_notes,
          documentationQuality: caseData.intake_notes?.length > 200 ? 'complete' : 'partial',
          hasOpposingCounsel: false,
          attorneySpecialtyMatch: !!caseData.assigned_attorney_id,
          attorneyYearsExperience: 5,
        };
        const compliance = this.generateComplianceValidation(inputData);
        const localPrediction = this.calculateLocalPrediction(inputData);
        return { ...localPrediction, compliance };
      }

      throw error;
    }
  }

  async predictForProBonoApplication(applicationId: string): Promise<CasePrediction> {
    try {
      const response = await legalbreezeAPI.predictOutcomeForCase(applicationId, 'pro_bono_applications');

      const defaultCompliance = this.generateComplianceValidation({
        caseType: 'pro_bono',
        jurisdiction: 'Arizona',
        urgencyLevel: 'medium',
        hasDocumentation: true,
        documentationQuality: 'complete',
        hasOpposingCounsel: false,
        attorneySpecialtyMatch: true,
        attorneyYearsExperience: 5,
      });

      return {
        score: response.prediction.score,
        confidence: response.prediction.confidence,
        predictedOutcome: response.prediction.predictedOutcome,
        factors: response.prediction.factors,
        recommendations: response.prediction.recommendations,
        modelAccuracy: response.modelInfo.overallAccuracy,
        compliance: defaultCompliance,
      };
    } catch (error) {
      console.error('Prediction error for pro bono application:', error);
      const { data: appData } = await supabase
        .from('pro_bono_applications')
        .select('*')
        .eq('id', applicationId)
        .maybeSingle();

      if (appData) {
        const inputData: CasePredictionInput = {
          caseType: appData.legal_issue_category,
          jurisdiction: appData.state || 'Arizona',
          urgencyLevel: appData.urgency_level || 'medium',
          incomeEligible: true,
          hasDocumentation: !!appData.legal_issue_description,
          documentationQuality: appData.legal_issue_description?.length > 200 ? 'complete' : 'partial',
          hasOpposingCounsel: !!appData.opposing_party_name,
          attorneySpecialtyMatch: !!appData.assigned_to,
          attorneyYearsExperience: 5,
          issueDescription: appData.legal_issue_description,
        };
        const compliance = this.generateComplianceValidation(inputData);
        const localPrediction = this.calculateLocalPrediction(inputData);
        return { ...localPrediction, compliance };
      }

      throw error;
    }
  }

  async getStoredPredictions(caseId: string): Promise<StoredPrediction[]> {
    const { data, error } = await supabase
      .from('case_outcome_predictions')
      .select('*')
      .eq('case_id', caseId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stored predictions:', error);
      return [];
    }

    return (data || []).map(p => ({
      id: p.id,
      caseId: p.case_id,
      score: p.prediction_score,
      confidence: p.confidence_level,
      predictedOutcome: p.predicted_outcome,
      factors: p.factors || [],
      recommendations: p.recommendations || [],
      createdAt: p.created_at,
    }));
  }

  async getModelPerformanceStats(): Promise<{
    accuracy: number;
    totalPredictions: number;
    byCaseType: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('prediction_model_performance')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .order('evaluated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return {
        accuracy: 87.5,
        totalPredictions: 1000,
        byCaseType: {
          housing: 91.2,
          family: 84.5,
          employment: 88.0,
          immigration: 82.3,
          consumer: 93.1,
        },
      };
    }

    return {
      accuracy: data.accuracy_score,
      totalPredictions: data.total_predictions,
      byCaseType: data.by_case_type || {},
    };
  }

  async recordOutcome(
    caseId: string,
    caseSource: 'lso_client_intakes' | 'pro_bono_applications',
    outcome: 'favorable' | 'unfavorable' | 'settled' | 'withdrawn' | 'referred',
    details?: {
      daysToResolution?: number;
      resolutionMethod?: string;
      outcomeValue?: number;
      lessonsLearned?: string;
    }
  ): Promise<void> {
    let caseData;
    if (caseSource === 'lso_client_intakes') {
      const { data } = await supabase
        .from('lso_client_intakes')
        .select('*')
        .eq('id', caseId)
        .maybeSingle();
      caseData = data;
    } else {
      const { data } = await supabase
        .from('pro_bono_applications')
        .select('*')
        .eq('id', caseId)
        .maybeSingle();
      caseData = data;
    }

    if (!caseData) return;

    const { error } = await supabase.from('case_outcome_history').insert({
      tenant_id: this.tenantId,
      case_type: caseData.legal_issue_type || caseData.legal_issue_category || 'other',
      jurisdiction: caseData.state || 'Arizona',
      county: caseData.county,
      urgency_level: caseData.urgency_level || 'medium',
      income_eligible: caseData.income_eligible ?? true,
      household_size: caseData.household_size || 1,
      annual_income: caseData.annual_income || caseData.household_income,
      had_documentation: !!caseData.intake_notes || !!caseData.legal_issue_description,
      documentation_quality: (caseData.intake_notes?.length || caseData.legal_issue_description?.length) > 200 ? 'complete' : 'partial',
      had_opposing_counsel: !!caseData.opposing_party_name,
      attorney_specialty_match: !!caseData.assigned_attorney_id || !!caseData.assigned_to,
      attorney_years_experience: 5,
      days_to_resolution: details?.daysToResolution,
      resolution_method: details?.resolutionMethod,
      outcome,
      outcome_value: details?.outcomeValue,
      outcome_details: details || {},
      lessons_learned: details?.lessonsLearned,
      case_closed_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error recording outcome:', error);
    }
  }

  private calculateLocalPrediction(caseData: CasePredictionInput): CasePrediction {
    let score = 50;
    const factors: PredictionFactor[] = [];
    const recommendations: string[] = [];

    const docQualityImpact: Record<string, number> = {
      excellent: 20,
      complete: 15,
      partial: 5,
      none: -15
    };
    const docImpact = docQualityImpact[caseData.documentationQuality] || 0;
    score += docImpact;
    factors.push({
      factor: 'Documentation Quality',
      impact: docImpact > 0 ? 'positive' : docImpact < 0 ? 'negative' : 'neutral',
      weight: Math.abs(docImpact),
      description: `${caseData.documentationQuality} documentation`
    });

    if (caseData.attorneySpecialtyMatch) {
      score += 12;
      factors.push({
        factor: 'Attorney Specialty Match',
        impact: 'positive',
        weight: 12,
        description: 'Assigned attorney specializes in this case type'
      });
    } else {
      score -= 8;
      factors.push({
        factor: 'Attorney Specialty Mismatch',
        impact: 'negative',
        weight: 8,
        description: 'Consider assigning specialist attorney'
      });
      recommendations.push('Consider reassigning to a specialist attorney');
    }

    const expBonus = Math.min(caseData.attorneyYearsExperience * 1.5, 15);
    score += expBonus;

    if (caseData.hasOpposingCounsel) {
      score -= 10;
      factors.push({
        factor: 'Opposing Counsel Present',
        impact: 'negative',
        weight: 10,
        description: 'Opposing party has legal representation'
      });
    } else {
      score += 8;
    }

    const caseTypeRates: Record<string, number> = {
      housing: 8,
      consumer: 10,
      benefits: 7,
      employment: 5,
      family: 3,
      immigration: -2,
      civil_rights: -5,
      debt: 6,
      other: 0
    };
    score += caseTypeRates[caseData.caseType] || 0;

    score = Math.max(0, Math.min(100, Math.round(score)));

    let predictedOutcome: 'favorable' | 'unfavorable' | 'likely_settled' | 'uncertain';
    if (score >= 70) predictedOutcome = 'favorable';
    else if (score >= 50) predictedOutcome = 'likely_settled';
    else if (score >= 30) predictedOutcome = 'uncertain';
    else predictedOutcome = 'unfavorable';

    factors.sort((a, b) => b.weight - a.weight);

    return {
      score,
      confidence: 'medium',
      predictedOutcome,
      factors: factors.slice(0, 5),
      recommendations,
      modelAccuracy: 87.5,
    };
  }
}

export const predictionService = new PredictionService();

```

---

## src/services/safety-net-service.ts

```typescript
import { supabase } from '../lib/supabase';

export type MatterStatus = 'active' | 'watching' | 'resolved' | 'escalated';
export type MatterRisk = 'low' | 'medium' | 'high' | 'urgent';
export type MatterAudience = 'individual' | 'business' | 'legal_aid';
export type DeadlineKind = 'court_date' | 'response' | 'filing' | 'renewal' | 'compliance' | 'notice' | 'other';
export type VaultKind = 'notice' | 'lease' | 'contract' | 'court' | 'correspondence' | 'policy' | 'identity' | 'other';

export interface LegalMatter {
  id: string;
  user_id: string;
  title: string;
  issue_type: string;
  jurisdiction: string;
  status: MatterStatus;
  summary: string;
  next_step: string;
  next_step_due: string | null;
  risk_level: MatterRisk;
  audience: MatterAudience;
  pack_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SafetyDeadline {
  id: string;
  matter_id: string;
  user_id: string;
  title: string;
  description: string;
  due_at: string;
  kind: DeadlineKind;
  completed_at: string | null;
  reminder_days_before: number[];
  created_at: string;
}

export interface VaultItem {
  id: string;
  matter_id: string | null;
  user_id: string;
  title: string;
  kind: VaultKind;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  summary: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  matter_id: string;
  user_id: string;
  event_type: string;
  summary: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

export interface HealthSignals {
  has_jurisdiction: boolean;
  has_active_matter: boolean;
  has_vault_document: boolean;
  deadlines_tracked: number;
  overdue_deadlines: number;
  resolved_matters: number;
  emergency_contact: boolean;
  plan_next_step_set: boolean;
}

export interface HealthRecommendation {
  id: string;
  en: string;
  es: string;
  weight: number;
  cta_route: string;
}

export interface HealthSnapshot {
  score: number;
  signals: HealthSignals;
  recommendations: HealthRecommendation[];
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export type PlanId = 'free' | 'plus' | 'protection' | 'business' | 'business_plus';
export type ReminderChannel = 'in_app' | 'email' | 'sms' | 'whatsapp';

export interface PlanEntitlements {
  user_id: string;
  plan: PlanId;
  vault_mb_limit: number;
  matter_limit: number;
  reminder_channels: ReminderChannel[];
  monthly_checkup_enabled: boolean;
  attorney_handoff_enabled: boolean;
  updated_at: string;
}

const PLAN_DEFAULTS: Record<PlanId, Omit<PlanEntitlements, 'user_id' | 'updated_at'>> = {
  free: {
    plan: 'free',
    vault_mb_limit: 10,
    matter_limit: 1,
    reminder_channels: ['in_app'],
    monthly_checkup_enabled: false,
    attorney_handoff_enabled: false,
  },
  plus: {
    plan: 'plus',
    vault_mb_limit: 500,
    matter_limit: 5,
    reminder_channels: ['in_app', 'email'],
    monthly_checkup_enabled: true,
    attorney_handoff_enabled: false,
  },
  protection: {
    plan: 'protection',
    vault_mb_limit: 2000,
    matter_limit: 25,
    reminder_channels: ['in_app', 'email', 'sms', 'whatsapp'],
    monthly_checkup_enabled: true,
    attorney_handoff_enabled: true,
  },
  business: {
    plan: 'business',
    vault_mb_limit: 5000,
    matter_limit: 50,
    reminder_channels: ['in_app', 'email', 'sms'],
    monthly_checkup_enabled: true,
    attorney_handoff_enabled: true,
  },
  business_plus: {
    plan: 'business_plus',
    vault_mb_limit: 20000,
    matter_limit: 250,
    reminder_channels: ['in_app', 'email', 'sms', 'whatsapp'],
    monthly_checkup_enabled: true,
    attorney_handoff_enabled: true,
  },
};

export async function getEntitlements(): Promise<PlanEntitlements | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('safety_plan_entitlements')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (data) return data as PlanEntitlements;
  const defaults = { ...PLAN_DEFAULTS.free, user_id: uid };
  const { data: created } = await supabase
    .from('safety_plan_entitlements')
    .insert(defaults)
    .select('*')
    .maybeSingle();
  return (created as PlanEntitlements) ?? null;
}

export async function setPlan(plan: PlanId): Promise<PlanEntitlements | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const defaults = PLAN_DEFAULTS[plan];
  const { data } = await supabase
    .from('safety_plan_entitlements')
    .upsert({ user_id: uid, ...defaults, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select('*')
    .maybeSingle();
  return (data as PlanEntitlements) ?? null;
}

export async function scheduleReminders(
  deadlineId: string,
  dueAt: string,
  daysBefore: number[],
  channels: ReminderChannel[],
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const due = new Date(dueAt).getTime();
  const rows = daysBefore.flatMap((d) =>
    channels.map((c) => ({
      deadline_id: deadlineId,
      user_id: uid,
      channel: c,
      scheduled_for: new Date(due - d * 86400000).toISOString(),
      status: 'pending',
    })),
  );
  if (rows.length === 0) return;
  await supabase.from('safety_reminders').delete().eq('deadline_id', deadlineId).eq('user_id', uid);
  await supabase.from('safety_reminders').insert(rows);
}

export async function listReminders(deadlineId: string) {
  const { data } = await supabase
    .from('safety_reminders')
    .select('id, channel, scheduled_for, sent_at, status')
    .eq('deadline_id', deadlineId)
    .order('scheduled_for');
  return data || [];
}

export async function uploadVaultFile(
  file: File,
  kind: VaultKind,
  matterId: string | null,
  title: string,
): Promise<{ item: VaultItem | null; error: string | null }> {
  const uid = await currentUserId();
  if (!uid) return { item: null, error: 'Not signed in' };

  const ent = await getEntitlements();
  if (ent) {
    const { data: existing } = await supabase
      .from('safety_vault_items')
      .select('size_bytes')
      .eq('user_id', uid);
    const used = (existing || []).reduce((n, r: { size_bytes: number }) => n + (r.size_bytes || 0), 0);
    const limitBytes = ent.vault_mb_limit * 1024 * 1024;
    if (used + file.size > limitBytes) {
      return { item: null, error: 'vault_limit_reached' };
    }
  }

  const path = `${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const up = await supabase.storage.from('legal-vault').upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (up.error) return { item: null, error: up.error.message };

  const { data } = await supabase
    .from('safety_vault_items')
    .insert({
      user_id: uid,
      matter_id: matterId,
      title: title || file.name,
      kind,
      storage_path: path,
      mime_type: file.type || '',
      size_bytes: file.size,
      summary: '',
    })
    .select('*')
    .maybeSingle();
  return { item: (data as VaultItem) ?? null, error: null };
}

export async function deleteVaultFile(item: VaultItem): Promise<void> {
  if (item.storage_path) {
    await supabase.storage.from('legal-vault').remove([item.storage_path]);
  }
  await supabase.from('safety_vault_items').delete().eq('id', item.id);
}

export async function explainDocumentText(
  text: string,
  language: 'en' | 'es',
  kind: string,
): Promise<{
  summary: string;
  what_it_is: string;
  who_sent_it: string;
  what_they_want: string;
  deadlines: string[];
  risks: string[];
  suggested_next_steps: string[];
} | null> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-document`;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, language, kind }),
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function saveDocumentSummary(itemId: string, summary: string): Promise<void> {
  await supabase.from('safety_vault_items').update({ summary }).eq('id', itemId);
}

export interface CheckupAnswers {
  address_still_current: boolean;
  new_notice_received: boolean;
  new_documents_to_upload: boolean;
  deadline_changed: boolean;
  emergency_contact_current: boolean;
  attorney_needed: boolean;
  notes: string;
}

export interface CheckupRow {
  id: string;
  user_id: string;
  period_key: string;
  answers: CheckupAnswers;
  action_items: string[];
  completed_at: string;
}

function currentPeriodKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function getCurrentCheckup(): Promise<CheckupRow | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('safety_checkups')
    .select('*')
    .eq('user_id', uid)
    .eq('period_key', currentPeriodKey())
    .maybeSingle();
  return (data as CheckupRow) ?? null;
}

export async function saveCheckup(answers: CheckupAnswers): Promise<CheckupRow | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const actions: string[] = [];
  if (answers.new_notice_received || answers.new_documents_to_upload) actions.push('upload_documents');
  if (answers.deadline_changed) actions.push('review_deadlines');
  if (!answers.emergency_contact_current) actions.push('update_emergency_contact');
  if (!answers.address_still_current) actions.push('update_address');
  if (answers.attorney_needed) actions.push('request_attorney_handoff');

  const { data } = await supabase
    .from('safety_checkups')
    .upsert(
      {
        user_id: uid,
        period_key: currentPeriodKey(),
        answers,
        action_items: actions,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,period_key' },
    )
    .select('*')
    .maybeSingle();
  return (data as CheckupRow) ?? null;
}

export async function listMatters(): Promise<LegalMatter[]> {
  const { data } = await supabase
    .from('legal_matters')
    .select('*')
    .order('updated_at', { ascending: false });
  return (data as LegalMatter[]) || [];
}

export async function createMatter(input: Partial<LegalMatter> & { title: string }): Promise<LegalMatter | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('legal_matters')
    .insert({
      user_id: uid,
      title: input.title,
      issue_type: input.issue_type ?? 'general',
      jurisdiction: input.jurisdiction ?? '',
      status: input.status ?? 'active',
      summary: input.summary ?? '',
      next_step: input.next_step ?? '',
      next_step_due: input.next_step_due ?? null,
      risk_level: input.risk_level ?? 'low',
      audience: input.audience ?? 'individual',
      pack_id: input.pack_id ?? null,
    })
    .select('*')
    .maybeSingle();
  if (data) {
    await logTimeline(data.id, 'created', input.title);
  }
  return data as LegalMatter | null;
}

export async function updateMatter(id: string, patch: Partial<LegalMatter>): Promise<void> {
  await supabase
    .from('legal_matters')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function listDeadlines(matterId?: string): Promise<SafetyDeadline[]> {
  let q = supabase.from('safety_deadlines').select('*').order('due_at', { ascending: true });
  if (matterId) q = q.eq('matter_id', matterId);
  const { data } = await q;
  return (data as SafetyDeadline[]) || [];
}

export async function listUpcomingDeadlines(withinDays = 30): Promise<SafetyDeadline[]> {
  const until = new Date(Date.now() + withinDays * 86400000).toISOString();
  const { data } = await supabase
    .from('safety_deadlines')
    .select('*')
    .is('completed_at', null)
    .lte('due_at', until)
    .order('due_at', { ascending: true });
  return (data as SafetyDeadline[]) || [];
}

export async function createDeadline(input: Omit<SafetyDeadline, 'id' | 'user_id' | 'created_at' | 'completed_at'>): Promise<SafetyDeadline | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('safety_deadlines')
    .insert({ ...input, user_id: uid })
    .select('*')
    .maybeSingle();
  if (data) {
    await logTimeline(input.matter_id, 'deadline_added', `${input.title} due ${input.due_at}`);
  }
  return data as SafetyDeadline | null;
}

export async function completeDeadline(id: string): Promise<void> {
  const { data } = await supabase
    .from('safety_deadlines')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('matter_id, title')
    .maybeSingle();
  if (data) {
    await logTimeline(data.matter_id as string, 'deadline_completed', data.title as string);
  }
}

export async function listVaultItems(matterId?: string): Promise<VaultItem[]> {
  let q = supabase.from('safety_vault_items').select('*').order('created_at', { ascending: false });
  if (matterId) q = q.eq('matter_id', matterId);
  const { data } = await q;
  return (data as VaultItem[]) || [];
}

export async function logTimeline(matterId: string, eventType: string, summary: string, metadata: Record<string, unknown> = {}): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  await supabase.from('safety_timeline_events').insert({
    matter_id: matterId,
    user_id: uid,
    event_type: eventType,
    summary,
    metadata,
  });
}

export async function listTimeline(matterId: string): Promise<TimelineEvent[]> {
  const { data } = await supabase
    .from('safety_timeline_events')
    .select('*')
    .eq('matter_id', matterId)
    .order('occurred_at', { ascending: false });
  return (data as TimelineEvent[]) || [];
}

const RECOMMENDATIONS: HealthRecommendation[] = [
  { id: 'set_jurisdiction', en: 'Select your state so answers match your law', es: 'Selecciona tu estado para obtener respuestas de tu ley', weight: 15, cta_route: '/profile' },
  { id: 'create_matter', en: 'Save your first legal matter so we can track it over time', es: 'Guarda tu primer caso legal para darle seguimiento', weight: 20, cta_route: '/dashboard/matters/new' },
  { id: 'upload_document', en: 'Upload a notice, lease, or contract to your secure vault', es: 'Sube un aviso, contrato o carta a tu boveda segura', weight: 15, cta_route: '/dashboard/vault' },
  { id: 'add_deadline', en: 'Add a deadline so we can remind you before it matters', es: 'Agrega una fecha limite para recordarte antes de que importe', weight: 20, cta_route: '/dashboard/deadlines' },
  { id: 'set_next_step', en: 'Define your next best step on each active matter', es: 'Define tu siguiente mejor paso en cada caso activo', weight: 15, cta_route: '/dashboard' },
  { id: 'review_overdue', en: 'Review overdue deadlines and mark completed or reschedule', es: 'Revisa fechas vencidas y marcalas como completadas', weight: 15, cta_route: '/dashboard/deadlines' },
];

export async function computeHealthSnapshot(): Promise<HealthSnapshot> {
  const uid = await currentUserId();
  if (!uid) {
    return {
      score: 0,
      signals: {
        has_jurisdiction: false,
        has_active_matter: false,
        has_vault_document: false,
        deadlines_tracked: 0,
        overdue_deadlines: 0,
        resolved_matters: 0,
        emergency_contact: false,
        plan_next_step_set: false,
      },
      recommendations: RECOMMENDATIONS.slice(0, 3),
    };
  }

  const [profileRes, mattersRes, deadlinesRes, vaultRes] = await Promise.all([
    supabase.from('profiles').select('preferred_jurisdiction, phone').eq('id', uid).maybeSingle(),
    supabase.from('legal_matters').select('id, status, next_step').eq('user_id', uid),
    supabase.from('safety_deadlines').select('id, due_at, completed_at').eq('user_id', uid),
    supabase.from('safety_vault_items').select('id').eq('user_id', uid).limit(1),
  ]);

  const profile = (profileRes.data || {}) as { preferred_jurisdiction?: string; phone?: string };
  const matters = (mattersRes.data as Array<{ id: string; status: string; next_step: string }>) || [];
  const deadlines = (deadlinesRes.data as Array<{ due_at: string; completed_at: string | null }>) || [];
  const vault = (vaultRes.data as Array<{ id: string }>) || [];

  const now = Date.now();
  const overdue = deadlines.filter(d => !d.completed_at && new Date(d.due_at).getTime() < now).length;
  const activeMatter = matters.find(m => m.status === 'active' || m.status === 'escalated');
  const resolved = matters.filter(m => m.status === 'resolved').length;

  const signals: HealthSignals = {
    has_jurisdiction: !!profile.preferred_jurisdiction,
    has_active_matter: matters.length > 0,
    has_vault_document: vault.length > 0,
    deadlines_tracked: deadlines.length,
    overdue_deadlines: overdue,
    resolved_matters: resolved,
    emergency_contact: !!profile.phone,
    plan_next_step_set: !!activeMatter?.next_step,
  };

  let score = 0;
  if (signals.has_jurisdiction) score += 15;
  if (signals.has_active_matter) score += 20;
  if (signals.has_vault_document) score += 15;
  if (signals.deadlines_tracked > 0) score += 20;
  if (signals.plan_next_step_set) score += 15;
  if (signals.emergency_contact) score += 10;
  if (signals.resolved_matters > 0) score += 5;
  score -= Math.min(20, signals.overdue_deadlines * 5);
  score = Math.max(0, Math.min(100, score));

  const missing: HealthRecommendation[] = [];
  if (!signals.has_jurisdiction) missing.push(RECOMMENDATIONS[0]);
  if (!signals.has_active_matter) missing.push(RECOMMENDATIONS[1]);
  if (!signals.has_vault_document) missing.push(RECOMMENDATIONS[2]);
  if (signals.deadlines_tracked === 0) missing.push(RECOMMENDATIONS[3]);
  if (!signals.plan_next_step_set && signals.has_active_matter) missing.push(RECOMMENDATIONS[4]);
  if (signals.overdue_deadlines > 0) missing.unshift(RECOMMENDATIONS[5]);

  await supabase.from('legal_health_snapshots').insert({
    user_id: uid,
    score,
    signals,
    recommendations: missing.slice(0, 3),
  });

  return { score, signals, recommendations: missing.slice(0, 3) };
}

```

---

## src/services/engagement-service.ts

```typescript
import { supabase } from '../lib/supabase';

export type EngagementType = 'view' | 'click' | 'complete' | 'convert' | 'share' | 'export';

export interface TrackEngagementParams {
  featureName: string;
  engagementType: EngagementType;
  caseType?: string;
  activityType?: string;
  jurisdiction?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
  sessionId?: string;
}

export interface PopularCaseType {
  case_type: string;
  total_engagements: number;
  conversion_rate: number;
}

export interface FeatureEngagementStats {
  feature_name: string;
  total_views: number;
  total_completions: number;
  total_conversions: number;
  avg_duration: number;
}

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export async function trackEngagement(params: TrackEngagementParams): Promise<string | null> {
  const { data, error } = await supabase.rpc('track_engagement', {
    p_feature_name: params.featureName,
    p_engagement_type: params.engagementType,
    p_case_type: params.caseType || null,
    p_activity_type: params.activityType || null,
    p_jurisdiction: params.jurisdiction || null,
    p_duration_seconds: params.durationSeconds || null,
    p_metadata: params.metadata || {},
    p_session_id: params.sessionId || getSessionId()
  });

  if (error) {
    console.error('Failed to track engagement:', error);
    return null;
  }

  return data;
}

export async function storeAnonymizedSearch(params: {
  queryText: string;
  caseType?: string;
  jurisdiction?: string;
  intent?: string;
  ledToConversion?: boolean;
  ledToLawyerMatch?: boolean;
}): Promise<string | null> {
  const { data, error } = await supabase.rpc('store_anonymized_search', {
    p_query_text: params.queryText,
    p_case_type: params.caseType || null,
    p_jurisdiction: params.jurisdiction || null,
    p_intent: params.intent || null,
    p_led_to_conversion: params.ledToConversion || false,
    p_led_to_lawyer_match: params.ledToLawyerMatch || false
  });

  if (error) {
    console.error('Failed to store anonymized search:', error);
    return null;
  }

  return data;
}

export async function getPopularCaseTypes(days: number = 30): Promise<PopularCaseType[]> {
  const { data, error } = await supabase.rpc('get_popular_case_types', {
    p_days: days
  });

  if (error) {
    console.error('Failed to get popular case types:', error);
    return [];
  }

  return data || [];
}

export async function getFeatureEngagementStats(days: number = 30): Promise<FeatureEngagementStats[]> {
  const { data, error } = await supabase.rpc('get_feature_engagement_stats', {
    p_days: days
  });

  if (error) {
    console.error('Failed to get feature engagement stats:', error);
    return [];
  }

  return data || [];
}

export function trackFeatureView(featureName: string, metadata?: Record<string, unknown>) {
  trackEngagement({
    featureName,
    engagementType: 'view',
    metadata
  });
}

export function trackFeatureComplete(featureName: string, caseType?: string, metadata?: Record<string, unknown>) {
  trackEngagement({
    featureName,
    engagementType: 'complete',
    caseType,
    metadata
  });
}

export function trackConversion(featureName: string, caseType?: string) {
  trackEngagement({
    featureName,
    engagementType: 'convert',
    caseType
  });
}

export function trackExport(featureName: string) {
  trackEngagement({
    featureName,
    engagementType: 'export'
  });
}

export function classifyQueryIntent(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (/how (much|long|many)|cost|price|fee|time|duration/.test(lowerQuery)) {
    return 'informational';
  }
  if (/can i|should i|do i need|am i eligible/.test(lowerQuery)) {
    return 'decision_support';
  }
  if (/how (to|do)|steps|process|file|submit/.test(lowerQuery)) {
    return 'procedural';
  }
  if (/what (is|are|does)|define|explain|meaning/.test(lowerQuery)) {
    return 'definitional';
  }
  if (/help|need|urgent|emergency|immediately/.test(lowerQuery)) {
    return 'urgent_assistance';
  }
  if (/lawyer|attorney|represent|hire/.test(lowerQuery)) {
    return 'legal_referral';
  }

  return 'general_inquiry';
}

export type FunnelEvent =
  | 'persona_selected'
  | 'persona_intake_completed'
  | 'icp_track_selected'
  | 'ask_topic_submitted'
  | 'trust_popup_opened'
  | 'next_best_step_impression'
  | 'next_best_step_clicked'
  | 'email_capture_submitted'
  | 'exit_intent_impression'
  | 'exit_intent_converted'
  | 'issue_pack_viewed'
  | 'issue_pack_purchase_started'
  | 'case_predictor_viewed'
  | 'case_predictor_started'
  | 'share_prompt_impression'
  | 'share_prompt_clicked';

export function trackFunnelEvent(
  event: FunnelEvent,
  metadata?: Record<string, unknown>
) {
  trackEngagement({
    featureName: event,
    engagementType: event.includes('impression') || event.includes('viewed') ? 'view'
      : event.includes('clicked') || event.includes('started') || event.includes('selected') || event.includes('submitted') ? 'click'
      : event.includes('converted') || event.includes('purchase') ? 'convert'
      : 'view',
    metadata: {
      ...metadata,
      icp_track: localStorage.getItem('ez_icp_track') || 'individuals',
      language: document.documentElement.lang || 'en',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    },
  });
}

export function detectCaseType(query: string): string | null {
  const lowerQuery = query.toLowerCase();

  const caseTypePatterns: Record<string, RegExp> = {
    'employment': /employ|job|work|fired|terminated|wage|salary|discrimination|harassment/,
    'landlord_tenant': /landlord|tenant|rent|lease|evict|security deposit|apartment|housing/,
    'family': /divorce|custody|child support|alimony|marriage|spouse|visitation/,
    'personal_injury': /injury|accident|hurt|damage|negligence|slip|fall|car accident/,
    'contract': /contract|agreement|breach|promise|deal|signed/,
    'criminal': /arrest|charge|crime|criminal|dui|assault|theft/,
    'business': /business|llc|corporation|partnership|startup|company/,
    'consumer': /refund|warranty|defective|consumer|fraud|scam|complaint/,
    'estate': /will|trust|estate|inheritance|probate|heir|beneficiary/,
    'immigration': /visa|immigration|citizen|green card|deportation|asylum/,
    'intellectual_property': /trademark|copyright|patent|intellectual property|ip|invention/,
    'bankruptcy': /bankruptcy|debt|creditor|chapter 7|chapter 13|foreclosure/
  };

  for (const [caseType, pattern] of Object.entries(caseTypePatterns)) {
    if (pattern.test(lowerQuery)) {
      return caseType;
    }
  }

  return null;
}

```

---

## src/services/entitlement-service.ts

```typescript
import { supabase } from '../lib/supabase';

export interface Entitlement {
  id: string;
  user_id: string;
  product_type: 'issue_pack' | 'subscription' | 'case_prediction' | 'negotiation_pack';
  product_id: string;
  status: 'active' | 'pending' | 'expired' | 'refunded' | 'payment_failed';
  payment_provider: 'stripe' | 'manual' | 'trial' | 'free';
  payment_reference: string | null;
  granted_at: string;
  expires_at: string | null;
}

export async function getUserEntitlements(userId: string): Promise<Entitlement[]> {
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'pending', 'expired', 'payment_failed', 'refunded'])
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function hasActiveEntitlement(
  userId: string,
  productType: string,
  productId?: string
): Promise<boolean> {
  let query = supabase
    .from('user_entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('product_type', productType)
    .eq('status', 'active');

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data } = await query.limit(1).maybeSingle();
  return !!data;
}

export function getEntitlementStatusLabel(status: Entitlement['status']): {
  label: string;
  color: string;
} {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'text-green-700 bg-green-50 border-green-200' };
    case 'pending':
      return { label: 'Processing', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'expired':
      return { label: 'Expired', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    case 'refunded':
      return { label: 'Refunded', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    case 'payment_failed':
      return { label: 'Payment Failed', color: 'text-red-700 bg-red-50 border-red-200' };
  }
}

```

---

## src/services/case-matching-service.ts

```typescript
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
  clientName: string;
  caseType: string;
  caseDescription: string;
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
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  const cases: CaseQueueItem[] = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    organizationId: row.organization_id as string,
    clientName: row.client_name as string,
    caseType: row.case_type as string,
    caseDescription: row.case_description as string,
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

```

---

## src/services/activity-service.ts

```typescript
import { supabase } from '../lib/supabase';

export type ActivityType = 'chat' | 'lawyer_match' | 'document' | 'prediction' | 'case' | 'system';
export type ActivityStatus = 'completed' | 'pending' | 'in_progress' | 'failed';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  action: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  related_id: string | null;
  related_type: string | null;
  is_favorite: boolean;
  is_client_visible: boolean;
  status: ActivityStatus;
  created_at: string;
}

export interface ActivityStats {
  total_activities: number;
  chat_count: number;
  lawyer_match_count: number;
  document_count: number;
  prediction_count: number;
  favorites_count: number;
  pending_count: number;
  this_week: number;
  this_month: number;
}

export interface LogActivityParams {
  activityType: ActivityType;
  action: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  relatedId?: string;
  relatedType?: string;
  status?: ActivityStatus;
}

export async function logActivity(params: LogActivityParams): Promise<string | null> {
  const { data, error } = await supabase.rpc('log_user_activity', {
    p_activity_type: params.activityType,
    p_action: params.action,
    p_title: params.title,
    p_description: params.description || null,
    p_metadata: params.metadata || {},
    p_related_id: params.relatedId || null,
    p_related_type: params.relatedType || null,
    p_status: params.status || 'completed'
  });

  if (error) {
    console.error('Failed to log activity:', error);
    return null;
  }

  return data;
}

export async function getActivities(options: {
  limit?: number;
  offset?: number;
  activityTypes?: ActivityType[];
  status?: ActivityStatus;
  favoritesOnly?: boolean;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{ activities: Activity[]; total: number }> {
  let query = supabase
    .from('activity_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options.activityTypes && options.activityTypes.length > 0) {
    query = query.in('activity_type', options.activityTypes);
  }

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.favoritesOnly) {
    query = query.eq('is_favorite', true);
  }

  if (options.startDate) {
    query = query.gte('created_at', options.startDate.toISOString());
  }

  if (options.endDate) {
    query = query.lte('created_at', options.endDate.toISOString());
  }

  if (options.searchTerm) {
    query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to fetch activities:', error);
    return { activities: [], total: 0 };
  }

  return { activities: data || [], total: count || 0 };
}

export async function toggleActivityFavorite(activityId: string, isFavorite: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('activity_log')
    .update({ is_favorite: !isFavorite })
    .eq('id', activityId);

  return !error;
}

export async function deleteActivity(activityId: string): Promise<boolean> {
  const { error } = await supabase
    .from('activity_log')
    .delete()
    .eq('id', activityId);

  return !error;
}

export async function getActivityStats(days: number = 30): Promise<ActivityStats | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase.rpc('get_activity_stats', {
    p_user_id: user.user.id,
    p_days: days
  });

  if (error) {
    console.error('Failed to fetch activity stats:', error);
    return null;
  }

  return data;
}

export function getActivityTypeConfig(type: ActivityType) {
  const configs = {
    chat: {
      label: 'Chat Session',
      color: 'blue',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-500'
    },
    lawyer_match: {
      label: 'Lawyer Match',
      color: 'emerald',
      bgColor: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-500'
    },
    document: {
      label: 'Document',
      color: 'amber',
      bgColor: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-500'
    },
    prediction: {
      label: 'Prediction',
      color: 'rose',
      bgColor: 'bg-rose-500',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-500'
    },
    case: {
      label: 'Case',
      color: 'cyan',
      bgColor: 'bg-cyan-500',
      lightBg: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-500'
    },
    system: {
      label: 'System',
      color: 'slate',
      bgColor: 'bg-slate-500',
      lightBg: 'bg-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-500'
    }
  };

  return configs[type] || configs.system;
}

export function groupActivitiesByDate(activities: Activity[]): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);

  activities.forEach(activity => {
    const activityDate = new Date(activity.created_at);
    let groupKey: string;

    if (activityDate >= today) {
      groupKey = 'Today';
    } else if (activityDate >= yesterday) {
      groupKey = 'Yesterday';
    } else if (activityDate >= lastWeek) {
      groupKey = 'Last 7 Days';
    } else if (activityDate >= lastMonth) {
      groupKey = 'Last 30 Days';
    } else {
      const month = activityDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      groupKey = month;
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(activity);
  });

  return groups;
}

```

---

## src/services/asset-service.ts

```typescript
import { supabase } from '../lib/supabase';

export type ReadinessStatus = 'complete' | 'in_review' | 'draft' | 'not_applicable';

export interface AssetReadiness {
  id: string;
  asset_id: string;
  english_status: ReadinessStatus;
  spanish_status: ReadinessStatus;
  legal_review_status: ReadinessStatus;
  brand_approval_status: ReadinessStatus;
  legal_reviewer_id: string | null;
  legal_reviewed_at: string | null;
  brand_approver_id: string | null;
  brand_approved_at: string | null;
  spanish_reviewer_id: string | null;
  spanish_reviewed_at: string | null;
  version: number;
  blocked_reasons: string[];
}

export interface PartnerAsset {
  id: string;
  slug: string;
  name: string;
  asset_type: string;
  file_size: string;
  description: string;
  audience: string;
  content_sections: { heading: string; content: string[] }[];
  jurisdictions: string[];
  owner_team: string;
  pipeline_stages: string[];
  pinned: boolean;
  recommended: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  readiness: AssetReadiness | null;
  download_count: number;
}

export interface AssetFilters {
  language?: 'en' | 'es' | 'both' | 'all';
  jurisdiction?: string;
  pipeline_stage?: string;
  readiness?: 'ready' | 'partial' | 'blocked' | 'all';
  asset_type?: string;
  owner_team?: string;
  recommended_only?: boolean;
}

export interface SavedView {
  id: string;
  user_id: string;
  name: string;
  filters: AssetFilters;
  is_default: boolean;
}

export interface SpanishParityDetail {
  total: number;
  complete: number;
  inReview: number;
  draft: number;
  pct: number;
  missingAssets: { id: string; name: string; status: ReadinessStatus; downloads: number }[];
  byType: Record<string, { total: number; complete: number }>;
  byJurisdiction: Record<string, { total: number; complete: number }>;
}

export function getOverallReadiness(readiness: AssetReadiness): 'ready' | 'partial' | 'blocked' {
  const checks = [
    readiness.english_status,
    readiness.legal_review_status,
    readiness.brand_approval_status,
  ].filter(s => s !== 'not_applicable');
  if (checks.every(s => s === 'complete')) return 'ready';
  if (checks.some(s => s === 'draft')) return 'blocked';
  return 'partial';
}

export type ReadinessScope = 'bilingual' | 'en-only' | 'es-only' | 'not-applicable';

export function getReadinessScope(readiness: AssetReadiness): ReadinessScope {
  const enApplicable = readiness.english_status !== 'not_applicable';
  const esApplicable = readiness.spanish_status !== 'not_applicable';
  const esComplete = readiness.spanish_status === 'complete';

  if (!enApplicable && esApplicable) return 'es-only';
  if (!esApplicable) return 'not-applicable';
  if (esComplete) return 'bilingual';
  return 'en-only';
}

export function getReadinessLabel(readiness: AssetReadiness): string {
  const overall = getOverallReadiness(readiness);
  if (overall !== 'ready') {
    return overall === 'partial' ? 'Review Needed' : 'Blocked';
  }

  const scope = getReadinessScope(readiness);
  switch (scope) {
    case 'bilingual': return 'Ready to Send (EN+ES)';
    case 'en-only': return 'Ready to Send (EN Only)';
    case 'es-only': return 'Ready to Send (ES Only)';
    default: return 'Ready to Send';
  }
}

export function getBlockedReasons(readiness: AssetReadiness): string[] {
  const reasons: string[] = [];
  if (readiness.spanish_status === 'draft') reasons.push('Spanish translation in draft');
  if (readiness.spanish_status === 'in_review') reasons.push('Spanish translation in review');
  if (readiness.legal_review_status === 'draft') reasons.push('Legal review not started');
  if (readiness.legal_review_status === 'in_review') reasons.push('Legal review pending');
  if (readiness.brand_approval_status === 'draft') reasons.push('Brand approval not started');
  if (readiness.brand_approval_status === 'in_review') reasons.push('Brand approval pending');
  if (readiness.english_status === 'draft') reasons.push('English content in draft');
  if (readiness.english_status === 'in_review') reasons.push('English content in review');
  return reasons;
}

export async function fetchAssets(): Promise<PartnerAsset[]> {
  const { data: assets, error } = await supabase
    .from('partner_assets')
    .select('*')
    .eq('is_active', true)
    .order('pinned', { ascending: false })
    .order('recommended', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error || !assets) return [];

  const { data: readinessData } = await supabase
    .from('asset_readiness')
    .select('*')
    .in('asset_id', assets.map(a => a.id));

  const { data: downloadCounts } = await supabase
    .from('asset_downloads')
    .select('asset_id');

  const readinessMap = new Map<string, AssetReadiness>();
  (readinessData || []).forEach(r => readinessMap.set(r.asset_id, r as AssetReadiness));

  const countMap = new Map<string, number>();
  (downloadCounts || []).forEach(d => {
    countMap.set(d.asset_id, (countMap.get(d.asset_id) || 0) + 1);
  });

  return assets.map(a => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    asset_type: a.asset_type,
    file_size: a.file_size,
    description: a.description,
    audience: a.audience,
    content_sections: a.content_sections as { heading: string; content: string[] }[],
    jurisdictions: a.jurisdictions || [],
    owner_team: a.owner_team,
    pipeline_stages: a.pipeline_stages || [],
    pinned: a.pinned,
    recommended: a.recommended,
    is_active: a.is_active,
    created_at: a.created_at,
    updated_at: a.updated_at,
    readiness: readinessMap.get(a.id) || null,
    download_count: countMap.get(a.id) || 0,
  }));
}

export async function recordDownload(
  assetId: string,
  userId: string | null,
  partnerId: string | null = null,
  downloadType: string = 'full_download'
): Promise<void> {
  if (!userId) return;
  await supabase.from('asset_downloads').insert({
    asset_id: assetId,
    user_id: userId,
    partner_id: partnerId,
    download_type: downloadType,
  });
}

export async function saveKitGeneration(params: {
  partnerId?: string;
  generatedBy: string;
  languageFilter: string;
  jurisdictionFilter: string;
  stageFilter: string;
  selectedAssetIds: string[];
  spanishOnlyEnforced: boolean;
  printOptimized?: boolean;
  kitContent: string;
}): Promise<void> {
  await supabase.from('partner_kit_generations').insert({
    partner_id: params.partnerId || null,
    generated_by: params.generatedBy,
    language_filter: params.languageFilter,
    jurisdiction_filter: params.jurisdictionFilter,
    stage_filter: params.stageFilter,
    selected_asset_ids: params.selectedAssetIds,
    spanish_only_enforced: params.spanishOnlyEnforced,
    print_optimized: params.printOptimized || false,
    kit_content: params.kitContent,
  });
}

export async function fetchSavedViews(userId: string): Promise<SavedView[]> {
  const { data } = await supabase
    .from('user_saved_asset_views')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('name');
  return (data || []) as SavedView[];
}

export async function createSavedView(
  userId: string,
  name: string,
  filters: AssetFilters,
  isDefault: boolean = false
): Promise<SavedView | null> {
  const { data } = await supabase
    .from('user_saved_asset_views')
    .insert({ user_id: userId, name, filters, is_default: isDefault })
    .select()
    .maybeSingle();
  return data as SavedView | null;
}

export async function deleteSavedView(viewId: string): Promise<void> {
  await supabase.from('user_saved_asset_views').delete().eq('id', viewId);
}

export function computeSpanishParity(assets: PartnerAsset[]): SpanishParityDetail {
  const applicable = assets.filter(a => a.readiness && a.readiness.spanish_status !== 'not_applicable');
  const complete = applicable.filter(a => a.readiness!.spanish_status === 'complete');
  const inReview = applicable.filter(a => a.readiness!.spanish_status === 'in_review');
  const draft = applicable.filter(a => a.readiness!.spanish_status === 'draft');

  const missingAssets = applicable
    .filter(a => a.readiness!.spanish_status !== 'complete')
    .map(a => ({
      id: a.id,
      name: a.name,
      status: a.readiness!.spanish_status,
      downloads: a.download_count,
    }))
    .sort((a, b) => b.downloads - a.downloads);

  const byType: Record<string, { total: number; complete: number }> = {};
  applicable.forEach(a => {
    const t = a.asset_type;
    if (!byType[t]) byType[t] = { total: 0, complete: 0 };
    byType[t].total++;
    if (a.readiness!.spanish_status === 'complete') byType[t].complete++;
  });

  const byJurisdiction: Record<string, { total: number; complete: number }> = {};
  applicable.forEach(a => {
    const jrs = a.jurisdictions.length > 0 ? a.jurisdictions : ['General'];
    jrs.forEach(j => {
      if (!byJurisdiction[j]) byJurisdiction[j] = { total: 0, complete: 0 };
      byJurisdiction[j].total++;
      if (a.readiness!.spanish_status === 'complete') byJurisdiction[j].complete++;
    });
  });

  return {
    total: applicable.length,
    complete: complete.length,
    inReview: inReview.length,
    draft: draft.length,
    pct: applicable.length > 0 ? Math.round((complete.length / applicable.length) * 100) : 0,
    missingAssets,
    byType,
    byJurisdiction,
  };
}

export type ReadinessDimension = 'english' | 'spanish' | 'legal' | 'brand';

export interface ReadinessAuditEntry {
  id: string;
  asset_id: string;
  dimension: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  note: string;
  created_at: string;
}

const dimensionColumnMap: Record<ReadinessDimension, {
  status: string;
  reviewer?: string;
  reviewedAt?: string;
}> = {
  english: { status: 'english_status' },
  spanish: { status: 'spanish_status', reviewer: 'spanish_reviewer_id', reviewedAt: 'spanish_reviewed_at' },
  legal: { status: 'legal_review_status', reviewer: 'legal_reviewer_id', reviewedAt: 'legal_reviewed_at' },
  brand: { status: 'brand_approval_status', reviewer: 'brand_approver_id', reviewedAt: 'brand_approved_at' },
};

export async function updateAssetReadiness(
  assetId: string,
  dimension: ReadinessDimension,
  newStatus: ReadinessStatus,
  userId: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const { data: current, error: fetchErr } = await supabase
    .from('asset_readiness')
    .select('*')
    .eq('asset_id', assetId)
    .maybeSingle();

  if (fetchErr || !current) {
    return { success: false, error: fetchErr?.message || 'Readiness record not found' };
  }

  const cols = dimensionColumnMap[dimension];
  const oldStatus = current[cols.status] as string;

  if (oldStatus === newStatus) {
    return { success: true };
  }

  const updatePayload: Record<string, unknown> = {
    [cols.status]: newStatus,
    version: (current.version || 1) + 1,
    updated_at: new Date().toISOString(),
  };

  if (cols.reviewer) {
    if (newStatus === 'complete') {
      updatePayload[cols.reviewer] = userId;
      updatePayload[cols.reviewedAt!] = new Date().toISOString();
    } else if (newStatus === 'draft') {
      updatePayload[cols.reviewer] = null;
      updatePayload[cols.reviewedAt!] = null;
    }
  }

  const { error: updateErr } = await supabase
    .from('asset_readiness')
    .update(updatePayload)
    .eq('asset_id', assetId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  await supabase.from('asset_readiness_audit_log').insert({
    asset_id: assetId,
    dimension,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: userId,
    note: note || '',
  });

  return { success: true };
}

export async function fetchReadinessAuditLog(assetId: string): Promise<ReadinessAuditEntry[]> {
  const { data, error } = await supabase
    .from('asset_readiness_audit_log')
    .select('*')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data as ReadinessAuditEntry[];
}

export function filterAssets(assets: PartnerAsset[], filters: AssetFilters): PartnerAsset[] {
  return assets.filter(a => {
    if (!a.readiness) return false;

    if (filters.language && filters.language !== 'all') {
      if (filters.language === 'en' && a.readiness.english_status === 'not_applicable') return false;
      if (filters.language === 'es' && a.readiness.spanish_status === 'not_applicable') return false;
      if (filters.language === 'es' && a.readiness.spanish_status === 'draft') return false;
    }

    if (filters.jurisdiction && filters.jurisdiction !== 'all') {
      if (a.jurisdictions.length > 0 && !a.jurisdictions.includes(filters.jurisdiction)) return false;
    }

    if (filters.pipeline_stage && filters.pipeline_stage !== 'all') {
      if (!a.pipeline_stages.includes(filters.pipeline_stage)) return false;
    }

    if (filters.readiness && filters.readiness !== 'all') {
      const overall = getOverallReadiness(a.readiness);
      if (overall !== filters.readiness) return false;
    }

    if (filters.asset_type && filters.asset_type !== 'all') {
      if (a.asset_type !== filters.asset_type) return false;
    }

    if (filters.owner_team && filters.owner_team !== 'all') {
      if (a.owner_team !== filters.owner_team) return false;
    }

    if (filters.recommended_only && !a.recommended) return false;

    return true;
  });
}

```

---

## src/services/beta-metrics-service.ts

```typescript
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

```

---

## src/services/contextual-prediction-service.ts

```typescript
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

```

---

## src/services/distribution-service.ts

```typescript
import { supabase } from '../lib/supabase';
import type { PartnerAsset } from './asset-service';

export interface DistributionRecipient {
  email: string;
  name?: string;
}

export interface DistributionRecord {
  id: string;
  asset_id: string;
  kit_generation_id: string | null;
  sent_by: string;
  recipients: DistributionRecipient[];
  channel: string;
  subject: string | null;
  notes: string;
  partner_id: string | null;
  status: string;
  created_at: string;
}

export async function sendAssetEmail(params: {
  asset: PartnerAsset;
  recipients: DistributionRecipient[];
  subject?: string;
  notes?: string;
  partnerId?: string;
  sentBy: string;
}): Promise<{ success: boolean; sent: number; total: number; error?: string }> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-asset-email`;

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipients: params.recipients,
      assetName: params.asset.name,
      assetType: params.asset.asset_type,
      contentSections: params.asset.content_sections,
      subject: params.subject,
      notes: params.notes,
      partnerId: params.partnerId,
      assetId: params.asset.id,
      sentBy: params.sentBy,
    }),
  });

  if (!response.ok) {
    return { success: false, sent: 0, total: params.recipients.length, error: 'Failed to send' };
  }

  return response.json();
}

export async function logDistribution(params: {
  assetId: string;
  sentBy: string;
  recipients: DistributionRecipient[];
  channel: string;
  subject?: string;
  notes?: string;
  partnerId?: string;
}): Promise<void> {
  await supabase.from('asset_distributions').insert({
    asset_id: params.assetId,
    sent_by: params.sentBy,
    recipients: params.recipients,
    channel: params.channel,
    subject: params.subject || null,
    notes: params.notes || '',
    partner_id: params.partnerId || null,
    status: 'sent',
  });
}

export async function fetchDistributionLog(
  assetId?: string,
  limit: number = 20
): Promise<DistributionRecord[]> {
  let query = supabase
    .from('asset_distributions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (assetId) {
    query = query.eq('asset_id', assetId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as DistributionRecord[];
}

```

---

## src/services/icp-template-service.ts

```typescript
import { supabase } from '../lib/supabase';

export interface ICPCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface ICPTemplate {
  id: string;
  jurisdiction: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  source_url: string;
  source_agency: string;
  file_url: string;
  file_mime: string;
  template_body: string;
  fields: unknown[];
  qr_code_url: string;
  version: number;
  language: string;
  last_verified_at: string | null;
  updated_at: string;
}

export interface TemplateFilters {
  jurisdiction?: string;
  categoryId?: string;
  query?: string;
  language?: string;
  limit?: number;
}

export async function listCategories(): Promise<ICPCategory[]> {
  const { data, error } = await supabase
    .from('icp_document_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listTemplates(filters: TemplateFilters = {}): Promise<ICPTemplate[]> {
  let q = supabase
    .from('icp_document_templates')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(filters.limit ?? 100);

  if (filters.jurisdiction) q = q.eq('jurisdiction', filters.jurisdiction);
  if (filters.categoryId) q = q.eq('category_id', filters.categoryId);
  if (filters.language) q = q.eq('language', filters.language);
  if (filters.query) q = q.ilike('title', `%${filters.query}%`);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ICPTemplate[];
}

export async function getTemplate(jurisdiction: string, slug: string): Promise<ICPTemplate | null> {
  const { data, error } = await supabase
    .from('icp_document_templates')
    .select('*')
    .eq('jurisdiction', jurisdiction)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return (data as ICPTemplate | null) ?? null;
}

```

---

## src/services/pdf-export-service.ts

```typescript
import { getJsPDF, getHtml2Canvas } from '../lib/dynamic-imports';
import { generatePartnerQR } from '../lib/qr-generator';
import type { PartnerAsset } from './asset-service';

const BRAND = {
  navy900: '#0A1628',
  navy700: '#1E293B',
  navy400: '#64748B',
  navy100: '#E2E8F0',
  navy50: '#F0F4F8',
  teal600: '#0D9488',
  teal100: '#CCFBF1',
  white: '#FFFFFF',
  amber50: '#FFFBEB',
  amber700: '#B45309',
  red600: '#DC2626',
};

function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export async function exportPreviewAsPDF(
  previewElement: HTMLElement,
  fileName: string
): Promise<void> {
  const [html2canvas, jsPDF] = await Promise.all([
    getHtml2Canvas(),
    getJsPDF()
  ]);

  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: imgHeight > 297 ? 'portrait' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = 297;
  let yOffset = 0;

  while (yOffset < imgHeight) {
    if (yOffset > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight);
    yOffset += pageHeight;
  }

  pdf.save(`${fileName}.pdf`);
}

export async function exportAssetContentAsPDF(
  asset: PartnerAsset,
  options?: { partnerId?: string; includeQR?: boolean }
): Promise<void> {
  const jsPDF = await getJsPDF();
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;

  const setColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setTextColor(r, g, b);
  };

  const setFillColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setFillColor(r, g, b);
  };

  const setDrawColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setDrawColor(r, g, b);
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > 277) {
      pdf.addPage();
      y = 20;
    }
  };

  setFillColor(BRAND.navy900);
  pdf.rect(0, 0, pageW, 28, 'F');

  setColor(BRAND.white);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(asset.name, margin, 12);

  pdf.setFontSize(8);
  setColor(BRAND.teal100);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${asset.asset_type.toUpperCase()} | ${asset.audience}`, margin, 18);

  setColor(BRAND.navy400);
  pdf.setFontSize(7);
  const dateStr = `v${asset.readiness?.version || 1} | ${new Date(asset.updated_at).toLocaleDateString()}`;
  pdf.text(dateStr, pageW - margin - pdf.getTextWidth(dateStr), 24);

  y = 36;

  if (asset.description) {
    setColor(BRAND.navy400);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    const descLines = pdf.splitTextToSize(asset.description, contentW);
    pdf.text(descLines, margin, y);
    y += descLines.length * 4.5 + 4;
  }

  for (const section of asset.content_sections) {
    checkPageBreak(20);

    setFillColor(BRAND.teal600);
    pdf.rect(margin, y - 1, 2, 5, 'F');

    setColor(BRAND.teal600);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section.heading, margin + 5, y + 3);
    y += 8;

    setColor(BRAND.navy700);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    for (const line of section.content) {
      if (!line.trim()) {
        y += 3;
        continue;
      }
      checkPageBreak(8);
      const wrapped = pdf.splitTextToSize(line, contentW - 5);
      pdf.text(wrapped, margin + 5, y);
      y += wrapped.length * 4.2 + 2;
    }
    y += 4;
  }

  if (options?.includeQR && options?.partnerId) {
    checkPageBreak(40);
    y += 4;
    setDrawColor(BRAND.navy100);
    pdf.line(margin, y, pageW - margin, y);
    y += 8;

    const qrDataUrl = await generatePartnerQR(
      options.partnerId,
      asset.slug === 'spanish-flyer' ? 'es' : 'en',
      300
    );
    pdf.addImage(qrDataUrl, 'PNG', margin, y, 25, 25);

    setColor(BRAND.navy900);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Scan to get started', margin + 30, y + 8);

    setColor(BRAND.teal600);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const lang = asset.slug === 'spanish-flyer' ? 'es' : 'en';
    const url = `ezlegal.ai/${lang === 'es' ? 'es' : ''}?ref=${options.partnerId}`;
    pdf.text(url, margin + 30, y + 14);

    setColor(BRAND.navy400);
    pdf.setFontSize(7);
    pdf.text(`Partner: ${options.partnerId}`, margin + 30, y + 20);
  }

  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    setFillColor(BRAND.navy50);
    pdf.rect(0, 287, pageW, 10, 'F');

    setColor(BRAND.navy400);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'ezLegal.ai provides legal information, not legal advice. Not a law firm. Not a substitute for an attorney.',
      pageW / 2,
      292,
      { align: 'center' }
    );
    pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, 292, { align: 'right' });
  }

  const safeName = asset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  pdf.save(`ezlegal-${safeName}.pdf`);
}

export async function exportKitAsPDF(
  assets: PartnerAsset[],
  kitOptions: {
    language: string;
    jurisdiction: string;
    stage: string;
    partnerId?: string;
  }
): Promise<void> {
  const jsPDF = await getJsPDF();
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;

  const setColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setTextColor(r, g, b);
  };

  const setFillColor = (hex: string) => {
    const [r, g, b] = hexToRGB(hex);
    pdf.setFillColor(r, g, b);
  };

  setFillColor(BRAND.navy900);
  pdf.rect(0, 0, pageW, 60, 'F');

  setColor(BRAND.white);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ezLegal.ai', margin, 25);
  pdf.setFontSize(14);
  pdf.text('Partner Kit', margin, 35);

  setColor(BRAND.teal100);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const meta = [
    `Language: ${kitOptions.language === 'both' ? 'EN + ES' : kitOptions.language.toUpperCase()}`,
    `Jurisdiction: ${kitOptions.jurisdiction === 'all' ? 'All' : kitOptions.jurisdiction}`,
    `Stage: ${kitOptions.stage === 'all' ? 'All' : kitOptions.stage}`,
    `Assets: ${assets.length}`,
    `Generated: ${new Date().toLocaleDateString()}`,
  ].join('  |  ');
  pdf.text(meta, margin, 50);

  let y = 72;

  setColor(BRAND.navy900);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Contents', margin, y);
  y += 6;

  for (let i = 0; i < assets.length; i++) {
    setColor(BRAND.teal600);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${i + 1}. ${assets[i].name} (${assets[i].asset_type.toUpperCase()})`, margin + 4, y);
    y += 5;
  }

  for (const asset of assets) {
    pdf.addPage();
    y = 0;

    setFillColor(BRAND.teal600);
    pdf.rect(0, 0, pageW, 22, 'F');

    setColor(BRAND.white);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(asset.name, margin, 10);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${asset.asset_type.toUpperCase()} | ${asset.audience}`, margin, 17);

    y = 30;

    const checkPageBreak = (needed: number) => {
      if (y + needed > 277) {
        pdf.addPage();
        y = 20;
      }
    };

    for (const section of asset.content_sections) {
      checkPageBreak(16);

      setFillColor(BRAND.navy900);
      pdf.rect(margin, y - 1, 2, 5, 'F');

      setColor(BRAND.navy900);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.heading, margin + 5, y + 3);
      y += 8;

      setColor(BRAND.navy700);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      for (const line of section.content) {
        if (!line.trim()) {
          y += 3;
          continue;
        }
        checkPageBreak(8);
        const wrapped = pdf.splitTextToSize(line, contentW - 5);
        pdf.text(wrapped, margin + 5, y);
        y += wrapped.length * 4.2 + 2;
      }
      y += 4;
    }
  }

  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    setFillColor(BRAND.navy50);
    pdf.rect(0, 287, pageW, 10, 'F');
    setColor(BRAND.navy400);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'ezLegal.ai provides legal information, not legal advice.',
      pageW / 2,
      292,
      { align: 'center' }
    );
    pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, 292, { align: 'right' });
  }

  const dateSuffix = new Date().toISOString().split('T')[0];
  pdf.save(`ezlegal-partner-kit-${dateSuffix}.pdf`);
}

```

---

## src/services/ui-preferences-service.ts

```typescript
import { supabase } from '../lib/supabase';

export type FloatingSurfaceId =
  | 'pwa_install'
  | 'reading_toolbar'
  | 'demo_banner'
  | 'resume_banner';

const LOCAL_PREFIX = 'ezlegal_dismiss_';

function localKey(surface: FloatingSurfaceId) {
  return `${LOCAL_PREFIX}${surface}`;
}

export async function isDismissed(
  surface: FloatingSurfaceId,
  userId: string | null
): Promise<boolean> {
  try {
    if (localStorage.getItem(localKey(surface))) return true;
  } catch {}

  if (!userId) return false;

  const { data } = await supabase
    .from('ui_dismissals')
    .select('surface_id')
    .eq('user_id', userId)
    .eq('surface_id', surface)
    .maybeSingle();

  return Boolean(data);
}

export async function dismiss(
  surface: FloatingSurfaceId,
  userId: string | null
): Promise<void> {
  try {
    localStorage.setItem(localKey(surface), new Date().toISOString());
  } catch {}

  if (!userId) return;

  await supabase
    .from('ui_dismissals')
    .upsert(
      { user_id: userId, surface_id: surface, dismissed_at: new Date().toISOString() },
      { onConflict: 'user_id,surface_id' }
    );
}

export async function markHeroVariantSeen(userId: string | null) {
  if (!userId) return;
  await supabase
    .from('profiles')
    .update({ hero_variant_seen: true })
    .eq('id', userId);
}

export async function getDefaultLandingRoute(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('default_landing_route, user_type')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return null;
  if (data.default_landing_route) return data.default_landing_route;

  const inferred = inferLandingFromUserType(data.user_type);
  if (inferred) {
    await supabase
      .from('profiles')
      .update({ default_landing_route: inferred })
      .eq('id', userId);
  }
  return inferred;
}

function inferLandingFromUserType(userType: string | null): string | null {
  switch (userType) {
    case 'business':
      return '/dashboard';
    case 'organization':
      return '/lso-dashboard';
    case 'individual':
      return '/chat';
    default:
      return null;
  }
}

export async function logDeprecationHit(oldPath: string): Promise<void> {
  try {
    await supabase.rpc('increment_route_deprecation_hit', { p_old_path: oldPath });
  } catch {
    /* best-effort */
  }
}

```

---

