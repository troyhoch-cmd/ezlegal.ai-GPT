import { useEffect } from 'react';
import {
  fetchPrimaryLocation,
  fetchServiceAreas,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
} from '../lib/local-seo';

const SCHEMA_IDS = ['ld-local-business', 'ld-organization'] as const;

export default function LocalBusinessSchema() {
  useEffect(() => {
    let cancelled = false;
    const siteUrl = window.location.origin;

    (async () => {
      const loc = await fetchPrimaryLocation();
      const areas = await fetchServiceAreas(loc.id);
      if (cancelled) return;

      const payloads: Record<(typeof SCHEMA_IDS)[number], object> = {
        'ld-local-business': buildLocalBusinessSchema(loc, areas, siteUrl),
        'ld-organization': buildOrganizationSchema(loc, siteUrl),
      };

      SCHEMA_IDS.forEach((id) => {
        let el = document.getElementById(id) as HTMLScriptElement | null;
        if (!el) {
          el = document.createElement('script');
          el.type = 'application/ld+json';
          el.id = id;
          document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(payloads[id]);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
