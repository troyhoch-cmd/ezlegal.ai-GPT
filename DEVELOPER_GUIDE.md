# ezLegal.ai Prototype Redesign - Developer Guide

> **Project**: ezLegal.ai Prototype Redesign
> **Status**: Development / Pre-Production
> **Last Updated**: January 2026

---

## Quick Start

```bash
# 1. Clone or download the project from bolt.new
# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open http://localhost:5173
```

---

## Project Overview

ezLegal.ai is an AI-powered legal assistance platform designed to provide accessible legal guidance to consumers and small businesses who cannot afford traditional legal services. The platform combines conversational AI with attorney matching, document generation, and legal research capabilities.

### Key Features

- **AI Legal Assistant**: OpenAI-powered chatbot with jurisdiction-aware responses
- **Attorney Matching**: Connect users with verified Arizona attorneys
- **Document Generation**: Court-ready legal document templates
- **Legal Research**: RAG-powered legal research with citation provenance
- **Pro Bono Intake**: Income-qualified pro bono case routing
- **Multi-tenant Support**: Embeddable widget for partner organizations
- **Grant Reporting**: Automated reporting for legal aid funding

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **Auth** | Supabase Auth (email/password) |
| **AI** | OpenAI GPT-4 via Edge Functions |
| **Storage** | Supabase Storage |

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://qwzpcswjlhxbsghbnkrn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3enBjc3dqbGh4YnNnaGJua3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzY5NjEsImV4cCI6MjA4MTg1Mjk2MX0.IHrONkFXDrCcNf0D_7yzrWnyBgU7-1Nqp-MfPropOBc
```

### Edge Function Secrets (Supabase Dashboard)

These are already configured in the Supabase project:
- `OPENAI_API_KEY` - Required for AI chat functionality
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase

---

## Available Scripts

```bash
npm run dev       # Start development server (port 5173)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run typecheck # TypeScript type checking
```

---

## Project Structure

```
ezlegal-prototype/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── charts/          # Data visualization components
│   │   └── dashboards/      # Admin dashboard modules
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx  # Authentication state
│   │   ├── LanguageContext.tsx
│   │   └── TenantContext.tsx
│   ├── data/                # Static data (lawyers, jurisdictions)
│   ├── lib/                 # Utilities and API clients
│   │   ├── supabase.ts      # Supabase client singleton
│   │   └── legalbreeze-api.ts
│   ├── pages/               # Route components
│   ├── services/            # Business logic services
│   ├── App.tsx              # Main app with routing
│   └── main.tsx             # Entry point
├── supabase/
│   ├── functions/           # Edge Functions (serverless)
│   │   ├── openai-chat/     # AI chatbot endpoint
│   │   ├── legalbreeze-rag/ # RAG search endpoint
│   │   ├── outcome-prediction/
│   │   ├── grant-report/
│   │   ├── embed-widget/
│   │   └── send-legal-guide/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

---

## Supabase Access

### Dashboard URL
```
https://supabase.com/dashboard/project/qwzpcswjlhxbsghbnkrn
```

### Project Reference
```
qwzpcswjlhxbsghbnkrn
```

### API Endpoint
```
https://qwzpcswjlhxbsghbnkrn.supabase.co
```

### To Add Team Members

1. Go to Supabase Dashboard
2. Click **Organization Settings** (left sidebar)
3. Select **Team** tab
4. Click **Invite** and enter team member email
5. Assign role: **Developer** or **Admin**

---

## Database Schema Overview

### Core Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles linked to auth.users | Yes |
| `chat_messages` | Authenticated user chat history | Yes |
| `free_chat_sessions` | Anonymous/free tier sessions | Yes |
| `free_chat_messages` | Anonymous chat messages | Yes |
| `cases` | User legal cases | Yes |
| `clients` | Client records (for attorneys) | Yes |
| `documents` | Generated legal documents | Yes |
| `matters` | Legal matter tracking | Yes |

### AI/ML Tables

