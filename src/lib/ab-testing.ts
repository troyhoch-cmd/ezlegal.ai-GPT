const STORAGE_KEY = 'ezlegal_ab_assignments';

export interface ABVariant {
  id: string;
  weight: number;
}

export interface ABTest {
  testId: string;
  variants: ABVariant[];
}

function getAssignments(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAssignments(assignments: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  } catch { /* noop */ }
}

export function getVariant(test: ABTest): string {
  const assignments = getAssignments();

  if (assignments[test.testId]) {
    return assignments[test.testId];
  }

  // Weighted random assignment
  const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;

  let selected = test.variants[0].id;
  for (const variant of test.variants) {
    random -= variant.weight;
    if (random <= 0) {
      selected = variant.id;
      break;
    }
  }

  assignments[test.testId] = selected;
  saveAssignments(assignments);

  return selected;
}

export function resetTest(testId: string) {
  const assignments = getAssignments();
  delete assignments[testId];
  saveAssignments(assignments);
}

// Pre-defined tests for GTM launch
export const HERO_EN_TEST: ABTest = {
  testId: 'hero_en_v1',
  variants: [
    { id: 'control', weight: 50 },
    { id: 'variant_a', weight: 50 },
  ],
};

export const HERO_ES_TEST: ABTest = {
  testId: 'hero_es_v1',
  variants: [
    { id: 'control', weight: 50 },
    { id: 'variant_a', weight: 50 },
  ],
};

export const HERO_EN_COPY: Record<string, { title: string; subtitle: string; cta: string }> = {
  control: {
    title: 'Legal help that speaks your language',
    subtitle: 'Ask legal questions, understand documents, and find safe next steps — in plain English or Spanish. Free to start, no credit card.',
    cta: 'Ask a free legal question',
  },
  variant_a: {
    title: 'Get answers to your legal questions in minutes',
    subtitle: 'AI-powered legal information — free, private, and available 24/7. No signup required. In English or Spanish.',
    cta: 'Start with a free question',
  },
};

export const HERO_ES_COPY: Record<string, { title: string; subtitle: string; cta: string }> = {
  control: {
    title: 'Ayuda legal que habla tu idioma',
    subtitle: 'Haz preguntas legales gratis, entiende tus derechos y encuentra próximos pasos seguros — todo en español. Sin costo, sin tarjeta de crédito, sin juicio.',
    cta: 'Haz tu pregunta gratis',
  },
  variant_a: {
    title: 'Respuestas legales en minutos — gratis y en español',
    subtitle: 'Información legal con IA — gratuita, privada y disponible 24/7. Sin registro. Confidencial.',
    cta: 'Empieza con una pregunta gratis',
  },
};
