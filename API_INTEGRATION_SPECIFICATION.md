# ezLegal.ai API Integration & White-Label Specification

## Executive Summary

This document outlines the integration and deployment strategies for ezLegal.ai across different customer segments:

1. **Consumer Direct**: Individual users on `ezlegal.ai`
2. **SMB/Business**: Dashboard access via subdomain or direct platform
3. **Enterprise/LSO**: Custom domains, API access, and full white-label capabilities

**Key Principle**: API integration and custom domains are **Enterprise-tier features** reserved for national brands, large organizations, and Legal Services Organizations (LSOs). Standard SMB tiers receive dashboard access only - no API required for local businesses like dry cleaners, startups, or mom-and-pop shops.

---

## Deployment Architecture Hierarchy

```
LegalBreeze.com (Technology Provider)
└── ezLegal.ai (White-label Deployment)
    ├── Consumer Direct
    │   └── ezlegal.ai (Full platform access)
    │
    ├── SMB Subdomains
    │   └── firmname.ezlegal.ai (Dashboard access)
    │
    └── Enterprise White-Label
        ├── Custom Domain: portal.clientcompany.com
        ├── Full White-Label: No ezLegal branding visible
        └── API Access: Integration with existing systems
```

---

## Pricing Tier Capabilities

| Tier | Target | URL Structure | API Access | Custom Domain |
|------|--------|---------------|------------|---------------|
| **Individual** | Consumers | ezlegal.ai | No | No |
| **Business Starter** | Startups, mom & pop | firmname.ezlegal.ai | No | No |
| **Business Pro** | Growing businesses | firmname.ezlegal.ai | No | No |
| **Enterprise** | National brands | portal.yourcompany.com | Yes | Yes |
| **LSO Starter** | Small legal aid orgs | org.ezlegal.ai | No | No |
| **LSO Professional** | Established LSOs | org.ezlegal.ai | No | No |
| **LSO Enterprise** | Statewide programs | portal.yourorg.org | Yes | Yes |

### Why SMBs Don't Need API Access

A local dry cleaning business asking "Can I fire this employee?" doesn't need:
- Webhook integrations
- RESTful API endpoints
- Custom domain mapping
- SSO/SAML authentication

They need:
- A simple dashboard to ask legal questions
- Document templates for their business
- Easy-to-understand guidance

API integration adds complexity and cost that provides no value for most SMBs.

---

## Current State: LegalBreeze Subdomain Strategy

### How It Works (Moore Law Firm Example)

```
moorelawfirmac.legalbreeze.com
├── Full Practice Management Platform
│   ├── Client Messaging System
│   ├── Appointment Scheduling
│   ├── Invoice Management
│   ├── Document Storage
│   └── Case History Tracking
├── White-Label Branding
│   └── Custom Logo + Colors
└── Embedded ezLegal AI Widget
    └── AI Chat Assistant (bottom-right)
```

### Advantages of Subdomain Strategy

| Benefit | Description |
|---------|-------------|
| Zero Technical Burden | Law firms need no development resources |
| Complete Solution | Full practice management, not just AI features |
| Consistent UX | LegalBreeze controls quality and updates |
| Fast Onboarding | 24-48 hour setup vs. weeks for API integration |
| Lower TCO | No infrastructure maintenance for the firm |
| Built-in Compliance | SOC 2, data handling, backups included |

### Limitations of Subdomain Strategy

| Limitation | Impact |
|------------|--------|
| Brand Dilution | URL shows `legalbreeze.com`, not firm's domain |
| Limited Customization | Confined to theme colors and logo |
| All-or-Nothing | Must use entire platform, not selective features |
| Data Portability | Client data lives on LegalBreeze infrastructure |
| Vendor Lock-in | Harder to migrate if relationship ends |
| No Existing System Integration | Can't embed AI into firm's existing CRM/website |

---

## Proposed: API Integration Strategy

### Target Market Segments

