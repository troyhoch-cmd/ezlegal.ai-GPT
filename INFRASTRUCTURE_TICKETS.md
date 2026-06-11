# Infrastructure Implementation Tickets

## Overview

This document contains detailed implementation tickets for infrastructure-level features that require configuration outside of application code. Each ticket follows a standard format with acceptance criteria, technical requirements, and verification steps.

---

## TICKET-001: SAML 2.0 Single Sign-On

### Summary
Enable SAML 2.0 SSO to allow enterprise clients to authenticate users through their corporate identity providers (Okta, Azure AD, OneLogin, etc.).

### Priority
**P1 - High** (Blocks enterprise sales)

### Assignee
DevOps Engineer + Supabase Account Admin

### Estimated Effort
2-3 days

### Prerequisites
- [ ] Supabase Pro or Enterprise plan activated
- [ ] Access to Supabase Dashboard with admin privileges
- [ ] Test IdP environment (Okta dev tenant or Azure AD test directory)

### Technical Requirements

#### 1. Supabase Configuration
```
Project Settings Location: Authentication > Providers > SAML 2.0

Required Values:
- Entity ID: https://[PROJECT_REF].supabase.co/auth/v1/sso/saml/metadata
- ACS URL: https://[PROJECT_REF].supabase.co/auth/v1/sso/saml/acs
- SLO URL: https://[PROJECT_REF].supabase.co/auth/v1/sso/saml/slo (optional)
```

#### 2. Identity Provider Setup (per customer)

**For Okta:**
1. Admin Console > Applications > Create App Integration
2. Select "SAML 2.0"
3. Configure:
   - Single sign-on URL: `[ACS URL from above]`
   - Audience URI (SP Entity ID): `[Entity ID from above]`
   - Name ID format: `EmailAddress`
   - Application username: `Email`
4. Attribute Statements:
   | Name | Value |
   |------|-------|
   | email | user.email |
   | first_name | user.firstName |
   | last_name | user.lastName |
5. Download IdP metadata XML

**For Azure AD:**
1. Azure Portal > Enterprise Applications > New Application
2. Create your own application (Non-gallery)
3. Single sign-on > SAML
4. Basic SAML Configuration:
   - Identifier (Entity ID): `[Entity ID from above]`
   - Reply URL (ACS URL): `[ACS URL from above]`
5. Attributes & Claims:
   - Required claim: `emailaddress` -> `user.mail`
   - Additional: `givenname` -> `user.givenname`
   - Additional: `surname` -> `user.surname`
6. Download Federation Metadata XML

**For OneLogin:**
1. Applications > Add App > SAML Custom Connector
2. Configuration:
   - Audience: `[Entity ID]`
   - Recipient: `[ACS URL]`
   - ACS URL: `[ACS URL]`
   - ACS URL Validator: `^https:\/\/[PROJECT_REF]\.supabase\.co\/.*$`
3. Parameters: Map email, firstName, lastName
4. Download SAML Metadata

#### 3. Upload IdP Metadata to Supabase
```bash
# Via Supabase CLI (if available)
supabase sso add --type saml \
  --metadata-file ./idp-metadata.xml \
  --domains "clientdomain.com"

# Or via Dashboard:
# Authentication > SSO > Add Identity Provider > Upload XML
```

#### 4. Domain Verification
- Add DNS TXT record to verify domain ownership
- Record: `_supabase-sso.clientdomain.com`
- Value: Provided by Supabase during setup

### Application Code Changes

```typescript
// src/lib/supabase.ts - Add SSO sign-in method
export async function signInWithSSO(domain: string) {
  const { data, error } = await supabase.auth.signInWithSSO({
    domain: domain,
  });

  if (error) throw error;

  // Redirect to IdP
  if (data?.url) {
    window.location.href = data.url;
  }
}

// src/pages/Login.tsx - Add SSO button for enterprise users
// Check if user's email domain has SSO configured
const checkSSODomain = async (email: string) => {
  const domain = email.split('@')[1];
  // Query configured SSO domains from your config
  return ssoEnabledDomains.includes(domain);
};
```

