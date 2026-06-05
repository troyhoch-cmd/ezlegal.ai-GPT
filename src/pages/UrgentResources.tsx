import { Link } from 'react-router-dom';
import {
  AlertTriangle, Phone, Clock, Shield, Home as HomeIcon,
  Scale, Users, Heart, FileText, ArrowRight, MessageSquare
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

const URGENT_CARDS = [
  { id: 'eviction', icon: HomeIcon, label: 'Eviction or lockout', labelEs: 'Desalojo o cierre' },
  { id: 'dv', icon: Shield, label: 'Domestic violence or safety', labelEs: 'Violencia doméstica o seguridad' },
  { id: 'immigration', icon: Users, label: 'Immigration detention or hearing', labelEs: 'Detención o audiencia de inmigración' },
  { id: 'debt', icon: FileText, label: 'Debt lawsuit or wage garnishment', labelEs: 'Demanda de deuda o embargo salarial' },
  { id: 'demand', icon: Scale, label: 'Demand letter or business dispute', labelEs: 'Carta de demanda o disputa comercial' },
  { id: 'court', icon: Clock, label: 'Court papers due soon', labelEs: 'Documentos del tribunal por vencer' },
];

export default function UrgentResources() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col">
      <Navigation />

      <main id="main-content" className="flex-1 pt-20">
        {/* Non-dismissible high-risk disclaimer */}
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-800">
              {en
                ? 'ezLegal.ai provides legal information, not legal advice. AI output may be incomplete or incorrect. For urgent matters, contact a licensed attorney or legal aid organization immediately.'
                : 'ezLegal.ai proporciona información legal, no asesoría legal. La IA puede ser incompleta o incorrecta. Para asuntos urgentes, contacte a un abogado o organización de ayuda legal inmediatamente.'}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Immediate danger */}
          <section className="mb-10">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-red-600" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-red-900 mb-2">
                    {en ? 'If you are in immediate danger' : 'Si está en peligro inmediato'}
                  </h1>
                  <p className="text-red-800 font-semibold text-lg mb-1">
                    {en ? 'Call 911 or your local emergency number.' : 'Llame al 911 o su número de emergencia local.'}
                  </p>
                  <p className="text-sm text-red-700">
                    {en
                      ? 'If you are experiencing domestic violence, call the National Domestic Violence Hotline: 1-800-799-7233'
                      : 'Si está experimentando violencia doméstica, llame a la Línea Nacional: 1-800-799-7233'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Court deadline */}
          <section className="mb-10">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-amber-600" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-900 mb-2">
                    {en ? 'If you have a court deadline' : 'Si tiene una fecha límite del tribunal'}
                  </h2>
                  <p className="text-sm text-amber-800 mb-3">
                    {en
                      ? 'Deadlines can move quickly. Contact the court, legal aid, or a lawyer as soon as possible. Missing a deadline can result in a default judgment against you.'
                      : 'Las fechas límite pueden pasar rápido. Contacte al tribunal, ayuda legal o un abogado lo antes posible. Perder una fecha límite puede resultar en un fallo en su contra.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/find-attorney"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      {en ? 'Find legal aid' : 'Encontrar ayuda legal'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Common urgent issues */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {en ? 'Common urgent issues' : 'Problemas urgentes comunes'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {URGENT_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <Icon className="w-5 h-5 text-slate-600 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-800">{en ? card.label : card.labelEs}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {en
                ? 'For any of these issues, talking to a qualified attorney or legal aid organization is strongly recommended.'
                : 'Para cualquiera de estos problemas, se recomienda hablar con un abogado calificado o una organización de ayuda legal.'}
            </p>
          </section>

          {/* What ezLegal can and cannot do */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {en ? 'What ezLegal can and cannot do' : 'Lo que ezLegal puede y no puede hacer'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                <h3 className="font-bold text-teal-900 mb-3 text-sm">{en ? 'We CAN help you' : 'PODEMOS ayudarte a'}</h3>
                <ul className="space-y-2 text-sm text-teal-800">
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    {en ? 'Understand your legal situation in plain language' : 'Entender tu situación legal en lenguaje simple'}
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    {en ? 'Identify deadlines and next steps' : 'Identificar fechas límite y próximos pasos'}
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    {en ? 'Prepare documents for court or negotiation' : 'Preparar documentos para el tribunal o negociación'}
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    {en ? 'Connect you with attorneys and legal aid' : 'Conectarte con abogados y ayuda legal'}
                  </li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">{en ? 'We CANNOT' : 'NO podemos'}</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    {en ? 'Provide legal advice or representation' : 'Proporcionar asesoría legal o representación'}
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    {en ? 'Appear in court on your behalf' : 'Presentarnos en el tribunal por ti'}
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    {en ? 'Guarantee outcomes or accuracy' : 'Garantizar resultados o precisión'}
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    {en ? 'Replace a licensed attorney' : 'Reemplazar a un abogado licenciado'}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Find human help */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {en ? 'Find human help' : 'Encontrar ayuda humana'}
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link
                to="/find-attorney"
                className="flex flex-col items-center gap-2 p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-center group"
              >
                <Heart className="w-6 h-6 text-teal-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-900">{en ? 'Legal aid resources' : 'Recursos de ayuda legal'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
              </Link>
              <Link
                to="/find-attorney"
                className="flex flex-col items-center gap-2 p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-center group"
              >
                <Users className="w-6 h-6 text-teal-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-900">{en ? 'Lawyer directory' : 'Directorio de abogados'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
              </Link>
              <Link
                to="/chat"
                className="flex flex-col items-center gap-2 p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-center group"
              >
                <MessageSquare className="w-6 h-6 text-teal-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-900">{en ? 'Continue to chat' : 'Continuar al chat'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