| Table | Purpose |
|-------|---------|
| `lawyer_profiles` | Attorney directory (10 Arizona lawyers) |
| `lawyer_matches` | AI-suggested attorney matches |
| `lawyer_connections` | User-attorney connection requests |
| `ai_response_provenance` | RAG citation tracking |
| `outcome_predictions` | Case outcome predictions |
| `arizona_statutes` | ARS legal database with embeddings |

### Analytics Tables

| Table | Purpose |
|-------|---------|
| `openai_usage_logs` | Token usage tracking |
| `chat_audit_logs` | Compliance audit trail |
| `lso_audit_logs` | Legal Services Organization audits |
| `analytics_events` | User behavior analytics |
| `conversion_events` | Signup funnel tracking |

### Pro Bono System

| Table | Purpose |
|-------|---------|
| `pro_bono_applications` | Income-qualified applications |
| `eligibility_screenings` | FPL calculation results |

---

## Edge Functions

All Edge Functions are deployed and active:

| Function | Endpoint | Auth | Purpose |
|----------|----------|------|---------|
| `openai-chat` | `/functions/v1/openai-chat` | No | AI chatbot responses |
| `legalbreeze-rag` | `/functions/v1/legalbreeze-rag` | Yes | RAG legal research |
| `outcome-prediction` | `/functions/v1/outcome-prediction` | Yes | Case outcome AI |
| `grant-report` | `/functions/v1/grant-report` | Yes | Generate grant reports |
| `embed-widget` | `/functions/v1/embed-widget` | No | Embeddable chat widget |
| `send-legal-guide` | `/functions/v1/send-legal-guide` | Yes | Email legal guides |
| `ars-scraper` | `/functions/v1/ars-scraper` | Yes | Arizona statute scraping |

### Calling Edge Functions

```typescript
// From frontend
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-chat`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'What are my tenant rights?' }),
  }
);
```

---

## Authentication

The app uses Supabase Auth with email/password authentication.

### Key Files
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/pages/Login.tsx` - Login page
- `src/pages/Signup.tsx` - Registration page
- `src/pages/ForgotPassword.tsx` - Password reset

### Test Accounts

Create test accounts via the Signup page or Supabase Dashboard:
1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password

---

## Key Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home.tsx | Landing page with value prop |
| `/chatbot` | Chatbot.tsx | Full AI assistant experience |
| `/simple-chatbot` | SimpleChatbot.tsx | Lightweight chat interface |
| `/dashboard` | Dashboard.tsx | User dashboard |
| `/admin` | Admin.tsx | Admin panel (requires admin role) |
| `/lawyer-profiles` | LawyerProfiles.tsx | Attorney directory |
| `/pro-bono-intake` | ProBonoIntake.tsx | Pro bono application |
| `/grant-reporting` | GrantReporting.tsx | LSO reporting dashboard |

---

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Making Database Changes

1. Create migration file in `supabase/migrations/`
2. Use naming convention: `YYYYMMDDHHMMSS_description.sql`
3. Test locally, then apply via Supabase MCP or Dashboard

### Deploying Edge Functions

Edge Functions are managed through the Supabase Dashboard or MCP tools. The source code is in `supabase/functions/`.

---

## Security Notes

- All tables have Row Level Security (RLS) enabled
- User data is scoped by `auth.uid()`
- Admin functions require `is_admin = true` in profiles
- Edge Functions validate JWT tokens where applicable
- Sensitive operations use service role key (server-side only)

---

## Troubleshooting

### "Unable to connect to Supabase"
- Verify `.env` file exists with correct values
- Check that `VITE_` prefix is present on env vars

### "RLS policy violation"
- User may not be authenticated
- Check that user has appropriate permissions
- Review RLS policies in Supabase Dashboard

### Edge Function errors
- Check Supabase Dashboard > Edge Functions > Logs
- Verify OPENAI_API_KEY secret is set
- Check CORS headers in function response

---

## Contact

For questions about this prototype, contact the ezLegal.ai development team.
