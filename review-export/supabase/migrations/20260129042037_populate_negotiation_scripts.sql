/*
  # Populate Negotiation Scripts

  This migration adds pre-written scripts for common negotiation scenarios.
  These scripts are based on AmLaw 100 negotiation tactics adapted for consumers.

  ## Script Categories
  - Landlord disputes (security deposit, repairs, eviction)
  - Employer disputes (wages, severance, wrongful termination)
  - Debt collector negotiations
  - Insurance claims
  - Contract disputes
  - Consumer complaints

  ## Script Types
  - opening: Initial demand or position statement
  - counter: Response to their offer
  - bracket: Conditional offer tactic
  - walkaway: Leverage when negotiations stall
  - closing: Final offer language
  - tactic_response: How to respond to manipulation
*/

-- Landlord Dispute Scripts
INSERT INTO negotiation_scripts (dispute_type, scenario, script_type, script_title, script_content, psychology_notes, variables, display_order) VALUES
-- Security Deposit
('landlord', 'security_deposit', 'opening', 'Initial Demand for Security Deposit Return',
'Dear {{landlord_name}},

I am writing regarding the security deposit of ${{deposit_amount}} paid on {{move_in_date}} for the property at {{property_address}}.

I vacated the premises on {{move_out_date}} and left the unit in the same condition as when I took possession, accounting for normal wear and tear. Under {{state}} law ({{statute_citation}}), you are required to return my deposit within {{days_required}} days of my move-out date.

That deadline was {{deadline_date}}. I have not received my deposit or an itemized statement of deductions.

I am formally requesting the full return of ${{deposit_amount}} within 7 days of this letter. If I do not receive payment, I will pursue all available legal remedies, which may include filing in small claims court where I may be entitled to {{penalty_multiplier}}x the deposit amount in penalties.

Please send payment to: {{your_address}}

Sincerely,
{{your_name}}',
'This script uses the "anchor high with legal backing" tactic. By citing specific statutes and penalty provisions upfront, you establish that you know your rights. The 7-day deadline creates urgency. Landlords who receive legally-informed demands are statistically more likely to settle.',
'{"landlord_name": "string", "deposit_amount": "number", "move_in_date": "date", "property_address": "string", "move_out_date": "date", "state": "string", "statute_citation": "string", "days_required": "number", "deadline_date": "date", "penalty_multiplier": "number", "your_address": "string", "your_name": "string"}',
1),

('landlord', 'security_deposit', 'counter', 'Response to Partial Deposit Offer',
'Thank you for your response. However, I cannot accept ${{their_offer}} as full settlement.

The deductions you listed are not valid:

{{deduction_1}}: This constitutes normal wear and tear under {{state}} law and cannot be deducted.
{{deduction_2}}: You did not provide documentation of actual repair costs as required by statute.

I am willing to settle this matter for ${{your_counter}} to avoid the time and expense of court. This represents a reasonable compromise given that:

1. I am entitled to the full ${{deposit_amount}} plus potential penalties
2. Small claims court filing fees would be your responsibility if I prevail
3. Judgment would be a matter of public record

This offer is open for 5 business days. After that, I will proceed with filing.

{{your_name}}',
'The "reasoned compromise" tactic shows flexibility while maintaining strength. By explaining WHY their deductions fail AND offering a middle ground, you appear reasonable to any future judge while keeping pressure on.',
'{"their_offer": "number", "deduction_1": "string", "deduction_2": "string", "state": "string", "your_counter": "number", "deposit_amount": "number", "your_name": "string"}',
2),

('landlord', 'security_deposit', 'bracket', 'Bracketing Offer for Security Deposit',
'I understand we see this differently. Let me propose a framework to resolve this:

If you are willing to move to ${{their_target}} (returning most of my deposit), I would be willing to accept ${{your_floor}} to close this matter today.

This bracket of ${{their_target}} to ${{your_floor}} represents the realistic settlement range given the legal issues involved. I am being flexible because I value resolution over litigation.

What can you agree to within this range?',
'Bracketing is a power move used by top negotiators. It signals: "I know where this ends up." By offering THEM a specific number and yourself a different one, you define the playing field. Most settlements land near the midpoint of a bracket.',
'{"their_target": "number", "your_floor": "number"}',
3),

