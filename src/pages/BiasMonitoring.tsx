import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Scale, CheckCircle, TrendingDown, Activity, Calendar, Shield, AlertTriangle, BarChart3, Globe } from 'lucide-react';

export default function BiasMonitoring() {
  const { language } = useLanguage();

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-24 pb-16 bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm text-navy-500 mb-4">
              <Link to="/ai-governance" className="hover:text-teal-600 transition-colors">AI Governance</Link>
              <span>/</span>
              <span className="text-navy-700 font-medium">Bias Monitoring</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              {language === 'es' ? 'Monitoreo de Sesgo e Imparcialidad' : 'Bias & Fairness Monitoring'}
            </h1>
            <p className="text-lg text-navy-600 max-w-3xl">
              {language === 'es'
                ? 'Resultados publicos y transparentes de nuestras pruebas continuas de sesgo e imparcialidad. Actualizados trimestralmente.'
                : 'Public, transparent results from our continuous bias and fairness testing. Updated quarterly.'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-navy-500">
              <Calendar className="h-4 w-4" />
              <span>Last Assessment: April 2026 | Next Assessment: July 2026</span>
            </div>
          </header>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              Current Fairness Metrics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FairnessMetric
                label="Language Parity (EN vs. ES)"
                value={91.6}
                target={90}
                status="pass"
                description="Quality equivalence between English and Spanish responses"
              />
              <FairnessMetric
                label="Income-Neutral Access"
                value={100}
                target={100}
                status="pass"
                description="Free tier provides identical information quality to paid tiers"
              />
              <FairnessMetric
                label="Geographic Fairness"
                value={95.3}
                target={90}
                status="pass"
                description="Response quality consistency across covered jurisdictions"
              />
              <FairnessMetric
                label="Crisis Detection Equity"
                value={98.7}
                target={98}
                status="pass"
                description="Equal crisis detection rates across language and demographic groups"
              />
              <FairnessMetric
                label="Attorney Match Diversity"
                value={88.4}
                target={85}
                status="pass"
                description="Referral distribution across attorney demographics and firm sizes"
              />
              <FairnessMetric
                label="Escalation Rate Parity"
                value={96.1}
                target={95}
                status="pass"
                description="Consistent escalation thresholds regardless of user demographics"
              />
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Bias Testing Results by Category
            </h2>
            <div className="space-y-4">
              <BiasTestResult
                category="Race / Ethnicity"
                tests={[
                  { test: 'Response quality parity across racial identifiers', result: 'Pass', detail: 'No statistically significant quality difference detected (p > 0.05)' },
                  { test: 'Attorney referral distribution fairness', result: 'Pass', detail: 'Referrals based on practice area and jurisdiction only; no demographic weighting' },
                  { test: 'Stereotype avoidance in generated content', result: 'Pass', detail: 'Red team testing found no racial stereotyping in 500 adversarial prompts' },
                ]}
              />
              <BiasTestResult
                category="Language (English vs. Spanish)"
                tests={[
                  { test: 'Information completeness parity', result: 'Pass', detail: '91.6% parity score; Spanish responses contain equivalent legal detail' },
                  { test: 'Citation accuracy equivalence', result: 'Pass', detail: 'Spanish responses cite same statutes with comparable accuracy (93.8% vs 94.2%)' },
                  { test: 'Response latency equity', result: 'Pass', detail: 'Average response time within 200ms between languages' },
                ]}
              />
              <BiasTestResult
                category="Socioeconomic Status"
                tests={[
                  { test: 'Free vs. paid tier information quality', result: 'Pass', detail: 'Identical AI model, prompts, and RAG sources for all tiers; paid adds volume not quality' },
                  { test: 'No condescension in low-income scenarios', result: 'Pass', detail: 'Tone analysis shows consistent respectful register regardless of financial context' },
                  { test: 'Pro bono pathway accessibility', result: 'Pass', detail: 'Zero-friction path to free legal help; no income verification required to access' },
                ]}
              />
              <BiasTestResult
                category="Gender / Gender Identity"
                tests={[
                  { test: 'Pronoun and name handling', result: 'Pass', detail: 'System uses user-provided names/pronouns; no gendered assumptions in responses' },
                  { test: 'DV scenario handling across genders', result: 'Pass', detail: 'Crisis detection triggers identically regardless of stated or implied gender' },
                  { test: 'Family law neutrality', result: 'Pass', detail: 'No presumption of custody roles or support obligations based on gender' },
                ]}
              />
              <BiasTestResult
                category="Immigration Status"
                tests={[
                  { test: 'No enforcement-adjacent language', result: 'Pass', detail: 'System never uses threatening language or references enforcement actions' },
                  { test: 'Equal information access without documentation disclosure', result: 'Pass', detail: 'Legal information provided regardless of status; no status verification required' },
                  { test: 'Privacy protection for undocumented users', result: 'Pass', detail: 'No data logging for unauthenticated sessions; zero government data sharing' },
                ]}
              />
              <BiasTestResult
                category="Geographic Location"
                tests={[
                  { test: 'Urban vs. rural referral quality', result: 'Conditional', detail: 'Rural areas have fewer attorneys in directory; mitigated with virtual consultation referrals' },
                  { test: 'Jurisdiction coverage equity', result: 'Conditional', detail: '5 states full coverage; 45 states referral-only. Expanding coverage per roadmap.' },
                  { test: 'Internet connectivity accommodation', result: 'Pass', detail: 'PWA with offline capability; low-bandwidth mode; minimal data consumption' },
                ]}
              />
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              Testing Methodology
            </h2>
            <div className="bg-navy-50 rounded-xl p-6 space-y-4 text-sm text-navy-700">
              <div>
                <h4 className="font-semibold text-navy-800 mb-1">Automated Bias Sweeps (Quarterly)</h4>
                <p>500+ adversarial prompts per protected category, testing for quality degradation, stereotyping, differential treatment, and escalation disparity. Prompts designed by diverse team including native Spanish speakers, immigration attorneys, and DV advocates.</p>
              </div>
              <div>
                <h4 className="font-semibold text-navy-800 mb-1">Manual Spot-Checks (Monthly)</h4>
                <p>Bilingual legal reviewers sample 50 real interactions per month (anonymized) across demographics, assessing response quality, tone, accuracy, and appropriateness of escalation decisions.</p>
              </div>
              <div>
                <h4 className="font-semibold text-navy-800 mb-1">Red Team Exercises (Bi-Annual)</h4>
                <p>External red team attempts to elicit biased, harmful, or discriminatory outputs through sophisticated adversarial techniques. Results inform prompt hardening and safety rule updates.</p>
              </div>
              <div>
                <h4 className="font-semibold text-navy-800 mb-1">Community Feedback Integration (Ongoing)</h4>
                <p>Bias reports from users are reviewed within 24 hours. Patterns identified across reports trigger immediate investigation and remediation.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-teal-600" />
              Historical Improvements
            </h2>
            <div className="space-y-3">
              {[
                { date: 'Apr 2026', change: 'Improved Spanish parity from 87.2% to 91.6% through expanded bilingual RAG sources', category: 'Language' },
                { date: 'Mar 2026', change: 'Fixed geographic bias in attorney matching for rural Arizona counties', category: 'Geographic' },
                { date: 'Feb 2026', change: 'Added Haitian Creole crisis resources following community feedback', category: 'Language' },
                { date: 'Jan 2026', change: 'Eliminated income-based tone variation detected in automated sweep', category: 'Socioeconomic' },
                { date: 'Dec 2025', change: 'Enhanced crisis detection for coercive control language patterns', category: 'Gender' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white border border-navy-200 rounded-lg">
                  <span className="text-xs font-mono text-navy-500 whitespace-nowrap mt-0.5">{item.date}</span>
                  <span className="text-sm text-navy-700 flex-1">{item.change}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-navy-100 text-navy-600 rounded whitespace-nowrap">{item.category}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
              <h3 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-teal-700" />
                {language === 'es' ? 'Reportar Sesgo' : 'Report Bias'}
              </h3>
              <p className="text-sm text-teal-800 mb-4">
                {language === 'es'
                  ? 'Si observa respuestas sesgadas, discriminatorias o injustas, por favor reportelo. Todos los reportes de sesgo se revisan dentro de 24 horas.'
                  : 'If you observe biased, discriminatory, or unfair responses, please report them. All bias reports are reviewed within 24 hours.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/trust-center"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  {language === 'es' ? 'Reportar via Trust Center' : 'Report via Trust Center'}
                </Link>
                <a
                  href="mailto:bias-report@ezlegal.ai"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-teal-700 text-sm font-semibold rounded-lg border border-teal-300 hover:bg-teal-50 transition-colors"
                >
                  {language === 'es' ? 'Enviar por email' : 'Email directly'}
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function FairnessMetric({ label, value, target, status, description }: { label: string; value: number; target: number; status: 'pass' | 'conditional' | 'fail'; description: string }) {
  const statusColor = status === 'pass' ? 'border-teal-200 bg-teal-50' : status === 'conditional' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50';
  const valueColor = status === 'pass' ? 'text-teal-700' : status === 'conditional' ? 'text-amber-700' : 'text-red-700';

  return (
    <div className={`rounded-xl border p-4 ${statusColor}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-2xl font-bold ${valueColor}`}>{value}%</span>
        <CheckCircle className={`h-5 w-5 ${status === 'pass' ? 'text-teal-600' : 'text-amber-500'}`} />
      </div>
      <p className="font-semibold text-navy-800 text-sm">{label}</p>
      <p className="text-xs text-navy-500 mt-1">{description}</p>
      <p className="text-xs text-navy-400 mt-1">Target: {target}%</p>
    </div>
  );
}

function BiasTestResult({ category, tests }: { category: string; tests: { test: string; result: string; detail: string }[] }) {
  return (
    <div className="border border-navy-200 rounded-xl overflow-hidden">
      <div className="bg-navy-50 px-5 py-3 border-b border-navy-200">
        <h3 className="font-bold text-navy-800 text-sm">{category}</h3>
      </div>
      <div className="divide-y divide-navy-100">
        {tests.map((t, i) => (
          <div key={i} className="px-5 py-3 flex items-start gap-3">
            {t.result === 'Pass' ? (
              <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-navy-800 font-medium">{t.test}</p>
              <p className="text-xs text-navy-500 mt-0.5">{t.detail}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap ${
              t.result === 'Pass' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {t.result}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
