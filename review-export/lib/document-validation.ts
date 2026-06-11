export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'percentage' | 'currency' | 'email' | 'phone' | 'textarea';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: string, allValues: Record<string, string>) => string | null;
  };
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const validateField = (
  value: string,
  config: FieldConfig,
  allValues: Record<string, string> = {}
): ValidationResult => {
  if (config.required && !value.trim()) {
    return { isValid: false, error: `${config.label} is required` };
  }

  if (!value.trim()) {
    return { isValid: true, error: null };
  }

  const { validation } = config;
  if (!validation) {
    return { isValid: true, error: null };
  }

  if (validation.minLength && value.length < validation.minLength) {
    return { isValid: false, error: `${config.label} must be at least ${validation.minLength} characters` };
  }

  if (validation.maxLength && value.length > validation.maxLength) {
    return { isValid: false, error: `${config.label} must be no more than ${validation.maxLength} characters` };
  }

  if (validation.pattern && !validation.pattern.test(value)) {
    return { isValid: false, error: `${config.label} format is invalid` };
  }

  if (config.type === 'number' || config.type === 'percentage' || config.type === 'currency') {
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(numValue)) {
      return { isValid: false, error: `${config.label} must be a valid number` };
    }
    if (validation.min !== undefined && numValue < validation.min) {
      return { isValid: false, error: `${config.label} must be at least ${validation.min}` };
    }
    if (validation.max !== undefined && numValue > validation.max) {
      return { isValid: false, error: `${config.label} must be no more than ${validation.max}` };
    }
  }

  if (config.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
  }

  if (config.type === 'phone') {
    const phonePattern = /^[\d\s\-\(\)\+]+$/;
    if (!phonePattern.test(value) || value.replace(/\D/g, '').length < 10) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }
  }

  if (validation.custom) {
    const customError = validation.custom(value, allValues);
    if (customError) {
      return { isValid: false, error: customError };
    }
  }

  return { isValid: true, error: null };
};

export const formatInput = (value: string, type: FieldConfig['type']): string => {
  switch (type) {
    case 'phone':
      const digits = value.replace(/\D/g, '').slice(0, 10);
      if (digits.length >= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length >= 3) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      }
      return digits;

    case 'currency':
      const currencyDigits = value.replace(/[^0-9.]/g, '');
      const parts = currencyDigits.split('.');
      if (parts.length > 2) {
        return parts[0] + '.' + parts.slice(1).join('');
      }
      if (parts[1]?.length > 2) {
        return parts[0] + '.' + parts[1].slice(0, 2);
      }
      return currencyDigits;

    case 'percentage':
      const percentDigits = value.replace(/[^0-9.]/g, '');
      const percentParts = percentDigits.split('.');
      if (percentParts.length > 2) {
        return percentParts[0] + '.' + percentParts.slice(1).join('');
      }
      return percentDigits;

    default:
      return value;
  }
};