### Database Changes
```sql
-- Track SSO-enabled organizations
CREATE TABLE IF NOT EXISTS sso_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  provider_type text NOT NULL CHECK (provider_type IN ('okta', 'azure_ad', 'onelogin', 'other')),
  domain text NOT NULL UNIQUE,
  metadata_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sso_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage SSO configs"
  ON sso_configurations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### Testing Checklist
- [ ] IdP-initiated login works (start from IdP portal)
- [ ] SP-initiated login works (start from EZLegal login page)
- [ ] User attributes correctly mapped to profile
- [ ] New SSO users get correct default role
- [ ] Existing users can link SSO identity
- [ ] Logout properly terminates both sessions
- [ ] Error handling for failed authentication

### Acceptance Criteria
1. Enterprise users can authenticate via their corporate IdP
2. User profile auto-populated from SAML attributes
3. Session management integrated with existing auth flow
4. Admin can view/manage SSO configurations
5. Documentation provided for customer IT teams

### Rollback Plan
1. Disable SAML provider in Supabase Dashboard
2. Re-enable email/password authentication for affected users
3. Notify affected users of temporary authentication change

---

## TICKET-002: LDAP/Active Directory Integration

### Summary
Enable authentication against on-premises Active Directory/LDAP servers for organizations that cannot use cloud-based identity providers.

### Priority
**P1 - High** (Required for government/regulated industry clients)

### Assignee
Identity Engineer + DevOps

### Estimated Effort
5-7 days

### Prerequisites
- [ ] Customer has provided LDAP connection details
- [ ] Network connectivity established (VPN/private link)
- [ ] Service account credentials for LDAP bind
- [ ] SSL certificates for LDAPS

### Architecture Options

#### Option A: Azure AD Connect (Recommended for AD environments)
```
[On-Prem AD] <--sync--> [Azure AD] <--SAML--> [Supabase Auth]

Pros: Microsoft-supported, automatic sync, no custom code
Cons: Requires Azure AD license, depends on Microsoft
```

#### Option B: Keycloak as Identity Broker
```
[On-Prem LDAP] <--LDAP--> [Keycloak] <--OIDC--> [Supabase Auth]

Pros: Open source, full control, supports any LDAP
Cons: Self-hosted maintenance, additional infrastructure
```

#### Option C: Dex Identity Provider
```
[On-Prem LDAP] <--LDAP--> [Dex] <--OIDC--> [Supabase Auth]

Pros: Lightweight, Kubernetes-native, simple config
Cons: Less features than Keycloak, smaller community
```

### Implementation Steps (Option B - Keycloak)

#### 1. Deploy Keycloak
```yaml
# docker-compose.keycloak.yml
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://db:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ${KC_DB_PASSWORD}
      KC_HOSTNAME: auth.ezlegal.ai
      KC_HTTPS_CERTIFICATE_FILE: /opt/keycloak/certs/tls.crt
      KC_HTTPS_CERTIFICATE_KEY_FILE: /opt/keycloak/certs/tls.key
    ports:
      - "8443:8443"
    volumes:
      - ./certs:/opt/keycloak/certs:ro
    command: start

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: ${KC_DB_PASSWORD}
    volumes:
      - keycloak_data:/var/lib/postgresql/data

volumes:
  keycloak_data:
