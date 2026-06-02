/*
  # Local SEO: business locations + service areas

  1. New tables
    - `business_locations` — canonical NAP source of truth (Name, Address, Phone)
      with geo coords, hours, social profiles, and Google Place ID. Single row
      per physical location so the marketing site, schema.org payload, and
      Google Business Profile all pull from the same record.
    - `business_service_areas` — cities / counties served by each location,
      used both for the `areaServed` schema node and for generating
      location-specific landing content.

  2. Security
    - RLS enabled on both tables.
    - Anonymous + authenticated users can SELECT active rows (public marketing
      data that must be indexable).
    - Only admins (profiles.is_admin = true) can INSERT / UPDATE / DELETE.

  3. Seed
    - Inserts the current Tucson HQ row pulled from the footer so the site
      renders the same NAP it does today.
*/

CREATE TABLE IF NOT EXISTS business_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  legal_name text NOT NULL,
  display_name text NOT NULL,
  street_address text NOT NULL,
  address_locality text NOT NULL,
  address_region text NOT NULL,
  postal_code text NOT NULL,
  address_country text NOT NULL DEFAULT 'US',
  phone_e164 text NOT NULL,
  phone_display text NOT NULL,
  email text NOT NULL DEFAULT '',
  latitude numeric(9,6),
  longitude numeric(9,6),
  hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_range text NOT NULL DEFAULT '$',
  same_as jsonb NOT NULL DEFAULT '[]'::jsonb,
  google_place_id text NOT NULL DEFAULT '',
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES business_locations(id) ON DELETE CASCADE,
  area_type text NOT NULL CHECK (area_type IN ('City','County','State','Region')),
  area_name text NOT NULL,
  area_region text NOT NULL,
  priority integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_areas_location ON business_service_areas(location_id);
CREATE INDEX IF NOT EXISTS idx_locations_active ON business_locations(is_active) WHERE is_active = true;

ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active locations"
  ON business_locations FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert locations"
  ON business_locations FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can update locations"
  ON business_locations FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can delete locations"
  ON business_locations FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Anyone can read service areas"
  ON business_service_areas FOR SELECT
  TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM business_locations bl WHERE bl.id = business_service_areas.location_id AND bl.is_active = true));

CREATE POLICY "Admins can insert service areas"
  ON business_service_areas FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can update service areas"
  ON business_service_areas FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can delete service areas"
  ON business_service_areas FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

INSERT INTO business_locations (
  slug, legal_name, display_name,
  street_address, address_locality, address_region, postal_code,
  phone_e164, phone_display, email,
  latitude, longitude,
  hours, price_range, same_as, is_primary
) VALUES (
  'tucson-hq',
  'ezLegal.ai, a Legalbreeze company',
  'ezLegal.ai',
  '177 N. Church Ave. Suite 808',
  'Tucson',
  'AZ',
  '85701',
  '+15205550100',
  '(520) 555-0100',
  'support@ezlegal.ai',
  32.221743,
  -110.969749,
  '[
    {"day":"Monday","opens":"09:00","closes":"18:00"},
    {"day":"Tuesday","opens":"09:00","closes":"18:00"},
    {"day":"Wednesday","opens":"09:00","closes":"18:00"},
    {"day":"Thursday","opens":"09:00","closes":"18:00"},
    {"day":"Friday","opens":"09:00","closes":"18:00"}
  ]'::jsonb,
  '$',
  '["https://www.linkedin.com/company/ezlegal-ai","https://twitter.com/ezlegalai"]'::jsonb,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO business_service_areas (location_id, area_type, area_name, area_region, priority)
SELECT bl.id, v.area_type, v.area_name, v.area_region, v.priority
FROM business_locations bl
CROSS JOIN (VALUES
  ('City','Tucson','AZ',10),
  ('City','Phoenix','AZ',20),
  ('City','Mesa','AZ',30),
  ('City','Chandler','AZ',40),
  ('City','Scottsdale','AZ',50),
  ('County','Pima County','AZ',15),
  ('County','Maricopa County','AZ',25),
  ('State','Arizona','AZ',5)
) AS v(area_type, area_name, area_region, priority)
WHERE bl.slug = 'tucson-hq'
  AND NOT EXISTS (
    SELECT 1 FROM business_service_areas sa
    WHERE sa.location_id = bl.id AND sa.area_name = v.area_name AND sa.area_type = v.area_type
  );
