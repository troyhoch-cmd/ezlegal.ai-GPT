import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, Shield, Database, Clock, Trash2, Globe,
  AlertTriangle, Scale, Users, Eye, ArrowRight
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: ReactNode;
  icon: typeof Shield;
  anchor: string;
}

function ActionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-semibold text-xs bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-full transition-colors"
    >
      {children}
      <ArrowRight className="w-3 h-3" />
    </Link>
  );
}

const faqItems: FaqItem[] = [
  {
    question: 'Are my conversations privileged or confidential?',
    answer: (
      <>
        <p>
          No. ezLegal.ai&trade; is not a law firm, and using this service does not create an attorney-client
          relationship. Your conversations are not protected by attorney-client privilege. Do not share
          information you would only share with a lawyer under privilege. If you need privileged
          communication, consult a licensed attorney directly.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionLink to="/find-attorney">Find a Licensed Attorney</ActionLink>
          <ActionLink to="/scope-disclaimers">Scope &amp; Disclaimers</ActionLink>
        </div>
      </>
    ),
    icon: Shield,
    anchor: 'privileged',
  },
  {
    question: 'Do you use my data to train AI models?',
    answer: (
      <>
        <p>
          Never. Your data is processed in inference-only mode to generate responses, then stored solely for
          your session history. It is never fed into any training pipeline, fine-tuning process, or model
          improvement workflow. This is enforced architecturally, not just by policy.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionLink to="/trust-center#data-sovereignty">Data Sovereignty Policy</ActionLink>
        </div>
      </>
    ),
    icon: Database,
    anchor: 'training',
  },
  {
    question: 'How long do you keep my data?',
    answer: (
      <>
        <p>
          Chat history is automatically deleted after 90 days. Uploaded documents are retained for 1 year,
          then automatically deleted. Free (unauthenticated) chat sessions expire after 24 hours of
          inactivity. You can request immediate deletion at any time from your profile settings.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionLink to="/dashboard/profile">Manage My Data</ActionLink>
        </div>
      </>
    ),
    icon: Clock,
    anchor: 'retention',
  },
  {
    question: 'How do I delete or export my data?',
    answer: (
      <>
        <p>
          Go to your Profile settings to export your data in JSON or CSV format, or request immediate
          deletion. You can also email privacy@ezlegal.ai to request a full data deletion, which will be
          completed within 30 days.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionLink to="/dashboard/profile">Go to Profile Settings</ActionLink>
        </div>
      </>
    ),
    icon: Trash2,
    anchor: 'delete-export',
  },
  {
    question: 'Where is my data stored?',
    answer: (
      <>
        <p>
          All data is hosted in the United States on Supabase&rsquo;s managed cloud infrastructure, which
          maintains SOC 2 Type II certification. Data is encrypted at rest (AES-256) and in transit
          (TLS 1.3). Each tenant&rsquo;s data is logically isolated and never commingled.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionLink to="/enterprise-security">View Security Details</ActionLink>
        </div>
      </>
    ),
    icon: Globe,
    anchor: 'data-location',
  },
  {
    question: 'What if the AI gives me wrong information?',
    answer: (
      <>
        <p>
          AI can make mistakes. We include citations and jurisdiction context where possible, and the AI
          will flag uncertainty. Always verify important information with a licensed attorney before acting
          on it. If you spot an error, report it through our Trust &amp; Safety reporting tool so we can
          investigate.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionLink to="/trust-center#report">Report a Concern</ActionLink>
          <ActionLink to="/how-reports-are-reviewed">How Reports Are Reviewed</ActionLink>
        </div>
      </>
    ),
    icon: AlertTriangle,
    anchor: 'wrong-info',
  },
  {
    question: 'What should I do in a legal emergency?',
    answer: (
      <>
        <p>
          If you are in immediate danger, call 911. For urgent legal matters (arrest, eviction notice,
          protective order), contact your local legal aid organization or bar association lawyer referral
          service. ezLegal.ai&trade; can help you find these resources, but it is not a substitute for
          emergency legal representation.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionLink to="/emergency-resources">Emergency Resources</ActionLink>
          <ActionLink to="/find-attorney">Find a Lawyer</ActionLink>
        </div>
      </>
    ),
    icon: Scale,
    anchor: 'emergency',
  },
  {
    question: 'How do I connect with a human lawyer?',
    answer: (
      <>
        <p>
          Browse our Lawyer Directory to find attorneys by practice area and jurisdiction, or request a
          consultation through any lawyer&rsquo;s profile. If you cannot afford an attorney, visit our
          Pro Bono Intake page or use Emergency Resources to find free legal aid in your area. You can
          also contact our support team for a referral.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionLink to="/find-attorney">Browse Lawyer Directory</ActionLink>
          <ActionLink to="/pro-bono">Pro Bono Legal Help</ActionLink>
          <ActionLink to="/contact">Contact Support</ActionLink>
        </div>
      </>
    ),
    icon: Users,
    anchor: 'connect-lawyer',
  },
  {
    question: 'How does attorney matching and ranking work?',
    answer: (
      <>
        <p>
          When ezLegal.ai&trade; suggests connecting with an attorney, matches are based on practice area,
          jurisdiction, availability, and user ratings. We do not accept payment from attorneys to influence
          ranking or placement. Our directory includes verified profiles from attorneys who have opted into
          the platform. ezLegal.ai&trade; does not endorse, guarantee, or vouch for any attorney &mdash;
          you should independently verify credentials and disciplinary history.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ActionLink to="/find-attorney">View Lawyer Directory</ActionLink>
          <ActionLink to="/ai-governance">AI Governance Policy</ActionLink>
        </div>
      </>
    ),
    icon: Eye,
    anchor: 'attorney-matching',
  },
];

export default function TrustFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-10 bg-white border-b border-navy-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-navy-900">Quick Answers</h2>
          <p className="text-navy-600 text-sm mt-1">
            The most common trust and safety questions, answered plainly.
          </p>
        </div>

        <div className="space-y-2">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const Icon = item.icon;
            const btnId = `faq-btn-${item.anchor}`;
            const regionId = `faq-answer-${item.anchor}`;

            return (
              <div
                key={item.anchor}
                id={`faq-${item.anchor}`}
                className={`border rounded-xl transition-all duration-200 ${
                  isOpen
                    ? 'border-teal-300 bg-teal-50/50 shadow-sm'
                    : 'border-navy-200 bg-white hover:border-navy-300'
                }`}
              >
                <button
                  id={btnId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                  aria-controls={regionId}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'text-teal-600' : 'text-navy-400'}`} />
                  <span className="flex-1 font-semibold text-navy-900 text-sm sm:text-base">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-navy-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>
                <div
                  id={regionId}
                  role="region"
                  aria-labelledby={btnId}
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[80rem] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-4 pl-13">
                    <div className="text-navy-700 text-sm leading-relaxed ml-8">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
