export interface Jurisdiction {
  code: string;
  name: string;
  type: 'us-state' | 'federal' | 'territory' | 'international';
}

export interface JurisdictionGroup {
  label: string;
  options: Jurisdiction[];
}

export const US_STATES: Jurisdiction[] = [
  { code: 'AL', name: 'Alabama', type: 'us-state' },
  { code: 'AK', name: 'Alaska', type: 'us-state' },
  { code: 'AZ', name: 'Arizona', type: 'us-state' },
  { code: 'AR', name: 'Arkansas', type: 'us-state' },
  { code: 'CA', name: 'California', type: 'us-state' },
  { code: 'CO', name: 'Colorado', type: 'us-state' },
  { code: 'CT', name: 'Connecticut', type: 'us-state' },
  { code: 'DE', name: 'Delaware', type: 'us-state' },
  { code: 'FL', name: 'Florida', type: 'us-state' },
  { code: 'GA', name: 'Georgia', type: 'us-state' },
  { code: 'HI', name: 'Hawaii', type: 'us-state' },
  { code: 'ID', name: 'Idaho', type: 'us-state' },
  { code: 'IL', name: 'Illinois', type: 'us-state' },
  { code: 'IN', name: 'Indiana', type: 'us-state' },
  { code: 'IA', name: 'Iowa', type: 'us-state' },
  { code: 'KS', name: 'Kansas', type: 'us-state' },
  { code: 'KY', name: 'Kentucky', type: 'us-state' },
  { code: 'LA', name: 'Louisiana', type: 'us-state' },
  { code: 'ME', name: 'Maine', type: 'us-state' },
  { code: 'MD', name: 'Maryland', type: 'us-state' },
  { code: 'MA', name: 'Massachusetts', type: 'us-state' },
  { code: 'MI', name: 'Michigan', type: 'us-state' },
  { code: 'MN', name: 'Minnesota', type: 'us-state' },
  { code: 'MS', name: 'Mississippi', type: 'us-state' },
  { code: 'MO', name: 'Missouri', type: 'us-state' },
  { code: 'MT', name: 'Montana', type: 'us-state' },
  { code: 'NE', name: 'Nebraska', type: 'us-state' },
  { code: 'NV', name: 'Nevada', type: 'us-state' },
  { code: 'NH', name: 'New Hampshire', type: 'us-state' },
  { code: 'NJ', name: 'New Jersey', type: 'us-state' },
  { code: 'NM', name: 'New Mexico', type: 'us-state' },
  { code: 'NY', name: 'New York', type: 'us-state' },
  { code: 'NC', name: 'North Carolina', type: 'us-state' },
  { code: 'ND', name: 'North Dakota', type: 'us-state' },
  { code: 'OH', name: 'Ohio', type: 'us-state' },
  { code: 'OK', name: 'Oklahoma', type: 'us-state' },
  { code: 'OR', name: 'Oregon', type: 'us-state' },
  { code: 'PA', name: 'Pennsylvania', type: 'us-state' },
  { code: 'RI', name: 'Rhode Island', type: 'us-state' },
  { code: 'SC', name: 'South Carolina', type: 'us-state' },
  { code: 'SD', name: 'South Dakota', type: 'us-state' },
  { code: 'TN', name: 'Tennessee', type: 'us-state' },
  { code: 'TX', name: 'Texas', type: 'us-state' },
  { code: 'UT', name: 'Utah', type: 'us-state' },
  { code: 'VT', name: 'Vermont', type: 'us-state' },
  { code: 'VA', name: 'Virginia', type: 'us-state' },
  { code: 'WA', name: 'Washington', type: 'us-state' },
  { code: 'WV', name: 'West Virginia', type: 'us-state' },
  { code: 'WI', name: 'Wisconsin', type: 'us-state' },
  { code: 'WY', name: 'Wyoming', type: 'us-state' },
];

export const FEDERAL_JURISDICTIONS: Jurisdiction[] = [
  { code: 'FED', name: 'Federal (All Circuits)', type: 'federal' },
  { code: 'SCOTUS', name: 'U.S. Supreme Court', type: 'federal' },
  { code: '1CIR', name: '1st Circuit', type: 'federal' },
  { code: '2CIR', name: '2nd Circuit', type: 'federal' },
  { code: '3CIR', name: '3rd Circuit', type: 'federal' },
  { code: '4CIR', name: '4th Circuit', type: 'federal' },
  { code: '5CIR', name: '5th Circuit', type: 'federal' },
  { code: '6CIR', name: '6th Circuit', type: 'federal' },
  { code: '7CIR', name: '7th Circuit', type: 'federal' },
  { code: '8CIR', name: '8th Circuit', type: 'federal' },
  { code: '9CIR', name: '9th Circuit', type: 'federal' },
  { code: '10CIR', name: '10th Circuit', type: 'federal' },
  { code: '11CIR', name: '11th Circuit', type: 'federal' },
  { code: 'DCCIR', name: 'D.C. Circuit', type: 'federal' },
  { code: 'FEDCIR', name: 'Federal Circuit', type: 'federal' },
];

export const US_TERRITORIES: Jurisdiction[] = [
  { code: 'DC', name: 'District of Columbia', type: 'territory' },
  { code: 'PR', name: 'Puerto Rico', type: 'territory' },
  { code: 'GU', name: 'Guam', type: 'territory' },
  { code: 'VI', name: 'U.S. Virgin Islands', type: 'territory' },
  { code: 'AS', name: 'American Samoa', type: 'territory' },
  { code: 'MP', name: 'Northern Mariana Islands', type: 'territory' },
];

export const INTERNATIONAL_JURISDICTIONS: Jurisdiction[] = [
  { code: 'UK', name: 'United Kingdom', type: 'international' },
  { code: 'CA-CAN', name: 'Canada', type: 'international' },
  { code: 'AU', name: 'Australia', type: 'international' },
  { code: 'EU', name: 'European Union', type: 'international' },
  { code: 'DE', name: 'Germany', type: 'international' },
  { code: 'FR', name: 'France', type: 'international' },
  { code: 'JP', name: 'Japan', type: 'international' },
  { code: 'IN', name: 'India', type: 'international' },
  { code: 'BR', name: 'Brazil', type: 'international' },
  { code: 'MX', name: 'Mexico', type: 'international' },
];

export const JURISDICTION_GROUPS: JurisdictionGroup[] = [
  { label: 'Federal', options: FEDERAL_JURISDICTIONS },
  { label: 'U.S. States', options: US_STATES },
  { label: 'U.S. Territories', options: US_TERRITORIES },
  { label: 'International', options: INTERNATIONAL_JURISDICTIONS },
];

export const ALL_JURISDICTIONS: Jurisdiction[] = [
  ...FEDERAL_JURISDICTIONS,
  ...US_STATES,
  ...US_TERRITORIES,
  ...INTERNATIONAL_JURISDICTIONS,
];

export function getJurisdictionByCode(code: string): Jurisdiction | undefined {
  return ALL_JURISDICTIONS.find(j => j.code === code);
}

export function getJurisdictionName(code: string): string {
  const jurisdiction = getJurisdictionByCode(code);
  return jurisdiction?.name || code;
}
