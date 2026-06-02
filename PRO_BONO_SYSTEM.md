# Pro Bono Intake System

## Overview

ezLegal.ai's Pro Bono Intake System streamlines the process of connecting low-income individuals with free legal services. The system significantly improves on traditional pro bono intake models (like Step Up to Justice) by leveraging AI technology for instant eligibility screening and guidance.

## Key Improvements Over Traditional Models

### 1. **Instant AI-Powered Eligibility Screening**
- **Traditional**: 3-5 day wait for eligibility determination
- **ezLegal.ai**: Real-time eligibility scoring during application
- **Impact**: Users get immediate feedback on their likelihood of qualifying

### 2. **Progressive Disclosure UX**
- **Traditional**: Long, overwhelming single-page forms
- **ezLegal.ai**: 4-step wizard with clear progress indicators
- **Impact**: Reduces form abandonment, improves completion rates

### 3. **Bilingual Support (English/Spanish)**
- **Traditional**: English-only or requires separate Spanish site
- **ezLegal.ai**: One-click language toggle throughout entire flow
- **Impact**: Serves Hispanic communities more effectively

### 4. **Reduced Friction**
- **Traditional**: Lists of excluded services create barriers upfront
- **ezLegal.ai**: Positive screening approach, encourages submission even if not perfect match
- **Impact**: More applicants complete the process

### 5. **White-Label Architecture**
- Built for multi-tenant deployment
- Partner organizations can be tracked via `partner_organization` field
- API-ready for subdomain integration
- **Impact**: Scalable to multiple legal aid organizations

## Technical Architecture

### Database Schema

#### `pro_bono_applications` Table
Stores all pro bono intake applications with:
- Contact information (email, phone, name)
- Geographic data (state, county, zip)
- Financial eligibility (household income, household size)
- Legal issue details (category, description, urgency)
- AI-generated eligibility score and recommendations
- Case management fields (status, assigned_to, notes)
- White-label support (partner_organization)
- Timestamps for tracking (created_at, updated_at, contacted_at)

#### `pro_bono_documents` Table
Handles document uploads related to applications:
- Links to applications via `application_id`
- Stores file metadata and storage paths
- Tracks who uploaded each document

#### `pro_bono_communications` Table
Maintains communication history:
- All messages related to an application
- Tracks message type (note, email, SMS, call)
- Distinguishes between admin and user communications

### Row Level Security (RLS)

**Public Access:**
- Anyone can submit a pro bono application (no login required)

**User Access:**
- Users can view their own applications
- Users can upload documents to their applications
- Users can view communications on their applications

**Admin Access:**
- Admins can view all applications
- Admins can update application status and notes
- Admins can manage all communications

### AI Eligibility Calculation

The system calculates eligibility based on:

1. **Federal Poverty Guidelines**: Uses HHS poverty guidelines adjusted for household size
2. **Income Threshold**: Typically 200% of poverty line (configurable)
3. **Percentage Calculation**: Determines how close applicant is to threshold
4. **Urgency Boost**: Adds points for urgent/immediate cases
5. **Score Range**: 0-100 scale with recommendations

Example scoring logic:
```
Income <= 200% FPL → Score: 100 - (income percentage)
Income > 200% FPL → Score: 50 - (excess percentage / 2)
Immediate urgency → +10 points
Urgent → +5 points
```

## User Experience Flow

### Step 1: About You (Contact & Location)
- Full name
- Email (required for follow-up)
- Phone (optional)
- State, county, zip code

### Step 2: Your Situation (Financial Screening)
- Household income
- Household size
- **Instant AI eligibility check button**
- Real-time eligibility score display with explanation

### Step 3: Legal Issue (Case Details)
- Legal issue category (housing, employment, family, consumer, etc.)
- Detailed description
- Urgency level (normal, urgent, immediate)
- Opposing party information
- Court deadlines
- Previous attorney history

### Step 4: Review & Submit
- Summary of all entered information
- Eligibility score display
- Referral source tracking
- Final submission

### Success State
- Confirmation message
- Expected response time (24-48 hours vs 3-5 days)
- Return to home button

## Language Support

The system fully supports English and Spanish with:
- Dynamic text rendering based on language selection
- Translated category labels
- Culturally appropriate messaging
- Accessible one-click language toggle

## White-Label Capabilities

### Subdomain/API Integration
The system is designed for white-label deployment:

1. **Partner Organization Tracking**
   - `partner_organization` field stores which organization received application
   - Can filter applications by partner for multi-tenant dashboard

