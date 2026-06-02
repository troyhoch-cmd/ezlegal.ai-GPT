# ezLegal.ai Database Schema Reference

> **Database**: PostgreSQL (Supabase)
> **Extensions**: pgvector (for embeddings)
> **Total Tables**: 40+
> **All Tables Have RLS**: Yes

---

## Table of Contents

1. [Core User Tables](#core-user-tables)
2. [Chat & AI Tables](#chat--ai-tables)
3. [Legal Case Management](#legal-case-management)
4. [Attorney/Lawyer Tables](#attorneylawyer-tables)
5. [Pro Bono System](#pro-bono-system)
6. [LSO (Legal Services Organization)](#lso-legal-services-organization)
7. [Grant Reporting](#grant-reporting)
8. [Admin & RBAC](#admin--rbac)
9. [Analytics & Audit](#analytics--audit)
10. [Content & Knowledge](#content--knowledge)
11. [Embeddings & RAG](#embeddings--rag)

---

## Core User Tables

### `profiles`
User profile data linked to Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK, references auth.users.id |
| email | text | User email |
| full_name | text | Display name |
| phone | text | Contact phone |
| avatar_url | text | Profile image URL |
| bio | text | User biography |
| company | text | Company/organization |
| job_title | text | User's job title |
| is_admin | boolean | Admin flag |
| role | text | client/attorney/paralegal/support/admin |
| subscription_tier | text | free/trial/basic/premium/enterprise |
| trial_started_at | timestamptz | Trial start date |
| trial_expires_at | timestamptz | Trial expiration |
| notification_email | boolean | Email notification preference |
| notification_sms | boolean | SMS notification preference |

### `email_captures`
Lead capture for marketing.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| email | text | Captured email |
| source | text | Where captured from |
| metadata | jsonb | Additional context |
| created_at | timestamptz | Capture time |

---

## Chat & AI Tables

### `chat_messages`
Authenticated user chat history.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| message | text | User's question |
| response | text | AI response |
| context | text | Conversation context |
| jurisdiction | text | Legal jurisdiction |
| is_favorite | boolean | Starred message |
| created_at | timestamptz | Message time |

### `free_chat_sessions`
Anonymous/free tier sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| session_token | text | Unique session identifier |
| user_id | uuid | Optional FK if converted |
| question_count | integer | Questions asked this session |
| last_question_at | timestamptz | Last activity |
| ip_address | text | For rate limiting |
| converted_to_trial | boolean | Conversion tracking |

### `free_chat_messages`
Messages from free tier sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| session_id | uuid | FK to free_chat_sessions |
| role | text | user/assistant |
| content | text | Message content |
| created_at | timestamptz | Message time |

### `chat_attachments`
File attachments to chat messages.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| chat_message_id | uuid | FK to chat_messages |
| user_id | uuid | FK to auth.users |
| file_name | text | Original filename |
| file_size | bigint | Size in bytes |
| file_type | text | MIME type |
| storage_path | text | Supabase Storage path |

### `ai_response_provenance`
Citation tracking for RAG responses.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| chat_message_id | uuid | FK to chat_messages |
| source_type | text | statute/case/article |
| source_id | text | Reference ID |
| source_title | text | Source name |
| source_url | text | Link to source |
| relevance_score | numeric | Match confidence |
| citation_text | text | Extracted citation |

---

## Legal Case Management

### `cases`
User legal cases.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| client_id | uuid | FK to clients |
| title | text | Case title |
| case_number | text | Court case number |
| case_type | text | Case category |
| status | text | open/closed/pending |
| description | text | Case details |
| priority | text | low/medium/high |
| deadline | timestamptz | Key deadline |

### `clients`
Client records (for attorneys).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users (attorney) |
| first_name | text | Client first name |
| last_name | text | Client last name |
| email | text | Client email |
| phone | text | Client phone |
| address | text | Client address |
| notes | text | Private notes |

### `documents`
Generated legal documents.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| case_id | uuid | FK to cases |
| matter_id | uuid | FK to matters |
| title | text | Document title |
| document_type | text | Template type |
| content | text | Document content |
| template_used | text | Template ID |
| jurisdiction | text | Legal jurisdiction |

### `matters`
Legal matter tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| title | text | Matter title |
| matter_number | text | Internal reference |
| practice_area | text | Legal practice area |
| status | text | active/closed/on_hold |
| client_name | text | Client name |
| opposing_party | text | Opposing party |
| court_name | text | Court name |
| jurisdiction | text | Jurisdiction |

---

## Attorney/Lawyer Tables

### `lawyer_profiles`
Attorney directory.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| first_name | text | Attorney first name |
| last_name | text | Attorney last name |
| specialty | text | Primary specialty |
| practice_areas | text[] | All practice areas |
| hourly_rate | integer | Rate in dollars |
| rating | numeric | Average rating (0-5) |
| review_count | integer | Number of reviews |
| years_experience | integer | Years practicing |
| jurisdiction | text | Bar jurisdiction |
| certifications | text | Special certifications |
| languages | text[] | Languages spoken |
| city | text | City |
| state | text | State |
| is_online | boolean | Available now |
| offers_flat_fee | boolean | Offers flat fee |
| website_url | text | Website |
| public_phone | text | Contact phone |
| email | text | Contact email |

### `lawyer_matches`
AI-suggested attorney matches.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| chat_message_id | uuid | FK to chat_messages |
| practice_area | text | Matched practice area |
| lawyer_name | text | Attorney name |
| lawyer_id | text | Attorney ID |
| status | text | suggested/contacted/scheduled/completed/dismissed |

### `lawyer_connections`
User-attorney connection requests.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| lawyer_profile_id | uuid | FK to lawyer_profiles |
| connection_type | text | consultation/case_evaluation/quick_question |
| status | text | pending/accepted/declined/completed |
| user_message | text | Initial message |
| lawyer_response | text | Attorney response |
| preferred_contact | text | email/phone/video |

### `lawyer_consultations`
Consultation records.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| lawyer_match_id | uuid | FK to lawyer_matches |
| lawyer_name | text | Attorney name |
| practice_area | text | Practice area |
| consultation_date | timestamptz | Scheduled date |
| status | text | requested/scheduled/completed/cancelled |

---

## Pro Bono System

### `pro_bono_applications`
Income-qualified applications.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| eligibility_id | uuid | FK to eligibility_screenings |
| legal_issue_type | text | Type of legal issue |
| issue_description | text | Detailed description |
| urgency_level | text | low/medium/high/emergency |
| preferred_language | text | Communication language |
| status | text | submitted/under_review/accepted/rejected |
| assigned_attorney_id | uuid | Assigned attorney |

### `eligibility_screenings`
Federal Poverty Level calculations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| household_size | integer | Number in household |
| annual_income | numeric | Total annual income |
| fpl_percentage | numeric | Calculated FPL % |
| is_eligible | boolean | Qualifies for pro bono |
| assets_value | numeric | Total assets |
| has_legal_aid | boolean | Already has representation |
| screening_date | timestamptz | When screened |

---

## LSO (Legal Services Organization)

### `lso_organizations`
Legal Services Organization records.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| name | text | Organization name |
| type | text | Organization type |
| contact_email | text | Primary contact |
| jurisdiction | text | Service area |
| is_active | boolean | Active status |

### `lso_cases`
Cases handled by LSOs.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| organization_id | uuid | FK to lso_organizations |
| case_number | text | Internal case number |
| client_name | text | Client name |
| case_type | text | Case category |
| status | text | Case status |
| assigned_attorney | text | Assigned attorney |

### `lso_audit_logs`
Compliance audit trail for LSOs.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| organization_id | uuid | FK to lso_organizations |
| action | text | Action taken |
| actor_id | uuid | Who performed action |
| details | jsonb | Action details |

---

## Grant Reporting

### `grant_reports`
Generated grant reports.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| organization_id | uuid | FK to lso_organizations |
| grant_name | text | Grant name |
| reporting_period_start | date | Period start |
| reporting_period_end | date | Period end |
| report_data | jsonb | Full report data |
| status | text | draft/submitted/approved |

### `grant_metrics`
Metrics for grant reporting.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| organization_id | uuid | FK to lso_organizations |
| metric_type | text | Type of metric |
| metric_value | numeric | Metric value |
| period_start | date | Measurement period start |
| period_end | date | Measurement period end |

---

## Admin & RBAC

### `user_roles`
Role-based access control.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| role | text | Role name |
| permissions | jsonb | Role permissions |
| granted_by | uuid | Who granted role |
| granted_at | timestamptz | When granted |

### `pending_approvals`
Admin approval queue.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| request_type | text | Type of request |
| requester_id | uuid | Who requested |
| request_data | jsonb | Request details |
| status | text | pending/approved/rejected |
| reviewer_id | uuid | Who reviewed |

### `admin_audit_logs`
Admin action audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| admin_id | uuid | FK to profiles |
| action | text | Action taken |
| target_type | text | What was affected |
| target_id | uuid | Affected record ID |
| details | jsonb | Action details |

### `system_settings`
Application configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| setting_key | text | Setting name |
| setting_value | jsonb | Setting value |
| updated_by | uuid | Who updated |
| updated_at | timestamptz | When updated |

---

## Analytics & Audit

### `analytics_events`
User behavior tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| event_type | text | Event name |
| event_data | jsonb | Event properties |
| session_id | text | Browser session |
| created_at | timestamptz | Event time |

### `conversion_events`
Signup funnel tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| session_id | uuid | FK to anonymous_chat_sessions |
| event_type | text | Conversion event |
| event_data | jsonb | Event details |

### `chat_audit_logs`
Chat compliance audit.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| action | text | Action taken |
| message_id | uuid | Related message |
| details | jsonb | Audit details |

### `openai_usage_logs`
Token usage tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| model | text | Model used |
| prompt_tokens | integer | Input tokens |
| completion_tokens | integer | Output tokens |
| total_tokens | integer | Total tokens |
| cost_usd | numeric | Estimated cost |

### `crisis_incidents`
Crisis/emergency tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| incident_type | text | Type of crisis |
| severity | text | low/medium/high/critical |
| details | text | Incident description |
| status | text | open/resolved/escalated |

### `trust_safety_reports`
Trust & safety reports.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| reporter_id | uuid | Who reported |
| report_type | text | Type of report |
| subject_type | text | What is being reported |
| subject_id | uuid | ID of subject |
| description | text | Report details |
| status | text | open/investigating/resolved |

---

## Content & Knowledge

### `ezreads_articles`
Legal education articles.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| title | text | Article title |
| slug | text | URL slug |
| content | text | Article body |
| practice_area | text | Legal category |
| jurisdiction | text | Applicable jurisdiction |
| reading_time | integer | Minutes to read |
| is_published | boolean | Published status |

### `chatbot_prompts`
AI prompt templates.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| category_id | integer | FK to prompt_categories |
| subcategory_id | integer | FK to prompt_subcategories |
| prompt_text | text | The prompt |
| is_active | boolean | Active status |

### `chatbot_documents`
Uploaded knowledge base documents.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| title | text | Document title |
| content | text | Document content |
| document_type | text | Type of document |
| jurisdiction | text | Applicable jurisdiction |
| practice_area | text | Legal category |
| is_active | boolean | Active status |

### `ai_models`
AI model configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| model_name | text | Model identifier |
| display_name | text | User-friendly name |
| provider | text | openai/anthropic/etc |
| is_active | boolean | Available for use |
| is_default | boolean | Default model |
| config | jsonb | Model parameters |

---

## Embeddings & RAG

### `arizona_statutes`
Arizona Revised Statutes with embeddings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| title_number | text | Title number |
| chapter_number | text | Chapter number |
| section_number | text | Section number |
| section_title | text | Section title |
| content | text | Full text |
| embedding | vector(1536) | OpenAI embedding |
| url | text | Official URL |

### `knowledge_documents`
Knowledge base with embeddings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| title | text | Document title |
| content | text | Document content |
| embedding | vector(1536) | Content embedding |
| document_type | text | Type classification |
| jurisdiction | text | Jurisdiction |
| uploaded_by | uuid | FK to profiles |

---

## Key Indexes

All foreign key columns have indexes. Additional performance indexes:

- `profiles(subscription_tier)` - For tier filtering
- `chat_messages(user_id, created_at)` - For chat history queries
- `lawyer_profiles(jurisdiction, practice_areas)` - For lawyer search
- `arizona_statutes` - HNSW index on embedding for vector search

---

## Row Level Security Summary

| Table | Policy |
|-------|--------|
| profiles | Users can only access own profile; admins can access all |
| chat_messages | Users can only access own messages |
| cases | Users can only access own cases |
| documents | Users can only access own documents |
| lawyer_profiles | Public read access |
| lso_* tables | Organization-scoped access |
| admin_* tables | Admin-only access |

---

## Database Functions

Key functions available:

- `check_free_tier_limit(session_token)` - Check if free tier exceeded
- `increment_free_chat_count(session_token)` - Increment question count
- `match_arizona_statutes(query_embedding, match_count)` - Vector similarity search

---

## Migrations

All migrations are in `supabase/migrations/`. There are 100+ migrations managing:
- Table creation
- RLS policies
- Index optimization
- Data population
- Schema updates

To view migrations: Check Supabase Dashboard > Database > Migrations
