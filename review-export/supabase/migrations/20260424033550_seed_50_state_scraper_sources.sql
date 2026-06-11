/*
  # Seed 50-state scraper source registry

  Registers one primary state_statute source per US state in `scraper_sources`
  so the Python scraper can discover all 50 jurisdictions without manually
  registering each. Five states (AZ, CA, TX, NY, FL) are marked active and ship
  with working YAML configs; the remaining 45 start inactive until parsers land.

  1. Changes
    - Inserts 50 rows into `scraper_sources` (idempotent via ON CONFLICT)

  2. Security
    - No policy changes (RLS already enabled by earlier migration)
*/

INSERT INTO scraper_sources (source_key, source_name, source_type, jurisdiction, base_url, update_frequency, is_active, scraper_config) VALUES
  ('al_code',        'Code of Alabama',                    'state_statute', 'AL', 'https://alisondb.legislature.state.al.us/', 'monthly', false, '{}'::jsonb),
  ('ak_statutes',    'Alaska Statutes',                    'state_statute', 'AK', 'https://www.akleg.gov/basis/statutes.asp', 'monthly', false, '{}'::jsonb),
  ('az_ars',         'Arizona Revised Statutes',           'state_statute', 'AZ', 'https://www.azleg.gov/arsDetail/', 'monthly', true, '{}'::jsonb),
  ('ar_code',        'Arkansas Code',                      'state_statute', 'AR', 'https://arkleg.state.ar.us/', 'monthly', false, '{}'::jsonb),
  ('ca_codes',       'California Codes',                   'state_statute', 'CA', 'https://leginfo.legislature.ca.gov/', 'monthly', true, '{}'::jsonb),
  ('co_revised_statutes','Colorado Revised Statutes',      'state_statute', 'CO', 'https://leg.colorado.gov/colorado-revised-statutes', 'monthly', false, '{}'::jsonb),
  ('ct_general_statutes','Connecticut General Statutes',   'state_statute', 'CT', 'https://www.cga.ct.gov/current/pub/titles.htm', 'monthly', false, '{}'::jsonb),
  ('de_code',        'Delaware Code',                      'state_statute', 'DE', 'https://delcode.delaware.gov/', 'monthly', false, '{}'::jsonb),
  ('fl_statutes',    'Florida Statutes',                   'state_statute', 'FL', 'http://www.leg.state.fl.us/statutes/', 'monthly', true, '{}'::jsonb),
  ('ga_code',        'Official Code of Georgia Annotated', 'state_statute', 'GA', 'https://law.justia.com/codes/georgia/', 'monthly', false, '{}'::jsonb),
  ('hi_revised_statutes','Hawaii Revised Statutes',        'state_statute', 'HI', 'https://www.capitol.hawaii.gov/', 'monthly', false, '{}'::jsonb),
  ('id_statutes',    'Idaho Statutes',                     'state_statute', 'ID', 'https://legislature.idaho.gov/statutesrules/', 'monthly', false, '{}'::jsonb),
  ('il_compiled_statutes','Illinois Compiled Statutes',    'state_statute', 'IL', 'https://www.ilga.gov/legislation/ilcs/ilcs.asp', 'monthly', false, '{}'::jsonb),
  ('in_code',        'Indiana Code',                       'state_statute', 'IN', 'https://iga.in.gov/laws/', 'monthly', false, '{}'::jsonb),
  ('ia_code',        'Iowa Code',                          'state_statute', 'IA', 'https://www.legis.iowa.gov/law/iowaCode', 'monthly', false, '{}'::jsonb),
  ('ks_statutes',    'Kansas Statutes',                    'state_statute', 'KS', 'http://www.kslegislature.org/li/statute/', 'monthly', false, '{}'::jsonb),
  ('ky_revised_statutes','Kentucky Revised Statutes',      'state_statute', 'KY', 'https://apps.legislature.ky.gov/law/statutes/', 'monthly', false, '{}'::jsonb),
  ('la_revised_statutes','Louisiana Revised Statutes',     'state_statute', 'LA', 'https://legis.la.gov/', 'monthly', false, '{}'::jsonb),
  ('me_revised_statutes','Maine Revised Statutes',         'state_statute', 'ME', 'https://legislature.maine.gov/statutes/', 'monthly', false, '{}'::jsonb),
  ('md_code',        'Maryland Code',                      'state_statute', 'MD', 'https://mgaleg.maryland.gov/mgawebsite/Laws/', 'monthly', false, '{}'::jsonb),
  ('ma_general_laws','Massachusetts General Laws',         'state_statute', 'MA', 'https://malegislature.gov/Laws/GeneralLaws', 'monthly', false, '{}'::jsonb),
  ('mi_compiled_laws','Michigan Compiled Laws',            'state_statute', 'MI', 'http://www.legislature.mi.gov/', 'monthly', false, '{}'::jsonb),
  ('mn_statutes',    'Minnesota Statutes',                 'state_statute', 'MN', 'https://www.revisor.mn.gov/statutes/', 'monthly', false, '{}'::jsonb),
  ('ms_code',        'Mississippi Code',                   'state_statute', 'MS', 'https://law.justia.com/codes/mississippi/', 'monthly', false, '{}'::jsonb),
  ('mo_revised_statutes','Missouri Revised Statutes',      'state_statute', 'MO', 'https://revisor.mo.gov/main/Home.aspx', 'monthly', false, '{}'::jsonb),
  ('mt_code',        'Montana Code Annotated',             'state_statute', 'MT', 'https://leg.mt.gov/bills/mca/', 'monthly', false, '{}'::jsonb),
  ('ne_revised_statutes','Nebraska Revised Statutes',      'state_statute', 'NE', 'https://nebraskalegislature.gov/laws/browse-statutes.php', 'monthly', false, '{}'::jsonb),
  ('nv_revised_statutes','Nevada Revised Statutes',        'state_statute', 'NV', 'https://www.leg.state.nv.us/nrs/', 'monthly', false, '{}'::jsonb),
  ('nh_revised_statutes','New Hampshire Revised Statutes', 'state_statute', 'NH', 'https://www.gencourt.state.nh.us/rsa/html/indexes/default.html', 'monthly', false, '{}'::jsonb),
  ('nj_revised_statutes','New Jersey Revised Statutes',    'state_statute', 'NJ', 'https://www.njleg.state.nj.us/', 'monthly', false, '{}'::jsonb),
  ('nm_statutes',    'New Mexico Statutes',                'state_statute', 'NM', 'https://www.nmlegis.gov/', 'monthly', false, '{}'::jsonb),
  ('ny_laws',        'New York Consolidated Laws',         'state_statute', 'NY', 'https://www.nysenate.gov/legislation/laws', 'monthly', true, '{}'::jsonb),
  ('nc_general_statutes','North Carolina General Statutes','state_statute', 'NC', 'https://www.ncleg.gov/Laws/GeneralStatutes', 'monthly', false, '{}'::jsonb),
  ('nd_century_code','North Dakota Century Code',          'state_statute', 'ND', 'https://ndlegis.gov/cencode/', 'monthly', false, '{}'::jsonb),
  ('oh_revised_code','Ohio Revised Code',                  'state_statute', 'OH', 'https://codes.ohio.gov/ohio-revised-code', 'monthly', false, '{}'::jsonb),
  ('ok_statutes',    'Oklahoma Statutes',                  'state_statute', 'OK', 'https://oksenate.gov/', 'monthly', false, '{}'::jsonb),
  ('or_revised_statutes','Oregon Revised Statutes',        'state_statute', 'OR', 'https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx', 'monthly', false, '{}'::jsonb),
  ('pa_consolidated_statutes','Pennsylvania Consolidated Statutes','state_statute','PA','https://www.legis.state.pa.us/','monthly', false, '{}'::jsonb),
  ('ri_general_laws','Rhode Island General Laws',          'state_statute', 'RI', 'http://webserver.rilin.state.ri.us/Statutes/', 'monthly', false, '{}'::jsonb),
  ('sc_code',        'South Carolina Code of Laws',        'state_statute', 'SC', 'https://www.scstatehouse.gov/code/statmast.php', 'monthly', false, '{}'::jsonb),
  ('sd_codified_laws','South Dakota Codified Laws',        'state_statute', 'SD', 'https://sdlegislature.gov/Statutes/', 'monthly', false, '{}'::jsonb),
  ('tn_code',        'Tennessee Code',                     'state_statute', 'TN', 'https://www.lexisnexis.com/hottopics/tncode/', 'monthly', false, '{}'::jsonb),
  ('tx_statutes',    'Texas Statutes',                     'state_statute', 'TX', 'https://statutes.capitol.texas.gov/', 'monthly', true, '{}'::jsonb),
  ('ut_code',        'Utah Code',                          'state_statute', 'UT', 'https://le.utah.gov/xcode/code.html', 'monthly', false, '{}'::jsonb),
  ('vt_statutes',    'Vermont Statutes',                   'state_statute', 'VT', 'https://legislature.vermont.gov/statutes/', 'monthly', false, '{}'::jsonb),
  ('va_code',        'Code of Virginia',                   'state_statute', 'VA', 'https://law.lis.virginia.gov/vacode/', 'monthly', false, '{}'::jsonb),
  ('wa_revised_code','Revised Code of Washington',         'state_statute', 'WA', 'https://app.leg.wa.gov/rcw/', 'monthly', false, '{}'::jsonb),
  ('wv_code',        'West Virginia Code',                 'state_statute', 'WV', 'https://code.wvlegislature.gov/', 'monthly', false, '{}'::jsonb),
  ('wi_statutes',    'Wisconsin Statutes',                 'state_statute', 'WI', 'https://docs.legis.wisconsin.gov/statutes/', 'monthly', false, '{}'::jsonb),
  ('wy_statutes',    'Wyoming Statutes',                   'state_statute', 'WY', 'https://wyoleg.gov/', 'monthly', false, '{}'::jsonb)
ON CONFLICT (source_key) DO NOTHING;
