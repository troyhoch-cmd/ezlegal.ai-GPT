import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AlertTriangle, CheckCircle, FileText, Globe, MapPin,
  Shield, Tag, Users, Clock, ArrowRight, Download
} from 'lucide-react';

const MOCK_CASE = {
  clientId: 'DEMO-2026-0524',
  language: 'es',
  state: 'AZ',
  issue: 'Housing / Eviction',
  issueEs: 'Vivienda / Desalojo',
  urgency: 'court-date',
  urgencyLabel: 'Court deadline within 5 days',
  tags: ['eviction', 'lease-dispute', 'low-income', 'spanish-speaking'],
  summary: 'Client received a 5-day eviction notice. Lease is month-to-month. Client reports paying rent on time but landlord claims non-payment. Client has receipts. Court date in 4 days.',
  summaryEs: 'El cliente recibió un aviso de desalojo de 5 días. El contrato es mes a mes. El cliente reporta haber pagado la renta a tiempo pero el propietario reclama falta de pago. El cliente tiene recibos. Fecha de tribunal en 4 días.',
  nextSteps: [
    'Contact local legal aid for emergency representation',
    'Gather payment receipts and lease agreement',
    'File response with court before deadline',
    'Document all landlord communications',
  ],
  referralReady: true,
};

export default function DemoLegalAid() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [activeTab, setActiveTab] = useState<'intake' | 'summary' | 'export'>('intake');

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col">
      <Navigation />

      <main id="main-content" className="flex-1 pt-20 pb-16">
        {/* Demo banner */}
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
            <p className="text-sm text-amber-800 font-medium">
              {en
                ? 'This is a prototype demonstration and does not submit information to a legal-aid organization.'
                : 'Esta es una demostración de prototipo y no envía información a una organización de ayuda legal.'}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {en ? 'Legal Aid Intake Demo' : 'Demostración de Admisión Legal'}
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {en
                ? 'See how legal-aid organizations can use ezLegal to triage clients, flag urgency, and generate referral-ready summaries.'
                : 'Vea cómo las organizaciones de ayuda legal pueden usar ezLegal para clasificar clientes, marcar urgencias y generar resúmenes listos para referencia.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-200 mb-8">
            {([
              { id: 'intake' as const, label: en ? 'Client Intake' : 'Admisión', icon: Users },
              { id: 'summary' as const, label: en ? 'Case Summary' : 'Resumen', icon: FileText },
              { id: 'export' as const, label: en ? 'Export / Referral' : 'Exportar / Referir', icon: Download },
            ]).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Intake tab */}
          {activeTab === 'intake' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">{en ? 'Guided Triage Flow' : 'Flujo de Triaje Guiado'}</h3>
                <p className="text-sm text-slate-600 mb-4">
                  {en
                    ? 'The client completes a 4-step guided intake that collects:'
                    : 'El cliente completa una admisión guiada de 4 pasos que recopila:'}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {([
                    { icon: Users, text: en ? 'Persona type (individual, business, org)' : 'Tipo de persona (individual, negocio, org)' },
                    { icon: Tag, text: en ? 'Issue area (housing, family, etc.)' : 'Área de problema (vivienda, familia, etc.)' },
                    { icon: Clock, text: en ? 'Urgency level' : 'Nivel de urgencia' },
                    { icon: MapPin, text: en ? 'State / jurisdiction' : 'Estado / jurisdicción' },
                    { icon: Globe, text: en ? 'Language preference (persisted)' : 'Preferencia de idioma (persistente)' },
                    { icon: Shield, text: en ? 'Safety screening (DV, immigration)' : 'Evaluación de seguridad (VD, inmigración)' },
                  ]).map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                        <Icon className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                        <span className="text-sm text-slate-700">{item.text}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Link
                    to="/start?persona=organization"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors text-sm"
                  >
                    {en ? 'Try the intake flow' : 'Probar el flujo de admisión'} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="bg-teal-50 rounded-xl border border-teal-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3">{en ? 'Bilingual Support' : 'Soporte Bilingüe'}</h3>
                <p className="text-sm text-slate-600 mb-3">
                  {en
                    ? 'The entire intake flow works in both English and Spanish. Language choice persists across pages and sessions.'
                    : 'Todo el flujo de admisión funciona en inglés y español. La preferencia de idioma persiste entre páginas y sesiones.'}
                </p>
                <Link
                  to="/start?lang=es"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors text-sm"
                >
                  <Globe className="w-4 h-4" /> {en ? 'Preview Spanish intake' : 'Vista previa en español'}
                </Link>
              </div>
            </div>
          )}

          {/* Summary tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">{en ? 'Case Summary (Sample)' : 'Resumen de Caso (Ejemplo)'}</h3>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">DEMO</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 font-medium mb-1">{en ? 'Case ID' : 'ID de Caso'}</p>
                    <p className="text-sm font-mono text-slate-800">{MOCK_CASE.clientId}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 font-medium mb-1">{en ? 'Language' : 'Idioma'}</p>
                    <p className="text-sm text-slate-800">Spanish (es)</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 font-medium mb-1">{en ? 'State' : 'Estado'}</p>
                    <p className="text-sm text-slate-800">Arizona (AZ)</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    <AlertTriangle className="w-3 h-3" /> {en ? 'Urgent' : 'Urgente'}
                  </span>
                  {MOCK_CASE.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">{tag}</span>
                  ))}
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">{en ? 'Issue' : 'Problema'}</h4>
                  <p className="text-sm text-slate-700">{en ? MOCK_CASE.issue : MOCK_CASE.issueEs}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">{en ? 'Plain-Language Summary' : 'Resumen en Lenguaje Simple'}</h4>
                  <p className="text-sm text-slate-700">{en ? MOCK_CASE.summary : MOCK_CASE.summaryEs}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">{en ? 'Possible Next Steps' : 'Posibles Próximos Pasos'}</h4>
                  <ul className="space-y-2">
                    {MOCK_CASE.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" aria-hidden="true" />
                        <span className="text-sm text-slate-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  {en
                    ? 'This is legal information, not legal advice. The summary is generated to assist legal aid staff in triage, not to replace professional assessment.'
                    : 'Esto es información legal, no asesoría legal. El resumen se genera para asistir al personal de ayuda legal en el triaje, no para reemplazar la evaluación profesional.'}
                </p>
              </div>
            </div>
          )}

          {/* Export tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">{en ? 'Referral Readiness Checklist' : 'Lista de Verificación para Referencia'}</h3>
                <div className="space-y-3">
                  {([
                    { done: true, text: en ? 'Issue area identified' : 'Área de problema identificada' },
                    { done: true, text: en ? 'Urgency level assessed' : 'Nivel de urgencia evaluado' },
                    { done: true, text: en ? 'State / jurisdiction confirmed' : 'Estado / jurisdicción confirmado' },
                    { done: true, text: en ? 'Language preference recorded' : 'Preferencia de idioma registrada' },
                    { done: true, text: en ? 'Safety screening completed' : 'Evaluación de seguridad completada' },
                    { done: true, text: en ? 'Plain-language summary generated' : 'Resumen en lenguaje simple generado' },
                    { done: false, text: en ? 'Client consent for data sharing (required)' : 'Consentimiento del cliente para compartir datos (requerido)' },
                  ]).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.done ? (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <span className={`text-sm ${item.done ? 'text-slate-700' : 'text-slate-500'}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3">{en ? 'Export Options (Prototype)' : 'Opciones de Exportación (Prototipo)'}</h3>
                <p className="text-sm text-slate-600 mb-4">
                  {en
                    ? 'In production, summaries can be exported to your case management system or printed for referral.'
                    : 'En producción, los resúmenes se pueden exportar a su sistema de gestión de casos o imprimir para referencia.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-200 text-slate-500 text-sm font-medium rounded-lg cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 inline mr-2" />{en ? 'Export PDF' : 'Exportar PDF'}
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-200 text-slate-500 text-sm font-medium rounded-lg cursor-not-allowed"
                  >
                    {en ? 'Send to CMS' : 'Enviar a CMS'}
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-200 text-slate-500 text-sm font-medium rounded-lg cursor-not-allowed"
                  >
                    {en ? 'Print Summary' : 'Imprimir Resumen'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3">{en ? 'Partner with ezLegal' : 'Asociarse con ezLegal'}</h3>
                <p className="text-sm text-slate-600 mb-4">
                  {en
                    ? 'Interested in using ezLegal for your legal aid or pro bono program? We offer bilingual intake, urgency triage, and reporting tools.'
                    : 'Le interesa usar ezLegal para su programa de ayuda legal o pro bono? Ofrecemos admisión bilingüe, triaje de urgencia y herramientas de informes.'}
                </p>
                <Link
                  to="/schedule-demo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  {en ? 'Schedule a demo' : 'Programar una demostración'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