-- Employer/Wage Disputes
('employer', 'unpaid_wages', 'opening', 'Formal Demand for Unpaid Wages',
'Dear {{employer_name}},

This letter serves as formal demand for unpaid wages owed to me for work performed from {{start_date}} to {{end_date}}.

AMOUNT OWED:
- Regular wages: ${{regular_wages}}
- Overtime wages: ${{overtime_wages}}
- {{other_compensation}}: ${{other_amount}}
TOTAL: ${{total_owed}}

Under the Fair Labor Standards Act and {{state}} Labor Code Section {{statute}}, you are required to pay all earned wages. {{state}} law provides for waiting time penalties of up to {{penalty_days}} days of wages (${{penalty_amount}}) for willful failure to pay.

I demand payment of ${{total_owed}} within 10 days. If payment is not received, I will:
1. File a wage claim with the {{state}} Department of Labor
2. File suit in {{court_type}} court
3. Seek all penalties, interest, and attorney fees available under law

The law is clear on this issue. Please resolve this promptly.

{{your_name}}
{{your_contact}}',
'Wage claims have teeth because of penalty provisions. This script leverages the THREAT of penalties (which can exceed the original wages) to motivate quick settlement. The specific statute citations show you have done your homework.',
'{"employer_name": "string", "start_date": "date", "end_date": "date", "regular_wages": "number", "overtime_wages": "number", "other_compensation": "string", "other_amount": "number", "total_owed": "number", "state": "string", "statute": "string", "penalty_days": "number", "penalty_amount": "number", "court_type": "string", "your_name": "string", "your_contact": "string"}',
1),

('employer', 'severance', 'opening', 'Severance Negotiation Opening',
'Thank you for the severance offer. Before I can consider signing the release, I need to discuss several concerns:

1. COMPENSATION: The offered {{weeks_offered}} weeks does not reflect my {{years_tenure}} years of service and contributions including {{key_achievement}}.

2. BENEFITS: I need continuation of health benefits for {{months_needed}} months, not {{months_offered}}.

3. REFERENCE: I require a neutral reference policy in writing.

4. NON-COMPETE: The {{non_compete_months}}-month non-compete is overly broad and would prevent me from earning a living in my field.

I am prepared to sign a reasonable release, but the terms need to reflect the value I brought to the company and the circumstances of my departure.

I would like to discuss a package including:
- {{weeks_requested}} weeks severance
- {{months_needed}} months COBRA coverage paid
- Neutral reference letter
- Non-compete reduced to {{non_compete_reduced}} months

When can we schedule a call to discuss?',
'Severance is almost always negotiable. Companies offer low to see if you will take it. By responding professionally with SPECIFIC counter-asks (not just "more"), you signal you know the game. Always tie your ask to your value contributed.',
'{"weeks_offered": "number", "years_tenure": "number", "key_achievement": "string", "months_needed": "number", "months_offered": "number", "non_compete_months": "number", "weeks_requested": "number", "non_compete_reduced": "number"}',
1),

-- Debt Collector Negotiations
('debt', 'collection', 'opening', 'Initial Response to Debt Collector',
'Re: Account {{account_number}}
Alleged Creditor: {{original_creditor}}
Alleged Amount: ${{claimed_amount}}

This letter is in response to your collection notice dated {{notice_date}}.

Pursuant to the Fair Debt Collection Practices Act (15 U.S.C. 1692g), I am requesting validation of this debt. Please provide:

1. Verification of the amount claimed, including itemization of principal, interest, and fees
2. The name and address of the original creditor
3. Proof that you are licensed to collect in {{state}}
4. A copy of any agreement bearing my signature

Until you provide this validation, you must cease all collection activities on this account.

Note: This letter is not an acknowledgment of the debt or a promise to pay. I reserve all rights under federal and state law.

Sent via certified mail, return receipt requested.
{{your_name}}',
'The debt validation request is your FIRST move in any debt negotiation. It buys you time (30 days minimum), forces them to prove their case, and often reveals they cannot validate older debts. Many collectors give up or offer settlements when forced to validate.',
'{"account_number": "string", "original_creditor": "string", "claimed_amount": "number", "notice_date": "date", "state": "string", "your_name": "string"}',
1),

('debt', 'collection', 'counter', 'Settlement Counter-Offer',
'I am responding to your settlement offer of {{their_offer_percent}}% (${{their_offer_amount}}).

After reviewing my financial situation, I can offer a lump sum payment of ${{your_offer}} ({{your_percent}}% of the claimed balance) as full and final settlement of this account.

This offer is based on the following:
- The age of this debt ({{debt_age}} years)
- Questions about the validity and documentation of the full amount
- My current financial hardship
- The cost to you of continued collection or litigation

If you accept, I require:
1. Written confirmation of the settlement amount and terms BEFORE payment
2. Agreement that this settles the debt in full
3. Deletion of all negative reporting from all credit bureaus within 30 days of payment
4. No 1099-C issued for forgiven debt under $600

This offer expires in 14 days. After that, I will reconsider my options.

{{your_name}}',
'Debt buyers purchase debt for pennies on the dollar (typically 4-7 cents). They profit on anything above that. Your 20-30% offer is often more than they paid. The "pay for delete" request is key - many collectors will agree to remove negative marks in exchange for payment.',
'{"their_offer_percent": "number", "their_offer_amount": "number", "your_offer": "number", "your_percent": "number", "debt_age": "number", "your_name": "string"}',
2),

