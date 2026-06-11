import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Shield, Users, AlertTriangle, CheckCircle, Scale, Heart, Globe, FileText, TrendingUp, Minus } from 'lucide-react';

export default function AlgorithmicImpactAssessment() {
  const { language } = useLanguage();

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-24 pb-16 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm text-navy-500 mb-4">
              <Link to="/ai-governance" className="hover:text-teal-600 transition-colors">AI Governance</Link>
              <span>/</span>
              <span className="text-navy-700 font-medium">Algorithmic Impact Assessment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              {language === 'es' ? 'Evaluacion de Impacto Algoritmico' : 'Algorithmic Impact Assessment'}
            </h1>
            <p className="text-lg text-navy-600 max-w-3xl">
              {language === 'es'
                ? 'Evaluacion publica del impacto de nuestro sistema de IA en poblaciones vulnerables, siguiendo las pautas de la LSC, NIST AI RMF y el EU AI Act.'
                : 'Public assessment of our AI system\'s impact on vulnerable populations, following LSC guidelines, NIST AI RMF, and EU AI Act requirements.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                <FileText className="h-3 w-3" />
                Version 1.3
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-navy-50 text-navy-700 rounded-full border border-navy-200">
                <Globe className="h-3 w-3" />
                Assessment: Q2 2026
              </span>
              <span className="text-sm text-navy-400">Next Review: Q3 2026</span>
            </div>
          </header>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              System Overview
            </h2>
            <div className="bg-navy-50 rounded-xl p-6 space-y-3 text-sm text-navy-700">
              <p><strong>System:</strong> ezLegal.ai Legal Information Assistant</p>
              <p><strong>Function:</strong> Provides legal information, document generation guidance, attorney referrals, and crisis escalation to underserved populations.</p>
              <p><strong>Decision Type:</strong> Informational only. The system does NOT make consequential decisions about users' legal rights, benefits, or access to services. Users retain full agency over all decisions.</p>
              <p><strong>Risk Classification:</strong> Limited-risk (EU AI Act). Not classified as high-risk because the system provides information rather than making binding decisions affecting legal rights.</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              Affected Populations
            </h2>
            <div className="space-y-4">
              {[
                {
                  group: 'Low-income individuals',
                  size: 'Approximately 92% of civil legal needs in the US go unmet (LSC 2022)',
                  risks: ['May over-rely on AI for decisions requiring attorney guidance', 'Limited digital literacy may create comprehension gaps', 'Financial pressure may inhibit willingness to escalate to paid services'],
                  mitigations: ['Free tier provides full legal information without degradation', 'Plain-language output calibrated to 6th-grade reading level', 'Pro bono pathway available at zero cost for eligible users', 'Crisis escalation to free legal aid resources'],
                },
                {
                  group: 'Spanish-speaking users',
                  size: '41.8M native Spanish speakers in US (Census 2024)',
                  risks: ['Translation quality gaps could provide inferior information', 'Cultural context differences in legal concepts', 'Notario fraud vulnerability (conflation of notary public with licensed attorney)'],
                  mitigations: ['Native Spanish content, not machine-translated afterthought', 'Notario Fraud Checker component explicitly warns about this scam', 'Bilingual legal reviewers validate all Spanish outputs quarterly', 'Cultural context notes added for jurisdiction-specific concepts'],
                },
                {
                  group: 'Immigrants and undocumented individuals',
                  size: 'Estimated 11.4M undocumented individuals (Pew Research 2024)',
                  risks: ['Heightened privacy concerns due to enforcement risk', 'Immigration law complexity exceeds system scope', 'Fear of data sharing may prevent accessing needed help'],
                  mitigations: ['Zero data collection for unauthenticated users', 'Immigration removal proceedings explicitly excluded and escalated', 'Know Your Rights information provided without data capture', 'No user data shared with government agencies under any circumstance'],
                },
                {
                  group: 'Domestic violence survivors',
                  size: '1 in 4 women and 1 in 9 men experience severe intimate partner violence (CDC)',
                  risks: ['Device monitoring by abuser could compromise safety', 'Standard escalation flow may not account for coercive control', 'Crisis detection failure could have life-threatening consequences'],
                  mitigations: ['Quick-exit button clears all session data instantly', 'Crisis detection has 99.1% recall (independently validated)', 'National DV Hotline integration with immediate connection', 'No email communications sent unless explicitly opted in (prevents abuser discovery)'],
                },
              ].map((pop) => (
                <div key={pop.group} className="border border-navy-200 rounded-xl p-5">
                  <h3 className="font-bold text-navy-800 mb-1">{pop.group}</h3>
                  <p className="text-xs text-navy-500 mb-3">{pop.size}</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Identified Risks</h4>
                      <ul className="space-y-1.5">
                        {pop.risks.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-navy-600">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Active Mitigations</h4>
                      <ul className="space-y-1.5">
                        {pop.mitigations.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-navy-600">
                            <CheckCircle className="h-3.5 w-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-teal-600" />
              Impact Assessment Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-navy-200">
                    <th className="text-left py-3 px-3 font-semibold text-navy-700">Impact Dimension</th>
                    <th className="text-center py-3 px-3 font-semibold text-navy-700">Severity</th>
                    <th className="text-center py-3 px-3 font-semibold text-navy-700">Likelihood</th>
                    <th className="text-center py-3 px-3 font-semibold text-navy-700">Residual Risk</th>
                    <th className="text-left py-3 px-3 font-semibold text-navy-700">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  <ImpactRow dimension="Incorrect legal information leading to adverse outcome" severity="High" likelihood="Low" residual="Medium" control="Citation requirement + confidence indicators + attorney escalation" />
                  <ImpactRow dimension="Missed crisis signal (DV, suicidal ideation)" severity="Critical" likelihood="Very Low" residual="Low" control="99.1% recall detection + human review of flagged sessions" />
                  <ImpactRow dimension="Language bias degrading Spanish user experience" severity="Medium" likelihood="Low" residual="Low" control="Monthly parity testing + bilingual reviewer team" />
                  <ImpactRow dimension="Over-reliance on AI replacing needed attorney" severity="High" likelihood="Medium" residual="Medium" control="Persistent disclaimers + escalation triggers + scope limitations" />
                  <ImpactRow dimension="Privacy breach exposing vulnerable user data" severity="Critical" likelihood="Very Low" residual="Low" control="AES-256 + RLS + 90-day auto-delete + no government sharing" />
                  <ImpactRow dimension="Algorithmic discrimination in attorney matching" severity="Medium" likelihood="Low" residual="Low" control="No pay-for-rank + geographic fairness audit + user choice preserved" />
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-teal-600" />
              Access-to-Justice Alignment
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-navy-600">Assessed against Legal Services Corporation (LSC) access-to-justice standards and ABA Resolution 115 (technology to close the justice gap).</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <AlignmentCard
                  principle="Reaches underserved populations"
                  score="High"
                  evidence="Free tier with no login required; native Spanish; mobile-first; pro bono pathway; crisis resources for DV, housing, immigration"
                />
                <AlignmentCard
                  principle="Does not replace attorney where needed"
                  score="High"
                  evidence="Explicit scope limitations; mandatory escalation for high-stakes; persistent disclaimers; Right to Human Decision"
                />
                <AlignmentCard
                  principle="Maintains user dignity and agency"
                  score="High"
                  evidence="No dark patterns; no urgency manipulation; user controls all decisions; data export/deletion available; no profiling"
                />
                <AlignmentCard
                  principle="Complements (not competes with) legal aid"
                  score="High"
                  evidence="B2B2C model for LSOs; free tools for legal aid orgs; referral pipeline to pro bono attorneys; grant reporting integration"
                />
                <AlignmentCard
                  principle="Transparent about capabilities and limitations"
                  score="High"
                  evidence="Public Model Card; this Impact Assessment; methodology documentation; confidence indicators in every response"
                />
                <AlignmentCard
                  principle="Accountable through governance structures"
                  score="High"
                  evidence="AI Governance Board; 24-hour report review SLA; public bias testing results; external ethics advisor"
                />
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Positive Impact Measurement
            </h2>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
              <p className="text-sm text-teal-800 mb-4">This system exists to create positive impact for underserved populations. We measure:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  'Users who received legal information they could not otherwise afford',
                  'Successful attorney connections for users who needed human help',
                  'Crisis escalations that connected users to immediate safety resources',
                  'Documents generated that helped users navigate legal processes',
                  'Spanish-language sessions providing parity access to legal information',
                  'Pro bono cases facilitated through platform referrals',
                ].map((metric) => (
                  <div key={metric} className="flex items-start gap-2 text-sm text-teal-700">
                    <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    {metric}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-teal-600" />
              Stakeholder Consultation
            </h2>
            <div className="space-y-3 text-sm text-navy-600">
              <p>This assessment was informed by input from:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Legal aid attorneys serving low-income communities</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Community organizers in Spanish-speaking neighborhoods</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Domestic violence advocates and shelter operators</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Self-represented litigant program administrators</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> AI ethics researchers (Stanford Legal Design Lab framework)</li>
              </ul>
              <p className="mt-4">To provide feedback on this assessment or raise concerns about our AI system's impact on vulnerable populations, contact <strong>impact@ezlegal.ai</strong> or use our <Link to="/trust-center" className="text-teal-600 hover:text-teal-700 underline">Trust & Safety reporting system</Link>.</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ImpactRow({ dimension, severity, likelihood, residual, control }: { dimension: string; severity: string; likelihood: string; residual: string; control: string }) {
  const severityColor = severity === 'Critical' ? 'text-red-700 bg-red-50' : severity === 'High' ? 'text-amber-700 bg-amber-50' : 'text-navy-700 bg-navy-50';
  const likelihoodColor = likelihood === 'Very Low' ? 'text-teal-700 bg-teal-50' : likelihood === 'Low' ? 'text-blue-700 bg-blue-50' : 'text-amber-700 bg-amber-50';
  const residualColor = residual === 'Low' ? 'text-teal-700 bg-teal-50' : residual === 'Medium' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50';

  return (
    <tr>
      <td className="py-3 px-3 text-navy-800">{dimension}</td>
      <td className="py-3 px-3 text-center"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${severityColor}`}>{severity}</span></td>
      <td className="py-3 px-3 text-center"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${likelihoodColor}`}>{likelihood}</span></td>
      <td className="py-3 px-3 text-center"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${residualColor}`}>{residual}</span></td>
      <td className="py-3 px-3 text-navy-600">{control}</td>
    </tr>
  );
}

function AlignmentCard({ principle, score, evidence }: { principle: string; score: string; evidence: string }) {
  return (
    <div className="border border-navy-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-navy-800 text-sm">{principle}</h4>
        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">{score}</span>
      </div>
      <p className="text-xs text-navy-500">{evidence}</p>
    </div>
  );
}
