# ezLegal.ai - Team Access Guide

> **For**: PureLogics and LegalBreeze Development Teams
> **Project**: ezLegal.ai Prototype Redesign

---

## 1. Project Access (bolt.new)

### View the Live Prototype
```
https://bolt.new/~/nb1-ousdyk4
```

### To Get Your Own Copy
1. Open the bolt.new link above
2. Click "Fork" to create your own copy
3. You can then make changes in your forked version

---

## 2. Supabase Database Access

### Dashboard URL
```
https://supabase.com/dashboard/project/qwzpcswjlhxbsghbnkrn
```

### Project Credentials

| Key | Value |
|-----|-------|
| **Project Ref** | `qwzpcswjlhxbsghbnkrn` |
| **API URL** | `https://qwzpcswjlhxbsghbnkrn.supabase.co` |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3enBjc3dqbGh4YnNnaGJua3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzY5NjEsImV4cCI6MjA4MTg1Mjk2MX0.IHrONkFXDrCcNf0D_7yzrWnyBgU7-1Nqp-MfPropOBc` |

### To Get Team Access to Supabase

**Option A: Request Access from Project Owner**
1. The project owner goes to Supabase Dashboard
2. Organization Settings > Team
3. Click "Invite" and enter your email
4. You'll receive an email invitation

**Option B: Use the Credentials Directly**
- Use the credentials above to connect from your local development environment
- These are the anonymous/public keys (safe to use in frontend)

---

## 3. Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git (optional, for version control)

### Step-by-Step Setup

```bash
# 1. Download the project from bolt.new
#    (Use the download/export option in bolt.new)

# 2. Navigate to project directory
cd ezlegal-prototype

# 3. Install dependencies
npm install

# 4. Create environment file
#    Create a file named ".env" with:
```

**.env file contents:**
```env
VITE_SUPABASE_URL=https://qwzpcswjlhxbsghbnkrn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3enBjc3dqbGh4YnNnaGJua3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzY5NjEsImV4cCI6MjA4MTg1Mjk2MX0.IHrONkFXDrCcNf0D_7yzrWnyBgU7-1Nqp-MfPropOBc
```

```bash
# 5. Start development server
npm run dev

# 6. Open in browser
#    http://localhost:5173
```

---

## 4. What You Have Access To

### Frontend Application
- Complete React/TypeScript codebase
- All UI components and pages
- Routing and navigation
- Authentication flows

### Supabase Backend
- **Database**: PostgreSQL with 40+ tables
- **Auth**: Email/password authentication
- **Edge Functions**: 7 serverless functions
- **Storage**: File upload buckets

### Edge Functions (Serverless APIs)

| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `openai-chat` | AI chatbot responses | No |
| `legalbreeze-rag` | Legal research with RAG | Yes |
| `outcome-prediction` | Case outcome predictions | Yes |
| `grant-report` | Generate grant reports | Yes |
| `embed-widget` | Embeddable chat widget | No |
| `send-legal-guide` | Email legal guides | Yes |
| `ars-scraper` | Arizona statute data | Yes |

---

## 5. Key Areas to Review

### AI Integration
- `supabase/functions/openai-chat/index.ts` - Main chat AI
- `supabase/functions/legalbreeze-rag/index.ts` - RAG search
- `src/pages/Chatbot.tsx` - Chat UI
- `src/services/chat-service.ts` - Chat business logic

### Authentication
- `src/contexts/AuthContext.tsx` - Auth state
- `src/pages/Login.tsx` - Login page
- `src/pages/Signup.tsx` - Registration

### Database Schema
- `supabase/migrations/` - All database migrations
- Review table structures and RLS policies

### Lawyer Matching
- `src/components/LawyerMatchingWidget.tsx`
- `src/data/arizonaLawyers.ts`
- `src/pages/LawyerProfiles.tsx`

---

## 6. Testing the Application

### Create a Test Account
1. Go to `/signup` in the app
2. Register with any email (no verification required)
3. Log in and explore the dashboard

### Test the AI Chat
1. Go to `/chatbot` or `/simple-chatbot`
2. Ask a legal question (e.g., "What are tenant rights in Arizona?")
3. AI will respond with jurisdiction-aware guidance

### Admin Access

**Option 1: Using the Admin UI (Recommended)**
1. Have an existing admin log in and go to `/admin`
2. Click on "Admin Team Access" in the sidebar
3. Search for the user and click "Grant Admin"
4. User must log out and log back in to see admin access

**Option 2: Using Supabase Dashboard**
1. Go to Supabase Dashboard > Table Editor
2. Find the `profiles` table
3. Set `is_admin = true` for your user record
4. User must log out and log back in

---

## 7. Making Changes

### Frontend Changes
- Edit files in `src/` directory
- Changes hot-reload automatically

### Database Changes
- Create new migration files in `supabase/migrations/`
- Apply via Supabase Dashboard SQL Editor

### Edge Function Changes
- Edit files in `supabase/functions/`
- Deploy via Supabase Dashboard or CLI

---

## 8. Important Notes

1. **This is a prototype** - Not connected to production data
2. **Database has sample data** - 10 Arizona lawyers, sample chat history
3. **OpenAI integration is live** - AI chat works with real API
4. **RLS is enabled** - All tables have row-level security

---

## 9. Getting Help

### Documentation Files in Project
- `DEVELOPER_GUIDE.md` - Full technical documentation
- `API_INTEGRATION_SPECIFICATION.md` - API details
- `SECURITY_FIXES_APPLIED.md` - Security implementations
- `PRO_BONO_SYSTEM.md` - Pro bono feature docs

### Supabase Resources
- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 10. Quick Reference

| What | Where |
|------|-------|
| Frontend Code | `src/` |
| Database Migrations | `supabase/migrations/` |
| Edge Functions | `supabase/functions/` |
| Environment Vars | `.env` |
| Supabase Dashboard | [Link](https://supabase.com/dashboard/project/qwzpcswjlhxbsghbnkrn) |
| bolt.new Project | [Link](https://bolt.new/~/nb1-ousdyk4) |