-- Insurance Claims
('insurance', 'claim_denial', 'opening', 'Appeal of Insurance Claim Denial',
'Re: Claim #{{claim_number}}
Policy #{{policy_number}}
Date of Loss: {{loss_date}}

Dear Claims Manager,

I am formally appealing your denial of my claim dated {{denial_date}}.

Your stated reason for denial was: "{{denial_reason}}"

This denial is improper because:

1. POLICY COVERAGE: My policy explicitly covers {{coverage_type}} under Section {{policy_section}}. The exclusion you cited does not apply because {{exclusion_rebuttal}}.

2. DOCUMENTATION: I have provided {{documentation_list}}. If additional documentation is needed, please specify exactly what is required.

3. BAD FAITH CONCERNS: {{state}} law requires insurers to process claims in good faith. Denying valid claims without proper investigation may constitute bad faith, exposing {{insurance_company}} to additional damages.

I demand you:
1. Reopen this claim immediately
2. Assign a senior adjuster to review
3. Provide a written response within 15 days

If this matter is not resolved, I will file a complaint with the {{state}} Department of Insurance and consult with an attorney regarding bad faith claims.

{{your_name}}
cc: {{state}} Department of Insurance',
'Insurance companies deny valid claims betting most people will not appeal. The "bad faith" threat is powerful because it exposes them to damages beyond the claim value. The cc to the state insurance department signals you mean business.',
'{"claim_number": "string", "policy_number": "string", "loss_date": "date", "denial_date": "date", "denial_reason": "string", "coverage_type": "string", "policy_section": "string", "exclusion_rebuttal": "string", "documentation_list": "string", "state": "string", "insurance_company": "string", "your_name": "string"}',
1),

-- Tactic Responses
('general', 'lowball', 'tactic_response', 'Responding to a Lowball Offer',
'I appreciate you making an offer, but ${{their_offer}} does not reflect a serious attempt to resolve this matter.

[PAUSE - Do not fill the silence. Let them speak next.]

Based on {{your_reasoning}}, the appropriate range for settlement is ${{range_low}} to ${{range_high}}. Your offer of ${{their_offer}} is not within that range.

I am here to negotiate in good faith. Are you authorized to make a meaningful offer, or do I need to speak with someone else?',
'Lowball offers are a TEST. If you counter immediately, they know you are anxious. Instead: 1) Name it as inadequate, 2) Use silence as pressure, 3) Question their authority. This shifts power back to you.',
'{"their_offer": "number", "your_reasoning": "string", "range_low": "number", "range_high": "number"}',
1),

('general', 'take_it_or_leave_it', 'tactic_response', 'Responding to "Final Offer" Pressure',
'I understand you are characterizing this as your final offer. However:

1. "Final" offers rarely are. Companies settle cases every day for amounts they previously called "final."

2. I have a strong case and am prepared to pursue it through {{alternative}} if necessary.

3. It costs you more to {{their_cost}} than to settle reasonably.

I am not trying to be difficult. I am trying to reach a fair resolution. If ${{their_final}} is truly your maximum authority, I would ask you to check with {{higher_authority}} whether there is any flexibility given the strength of my position.

I can wait for that call.',
'The "final offer" is almost never final. It is a pressure tactic. By calmly calling the bluff AND giving them a face-saving way to come back with more (blame the boss), you keep the negotiation alive.',
'{"alternative": "string", "their_cost": "string", "their_final": "number", "higher_authority": "string"}',
2),

('general', 'good_cop_bad_cop', 'tactic_response', 'Recognizing Good Cop/Bad Cop',
'I notice we seem to have different decision-makers with different positions here.

Let me be direct: I am negotiating with {{company_name}}, not with individuals. Whatever internal discussions you need to have, I need a single, authorized position from the company.

Can you take 10 minutes to align internally and come back with a unified offer? I will wait.

[If they continue the routine:]

I appreciate the different perspectives, but this dynamic is not productive. I would prefer to pause and resume when you have a single spokesperson with full authority.',
'Good cop/bad cop is designed to make you grateful when the "nice" one seems to advocate for you. Do not fall for it. Call it out professionally and demand a unified position. This neutralizes the tactic.',
'{"company_name": "string"}',
3),

('general', 'time_pressure', 'tactic_response', 'Handling Artificial Deadlines',
'I understand you have mentioned a deadline of {{their_deadline}}.

However, I am not prepared to make a decision under artificial time pressure. Good agreements take the time they take.

If this deadline is truly immovable, please explain in writing why that is the case. If it is a negotiating tactic, I would suggest we focus on the substance instead.

I am available to continue discussions at {{your_availability}}. But I will not be rushed into a bad deal.',
'Artificial deadlines are designed to prevent you from thinking clearly or getting advice. Real deadlines (court dates, statute of limitations) exist - fake ones do not survive scrutiny. Ask them to justify it.',
'{"their_deadline": "string", "your_availability": "string"}',
4)

ON CONFLICT DO NOTHING;