```

#### 2. Configure LDAP User Federation
```json
// Keycloak Admin API - Create LDAP Provider
POST /admin/realms/ezlegal/components
{
  "name": "customer-ldap",
  "providerId": "ldap",
  "providerType": "org.keycloak.storage.UserStorageProvider",
  "config": {
    "vendor": ["ad"],
    "connectionUrl": ["ldaps://ldap.customer.com:636"],
    "bindDn": ["cn=service-account,ou=Service Accounts,dc=customer,dc=com"],
    "bindCredential": ["${LDAP_BIND_PASSWORD}"],
    "usersDn": ["ou=Users,dc=customer,dc=com"],
    "userObjectClasses": ["person, organizationalPerson, user"],
    "usernameLDAPAttribute": ["sAMAccountName"],
    "uuidLDAPAttribute": ["objectGUID"],
    "rdnLDAPAttribute": ["cn"],
    "searchScope": ["2"],
    "pagination": ["true"],
    "importEnabled": ["true"],
    "syncRegistrations": ["false"],
    "trustEmail": ["true"]
  }
}
```

#### 3. Configure Attribute Mappers
```json
// Map LDAP attributes to Keycloak user properties
{
  "name": "email",
  "providerId": "user-attribute-ldap-mapper",
  "config": {
    "ldap.attribute": "mail",
    "user.model.attribute": "email",
    "read.only": "true"
  }
}
```

#### 4. Configure Supabase OIDC Provider
```
Supabase Dashboard > Authentication > Providers > OpenID Connect

Provider Name: keycloak
Client ID: ezlegal-app
Client Secret: [generated-secret]
Issuer URL: https://auth.ezlegal.ai/realms/ezlegal
```

#### 5. Network Configuration
```hcl
# Terraform - VPN/Private Link to customer network
resource "aws_vpn_connection" "customer_ldap" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.customer.id
  type                = "ipsec.1"
  static_routes_only  = true
}

resource "aws_vpn_connection_route" "customer_ldap" {
  destination_cidr_block = "10.0.0.0/16"  # Customer LDAP network
  vpn_connection_id      = aws_vpn_connection.customer_ldap.id
}
```

### Security Requirements
- [ ] All LDAP connections use LDAPS (port 636)
- [ ] Service account has minimal read-only permissions
- [ ] Bind credentials stored in secrets manager
- [ ] Connection timeout set to 10 seconds
- [ ] Failed login attempts logged and rate-limited
- [ ] Certificate validation enabled (no self-signed in prod)

### Testing Checklist
- [ ] LDAP connection test succeeds
- [ ] User search returns expected results
- [ ] Authentication with valid credentials works
- [ ] Authentication with invalid credentials fails
- [ ] Password changes in AD propagate correctly
- [ ] Disabled AD accounts cannot authenticate
- [ ] Group membership syncs correctly
- [ ] Network failover tested

### Acceptance Criteria
1. Users can authenticate with AD credentials
2. User attributes sync from LDAP to application
3. Group-based access control works
4. Session management integrates with existing flow
5. Audit logs capture LDAP authentication events
6. High availability configuration documented

### Rollback Plan
1. Disable LDAP federation in Keycloak
2. Enable alternative authentication method
3. Document affected users for manual re-provisioning

---

## TICKET-003: Geographic Data Residency

### Summary
Ensure customer data is stored in specific geographic regions to comply with data sovereignty requirements (GDPR, state privacy laws, etc.).

### Priority
**P2 - Medium** (Required for EU customers, government contracts)

### Assignee
Platform Engineer + Compliance

### Estimated Effort
3-5 days (new region) / 1-2 weeks (migration)

### Prerequisites
- [ ] Compliance requirements documented
- [ ] Target regions identified
- [ ] Data classification completed
- [ ] Migration window approved (if existing data)

### Supabase Region Options
| Region | Location | Compliance |
|--------|----------|------------|
| us-east-1 | N. Virginia | SOC2, HIPAA |
| us-west-1 | N. California | SOC2, HIPAA |
| eu-west-1 | Ireland | GDPR |
| eu-central-1 | Frankfurt | GDPR |
| ap-southeast-1 | Singapore | PDPA |
| ap-northeast-1 | Tokyo | APPI |
| ap-southeast-2 | Sydney | Privacy Act |

### Implementation Steps

#### 1. New Regional Project Setup
```bash
# Create new Supabase project in target region
# Via Dashboard: New Project > Select Region