```
Tier 1: Technical SMBs
├── Law firms with in-house IT or contracted developers
├── Legal tech startups building on ezLegal capabilities
└── Multi-practice firms with existing infrastructure

Tier 2: Hybrid Users
├── Firms wanting AI chat on their own website
├── Organizations needing specific features (predictions, document analysis)
└── Partners building legal aid portals

Tier 3: Enterprise
├── Insurance companies integrating legal guidance
├── HR platforms adding employment law assistance
└── Real estate platforms embedding contract review
```

### API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ezLegal.ai API Gateway                    │
│                  api.ezlegal.ai/v1/                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   AI Chat    │  │  Document    │  │   Outcome    │     │
│  │   Service    │  │  Analysis    │  │  Prediction  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Case       │  │  Compliance  │  │   Widget     │     │
│  │   Matching   │  │   Reports    │  │   Embed      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  SMB Website    │  │  SMB CRM/CMS    │  │  Mobile App     │
│  (Custom Chat)  │  │  (Salesforce)   │  │  (React Native) │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## API Specification v1.0

### Authentication

```http
POST /v1/auth/token
Content-Type: application/json

{
  "client_id": "smb_xxxxxxxxx",
  "client_secret": "sk_live_xxxxxxxxxxxxxxxx",
  "grant_type": "client_credentials"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "chat:read chat:write documents:analyze predictions:read"
}
```

### Core Endpoints

#### 1. AI Chat (Primary Value)

```http
POST /v1/chat/completions
Authorization: Bearer {token}
X-Tenant-ID: {smb_id}
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "What are my options if my landlord won't return my security deposit in Arizona?"
    }
  ],
  "jurisdiction": "AZ",
  "practice_area": "housing",
  "include_citations": true,
  "include_compliance": true,
  "session_id": "sess_abc123",
  "user_context": {
    "is_authenticated": true,
    "subscription_tier": "professional"
  }
}
```

Response:
```json
{
  "id": "chat_xxxxx",
  "object": "chat.completion",
  "created": 1705000000,
  "model": "ezlegal-rag-v2",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Under Arizona law (A.R.S. § 33-1321), landlords must return security deposits within 14 business days...",
        "citations": [
          {
            "source": "A.R.S. § 33-1321",
            "title": "Security deposits",
            "authority_type": "statute",
            "jurisdiction": "AZ",
            "url": "https://www.azleg.gov/ars/33/01321.htm",
            "excerpt": "Within fourteen business days after termination...",
            "recency": "current"
          }
        ]
      },
      "finish_reason": "stop"
    }
  ],
  "compliance": {
    "jurisdiction_validated": true,
    "citations_verified": true,
    "bias_screened": true,
    "enforcement_score": 92,
    "audit_trail_id": "audit_xxxxx",
    "provenance_hash": "sha256:abcd1234..."
  },
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 312,
    "total_tokens": 357
  }
}
```

#### 2. Document Analysis

```http
POST /v1/documents/analyze
Authorization: Bearer {token}
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="lease.pdf"
Content-Type: application/pdf

{binary content}
--boundary
Content-Disposition: form-data; name="analysis_type"

["enforceability", "risk_assessment", "summary"]
--boundary
Content-Disposition: form-data; name="jurisdiction"

AZ
--boundary--
```

Response:
```json
{
  "id": "doc_xxxxx",
  "filename": "lease.pdf",
  "pages": 12,
  "analysis": {
    "summary": "Standard Arizona residential lease with non-standard early termination clause...",
    "enforceability_score": 78,
    "enforceability_issues": [
      {
        "clause": "Section 12.3 - Waiver of Jury Trial",
        "severity": "high",
        "issue": "Jury trial waiver provisions are unenforceable in Arizona residential leases",
        "citation": "A.R.S. § 33-1315"
      }
    ],
    "risks": [
      {
        "severity": "medium",
        "description": "Late fee of $150 exceeds typical Arizona court enforcement thresholds",
        "clause": "Section 4.2",
        "recommendation": "Negotiate reduction to $50-75 or percentage-based fee"
      }
    ],
    "extracted_terms": {
      "monthly_rent": 1850,
      "security_deposit": 1850,
      "lease_start": "2024-02-01",
      "lease_end": "2025-01-31",
      "late_fee": 150,
      "notice_period_days": 30
    }
  },
  "processing_time_ms": 3420
}
```

