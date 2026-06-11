import { supabase } from './supabase';

export interface BusinessHours {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  opens: string;
  closes: string;
}

export interface BusinessLocation {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  street_address: string;
  address_locality: string;
  address_region: string;
  postal_code: string;
  address_country: string;
  phone_e164: string;
  phone_display: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  hours: BusinessHours[];
  price_range: string;
  same_as: string[];
  google_place_id: string;
  is_primary: boolean;
}

export interface ServiceArea {
  id: string;
  area_type: 'City' | 'County' | 'State' | 'Region';
  area_name: string;
  area_region: string;
  priority: number;
}

export const FALLBACK_LOCATION: BusinessLocation = {
  id: 'fallback',
  slug: 'tucson-hq',
  legal_name: 'ezLegal.ai, a Legalbreeze company',
  display_name: 'ezLegal.ai',
  street_address: '177 N. Church Ave. Suite 808',
  address_locality: 'Tucson',
  address_region: 'AZ',
  postal_code: '85701',
  address_country: 'US',
  phone_e164: '+15205550100',
  phone_display: '(520) 555-0100',
  email: 'support@ezlegal.ai',
  latitude: 32.221743,
  longitude: -110.969749,
  hours: [
    { day: 'Monday', opens: '09:00', closes: '18:00' },
    { day: 'Tuesday', opens: '09:00', closes: '18:00' },
    { day: 'Wednesday', opens: '09:00', closes: '18:00' },
    { day: 'Thursday', opens: '09:00', closes: '18:00' },
    { day: 'Friday', opens: '09:00', closes: '18:00' },
  ],
  price_range: '$',
  same_as: ['https://www.linkedin.com/company/ezlegal-ai'],
  google_place_id: '',
  is_primary: true,
};

export async function fetchPrimaryLocation(): Promise<BusinessLocation> {
  const { data } = await supabase
    .from('business_locations')
    .select('*')
    .eq('is_active', true)
    .eq('is_primary', true)
    .maybeSingle();
  return (data as BusinessLocation | null) ?? FALLBACK_LOCATION;
}

export async function fetchServiceAreas(locationId: string): Promise<ServiceArea[]> {
  if (locationId === 'fallback') return [];
  const { data } = await supabase
    .from('business_service_areas')
    .select('id, area_type, area_name, area_region, priority')
    .eq('location_id', locationId)
    .order('priority', { ascending: true });
  return (data as ServiceArea[] | null) ?? [];
}

const DAY_TO_SCHEMA: Record<BusinessHours['day'], string> = {
  Monday: 'Mo',
  Tuesday: 'Tu',
  Wednesday: 'We',
  Thursday: 'Th',
  Friday: 'Fr',
  Saturday: 'Sa',
  Sunday: 'Su',
};

export function buildLocalBusinessSchema(
  loc: BusinessLocation,
  areas: ServiceArea[],
  siteUrl: string
) {
  const openingHoursSpecification = loc.hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: `https://schema.org/${h.day}`,
    opens: h.opens,
    closes: h.closes,
  }));

  const areaServed = areas.length
    ? areas.map((a) => ({
        '@type': a.area_type === 'State' ? 'State' : a.area_type === 'County' ? 'AdministrativeArea' : 'City',
        name: a.area_name,
        containedInPlace: { '@type': 'State', name: a.area_region },
      }))
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': ['LegalService', 'ProfessionalService'],
    '@id': `${siteUrl}#business`,
    name: loc.display_name,
    legalName: loc.legal_name,
    description:
      'AI-powered legal information platform providing access to justice for consumers and small businesses. Not a law firm.',
    url: siteUrl,
    telephone: loc.phone_e164,
    email: loc.email || undefined,
    priceRange: loc.price_range,
    image: `${siteUrl}/red-and-grey-minamali-business-card-2-1-2.svg`,
    logo: `${siteUrl}/red-and-grey-minamali-business-card-2-1-2.svg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.street_address,
      addressLocality: loc.address_locality,
      addressRegion: loc.address_region,
      postalCode: loc.postal_code,
      addressCountry: loc.address_country,
    },
    geo:
      loc.latitude != null && loc.longitude != null
        ? {
            '@type': 'GeoCoordinates',
            latitude: loc.latitude,
            longitude: loc.longitude,
          }
        : undefined,
    openingHoursSpecification,
    areaServed,
    sameAs: loc.same_as,
    hasMap: loc.google_place_id
      ? `https://www.google.com/maps/place/?q=place_id:${loc.google_place_id}`
      : undefined,
  };
}

export function buildOrganizationSchema(loc: BusinessLocation, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: loc.legal_name,
    url: siteUrl,
    logo: `${siteUrl}/red-and-grey-minamali-business-card-2-1-2.svg`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: loc.phone_e164,
        contactType: 'customer support',
        areaServed: 'US',
        availableLanguage: ['English', 'Spanish'],
      },
    ],
    sameAs: loc.same_as,
  };
}

export function formatAddressOneLine(loc: BusinessLocation): string {
  return `${loc.street_address}, ${loc.address_locality}, ${loc.address_region} ${loc.postal_code}`;
}