# Or via CLI (if available)
supabase projects create ezlegal-eu \
  --org-id [ORG_ID] \
  --region eu-central-1 \
  --plan pro
```

#### 2. Multi-Region Architecture
```
                    ┌─────────────────────┐
                    │   Global CDN        │
                    │   (Cloudflare)      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼────────┐ ┌────▼────┐ ┌────────▼────────┐
     │ US Region       │ │ Router  │ │ EU Region       │
     │ us-east-1       │ │         │ │ eu-central-1    │
     │                 │ │ (by     │ │                 │
     │ - US customers  │ │ domain/ │ │ - EU customers  │
     │ - Default       │ │ geo-ip) │ │ - GDPR data     │
     └─────────────────┘ └─────────┘ └─────────────────┘
```

#### 3. Environment Configuration
```bash
# .env.us (US deployment)
VITE_SUPABASE_URL=https://[US_PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=[US_ANON_KEY]
VITE_REGION=us

# .env.eu (EU deployment)
VITE_SUPABASE_URL=https://[EU_PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=[EU_ANON_KEY]
VITE_REGION=eu
```

#### 4. Geo-Routing Configuration (Cloudflare)
```javascript
// Cloudflare Worker for geo-routing
export default {
  async fetch(request) {
    const country = request.cf?.country || 'US';

    const EU_COUNTRIES = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE',
      'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV',
      'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
      'SI', 'ES', 'SE'
    ];

    const targetOrigin = EU_COUNTRIES.includes(country)
      ? 'https://eu.ezlegal.ai'
      : 'https://us.ezlegal.ai';

    return fetch(targetOrigin + new URL(request.url).pathname, request);
  }
};
```

#### 5. Data Migration (if needed)
```sql
-- Export from source region
COPY (SELECT * FROM profiles WHERE region_preference = 'eu')
TO '/tmp/eu_profiles.csv' WITH CSV HEADER;

-- Import to target region
COPY profiles FROM '/tmp/eu_profiles.csv' WITH CSV HEADER;

-- Verify record counts match
SELECT COUNT(*) FROM profiles; -- Run in both regions
```

#### 6. Database Schema Sync
```bash
# Ensure migrations are applied to all regional databases
# Use Supabase CLI or migration toolkit

# For each region:
supabase db push --project-ref [REGION_PROJECT_REF]
```

### Application Code Changes
```typescript
// src/lib/region-config.ts
export type Region = 'us' | 'eu' | 'ap';

export const REGION_CONFIGS: Record<Region, {
  supabaseUrl: string;
  supabaseKey: string;
  label: string;
}> = {
  us: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL_US,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY_US,
    label: 'United States',
  },
  eu: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL_EU,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY_EU,
    label: 'European Union',
  },
  ap: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL_AP,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY_AP,
    label: 'Asia Pacific',
  },
};

