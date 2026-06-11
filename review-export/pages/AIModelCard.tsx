import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Brain, Database, Shield, AlertTriangle, Users, Scale, CheckCircle, XCircle, Clock, FileText, Globe, Zap, Eye, RefreshCw } from 'lucide-react';

interface ModelCardSection {
  id: string;
  title: string;
  icon: React.ElementType;
}

const sections: ModelCardSection[] = [
  { id: 'identity', title: 'Model Identity', icon: Brain },
  { id: 'purpose', title: 'Intended Purpose & Users', icon: Users },
  { id: 'data', title: 'Training Data & Sources', icon: Database },
  { id: 'performance', title: 'Performance & Limitations', icon: Zap },
  { id: 'fairness', title: 'Fairness & Bias Testing', icon: Scale },
  { id: 'safety', title: 'Safety & Escalation', icon: Shield },
  { id: 'oversight', title: 'Human Oversight', icon: Eye },
  { id: 'maintenance', title: 'Monitoring & Updates', icon: RefreshCw },
];

export default function AIModelCard() {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('identity');

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-24 pb-16 bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm text-navy-500 mb-4">
              <Link to="/ai-governance" className="hover:text-teal-600 transition-colors">AI Governance</Link>
              <span>/</span>
              <span className="text-navy-700 font-medium">Model Card</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              {language === 'es' ? 'Tarjeta del Modelo de IA' : 'AI Model Card'}
            </h1>
            <p className="text-lg text-navy-600 max-w-3xl">
              {language === 'es'
                ? 'Documentacion completa y transparente de nuestro sistema de IA legal, siguiendo el estandar ISO/IEC 42001, el Marco NIST AI RMF y los requisitos del EU AI Act.'
                : 'Complete, transparent documentation of our legal AI system, following ISO/IEC 42001, the NIST AI Risk Management Framework, and EU AI Act requirements.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                <Clock className="h-3 w-3" />
                Last Updated: May 2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-navy-50 text-navy-700 rounded-full border border-navy-200">
                <FileText className="h-3 w-3" />
                Version 3.2
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                <Globe className="h-3 w-3" />
                EU AI Act Aligned
              </span>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            <nav className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-1">
                {sections.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                        activeSection === s.id
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'text-navy-600 hover:bg-navy-50 hover:text-navy-800'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {s.title}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="flex-1 min-w-0">
              {activeSection === 'identity' && (
                <Section title="Model Identity">
                  <DataRow label="System Name" value="ezLegal AI Legal Assistant" />
                  <DataRow label="Version" value="3.2 (May 2026)" />
                  <DataRow label="Classification" value="Limited-Risk AI System (EU AI Act Art. 52)" />
                  <DataRow label="Foundation Model" value="OpenAI GPT-4o / GPT-4o-mini (inference-only)" />
                  <DataRow label="Architecture" value="Retrieval-Augmented Generation (RAG) with jurisdiction-specific vector stores" />
                  <DataRow label="Deployment" value="Cloud-hosted (Supabase Edge Functions, US-East region)" />
                  <DataRow label="Languages" value="English (primary), Spanish (native parity)" />
                  <DataRow label="Owner" value="ezLegal.ai AI Governance Board" />
                  <DataRow label="Contact" value="governance@ezlegal.ai" />
                </Section>
              )}

              {activeSection === 'purpose' && (
                <Section title="Intended Purpose & Users">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">Primary Purpose</h4>
                      <p className="text-navy-600">Provide accessible legal information, document generation guidance, and attorney referrals to individuals and small businesses who cannot afford traditional legal services.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">Intended Users</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-navy-600">
                          <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                          <span>Low-income individuals navigating legal issues (housing, employment, family, immigration)</span>
                        </li>
                        <li className="flex items-start gap-2 text-navy-600">
                          <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                          <span>Spanish-speaking communities needing legal information in their native language</span>
                        </li>
                        <li className="flex items-start gap-2 text-navy-600">
                          <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                          <span>Small and medium businesses requiring routine legal document assistance</span>
                        </li>
                        <li className="flex items-start gap-2 text-navy-600">
                          <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                          <span>Pro bono attorneys and legal aid organizations augmenting case workflows</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">Prohibited Uses</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-navy-600">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>Replacing licensed attorney advice for high-stakes decisions (criminal defense, child custody, immigration detention)</span>
                        </li>
                        <li className="flex items-start gap-2 text-navy-600">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>Filing court documents without attorney review</span>
                        </li>
                        <li className="flex items-start gap-2 text-navy-600">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>Automated decision-making affecting legal rights without human oversight</span>
                        </li>
                        <li className="flex items-start gap-2 text-navy-600">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>Profiling users based on protected characteristics</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Section>
              )}

              {activeSection === 'data' && (
                <Section title="Training Data & Sources">
                  <div className="space-y-6">
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-teal-800 mb-1">Zero Training Guarantee</p>
                      <p className="text-sm text-teal-700">ezLegal.ai uses pre-trained foundation models in inference-only mode. We do NOT fine-tune or train models on user conversations. User data never enters any model training pipeline.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-3">RAG Knowledge Sources</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-navy-200">
                              <th className="text-left py-2 px-3 font-semibold text-navy-700">Source Category</th>
                              <th className="text-left py-2 px-3 font-semibold text-navy-700">Description</th>
                              <th className="text-left py-2 px-3 font-semibold text-navy-700">Verification</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-navy-100">
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800 font-medium">State Statutes</td>
                              <td className="py-2.5 px-3 text-navy-600">Official state legislature databases (AZ, CA, TX, NY, FL primary; 45 states referral)</td>
                              <td className="py-2.5 px-3 text-navy-600">Official government sources; scraped and validated against legislative APIs</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800 font-medium">Case Law</td>
                              <td className="py-2.5 px-3 text-navy-600">Published appellate decisions from public court databases</td>
                              <td className="py-2.5 px-3 text-navy-600">Cross-referenced with court record systems; citation provenance tracked</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800 font-medium">Court Forms</td>
                              <td className="py-2.5 px-3 text-navy-600">Official court self-help forms from state judicial websites</td>
                              <td className="py-2.5 px-3 text-navy-600">Downloaded from .gov domains; version-tracked for currency</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800 font-medium">Legal Aid Content</td>
                              <td className="py-2.5 px-3 text-navy-600">Attorney-reviewed educational materials from legal aid organizations</td>
                              <td className="py-2.5 px-3 text-navy-600">Partnership agreements; attorney sign-off on inclusion</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800 font-medium">Regulatory Guidance</td>
                              <td className="py-2.5 px-3 text-navy-600">Federal and state agency guidance documents, FAQs, and rule interpretations</td>
                              <td className="py-2.5 px-3 text-navy-600">Official agency publications; freshness checked quarterly</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">Data Exclusions</h4>
                      <ul className="space-y-1.5 text-sm text-navy-600">
                        <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" /> No user conversation data used for retrieval or training</li>
                        <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" /> No scraped attorney-client communications</li>
                        <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" /> No social media or user-generated content</li>
                        <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" /> No sealed, expunged, or juvenile records</li>
                      </ul>
                    </div>
                  </div>
                </Section>
              )}

              {activeSection === 'performance' && (
                <Section title="Performance & Limitations">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-3">Performance Metrics</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <MetricCard label="Citation Accuracy" value="94.2%" description="Verified correct statute/case citations in sampled responses" />
                        <MetricCard label="Jurisdiction Precision" value="97.8%" description="Correct identification of applicable state law" />
                        <MetricCard label="Crisis Detection Recall" value="99.1%" description="Successfully identified crisis signals requiring escalation" />
                        <MetricCard label="Spanish Parity Score" value="91.6%" description="Equivalence of Spanish responses vs. English (quality-assessed)" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">Known Limitations</h4>
                      <ul className="space-y-2 text-sm text-navy-600">
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Temporal lag:</strong> Statutes are refreshed quarterly; very recent legislative changes (0-90 days) may not be reflected.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Jurisdiction depth:</strong> Only 5 states have full coverage (AZ, CA, TX, NY, FL). Others receive referral-only responses directing to local legal aid.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Practice area boundaries:</strong> Criminal defense, immigration removal proceedings, and active litigation strategy are explicitly excluded and escalated to attorneys.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Factual grounding:</strong> While RAG reduces hallucination, no AI system achieves zero hallucination. All responses carry disclaimer and citation requirements.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Cultural nuance:</strong> Legal concepts that vary by cultural context (e.g., common-law marriage recognition) may require additional user clarification.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Section>
              )}

              {activeSection === 'fairness' && (
                <Section title="Fairness & Bias Testing">
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-800 mb-1">Bias Testing Schedule</p>
                      <p className="text-sm text-blue-700">Quarterly automated bias sweeps across all protected categories. Monthly manual spot-checks by bilingual legal reviewers. Annual third-party algorithmic audit.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-3">Protected Categories Tested</h4>
                      <div className="grid gap-2 sm:grid-cols-2 text-sm">
                        {['Race / Ethnicity', 'National Origin / Immigration Status', 'Language (English vs. Spanish)', 'Gender / Gender Identity', 'Age', 'Disability Status', 'Income Level / Socioeconomic Status', 'Geographic Location (urban vs. rural)'].map((cat) => (
                          <div key={cat} className="flex items-center gap-2 text-navy-600 bg-navy-50 rounded px-3 py-2">
                            <CheckCircle className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">Bias Mitigation Measures</h4>
                      <ul className="space-y-2 text-sm text-navy-600">
                        <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Equivalent response quality verified between English and Spanish outputs</li>
                        <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Income-neutral access: free tier provides full legal information without degradation</li>
                        <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Attorney matching algorithm audited for geographic and demographic fairness</li>
                        <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Pro bono pathway ensures access for users who cannot pay any amount</li>
                        <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Disparate impact testing on escalation rates by demographic cohort</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">Report Bias</h4>
                      <p className="text-sm text-navy-600">If you observe biased, unfair, or discriminatory outputs, report them via our <Link to="/trust-center" className="text-teal-600 hover:text-teal-700 underline">Trust & Safety portal</Link>. All bias reports are reviewed within 24 hours and escalated to the AI Governance Board.</p>
                    </div>
                  </div>
                </Section>
              )}

              {activeSection === 'safety' && (
                <Section title="Safety & Escalation">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-3">Escalation Triggers</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-navy-200">
                              <th className="text-left py-2 px-3 font-semibold text-navy-700">Trigger</th>
                              <th className="text-left py-2 px-3 font-semibold text-navy-700">Action</th>
                              <th className="text-left py-2 px-3 font-semibold text-navy-700">Response Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-navy-100">
                            <tr>
                              <td className="py-2.5 px-3 text-red-700 font-medium">Suicidal ideation / self-harm</td>
                              <td className="py-2.5 px-3 text-navy-600">Immediate 988 Lifeline + crisis resources; chat input disabled</td>
                              <td className="py-2.5 px-3 text-navy-600">Instant (0 latency)</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-red-700 font-medium">Domestic violence / immediate danger</td>
                              <td className="py-2.5 px-3 text-navy-600">National DV Hotline + quick-exit button; legal chat paused</td>
                              <td className="py-2.5 px-3 text-navy-600">Instant (0 latency)</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-amber-700 font-medium">High-stakes legal decision</td>
                              <td className="py-2.5 px-3 text-navy-600">Attorney referral mandatory; AI provides information only with explicit disclaimer</td>
                              <td className="py-2.5 px-3 text-navy-600">Within response</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-amber-700 font-medium">Imminent deadline (&lt;72 hours)</td>
                              <td className="py-2.5 px-3 text-navy-600">Urgent escalation banner; legal aid referral with expedited matching</td>
                              <td className="py-2.5 px-3 text-navy-600">Within response</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-navy-700 font-medium">Low confidence response</td>
                              <td className="py-2.5 px-3 text-navy-600">Confidence indicator shown; suggestion to verify with attorney; no definitive statement</td>
                              <td className="py-2.5 px-3 text-navy-600">Within response</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">UPL (Unauthorized Practice of Law) Safeguards</h4>
                      <ul className="space-y-2 text-sm text-navy-600">
                        <li className="flex items-start gap-2"><Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Every response includes "This is legal information, not legal advice" disclaimer</li>
                        <li className="flex items-start gap-2"><Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> No attorney-client relationship created through platform use</li>
                        <li className="flex items-start gap-2"><Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> System cannot file documents, represent users, or appear in court</li>
                        <li className="flex items-start gap-2"><Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> High-stakes scenarios trigger mandatory attorney referral before proceeding</li>
                        <li className="flex items-start gap-2"><Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Scope limitations page accessible from every chat interaction</li>
                      </ul>
                    </div>
                  </div>
                </Section>
              )}

              {activeSection === 'oversight' && (
                <Section title="Human Oversight">
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-green-800 mb-1">Right to Human Decision</p>
                      <p className="text-sm text-green-700">Every user has the unconditional right to reject AI-generated information and request connection to a human attorney at any point in their interaction. This right cannot be waived and is available regardless of payment tier.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-3">Oversight Architecture</h4>
                      <ul className="space-y-2 text-sm text-navy-600">
                        <li className="flex items-start gap-2"><Eye className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> <strong>Pre-deployment:</strong> All prompts, RAG configurations, and escalation rules reviewed by licensed attorneys before deployment</li>
                        <li className="flex items-start gap-2"><Eye className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> <strong>Runtime:</strong> Crisis detection operates independently of AI model; hard-coded safety rules cannot be overridden by prompt injection</li>
                        <li className="flex items-start gap-2"><Eye className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> <strong>Post-deployment:</strong> Weekly sample audits of AI responses by legal team; bias sweep reports reviewed monthly</li>
                        <li className="flex items-start gap-2"><Eye className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> <strong>User-triggered:</strong> "Talk to a human" button available in every chat session; no AI gating on human access</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">AI Governance Board</h4>
                      <p className="text-sm text-navy-600 mb-3">Decisions about AI system changes, escalation thresholds, and bias remediation are made by a cross-functional board including:</p>
                      <div className="grid gap-2 sm:grid-cols-2 text-sm">
                        {['Licensed attorney (access-to-justice background)', 'AI/ML engineer (technical safety)', 'Compliance officer (regulatory)', 'Community representative (user advocate)', 'Privacy officer (data protection)', 'External ethics advisor (rotational)'].map((member) => (
                          <div key={member} className="flex items-center gap-2 text-navy-600 bg-navy-50 rounded px-3 py-2">
                            <Users className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                            {member}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {activeSection === 'maintenance' && (
                <Section title="Monitoring & Updates">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-3">Continuous Monitoring</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-navy-200">
                              <th className="text-left py-2 px-3 font-semibold text-navy-700">Metric</th>
                              <th className="text-left py-2 px-3 font-semibold text-navy-700">Frequency</th>
                              <th className="text-left py-2 px-3 font-semibold text-navy-700">Threshold</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-navy-100">
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800">Citation accuracy</td>
                              <td className="py-2.5 px-3 text-navy-600">Daily automated check (sample)</td>
                              <td className="py-2.5 px-3 text-navy-600">&gt;90% or alert triggered</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800">Crisis detection recall</td>
                              <td className="py-2.5 px-3 text-navy-600">Continuous (every message)</td>
                              <td className="py-2.5 px-3 text-navy-600">&gt;98% or system pause</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800">Bias disparity (language)</td>
                              <td className="py-2.5 px-3 text-navy-600">Monthly</td>
                              <td className="py-2.5 px-3 text-navy-600">&lt;5% quality gap or remediation</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800">User safety reports</td>
                              <td className="py-2.5 px-3 text-navy-600">24-hour review SLA</td>
                              <td className="py-2.5 px-3 text-navy-600">0 unresolved critical reports &gt;48hrs</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-navy-800">Model drift detection</td>
                              <td className="py-2.5 px-3 text-navy-600">Weekly comparison against baselines</td>
                              <td className="py-2.5 px-3 text-navy-600">&lt;3% deviation or investigation</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">Update Policy</h4>
                      <ul className="space-y-2 text-sm text-navy-600">
                        <li className="flex items-start gap-2"><RefreshCw className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Knowledge base (statutes, forms): Quarterly refresh with emergency patches for breaking legislative changes</li>
                        <li className="flex items-start gap-2"><RefreshCw className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Foundation model version: Evaluated bi-annually; any model change requires full regression testing + bias audit</li>
                        <li className="flex items-start gap-2"><RefreshCw className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Safety rules: Updated within 24 hours when new crisis patterns identified</li>
                        <li className="flex items-start gap-2"><RefreshCw className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" /> Model Card: Updated with every material change; version history maintained</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-2">Incident Response</h4>
                      <p className="text-sm text-navy-600">If a critical safety failure is detected (missed crisis signal, harmful output, privacy breach), the system can be paused within 5 minutes via kill switch. Post-incident review occurs within 24 hours with findings published to this Model Card.</p>
                    </div>
                  </div>
                </Section>
              )}
            </div>
          </div>

          <div className="mt-16 border-t border-navy-200 pt-8">
            <div className="bg-navy-50 rounded-xl p-6">
              <h3 className="font-bold text-navy-900 mb-2">Regulatory Alignment</h3>
              <p className="text-sm text-navy-600 mb-4">This Model Card satisfies documentation requirements under:</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: 'EU AI Act', detail: 'Art. 11, 13 (transparency)' },
                  { name: 'NIST AI RMF', detail: 'Map, Measure, Manage functions' },
                  { name: 'ISO/IEC 42001', detail: 'AI management system documentation' },
                  { name: 'Colorado AI Act', detail: 'Consumer transparency obligations' },
                ].map((reg) => (
                  <div key={reg.name} className="bg-white rounded-lg border border-navy-200 p-3">
                    <p className="font-semibold text-navy-800 text-sm">{reg.name}</p>
                    <p className="text-xs text-navy-500 mt-0.5">{reg.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-navy-900 mb-6 pb-3 border-b border-navy-200">{title}</h2>
      {children}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline py-2.5 border-b border-navy-100 last:border-0">
      <dt className="sm:w-48 flex-shrink-0 text-sm font-medium text-navy-500">{label}</dt>
      <dd className="text-sm text-navy-800 font-medium mt-0.5 sm:mt-0">{value}</dd>
    </div>
  );
}

function MetricCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="bg-navy-50 rounded-lg border border-navy-200 p-4">
      <p className="text-2xl font-bold text-teal-700">{value}</p>
      <p className="font-semibold text-navy-800 text-sm mt-1">{label}</p>
      <p className="text-xs text-navy-500 mt-1">{description}</p>
    </div>
  );
}
