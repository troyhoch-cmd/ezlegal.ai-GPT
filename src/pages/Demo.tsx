import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Play, Globe, Briefcase, Building2, CheckCircle, ArrowRight, Users, Shield, Brain } from 'lucide-react';

interface DemoPath {
  id: string;
  icon: typeof Globe;
  title: string;
  subtitle: string;
  persona: string;
  steps: string[];
  route: string;
  color: string;
}

const DEMO_PATHS: DemoPath[] = [
  {
    id: 'spanish-individual',
    icon: Globe,
    title: 'Spanish-Speaking Individual',
    subtitle: 'Housing issue, potential urgency',
    persona: 'Individual / Spanish',
    steps: [
      'Lands on /start?lang=es',
      'Selects "Persona" (individual)',
      'Selects housing issue',
      'Indicates court date urgency',
      'Sees urgent resources first',
      'Gets bilingual triage results',
    ],
    route: '/start?lang=es',
    color: 'teal',
  },
  {
    id: 'smb-owner',
    icon: Briefcase,
    title: 'Small Business Owner',
    subtitle: 'Contract review, compliance questions',
    persona: 'SMB Owner',
    steps: [
      'Visits /business landing',
      'Clicks "Protect my business"',
      'Selects business persona at /start',
      'Chooses contract/compliance issue',
      'Sees business-focused results',
      'Views pricing for business tier',
    ],
    route: '/business',
    color: 'blue',
  },
  {
    id: 'partner-org',
    icon: Building2,
    title: 'Legal Aid Partner',
    subtitle: 'Intake tool evaluation',
    persona: 'Legal Aid / Community Org',
    steps: [
      'Visits /partners landing',
      'Reviews bilingual intake tools',
      'Previews triage flow',
      'Explores partner hub features',
      'Views grant reporting dashboard',
      'Schedules a demo call',
    ],
    route: '/demo/legal-aid',
    color: 'amber',
  },
];

const EVALUATION_CRITERIA = [
  { category: 'Access to Justice', checks: ['Free tier visible', 'A2J screening before checkout', 'Pro bono pathway exists', 'Urgent resources accessible'] },
  { category: 'Ethical AI', checks: ['Scope disclaimer on high-risk pages', 'Not-a-law-firm notice persistent', 'Human escalation always available', 'AI limitations disclosed'] },
  { category: 'Bilingual Parity', checks: ['Spanish triage flow complete', 'Language persistence across pages', 'Continuity guard on EN-only pages', 'Spanish CTAs on homepage'] },
  { category: 'Conversion Ethics', checks: ['No dark patterns', 'Clear pricing before purchase', 'Easy cancellation language', 'Value proposition before paywall'] },
];

export default function Demo() {
  const [activePath, setActivePath] = useState<string | null>(null);
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-full mb-4">
              <Play className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">{en ? 'Stakeholder Demo' : 'Demostración'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {en ? 'Experience ezLegal.ai' : 'Experimenta ezLegal.ai'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {en
                ? 'Walk through the platform from three key user perspectives. Each path demonstrates ethical AI, access to justice, and bilingual capabilities.'
                : 'Recorre la plataforma desde tres perspectivas clave. Cada camino demuestra IA ética, acceso a la justicia y capacidades bilingües.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {DEMO_PATHS.map((path) => {
              const Icon = path.icon;
              const isActive = activePath === path.id;
              return (
                <div
                  key={path.id}
                  className={`rounded-xl border-2 p-6 transition-all cursor-pointer ${
                    isActive
                      ? 'border-teal-500 bg-teal-50 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                  onClick={() => setActivePath(isActive ? null : path.id)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      path.color === 'teal' ? 'bg-teal-100' :
                      path.color === 'blue' ? 'bg-blue-100' :
                      'bg-amber-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        path.color === 'teal' ? 'text-teal-600' :
                        path.color === 'blue' ? 'text-blue-600' :
                        'text-amber-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{path.title}</h3>
                      <p className="text-xs text-slate-500">{path.subtitle}</p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{en ? 'Demo Steps' : 'Pasos de la Demostración'}</p>
                      {path.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-xs font-bold text-teal-600 mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                          <span className="text-sm text-slate-700">{step}</span>
                        </div>
                      ))}
                      <Link
                        to={path.route}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        {en ? 'Start Demo' : 'Iniciar'} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}

                  {!isActive && (
                    <p className="text-sm text-slate-500 mt-2">{en ? 'Click to see demo steps' : 'Haz clic para ver los pasos'}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-slate-50 border-y border-slate-200 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">{en ? 'Evaluation Criteria' : 'Criterios de Evaluación'}</h2>
            <p className="text-sm text-slate-500 text-center mb-8">{en ? 'Key areas to assess during the demo walkthrough' : 'Áreas clave a evaluar durante la demostración'}</p>

            <div className="grid sm:grid-cols-2 gap-6">
              {EVALUATION_CRITERIA.map((criteria) => (
                <div key={criteria.category} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    {criteria.category === 'Access to Justice' && <Users className="w-5 h-5 text-teal-600" />}
                    {criteria.category === 'Ethical AI' && <Shield className="w-5 h-5 text-teal-600" />}
                    {criteria.category === 'Bilingual Parity' && <Globe className="w-5 h-5 text-teal-600" />}
                    {criteria.category === 'Conversion Ethics' && <Brain className="w-5 h-5 text-teal-600" />}
                    <h3 className="font-semibold text-slate-900">{criteria.category}</h3>
                  </div>
                  <ul className="space-y-2">
                    {criteria.checks.map((check) => (
                      <li key={check} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">{en ? 'Quick Links' : 'Enlaces Rápidos'}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/trust" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition-colors text-center">
              <Shield className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-800">Trust Center</span>
            </Link>
            <Link to="/route-audit" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition-colors text-center">
              <Brain className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-800">Route Audit</span>
            </Link>
            <Link to="/qa" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition-colors text-center">
              <CheckCircle className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-800">QA Dashboard</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
