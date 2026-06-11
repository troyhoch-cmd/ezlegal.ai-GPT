export interface TrustSignal {
  id: string;
  text: { en: string; es: string };
  icon: string;
}

export const heroTrustItems: TrustSignal[] = [
  {
    id: 'free-to-start',
    text: { en: 'Free to start', es: 'Gratis para comenzar' },
    icon: 'CheckCircle',
  },
  {
    id: 'bilingual',
    text: { en: 'English and Spanish', es: 'Ingl\u00e9s y espa\u00f1ol' },
    icon: 'Globe',
  },
  {
    id: 'not-law-firm',
    text: { en: 'Not a law firm / not legal advice', es: 'No es bufete / no es asesor\u00eda legal' },
    icon: 'AlertCircle',
  },
  {
    id: 'privacy-first',
    text: { en: 'Privacy-first / no sensitive IDs requested', es: 'Privacidad primero / no pedimos IDs sensibles' },
    icon: 'Lock',
  },
];

export const trustStripClaims: TrustSignal[] = [
  {
    id: 'not-law-firm',
    text: { en: 'Not a law firm', es: 'No somos un bufete' },
    icon: 'AlertCircle',
  },
  {
    id: 'legal-info-not-advice',
    text: { en: 'Legal information, not legal advice', es: 'Informaci\u00f3n legal, no asesor\u00eda legal' },
    icon: 'Info',
  },
  {
    id: 'privacy-first',
    text: { en: 'Privacy-first intake', es: 'Intake con privacidad primero' },
    icon: 'Lock',
  },
  {
    id: 'human-help',
    text: { en: 'Human help options', es: 'Opciones de ayuda humana' },
    icon: 'Users',
  },
  {
    id: 'bilingual-support',
    text: { en: 'Spanish and English support', es: 'Soporte en espa\u00f1ol e ingl\u00e9s' },
    icon: 'Globe',
  },
];

export const riskReducers: TrustSignal[] = [
  {
    id: 'save-progress',
    text: { en: 'Save your progress', es: 'Guarda tu progreso' },
    icon: 'Bookmark',
  },
  {
    id: 'plain-language',
    text: { en: 'Plain-language explanations', es: 'Explicaciones en lenguaje simple' },
    icon: 'MessageSquare',
  },
  {
    id: 'spanish-first',
    text: { en: 'Spanish-first support', es: 'Soporte en espa\u00f1ol' },
    icon: 'Globe',
  },
  {
    id: 'human-review',
    text: { en: 'Human review available', es: 'Revisi\u00f3n humana disponible' },
    icon: 'UserCheck',
  },
  {
    id: 'no-retainer',
    text: { en: 'No retainer required', es: 'Sin anticipo requerido' },
    icon: 'Shield',
  },
  {
    id: 'encrypted',
    text: { en: 'Private and encrypted', es: 'Privado y cifrado' },
    icon: 'Lock',
  },
];
