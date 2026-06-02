/*
  # Seed Partner Assets from Existing Hardcoded Data

  Transfers all 10 assets previously hardcoded in partnerAssetContent.ts
  into the partner_assets and asset_readiness tables with their exact
  current readiness states, metadata, and content sections.

  1. Assets Seeded
    - Partner Program One-Pager (pdf)
    - Technical Integration Guide (pdf)
    - Brand Guidelines for Partners (pdf)
    - Co-Branded Landing Page Template (html)
    - Widget Installation Guide (pdf)
    - Legal Aid Impact Report Template (docx)
    - Partner Pitch Deck (pptx)
    - Spanish Language Flyer (pdf)
    - Security & Compliance Whitepaper (pdf)
    - ezLegal Logo Pack (zip)

  2. Readiness States
    - Each asset seeded with its current EN/ES/Legal/Brand status
    - Version set to 1 for all
    - Blocked reasons computed from non-complete statuses
*/

-- Insert partner assets
INSERT INTO partner_assets (slug, name, asset_type, file_size, description, audience, content_sections, jurisdictions, owner_team, pipeline_stages, pinned, recommended, updated_at)
VALUES
  ('one-pager', 'Partner Program One-Pager', 'pdf', '2.4 MB',
   'Executive summary of the partner program for prospective partners and internal sales use.',
   'Business development, prospective partners, conference handouts',
   '[{"heading":"Page Header","content":["ezLegal.ai Partner Program","Bring AI-Powered Legal Information to Your Community","Tagline: Ethical AI for Access to Justice"]},{"heading":"The Opportunity","content":["80% of low-income Americans cannot afford legal representation.","ezLegal.ai bridges this gap with AI-powered legal information available 24/7 in English and Spanish.","Our partner program lets organizations deploy legal AI without any technical expertise.","Join 50+ organizations already serving their communities with ezLegal.ai."]},{"heading":"Key Platform Stats","content":["50+ Active Partner Organizations","10,000+ Users Served Monthly","99.9% Platform Uptime SLA","2 Languages: English & Spanish","50+ Legal Topics Covered","SOC 2 Type II Infrastructure (via Supabase)"]},{"heading":"Partnership Tiers","content":["Legal Aid (Free) -- For 501(c)(3) legal aid organizations. Unlimited widget, bilingual support, impact reports, pro bono intake integration.","Pro ($79/mo) -- For community organizations and small firms. 500 conversations/mo, lead capture, analytics dashboard, custom branding.","Developer ($0.02/query) -- For legal tech builders. Full REST API, sandbox environment, webhooks, SDKs for JS/Python/Ruby.","Enterprise (Custom) -- For large organizations. White-label deployment, custom domain, SSO/SAML, dedicated infrastructure, SLA guarantees."]},{"heading":"How It Works","content":["1. Apply -- Submit your partnership application online or contact partners@ezlegal.ai.","2. Discovery Call -- Our team schedules a 30-minute call to understand your needs.","3. Pilot (30 Days) -- Deploy ezLegal.ai with full support during a free trial period.","4. Onboarding -- Dedicated specialist helps configure branding, integrations, and training.","5. Go Live -- Launch to your audience with ongoing analytics and support."]},{"heading":"Why Partners Choose ezLegal.ai","content":["No Technical Expertise Required -- Widget installs in 5 minutes via copy-paste.","Bilingual by Default -- Spanish and English built in, not bolted on.","Enterprise Security -- SOC 2 Type II infrastructure, AES-256 encryption, US-based hosting.","Grant-Ready Reporting -- Monthly impact dashboards designed for funder reporting.","Ethical AI Commitment -- Zero training on client data. Human attorney oversight built in."]},{"heading":"Call to Action","content":["Ready to bring legal AI to your community?","Apply: ezlegal.ai/partners","Schedule Demo: ezlegal.ai/schedule-demo","Email: partners@ezlegal.ai","Phone: Available upon request"]},{"heading":"Footer","content":["ezLegal.ai -- Ethical AI for Access to Justice","ezLegal.ai provides legal information, not legal advice. Not a law firm. Not a substitute for an attorney.","Copyright 2026 ezLegal.ai. All rights reserved."]}]'::jsonb,
   ARRAY['AZ', 'US-Federal'], 'Marketing', ARRAY['Reviewing', 'Proposal'], true, true, '2026-02-08'::timestamptz),

  ('tech-guide', 'Technical Integration Guide', 'pdf', '5.1 MB',
   'Comprehensive technical documentation for developers integrating ezLegal.ai via API or widget.',
   'Developers, CTOs, technical partners, engineering teams',
   '[{"heading":"Introduction","content":["This guide covers all integration methods for ezLegal.ai: widget embedding, REST API, and white-label deployment.","All integrations use HTTPS with TLS 1.3. API keys are provided upon partnership activation.","Sandbox environment available for testing before production deployment."]},{"heading":"Widget Integration (Fastest)","content":["Installation: Add a single script tag to your HTML. Widget appears as a floating chat button.","Script Tag: <script src=\"https://widget.ezlegal.ai/v1/embed.js\" data-partner-id=\"YOUR_ID\" data-theme=\"light\" data-position=\"bottom-right\" async></script>","Configuration Options: theme (light/dark), position (bottom-right/bottom-left), primaryColor (hex), language (en/es/auto), showBranding (true/false for enterprise)","Events: onLoad, onOpen, onClose, onMessage, onLeadCapture -- all available via JavaScript callbacks.","Responsive Design: Widget automatically adapts to mobile, tablet, and desktop viewports."]},{"heading":"REST API Reference","content":["Base URL: https://api.ezlegal.ai/v1","Authentication: Bearer token in Authorization header. Tokens issued per partner.","Rate Limits: Pro (100 req/min), Developer (500 req/min), Enterprise (custom).","POST /chat/completions -- Send a legal question, receive AI response with citations.","GET /documents/{id} -- Retrieve generated documents or user uploads.","POST /documents/generate -- Generate legal documents from templates and parameters.","GET /jurisdictions -- List supported jurisdictions and practice areas.","POST /webhooks -- Register endpoints for real-time event notifications.","GET /analytics/usage -- Query usage metrics, conversation counts, and response times."]},{"heading":"API Request Example","content":["curl -X POST https://api.ezlegal.ai/v1/chat/completions \\\\","  -H \"Authorization: Bearer YOUR_API_KEY\" \\\\","  -H \"Content-Type: application/json\" \\\\","  -d \u0027{\"question\": \"What are tenant rights for security deposit return in Arizona?\", \"jurisdiction\": \"AZ\", \"include_citations\": true, \"language\": \"en\"}\u0027","","Response includes: answer (string), citations (array of statute references), confidence_score (0-1), jurisdiction_note (string), disclaimer (string)."]},{"heading":"Authentication & Security","content":["API keys are scoped per environment (sandbox vs production).","All requests must include Authorization: Bearer <token> header.","IP allowlisting available for Enterprise partners.","Webhook signatures verified via HMAC-SHA256 for payload integrity.","API keys can be rotated without downtime via the partner dashboard."]},{"heading":"Error Handling","content":["400 Bad Request -- Missing or invalid parameters. Check request body format.","401 Unauthorized -- Invalid or expired API key. Rotate key in partner dashboard.","403 Forbidden -- IP not allowlisted or scope exceeded.","429 Too Many Requests -- Rate limit exceeded. Retry after Retry-After header value.","500 Internal Server Error -- Platform issue. Contact support with request ID from response header.","All errors return JSON: {\"error\": {\"code\": \"string\", \"message\": \"string\", \"request_id\": \"string\"}}"]},{"heading":"Webhook Events","content":["conversation.started -- Fired when a user begins a new chat session.","conversation.completed -- Fired when a conversation reaches natural conclusion.","lead.captured -- Fired when a user submits their email or contact info.","document.generated -- Fired when a legal document is created.","crisis.detected -- Fired when the system detects a potential safety concern.","All events include timestamp, partner_id, event_type, and event-specific payload."]},{"heading":"White-Label Configuration","content":["Custom domain: Point your CNAME to partners.ezlegal.ai. SSL provisioned automatically.","Branding: Upload logo, set primary/secondary colors, custom favicon, and email templates.","SSO/SAML: Configure via partner dashboard. Supports Okta, Azure AD, Google Workspace.","Custom AI Behavior: Adjust response tone, jurisdiction defaults, and practice area scope.","Data Residency: US-based by default. Contact enterprise team for specific requirements."]},{"heading":"SDKs & Libraries","content":["JavaScript/TypeScript: npm install @ezlegal/sdk","Python: pip install ezlegal","Ruby: gem install ezlegal","All SDKs include TypeScript definitions, auto-retry logic, and streaming support.","Open-source on GitHub: github.com/ezlegal-ai/sdks"]},{"heading":"Support & Troubleshooting","content":["Sandbox Console: test.ezlegal.ai/console -- Live request inspector and response viewer.","Status Page: status.ezlegal.ai -- Real-time platform health and incident updates.","Developer Slack: Join via partner dashboard for peer support and announcements.","Email Support: dev-support@ezlegal.ai (Pro: 48hr SLA, Enterprise: 4hr SLA)."]}]'::jsonb,
   ARRAY['AZ', 'US-Federal'], 'Engineering', ARRAY['Proposal', 'Activation'], false, true, '2026-02-05'::timestamptz),

  ('brand-guidelines', 'Brand Guidelines for Partners', 'pdf', '3.8 MB',
   'Visual identity standards and co-branding rules for partner marketing materials.',
   'Marketing teams, designers, partner communications staff',
   '[]'::jsonb,
   ARRAY[]::text[], 'Design', ARRAY['Activation'], false, false, '2026-01-28'::timestamptz),

  ('landing-template', 'Co-Branded Landing Page Template', 'html', '156 KB',
   'HTML template for partner co-branded landing pages with configurable content blocks.',
   'Partners creating co-branded pages, marketing teams, web developers',
   '[]'::jsonb,
   ARRAY['AZ'], 'Engineering', ARRAY['Activation'], true, true, '2026-02-03'::timestamptz),

  ('widget-guide', 'Widget Installation Guide', 'pdf', '1.2 MB',
   'Step-by-step instructions for installing and configuring the ezLegal.ai chat widget.',
   'Website administrators, IT staff, non-technical partner staff',
   '[]'::jsonb,
   ARRAY[]::text[], 'Engineering', ARRAY['Activation'], false, true, '2026-02-10'::timestamptz),

  ('impact-template', 'Legal Aid Impact Report Template', 'docx', '890 KB',
   'Template for Legal Aid partners to generate impact reports for funders and stakeholders.',
   'Legal Aid program managers, grant administrators, development officers',
   '[]'::jsonb,
   ARRAY['AZ'], 'Partnerships', ARRAY['Activation', 'Renewal'], false, false, '2026-01-22'::timestamptz),

  ('pitch-deck', 'Partner Pitch Deck', 'pptx', '8.3 MB',
   'Presentation deck for pitching the ezLegal.ai partner program to prospective organizations.',
   'Business development team, partner prospects, conference presentations',
   '[]'::jsonb,
   ARRAY['AZ', 'US-Federal'], 'Marketing', ARRAY['Reviewing', 'Proposal'], true, true, '2026-02-06'::timestamptz),

  ('spanish-flyer', 'Spanish Language Flyer', 'pdf', '1.8 MB',
   'Full Spanish-language marketing flyer for community outreach to Latino-serving organizations.',
   'Latino-serving organizations, community health centers, churches, consulates',
   '[]'::jsonb,
   ARRAY['AZ', 'US-Federal'], 'Marketing', ARRAY['Reviewing', 'Activation'], false, true, '2026-02-09'::timestamptz),

  ('security-whitepaper', 'Security & Compliance Whitepaper', 'pdf', '4.2 MB',
   'Detailed security architecture, compliance certifications, and data handling practices for due diligence.',
   'IT security teams, compliance officers, procurement departments, enterprise partners',
   '[]'::jsonb,
   ARRAY['US-Federal'], 'Security', ARRAY['Proposal', 'Due Diligence'], false, false, '2026-02-01'::timestamptz),

  ('logo-pack', 'ezLegal Logo Pack', 'zip', '12.5 MB',
   'Complete logo package with all approved variants, file formats, and usage examples.',
   'Designers, marketing teams, partner web developers',
   '[]'::jsonb,
   ARRAY[]::text[], 'Design', ARRAY['Activation'], false, false, '2026-01-15'::timestamptz)
