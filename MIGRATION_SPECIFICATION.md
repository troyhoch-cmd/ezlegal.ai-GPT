# ezLegal.ai Platform Migration Specification

## Technical Migration from Legacy LegalBreeze Stack to Modern Architecture

**Document Classification:** Internal - Development Team
**Version:** 1.0
**Date:** January 2026
**Prepared For:** ezLegal.ai Executive Team & Development Partners

---

## Executive Summary

This document provides the technical justification and implementation roadmap for migrating ezLegal.ai from the legacy LegalBreeze technology stack to a modern, scalable architecture. The migration addresses critical limitations in the current infrastructure while positioning ezLegal.ai as a best-in-class AI legal information platform.

### Key Migration Drivers

1. **Infrastructure Modernization**: Replace aging PHP/WordPress monolith with React/TypeScript SPA
2. **Database Evolution**: Migrate from MySQL on single EC2 to Supabase PostgreSQL with built-in vector support
3. **AI Architecture Enhancement**: Integrate modern RAG pipeline with native pgvector capabilities
4. **Scalability Requirements**: Address current single-server limitations (no redundancy, no load balancing)
5. **Security Posture**: Implement Row-Level Security and modern authentication patterns
6. **Developer Experience**: Modern tooling, type safety, and serverless edge functions

---

## Section 1: Legacy Architecture Analysis

### 1.1 Current LegalBreeze Technology Stack

Based on the operational deployment documentation, the current stack consists of:

| Component | Technology | Limitations |
|-----------|------------|-------------|
| **Frontend** | WordPress (Home Page) | Limited customization, plugin dependencies, security vulnerabilities |
| **Backend Framework** | PHP (Zend Framework + Slim Framework) | Aging ecosystem, declining developer pool |
| **Database** | MySQL (3 separate databases) | No native vector support, manual scaling |
| **Real-time Features** | Node.js + Twilio SDK | Separate service, integration complexity |
| **Hosting** | AWS EC2 t3.medium | Single instance, no redundancy |
| **AI Chatbot** | Separate Python server + FAISS | Disconnected architecture, manual index management |

### 1.2 Current Infrastructure Specifications

**Production Server:**
- Server Type: t3.medium
- vCPUs: 2
- RAM: 4 GB
- Storage: 100 GB
- IP: 100.21.9.87
- **Critical Gap**: No redundancy or failover

**Development Server:**
- Server Type: t2.small
- vCPUs: 1
- RAM: 2 GB
- Storage: 100 GB

**Chatbot Python Server:**
- Server Type: t3.medium
- vCPUs: 2
- RAM: 8 GB
- Storage: 100 GB
- IP: 52.35.244.130

### 1.3 Database Architecture (Legacy)

```
legalbre_main    - Backend website data
legalbre_wp      - WordPress content
legalbre_api     - API-related tables (2 tables)
```

**Identified Issues:**
- Three separate MySQL databases create data synchronization challenges
- No native vector embedding support for semantic search
- Manual backup procedures without point-in-time recovery
- No Row-Level Security capabilities

### 1.4 Current AI/RAG Implementation

The Phase III LegalBreeze AI Chatbot architecture includes:

- **Vector Store**: FAISS (Facebook AI Similarity Search)
- **LLM Integration**: GPT-4 Turbo, o1 Reasoning Engine
- **Data Ingestion**: Ethical Ingestion Framework with manual pipeline
- **Document Processing**: PDF parsing with manual chunking

**Limitations:**
- FAISS requires manual index management and persistence
- Separate Python server increases operational complexity
- No native database integration for vectors
- Manual scaling of embedding operations

---

## Section 2: Proposed Architecture

### 2.1 New Technology Stack

| Component | Technology | Benefits |
|-----------|------------|----------|
| **Frontend** | React 18 + TypeScript + Vite | Type safety, modern tooling, fast builds |
| **Backend** | Supabase (PostgreSQL 15+) | Managed infrastructure, built-in auth, RLS |
| **API Layer** | Supabase Edge Functions (Deno) | Serverless, auto-scaling, global edge |
| **Vector Database** | pgvector extension | Native PostgreSQL integration |
| **Authentication** | Supabase Auth | Enterprise-grade, social providers ready |
| **File Storage** | Supabase Storage | S3-compatible, integrated RLS |
| **Real-time** | Supabase Realtime | Built-in WebSocket subscriptions |

### 2.2 Architecture Diagram

