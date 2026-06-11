import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import usePersonaRouting from '../hooks/usePersonaRouting';
import { supabase } from '../lib/supabase';
import { Plus, FileText, Download, Search, Sparkles, X, MapPin, CheckCircle, AlertTriangle, Wand2, Loader2, ScanLine, Building2, Users, Workflow, Award, Gavel, Scale, Upload } from 'lucide-react';
import { JURISDICTION_GROUPS, getJurisdictionName } from '../data/jurisdictions';
import ValidatedFormField from '../components/ValidatedFormField';
import DocumentOCRProcessor from '../components/DocumentOCRProcessor';
import AIModelSelector from '../components/AIModelSelector';
import DocumentIntelligencePanel from '../components/DocumentIntelligencePanel';
import { getFieldConfig, validateField } from '../lib/document-validation';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function stripThinkingDetails(text: string): string {
  if (!text) return '';
  let out = text;
  const endMarker = out.indexOf('---END_THINKING---');
  if (endMarker !== -1) {
    out = out.slice(endMarker + '---END_THINKING---'.length);
  } else if (out.includes('---THINKING_DETAILS---')) {
    const afterKey = out.lastIndexOf('KEY_ISSUE:');
    if (afterKey !== -1) {
      const nl = out.indexOf('\n', afterKey);
      out = nl !== -1 ? out.slice(nl + 1) : '';
    } else {
      out = out.replace(/---THINKING_DETAILS---[\s\S]*/g, '');
    }
  }
  return out
    .replace(/^\s*LEGAL_AREA:[^\n]*\n?/gm, '')
    .replace(/^\s*JURISDICTION:[^\n]*\n?/gm, '')
    .replace(/^\s*KEY_ISSUE:[^\n]*\n?/gm, '')
    .trim();
}

interface Document {
  id: string;
  title: string;
  document_type: string;
  content: string;
  template_used: string | null;
  created_at: string;
  jurisdiction?: string | null;
}

