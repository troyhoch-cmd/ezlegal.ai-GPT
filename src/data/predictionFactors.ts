export interface CaseFactorQuestion {
  id: string;
  question: string;
  helpText: string;
  type: 'boolean' | 'select' | 'scale';
  options?: { value: string; label: string; weight: number }[];
  weight: number;
  impactDirection: 'positive' | 'negative' | 'variable';
}

export interface CaseTypeConfig {
  id: string;
  name: string;
  description: string;
  baseSuccessRate: number;
  factors: CaseFactorQuestion[];
  comparableCasesTemplate: string[];
  jurisdictionModifiers: Record<string, number>;
}

export const PREDICTION_CASE_TYPES: Record<string, CaseTypeConfig> = {
  housing: {
    id: 'housing',
    name: 'Housing & Landlord-Tenant',
    description: 'Evictions, lease disputes, security deposits, habitability issues',
    baseSuccessRate: 62,
    factors: [
      {
        id: 'written_lease',
        question: 'Do you have a written lease or rental agreement?',
        helpText: 'Written agreements provide clear terms that courts can enforce',
        type: 'boolean',
        weight: 15,
        impactDirection: 'positive',
      },
      {
        id: 'rent_current',
        question: 'Is your rent currently paid up to date?',
        helpText: 'Being current on rent strengthens your position significantly',
        type: 'boolean',
        weight: 20,
        impactDirection: 'positive',
      },
      {
        id: 'notice_received',
        question: 'Did you receive proper written notice before any eviction action?',
        helpText: 'Landlords must follow specific notice requirements which vary by state',
        type: 'select',
        options: [
          { value: 'yes_proper', label: 'Yes, proper notice was given', weight: -10 },
          { value: 'yes_improper', label: 'Notice given but may be defective', weight: 10 },
          { value: 'no_notice', label: 'No written notice received', weight: 15 },
          { value: 'unknown', label: 'Not sure', weight: 0 },
        ],
        weight: 15,
        impactDirection: 'variable',
      },
      {
        id: 'habitability_issues',
        question: 'Are there unaddressed repair or safety issues with the property?',
        helpText: 'Landlords have a duty to maintain habitable conditions',
        type: 'select',
        options: [
          { value: 'major', label: 'Yes, major issues (no heat, water, pests)', weight: 18 },
          { value: 'minor', label: 'Yes, minor issues', weight: 8 },
          { value: 'none', label: 'No issues or all have been addressed', weight: 0 },
        ],
        weight: 18,
        impactDirection: 'positive',
      },
      {
        id: 'documented_communications',
        question: 'Do you have written records of communications with your landlord?',
        helpText: 'Emails, texts, or letters can serve as evidence',
        type: 'boolean',
        weight: 12,
        impactDirection: 'positive',
      },
      {
        id: 'retaliation_suspected',
        question: 'Did any issues start after you complained about conditions or exercised tenant rights?',
        helpText: 'Retaliation by landlords is illegal in most states',
        type: 'boolean',
        weight: 14,
        impactDirection: 'positive',
      },
      {
        id: 'security_deposit',
        question: 'Is a security deposit involved in your dispute?',
        helpText: 'States have strict rules about security deposit handling',
        type: 'select',
        options: [
          { value: 'withheld_wrongly', label: 'Yes, withheld without proper itemization', weight: 12 },
          { value: 'partial_return', label: 'Yes, partial return with deductions I dispute', weight: 8 },
          { value: 'not_applicable', label: 'No or not relevant', weight: 0 },
        ],
        weight: 12,
        impactDirection: 'positive',
      },
    ],
    comparableCasesTemplate: [
      'Tenant with similar {habitability_issues} issues prevailed in {jurisdiction} - landlord ordered to make repairs and pay damages',
      'Case involving {notice_received} resulted in eviction being dismissed due to procedural defects',
      'Security deposit dispute with {security_deposit} resolved with tenant receiving {outcome_multiplier}x deposit back under state law',
    ],
    jurisdictionModifiers: {
      CA: 15, NY: 12, NJ: 10, MA: 10, WA: 8, OR: 8, IL: 6, MN: 5, CO: 4,
      AZ: 3, FL: 0, TX: -5, GA: -3,
    },
  },

  family: {
    id: 'family',
    name: 'Family Law',
    description: 'Divorce, child custody, child support, domestic violence',
    baseSuccessRate: 55,
    factors: [
      {
        id: 'primary_caregiver',
        question: 'Have you been the primary caregiver for any children involved?',
        helpText: 'Courts consider who has been the primary caregiver',
        type: 'boolean',
        weight: 18,
        impactDirection: 'positive',
      },
      {
        id: 'stable_living',
        question: 'Do you have stable housing suitable for children?',
        helpText: 'Stability is a key factor in custody decisions',
        type: 'boolean',
        weight: 14,
        impactDirection: 'positive',
      },
      {
        id: 'employment_status',
        question: 'What is your current employment situation?',
        helpText: 'Financial stability affects support calculations',
        type: 'select',
        options: [
          { value: 'employed_stable', label: 'Employed with stable income', weight: 10 },
          { value: 'employed_variable', label: 'Employed with variable income', weight: 5 },
          { value: 'unemployed_seeking', label: 'Unemployed but actively seeking', weight: 0 },
          { value: 'unemployed', label: 'Currently unemployed', weight: -5 },
        ],
        weight: 12,
        impactDirection: 'variable',
      },
      {
        id: 'domestic_violence',
        question: 'Is there any history of domestic violence in the relationship?',
        helpText: 'Documented abuse significantly impacts custody decisions',
        type: 'select',
        options: [
          { value: 'documented_against_other', label: 'Yes, documented against the other party', weight: 20 },
          { value: 'undocumented', label: 'Yes, but not formally documented', weight: 8 },
          { value: 'none', label: 'No history of domestic violence', weight: 0 },
        ],
        weight: 20,
        impactDirection: 'positive',
      },
      {
        id: 'willing_coparent',
        question: 'Are you willing to facilitate a relationship between the children and the other parent?',
        helpText: 'Courts favor parents who support the child\'s relationship with both parents',
        type: 'boolean',
        weight: 12,
        impactDirection: 'positive',
      },
      {
        id: 'child_preference',
        question: 'If children are old enough (typically 12+), have they expressed a preference?',
        helpText: 'Older children\'s preferences may be considered',
        type: 'select',
        options: [
          { value: 'prefer_you', label: 'Child prefers living with me', weight: 10 },
          { value: 'prefer_other', label: 'Child prefers the other parent', weight: -8 },
          { value: 'no_preference', label: 'No clear preference or too young', weight: 0 },
        ],
        weight: 10,
        impactDirection: 'variable',
      },
      {
        id: 'substance_abuse',
        question: 'Is there any substance abuse concern with either party?',
        helpText: 'Substance abuse is seriously considered in custody matters',
        type: 'select',
        options: [
          { value: 'other_party_documented', label: 'Other party has documented issues', weight: 15 },
          { value: 'other_party_suspected', label: 'Suspected with the other party', weight: 6 },
          { value: 'neither', label: 'No concerns for either party', weight: 0 },
        ],
        weight: 15,
        impactDirection: 'positive',
      },
    ],
    comparableCasesTemplate: [
      'Primary caregiver parent with {stable_living} received primary custody in {jurisdiction}',
      'Case involving {domestic_violence} resulted in supervised visitation for the other parent',
      'Parent demonstrating willingness to co-parent received more favorable custody arrangement',
    ],
    jurisdictionModifiers: {
      CA: 5, NY: 3, TX: 0, FL: 2, AZ: 3, IL: 2,
    },
  },

  employment: {
    id: 'employment',
    name: 'Employment Law',
    description: 'Wrongful termination, discrimination, harassment, wage disputes',
    baseSuccessRate: 48,
    factors: [
      {
        id: 'written_documentation',
        question: 'Do you have written documentation of the issues (emails, performance reviews, etc.)?',
        helpText: 'Documentary evidence is crucial in employment cases',
        type: 'select',
        options: [
          { value: 'extensive', label: 'Yes, extensive documentation', weight: 20 },
          { value: 'some', label: 'Some documentation exists', weight: 10 },
          { value: 'limited', label: 'Limited or informal records', weight: 3 },
          { value: 'none', label: 'No written documentation', weight: -8 },
        ],
        weight: 20,
        impactDirection: 'variable',
      },
      {
        id: 'witness_availability',
        question: 'Are there coworkers who witnessed the issues and might support your account?',
        helpText: 'Witness testimony can significantly strengthen a case',
        type: 'select',
        options: [
          { value: 'multiple_willing', label: 'Yes, multiple willing witnesses', weight: 15 },
          { value: 'some_possible', label: 'Some who might be willing', weight: 8 },
          { value: 'none_known', label: 'No known witnesses', weight: 0 },
        ],
        weight: 15,
        impactDirection: 'positive',
      },
      {
        id: 'protected_class',
        question: 'Is the issue related to a protected characteristic?',
        helpText: 'Federal and state laws protect against discrimination based on certain characteristics',
        type: 'select',
        options: [
          { value: 'clear_discrimination', label: 'Yes, clear discrimination/retaliation pattern', weight: 18 },
          { value: 'possible', label: 'Possibly, circumstantial evidence suggests it', weight: 8 },
          { value: 'not_related', label: 'Not related to protected characteristics', weight: 0 },
        ],
        weight: 18,
        impactDirection: 'positive',
      },
      {
        id: 'hr_complaint',
        question: 'Did you file a complaint with HR or follow internal grievance procedures?',
        helpText: 'Following internal procedures often required before legal action',
        type: 'boolean',
        weight: 12,
        impactDirection: 'positive',
      },
      {
        id: 'eeoc_filing',
        question: 'Have you filed or do you plan to file with the EEOC or state agency?',
        helpText: 'Required for most federal discrimination claims',
        type: 'select',
        options: [
          { value: 'filed_right_to_sue', label: 'Yes, received right-to-sue letter', weight: 12 },
          { value: 'filed_pending', label: 'Filed, currently pending', weight: 8 },
          { value: 'planning', label: 'Planning to file', weight: 4 },
          { value: 'not_filed', label: 'Not filed', weight: 0 },
        ],
        weight: 12,
        impactDirection: 'positive',
      },
      {
        id: 'employer_size',
        question: 'How large is the employer?',
        helpText: 'Some laws only apply to employers of a certain size',
        type: 'select',
        options: [
          { value: 'large_100plus', label: 'Large (100+ employees)', weight: 8 },
          { value: 'medium_15_99', label: 'Medium (15-99 employees)', weight: 5 },
          { value: 'small_under_15', label: 'Small (under 15 employees)', weight: -5 },
        ],
        weight: 10,
        impactDirection: 'variable',
      },
      {
        id: 'timing_retaliation',
        question: 'Did any adverse action occur shortly after you engaged in protected activity?',
        helpText: 'Close timing between complaint and termination suggests retaliation',
        type: 'select',
        options: [
          { value: 'within_days', label: 'Yes, within days or weeks', weight: 18 },
          { value: 'within_months', label: 'Yes, within a few months', weight: 10 },
          { value: 'longer', label: 'No or longer time period', weight: 0 },
        ],
        weight: 16,
        impactDirection: 'positive',
      },
    ],
    comparableCasesTemplate: [
      'Employee with {written_documentation} of discrimination recovered substantial damages',
      'Retaliation case with {timing_retaliation} timing pattern resulted in settlement',
      'Wage claim with {employment_duration} employment and {written_documentation} recovered back pay plus penalties',
    ],
    jurisdictionModifiers: {
      CA: 12, NY: 10, NJ: 8, MA: 9, IL: 6, WA: 7, CO: 5, MN: 5,
      TX: -5, FL: -3, GA: -4, AZ: 2,
    },
  },

  consumer: {
    id: 'consumer',
    name: 'Consumer Protection',
    description: 'Debt collection, credit reporting, consumer fraud, warranty claims',
    baseSuccessRate: 65,
    factors: [
      {
        id: 'fdcpa_violation',
        question: 'Did a debt collector engage in harassing or deceptive practices?',
        helpText: 'The FDCPA prohibits harassment, false statements, and unfair practices',
        type: 'select',
        options: [
          { value: 'multiple_violations', label: 'Yes, multiple clear violations', weight: 20 },
          { value: 'some_violations', label: 'Yes, some questionable practices', weight: 12 },
          { value: 'none_known', label: 'No apparent violations', weight: 0 },
        ],
        weight: 20,
        impactDirection: 'positive',
      },
      {
        id: 'debt_validation',
        question: 'Did you request debt validation and was it properly provided?',
        helpText: 'Collectors must verify debts upon request',
        type: 'select',
        options: [
          { value: 'requested_not_provided', label: 'Requested but not properly provided', weight: 15 },
          { value: 'never_requested', label: 'Never requested', weight: 0 },
          { value: 'provided', label: 'Properly validated', weight: -3 },
        ],
        weight: 15,
        impactDirection: 'positive',
      },
      {
        id: 'credit_report_errors',
        question: 'Are there errors on your credit report that you\'ve disputed?',
        helpText: 'Credit bureaus must investigate disputes within 30 days',
        type: 'select',
        options: [
          { value: 'disputed_not_corrected', label: 'Yes, disputed but not corrected', weight: 18 },
          { value: 'disputed_partially', label: 'Partially corrected after dispute', weight: 10 },
          { value: 'not_disputed', label: 'Not yet disputed', weight: 5 },
          { value: 'no_errors', label: 'No errors found', weight: 0 },
        ],
        weight: 18,
        impactDirection: 'positive',
      },
      {
        id: 'written_disputes',
        question: 'Do you have copies of written disputes you\'ve sent?',
        helpText: 'Documentation of disputes is essential',
        type: 'boolean',
        weight: 14,
        impactDirection: 'positive',
      },
      {
        id: 'financial_harm',
        question: 'Have you suffered financial harm (denied credit, higher rates, etc.)?',
        helpText: 'Actual damages can significantly increase recovery',
        type: 'select',
        options: [
          { value: 'significant', label: 'Yes, significant harm (denied loan, lost job)', weight: 15 },
          { value: 'moderate', label: 'Yes, moderate harm (higher rates)', weight: 8 },
          { value: 'minimal', label: 'Minimal or no financial harm yet', weight: 0 },
        ],
        weight: 14,
        impactDirection: 'positive',
      },
      {
        id: 'statute_of_limitations',
        question: 'Is the underlying debt within the statute of limitations?',
        helpText: 'Time-barred debts have special protections',
        type: 'select',
        options: [
          { value: 'clearly_expired', label: 'No, clearly time-barred', weight: 18 },
          { value: 'possibly_expired', label: 'Possibly expired, unclear', weight: 8 },
          { value: 'within_sol', label: 'Yes, still within time limits', weight: 0 },
        ],
        weight: 15,
        impactDirection: 'positive',
      },
    ],
    comparableCasesTemplate: [
      'Consumer with {fdcpa_violation} recovered statutory damages plus attorney fees',
      'Credit reporting case with {credit_report_errors} resulted in correction and compensation',
      'Debt collection case involving {statute_of_limitations} debt resulted in case dismissal and damages',
    ],
    jurisdictionModifiers: {
      CA: 10, NY: 8, NJ: 7, IL: 6, MA: 6, TX: 3, FL: 4, AZ: 4,
    },
  },

  immigration: {
    id: 'immigration',
    name: 'Immigration',
    description: 'Visa applications, green card, deportation defense, asylum',
    baseSuccessRate: 42,
    factors: [
      {
        id: 'current_status',
        question: 'What is your current immigration status?',
        helpText: 'Your current status affects available options',
        type: 'select',
        options: [
          { value: 'valid_visa', label: 'Valid visa or status', weight: 10 },
          { value: 'expired_status', label: 'Expired status (overstay)', weight: -5 },
          { value: 'undocumented', label: 'Undocumented', weight: -10 },
          { value: 'pending', label: 'Application pending', weight: 5 },
        ],
        weight: 15,
        impactDirection: 'variable',
      },
      {
        id: 'us_ties',
        question: 'Do you have strong ties to the United States?',
        helpText: 'Family relationships, employment, and community ties matter',
        type: 'select',
        options: [
          { value: 'citizen_family', label: 'US citizen immediate family', weight: 18 },
          { value: 'lpr_family', label: 'Lawful permanent resident family', weight: 12 },
          { value: 'employment', label: 'Long-term employment only', weight: 6 },
          { value: 'limited', label: 'Limited ties', weight: 0 },
        ],
        weight: 18,
        impactDirection: 'positive',
      },
      {
        id: 'criminal_history',
        question: 'Do you have any criminal history?',
        helpText: 'Criminal history can significantly impact immigration cases',
        type: 'select',
        options: [
          { value: 'none', label: 'No criminal history', weight: 8 },
          { value: 'minor', label: 'Minor offenses only', weight: 0 },
          { value: 'serious', label: 'Serious offenses', weight: -20 },
        ],
        weight: 20,
        impactDirection: 'variable',
      },
      {
        id: 'asylum_basis',
        question: 'If seeking asylum, is it based on recognized grounds?',
        helpText: 'Race, religion, nationality, political opinion, or particular social group',
        type: 'select',
        options: [
          { value: 'documented_persecution', label: 'Yes, with documented persecution', weight: 18 },
          { value: 'credible_fear', label: 'Yes, credible fear established', weight: 12 },
          { value: 'economic', label: 'Primarily economic reasons', weight: -10 },
          { value: 'not_seeking', label: 'Not seeking asylum', weight: 0 },
        ],
        weight: 18,
        impactDirection: 'variable',
      },
      {
        id: 'prior_removal',
        question: 'Have you ever been deported or have a removal order?',
        helpText: 'Prior removals create additional legal barriers',
        type: 'boolean',
        weight: 15,
        impactDirection: 'negative',
      },
      {
        id: 'time_in_us',
        question: 'How long have you lived in the United States?',
        helpText: 'Length of residence can affect relief options',
        type: 'select',
        options: [
          { value: 'over_10', label: 'Over 10 years continuously', weight: 15 },
          { value: '5_10', label: '5-10 years', weight: 8 },
          { value: 'under_5', label: 'Under 5 years', weight: 2 },
        ],
        weight: 12,
        impactDirection: 'positive',
      },
    ],
    comparableCasesTemplate: [
      'Applicant with {us_ties} and {time_in_us} in US received favorable discretionary decision',
      'Asylum seeker with {asylum_basis} granted protection after demonstrating credible fear',
      'Individual with {current_status} successfully adjusted status through family petition',
    ],
    jurisdictionModifiers: {
      CA: 5, NY: 4, NJ: 3, IL: 2, TX: -3, AZ: -2, FL: 0,
    },
  },

  benefits: {
    id: 'benefits',
    name: 'Government Benefits',
    description: 'Social Security disability, unemployment, food assistance, veterans benefits',
    baseSuccessRate: 58,
    factors: [
      {
        id: 'medical_documentation',
        question: 'Do you have comprehensive medical documentation of your condition?',
        helpText: 'Medical records from treating physicians are essential',
        type: 'select',
        options: [
          { value: 'comprehensive', label: 'Yes, extensive records from multiple doctors', weight: 20 },
          { value: 'good', label: 'Good documentation from primary doctor', weight: 12 },
          { value: 'limited', label: 'Limited medical records', weight: 0 },
          { value: 'none', label: 'No medical documentation', weight: -15 },
        ],
        weight: 20,
        impactDirection: 'variable',
      },
      {
        id: 'work_history',
        question: 'Do you have sufficient work history for the benefit you\'re seeking?',
        helpText: 'Some programs require specific work history',
        type: 'boolean',
        weight: 14,
        impactDirection: 'positive',
      },
      {
        id: 'denial_stage',
        question: 'At what stage is your claim?',
        helpText: 'Success rates vary significantly by appeal level',
        type: 'select',
        options: [
          { value: 'initial', label: 'Initial application', weight: 0 },
          { value: 'reconsideration', label: 'Reconsideration appeal', weight: 3 },
          { value: 'alj_hearing', label: 'ALJ hearing stage', weight: 12 },
          { value: 'appeals_council', label: 'Appeals Council', weight: 8 },
        ],
        weight: 15,
        impactDirection: 'positive',
      },
      {
        id: 'physician_support',
        question: 'Does your treating physician support your disability claim?',
        helpText: 'Opinion from treating doctors carries significant weight',
        type: 'select',
        options: [
          { value: 'strong_support', label: 'Yes, with detailed supporting letter', weight: 18 },
          { value: 'general_support', label: 'Generally supportive', weight: 10 },
          { value: 'neutral', label: 'Neutral or no opinion', weight: 0 },
          { value: 'not_supportive', label: 'Does not support claim', weight: -12 },
        ],
        weight: 18,
        impactDirection: 'variable',
      },
      {
        id: 'functional_limitations',
        question: 'Can you document specific functional limitations?',
        helpText: 'Specific limitations (standing, sitting, lifting) are key evidence',
        type: 'select',
        options: [
          { value: 'severe_documented', label: 'Yes, severe and well-documented', weight: 15 },
          { value: 'moderate_documented', label: 'Moderate limitations documented', weight: 8 },
          { value: 'limited_documentation', label: 'Limited documentation', weight: 0 },
        ],
        weight: 15,
        impactDirection: 'positive',
      },
      {
        id: 'age_factor',
        question: 'What is your age range?',
        helpText: 'Age affects disability evaluation under the medical-vocational guidelines',
        type: 'select',
        options: [
          { value: 'over_55', label: '55 or older', weight: 12 },
          { value: '50_54', label: '50-54', weight: 8 },
          { value: 'under_50', label: 'Under 50', weight: 0 },
        ],
        weight: 12,
        impactDirection: 'positive',
      },
    ],
    comparableCasesTemplate: [
      'Claimant with {medical_documentation} and {physician_support} approved at {denial_stage}',
      'Applicant age {age_factor} with {functional_limitations} received favorable decision',
      'Case with initial denial reversed at ALJ hearing with proper medical documentation',
    ],
    jurisdictionModifiers: {
      CA: 3, NY: 2, FL: 0, TX: -2, AZ: 1, IL: 1,
    },
  },

  personal_injury: {
    id: 'personal_injury',
    name: 'Personal Injury',
    description: 'Auto accidents, slip and fall, medical malpractice, product liability',
    baseSuccessRate: 52,
    factors: [
      {
        id: 'clear_liability',
        question: 'Is liability (who was at fault) clearly established?',
        helpText: 'Clear fault makes cases much stronger',
        type: 'select',
        options: [
          { value: 'very_clear', label: 'Yes, clear evidence of other party\'s fault', weight: 20 },
          { value: 'mostly_clear', label: 'Mostly clear, some questions', weight: 10 },
          { value: 'disputed', label: 'Disputed or shared fault', weight: -5 },
          { value: 'unclear', label: 'Unclear who is at fault', weight: -12 },
        ],
        weight: 20,
        impactDirection: 'variable',
      },
      {
        id: 'documented_injuries',
        question: 'Are your injuries documented with medical records?',
        helpText: 'Prompt medical treatment and documentation is crucial',
        type: 'select',
        options: [
          { value: 'immediate_extensive', label: 'Yes, immediate treatment and ongoing care', weight: 18 },
          { value: 'delayed_treatment', label: 'Treatment started within a week', weight: 8 },
          { value: 'delayed_significantly', label: 'Treatment delayed over a week', weight: -5 },
          { value: 'no_treatment', label: 'No medical treatment yet', weight: -15 },
        ],
        weight: 18,
        impactDirection: 'variable',
      },
      {
        id: 'insurance_coverage',
        question: 'Does the at-fault party have insurance?',
        helpText: 'Insurance coverage affects ability to recover damages',
        type: 'select',
        options: [
          { value: 'adequate', label: 'Yes, adequate coverage', weight: 10 },
          { value: 'minimal', label: 'Yes, but minimal coverage', weight: 3 },
          { value: 'none_known', label: 'Unknown or uninsured', weight: -8 },
        ],
        weight: 12,
        impactDirection: 'variable',
      },
      {
        id: 'witnesses_evidence',
        question: 'Do you have witnesses or other evidence (photos, video, police report)?',
        helpText: 'Independent evidence strengthens your case',
        type: 'select',
        options: [
          { value: 'strong', label: 'Yes, multiple witnesses and/or video', weight: 15 },
          { value: 'some', label: 'Some evidence (police report, photos)', weight: 8 },
          { value: 'limited', label: 'Limited evidence', weight: 0 },
        ],
        weight: 15,
        impactDirection: 'positive',
      },
      {
        id: 'injury_severity',
        question: 'How would you describe the severity of your injuries?',
        helpText: 'More serious injuries typically result in larger recoveries',
        type: 'select',
        options: [
          { value: 'permanent', label: 'Permanent or disabling injuries', weight: 15 },
          { value: 'significant', label: 'Significant injuries requiring ongoing treatment', weight: 10 },
          { value: 'moderate', label: 'Moderate injuries, expected full recovery', weight: 5 },
          { value: 'minor', label: 'Minor injuries', weight: 0 },
        ],
        weight: 14,
        impactDirection: 'positive',
      },
      {
        id: 'comparative_negligence',
        question: 'Did you contribute to the accident in any way?',
        helpText: 'Your own negligence can reduce recovery in most states',
        type: 'select',
        options: [
          { value: 'none', label: 'No, not at all at fault', weight: 8 },
          { value: 'minor', label: 'Possibly minor contribution', weight: 0 },
          { value: 'significant', label: 'May have significantly contributed', weight: -12 },
        ],
        weight: 12,
        impactDirection: 'variable',
      },
    ],
    comparableCasesTemplate: [
      'Plaintiff with {clear_liability} and {documented_injuries} recovered full damages',
      'Case with {witnesses_evidence} settled for policy limits',
      'Injury case with {injury_severity} resulted in substantial compensation for medical bills and pain and suffering',
    ],
    jurisdictionModifiers: {
      CA: 5, NY: 4, FL: 6, TX: 3, IL: 4, NJ: 5, AZ: 3,
    },
  },

  criminal: {
    id: 'criminal',
    name: 'Criminal Defense',
    description: 'DUI, drug offenses, theft, assault, expungement',
    baseSuccessRate: 38,
    factors: [
      {
        id: 'charge_severity',
        question: 'What level of charges are you facing?',
        helpText: 'Severity affects potential outcomes and negotiation leverage',
        type: 'select',
        options: [
          { value: 'misdemeanor', label: 'Misdemeanor', weight: 10 },
          { value: 'felony_nonviolent', label: 'Non-violent felony', weight: 0 },
          { value: 'felony_violent', label: 'Violent felony', weight: -10 },
        ],
        weight: 15,
        impactDirection: 'variable',
      },
      {
        id: 'prior_record',
        question: 'Do you have any prior criminal record?',
        helpText: 'First-time offenders often receive more favorable treatment',
        type: 'select',
        options: [
          { value: 'none', label: 'No prior record', weight: 15 },
          { value: 'minor', label: 'Minor prior offenses', weight: 5 },
          { value: 'significant', label: 'Significant prior record', weight: -10 },
        ],
        weight: 15,
        impactDirection: 'variable',
      },
      {
        id: 'evidence_strength',
        question: 'How strong does the evidence against you appear?',
        helpText: 'Weak evidence creates opportunities for defense',
        type: 'select',
        options: [
          { value: 'weak', label: 'Evidence appears weak or problematic', weight: 18 },
          { value: 'moderate', label: 'Moderate evidence', weight: 5 },
          { value: 'strong', label: 'Strong evidence exists', weight: -8 },
        ],
        weight: 18,
        impactDirection: 'variable',
      },
      {
        id: 'constitutional_issues',
        question: 'Are there potential constitutional issues (illegal search, Miranda, etc.)?',
        helpText: 'Constitutional violations can lead to evidence suppression',
        type: 'select',
        options: [
          { value: 'clear_violation', label: 'Yes, clear violation identified', weight: 20 },
          { value: 'possible', label: 'Possible issues to investigate', weight: 10 },
          { value: 'none_apparent', label: 'No apparent issues', weight: 0 },
        ],
        weight: 18,
        impactDirection: 'positive',
      },
      {
        id: 'diversion_eligible',
        question: 'Are you potentially eligible for diversion or alternative programs?',
        helpText: 'First-time and non-violent offenders may qualify for diversion',
        type: 'boolean',
        weight: 14,
        impactDirection: 'positive',
      },
      {
        id: 'victim_cooperation',
        question: 'Is the alleged victim cooperating with prosecution?',
        helpText: 'Victim cooperation affects case strength',
        type: 'select',
        options: [
          { value: 'not_cooperating', label: 'Not cooperating with prosecution', weight: 12 },
          { value: 'reluctant', label: 'Reluctant or hesitant', weight: 6 },
          { value: 'cooperative', label: 'Fully cooperative', weight: -5 },
          { value: 'no_victim', label: 'No victim (victimless crime)', weight: 3 },
        ],
        weight: 12,
        impactDirection: 'variable',
      },
    ],
    comparableCasesTemplate: [
      'Defendant with {prior_record} and {charge_severity} charges received diversion program',
      'Case with {constitutional_issues} resulted in evidence suppression and dismissal',
      'First-time offender facing {charge_severity} charges received probation instead of jail',
    ],
    jurisdictionModifiers: {
      CA: 5, NY: 3, TX: -3, FL: -2, AZ: 0, IL: 2, WA: 4, OR: 4, CO: 3,
    },
  },
};

export const CONFIDENCE_THRESHOLDS = {
  high: { min: 75, label: 'Strong', color: 'green' },
  medium: { min: 55, label: 'Moderate', color: 'amber' },
  low: { min: 0, label: 'Limited', color: 'red' },
};

export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= CONFIDENCE_THRESHOLDS.high.min) return 'high';
  if (score >= CONFIDENCE_THRESHOLDS.medium.min) return 'medium';
  return 'low';
}

export function getConfidenceLabel(level: 'high' | 'medium' | 'low'): string {
  return CONFIDENCE_THRESHOLDS[level].label;
}