#### 3. Outcome Prediction

```http
POST /v1/predictions/case-outcome
Authorization: Bearer {token}
Content-Type: application/json

{
  "case_type": "eviction_defense",
  "jurisdiction": "AZ",
  "factors": {
    "has_documentation": true,
    "documentation_quality": "complete",
    "has_opposing_counsel": true,
    "attorney_specialty_match": true,
    "case_complexity": "medium",
    "urgency_level": "high",
    "income_eligible": true
  }
}
```

Response:
```json
{
  "prediction": {
    "outcome": "favorable",
    "confidence": "high",
    "probability_score": 0.73,
    "factors": [
      {
        "factor": "Complete Documentation",
        "impact": "positive",
        "weight": 0.25,
        "description": "Strong evidence package significantly improves outcomes"
      },
      {
        "factor": "Opposing Counsel Present",
        "impact": "negative",
        "weight": 0.15,
        "description": "Professional representation on opposing side reduces advantage"
      }
    ],
    "recommendations": [
      "Prioritize discovery requests within first 10 days",
      "Consider mediation given documentation strength",
      "Review A.R.S. § 33-1377 for additional defenses"
    ]
  },
  "model": {
    "version": "outcome-v2.3",
    "accuracy": 0.84,
    "case_type_accuracy": 0.87
  }
}
```

#### 4. Embeddable Chat Widget

```http
GET /v1/widgets/chat/embed-code
Authorization: Bearer {token}

Query Parameters:
- theme: "light" | "dark" | "auto"
- position: "bottom-right" | "bottom-left" | "inline"
- primary_color: "#2563EB"
- welcome_message: "How can I help with your legal question?"
- practice_areas: "housing,employment,family"
- jurisdiction: "AZ"
```

Response:
```json
{
  "embed_code": "<script src=\"https://cdn.ezlegal.ai/widget/v1/chat.min.js\" data-token=\"wgt_xxxxx\" data-config=\"eyJjb2xvciI6IiMyNTYzRUIifQ==\"></script>",
  "widget_id": "wgt_xxxxx",
  "cdn_url": "https://cdn.ezlegal.ai/widget/v1/chat.min.js",
  "configuration": {
    "theme": "light",
    "position": "bottom-right",
    "primary_color": "#2563EB",
    "branding": {
      "powered_by": true,
      "firm_name": "Moore Law Firm",
      "firm_logo": "https://..."
    }
  }
}
```

---

## Enterprise API & White-Label Pricing

API access and custom domains are available only in Enterprise tiers (Business Enterprise and LSO Enterprise).

### Business Pricing

| Tier | Monthly | Features |
|------|---------|----------|
| **Business Starter** | $99 | 5 team members, dashboard access, email support |
| **Business Pro** | $249 | 15 team members, priority support, multi-state guidance |
| **Enterprise** | Custom | Unlimited users, API access, custom domain, white-label, SSO |

### LSO/Non-Profit Pricing

| Tier | Monthly | Features |
|------|---------|----------|
| **LSO Starter** | $199 | 10 staff, pro bono tracking, basic grant reporting |
| **LSO Professional** | $499 | 50 staff, advanced analytics, multi-jurisdiction |
| **LSO Enterprise** | Custom | Unlimited staff, API access, custom domain, funder dashboards |

### Enterprise Add-on Modules