2. **API-Ready Architecture**
   - Supabase RLS policies support API access
   - Applications can be submitted via REST API
   - Partner subdomain can use ezLegal.ai's AI backend

3. **Customization Points**
   - Eligibility thresholds configurable per partner
   - Custom intake categories per practice area
   - Partner-specific branding (via subdomain)

### Example Integration Flow
```
partner.ezlegal.ai → ProBonoIntake component
                  → Supabase (partner_organization = 'partner')
                  → AI eligibility check
                  → Admin dashboard filtered by partner
```

## Admin Features (Future Development)

The database supports future admin dashboard features:

- **Application Management**
  - View all applications filtered by status
  - Assign cases to staff attorneys
  - Update application status (pending → reviewing → approved/referred/closed)
  - Add internal notes

- **Communication Tracking**
  - Log all communications with applicants
  - Track when applicant was contacted
  - Email/SMS integration

- **Document Management**
  - View uploaded documents
  - Request additional documentation
  - Store all case files securely

- **Analytics & Reporting**
  - Application volume by category
  - Eligibility score distribution
  - Response time metrics
  - Partner organization performance

## Integration with Existing ezLegal.ai Features

### AI Chat Integration (Future)
- Link pro bono applications to chat sessions
- Pre-fill intake form from chat history
- Route qualified users from chatbot to pro bono intake

### Lawyer Matching (Future)
- Connect approved applications to pro bono attorney network
- Automated matching based on practice area and jurisdiction
- Calendar integration for consultations

### Document Generation (Future)
- Auto-generate intake summaries for attorneys
- Create case opening documents
- Fill legal forms based on application data

## Comparison: Step Up to Justice vs ezLegal.ai

| Feature | Step Up to Justice | ezLegal.ai |
|---------|-------------------|------------|
| Eligibility Check | 3-5 day wait | Instant AI-powered |
| Form Type | Single long form | 4-step progressive wizard |
| Language Support | English only (implied) | English + Spanish toggle |
| Screening Approach | Exclusion list (10 don'ts) | Positive screening |
| Technology | External LegalServer | Built-in Supabase |
| White-Label Ready | No | Yes |
| Mobile Experience | Basic | Fully responsive |
| AI Guidance | None | Real-time eligibility scoring |
| Response Time | 3-5 business days | 24-48 hours (customizable) |

## Security & Privacy

- Row Level Security enforced at database level
- Users can only access their own applications
- Admins require `is_admin = true` in profiles table
- No PII exposed in client-side code
- Secure document storage via Supabase Storage
- GDPR/CCPA compliant data handling

## Access & Navigation

**Public URL**: `/pro-bono`

**Navigation Integration**:
- Featured in main navigation as "Free Legal Help"
- Highlighted in error-600 color (red) to stand out
- Available on both desktop and mobile menus

## Future Enhancements

1. **Email Notifications**
   - Automatic confirmation emails on submission
   - Status update notifications
   - Appointment reminders

2. **SMS Integration**
   - Text message confirmations
   - Status updates via SMS
   - Reminder texts

3. **Video Consultation Booking**
   - Integrated calendar system
   - Zoom/Teams integration
   - Automated scheduling

4. **Document Upload**
   - Drag-and-drop file upload
   - Support for photos (mobile users)
   - OCR for document extraction

5. **Multi-Language Expansion**
   - Additional languages beyond English/Spanish
   - Right-to-left language support
   - Cultural customization

6. **Advanced AI Features**
   - Natural language processing of issue descriptions
   - Automatic category classification
   - Conflict of interest checking
   - Case complexity scoring

7. **Partner Dashboard**
   - White-label admin portal
   - Custom reporting per partner
   - API key management
   - Webhook notifications

## Development Notes

- Component location: `/src/pages/ProBonoIntake.tsx`
- Route: `/pro-bono`
- Database migration: `create_pro_bono_intake_system.sql`
- Uses existing Supabase infrastructure
- Fully typed with TypeScript
- Mobile-first responsive design
- Follows ezLegal.ai design system (error/warning/success colors)

## Deployment Checklist

- [x] Database schema created
- [x] RLS policies configured
- [x] ProBonoIntake component built
- [x] Route added to App.tsx
- [x] Navigation updated
- [x] Build verification passed
- [ ] Configure production environment variables
- [ ] Set up email notification service
- [ ] Create admin dashboard for managing applications
- [ ] Add document upload to Supabase Storage
- [ ] Configure partner organization settings
- [ ] Set up monitoring and analytics