export function detectRegion(): Region {
  // Check user preference first
  const savedRegion = localStorage.getItem('preferred_region') as Region;
  if (savedRegion && REGION_CONFIGS[savedRegion]) {
    return savedRegion;
  }

  // Fall back to timezone-based detection
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone.startsWith('Europe/')) return 'eu';
  if (timezone.startsWith('Asia/') || timezone.startsWith('Australia/')) return 'ap';
  return 'us';
}
```

### Compliance Documentation
- [ ] Data Processing Agreement (DPA) updated
- [ ] Privacy Policy specifies data storage locations
- [ ] Sub-processor list updated with regional infrastructure
- [ ] Data flow diagram documenting cross-border transfers
- [ ] Standard Contractual Clauses (SCCs) for any EU->non-EU transfers

### Testing Checklist
- [ ] Users in each region connect to correct database
- [ ] Authentication works across all regions
- [ ] Data stays in designated region
- [ ] Performance acceptable from all target locations
- [ ] Failover procedures tested
- [ ] Audit logs capture region information

### Acceptance Criteria
1. Data stored exclusively in designated region
2. Users automatically routed to nearest region
3. Users can explicitly choose region preference
4. Compliance documentation complete
5. Monitoring alerts for cross-region data access

---

## TICKET-004: Bring Your Own Key (BYOK) Encryption

### Summary
Allow enterprise customers to manage their own encryption keys for data at rest, providing additional security control and compliance capabilities.

### Priority
**P3 - Low** (Rare requirement, typically financial services)

### Assignee
Security Engineer + Cloud Infrastructure

### Estimated Effort
1-2 weeks

### Prerequisites
- [ ] Customer has AWS/GCP/Azure account for key management
- [ ] Key management policies defined
- [ ] Self-hosted Supabase or Enterprise agreement
- [ ] Network connectivity between key service and database

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Customer AWS Account                  │
│  ┌─────────────────┐                                    │
│  │   AWS KMS       │                                    │
│  │   Customer      │◄──── Key rotation policy           │
│  │   Managed Key   │◄──── Access logging                │
│  └────────┬────────┘                                    │
│           │                                              │
└───────────┼──────────────────────────────────────────────┘
            │ Cross-account access
            ▼
┌───────────────────────────────────────────────────────────┐
│                    EZLegal AWS Account                    │
│  ┌─────────────────┐      ┌─────────────────────┐        │
│  │   RDS Postgres  │◄─────│   IAM Role          │        │
│  │   (encrypted)   │      │   (kms:Decrypt)     │        │
│  └─────────────────┘      └─────────────────────┘        │
│                                                           │
│  ┌─────────────────┐                                     │
│  │   S3 Bucket     │◄───── Also uses customer CMK       │
│  │   (encrypted)   │                                     │
│  └─────────────────┘                                     │
└───────────────────────────────────────────────────────────┘
```

### Implementation Steps (AWS)

#### 1. Customer Creates CMK
```bash
# Customer runs in their AWS account
aws kms create-key \
  --description "EZLegal database encryption key" \
  --key-usage ENCRYPT_DECRYPT \
  --origin AWS_KMS \
  --tags TagKey=Application,TagValue=EZLegal
```