| Module | Monthly | Description |
|--------|---------|-------------|
| Additional API Calls | +$0.05/call | Beyond base allocation |
| Document Analysis API | +$149 | PDF/DOCX analysis with enforceability scoring |
| Outcome Prediction API | +$99 | AI case outcome predictions |
| Dedicated Support | +$299 | Slack channel + 4-hour SLA |
| Custom Jurisdiction | +$499 | Additional state law coverage |
| SSO/SAML Integration | Included | Enterprise tier only |
| Funder Dashboard | Included | LSO Enterprise only |

---

## Custom Domain Implementation

### How Custom Domains Work

Custom domains allow Enterprise clients to fully white-label the platform so their end users never see "ezlegal.ai" in the URL.

**Example: Chick-fil-A Enterprise Deployment**

```
Without Custom Domain:
  URL: chickfila.ezlegal.ai/dashboard
  User sees: ezLegal.ai branding in URL

With Custom Domain:
  URL: legal.chickfila.com/dashboard
  User sees: Only Chick-fil-A branding
```

### Technical Implementation

1. **DNS Configuration** (Client's IT team):
   ```
   Type: CNAME
   Name: legal (or portal, help, etc.)
   Value: custom.ezlegal.ai
   ```

2. **SSL Certificate**: Auto-provisioned via Let's Encrypt

3. **Tenant Recognition**: ezLegal server identifies tenant by incoming domain

4. **Full White-Label Options**:
   - Custom logo and favicon
   - Custom color scheme
   - Custom email sender domain
   - No "Powered by" attribution

### Trust & UX Benefits

| Aspect | Without Custom Domain | With Custom Domain |
|--------|----------------------|-------------------|
| URL Visibility | `client.ezlegal.ai` | `portal.client.com` |
| End-User Trust | May cause confusion | Seamless brand experience |
| Professional Appearance | Good | Excellent |
| Data Perception | "Third-party platform" | "Our legal portal" |

---

## Comparative Analysis

### When to Use Subdomain Strategy

| Scenario | Recommendation |
|----------|----------------|
| Non-technical law firm | Subdomain |
| Need full practice management | Subdomain |
| Fast deployment required (<1 week) | Subdomain |
| No existing digital infrastructure | Subdomain |
| Budget under $300/month | Subdomain |
| Single-location practice | Subdomain |

### When to Use API Integration

| Scenario | Recommendation |
|----------|----------------|
| Existing website/CRM to enhance | API |
| Multiple practice locations with unified branding | API |
| Building legal tech product | API |
| Enterprise with compliance requirements | API |
| Need granular usage analytics | API |
| Selective feature adoption | API |
| Custom UI/UX requirements | API |

### Feature Comparison Matrix

| Feature | Subdomain | API + Widget | API Only |
|---------|-----------|--------------|----------|
| Setup Time | 24-48 hrs | 1-2 weeks | 2-4 weeks |
| Technical Skill Required | None | Basic HTML | Developer |
| Full Practice Management | Yes | No | No |
| Custom Domain | No | Yes | Yes |
| Selective Features | No | Yes | Yes |
| UI Customization | Limited | Moderate | Full |
| Data Ownership | Shared | Customer | Customer |
| Offline Access | No | Possible | Possible |
| Mobile App Integration | No | Yes | Yes |
| Third-party CRM Integration | Limited | Yes | Yes |
| Analytics Granularity | Basic | Detailed | Full |

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Deploy API Gateway infrastructure
- [ ] Implement OAuth 2.0 authentication
- [ ] Create rate limiting and usage tracking
- [ ] Build developer portal with documentation

### Phase 2: Core APIs (Weeks 5-8)
- [ ] Chat completions endpoint with RAG pipeline
- [ ] Document analysis endpoint
- [ ] Outcome prediction endpoint
- [ ] Webhook system for async operations

### Phase 3: Widget System (Weeks 9-12)
- [ ] Embeddable chat widget (JS SDK)
- [ ] Widget configuration API
- [ ] Theme customization engine
- [ ] Analytics dashboard for widget usage

### Phase 4: Developer Experience (Weeks 13-16)
- [ ] API documentation site (Swagger/OpenAPI)
- [ ] SDKs for JavaScript, Python, PHP
- [ ] Sandbox environment
- [ ] Integration templates for common CRMs

---

## Security & Compliance

### API Security Requirements

```yaml
Authentication:
  - OAuth 2.0 with JWT tokens
  - API key rotation every 90 days
  - IP allowlisting option for Enterprise

Encryption:
  - TLS 1.3 for all API traffic
  - AES-256 encryption at rest
  - Field-level encryption for PII

Rate Limiting:
  - Per-tenant request quotas
  - Burst allowance: 2x monthly allocation
  - DDoS protection via Cloudflare

Compliance:
  - SOC 2 Type II certified
  - CCPA compliant data handling
  - ABA Model Rule 1.6 considerations
  - Audit logs retained 7 years
```

### Data Handling

| Data Type | Retention | Access | Encryption |
|-----------|-----------|--------|------------|
| Chat Messages | 90 days | Tenant only | AES-256 |
| Documents | 30 days | Tenant only | AES-256 |
| Predictions | 1 year | Tenant only | AES-256 |
| Audit Logs | 7 years | Compliance team | AES-256 |
| Usage Metrics | Indefinite | Aggregated | N/A |

---

## Conclusion & Recommendation

### Tiered Strategy (Recommended)

Segment customers by needs, not by technical capability:

**1. Consumers & Individuals** - Direct platform access
- Simple pricing ($0-49/month)
- No technical setup required
- Full ezLegal.ai branding

**2. SMBs (Startups, Mom & Pop, Local Businesses)** - Dashboard access
- Team collaboration features ($99-249/month)
- Subdomain: `business.ezlegal.ai`
- No API needed - they want answers, not integrations

**3. Enterprise (National Brands, Large Organizations)** - Full white-label
- Custom domain: `legal.company.com`
- API access for system integration
- SSO, compliance, dedicated support
- Custom pricing based on scale

**4. LSO/Non-Profit (Legal Aid Organizations)** - Mission-focused features
- Grant reporting, demographics tracking
- Enterprise tier includes API and custom domains
- Funder dashboard access

### Why This Works

| Customer Type | What They Need | What They Don't Need |
|---------------|----------------|---------------------|
| Dry Cleaner | "Can I fire this employee?" | API webhooks |
| Startup | HR compliance guidance | White-label branding |
| Chick-fil-A | Franchise-wide legal portal | External branding |
| Legal Aid Org | Case tracking, grant reports | N/A - they need everything |

### Expected Revenue Model

| Segment | Est. Clients | Avg. Revenue | Annual Total |
|---------|--------------|--------------|--------------|
| Individual | 5,000 | $228/yr | $1.14M |
| SMB | 200 | $1,788/yr | $358K |
| Enterprise | 25 | $24,000/yr | $600K |
| LSO | 50 | $4,788/yr | $239K |
| **Total** | **5,275** | **Mixed** | **$2.34M** |

This tiered approach:
- Serves each segment with exactly what they need
- Reserves complex features (API, custom domains) for clients who actually use them
- Maximizes revenue by matching price to value delivered

---

## Appendix: Database Schema for API Access

```sql
-- API client credentials
CREATE TABLE api_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  client_id text UNIQUE NOT NULL,
  client_secret_hash text NOT NULL,
  name text NOT NULL,
  scopes text[] DEFAULT '{}',
  rate_limit_tier text DEFAULT 'starter',
  monthly_quota integer DEFAULT 1000,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

-- API usage tracking
CREATE TABLE api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES api_clients(id),
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  tokens_used integer DEFAULT 0,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Widget configurations
CREATE TABLE widget_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES api_clients(id),
  widget_token text UNIQUE NOT NULL,
  config jsonb DEFAULT '{}',
  allowed_domains text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```
