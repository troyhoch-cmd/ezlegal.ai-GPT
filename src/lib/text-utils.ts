/**
 * Strips Unicode diacritical marks for accent-insensitive matching.
 */
export function normalizeForCrisis(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