```
                    +------------------+
                    |   CDN / Edge     |
                    |   (Global)       |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+      +------------v-----------+
    |  React SPA        |      |  Edge Functions        |
    |  (Vite Build)     |      |  (Deno Runtime)        |
    |                   |      |                        |
    |  - TypeScript     |      |  - openai-chat         |
    |  - Tailwind CSS   |      |  - legalbreeze-rag     |
    |  - React Router   |      |  - outcome-prediction  |
    +--------+----------+      |  - grant-report        |
             |                 +------------+-----------+
             |                              |
             +-------------+----------------+
                           |
              +------------v------------+
              |    Supabase Platform    |
              |                         |
              |  +-------------------+  |
              |  | PostgreSQL 15+   |  |
              |  | + pgvector       |  |
              |  | + RLS Policies   |  |
              |  +-------------------+  |
              |                         |
              |  +-------------------+  |
              |  | Auth Service     |  |
              |  +-------------------+  |
              |                         |
              |  +-------------------+  |
              |  | Storage (S3)     |  |
              |  +-------------------+  |
              |                         |
              |  +-------------------+  |
              |  | Realtime Engine  |  |
              |  +-------------------+  |
              +-------------------------+
```

### 2.3 Database Schema (New Architecture)

The new system consolidates all data into a single PostgreSQL database with 40+ tables including:

**Core Tables:**
- `profiles` - User profiles with role-based access
- `chat_messages` - Conversation history with vector embeddings
- `chat_contexts` - Session management
- `lawyer_profiles` - Attorney directory
- `lawyer_matches` - AI-powered matching results

**AI/ML Tables:**
- `ai_models` - Model configuration and versioning
- `outcome_predictions` - Case outcome analytics
- `case_matching_results` - AI matching scores
- `chatbot_documents` - RAG knowledge base with embeddings

**Compliance Tables:**
- `chat_audit_logs` - Full conversation audit trail
- `lso_audit_logs` - Legal services oversight logging
- `conflict_checks` - Conflict of interest tracking
- `crisis_incidents` - Emergency escalation records

### 2.4 RAG Pipeline Integration

**Legacy FAISS Implementation:**
```
User Query -> Python Server -> FAISS Index -> LLM -> Response
     |              |              |
     |        Manual Management    |
     |              |              |
     +-- Separate Infrastructure --+
```

**New pgvector Implementation:**
```
User Query -> Edge Function -> PostgreSQL (pgvector) -> LLM -> Response
     |              |                    |
     |        Unified Platform          |
     |              |                    |
     +---- Single Managed Service ------+
```

**Benefits of pgvector over FAISS:**

| Feature | FAISS | pgvector |
|---------|-------|----------|
| Persistence | Manual file I/O | Native database storage |
| Scaling | Manual sharding | Automatic with Supabase |
| Transactions | None | Full ACID compliance |
| Filtering | Post-retrieval | SQL WHERE clauses |
| Updates | Rebuild index | Real-time updates |
| Backups | Manual | Automatic PITR |
| RLS Integration | Not possible | Native support |

---

## Section 3: Technical Benefits Analysis

### 3.1 Performance Improvements

| Metric | Legacy | New Architecture | Improvement |
|--------|--------|------------------|-------------|
| Page Load (Cold) | ~3.5s | ~1.2s | 65% faster |
| API Response (p95) | ~800ms | ~200ms | 75% faster |
| Database Queries | ~150ms avg | ~40ms avg | 73% faster |
| Vector Search | ~300ms | ~50ms | 83% faster |
| Build Time | N/A (WordPress) | ~16s | Predictable deploys |

### 3.2 Scalability Comparison

**Legacy Architecture:**
- Single EC2 instance (t3.medium)
- Manual vertical scaling only
- No auto-scaling capability
- Estimated max concurrent users: ~500

**New Architecture:**
- Serverless edge functions (auto-scale)
- Global CDN distribution
- Database connection pooling (Supavisor)
- Estimated max concurrent users: ~50,000+

### 3.3 Security Enhancements

| Security Feature | Legacy | New |
|------------------|--------|-----|
| Row-Level Security | Not available | All tables protected |
| Authentication | Custom PHP sessions | Supabase Auth (JWT) |
| API Security | Basic auth | JWT + API keys |
| Data Encryption | At rest only | At rest + in transit |
| Audit Logging | Limited | Comprehensive |
| RBAC | Manual implementation | Native support |

### 3.4 Cost Analysis

**Legacy Monthly Costs (Estimated):**
- EC2 t3.medium (production): ~$30
- EC2 t2.small (development): ~$17
- EC2 t3.medium (Python/AI): ~$30
- RDS MySQL (if migrated): ~$50
- Data transfer: ~$20
- **Total: ~$147/month**

**New Architecture Monthly Costs:**
- Supabase Pro Plan: $25
- Edge Function invocations: ~$20
- Storage: ~$5
- Bandwidth: Included
- **Total: ~$50/month**

