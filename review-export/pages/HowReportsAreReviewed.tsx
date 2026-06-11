import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Users,
  FileSearch,
  Scale,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Flag,
  Lock,
  Database,
  Eye,
  Trash2,
  Gavel
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const REVIEW_STEPS = [
  {
    number: 1,
    title: 'Receipt & Acknowledgment',
    description: 'When you submit a report, our system immediately logs it with a unique identifier. You will receive an automated confirmation email within minutes.',
    metaIcon: Clock,
    metaText: 'Automated acknowledgment: typically under 5 minutes',
  },
  {
    number: 2,
    title: 'Automated Triage',
    description: 'Our system categorizes reports by type and severity. Crisis-related reports are immediately flagged for human review, while accuracy concerns are queued for specialist evaluation.',
    priorities: [
      { label: 'Priority 1', value: 'Safety concerns', color: 'red' },
      { label: 'Priority 2', value: 'Legal accuracy', color: 'amber' },
      { label: 'Priority 3', value: 'Citation issues', color: 'teal' },
      { label: 'Priority 4', value: 'General feedback', color: 'navy' },
    ],
  },
  {
    number: 3,
    title: 'Human Review',
    description: 'A trained reviewer examines the reported AI response, the context of the conversation, and any relevant legal sources. For legal accuracy concerns, our review team includes individuals with legal training.',
    metaIcon: Users,
    metaText: 'All reports reviewed by qualified staff within 1-2 business days',
  },
  {
    number: 4,
    title: 'Source Verification',
    description: 'For accuracy-related reports, we verify the AI\'s response against our trusted legal source database. We check statute citations, case law references, and jurisdictional applicability.',
    metaIcon: FileSearch,
    metaText: 'Cross-referenced with official state and federal databases',
  },
  {
    number: 5,
    title: 'Resolution & System Improvement',
    description: 'If an issue is confirmed, we take corrective action: updating our knowledge base, adjusting prompt constraints, or flagging patterns for model improvement. You will receive an email update on the outcome.',
    metaIcon: CheckCircle2,
    metaText: 'Reporter notified within 5 business days of submission',
  },
] as const;

const REVIEW_CATEGORIES = [
  {
    icon: Scale,
    title: 'Legal Accuracy',
    items: ['Correct statute citations', 'Accurate case law references', 'Proper jurisdictional context', 'Current law (not outdated)'],
  },
  {
    icon: ShieldCheck,
    title: 'Safety & Ethics',
    items: ['Appropriate disclaimers present', 'No harmful advice given', 'Crisis resources offered when needed', 'Attorney referral when appropriate'],
  },
  {
    icon: Users,
    title: 'Bias & Fairness',
    items: ['Neutral, unbiased language', 'No discriminatory content', 'Balanced presentation of options', 'Culturally sensitive responses'],
  },
  {
    icon: FileSearch,
    title: 'Source Integrity',
    items: ['Citations link to real sources', 'Quotes accurately represented', 'No fabricated references', 'Provenance tracking intact'],
  },
] as const;

const PRIORITY_COLORS: Record<string, { bg: string; label: string; value: string }> = {
  red: { bg: 'bg-red-50', label: 'text-red-700', value: 'text-red-600' },
  amber: { bg: 'bg-amber-50', label: 'text-amber-700', value: 'text-amber-600' },
  teal: { bg: 'bg-teal-50', label: 'text-teal-700', value: 'text-teal-600' },
  navy: { bg: 'bg-navy-50', label: 'text-navy-700', value: 'text-navy-600' },
};

function QuickActions() {
  return (
    <nav aria-label="Quick actions" className="bg-white border border-navy-200 rounded-xl p-4 mb-10">
      <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
        <span className="text-sm font-medium text-navy-500 mr-1">Quick actions:</span>
        <Link
          to="/trust-center#report"
          className="inline-flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          Submit a Report
        </Link>
        <Link
          to="/emergency-resources"
          className="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          Crisis Resources
        </Link>
        <Link
          to="/find-attorney"
          className="inline-flex items-center gap-1.5 bg-white text-navy-700 px-4 py-2 rounded-lg text-sm font-medium border border-navy-300 hover:bg-navy-50 transition-colors"
        >
          <Gavel className="w-3.5 h-3.5" />
          Find a Lawyer
        </Link>
      </div>
    </nav>
  );
}

