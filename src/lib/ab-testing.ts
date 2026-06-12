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
    title: 'Start with legal information in English or Spanish',
    subtitle: 'AI-powered legal information — free to start and available 24/7. Understand your rights and find next steps.',
    cta: 'Start with a free question',
  },
};

export const HERO_ES_COPY: Record<string, { title: string; subtitle: string; cta: string }> = {
  control: {
    title: 'Ayuda legal que habla tu idioma',
    subtitle: 'Haz preguntas legales, entiende tus derechos y encuentra próximos pasos seguros — en español o inglés. Gratis para comenzar, sin tarjeta de crédito.',
    cta: 'Haz tu pregunta gratis',
  },
  variant_a: {
    title: 'Información legal en español o inglés — gratis para comenzar',
    subtitle: 'Información legal con IA — gratuita para comenzar y disponible 24/7. Entiende tus derechos y encuentra próximos pasos.',
    cta: 'Empieza con una pregunta gratis',
  },
};
