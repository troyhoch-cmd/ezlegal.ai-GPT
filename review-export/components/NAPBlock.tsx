import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import {
  BusinessLocation,
  FALLBACK_LOCATION,
  fetchPrimaryLocation,
  formatAddressOneLine,
} from '../lib/local-seo';

interface NAPBlockProps {
  variant?: 'stacked' | 'inline' | 'card';
  showHours?: boolean;
  showEmail?: boolean;
  className?: string;
}

export default function NAPBlock({
  variant = 'stacked',
  showHours = false,
  showEmail = false,
  className = '',
}: NAPBlockProps) {
  const [loc, setLoc] = useState<BusinessLocation>(FALLBACK_LOCATION);

  useEffect(() => {
    fetchPrimaryLocation().then(setLoc);
  }, []);

  const mapsHref = loc.google_place_id
    ? `https://www.google.com/maps/place/?q=place_id:${loc.google_place_id}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddressOneLine(loc))}`;

  if (variant === 'inline') {
    return (
      <address
        className={`not-italic text-sm ${className}`}
        itemScope
        itemType="https://schema.org/LocalBusiness"
      >
        <meta itemProp="name" content={loc.display_name} />
        <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
          <span itemProp="streetAddress">{loc.street_address}</span>,{' '}
          <span itemProp="addressLocality">{loc.address_locality}</span>,{' '}
          <span itemProp="addressRegion">{loc.address_region}</span>{' '}
          <span itemProp="postalCode">{loc.postal_code}</span>
        </span>
        {' · '}
        <a href={`tel:${loc.phone_e164}`} itemProp="telephone" className="hover:underline">
          {loc.phone_display}
        </a>
      </address>
    );
  }

  const wrapperClass =
    variant === 'card'
      ? `rounded-xl border border-navy-200 bg-white p-6 shadow-sm ${className}`
      : className;

  return (
    <address
      className={`not-italic ${wrapperClass}`}
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <meta itemProp="name" content={loc.display_name} />
      <div
        itemProp="address"
        itemScope
        itemType="https://schema.org/PostalAddress"
        className="flex items-start gap-3"
      >
        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-teal-600" aria-hidden="true" />
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm leading-relaxed hover:underline"
        >
          <span itemProp="streetAddress">{loc.street_address}</span>
          <br />
          <span itemProp="addressLocality">{loc.address_locality}</span>,{' '}
          <span itemProp="addressRegion">{loc.address_region}</span>{' '}
          <span itemProp="postalCode">{loc.postal_code}</span>
        </a>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Phone className="h-4 w-4 flex-shrink-0 text-teal-600" aria-hidden="true" />
        <a
          href={`tel:${loc.phone_e164}`}
          itemProp="telephone"
          content={loc.phone_e164}
          className="text-sm hover:underline"
        >
          {loc.phone_display}
        </a>
      </div>

      {showEmail && loc.email && (
        <div className="mt-3 flex items-center gap-3">
          <Mail className="h-4 w-4 flex-shrink-0 text-teal-600" aria-hidden="true" />
          <a href={`mailto:${loc.email}`} itemProp="email" className="text-sm hover:underline">
            {loc.email}
          </a>
        </div>
      )}

      {showHours && loc.hours.length > 0 && (
        <div className="mt-3 flex items-start gap-3">
          <Clock className="h-4 w-4 flex-shrink-0 mt-0.5 text-teal-600" aria-hidden="true" />
          <dl className="text-sm">
            {loc.hours.map((h) => (
              <div key={h.day} className="flex gap-2">
                <dt className="font-medium w-20">{h.day}</dt>
                <dd>
                  <time>{h.opens}</time>–<time>{h.closes}</time>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </address>
  );
}