function ReviewStepCard({ step }: { step: typeof REVIEW_STEPS[number] }) {
  return (
    <li className="bg-white rounded-xl border border-navy-200 p-6">
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <span className="text-navy-700 font-bold">{step.number}</span>
        </div>
        <div>
          <h3 className="font-semibold text-navy-900 mb-2">{step.title}</h3>
          <p className="text-navy-600 text-sm mb-3">{step.description}</p>
          {'priorities' in step && step.priorities && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {step.priorities.map((p) => {
                const colors = PRIORITY_COLORS[p.color];
                return (
                  <div key={p.label} className={`${colors.bg} rounded-lg p-3`}>
                    <span className={`${colors.label} font-medium`}>{p.label}:</span>
                    <span className={`${colors.value} ml-1`}>{p.value}</span>
                  </div>
                );
              })}
            </div>
          )}
          {'metaIcon' in step && step.metaIcon && (
            <div className="flex items-center gap-2 text-sm text-navy-500">
              <step.metaIcon className="w-4 h-4" aria-hidden="true" />
              <span>{step.metaText}</span>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function ReportDataSection() {
  const dataItems = [
    { icon: Database, title: 'What we collect', description: 'Your report description, the category you select, and the AI conversation you flag. If you are signed in, your account email is attached so we can follow up. Anonymous reports are accepted but limit our ability to respond.' },
    { icon: Eye, title: 'Who can access it', description: 'Reports are visible only to the ezLegal Trust & Safety team. They are not shared with other users, third-party services, or external organizations unless a credible, imminent threat of physical harm requires emergency-service contact (see escalation policy above).' },
    { icon: Lock, title: 'How it is secured', description: 'Reports are stored in our encrypted database with row-level security. Access is logged and auditable. Only authorized Trust & Safety personnel with multi-factor authentication can view report details.' },
    { icon: Trash2, title: 'How long it is retained', description: 'Reports are retained for 12 months after resolution to support pattern analysis and AI improvement. After 12 months, personally identifiable information is removed; anonymized data may be retained for aggregate safety metrics.' },
  ];

  return (
    <section className="mb-12" aria-labelledby="report-data-heading">
      <h2 id="report-data-heading" className="text-2xl font-bold text-navy-900 mb-6">What Data Is Included in a Report</h2>
      <div className="space-y-4">
        {dataItems.map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-navy-200 p-5">
            <div className="flex gap-4">
              <item.icon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">{item.title}</h3>
                <p className="text-navy-600 text-sm">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HowReportsAreReviewed() {
  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <header className="bg-navy-900 text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <span className="text-teal-400 font-medium">Trust & Safety</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">How Reports Are Reviewed</h1>
          <p className="text-xl text-navy-300 max-w-2xl">
            Our commitment to transparency means you know exactly how we handle concerns about AI responses, content accuracy, and user safety.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6" role="alert">
          <div className="flex gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-amber-900 mb-1">Immediate Escalation</h2>
              <p className="text-amber-800 text-sm mb-3">
                Reports indicating a credible, imminent threat of physical harm to any person are escalated immediately to our Trust & Safety team and, if necessary, to emergency services (e.g., 911 or 988 Suicide & Crisis Lifeline).
              </p>
              <div className="bg-amber-100/60 rounded-lg p-3 text-sm text-amber-900 space-y-1.5">
                <p className="font-medium">What this means for your privacy:</p>
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  <li>Only situations involving imminent physical harm may involve outside contact</li>
                  <li>Routine reports about AI accuracy, bias, or general concerns are never shared outside ezLegal</li>
                  <li>Your immigration status, legal questions, and personal details are never reported to law enforcement</li>
                  <li>If escalation occurs, only the minimum information necessary is shared</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <QuickActions />

        <section className="mb-12" aria-labelledby="review-process-heading">
          <h2 id="review-process-heading" className="text-2xl font-bold text-navy-900 mb-6">Review Process Overview</h2>
          <ol className="space-y-6 list-none p-0" role="list">
            {REVIEW_STEPS.map((step) => (
              <ReviewStepCard key={step.number} step={step} />
            ))}
          </ol>
        </section>

        <section className="mb-12" aria-labelledby="review-categories-heading">
          <h2 id="review-categories-heading" className="text-2xl font-bold text-navy-900 mb-6">What We Review For</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {REVIEW_CATEGORIES.map((cat) => (
              <div key={cat.title} className="bg-white rounded-xl border border-navy-200 p-5">
                <cat.icon className="w-5 h-5 text-teal-600 mb-3" aria-hidden="true" />
                <h3 className="font-semibold text-navy-900 mb-2">{cat.title}</h3>
                <ul className="text-sm text-navy-600 space-y-1.5">
                  {cat.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <ReportDataSection />

        <section className="mb-12" aria-labelledby="commitments-heading">
          <h2 id="commitments-heading" className="text-2xl font-bold text-navy-900 mb-6">Our Commitments</h2>
          <div className="bg-white rounded-xl border border-navy-200 p-6">
            <ul className="space-y-4 list-none p-0">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-medium text-navy-900">Transparency:</span>
                  <span className="text-navy-600 ml-1">We tell you what we found and what action we took</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-medium text-navy-900">No Retaliation:</span>
                  <span className="text-navy-600 ml-1">Your account is never penalized for good-faith reports</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-medium text-navy-900">Continuous Improvement:</span>
                  <span className="text-navy-600 ml-1">Reports directly inform our AI safety and accuracy work</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-medium text-navy-900">Human Oversight:</span>
                  <span className="text-navy-600 ml-1">Every report is reviewed by a real person, not just algorithms</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-12" aria-labelledby="submit-report-heading">
          <h2 id="submit-report-heading" className="text-2xl font-bold text-navy-900 mb-6">Submit a Report</h2>
          <div className="bg-navy-100 rounded-xl p-6">
            <p className="text-navy-600 mb-4">
              If you've encountered an AI response that concerns you, we want to know. Your feedback helps us improve.
            </p>
            <p className="text-navy-500 text-sm mb-6">
              After submitting, you will receive an automated confirmation email. Our team will review your report and send you an update within 5 business days.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/trust-center#report"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Report a Concern
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:trust@ezlegal.ai"
                className="inline-flex items-center gap-2 bg-white text-navy-700 px-5 py-2.5 rounded-lg font-medium border border-navy-300 hover:bg-navy-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                trust@ezlegal.ai
              </a>
            </div>
          </div>
        </section>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6" role="alert">
          <div className="flex gap-4">
            <Phone className="w-6 h-6 text-red-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-red-900 mb-2">Immediate Safety Concerns</h2>
              <p className="text-red-800 text-sm mb-3">
                If you or someone else is in immediate danger, please contact emergency services directly.
              </p>
              <Link
                to="/emergency-resources"
                className="inline-flex items-center gap-2 text-red-700 font-medium hover:text-red-800"
              >
                View Crisis Resources
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