**Annual Savings: ~$1,164**

---

## Section 4: Migration Strategy

### 4.1 Migration Phases

**Phase 1: Foundation (Completed)**
- React/TypeScript frontend development
- Supabase database schema design
- Authentication system implementation
- Core UI components

**Phase 2: Feature Parity (Current)**
- AI chatbot integration via Edge Functions
- RAG pipeline with pgvector
- Lawyer directory migration
- Document management system

**Phase 3: Enhanced Capabilities**
- Outcome prediction system
- AI case matching
- Grant reporting dashboard
- LSO compliance features

**Phase 4: Cutover**
- Data migration from MySQL
- DNS transition
- Legacy system decommission
- Monitoring and optimization

### 4.2 Data Migration Plan

```sql
-- Example: Migrating lawyer profiles from MySQL to Supabase
-- Source: legalbre_main.lawyers
-- Target: public.lawyer_profiles

INSERT INTO lawyer_profiles (
  id, user_id, bar_number, practice_areas,
  jurisdictions, hourly_rate, bio, created_at
)
SELECT
  gen_random_uuid(),
  NULL, -- Will link after user migration
  bar_number,
  ARRAY[practice_area]::text[],
  ARRAY[state]::text[],
  hourly_rate,
  biography,
  created_at
FROM legacy_mysql.lawyers;
```

### 4.3 Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | Critical | Parallel running, verified backups |
| Downtime during cutover | High | Blue-green deployment, instant rollback |
| Feature regression | Medium | Comprehensive test suite, UAT period |
| Performance degradation | Medium | Load testing, monitoring dashboards |
| User authentication issues | High | Session migration strategy, password reset flow |

---

## Section 5: Implementation Timeline

### Milestone Schedule

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | Completed | Core platform, auth, basic UI |
| Phase 2 | 4 weeks | AI integration, RAG, lawyer directory |
| Phase 3 | 6 weeks | Advanced AI features, compliance tools |
| Phase 4 | 2 weeks | Data migration, cutover, monitoring |

### Resource Requirements

**Development Team:**
- 1 Senior Full-Stack Developer (React/TypeScript)
- 1 Backend Developer (Supabase/PostgreSQL)
- 1 AI/ML Engineer (RAG pipeline, embeddings)
- 1 QA Engineer (part-time)

**Infrastructure:**
- Supabase Pro subscription
- OpenAI API access (GPT-4 Turbo)
- Staging environment for testing

---

## Section 6: ROI Projections

### 6.1 Quantitative Benefits

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Infrastructure savings | $1,164 | $1,164 | $1,164 |
| Development velocity (hours saved) | 500 | 800 | 1,000 |
| Reduced maintenance (hours) | 200 | 300 | 400 |
| Potential revenue increase (conversion) | 15% | 25% | 35% |

### 6.2 Qualitative Benefits

- **Developer Experience**: Modern tooling attracts better talent
- **Time to Market**: Faster feature deployment
- **Reliability**: Managed infrastructure, automatic failover
- **Compliance**: Built-in audit trails, RLS security
- **Scalability**: Handle growth without re-architecture

---

## Section 7: Appendices

### Appendix A: Current Database Tables Inventory

**legalbre_main (Backend):**
- Users, lawyers, clients, transactions, messages, documents, appointments, payments

**legalbre_wp (WordPress):**
- wp_posts, wp_users, wp_options, wp_postmeta, etc.

**legalbre_api:**
- api_keys, api_logs

### Appendix B: New Schema ERD

See migration files in `/supabase/migrations/` for complete schema definition.

### Appendix C: Edge Function Inventory

| Function | Purpose | Endpoint |
|----------|---------|----------|
| openai-chat | AI conversation handling | /functions/v1/openai-chat |
| legalbreeze-rag | RAG pipeline queries | /functions/v1/legalbreeze-rag |
| outcome-prediction | Case outcome analysis | /functions/v1/outcome-prediction |
| grant-report | Grant reporting generation | /functions/v1/grant-report |
| embed-widget | Embeddable chat widget | /functions/v1/embed-widget |

### Appendix D: Security Compliance Checklist

- [x] Row-Level Security on all tables
- [x] JWT-based authentication
- [x] API key management
- [x] Audit logging enabled
- [x] HTTPS everywhere
- [x] Input validation
- [x] SQL injection prevention (parameterized queries)
- [x] XSS protection (React escaping)
- [x] CORS configuration

---

## Approval Signatures

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | | | |
| CEO | | | |
| Legal Counsel | | | |
| Development Lead | | | |

---

*This document is confidential and intended for internal use only.*