export const TEMPLATE_FIELD_CONFIGS: Record<string, Record<string, FieldConfig>> = {
  '501c3_formation': {
    organization_name: {
      name: 'organization_name',
      label: 'Organization Name',
      type: 'text',
      placeholder: 'e.g., Community Health Foundation',
      helperText: 'The official name of your nonprofit organization as it will appear on legal documents',
      required: true,
      validation: { minLength: 3, maxLength: 100 }
    },
    state: {
      name: 'state',
      label: 'State of Incorporation',
      type: 'text',
      placeholder: 'e.g., Arizona',
      helperText: 'The U.S. state where your nonprofit will be legally incorporated',
      required: true
    },
    purpose: {
      name: 'purpose',
      label: 'Charitable Purpose',
      type: 'textarea',
      placeholder: 'e.g., To provide healthcare services to underserved communities...',
      helperText: 'Describe the specific charitable, educational, religious, or scientific purpose of your organization',
      required: true,
      validation: { minLength: 20, maxLength: 1000 }
    },
    registered_agent: {
      name: 'registered_agent',
      label: 'Registered Agent',
      type: 'text',
      placeholder: 'e.g., John Smith, 123 Main St, Phoenix, AZ 85001',
      helperText: 'The person or entity authorized to receive legal documents on behalf of your organization',
      required: true
    },
    incorporator_name: {
      name: 'incorporator_name',
      label: 'Incorporator Name',
      type: 'text',
      placeholder: 'e.g., Jane Doe',
      helperText: 'The person signing the Articles of Incorporation',
      required: true
    },
    effective_date: {
      name: 'effective_date',
      label: 'Effective Date',
      type: 'date',
      placeholder: '',
      helperText: 'The date when the incorporation becomes effective',
      required: true
    }
  },
  general_partnership_formation: {
    partnership_name: {
      name: 'partnership_name',
      label: 'Partnership Name',
      type: 'text',
      placeholder: 'e.g., Smith & Jones Partners',
      helperText: 'The business name under which the partnership will operate',
      required: true
    },
    partner1_name: {
      name: 'partner1_name',
      label: 'Partner 1 Name',
      type: 'text',
      placeholder: 'e.g., John Smith',
      helperText: 'Full legal name of the first partner',
      required: true
    },
    partner2_name: {
      name: 'partner2_name',
      label: 'Partner 2 Name',
      type: 'text',
      placeholder: 'e.g., Jane Jones',
      helperText: 'Full legal name of the second partner',
      required: true
    },
    business_purpose: {
      name: 'business_purpose',
      label: 'Business Purpose',
      type: 'textarea',
      placeholder: 'e.g., Provide consulting services in the technology sector...',
      helperText: 'Describe the primary business activities of the partnership',
      required: true,
      validation: { minLength: 10 }
    },
    capital_contribution: {
      name: 'capital_contribution',
      label: 'Capital Contribution',
      type: 'currency',
      placeholder: 'e.g., 50000',
      helperText: 'Initial capital contribution amount from each partner (in dollars)',
      required: true,
      validation: { min: 0 }
    },
    effective_date: {
      name: 'effective_date',
      label: 'Effective Date',
      type: 'date',
      placeholder: '',
      helperText: 'Date when the partnership agreement becomes effective',
      required: true
    }
  },
  multiple_member_llc_formation: {
    llc_name: {
      name: 'llc_name',
      label: 'LLC Name',
      type: 'text',
      placeholder: 'e.g., ABC Holdings',
      helperText: 'The official name of your LLC (do not include "LLC" - it will be added automatically)',
      required: true,
      validation: { minLength: 2, maxLength: 80 }
    },
    state: {
      name: 'state',
      label: 'State of Formation',
      type: 'text',
      placeholder: 'e.g., Delaware',
      helperText: 'The state where your LLC will be formed and registered',
      required: true
    },
    member1_name: {
      name: 'member1_name',
      label: 'Member 1 Name',
      type: 'text',
      placeholder: 'e.g., John Smith',
      helperText: 'Full legal name of the first LLC member',
      required: true
    },
    member2_name: {
      name: 'member2_name',
      label: 'Member 2 Name',
      type: 'text',
      placeholder: 'e.g., Jane Doe',
      helperText: 'Full legal name of the second LLC member',
      required: true
    },
    member1_ownership: {
      name: 'member1_ownership',
      label: 'Member 1 Ownership %',
      type: 'percentage',
      placeholder: 'e.g., 50',
      helperText: 'Percentage of ownership for Member 1 (must total 100% with all members)',
      required: true,
      validation: {
        min: 0.01,
        max: 99.99,
        custom: (value, allValues) => {
          const m1 = parseFloat(value) || 0;
          const m2 = parseFloat(allValues.member2_ownership) || 0;
          if (m1 + m2 !== 100 && allValues.member2_ownership) {
            return 'Ownership percentages must total 100%';
          }
          return null;
        }
      }
    },
    member2_ownership: {
      name: 'member2_ownership',
      label: 'Member 2 Ownership %',
      type: 'percentage',
      placeholder: 'e.g., 50',
      helperText: 'Percentage of ownership for Member 2 (must total 100% with all members)',
      required: true,
      validation: {
        min: 0.01,
        max: 99.99,
        custom: (value, allValues) => {
          const m1 = parseFloat(allValues.member1_ownership) || 0;
          const m2 = parseFloat(value) || 0;
          if (m1 + m2 !== 100 && allValues.member1_ownership) {
            return 'Ownership percentages must total 100%';
          }
          return null;
        }
      }
    },
    effective_date: {
      name: 'effective_date',
      label: 'Effective Date',
      type: 'date',
      placeholder: '',
      helperText: 'The date when the Operating Agreement becomes effective',
      required: true
    }
  },
  single_member_llc_formation: {
    llc_name: {
      name: 'llc_name',
      label: 'LLC Name',
      type: 'text',
      placeholder: 'e.g., Smith Consulting',
      helperText: 'The official name of your LLC (do not include "LLC")',
      required: true
    },
    member_name: {
      name: 'member_name',
      label: 'Member Name',
      type: 'text',
      placeholder: 'e.g., John Smith',
      helperText: 'Your full legal name as the sole member of the LLC',
      required: true
    },
    state: {
      name: 'state',
      label: 'State of Formation',
      type: 'text',
      placeholder: 'e.g., California',
      helperText: 'The state where your LLC will be formed',
      required: true
    },
    business_purpose: {
      name: 'business_purpose',
      label: 'Business Purpose',
      type: 'textarea',
      placeholder: 'e.g., Provide professional consulting services...',
      helperText: 'Describe what your LLC will do',
      required: true
    },
    initial_contribution: {
      name: 'initial_contribution',
      label: 'Initial Capital Contribution',
      type: 'currency',
      placeholder: 'e.g., 10000',
      helperText: 'The initial amount you are investing in the LLC (in dollars)',
      required: true,
      validation: { min: 0 }
    },
    effective_date: {
      name: 'effective_date',
      label: 'Effective Date',
      type: 'date',
      placeholder: '',
      helperText: 'Date when the Operating Agreement takes effect',
      required: true
    }
  },
  non_disclosure_agreement: {
    discloser_name: {
      name: 'discloser_name',
      label: 'Disclosing Party Name',
      type: 'text',
      placeholder: 'e.g., ABC Corporation',
      helperText: 'The party sharing confidential information',
      required: true
    },
    recipient_name: {
      name: 'recipient_name',
      label: 'Receiving Party Name',
      type: 'text',
      placeholder: 'e.g., XYZ Consulting',
      helperText: 'The party receiving the confidential information',
      required: true
    },
    purpose: {
      name: 'purpose',
      label: 'Purpose of Disclosure',
      type: 'textarea',
      placeholder: 'e.g., To evaluate a potential business partnership...',
      helperText: 'Why is the confidential information being shared?',
      required: true
    },
    confidential_info_description: {
      name: 'confidential_info_description',
      label: 'Description of Confidential Information',
      type: 'textarea',
      placeholder: 'e.g., Trade secrets, customer lists, financial data...',
      helperText: 'Describe what information will be protected under this NDA',
      required: true
    },
    effective_date: {
      name: 'effective_date',
      label: 'Effective Date',
      type: 'date',
      placeholder: '',
      helperText: 'When does the NDA take effect?',
      required: true
    }
  },
  employment_agreement: {
    employee_name: {
      name: 'employee_name',
      label: 'Employee Name',
      type: 'text',
      placeholder: 'e.g., John Smith',
      helperText: 'Full legal name of the employee',
      required: true
    },
    company_name: {
      name: 'company_name',
      label: 'Company Name',
      type: 'text',
      placeholder: 'e.g., Tech Corp Inc.',
      helperText: 'Full legal name of the employer',
      required: true
    },
    position: {
      name: 'position',
      label: 'Job Title/Position',
      type: 'text',
      placeholder: 'e.g., Senior Software Engineer',
      helperText: 'The official job title for this position',
      required: true
    },
    salary: {
      name: 'salary',
      label: 'Annual Salary',
      type: 'currency',
      placeholder: 'e.g., 85000',
      helperText: 'Annual base salary in dollars',
      required: true,
      validation: { min: 0 }
    },
    start_date: {
      name: 'start_date',
      label: 'Start Date',
      type: 'date',
      placeholder: '',
      helperText: 'First day of employment',
      required: true
    }
  },
  consultant_agreement: {
    consultant_name: {
      name: 'consultant_name',
      label: 'Consultant Name',
      type: 'text',
      placeholder: 'e.g., Jane Doe Consulting',
      helperText: 'Name of the consultant or consulting firm',
      required: true
    },
    client_name: {
      name: 'client_name',
      label: 'Client Name',
      type: 'text',
      placeholder: 'e.g., ABC Corporation',
      helperText: 'Name of the client engaging the consultant',
      required: true
    },
    services_description: {
      name: 'services_description',
      label: 'Services Description',
      type: 'textarea',
      placeholder: 'e.g., Strategic marketing consulting and brand development...',
      helperText: 'Detailed description of the consulting services to be provided',
      required: true
    },
    compensation: {
      name: 'compensation',
      label: 'Compensation Amount',
      type: 'currency',
      placeholder: 'e.g., 15000',
      helperText: 'Total compensation for the consulting engagement (in dollars)',
      required: true,
      validation: { min: 0 }
    },
    start_date: {
      name: 'start_date',
      label: 'Start Date',
      type: 'date',
      placeholder: '',
      helperText: 'When consulting services begin',
      required: true
    },
    end_date: {
      name: 'end_date',
      label: 'End Date',
      type: 'date',
      placeholder: '',
      helperText: 'When consulting engagement ends',
      required: true
    }
  },
  demand_letter: {
    sender_name: {
      name: 'sender_name',
      label: 'Your Name',
      type: 'text',
      placeholder: 'e.g., John Smith',
      helperText: 'Your full legal name or business name',
      required: true
    },
    recipient_name: {
      name: 'recipient_name',
      label: 'Recipient Name',
      type: 'text',
      placeholder: 'e.g., Jane Doe',
      helperText: 'Name of the person or business who owes you money',
      required: true
    },
    amount_owed: {
      name: 'amount_owed',
      label: 'Amount Owed',
      type: 'currency',
      placeholder: 'e.g., 5000',
      helperText: 'Total amount you are demanding (in dollars)',
      required: true,
      validation: { min: 0.01 }
    },
    reason_for_debt: {
      name: 'reason_for_debt',
      label: 'Reason for Debt',
      type: 'textarea',
      placeholder: 'e.g., Unpaid invoices for services rendered on...',
      helperText: 'Explain why the money is owed to you',
      required: true
    },
    payment_deadline: {
      name: 'payment_deadline',
      label: 'Payment Deadline',
      type: 'date',
      placeholder: '',
      helperText: 'Date by which payment must be received',
      required: true
    }
  }
};

export const getFieldConfig = (templateKey: string, fieldName: string): FieldConfig => {
  const templateConfig = TEMPLATE_FIELD_CONFIGS[templateKey];
  if (templateConfig && templateConfig[fieldName]) {
    return templateConfig[fieldName];
  }

  return {
    name: fieldName,
    label: fieldName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    type: fieldName.includes('date') ? 'date' :
          fieldName.includes('amount') || fieldName.includes('salary') || fieldName.includes('price') || fieldName.includes('fee') || fieldName.includes('contribution') || fieldName.includes('compensation') ? 'currency' :
          fieldName.includes('ownership') || fieldName.includes('percent') || fieldName.includes('share') ? 'percentage' :
          fieldName.includes('email') ? 'email' :
          fieldName.includes('phone') ? 'phone' :
          fieldName.includes('purpose') || fieldName.includes('description') || fieldName.includes('reason') ? 'textarea' :
          'text',
    placeholder: '',
    helperText: '',
    required: false
  };
};