ON CONFLICT (slug) DO NOTHING;

-- Insert corresponding readiness records
INSERT INTO asset_readiness (asset_id, english_status, spanish_status, legal_review_status, brand_approval_status, version, blocked_reasons)
SELECT pa.id,
  CASE pa.slug
    WHEN 'one-pager' THEN 'complete'
    WHEN 'tech-guide' THEN 'complete'
    WHEN 'brand-guidelines' THEN 'complete'
    WHEN 'landing-template' THEN 'complete'
    WHEN 'widget-guide' THEN 'complete'
    WHEN 'impact-template' THEN 'complete'
    WHEN 'pitch-deck' THEN 'complete'
    WHEN 'spanish-flyer' THEN 'not_applicable'
    WHEN 'security-whitepaper' THEN 'complete'
    WHEN 'logo-pack' THEN 'complete'
  END,
  CASE pa.slug
    WHEN 'one-pager' THEN 'in_review'
    WHEN 'tech-guide' THEN 'draft'
    WHEN 'brand-guidelines' THEN 'not_applicable'
    WHEN 'landing-template' THEN 'complete'
    WHEN 'widget-guide' THEN 'complete'
    WHEN 'impact-template' THEN 'draft'
    WHEN 'pitch-deck' THEN 'in_review'
    WHEN 'spanish-flyer' THEN 'complete'
    WHEN 'security-whitepaper' THEN 'draft'
    WHEN 'logo-pack' THEN 'not_applicable'
  END,
  CASE pa.slug
    WHEN 'one-pager' THEN 'complete'
    WHEN 'tech-guide' THEN 'complete'
    WHEN 'brand-guidelines' THEN 'complete'
    WHEN 'landing-template' THEN 'complete'
    WHEN 'widget-guide' THEN 'not_applicable'
    WHEN 'impact-template' THEN 'not_applicable'
    WHEN 'pitch-deck' THEN 'complete'
    WHEN 'spanish-flyer' THEN 'complete'
    WHEN 'security-whitepaper' THEN 'in_review'
    WHEN 'logo-pack' THEN 'not_applicable'
  END,
  CASE pa.slug
    WHEN 'one-pager' THEN 'complete'
    WHEN 'tech-guide' THEN 'complete'
    WHEN 'brand-guidelines' THEN 'complete'
    WHEN 'landing-template' THEN 'in_review'
    WHEN 'widget-guide' THEN 'complete'
    WHEN 'impact-template' THEN 'complete'
    WHEN 'pitch-deck' THEN 'complete'
    WHEN 'spanish-flyer' THEN 'complete'
    WHEN 'security-whitepaper' THEN 'complete'
    WHEN 'logo-pack' THEN 'complete'
  END,
  1,
  CASE pa.slug
    WHEN 'one-pager' THEN ARRAY['Spanish translation in review']
    WHEN 'tech-guide' THEN ARRAY['Spanish translation in draft']
    WHEN 'brand-guidelines' THEN ARRAY[]::text[]
    WHEN 'landing-template' THEN ARRAY['Brand approval in review']
    WHEN 'widget-guide' THEN ARRAY[]::text[]
    WHEN 'impact-template' THEN ARRAY['Spanish translation in draft']
    WHEN 'pitch-deck' THEN ARRAY['Spanish translation in review']
    WHEN 'spanish-flyer' THEN ARRAY[]::text[]
    WHEN 'security-whitepaper' THEN ARRAY['Spanish translation in draft', 'Legal review in progress']
    WHEN 'logo-pack' THEN ARRAY[]::text[]
  END
FROM partner_assets pa
WHERE pa.slug IN ('one-pager', 'tech-guide', 'brand-guidelines', 'landing-template', 'widget-guide', 'impact-template', 'pitch-deck', 'spanish-flyer', 'security-whitepaper', 'logo-pack')
ON CONFLICT (asset_id) DO NOTHING;