#### 2. Customer Configures Key Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Allow EZLegal account to use the key",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::EZLEGAL_ACCOUNT_ID:root"
      },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:CallerAccount": "EZLEGAL_ACCOUNT_ID",
          "kms:ViaService": [
            "rds.us-east-1.amazonaws.com",
            "s3.us-east-1.amazonaws.com"
          ]
        }
      }
    },
    {
      "Sid": "Allow customer to administer the key",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::CUSTOMER_ACCOUNT_ID:root"
      },
      "Action": [
        "kms:Create*",
        "kms:Describe*",
        "kms:Enable*",
        "kms:List*",
        "kms:Put*",
        "kms:Update*",
        "kms:Revoke*",
        "kms:Disable*",
        "kms:Get*",
        "kms:Delete*",
        "kms:ScheduleKeyDeletion",
        "kms:CancelKeyDeletion"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 3. EZLegal Creates IAM Role
```hcl
# Terraform in EZLegal account
resource "aws_iam_role" "rds_kms_role" {
  name = "ezlegal-rds-kms-${var.customer_id}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "rds.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "rds_kms_policy" {
  name = "rds-kms-access"
  role = aws_iam_role.rds_kms_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ]
      Resource = var.customer_kms_key_arn
    }]
  })
}
```

#### 4. Create RDS Instance with Customer CMK
```hcl
resource "aws_db_instance" "customer_db" {
  identifier     = "ezlegal-${var.customer_id}"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.large"

  storage_encrypted = true
  kms_key_id        = var.customer_kms_key_arn  # Customer's CMK

  # Other configuration...
}
```

#### 5. Enable Key Rotation (Customer)
```bash
# Customer enables automatic key rotation
aws kms enable-key-rotation --key-id [KEY_ID]
```

### S3 Bucket Encryption (for file uploads)
```hcl
resource "aws_s3_bucket_server_side_encryption_configuration" "customer_bucket" {
  bucket = aws_s3_bucket.customer_documents.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = var.customer_kms_key_arn
      sse_algorithm     = "aws:kms"
    }
  }
}
```

### Key Revocation Procedure
```markdown
## Emergency Key Revocation

If customer needs to revoke access immediately:

1. Customer disables the CMK:
   aws kms disable-key --key-id [KEY_ID]

2. This immediately prevents:
   - New data encryption
   - Reading existing encrypted data
   - Database connections (will fail)

3. To restore access:
   aws kms enable-key --key-id [KEY_ID]

4. Recovery time: ~5 minutes after key re-enabled
```

### Monitoring & Alerting
```yaml
# CloudWatch alarm for key access issues
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  KMSAccessAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: BYOK-Access-Failure
      MetricName: Errors
      Namespace: AWS/KMS
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 1
      ComparisonOperator: GreaterThanOrEqualToThreshold
      Dimensions:
        - Name: KeyId
          Value: !Ref CustomerKMSKey
      AlarmActions:
        - !Ref AlertSNSTopic
```

### Testing Checklist
- [ ] Database starts with customer CMK
- [ ] Data encryption verified (pg_stat_ssl)
- [ ] Key rotation works without downtime
- [ ] Key revocation blocks access immediately
- [ ] Key restoration recovers access
- [ ] CloudTrail logs all key operations
- [ ] Performance impact measured (<5% acceptable)

### Acceptance Criteria
1. Customer controls their own encryption key
2. Key rotation automated annually
3. Customer can revoke access immediately
4. All data at rest encrypted with customer key
5. Audit trail of all key usage
6. Disaster recovery procedure documented

---

## TICKET-005: Third-Party Legal System Integrations

### Summary
Integrate with legal practice management systems (LegalServer, Clio, MyCase, etc.) to enable data synchronization and workflow automation.

### Priority
**P2 - Medium** (Enables key use cases for legal aid orgs)

### Assignee
Backend Engineer + Integration Specialist

### Estimated Effort
2-3 weeks per integration

### Prerequisites
- [ ] API credentials from each vendor
- [ ] Data mapping specification approved
- [ ] Customer authorization for data access
- [ ] Webhook endpoints configured

---

### Integration A: LegalServer

#### Overview
LegalServer is used by many legal aid organizations. Integration enables case intake synchronization.

#### API Information
```
Base URL: https://[org].legalserver.org/api/v1
Auth: OAuth 2.0 or API Key
Rate Limit: 100 requests/minute
Documentation: https://apidocs.legalserver.org/
```

#### Required Scopes
- `matters:read` - Read case information
- `matters:write` - Create/update cases
- `contacts:read` - Read client information
- `contacts:write` - Create/update clients
- `documents:read` - Read documents
- `documents:write` - Upload documents

#### Implementation

##### 1. Create Edge Function for Sync
```typescript
// supabase/functions/legalserver-sync/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LegalServerMatter {
  id: string;
  case_number: string;
  client_name: string;
  case_type: string;
  status: string;
  assigned_attorney: string;
  opened_date: string;
  closed_date?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { organization_id, action } = await req.json();

    // Get organization's LegalServer credentials
    const { data: config } = await supabase
      .from("integration_configs")
      .select("*")
      .eq("organization_id", organization_id)
      .eq("provider", "legalserver")
      .single();

    if (!config) {
      throw new Error("LegalServer not configured for this organization");
    }

    const lsBaseUrl = `https://${config.subdomain}.legalserver.org/api/v1`;
    const lsHeaders = {
      "Authorization": `Bearer ${config.api_key}`,
      "Content-Type": "application/json",
    };

    if (action === "sync_matters") {
      // Fetch matters from LegalServer
      const response = await fetch(`${lsBaseUrl}/matters?modified_since=${config.last_sync}`, {
        headers: lsHeaders,
      });

      const matters: LegalServerMatter[] = await response.json();

      // Upsert to Supabase
      for (const matter of matters) {
        await supabase.from("matters").upsert({
          external_id: matter.id,
          external_source: "legalserver",
          organization_id,
          case_number: matter.case_number,
          client_name: matter.client_name,
          case_type: matter.case_type,
          status: matter.status,
          assigned_attorney: matter.assigned_attorney,
          opened_at: matter.opened_date,
          closed_at: matter.closed_date,
          synced_at: new Date().toISOString(),
        }, {
          onConflict: "external_id,external_source",
        });
      }

      // Update last sync time
      await supabase
        .from("integration_configs")
        .update({ last_sync: new Date().toISOString() })
        .eq("id", config.id);

      return new Response(
        JSON.stringify({ synced: matters.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_matter") {
      // Create matter in LegalServer from EZLegal intake
      const { matter_data } = await req.json();

      const response = await fetch(`${lsBaseUrl}/matters`, {
        method: "POST",
        headers: lsHeaders,
        body: JSON.stringify({
          case_type: matter_data.case_type,
          client: {
            first_name: matter_data.client_first_name,
            last_name: matter_data.client_last_name,
            email: matter_data.client_email,
          },
          notes: matter_data.description,
        }),
      });

      const newMatter = await response.json();

      return new Response(
        JSON.stringify({ external_id: newMatter.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

##### 2. Webhook Handler
```typescript
// supabase/functions/legalserver-webhook/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-LegalServer-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get("X-LegalServer-Signature");
    const body = await req.text();

    // TODO: Verify HMAC signature
    // const expectedSig = hmac(body, webhookSecret);
    // if (signature !== expectedSig) throw new Error("Invalid signature");

    const event = JSON.parse(body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (event.type) {
      case "matter.updated":
        await supabase
          .from("matters")
          .update({
            status: event.data.status,
            synced_at: new Date().toISOString(),
          })
          .eq("external_id", event.data.id)
          .eq("external_source", "legalserver");
        break;

      case "matter.closed":
        await supabase
          .from("matters")
          .update({
            status: "closed",
            closed_at: event.data.closed_date,
            synced_at: new Date().toISOString(),
          })
          .eq("external_id", event.data.id)
          .eq("external_source", "legalserver");
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### Integration B: Clio

#### Overview
Clio is a popular practice management system for law firms. Integration enables matter sync and document management.

#### API Information
```
Base URL: https://app.clio.com/api/v4
Auth: OAuth 2.0
Rate Limit: 600 requests/minute
Documentation: https://app.clio.com/api/v4/documentation
```

#### OAuth Setup

##### 1. Register Application
1. Go to https://app.clio.com/settings/developer_applications
2. Create new application
3. Set redirect URI: `https://[PROJECT].supabase.co/functions/v1/clio-oauth/callback`
4. Save Client ID and Client Secret

##### 2. OAuth Flow Implementation
```typescript
// supabase/functions/clio-oauth/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CLIO_CLIENT_ID = Deno.env.get("CLIO_CLIENT_ID");
const CLIO_CLIENT_SECRET = Deno.env.get("CLIO_CLIENT_SECRET");
const CLIO_REDIRECT_URI = Deno.env.get("CLIO_REDIRECT_URI");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Step 1: Initiate OAuth
  if (path === "authorize") {
    const state = crypto.randomUUID();
    const authUrl = new URL("https://app.clio.com/oauth/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", CLIO_CLIENT_ID!);
    authUrl.searchParams.set("redirect_uri", CLIO_REDIRECT_URI!);
    authUrl.searchParams.set("state", state);

    return new Response(
      JSON.stringify({ auth_url: authUrl.toString(), state }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Step 2: Handle OAuth callback
  if (path === "callback") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    // Exchange code for tokens
    const tokenResponse = await fetch("https://app.clio.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code!,
        client_id: CLIO_CLIENT_ID!,
        client_secret: CLIO_CLIENT_SECRET!,
        redirect_uri: CLIO_REDIRECT_URI!,
      }),
    });

    const tokens = await tokenResponse.json();

    // Store tokens securely
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get organization_id from state (stored earlier)
    // In production, decrypt state to get org ID

    await supabase.from("integration_configs").upsert({
      provider: "clio",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });

    // Redirect back to app
    return new Response(null, {
      status: 302,
      headers: {
        Location: "https://ezlegal.ai/settings/integrations?connected=clio",
      },
    });
  }

  return new Response("Not found", { status: 404 });
});
```

##### 3. Clio API Wrapper
```typescript
// supabase/functions/clio-api/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function refreshTokenIfNeeded(supabase: any, config: any) {
  const expiresAt = new Date(config.token_expires_at);
  if (expiresAt > new Date()) return config.access_token;

  const response = await fetch("https://app.clio.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: config.refresh_token,
      client_id: Deno.env.get("CLIO_CLIENT_ID")!,
      client_secret: Deno.env.get("CLIO_CLIENT_SECRET")!,
    }),
  });

  const tokens = await response.json();

  await supabase
    .from("integration_configs")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })
    .eq("id", config.id);

  return tokens.access_token;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { organization_id, endpoint, method = "GET", body } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: config } = await supabase
      .from("integration_configs")
      .select("*")
      .eq("organization_id", organization_id)
      .eq("provider", "clio")
      .single();

    if (!config) throw new Error("Clio not connected");

    const accessToken = await refreshTokenIfNeeded(supabase, config);

    const response = await fetch(`https://app.clio.com/api/v4${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### Database Schema for Integrations
```sql
-- Integration configurations
CREATE TABLE IF NOT EXISTS integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('legalserver', 'clio', 'mycase', 'practicepanther')),

  -- Connection details
  subdomain text,
  api_key text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  webhook_secret text,

  -- Sync state
  last_sync timestamptz,
  sync_enabled boolean DEFAULT true,
  sync_frequency_minutes integer DEFAULT 60,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(organization_id, provider)
);

ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage integrations"
  ON integration_configs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = integration_configs.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('admin', 'owner')
    )
  );

-- Sync logs
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text CHECK (status IN ('running', 'success', 'failed')),
  records_synced integer DEFAULT 0,
  error_message text,
  details jsonb
);

ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view sync logs"
  ON integration_sync_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM integration_configs ic
      JOIN organization_members om ON om.organization_id = ic.organization_id
      WHERE ic.id = integration_sync_logs.config_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_integration_configs_org_provider
  ON integration_configs(organization_id, provider);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_config
  ON integration_sync_logs(config_id, started_at DESC);
```

### Testing Checklist
- [ ] OAuth flow completes successfully
- [ ] Token refresh works automatically
- [ ] Matter sync creates/updates records correctly
- [ ] Webhook events processed correctly
- [ ] Error handling and retries work
- [ ] Rate limiting respected
- [ ] Sync logs captured accurately

### Acceptance Criteria
1. Users can connect/disconnect integrations from settings
2. Data syncs bidirectionally based on configuration
3. Webhooks update data in real-time
4. Sync status and history visible to admins
5. Errors logged and alerted appropriately
6. API credentials stored securely

---

## Summary: Implementation Order

| Ticket | Feature | Dependencies | Est. Effort |
|--------|---------|--------------|-------------|
| 001 | SAML 2.0 | Supabase Pro plan | 2-3 days |
| 002 | LDAP/AD | Keycloak deployed, VPN | 5-7 days |
| 003 | Geo Residency | None | 3-5 days |
| 004 | BYOK | Self-hosted infra | 1-2 weeks |
| 005 | Integrations | API credentials | 2-3 weeks |

## Contacts

- **Supabase Enterprise Sales:** enterprise@supabase.io
- **LegalServer API Support:** support@legalserver.org
- **Clio Developer Support:** developers@clio.com
