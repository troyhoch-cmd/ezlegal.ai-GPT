import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export interface GlossaryTerm {
  slug: string;
  term: string;
  plain_language: string;
  language: string;
}

let cache: Record<string, GlossaryTerm[]> = {};

export function useGlossary() {
  const { language } = useLanguage();
  const [terms, setTerms] = useState<GlossaryTerm[]>(cache[language] ?? []);

  useEffect(() => {
    let cancelled = false;
    if (cache[language]) {
      setTerms(cache[language]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('glossary_terms')
        .select('slug, term, plain_language, language')
        .eq('language', language);
      if (cancelled) return;
      const rows = data ?? [];
      cache[language] = rows;
      setTerms(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const lookup = (slug: string): GlossaryTerm | undefined =>
    terms.find((t) => t.slug === slug);

  return { terms, lookup };
}
