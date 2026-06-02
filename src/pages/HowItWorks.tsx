import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Database, Shield, Scale, Users, Clock, AlertTriangle, CheckCircle,
  Search, FileText, MapPin, Lock, Eye, MessageSquare, BookOpen,
  ArrowRight, HelpCircle, Sparkles, Layers,
  RefreshCw, BadgeCheck, Globe, Phone, Heart, Quote, ChevronRight,
  Play, Pause, Trash2
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface SourceFreshness {
  source_key: string;
  source_name: string;
  source_type: string;
  update_frequency: string;
  last_successful_at: string | null;
  sections_count: number;
}

function formatLastUpdated(dateStr: string | null, fallbackFrequency: string): string {
  if (!dateStr) return `Updated ${fallbackFrequency}`;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `Updated ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

function getLatestUpdate(sources: SourceFreshness[], type: string): string | null {
  const matching = sources.filter(s => s.source_type === type && s.last_successful_at);
  if (matching.length === 0) return null;
  matching.sort((a, b) => new Date(b.last_successful_at!).getTime() - new Date(a.last_successful_at!).getTime());
  return matching[0].last_successful_at;
}

export default function HowItWorks() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [activeRAGStep, setActiveRAGStep] = useState(0);
  const [sourceFreshness, setSourceFreshness] = useState<SourceFreshness[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('process');

  const sections = [
    { id: 'process', label: en ? 'Process' : 'Proceso' },
    { id: 'rag-demo', label: en ? 'AI Demo' : 'Demo IA' },
    { id: 'sources', label: en ? 'Sources' : 'Fuentes' },
    { id: 'jurisdiction', label: en ? 'Jurisdiction' : 'Jurisdicción' },
    { id: 'attorney-review', label: en ? 'Review' : 'Revisión' },
    { id: 'safety', label: en ? 'Safety' : 'Seguridad' },
    { id: 'citation-policy', label: en ? 'Citations' : 'Citas' },
    { id: 'hallucination-mitigation', label: en ? 'Accuracy' : 'Precisión' },
    { id: 'escalation-logic', label: en ? 'Escalation' : 'Escalación' },
    { id: 'privacy-handling', label: en ? 'Privacy' : 'Privacidad' },
  ];

  useEffect(() => {
    supabase.rpc('get_source_freshness').then(({ data }) => {
      if (data) setSourceFreshness(data as SourceFreshness[]);
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const ragDemoSteps = [
    {
      step: 1,
      title: 'User Question',
      content: '"My landlord hasn\'t returned my security deposit after 45 days. I\'m in California. What can I do?"',
      visual: 'question',
    },
    {
      step: 2,
      title: 'Jurisdiction & Classification',
      content: 'Identified: California | Practice Area: Landlord-Tenant | Issue: Security Deposit Return | Timeframe: 45 days post-moveout',
      visual: 'analysis',
    },
    {
      step: 3,
      title: 'Confirm Jurisdiction',
      content: 'Confirm: California + Landlord-Tenant. Not right? Change your state before we search for sources.',
      visual: 'confirmation',
    },
    {
      step: 4,
      title: 'Source Retrieval',
      content: 'Retrieved 7 relevant sources from California Civil Code and case law database...',
      visual: 'retrieval',
    },
    {
      step: 5,
      title: 'Grounded Response Generation',
      content: 'Under California law, your landlord was required to return your security deposit within 21 days...',
      visual: 'response',
    },
  ];

  const exampleResponse = {
    question: "My landlord hasn't returned my security deposit after 45 days. I'm in California. What can I do?",
    answer: `Under California law, your landlord was required to return your security deposit (or provide an itemized statement of deductions) within **21 days** of your move-out date.

Since 45 days have passed, your landlord is in violation of California Civil Code Section 1950.5. Here are your options:

**1. Send a Demand Letter**
Write a formal demand letter requesting the return of your deposit. This creates a paper trail and may prompt action.

**2. Small Claims Court**
You may sue in small claims court for:
- The amount of the deposit wrongfully withheld
- Up to **2x the deposit amount** as a "bad faith" penalty if the landlord acted in bad faith

**3. Important Deadlines**
The statute of limitations for security deposit claims in California is **4 years** from when the deposit should have been returned.`,
    citations: [
      {
        id: 1,
        text: 'Cal. Civ. Code 1950.5(g)',
        fullText: '"The landlord shall return any remaining portion of a security deposit to the tenant within 21 calendar days from the date the tenant has vacated the premises."',
        source: 'California Civil Code Section 1950.5',
        type: 'statute',
      },
      {
        id: 2,
        text: 'Cal. Civ. Code 1950.5(l)',
        fullText: '"If the landlord fails to comply with this section, the tenant may recover the security deposit, plus reasonable attorneys\' fees and costs... The bad faith of the landlord... may subject the landlord to statutory damages of up to twice the amount of the security."',
        source: 'California Civil Code Section 1950.5',
        type: 'statute',
      },
      {
        id: 3,
        text: 'Granberry v. Islay (1995)',
        fullText: 'Court held that landlord\'s failure to return deposit within statutory period creates presumption of bad faith, shifting burden to landlord to prove otherwise.',
        source: '9 Cal.4th 738 (1995)',
        type: 'case',
      },
      {
        id: 4,
        text: 'Cal. Civ. Proc. Code 337',
        fullText: 'Four-year statute of limitations for breach of written contract applies to security deposit claims.',
        source: 'California Code of Civil Procedure Section 337',
        type: 'statute',
      },
    ],
  };

  const dataSources = [
    {
      name: 'Federal Statutes & Regulations',
      description: 'U.S. Code, Code of Federal Regulations, Federal Register',
      fallbackFrequency: 'Weekly',
      sourceType: 'federal_statute',
      icon: Layers,
    },
    {
      name: 'State Statutes',
      description: 'All 50 states, D.C., and territories statutory codes',
      fallbackFrequency: 'Monthly',
      sourceType: 'state_statute',
      icon: MapPin,
    },
    {
      name: 'Case Law Databases',
      description: 'Federal and state court decisions via legal research partners',
      fallbackFrequency: 'Daily',
      sourceType: 'case_law',
      icon: Scale,
    },
    {
      name: 'Agency Guidance',
      description: 'EEOC, FTC, CFPB, DOL, and other federal agency publications',
      fallbackFrequency: 'Weekly',
      sourceType: 'agency_guidance',
      icon: FileText,
    },
    {
      name: 'Legal Aid Resources',
      description: 'Self-help guides from legal aid organizations nationwide',
      fallbackFrequency: 'Monthly',
      sourceType: 'legal_aid',
      icon: Heart,
    },
    {
      name: 'Attorney-Reviewed Content',
      description: 'Practice guides and templates reviewed by licensed attorneys',
      fallbackFrequency: 'Quarterly',
      sourceType: 'attorney_reviewed',
      icon: BadgeCheck,
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Question Analysis',
      description: 'Your question is analyzed to identify the legal domain, key issues, and relevant context.',
      details: [
        'Natural language processing extracts legal concepts',
        'Classification identifies practice area (family, employment, etc.)',
        'Entity recognition finds parties, dates, amounts, locations',
      ],
      icon: Search,
      color: 'blue',
    },
    {
      step: 2,
      title: 'Jurisdiction Matching',
      description: 'We match your question to the applicable laws based on your selected jurisdiction.',
      details: [
        'State-specific statutes and regulations are prioritized',
        'Federal law is included where applicable',
        'Local ordinances flagged when relevant',
      ],
      icon: MapPin,
      color: 'green',
    },
    {
      step: 3,
      title: 'Source Retrieval',
      description: 'Relevant legal sources are retrieved from our curated knowledge base powered by the Legalbreeze® RAG pipeline.',
      details: [
        'FAISS vector indexing matches questions to legal content',
        'Jurisdiction-specific document indices ensure relevance',
        'Citation verification validates source authenticity',
      ],
      icon: Database,
      color: 'amber',
    },
    {
      step: 4,
      title: 'Response Generation',
      description: 'AI generates a response grounded in retrieved sources with appropriate caveats.',
      details: [
        'Multi-tier LLM architecture (GPT-4 Turbo, reasoning models)',
        'Attorney-reviewed prompts guide response structure',
        'Confidence scoring determines when to recommend attorney consultation',
      ],
      icon: Brain,
      color: 'rose',
    },
    {
      step: 5,
      title: 'Safety & Compliance Check',
      description: 'Every response passes through safety filters before delivery.',
      details: [
        'Crisis keyword detection triggers immediate resources',
        'UPL guardrails prevent giving specific legal advice',
        'Bias detection flags potential fairness issues',
      ],
      icon: Shield,
      color: 'teal',
    },
  ];

  const jurisdictionProcess = [
    {
      title: 'User Selection (Primary)',
      description: 'You select your state/jurisdiction in the safety checkpoint before chatting. This is our primary method and ensures the most accurate information.',
      icon: Users,
    },
    {
      title: 'Question Context',
      description: 'If you mention a specific state in your question ("California landlord-tenant law"), we use that jurisdiction.',
      icon: MessageSquare,
    },
    {
      title: 'Saved Preferences',
      description: 'Registered users can save their default jurisdiction in profile settings.',
      icon: BookOpen,
    },
    {
      title: 'General Guidance',
      description: 'Without jurisdiction context, we provide general U.S. legal information with clear disclaimers.',
      icon: Globe,
    },
  ];

  const attorneyReviewMeaning = [
    {
      aspect: 'Prompt Engineering',
      description: 'Licensed attorneys help design the system prompts that guide AI responses, ensuring legally accurate framing and appropriate disclaimers.',
    },
    {
      aspect: 'Content Templates',
      description: 'Document templates and form guidance have been reviewed by attorneys practicing in relevant areas.',
    },
    {
      aspect: 'Ongoing Quality Review',
      description: 'Our legal team regularly audits AI responses, flagging issues and updating guidance.',
    },
    {
      aspect: 'Edge Case Training',
      description: 'Attorneys identify common misunderstandings and help train the system to handle them correctly.',
    },
  ];

  const whenToConsultAttorney = [
    {
      situation: 'Court Appearances',
      description: 'If you need to appear in court, an attorney can represent you and navigate court procedures.',
      urgency: 'high',
    },
    {
      situation: 'Complex Transactions',
      description: 'Real estate closings, business acquisitions, or contracts with significant financial stakes.',
      urgency: 'high',
    },
    {
      situation: 'Criminal Charges',
      description: 'Any criminal matter, even misdemeanors, can have lasting consequences. Get representation.',
      urgency: 'high',
    },
    {
      situation: 'Custody Disputes',
      description: 'When child custody is contested, professional advocacy protects your parental rights.',
      urgency: 'high',
    },
    {
      situation: 'Immigration Matters',
      description: 'Immigration law is complex and errors can have severe consequences including deportation.',
      urgency: 'high',
    },
    {
      situation: 'Personal Injury Claims',
      description: 'An attorney can maximize your recovery and handle insurance company negotiations.',
      urgency: 'medium',
    },
    {
      situation: 'Estate Planning',
      description: 'Ensure your will, trust, and healthcare directives are properly drafted and executed.',
      urgency: 'medium',
    },
    {
      situation: 'Business Formation',
      description: 'Getting structure right from the start can save significant costs and liability later.',
      urgency: 'medium',
    },
  ];

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />

      <main id="main-content">
        <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <Brain className="w-4 h-4 text-gold-300" />
                <span className="text-sm font-semibold">{en ? 'AI Methodology' : 'Metodología IA'}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                {en ? 'How Our AI Works' : 'Cómo Funciona Nuestra IA'}
              </h1>
              <p className="text-xl text-teal-100 mb-4">
                {en
                  ? 'Transparency about our technology, data sources, and the boundaries of AI-assisted legal information.'
                  : 'Transparencia sobre nuestra tecnología, fuentes de datos y los límites de la información legal asistida por IA.'}
              </p>
              <p className="text-navy-200">
                {en
                  ? 'We believe you deserve to understand how your legal questions are answered.'
                  : 'Creemos que mereces entender cómo se responden tus preguntas legales.'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-bold text-navy-900 mb-1">
                  {en ? 'Important: This is Legal Information, Not Legal Advice' : 'Importante: Esto es Información Legal, No Asesoramiento Legal'}
                </h2>
                <p className="text-navy-700 text-sm mb-2">
                  {en
                    ? 'ezLegal.ai gives you general legal information so you can understand your situation. We are not a law firm. Using our service does not create an attorney-client relationship, and your conversations here do not carry attorney-client privilege. For advice on your specific case, court representation, or complex matters, talk to a licensed attorney in your state.'
                    : 'ezLegal.ai te brinda información legal general para que puedas entender tu situación. No somos un bufete de abogados. Usar nuestro servicio no crea una relación abogado-cliente, y tus conversaciones aquí no tienen privilegio abogado-cliente. Para asesoramiento sobre tu caso específico, representación en tribunal o asuntos complejos, habla con un abogado con licencia en tu estado.'}
                </p>
                <p className="text-amber-700 text-xs font-medium">
                  <Link to="/trust-center" className="underline hover:text-amber-900 transition-colors">
                    {en ? 'Review our Safe Use Checklist' : 'Revisa nuestra Lista de Uso Seguro'}
                  </Link>
                  {' '}
                  {en ? 'for tips on protecting your privacy while using AI legal tools.' : 'para consejos sobre cómo proteger tu privacidad al usar herramientas legales de IA.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <nav aria-label="Page sections" className="sticky top-[64px] sm:top-[136px] z-30 bg-white/95 backdrop-blur-sm border-b border-navy-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 py-2 overflow-x-auto">
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={activeSection === id ? 'true' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(id);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      const heading = target.querySelector('h2, h3');
                      if (heading instanceof HTMLElement) {
                        heading.setAttribute('tabindex', '-1');
                        heading.focus({ preventScroll: true });
                      }
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSection === id ? 'bg-teal-600 text-white' : 'text-navy-600 hover:bg-navy-100'
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <section id="process" className="py-16 bg-white scroll-mt-40" aria-labelledby="process-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="process-heading" className="text-3xl font-bold text-navy-900 mb-4">How Your Question Becomes an Answer</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Our AI uses a Retrieval-Augmented Generation (RAG) architecture powered by the Legalbreeze® backend to ground responses in verified legal sources.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 max-w-5xl mx-auto">
              <div className="bg-navy-50 rounded-xl p-5 border border-navy-200 text-center">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-5 h-5 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-1 text-sm">You ask a question</h3>
                <p className="text-xs text-navy-600">Type your legal question in plain English -- no legal jargon needed.</p>
              </div>
              <div className="bg-navy-50 rounded-xl p-5 border border-navy-200 text-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-5 h-5 text-green-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-1 text-sm">We find your state's laws</h3>
                <p className="text-xs text-navy-600">Your question is matched to the specific laws in your state, not just general information.</p>
              </div>
              <div className="bg-navy-50 rounded-xl p-5 border border-navy-200 text-center">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Database className="w-5 h-5 text-amber-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-1 text-sm">We pull from real sources</h3>
                <p className="text-xs text-navy-600">Every answer is backed by actual statutes, regulations, and court decisions -- not made up.</p>
              </div>
              <div className="bg-navy-50 rounded-xl p-5 border border-navy-200 text-center">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-5 h-5 text-rose-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-1 text-sm">You get a cited answer</h3>
                <p className="text-xs text-navy-600">Your answer includes the exact laws cited, so you can verify everything yourself.</p>
              </div>
            </div>

            <div className="text-center mb-12">
              <p className="text-sm text-navy-500 font-medium uppercase tracking-wider">Technical Details</p>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-navy-200 -translate-x-1/2" aria-hidden="true"></div>

              <div className="space-y-12">
                {processSteps.map((step, index) => {
                  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
                    blue: { bg: 'bg-teal-100', icon: 'text-teal-600', border: 'border-teal-200' },
                    green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' },
                    amber: { bg: 'bg-amber-100', icon: 'text-amber-600', border: 'border-amber-200' },
                    rose: { bg: 'bg-rose-100', icon: 'text-rose-600', border: 'border-rose-200' },
                    teal: { bg: 'bg-teal-100', icon: 'text-teal-600', border: 'border-teal-200' },
                  };
                  const colors = colorClasses[step.color] || colorClasses.blue;

                  return (
                    <div
                      key={step.step}
                      className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                        index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                      }`}
                    >
                      <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:text-left lg:pl-16'}`}>
                        <div className={`inline-flex items-center gap-2 ${colors.bg} px-3 py-1 rounded-full mb-3`}>
                          <span className={`text-sm font-bold ${colors.icon}`}>Step {step.step}</span>
                        </div>
                        <h3 className="text-xl font-bold text-navy-900 mb-2">{step.title}</h3>
                        <p className="text-navy-600 mb-4">{step.description}</p>
                        <ul className={`space-y-2 text-sm text-navy-600 ${index % 2 === 0 ? 'lg:ml-auto lg:max-w-md' : 'lg:max-w-md'}`}>
                          {step.details.map((detail, dIndex) => (
                            <li key={dIndex} className={`flex items-start gap-2 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                              {index % 2 !== 0 && <CheckCircle className={`w-4 h-4 ${colors.icon} mt-0.5 flex-shrink-0`} aria-hidden="true" />}
                              <span>{detail}</span>
                              {index % 2 === 0 && <CheckCircle className={`w-4 h-4 ${colors.icon} mt-0.5 flex-shrink-0`} aria-hidden="true" />}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`relative z-10 w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center border-4 border-white shadow-lg`}>
                        <step.icon className={`w-8 h-8 ${colors.icon}`} aria-hidden="true" />
                      </div>

                      <div className="flex-1 hidden lg:block"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="rag-demo" className="py-16 bg-gradient-to-br from-teal-900 via-teal-800 to-navy-900 text-white scroll-mt-40" aria-labelledby="rag-demo-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
                <Sparkles className="w-4 h-4 text-teal-300" aria-hidden="true" />
                <span className="text-sm font-semibold">Interactive Demo</span>
              </div>
              <h2 id="rag-demo-heading" className="text-3xl font-bold mb-4">See RAG in Action</h2>
              <p className="text-teal-100 max-w-2xl mx-auto">
                Watch how a real question flows through our system and see the actual citations that ground the response.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">RAG Pipeline Visualization</h3>
                  <button
                    onClick={() => {
                      if (isPlaying) {
                        setIsPlaying(false);
                      } else {
                        setIsPlaying(true);
                        let step = 0;
                        const interval = setInterval(() => {
                          step++;
                          if (step >= ragDemoSteps.length) {
                            setIsPlaying(false);
                            clearInterval(interval);
                          } else {
                            setActiveRAGStep(step);
                          }
                        }, 2000);
                      }
                    }}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Play Demo
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {ragDemoSteps.map((step, index) => (
                    <button
                      key={step.step}
                      onClick={() => setActiveRAGStep(index)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        activeRAGStep === index
                          ? 'bg-white text-navy-900 shadow-lg'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                          activeRAGStep === index
                            ? 'bg-teal-600 text-white'
                            : 'bg-white/20 text-white'
                        }`}>
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold mb-1 ${activeRAGStep === index ? 'text-navy-900' : 'text-white'}`}>
                            {step.title}
                          </h4>
                          <p className={`text-sm truncate ${activeRAGStep === index ? 'text-navy-600' : 'text-white/70'}`}>
                            {step.content}
                          </p>
                        </div>
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform ${
                          activeRAGStep === index ? 'rotate-90 text-teal-600' : 'text-white/50'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Database className="w-4 h-4" />
                    <span>7 sources retrieved in 0.3 seconds</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 text-navy-900">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold">Example Question</h3>
                  </div>
                  <p className="text-navy-700 bg-navy-50 rounded-lg p-4 border border-navy-200">
                    {exampleResponse.question}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 text-navy-900">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold">AI Response with Citations</h3>
                  </div>
                  <div className="max-w-none text-navy-700 mb-6 space-y-3 text-sm leading-relaxed">
                    <p>
                      Under California law, your landlord was required to return your security deposit
                      within <strong>21 days</strong> of your move-out date.
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-5 h-4 text-[10px] font-bold text-teal-700 bg-teal-100 rounded hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 align-super ml-0.5 transition-colors"
                        aria-label="Source 1: California Civil Code Section 1950.5(g) — 21-day return requirement"
                        onClick={() => {
                          setActiveCitation(1);
                          document.getElementById('citation-1')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }}
                      >[1]</button>
                    </p>
                    <p>
                      Since 45 days have passed, your landlord is in violation of California Civil Code
                      Section 1950.5. You may sue in small claims court for the amount wrongfully withheld,
                      plus up to <strong>2x the deposit amount</strong> as a "bad faith" penalty.
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-5 h-4 text-[10px] font-bold text-teal-700 bg-teal-100 rounded hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 align-super ml-0.5 transition-colors"
                        aria-label="Source 2: California Civil Code Section 1950.5(l) — bad faith penalties"
                        onClick={() => {
                          setActiveCitation(2);
                          document.getElementById('citation-2')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }}
                      >[2]</button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-5 h-4 text-[10px] font-bold text-teal-700 bg-teal-100 rounded hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 align-super ml-0.5 transition-colors"
                        aria-label="Source 3: Granberry v. Islay (1995) — bad faith presumption"
                        onClick={() => {
                          setActiveCitation(3);
                          document.getElementById('citation-3')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }}
                      >[3]</button>
                    </p>
                    <p>
                      The statute of limitations is <strong>4 years</strong> from when the deposit should
                      have been returned.
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-5 h-4 text-[10px] font-bold text-teal-700 bg-teal-100 rounded hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 align-super ml-0.5 transition-colors"
                        aria-label="Source 4: California Code of Civil Procedure Section 337 — 4-year statute of limitations"
                        onClick={() => {
                          setActiveCitation(4);
                          document.getElementById('citation-4')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }}
                      >[4]</button>
                    </p>
                  </div>

                  <div className="border-t border-navy-200 pt-4">
                    <h4 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                      <Quote className="w-4 h-4 text-navy-400" />
                      Source Citations
                    </h4>
                    <div className="space-y-3">
                      {exampleResponse.citations.map((citation) => (
                        <div
                          key={citation.id}
                          id={`citation-${citation.id}`}
                          className={`rounded-lg p-3 border transition-colors ${
                            activeCitation === citation.id
                              ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-200'
                              : 'bg-navy-50 border-navy-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {citation.id}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-navy-900 text-sm">{citation.text}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  citation.type === 'statute'
                                    ? 'bg-teal-100 text-teal-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {citation.type === 'statute' ? 'Statute' : 'Case Law'}
                                </span>
                              </div>
                              <p className="text-xs text-navy-600 italic line-clamp-2">{citation.fullText}</p>
                              <p className="text-xs text-navy-500 mt-1">{citation.source}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-amber-50 rounded-lg px-4 py-3 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-amber-800">
                    This is legal information, not legal advice. An attorney can evaluate the specific facts of your situation and advise on the best course of action.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/80 text-sm mb-4">
                This is a simplified example. Actual responses may include more citations and nuanced legal analysis.
              </p>
              <Link
                to="/ask"
                className="inline-flex items-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Ask My Question Free
              </Link>
            </div>
          </div>
        </section>

        <section id="sources" className="py-16 bg-navy-50 scroll-mt-40" aria-labelledby="sources-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                <Database className="w-4 h-4 text-teal-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-navy-900">Data Sources</span>
              </div>
              <h2 id="sources-heading" className="text-3xl font-bold text-navy-900 mb-4">Where Our Information Comes From</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Our AI retrieves information from authoritative legal databases and resources, updated regularly to reflect current law.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataSources.map((source, index) => {
                const lastUpdated = getLatestUpdate(sourceFreshness, source.sourceType);
                const updateLabel = formatLastUpdated(lastUpdated, source.fallbackFrequency);
                const sourceCount = sourceFreshness
                  .filter(s => s.source_type === source.sourceType)
                  .reduce((sum, s) => sum + (s.sections_count || 0), 0);
                return (
                  <article key={index} className="bg-white rounded-2xl p-6 border border-navy-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <source.icon className="w-6 h-6 text-teal-600" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-navy-900 mb-1">{source.name}</h3>
                        <p className="text-sm text-navy-600 mb-3">{source.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <RefreshCw className="w-3 h-3 text-green-600" aria-hidden="true" />
                          <span className="text-green-700 font-medium">{updateLabel}</span>
                        </div>
                        {sourceCount > 0 && (
                          <p className="text-xs text-navy-400 mt-1">{sourceCount.toLocaleString()} sections indexed</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 bg-teal-50 rounded-2xl p-6 border border-teal-200">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Currency & Limitations</h3>
                  <p className="text-navy-700 text-sm mb-3">
                    Laws change faster than databases. Expect a lag between a new statute and our index.
                    For urgent matters or recent changes, check the official source or call an attorney.
                  </p>
                  <p className="text-navy-600 text-sm">
                    <strong>Last statute update:</strong>{' '}
                    {(() => {
                      const allDates = sourceFreshness
                        .filter(s => s.last_successful_at)
                        .map(s => new Date(s.last_successful_at!));
                      if (allDates.length === 0) return 'January 2026';
                      const latest = new Date(Math.max(...allDates.map(d => d.getTime())));
                      return latest.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    })()}
                    {' | '}
                    <strong>Sources tracked:</strong>{' '}
                    {sourceFreshness.length > 0 ? sourceFreshness.length : 14}
                  </p>
                  <p className="text-sm mt-3">
                    <Link to="/case-predictor" className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
                      How we calculate Source Coverage & Confidence
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="jurisdiction" className="py-16 bg-white scroll-mt-40" aria-labelledby="jurisdiction-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                <MapPin className="w-4 h-4 text-green-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-green-900">Jurisdiction</span>
              </div>
              <h2 id="jurisdiction-heading" className="text-3xl font-bold text-navy-900 mb-4">How We Determine Your Jurisdiction</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Legal rights and procedures vary significantly by state. Here's how we ensure you get jurisdiction-relevant information.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {jurisdictionProcess.map((item, index) => (
                <article key={index} className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-green-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-navy-600">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Important Jurisdiction Notes</h3>
                  <ul className="text-navy-700 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">1.</span>
                      <span>Local ordinances (city/county) may create additional requirements not captured in our state-level data.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">2.</span>
                      <span>Some legal matters involve multiple jurisdictions (e.g., online contracts, interstate employment).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">3.</span>
                      <span>Federal law may preempt or supplement state law in certain areas.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="attorney-review" className="py-16 bg-navy-50 scroll-mt-40" aria-labelledby="attorney-review-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-rose-100 px-4 py-2 rounded-full mb-4">
                <BadgeCheck className="w-4 h-4 text-rose-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-rose-900">Quality Assurance</span>
              </div>
              <h2 id="attorney-review-heading" className="text-3xl font-bold text-navy-900 mb-4">What "Attorney-Reviewed" Means</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                We don't claim every AI response is personally reviewed by an attorney. Here's what attorney involvement actually means.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {attorneyReviewMeaning.map((item, index) => (
                <article key={index} className="bg-white rounded-2xl p-6 border border-navy-200">
                  <h3 className="font-bold text-navy-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-rose-600" aria-hidden="true" />
                    {item.aspect}
                  </h3>
                  <p className="text-sm text-navy-600">{item.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 bg-white rounded-2xl p-6 border-2 border-rose-200">
              <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" aria-hidden="true" />
                What This Does NOT Mean
              </h3>
              <ul className="space-y-3 text-sm text-navy-700">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">X</span>
                  <span>Individual responses are NOT reviewed by an attorney before delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">X</span>
                  <span>AI responses do NOT constitute attorney work product</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">X</span>
                  <span>Using ezLegal.ai does NOT create an attorney-client relationship</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">X</span>
                  <span>Information is NOT protected by attorney-client privilege</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" aria-labelledby="consult-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                <Users className="w-4 h-4 text-teal-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-navy-900">Human Attorneys</span>
              </div>
              <h2 id="consult-heading" className="text-3xl font-bold text-navy-900 mb-4">When to Consult a Human Attorney</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                AI can help you understand your situation, but certain matters require professional legal representation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {whenToConsultAttorney.map((item, index) => (
                <article
                  key={index}
                  className={`rounded-xl p-5 border ${
                    item.urgency === 'high'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.urgency === 'high' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      <Scale className={`w-4 h-4 ${item.urgency === 'high' ? 'text-red-600' : 'text-amber-600'}`} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-900 mb-1">{item.situation}</h3>
                      <p className="text-sm text-navy-600">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-br from-navy-50 to-teal-50 rounded-2xl p-8 border border-navy-200">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Need an Attorney?</h3>
                  <p className="text-navy-700">
                    We partner with legal aid organizations and can help connect you with pro bono or
                    low-cost legal services if you qualify.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/pro-bono"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Heart className="w-4 h-4" aria-hidden="true" />
                    Pro Bono Intake
                  </Link>
                  <Link
                    to="/find-attorney"
                    className="inline-flex items-center gap-2 bg-white border border-navy-300 hover:bg-navy-50 text-navy-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Users className="w-4 h-4" aria-hidden="true" />
                    Find a Lawyer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="safety" className="py-16 bg-navy-50 scroll-mt-40" aria-labelledby="safety-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full mb-4">
                <Shield className="w-4 h-4 text-red-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-red-900">Safety & Ethics</span>
              </div>
              <h2 id="safety-heading" className="text-3xl font-bold text-navy-900 mb-4">Safety Guardrails</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Our AI includes multiple safety mechanisms to protect users and ensure responsible use.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-red-600" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Crisis Detection</h3>
                <p className="text-sm text-navy-600 mb-4">
                  Keywords related to domestic violence, self-harm, or immediate danger trigger immediate
                  display of crisis hotlines and emergency resources.
                </p>
                <Link to="/emergency-resources" className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
                  View Crisis Resources <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </article>

              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">UPL Prevention</h3>
                <p className="text-sm text-navy-600 mb-4">
                  The AI is designed to provide legal information, not legal advice. It cannot represent
                  you, predict case outcomes with certainty, or tell you exactly what to do.
                </p>
                <Link to="/scope-disclaimers" className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  Scope & Disclaimers <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </article>

              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Bias Monitoring</h3>
                <p className="text-sm text-navy-600 mb-4">
                  We regularly audit AI responses for potential bias across demographics, case types,
                  and protected characteristics. Report concerns through our Trust Center.
                </p>
                <Link to="/trust-center#report" className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  Report a Concern <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" aria-labelledby="edge-cases-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
                <HelpCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-amber-900">Edge Cases</span>
              </div>
              <h2 id="edge-cases-heading" className="text-3xl font-bold text-navy-900 mb-4">What Happens When Things Are Unclear</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                No AI system is perfect. Here is how our system handles common edge cases and what you should do in each scenario.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <article className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-2">Jurisdiction Is Unknown</h3>
                    <p className="text-sm text-navy-600 mb-3">
                      If we cannot determine your state from your question or profile, we ask you to confirm before proceeding. Until confirmed, responses provide general U.S. legal information with a clear disclaimer.
                    </p>
                    <p className="text-xs text-amber-700 font-medium bg-amber-50 rounded px-3 py-1.5 border border-amber-200">
                      What to do: Select your state in the jurisdiction selector before asking your question.
                    </p>
                  </div>
                </div>
              </article>

              <article className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-amber-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-2">Multiple States Are Involved</h3>
                    <p className="text-sm text-navy-600 mb-3">
                      Some issues span state lines (e.g., remote employment, interstate custody). The system flags multi-state scenarios and explains which state's law likely applies, but recommends attorney review.
                    </p>
                    <p className="text-xs text-amber-700 font-medium bg-amber-50 rounded px-3 py-1.5 border border-amber-200">
                      What to do: Mention all relevant states in your question and consult an attorney for multi-state matters.
                    </p>
                  </div>
                </div>
              </article>

              <article className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-2">Sources Conflict or Are Ambiguous</h3>
                    <p className="text-sm text-navy-600 mb-3">
                      When retrieved sources point to different conclusions (e.g., conflicting court decisions or recent legislative changes), the system presents both perspectives and notes the conflict explicitly.
                    </p>
                    <p className="text-xs text-amber-700 font-medium bg-amber-50 rounded px-3 py-1.5 border border-amber-200">
                      What to do: Review the cited sources yourself and consult an attorney if the outcome matters.
                    </p>
                  </div>
                </div>
              </article>

              <article className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 text-amber-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-2">No Authoritative Source Found</h3>
                    <p className="text-sm text-navy-600 mb-3">
                      If our knowledge base does not contain sufficiently relevant or authoritative sources for your question, the system tells you so rather than guessing. It suggests alternative resources or attorney consultation.
                    </p>
                    <p className="text-xs text-amber-700 font-medium bg-amber-50 rounded px-3 py-1.5 border border-amber-200">
                      What to do: Try rephrasing your question with more specifics, or contact a local legal aid organization.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="citation-policy" className="py-16 bg-white scroll-mt-40" aria-labelledby="citation-policy-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                <Quote className="w-4 h-4 text-teal-700" aria-hidden="true" />
                <span className="text-sm font-semibold text-navy-900">Citation Policy</span>
              </div>
              <h2 id="citation-policy-heading" className="text-3xl font-bold text-navy-900 mb-3">How We Cite the Law</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Every substantive legal statement in an answer is traceable to a source. Here is how citations are selected, verified, and displayed.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <article className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">Source hierarchy</h3>
                <ol className="text-sm text-navy-700 space-y-1 list-decimal list-inside">
                  <li>Primary: statutes, regulations, and binding appellate opinions.</li>
                  <li>Secondary: official agency guidance and court self-help pages.</li>
                  <li>Tertiary: reputable legal aid explainers, used only for plain-language framing.</li>
                </ol>
              </article>
              <article className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">What we will not cite</h3>
                <ul className="text-sm text-navy-700 space-y-1 list-disc list-inside">
                  <li>Law-firm marketing pages, paywalled aggregators, or unverified forum posts.</li>
                  <li>Fabricated or inferred citations - the model must quote the retrieved passage verbatim.</li>
                  <li>Out-of-jurisdiction authorities presented as if controlling.</li>
                </ul>
              </article>
              <article className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">Display rules</h3>
                <ul className="text-sm text-navy-700 space-y-1 list-disc list-inside">
                  <li>Citations render inline with section/statute numbers and a link to the official source.</li>
                  <li>Every answer shows a "Sources" list with retrieval date.</li>
                  <li>If a claim cannot be cited, it is marked "general information" and excluded from action-oriented guidance.</li>
                </ul>
              </article>
              <article className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">Verification</h3>
                <ul className="text-sm text-navy-700 space-y-1 list-disc list-inside">
                  <li>Generated citations are string-matched against the retrieved corpus before display.</li>
                  <li>Unverified citations are dropped and the system retries retrieval.</li>
                  <li>Users can click any citation to view the source text and retrieval timestamp.</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="hallucination-mitigation" className="py-16 bg-navy-50 scroll-mt-40" aria-labelledby="hallucination-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
                <BadgeCheck className="w-4 h-4 text-amber-700" aria-hidden="true" />
                <span className="text-sm font-semibold text-navy-900">Hallucination Mitigation</span>
              </div>
              <h2 id="hallucination-heading" className="text-3xl font-bold text-navy-900 mb-3">How We Guard Against Made-Up Answers</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                No AI system is perfect. These are the specific controls we use to keep answers grounded in real law and to surface uncertainty when we cannot.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">Grounded retrieval</h3>
                <p className="text-sm text-navy-600">
                  The model is prompted to answer only from retrieved passages. If retrieval returns no relevant chunks above our similarity threshold, the system responds "I don't have a verified source for this" rather than generating.
                </p>
              </article>
              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">Citation verification</h3>
                <p className="text-sm text-navy-600">
                  Every statute or case citation produced by the model is checked against the retrieval index. Unverifiable citations are removed and the answer is regenerated without them.
                </p>
              </article>
              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">Jurisdiction gating</h3>
                <p className="text-sm text-navy-600">
                  Retrieval is filtered by the user's declared state. Answers that drift to another jurisdiction are flagged and rewritten with an explicit state label.
                </p>
              </article>
              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">Confidence and uncertainty</h3>
                <p className="text-sm text-navy-600">
                  Low-coverage topics, conflicting sources, or novel legislation trigger a visible "Low coverage" or "Conflicting authority" badge and a recommendation to consult counsel.
                </p>
              </article>
              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">Scope filters</h3>
                <p className="text-sm text-navy-600">
                  Prompts requesting strategy, predicted outcomes, or pleadings are routed to an information-only response with an attorney-referral CTA.
                </p>
              </article>
              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-2">Monitoring and feedback</h3>
                <p className="text-sm text-navy-600">
                  Every response includes a "Report an issue" control. Reports are reviewed weekly; recurring errors feed prompt updates, new retrieval sources, and guardrail rules.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="escalation-logic" className="py-16 bg-white scroll-mt-40" aria-labelledby="escalation-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full mb-4">
                <AlertTriangle className="w-4 h-4 text-red-700" aria-hidden="true" />
                <span className="text-sm font-semibold text-navy-900">Escalation Logic</span>
              </div>
              <h2 id="escalation-heading" className="text-3xl font-bold text-navy-900 mb-3">When the AI Hands Off to a Human</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Some questions must not be answered by AI alone. These are the triggers that route a user to crisis resources, pro bono intake, or a licensed attorney.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <article className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5 text-red-700" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Tier 1 - Crisis</h3>
                <p className="text-sm text-navy-700 mb-3">
                  Safety risk, domestic violence, active arrest, child endangerment, or threats of harm.
                </p>
                <p className="text-xs text-red-800 font-semibold bg-red-100 rounded px-2 py-1">
                  Action: immediate crisis strip with 911, hotlines, and Quick Exit. Chat pauses until user acknowledges.
                </p>
              </article>
              <article className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-amber-700" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Tier 2 - Time-critical</h3>
                <p className="text-sm text-navy-700 mb-3">
                  Statutes of limitations, court deadlines, eviction notices, ICE detainers, or imminent hearings.
                </p>
                <p className="text-xs text-amber-800 font-semibold bg-amber-100 rounded px-2 py-1">
                  Action: route to attorney directory or legal aid intake, with deadline preserved in the matter record.
                </p>
              </article>
              <article className="bg-teal-50 rounded-2xl p-6 border border-teal-200">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-teal-700" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Tier 3 - Complex</h3>
                <p className="text-sm text-navy-700 mb-3">
                  Multi-jurisdiction, contested custody, criminal defense, or matters requiring courtroom representation.
                </p>
                <p className="text-xs text-teal-800 font-semibold bg-teal-100 rounded px-2 py-1">
                  Action: provide information, flag attorney-only scope, and surface directory + pro bono eligibility.
                </p>
              </article>
            </div>
            <div className="mt-8 bg-navy-50 rounded-2xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-2">How triggers are detected</h3>
              <ul className="text-sm text-navy-700 space-y-1 list-disc list-inside">
                <li>Keyword and intent classifiers run on every user turn before the model drafts a response.</li>
                <li>A safety gate can override the model's output and substitute a crisis or handoff message.</li>
                <li>All escalations are logged in our audit trail with a reason code and the action taken.</li>
                <li>Users can always bypass the AI and go directly to <Link to="/emergency-resources" className="text-teal-700 underline">Emergency Resources</Link> or <Link to="/pro-bono" className="text-teal-700 underline">Pro Bono Intake</Link>.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="privacy-handling" className="py-16 bg-navy-50 scroll-mt-40" aria-labelledby="privacy-handling-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                <Lock className="w-4 h-4 text-teal-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-navy-900">Your Privacy</span>
              </div>
              <h2 id="privacy-handling-heading" className="text-3xl font-bold text-navy-900 mb-4">How Your Data Is Handled</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Understanding how our AI works includes knowing what happens to your data. Here are the essentials.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">What We Store</h3>
                <p className="text-sm text-navy-600">
                  Your chat history (so you can refer back to it), account information, and anonymized usage data to improve the service. All data is encrypted at rest and in transit.
                </p>
              </article>

              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">What We Don't Do</h3>
                <p className="text-sm text-navy-600">
                  We do not sell your data, share it with advertisers, or use your conversations to train AI models. Your legal questions remain confidential within the bounds of our privacy policy.
                </p>
              </article>

              <article className="bg-white rounded-2xl p-6 border border-navy-200">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Your Control</h3>
                <p className="text-sm text-navy-600">
                  You can export your data or request complete deletion at any time from your account settings. Free-tier conversations are automatically purged after 30 days.
                </p>
              </article>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm"
              >
                Read Full Privacy Policy <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/trust-center"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm"
              >
                Visit Trust Center <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Our AI?</h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              We're committed to transparency. If you have questions about how our AI works,
              its limitations, or how to use it responsibly, we're here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/ai-governance"
                className="inline-flex items-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-navy-50 transition-colors"
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                AI Governance Policy
              </Link>
              <Link
                to="/trust-center"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                Trust Center
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