const templates = {
  '501c3_formation': {
    name: '501(c)(3) Formation',
    fields: ['organization_name', 'state', 'purpose', 'registered_agent', 'incorporator_name', 'effective_date'],
    template: `ARTICLES OF INCORPORATION FOR 501(c)(3) NONPROFIT

ARTICLE I - NAME
The name of this corporation is [organization_name].

ARTICLE II - PURPOSE
This corporation is organized exclusively for charitable, religious, educational, and/or scientific purposes under Section 501(c)(3) of the Internal Revenue Code.

The specific purpose of this corporation is: [purpose]

ARTICLE III - NONPROFIT STATUS
No part of the net earnings shall inure to the benefit of any private shareholder or individual.

ARTICLE IV - REGISTERED AGENT
The name and address of the registered agent in the State of [state] is: [registered_agent]

ARTICLE V - INCORPORATOR
The name and address of the incorporator is: [incorporator_name]

ARTICLE VI - DISSOLUTION
Upon dissolution, assets shall be distributed for exempt purposes under Section 501(c)(3) of the Internal Revenue Code.

ARTICLE VII - EFFECTIVE DATE
These Articles of Incorporation are effective as of [effective_date].

IN WITNESS WHEREOF, the undersigned incorporator has executed these Articles of Incorporation.

_______________________          _______________________
[incorporator_name]              Date
Incorporator`
  },
  general_partnership_formation: {
    name: 'General Partnership Formation',
    fields: ['partnership_name', 'partner1_name', 'partner2_name', 'business_purpose', 'capital_contribution', 'effective_date'],
    template: `GENERAL PARTNERSHIP AGREEMENT

This General Partnership Agreement is entered into as of [effective_date] by and between [partner1_name] and [partner2_name] (collectively, the "Partners").

ARTICLE I - FORMATION
The Partners hereby form a general partnership under the name [partnership_name].

ARTICLE II - PURPOSE
The purpose of the Partnership is: [business_purpose]

ARTICLE III - CAPITAL CONTRIBUTIONS
Each Partner shall contribute the following capital: $[capital_contribution]

ARTICLE IV - PROFIT AND LOSS SHARING
Profits and losses shall be shared equally among the Partners.

ARTICLE V - MANAGEMENT
All Partners shall have equal rights in the management and conduct of the Partnership business.

ARTICLE VI - TERM
The Partnership shall continue until dissolved by mutual agreement or operation of law.

IN WITNESS WHEREOF, the Partners have executed this Agreement.

_______________________          _______________________
[partner1_name]                  [partner2_name]
Partner                          Partner`
  },
  llc_dissolution: {
    name: 'LLC Dissolution',
    fields: ['llc_name', 'state', 'dissolution_date', 'member_name', 'reason_for_dissolution'],
    template: `ARTICLES OF DISSOLUTION

LIMITED LIABILITY COMPANY DISSOLUTION

ARTICLE I - COMPANY NAME
The name of the Limited Liability Company being dissolved is: [llc_name]

ARTICLE II - STATE OF FORMATION
This LLC was formed in the State of [state].

ARTICLE III - DISSOLUTION DATE
The effective date of dissolution is: [dissolution_date]

ARTICLE IV - REASON FOR DISSOLUTION
Reason for dissolution: [reason_for_dissolution]

ARTICLE V - MEMBER APPROVAL
The dissolution has been approved by the required vote of members.

ARTICLE VI - LIABILITIES
All debts, obligations, and liabilities of the LLC have been paid or adequately provided for.

ARTICLE VII - ASSET DISTRIBUTION
All remaining assets have been distributed to members according to the Operating Agreement.

ARTICLE VIII - CERTIFICATION
The undersigned certifies that the information contained herein is true and correct.

_______________________          _______________________
[member_name]                    Date
Member/Manager`
  },
  multiple_member_llc_formation: {
    name: 'Multiple Member LLC Formation',
    fields: ['llc_name', 'state', 'member1_name', 'member2_name', 'member1_ownership', 'member2_ownership', 'effective_date'],
    template: `OPERATING AGREEMENT FOR MULTIPLE MEMBER LLC

OPERATING AGREEMENT OF [llc_name], LLC

This Operating Agreement is entered into as of [effective_date].

ARTICLE I - FORMATION
The Members hereby form a Limited Liability Company under the laws of [state].

ARTICLE II - NAME AND PURPOSE
The name of the LLC is [llc_name], LLC. The LLC may engage in any lawful business activity.

ARTICLE III - MEMBERS AND OWNERSHIP
[member1_name]: [member1_ownership]%
[member2_name]: [member2_ownership]%

ARTICLE IV - CAPITAL CONTRIBUTIONS
Each Member shall contribute capital proportionate to their ownership interest.

ARTICLE V - DISTRIBUTIONS
Distributions shall be made to Members in proportion to their ownership percentages.

ARTICLE VI - MANAGEMENT
The LLC shall be managed by its Members. Major decisions require majority vote.

ARTICLE VII - TRANSFER OF INTERESTS
No Member may transfer their interest without written consent of other Members.

IN WITNESS WHEREOF, the Members have executed this Agreement.

_______________________          _______________________
[member1_name]                   [member2_name]`
  },
  asset_sale_purchase: {
    name: 'Prepare Asset Sale and Purchase Agreement',
    fields: ['seller_name', 'buyer_name', 'asset_description', 'purchase_price', 'closing_date'],
    template: `ASSET SALE AND PURCHASE AGREEMENT

This Asset Sale and Purchase Agreement is made between [seller_name] ("Seller") and [buyer_name] ("Buyer").

ARTICLE I - ASSETS BEING SOLD
The Seller agrees to sell and the Buyer agrees to purchase the following assets:
[asset_description]

ARTICLE II - PURCHASE PRICE
The total purchase price for the Assets is: $[purchase_price]

ARTICLE III - CLOSING
The closing of this transaction shall occur on [closing_date].

ARTICLE IV - REPRESENTATIONS
Seller represents that:
- Seller has full authority to sell the Assets
- The Assets are free and clear of all liens and encumbrances
- All information provided regarding the Assets is accurate

ARTICLE V - CONDITIONS
This sale is contingent upon:
- Buyer's satisfactory inspection of Assets
- Completion of due diligence
- Execution of all required documents

ARTICLE VI - TRANSFER OF OWNERSHIP
Title to the Assets shall transfer to Buyer upon receipt of full payment.

_______________________          _______________________
[seller_name]                    [buyer_name]
Seller                           Buyer`
  },
  buy_sell_agreement: {
    name: 'Prepare Buy-Sell Agreement',
    fields: ['company_name', 'owner1_name', 'owner2_name', 'trigger_event', 'valuation_method', 'effective_date'],
    template: `BUY-SELL AGREEMENT

This Buy-Sell Agreement is made as of [effective_date] among the owners of [company_name].

ARTICLE I - PARTIES
Owner 1: [owner1_name]
Owner 2: [owner2_name]

ARTICLE II - PURPOSE
This Agreement governs the purchase and sale of ownership interests upon certain triggering events.

ARTICLE III - TRIGGERING EVENTS
The following events shall trigger this Agreement: [trigger_event]

ARTICLE IV - VALUATION
The ownership interests shall be valued using: [valuation_method]

ARTICLE V - PURCHASE OBLIGATION
Upon a triggering event, the remaining owners shall have the right and obligation to purchase the departing owner's interest.

ARTICLE VI - PAYMENT TERMS
Payment may be made in a lump sum or in installments over 60 months with interest at the prime rate.

ARTICLE VII - LIFE INSURANCE FUNDING
The owners may maintain life insurance policies to fund this Agreement.

_______________________          _______________________
[owner1_name]                    [owner2_name]`
  },
  consultant_agreement: {
    name: 'Prepare Consultant Agreement',
    fields: ['consultant_name', 'client_name', 'services_description', 'compensation', 'start_date', 'end_date'],
    template: `CONSULTANT AGREEMENT

This Consultant Agreement is entered into as of [start_date] between [client_name] ("Client") and [consultant_name] ("Consultant").

ARTICLE I - SERVICES
Consultant agrees to provide the following services: [services_description]

ARTICLE II - TERM
This Agreement begins on [start_date] and ends on [end_date], unless terminated earlier.

ARTICLE III - COMPENSATION
Client shall pay Consultant: $[compensation]
Payment terms: Net 30 days from invoice date.

ARTICLE IV - INDEPENDENT CONTRACTOR
Consultant is an independent contractor, not an employee. Consultant is responsible for all taxes.

ARTICLE V - CONFIDENTIALITY
Consultant shall maintain the confidentiality of all proprietary information.

ARTICLE VI - WORK PRODUCT
All work product created under this Agreement shall be the property of Client.

ARTICLE VII - TERMINATION
Either party may terminate with 14 days written notice.

_______________________          _______________________
[consultant_name]                [client_name]
Consultant                       Client`
  },
  corporate_bylaws: {
    name: 'Prepare Corporate Bylaws',
    fields: ['corporation_name', 'state', 'fiscal_year_end', 'number_of_directors', 'registered_agent'],
    template: `CORPORATE BYLAWS OF [corporation_name]

ARTICLE I - OFFICES
The principal office shall be located in the State of [state].
Registered Agent: [registered_agent]

ARTICLE II - SHAREHOLDERS
Section 2.1 - Annual Meetings shall be held within 60 days of fiscal year end.
Section 2.2 - Special Meetings may be called by the Board or holders of 10% of shares.
Section 2.3 - Quorum shall be a majority of outstanding shares.

ARTICLE III - BOARD OF DIRECTORS
Section 3.1 - Number: The Board shall consist of [number_of_directors] directors.
Section 3.2 - Term: Directors serve one-year terms.
Section 3.3 - Meetings: Regular meetings shall be held quarterly.

ARTICLE IV - OFFICERS
The officers shall include President, Secretary, and Treasurer.

ARTICLE V - FISCAL YEAR
The fiscal year shall end on [fiscal_year_end].

ARTICLE VI - AMENDMENTS
These Bylaws may be amended by a majority vote of shareholders.

ADOPTED by the Board of Directors on _________________.

_______________________
Secretary`
  },
  demand_letter: {
    name: 'Prepare Demand Letter',
    fields: ['sender_name', 'recipient_name', 'amount_owed', 'reason_for_debt', 'payment_deadline'],
    template: `DEMAND LETTER

Date: _________________

[recipient_name]
[Recipient Address]

RE: DEMAND FOR PAYMENT

Dear [recipient_name],

This letter serves as a formal demand for payment of the amount owed to [sender_name].

AMOUNT DUE: $[amount_owed]

REASON FOR DEBT: [reason_for_debt]

You are hereby demanded to pay the full amount of $[amount_owed] on or before [payment_deadline].

CONSEQUENCES OF NON-PAYMENT:
If payment is not received by the deadline, we will have no choice but to pursue all available legal remedies, including but not limited to:
- Filing a lawsuit in the appropriate court
- Seeking attorney's fees and court costs
- Reporting to credit agencies

PAYMENT INSTRUCTIONS:
Please remit payment to:
[sender_name]
[Payment address/method]

This is a serious matter. Please treat it accordingly.

Sincerely,

_______________________
[sender_name]`
  },
  employee_severance: {
    name: 'Prepare Employee Severance Agreement',
    fields: ['employee_name', 'company_name', 'severance_amount', 'last_work_date', 'benefits_end_date'],
    template: `EMPLOYEE SEVERANCE AGREEMENT

This Severance Agreement is entered into between [company_name] ("Company") and [employee_name] ("Employee").

ARTICLE I - SEPARATION
Employee's last day of employment shall be [last_work_date].

ARTICLE II - SEVERANCE PAYMENT
Company shall pay Employee severance of: $[severance_amount]
Payment shall be made within 30 days of execution of this Agreement.

ARTICLE III - BENEFITS
Employee benefits shall continue through [benefits_end_date].
COBRA information will be provided separately.

ARTICLE IV - RELEASE OF CLAIMS
Employee releases Company from all claims arising from employment, except for vested benefits.

ARTICLE V - CONFIDENTIALITY
Employee agrees to maintain confidentiality regarding proprietary information and the terms of this Agreement.

ARTICLE VI - NON-DISPARAGEMENT
Both parties agree not to make disparaging statements about the other.

ARTICLE VII - RETURN OF PROPERTY
Employee shall return all company property by the separation date.

ARTICLE VIII - CONSIDERATION PERIOD
Employee has 21 days to consider and 7 days to revoke this Agreement.

_______________________          _______________________
[employee_name]                  [company_name]
Employee                         Company Representative`
  },
  employee_stock_option: {
    name: 'Prepare Employee Stock Option Agreement',
    fields: ['employee_name', 'company_name', 'number_of_shares', 'exercise_price', 'vesting_start_date', 'grant_date'],
    template: `EMPLOYEE STOCK OPTION AGREEMENT

This Stock Option Agreement is entered into as of [grant_date] between [company_name] ("Company") and [employee_name] ("Optionee").

ARTICLE I - GRANT OF OPTION
Company grants Optionee the option to purchase [number_of_shares] shares of Common Stock.

ARTICLE II - EXERCISE PRICE
The exercise price per share is: $[exercise_price]

ARTICLE III - VESTING SCHEDULE
Vesting commencement date: [vesting_start_date]
- 25% vests after 12 months (cliff)
- Remaining shares vest monthly over the following 36 months

ARTICLE IV - EXERCISE PERIOD
Options must be exercised within 10 years of the grant date or 90 days after termination, whichever is earlier.

ARTICLE V - METHOD OF EXERCISE
Options may be exercised by written notice and payment of the exercise price.

ARTICLE VI - TAX CONSEQUENCES
Optionee is responsible for all tax obligations arising from exercise of options.

ARTICLE VII - RESTRICTIONS
These options are non-transferable except by will or laws of descent.

_______________________          _______________________
[employee_name]                  [company_name]
Optionee                         Authorized Representative`
  },
  employment_agreement: {
    name: 'Prepare Employment Agreement',
    fields: ['employee_name', 'company_name', 'position', 'salary', 'start_date'],
    template: `EMPLOYMENT AGREEMENT

This Employment Agreement is made between [company_name] ("Employer") and [employee_name] ("Employee").

ARTICLE I - POSITION AND DUTIES
Employee is hired as [position]. Employee shall perform duties as assigned.

ARTICLE II - START DATE
Employment begins on [start_date].

ARTICLE III - COMPENSATION
Base Salary: $[salary] per year, paid bi-weekly.
Employee is eligible for bonuses at Employer's discretion.

ARTICLE IV - BENEFITS
Employee is eligible for standard company benefits including health insurance, 401(k), and PTO.

ARTICLE V - AT-WILL EMPLOYMENT
Employment is at-will and may be terminated by either party at any time with or without cause.

ARTICLE VI - CONFIDENTIALITY
Employee shall maintain confidentiality of all proprietary information during and after employment.

ARTICLE VII - NON-COMPETE
Employee agrees not to compete with Employer for 12 months following termination within 50 miles.

ARTICLE VIII - INTELLECTUAL PROPERTY
All work product created during employment belongs to Employer.

_______________________          _______________________
[employee_name]                  [company_name]
Employee                         Employer`
  },
  joint_venture_agreement: {
    name: 'Prepare Joint Venture Agreement',
    fields: ['party1_name', 'party2_name', 'venture_name', 'purpose', 'contribution1', 'contribution2', 'effective_date'],
    template: `JOINT VENTURE AGREEMENT

This Joint Venture Agreement is entered into as of [effective_date] between [party1_name] ("Party A") and [party2_name] ("Party B").

ARTICLE I - FORMATION
The parties hereby form a joint venture known as [venture_name].

ARTICLE II - PURPOSE
The purpose of this Joint Venture is: [purpose]

ARTICLE III - CONTRIBUTIONS
Party A shall contribute: [contribution1]
Party B shall contribute: [contribution2]

ARTICLE IV - PROFIT AND LOSS SHARING
Profits and losses shall be shared 50/50 unless otherwise agreed.

ARTICLE V - MANAGEMENT
Major decisions require unanimous consent. Day-to-day operations shall be managed jointly.

ARTICLE VI - TERM
This Joint Venture shall continue until completed or terminated by mutual agreement.

ARTICLE VII - CONFIDENTIALITY
Both parties shall maintain confidentiality of Joint Venture information.

ARTICLE VIII - DISPUTE RESOLUTION
Disputes shall be resolved through mediation, then binding arbitration.

_______________________          _______________________
[party1_name]                    [party2_name]
Party A                          Party B`
  },
  license_agreement: {
    name: 'Prepare License Agreement',
    fields: ['licensor_name', 'licensee_name', 'licensed_property', 'license_fee', 'territory', 'term_length'],
    template: `LICENSE AGREEMENT

This License Agreement is made between [licensor_name] ("Licensor") and [licensee_name] ("Licensee").

ARTICLE I - GRANT OF LICENSE
Licensor grants Licensee a non-exclusive license to use: [licensed_property]

ARTICLE II - TERRITORY
The license is valid in: [territory]

ARTICLE III - TERM
The license term is [term_length] from the effective date.

ARTICLE IV - LICENSE FEE
Licensee shall pay Licensor: $[license_fee]
Payment terms: Due upon execution of this Agreement.

ARTICLE V - PERMITTED USE
Licensee may use the Licensed Property for lawful business purposes as specified.

ARTICLE VI - RESTRICTIONS
Licensee shall not sublicense, modify, or reverse engineer the Licensed Property.

ARTICLE VII - INTELLECTUAL PROPERTY
All intellectual property rights remain with Licensor.

ARTICLE VIII - TERMINATION
Either party may terminate with 30 days notice for material breach.

_______________________          _______________________
[licensor_name]                  [licensee_name]
Licensor                         Licensee`
  },
  master_service_agreement: {
    name: 'Prepare Master Service Agreement',
    fields: ['provider_name', 'client_name', 'services_scope', 'payment_terms', 'effective_date'],
    template: `MASTER SERVICE AGREEMENT

This Master Service Agreement is made as of [effective_date] between [provider_name] ("Provider") and [client_name] ("Client").

ARTICLE I - SERVICES
Provider shall provide services as described in executed Statements of Work (SOWs).
General scope: [services_scope]

ARTICLE II - STATEMENTS OF WORK
Individual projects shall be governed by SOWs that reference this MSA.

ARTICLE III - COMPENSATION
Payment terms: [payment_terms]
Invoices are due Net 30 unless otherwise specified in the SOW.

ARTICLE IV - TERM
This Agreement remains in effect for 2 years and auto-renews unless terminated.

ARTICLE V - CONFIDENTIALITY
Both parties shall protect confidential information for 3 years following disclosure.

ARTICLE VI - INTELLECTUAL PROPERTY
Pre-existing IP remains with original owner. Work product ownership defined in each SOW.

ARTICLE VII - LIABILITY
Neither party liable for indirect, consequential, or punitive damages.

ARTICLE VIII - TERMINATION
Either party may terminate with 60 days written notice.

_______________________          _______________________
[provider_name]                  [client_name]
Provider                         Client`
  },
  non_compete_agreement: {
    name: 'Prepare Non-Compete Agreement',
    fields: ['employee_name', 'company_name', 'restricted_period', 'geographic_area', 'effective_date'],
    template: `NON-COMPETE AGREEMENT

This Non-Compete Agreement is made as of [effective_date] between [company_name] ("Company") and [employee_name] ("Employee").

ARTICLE I - CONSIDERATION
In exchange for employment/continued employment and other valuable consideration, Employee agrees to the following restrictions.

ARTICLE II - NON-COMPETITION
During employment and for [restricted_period] after termination, Employee shall not:
- Work for any competing business
- Start a competing business
- Solicit Company's customers or employees

ARTICLE III - GEOGRAPHIC SCOPE
These restrictions apply within: [geographic_area]

ARTICLE IV - NON-SOLICITATION
Employee shall not solicit or hire Company employees for [restricted_period] after termination.

ARTICLE V - REASONABLENESS
Both parties acknowledge these restrictions are reasonable and necessary to protect legitimate business interests.

ARTICLE VI - REMEDIES
Company may seek injunctive relief and damages for breach of this Agreement.

ARTICLE VII - SEVERABILITY
If any provision is unenforceable, it shall be modified to be enforceable.

_______________________          _______________________
[employee_name]                  [company_name]
Employee                         Company Representative`
  },
  non_disclosure_agreement: {
    name: 'Prepare Non-Disclosure Agreement',
    fields: ['discloser_name', 'recipient_name', 'purpose', 'confidential_info_description', 'effective_date'],
    template: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is entered into as of [effective_date] by and between [discloser_name] ("Disclosing Party") and [recipient_name] ("Receiving Party").

ARTICLE I - PURPOSE
This Agreement protects confidential information shared for: [purpose]

ARTICLE II - CONFIDENTIAL INFORMATION
Confidential Information includes: [confidential_info_description]

ARTICLE III - OBLIGATIONS
The Receiving Party shall:
- Use Confidential Information only for the stated purpose
- Protect information with reasonable care
- Not disclose to third parties without consent
- Return or destroy information upon request

ARTICLE IV - EXCLUSIONS
This Agreement does not apply to information that:
- Is publicly available
- Was known prior to disclosure
- Is independently developed
- Is required to be disclosed by law

ARTICLE V - TERM
This Agreement remains in effect for 3 years from the Effective Date.

ARTICLE VI - REMEDIES
Disclosing Party may seek injunctive relief for breach.

_______________________          _______________________
[discloser_name]                 [recipient_name]
Disclosing Party                 Receiving Party`
  },
  partnership_agreement: {
    name: 'Prepare Partnership Agreement',
    fields: ['partnership_name', 'partner1_name', 'partner2_name', 'business_purpose', 'profit_share_percent', 'effective_date'],
    template: `PARTNERSHIP AGREEMENT

This Partnership Agreement is made as of [effective_date] between [partner1_name] and [partner2_name] (the "Partners").

ARTICLE I - FORMATION
The Partners form a partnership under the name [partnership_name].

ARTICLE II - PURPOSE
The Partnership shall engage in: [business_purpose]

ARTICLE III - CAPITAL
Each Partner shall contribute capital as agreed. Additional contributions require unanimous consent.

ARTICLE IV - PROFITS AND LOSSES
Profits and losses shall be divided: [profit_share_percent]% to each Partner.

ARTICLE V - MANAGEMENT
Partners shall have equal management rights. Major decisions require unanimous consent.

ARTICLE VI - BANKING
Partnership funds shall be deposited in accounts designated by the Partners.

ARTICLE VII - WITHDRAWAL
A Partner may withdraw with 90 days written notice.

ARTICLE VIII - DISSOLUTION
The Partnership shall dissolve upon mutual agreement, death, or bankruptcy of a Partner.

ARTICLE IX - DISPUTE RESOLUTION
Disputes shall be resolved through mediation, then arbitration.

_______________________          _______________________
[partner1_name]                  [partner2_name]`
  },
  power_of_attorney: {
    name: 'Prepare Power of Attorney',
    fields: ['principal_name', 'agent_name', 'powers_granted', 'effective_date', 'state'],
    template: `POWER OF ATTORNEY

STATE OF [state]

I, [principal_name] ("Principal"), hereby appoint [agent_name] ("Agent") as my Attorney-in-Fact.

ARTICLE I - POWERS GRANTED
I grant my Agent authority to act on my behalf in the following matters:
[powers_granted]

ARTICLE II - EFFECTIVE DATE
This Power of Attorney is effective as of [effective_date].

ARTICLE III - DURABILITY
This Power of Attorney shall remain in effect even if I become incapacitated.

ARTICLE IV - AGENT'S DUTIES
Agent shall act in my best interest, keep accurate records, and avoid conflicts of interest.

ARTICLE V - THIRD PARTY RELIANCE
Third parties may rely on this Power of Attorney in good faith.

ARTICLE VI - REVOCATION
I may revoke this Power of Attorney at any time in writing.

ARTICLE VII - GOVERNING LAW
This Power of Attorney is governed by the laws of [state].

_______________________          _______________________
[principal_name]                 Date
Principal

ACKNOWLEDGMENT BY AGENT:
I accept this appointment.

_______________________          _______________________
[agent_name]                     Date
Agent`
  },
  settlement_agreement: {
    name: 'Prepare Settlement Agreement',
    fields: ['party1_name', 'party2_name', 'dispute_description', 'settlement_amount', 'payment_deadline'],
    template: `SETTLEMENT AGREEMENT AND RELEASE

This Settlement Agreement is made between [party1_name] ("Party A") and [party2_name] ("Party B").

RECITALS
WHEREAS, a dispute exists between the parties regarding: [dispute_description]
WHEREAS, the parties wish to resolve this dispute without further litigation.

ARTICLE I - SETTLEMENT PAYMENT
Party B shall pay Party A: $[settlement_amount]
Payment due by: [payment_deadline]

ARTICLE II - RELEASE OF CLAIMS
Upon receipt of payment, Party A releases Party B from all claims arising from the dispute.

ARTICLE III - MUTUAL RELEASE
Both parties release each other from any and all claims related to the dispute.

ARTICLE IV - NO ADMISSION
This settlement is not an admission of liability by either party.

ARTICLE V - CONFIDENTIALITY
The terms of this settlement shall remain confidential.

ARTICLE VI - NON-DISPARAGEMENT
Neither party shall make disparaging statements about the other.

ARTICLE VII - ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties.

_______________________          _______________________
[party1_name]                    [party2_name]
Party A                          Party B`
  },
  shareholder_agreement: {
    name: 'Prepare Shareholder Agreement',
    fields: ['company_name', 'shareholder1_name', 'shareholder2_name', 'shareholder1_shares', 'shareholder2_shares', 'effective_date'],
    template: `SHAREHOLDER AGREEMENT

This Shareholder Agreement is made as of [effective_date] among the shareholders of [company_name].

ARTICLE I - SHAREHOLDERS
[shareholder1_name]: [shareholder1_shares] shares
[shareholder2_name]: [shareholder2_shares] shares

ARTICLE II - BOARD REPRESENTATION
Shareholders shall be entitled to board representation proportionate to ownership.

ARTICLE III - VOTING
Major decisions require approval of shareholders holding 2/3 of outstanding shares.

ARTICLE IV - TRANSFER RESTRICTIONS
No shareholder may transfer shares without first offering them to other shareholders (Right of First Refusal).

ARTICLE V - DRAG-ALONG
If majority shareholders accept a bona fide offer, minority shareholders must sell on same terms.

ARTICLE VI - TAG-ALONG
If majority shareholders sell, minority shareholders may participate proportionately.

ARTICLE VII - DIVIDENDS
Dividends shall be declared at the Board's discretion and distributed pro rata.

ARTICLE VIII - DISPUTE RESOLUTION
Disputes shall be resolved through binding arbitration.

_______________________          _______________________
[shareholder1_name]              [shareholder2_name]`
  },
  terms_of_service: {
    name: 'Prepare Terms of Service/Use Agreement',
    fields: ['company_name', 'website_url', 'service_description', 'jurisdiction', 'effective_date'],
    template: `TERMS OF SERVICE

Effective Date: [effective_date]

Welcome to [website_url]. These Terms of Service govern your use of [company_name]'s services.

1. ACCEPTANCE
By using our services, you agree to these Terms. If you do not agree, do not use our services.

2. SERVICES
[company_name] provides: [service_description]

3. USER ACCOUNTS
You are responsible for maintaining the security of your account and all activities under your account.

4. ACCEPTABLE USE
You agree not to:
- Violate any laws
- Infringe intellectual property rights
- Transmit harmful code
- Interfere with service operation

5. INTELLECTUAL PROPERTY
All content and materials are owned by [company_name] and protected by copyright.

6. LIMITATION OF LIABILITY
[company_name] is not liable for indirect, incidental, or consequential damages.

7. TERMINATION
We may terminate your access for violation of these Terms.

8. GOVERNING LAW
These Terms are governed by the laws of [jurisdiction].

9. CHANGES
We may modify these Terms at any time. Continued use constitutes acceptance.

[company_name]`
  },
  website_hosting_agreement: {
    name: 'Prepare Website Hosting Agreement',
    fields: ['provider_name', 'client_name', 'monthly_fee', 'storage_limit', 'bandwidth_limit', 'effective_date'],
    template: `WEBSITE HOSTING AGREEMENT

This Website Hosting Agreement is made as of [effective_date] between [provider_name] ("Provider") and [client_name] ("Client").

ARTICLE I - HOSTING SERVICES
Provider shall provide website hosting services including:
- Web server space: [storage_limit]
- Monthly bandwidth: [bandwidth_limit]
- Email accounts
- Technical support

ARTICLE II - FEES
Monthly hosting fee: $[monthly_fee]
Payment due on the 1st of each month.

ARTICLE III - UPTIME GUARANTEE
Provider guarantees 99.9% uptime, excluding scheduled maintenance.

ARTICLE IV - CLIENT RESPONSIBILITIES
Client shall:
- Provide accurate account information
- Not host illegal or harmful content
- Maintain current payment

ARTICLE V - BACKUPS
Provider performs daily backups. Client is responsible for maintaining independent backups.

ARTICLE VI - TERM AND TERMINATION
This Agreement is month-to-month. Either party may terminate with 30 days notice.

ARTICLE VII - LIMITATION OF LIABILITY
Provider's liability is limited to fees paid in the preceding 12 months.

_______________________          _______________________
[provider_name]                  [client_name]
Provider                         Client`
  },
  routine_document_review: {
    name: 'Routine Document Review',
    fields: ['client_name', 'document_type', 'document_description', 'review_date', 'reviewer_name'],
    template: `DOCUMENT REVIEW CHECKLIST

Client: [client_name]
Document Type: [document_type]
Description: [document_description]
Review Date: [review_date]
Reviewer: [reviewer_name]

REVIEW CHECKLIST:

[ ] Document completeness verified
[ ] All parties properly identified
[ ] Dates and deadlines confirmed
[ ] Financial terms verified
[ ] Legal terminology appropriate
[ ] Governing law specified
[ ] Signature blocks present
[ ] Exhibits/attachments included
[ ] Compliance with applicable laws
[ ] No conflicting provisions

COMMENTS AND RECOMMENDATIONS:
_____________________________________________
_____________________________________________
_____________________________________________

RISK ASSESSMENT:
[ ] Low Risk
[ ] Medium Risk
[ ] High Risk - Further review recommended

RECOMMENDATION:
[ ] Approved as-is
[ ] Approved with minor changes
[ ] Requires significant revision
[ ] Not recommended

_______________________          _______________________
[reviewer_name]                  Date
Reviewer`
  },
  s_corp_c_corp_formation: {
    name: 'S-corp or C-corp Formation',
    fields: ['corporation_name', 'state', 'shares_authorized', 'incorporator_name', 'registered_agent', 'effective_date'],
    template: `ARTICLES OF INCORPORATION

ARTICLE I - NAME
The name of this corporation is: [corporation_name]

ARTICLE II - PURPOSE
The purpose of the corporation is to engage in any lawful business activity.

ARTICLE III - AUTHORIZED SHARES
The corporation is authorized to issue [shares_authorized] shares of common stock.

ARTICLE IV - REGISTERED AGENT
The registered agent in [state] is: [registered_agent]

ARTICLE V - INCORPORATOR
The name of the incorporator is: [incorporator_name]

ARTICLE VI - BOARD OF DIRECTORS
The initial Board shall consist of one or more directors as determined by the incorporator.

ARTICLE VII - INDEMNIFICATION
The corporation shall indemnify directors and officers to the fullest extent permitted by law.

ARTICLE VIII - AMENDMENTS
These Articles may be amended by shareholder vote as provided by law.

EFFECTIVE DATE: [effective_date]

IN WITNESS WHEREOF, the incorporator has executed these Articles.

_______________________          _______________________
[incorporator_name]              Date
Incorporator

NOTE: For S-Corp election, file IRS Form 2553 within 75 days of formation.`
  },
  single_member_llc_formation: {
    name: 'Single Member LLC Formation',
    fields: ['llc_name', 'member_name', 'state', 'business_purpose', 'initial_contribution', 'effective_date'],
    template: `OPERATING AGREEMENT FOR SINGLE MEMBER LLC

OPERATING AGREEMENT OF [llc_name], LLC

This Operating Agreement is made as of [effective_date] by [member_name] (the "Member").

ARTICLE I - FORMATION
The Member forms a single member limited liability company in [state] under the name [llc_name], LLC.

ARTICLE II - PURPOSE
The purpose of the LLC is: [business_purpose]

ARTICLE III - MEMBER
The sole Member is: [member_name]
The Member holds 100% of the membership interest.

ARTICLE IV - CAPITAL CONTRIBUTION
Initial capital contribution: $[initial_contribution]

ARTICLE V - MANAGEMENT
The LLC shall be managed by its Member.

ARTICLE VI - DISTRIBUTIONS
The Member may make distributions at any time at Member's sole discretion.

ARTICLE VII - TAX TREATMENT
The LLC shall be treated as a disregarded entity for federal tax purposes unless the Member elects otherwise.

ARTICLE VIII - DISSOLUTION
The LLC shall dissolve upon Member's death, bankruptcy, or written decision to dissolve.

_______________________          _______________________
[member_name]                    Date
Member`
  }
};

interface DocumentFormFieldsProps {
  selectedTemplate: keyof typeof templates;
  templates: typeof templates;
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  onBack: () => void;
  onGenerate: () => void;
}

function DocumentFormFields({
  selectedTemplate,
  templates,
  formData,
  setFormData,
  onBack,
  onGenerate
}: DocumentFormFieldsProps) {
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const fieldConfigs = useMemo(() => {
    return templates[selectedTemplate].fields.map(field =>
      getFieldConfig(selectedTemplate, field)
    );
  }, [selectedTemplate, templates]);

  const validationStatus = useMemo(() => {
    const results: Record<string, { isValid: boolean; error: string | null }> = {};
    let allValid = true;
    let filledCount = 0;
    const totalRequired = fieldConfigs.filter(f => f.required).length;

    fieldConfigs.forEach(config => {
      const value = formData[config.name] || '';
      const result = validateField(value, config, formData);
      results[config.name] = result;

      if (config.required && value.trim()) {
        filledCount++;
      }

      if (config.required && !result.isValid) {
        allValid = false;
      }
    });

    return {
      results,
      allValid,
      filledCount,
      totalRequired,
      progress: totalRequired > 0 ? Math.round((filledCount / totalRequired) * 100) : 0
    };
  }, [fieldConfigs, formData]);

  const handleGenerate = () => {
    setAttemptedSubmit(true);
    if (validationStatus.allValid) {
      onGenerate();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-navy-900">
            {templates[selectedTemplate].name}
          </h3>
          <p className="text-sm text-navy-500 mt-1">
            Fill in the details below to generate your document
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-navy-500 mb-1">Completion</div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-navy-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    validationStatus.progress === 100
                      ? 'bg-green-500'
                      : validationStatus.progress > 50
                        ? 'bg-teal-500'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${validationStatus.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-navy-700">
                {validationStatus.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {attemptedSubmit && !validationStatus.allValid && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Please complete all required fields</p>
            <p className="text-sm text-amber-700 mt-1">
              {validationStatus.totalRequired - validationStatus.filledCount} required field(s) need your attention
            </p>
          </div>
        </div>
      )}

      {validationStatus.progress === 100 && validationStatus.allValid && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">All fields completed</p>
            <p className="text-sm text-green-700 mt-1">
              Your document is ready to generate
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {fieldConfigs.map((config) => (
          <ValidatedFormField
            key={config.name}
            config={config}
            value={formData[config.name] || ''}
            onChange={(value) => setFormData({ ...formData, [config.name]: value })}
            allValues={formData}
            showValidation={attemptedSubmit || (formData[config.name]?.length > 0)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-200">
        <div className="text-sm text-navy-500">
          <span className="text-red-500">*</span> Required fields
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleGenerate}
            disabled={attemptedSubmit && !validationStatus.allValid}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
              validationStatus.allValid
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-navy-100 text-navy-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Generate Document
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [ocrPurpose, setOcrPurpose] = useState<'analyze' | 'draft'>('analyze');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [documentJurisdiction, setDocumentJurisdiction] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates | 'custom' | ''>('');
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [customDocumentType, setCustomDocumentType] = useState('');
  const [customDocumentDescription, setCustomDocumentDescription] = useState('');
  const [customDocumentParties, setCustomDocumentParties] = useState('');
  const [customDocumentDetails, setCustomDocumentDetails] = useState('');
  const [draftingMode, setDraftingMode] = useState<'quick_form' | 'associate' | 'partner'>('associate');
  const [draftingPresets, setDraftingPresets] = useState<Array<{
    mode: 'quick_form' | 'associate' | 'partner';
    display_name: string;
    description: string;
    min_tier: string;
    default_model: string;
    max_tokens: number;
    draft_passes: number;
    rag_top_k: number;
    system_prompt: string;
  }>>([]);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [analyzingDocument, setAnalyzingDocument] = useState<Document | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showIntelligenceHub, setShowIntelligenceHub] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isBusiness, isOrganization } = usePersonaRouting();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (searchParams.get('draft') !== '1') return;
    const goal = searchParams.get('goal') || '';
    const step = searchParams.get('step') || '';
    const detail = searchParams.get('detail') || '';
    if (!goal && !step) return;
    setSelectedTemplate('custom');
    setCustomDocumentType(step || 'Drafted document');
    setCustomDocumentDescription([goal, detail].filter(Boolean).join(' — '));
    setCustomDocumentDetails(detail);
    setDocumentTitle(step || goal);
    setShowModal(true);
    searchParams.delete('draft');
    searchParams.delete('goal');
    searchParams.delete('step');
    searchParams.delete('detail');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    async function loadPresets() {
      const { data } = await supabase
        .from('drafting_mode_presets')
        .select('mode, display_name, description, min_tier, default_model, max_tokens, draft_passes, rag_top_k, system_prompt')
        .order('display_order');
      if (!cancelled && data) {
        setDraftingPresets(data as typeof draftingPresets);
      }
    }
    loadPresets();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAdmin() {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancelled) setIsAdmin(Boolean(data?.is_admin));
    }
    loadAdmin();
    return () => { cancelled = true; };
  }, [user?.id]);

  const loadDocuments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleTemplateSelect = (template: keyof typeof templates) => {
    setSelectedTemplate(template);
    const templateData = templates[template];
    const initialFormData: { [key: string]: string } = {};
    templateData.fields.forEach(field => {
      initialFormData[field] = '';
    });
    setFormData(initialFormData);
    setDocumentTitle(templateData.name);
    setGeneratedContent('');
  };

  const generateDocument = () => {
    if (!selectedTemplate || selectedTemplate === 'custom') return;

    let content = templates[selectedTemplate].template;
    Object.entries(formData).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    });
    setGeneratedContent(content);
  };

  const generateCustomDocument = async () => {
    if (!customDocumentType.trim() || !customDocumentDescription.trim()) return;

    setIsGeneratingCustom(true);
    setGenerationStage('Preparing drafting brief');

    const preset = draftingPresets.find((p) => p.mode === draftingMode);
    const effectiveModel = selectedModel || preset?.default_model || undefined;
    const maxTokens = preset?.max_tokens ?? 8192;
    const draftPasses = preset?.draft_passes ?? 1;
    const ragTopK = preset?.rag_top_k ?? 0;

    try {
      let contextDocuments: Array<{ title: string; citation?: string; jurisdiction?: string; excerpt: string; url?: string }> = [];

      if (ragTopK > 0) {
        setGenerationStage('Retrieving controlling authorities');
        const retrievalQuery = `${customDocumentType}. ${customDocumentDescription}. ${customDocumentDetails}`.slice(0, 2000);
        try {
          const ragRes = await fetch(`${SUPABASE_URL}/functions/v1/legalbreeze-rag`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              query: retrievalQuery,
              sessionId: crypto.randomUUID(),
              jurisdiction: documentJurisdiction || 'Arizona',
              includeCompliance: false,
            }),
          });
          if (ragRes.ok) {
            const ragData = await ragRes.json();
            const citations = Array.isArray(ragData.citations) ? ragData.citations : [];
            contextDocuments = citations.slice(0, ragTopK).map((c: { title?: string; source?: string; jurisdiction?: string; excerpt?: string; url?: string }) => ({
              title: c.title || c.source || 'Authority',
              citation: c.source,
              jurisdiction: c.jurisdiction,
              excerpt: (c.excerpt || '').slice(0, 2400),
              url: c.url,
            }));
          }
        } catch (ragErr) {
          console.warn('RAG retrieval failed, continuing without grounding:', ragErr);
        }
      }

      setGenerationStage(
        draftingMode === 'partner'
          ? 'Drafting senior-partner document (multi-pass)'
          : draftingMode === 'associate'
          ? 'Drafting associate-level document'
          : 'Generating form'
      );

      const prompt = `Produce a complete legal document matching the specification below.

DOCUMENT TYPE: ${customDocumentType}

DESCRIPTION / PURPOSE: ${customDocumentDescription}

${customDocumentParties ? `PARTIES INVOLVED: ${customDocumentParties}\n` : ''}${customDocumentDetails ? `ADDITIONAL DETAILS: ${customDocumentDetails}\n` : ''}${documentJurisdiction ? `GOVERNING JURISDICTION: ${documentJurisdiction}\n` : ''}
Follow the drafting posture defined in your system instructions. Return the execution-ready document text only.`;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          sessionId: crypto.randomUUID(),
          userId: user?.id,
          jurisdiction: documentJurisdiction || 'General',
          modelOverride: effectiveModel,
          maxTokens,
          temperature: 0.2,
          draftingMode,
          draftPasses,
          contextDocuments,
          systemPromptOverride: preset?.system_prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const data = await response.json();
      let generatedText = data.response || '';

      const followUpStart = generatedText.indexOf('---FOLLOW_UP_QUESTIONS---');
      if (followUpStart !== -1) {
        generatedText = generatedText.substring(0, followUpStart).trim();
      }
      const thinkingEnd = generatedText.indexOf('---END_THINKING_DETAILS---');
      if (thinkingEnd !== -1) {
        generatedText = generatedText.substring(thinkingEnd + '---END_THINKING_DETAILS---'.length).trim();
      }

      setGeneratedContent(generatedText);
      setDocumentTitle(customDocumentType);

      if (user?.id) {
        await supabase.from('document_generation_requests').insert({
          user_id: user.id,
          document_type: customDocumentType,
          drafting_mode: draftingMode,
          model_used: data.modelUsed || effectiveModel || '',
          jurisdiction: documentJurisdiction || '',
          rag_context_count: data.ragContextCount ?? contextDocuments.length,
          draft_passes: data.draftPasses ?? draftPasses,
          tokens_used: data.usage?.totalTokens ?? 0,
          status: 'success',
        });
      }
    } catch (error) {
      console.error('Error generating custom document:', error);
      if (user?.id) {
        await supabase.from('document_generation_requests').insert({
          user_id: user.id,
          document_type: customDocumentType,
          drafting_mode: draftingMode,
          model_used: effectiveModel || '',
          jurisdiction: documentJurisdiction || '',
          rag_context_count: 0,
          draft_passes: draftPasses,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      alert('Failed to generate document. Please try again.');
    } finally {
      setIsGeneratingCustom(false);
      setGenerationStage('');
    }
  };

  const handleSaveDocument = async () => {
    if (!generatedContent) return;

    if (!user) {
      const blob = new Blob([generatedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle || 'document'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Document downloaded! Sign up to save and manage all your documents online.');
      return;
    }

    const { error } = await supabase.from('documents').insert({
      user_id: user.id,
      title: documentTitle,
      document_type: selectedTemplate || 'custom',
      content: generatedContent,
      template_used: selectedTemplate || null,
      case_id: null,
      jurisdiction: documentJurisdiction || null,
    });

    if (!error) {
      setShowModal(false);
      setSelectedTemplate('');
      setFormData({});
      setGeneratedContent('');
      setDocumentTitle('');
      setDocumentJurisdiction('');
      loadDocuments();
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJurisdiction = !selectedJurisdiction || doc.jurisdiction === selectedJurisdiction;
    return matchesSearch && matchesJurisdiction;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!user && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl px-6 py-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-navy-900">Try Document Generation Free!</p>
                <p className="text-sm text-navy-600">Generate documents now, sign up to save them online</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold shadow-md text-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          {language === 'en' ? 'Legal Documents' : 'Documentos Legales'}
        </h1>
        <p className="text-navy-600">
          {language === 'en' ? 'Generate professional legal documents in minutes' : 'Genera documentos legales profesionales en minutos'}
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Workflow className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-900">
                {language === 'en' ? 'Document Intelligence Hub' : 'Centro de Inteligencia Documental'}
              </h2>
              <p className="mt-0.5 max-w-2xl text-sm text-navy-600">
                {language === 'en'
                  ? 'Clause navigation, risk detection, drafting suggestions, intake triage, and multi-step research planning — all in one place.'
                  : 'Navegacion de clausulas, deteccion de riesgos, sugerencias de redaccion, triaje de admision y planificacion de investigacion.'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Clause navigator', 'Risk detection', 'Clause suggestions', 'Intake triage', 'Research planner'].map((tag) => (
                  <span key={tag} className="rounded-full border border-teal-200 bg-white px-2 py-0.5 text-[11px] font-medium text-teal-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowIntelligenceHub((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Sparkles className="h-4 w-4" />
            {showIntelligenceHub
              ? language === 'en' ? 'Hide' : 'Ocultar'
              : language === 'en' ? 'Open hub' : 'Abrir'}
          </button>
        </div>
        {showIntelligenceHub && (
          <div className="mt-5">
            <DocumentIntelligencePanel documentId={null} documentContent="" />
            <p className="mt-3 text-xs text-navy-500">
              {language === 'en'
                ? 'To run clause navigation and risk detection on an existing document, click Analyze on any saved document card below.'
                : 'Para ejecutar navegacion de clausulas y deteccion de riesgos en un documento existente, haga clic en Analizar en cualquier tarjeta guardada.'}
            </p>
          </div>
        )}
      </div>

      {isOrganization && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Users className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 mb-1">
              {language === 'en' ? 'Organization Mode' : 'Modo Organizacion'}
            </p>
            <p className="text-amber-700">
              {language === 'en'
                ? 'Documents generated here are templates requiring attorney review before client distribution. Always verify jurisdiction-specific requirements.'
                : 'Los documentos generados aquí son plantillas que requieren revision de abogado antes de la distribucion al cliente. Siempre verifique los requisitos jurisdiccionales.'}
            </p>
          </div>
        </div>
      )}

      {isBusiness && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-800 mb-1">
              {language === 'en' ? 'Business Templates' : 'Plantillas de Negocios'}
            </p>
            <p className="text-blue-700">
              {language === 'en'
                ? 'Recommended: LLC Formation, Employment Agreements, NDAs, Consultant Agreements, and Master Service Agreements.'
                : 'Recomendados: Formacion de LLC, Contratos de Empleo, NDAs, Contratos de Consultor y Acuerdos de Servicios.'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search documents...' : 'Buscar documentos...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="w-full lg:w-64">
            <div className="flex items-center gap-2">
              <MapPin className="text-navy-400 w-5 h-5 flex-shrink-0" />
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
                className="flex-1 px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                aria-label="Filter by jurisdiction"
              >
                <option value="">All Jurisdictions</option>
                {JURISDICTION_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((jurisdiction) => (
                      <option key={jurisdiction.code} value={jurisdiction.code}>
                        {jurisdiction.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setOcrPurpose('analyze');
              setShowOCRScanner(true);
            }}
            className="bg-navy-700 hover:bg-navy-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Upload className="w-5 h-5" />
            {language === 'en' ? 'Upload to Analyze' : 'Subir para Analizar'}
          </button>
          <button
            onClick={() => {
              try {
                const storedGoal = sessionStorage.getItem('ezlegal-research-goal') || '';
                const storedStepRaw = sessionStorage.getItem('ezlegal-research-draft-step');
                const storedStep = storedStepRaw ? JSON.parse(storedStepRaw) : null;
                if (storedGoal || storedStep) {
                  setSelectedTemplate('custom');
                  setCustomDocumentType(storedStep?.title || 'Drafted document');
                  setCustomDocumentDescription(
                    [storedGoal, storedStep?.detail].filter(Boolean).join(' — ')
                  );
                  setCustomDocumentDetails(storedStep?.detail || '');
                  setDocumentTitle(storedStep?.title || storedGoal);
                }
              } catch {}
              setShowModal(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            {language === 'en' ? 'Generate Document' : 'Generar Documento'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-900 mb-1 truncate">{doc.title}</h3>
                <p className="text-sm text-navy-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
              </div>
            </div>

            <p className="text-sm text-navy-600 mb-4 line-clamp-3">
              {stripThinkingDetails(doc.content).substring(0, 150)}...
            </p>

            <div className="flex items-center justify-between text-xs text-navy-500">
              <div className="flex items-center gap-2">
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                {doc.jurisdiction && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                    <MapPin className="w-3 h-3" />
                    {getJurisdictionName(doc.jurisdiction)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAnalyzingDocument(doc)}
                  className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Workflow className="w-4 h-4" />
                  {language === 'en' ? 'Analyze' : 'Analizar'}
                </button>
                <button className="text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {language === 'en' ? 'Download' : 'Descargar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-navy-200">
          <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-navy-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            {language === 'en' ? 'No documents found' : 'No se encontraron documentos'}
          </h3>
          <p className="text-navy-600 mb-4">
            {language === 'en' ? 'Generate your first legal document' : 'Genera tu primer documento legal'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            {language === 'en' ? 'Generate Document' : 'Generar Documento'}
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-navy-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-navy-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">
                {language === 'en' ? 'Generate Legal Document' : 'Generar Documento Legal'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTemplate('');
                  setFormData({});
                  setGeneratedContent('');
                  setDocumentTitle('');
                  setDocumentJurisdiction('');
                  setCustomDocumentType('');
                  setCustomDocumentDescription('');
                  setCustomDocumentParties('');
                  setCustomDocumentDetails('');
                }}
                className="text-navy-400 hover:text-navy-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {!selectedTemplate ? (
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">Choose a Template</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(templates).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => handleTemplateSelect(key as keyof typeof templates)}
                        className="p-4 border-2 border-navy-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
                      >
                        <FileText className="w-8 h-8 text-teal-600 mb-2" />
                        <h4 className="font-semibold text-navy-900">{template.name}</h4>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedTemplate('custom');
                        setDocumentTitle('');
                        setGeneratedContent('');
                      }}
                      className="p-4 border-2 border-dashed border-teal-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left bg-gradient-to-br from-teal-50 to-white"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Wand2 className="w-8 h-8 text-teal-600" />
                        <span className="text-xs font-medium px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">AI-Powered</span>
                      </div>
                      <h4 className="font-semibold text-navy-900">Custom Document</h4>
                      <p className="text-sm text-navy-500 mt-1">Describe any document type and let AI generate it for you</p>
                    </button>
                  </div>
                </div>
              ) : selectedTemplate === 'custom' && !generatedContent ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-navy-900">Create Custom Document</h3>
                      <p className="text-sm text-navy-500 mt-1">Describe the document you need and AI will generate it</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-full">
                      <Wand2 className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-medium text-teal-700">AI-Powered</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Document Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customDocumentType}
                        onChange={(e) => setCustomDocumentType(e.target.value)}
                        placeholder="e.g., Independent Contractor Agreement, Cease and Desist Letter, Release of Liability..."
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <p className="text-xs text-navy-500 mt-1">Enter any type of legal document you need</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Description & Purpose <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={customDocumentDescription}
                        onChange={(e) => setCustomDocumentDescription(e.target.value)}
                        placeholder="Describe what this document is for, its purpose, and any specific requirements..."
                        rows={4}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Parties Involved
                      </label>
                      <input
                        type="text"
                        value={customDocumentParties}
                        onChange={(e) => setCustomDocumentParties(e.target.value)}
                        placeholder="e.g., Company ABC (Employer) and John Doe (Contractor)"
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Additional Details
                      </label>
                      <textarea
                        value={customDocumentDetails}
                        onChange={(e) => setCustomDocumentDetails(e.target.value)}
                        placeholder="Any specific terms, clauses, dates, amounts, or other details to include..."
                        rows={3}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Jurisdiction
                      </label>
                      <select
                        value={documentJurisdiction}
                        onChange={(e) => setDocumentJurisdiction(e.target.value)}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select Jurisdiction (optional)</option>
                        {JURISDICTION_GROUPS.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((jurisdiction) => (
                              <option key={jurisdiction.code} value={jurisdiction.code}>
                                {jurisdiction.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <p className="text-xs text-navy-500 mt-1">If applicable, select the state whose laws should govern this document</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-navy-900 mb-3">
                      Drafting Posture
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { mode: 'quick_form' as const, icon: FileText, label: 'Quick Form', blurb: 'Clean fillable template. Ready in seconds.', badge: 'Free' },
                        { mode: 'associate' as const, icon: Scale, label: 'Associate Draft', blurb: 'Mid-level associate quality. Jurisdiction-aware.', badge: 'Free' },
                        { mode: 'partner' as const, icon: Award, label: 'Senior Partner', blurb: 'Am Law 100 execution-quality. Multi-pass with authority grounding.', badge: 'Premium' },
                      ].map(({ mode, icon: Icon, label, blurb, badge }) => {
                        const isSelected = draftingMode === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setDraftingMode(mode)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50 shadow-md'
                                : 'border-navy-200 bg-white hover:border-teal-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-navy-50 text-navy-600'}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-navy-900 text-sm">{label}</h4>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge === 'Premium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {badge}
                                  </span>
                                </div>
                                <p className="text-xs text-navy-600 mt-1 leading-relaxed">{blurb}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {draftingMode === 'partner' && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <Gavel className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-900">
                          Senior-partner mode retrieves controlling statutes and case law, drafts in three passes with self-critique, and produces a Drafting Notes appendix citing only verified authorities. Generation may take 30-90 seconds.
                        </p>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <AIModelSelector
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        variant="compact"
                        label="AI Model for Document Generation"
                        showDescription={false}
                      />
                      <p className="text-xs text-navy-500 mt-2">Admin only: Premium models (GPT-5 series) provide more comprehensive legal documents</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-200">
                    <div className="text-sm text-navy-500">
                      <span className="text-red-500">*</span> Required fields
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedTemplate('');
                          setCustomDocumentType('');
                          setCustomDocumentDescription('');
                          setCustomDocumentParties('');
                          setCustomDocumentDetails('');
                        }}
                        className="px-6 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={generateCustomDocument}
                        disabled={!customDocumentType.trim() || !customDocumentDescription.trim() || isGeneratingCustom}
                        className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                          customDocumentType.trim() && customDocumentDescription.trim() && !isGeneratingCustom
                            ? 'bg-teal-600 hover:bg-teal-700 text-white'
                            : 'bg-navy-200 text-navy-400 cursor-not-allowed'
                        }`}
                      >
                        {isGeneratingCustom ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {generationStage || 'Generating...'}
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            Generate Document
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedTemplate !== 'custom' && !generatedContent ? (
                <DocumentFormFields
                  selectedTemplate={selectedTemplate as keyof typeof templates}
                  templates={templates}
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => {
                    setSelectedTemplate('');
                    setFormData({});
                  }}
                  onGenerate={generateDocument}
                />
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">Preview & Save</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Document Title
                      </label>
                      <input
                        type="text"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Jurisdiction
                      </label>
                      <div className="flex items-center gap-2">
                        <MapPin className="text-navy-400 w-5 h-5 flex-shrink-0" />
                        <select
                          value={documentJurisdiction}
                          onChange={(e) => setDocumentJurisdiction(e.target.value)}
                          className="flex-1 px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          aria-label="Select document jurisdiction"
                        >
                          <option value="">Select Jurisdiction</option>
                          {JURISDICTION_GROUPS.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                              {group.options.map((jurisdiction) => (
                                <option key={jurisdiction.code} value={jurisdiction.code}>
                                  {jurisdiction.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-navy-500 mt-1">
                        Select the jurisdiction this document applies to
                      </p>
                    </div>
                  </div>
                  <div className="bg-navy-50 border border-navy-200 rounded-lg p-6 mb-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-navy-700 font-mono">
                      {generatedContent}
                    </pre>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setGeneratedContent('')}
                      className="px-6 py-2 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleSaveDocument}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                    >
                      {user ? 'Save Document' : 'Download Document'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {analyzingDocument && (
        <div className="fixed inset-0 bg-navy-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-4xl w-full my-8">
            <DocumentIntelligencePanel
              documentId={analyzingDocument.id}
              documentContent={analyzingDocument.content}
              onClose={() => setAnalyzingDocument(null)}
            />
          </div>
        </div>
      )}

      {showOCRScanner && (
        <div className="fixed inset-0 bg-navy-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="max-w-3xl w-full">
            <DocumentOCRProcessor
              onClose={() => setShowOCRScanner(false)}
              onTextExtracted={async (text) => {
                setShowOCRScanner(false);
                if (ocrPurpose === 'analyze') {
                  if (!user) return;
                  const title = `Uploaded document — ${new Date().toLocaleString()}`;
                  const { data, error } = await supabase
                    .from('documents')
                    .insert({
                      user_id: user.id,
                      title,
                      document_type: 'uploaded',
                      content: text,
                      template_used: null,
                      jurisdiction: selectedJurisdiction || null,
                    })
                    .select('id, title, document_type, content, template_used, created_at, jurisdiction')
                    .maybeSingle();
                  if (!error && data) {
                    loadDocuments();
                    setAnalyzingDocument(data as Document);
                  }
                } else {
                  setCustomDocumentDescription(text);
                  setSelectedTemplate('custom');
                  setShowModal(true);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
