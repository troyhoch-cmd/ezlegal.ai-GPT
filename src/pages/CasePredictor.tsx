import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  Sparkles, CheckCircle, ArrowRight, Shield, AlertTriangle,
  BarChart3, FileText, Scale, Brain, Clock, Lock, Users, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import VerifiableTrustStrip from '../components/VerifiableTrustStrip';
import InlineEmailCapture from '../components/InlineEmailCapture';
import CoverageConfidenceIndicator from '../components/CoverageConfidenceIndicator';
import AttorneyReferralDisclosure from '../components/AttorneyReferralDisclosure';
import { AttorneyServiceDisclosure } from '../components/shared';

export default function CasePredictor() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [sampleExpanded, setSampleExpanded] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const startPrediction = () => {
    navigate('/case-predictor/start');
  };

  return (
    <div className="min-h-screen bg-white">
      {!acknowledged && (
        <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">
              {language === 'en'
                ? 'Important: This is a statistical estimate, not a legal prediction'
                : 'Importante: Esto es un estimado estadístico, no una predicción legal'}
            </h2>
            <p className="text-navy-600 text-sm mb-6 leading-relaxed">
              {language === 'en'
                ? 'This tool uses public data to estimate scenario likelihood ranges. It does NOT predict what will happen in YOUR case. Results are not legal advice.'
                : 'Esta herramienta utiliza datos públicos para estimar rangos de probabilidad de escenarios. NO predice lo que sucederá en TU caso. Los resultados no son asesoramiento legal.'}
            </p>
            <label className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-navy-300 text-teal-600 cursor-pointer"
              />
              <span className="text-sm text-navy-700">
                {language === 'en'
                  ? 'I understand this is a statistical estimate, not a prediction of my case outcome'
                  : 'Entiendo que esto es un estimado estadístico, no una predicción de mi resultado del caso'}
              </span>
            </label>
            <button
              onClick={() => setAcknowledged(true)}
              disabled={!acknowledged}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {language === 'en' ? 'Continue' : 'Continuar'}
            </button>
          </div>
        </div>
      )}

      {acknowledged && (
        <>
          <Navigation />
          <VerifiableTrustStrip className="mt-[73px]" />
          <Breadcrumbs />

          <main id="main-content" className="pt-4">
        <section className="bg-gradient-to-br from-teal-800 to-teal-900 py-10 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-teal-100 mb-6">
                  <Sparkles className="w-4 h-4 text-gold-300" />
                  {language === 'en' ? 'AI CASE PREDICTOR' : 'PREDICTOR DE CASOS IA'}
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  {language === 'en'
                    ? 'Understand Your Legal Scenario'
                    : 'Entiende Tu Escenario Legal'
                  }
                </h1>
                <p className="text-base sm:text-xl text-teal-100 mb-6 sm:mb-8 leading-relaxed">
                  {language === 'en'
                    ? 'Get a statistical scenario estimate in 2\u20133 minutes. Built for renters, workers, and small businesses \u2014 not lawyers.'
                    : 'Obtén un estimado estadístico en 2\u20133 minutos. Hecho para inquilinos, trabajadores y pequeños negocios.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button
                    onClick={startPrediction}
                    className="bg-white text-teal-800 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    {language === 'en' ? 'Start Free \u2014 2 min' : 'Comenzar Gratis \u2014 2 min'}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-teal-100">
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold-300" /> {language === 'en' ? '2\u20133 min' : '2\u20133 min'}</div>
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-gold-300" /> {language === 'en' ? '1st prediction free' : '1ra gratis'}</div>
                  <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-gold-300" /> {language === 'en' ? 'Private & secure' : 'Privado'}</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/20 relative">
                <div className="absolute top-3 right-3 bg-amber-400/90 text-navy-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {language === 'en' ? 'Example' : 'Ejemplo'}
                </div>
                <div className="mb-4 sm:mb-6 pr-20 sm:pr-0 sm:text-center">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">{language === 'en' ? 'Sample Report' : 'Informe de Ejemplo'}</h3>
                  <p className="text-teal-200 text-xs sm:text-sm">{language === 'en' ? 'Eviction Defense \u2014 Arizona' : 'Defensa de Desalojo \u2014 Arizona'}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-teal-200 text-xs sm:text-sm font-medium">{language === 'en' ? 'Scenario estimate' : 'Estimado del escenario'}</span>
                      <span className="text-2xl font-bold text-green-400 font-serif">65-78%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '72%' }} />
                    </div>
                    <p className="text-teal-100 text-xs mt-2">{language === 'en' ? 'Estimated favorable outcome range' : 'Rango estimado de resultado favorable'}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSampleExpanded(!sampleExpanded)}
                    className="sm:hidden w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
                    aria-expanded={sampleExpanded}
                  >
                    {sampleExpanded
                      ? (language === 'en' ? 'Hide details' : 'Ocultar detalles')
                      : (language === 'en' ? 'See what\u2019s inside a report' : 'Ver que incluye un informe')}
                    {sampleExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className={`${sampleExpanded ? 'block' : 'hidden'} sm:block space-y-4`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white font-serif">{language === 'en' ? 'Hundreds' : 'Cientos'}</div>
                        <div className="text-teal-300 text-xs">{language === 'en' ? 'Similar cases compared' : 'Casos similares comparados'}</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-white font-serif">5</div>
                        <div className="text-teal-300 text-xs">{language === 'en' ? 'Key factors identified' : 'Factores clave'}</div>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-teal-200 text-xs font-medium mb-2">{language === 'en' ? 'TOP FACTORS IN YOUR FAVOR:' : 'FACTORES A TU FAVOR:'}</p>
                      <ul className="space-y-1.5">
                        {[
                          language === 'en' ? 'Written lease violation by landlord' : 'Violacion escrita del arrendador',
                          language === 'en' ? 'Notice period not met (ARS 33-1368)' : 'Periodo de aviso no cumplido',
                          language === 'en' ? 'Habitability complaints documented' : 'Quejas de habitabilidad documentadas',
                        ].map((text, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-teal-100">
                            <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-teal-300/70 text-[10px] text-center italic mt-3 border-t border-white/10 pt-2">
                      {language === 'en'
                        ? 'Fictional example. Actual reports are based on your specific case details.'
                        : 'Ejemplo ficticio. Los informes reales se basan en los detalles de tu caso.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-gradient-to-br from-amber-50 to-white border-y border-amber-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              {language === 'en' ? 'Validation Status' : 'Estado de Validación'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                  <Lock className="w-3 h-3" />
                  {language === 'en' ? 'BLOCKED' : 'BLOQUEADO'}
                </span>
                <span className="text-sm text-navy-700">
                  {language === 'en'
                    ? 'Prospective accuracy study'
                    : 'Estudio de precisión prospectiva'}
                </span>
                <span className="text-xs text-navy-500 ml-auto">
                  {language === 'en'
                    ? 'Awaiting 500+ case outcomes'
                    : 'Esperando 500+ resultados de casos'}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                  <Lock className="w-3 h-3" />
                  {language === 'en' ? 'BLOCKED' : 'BLOQUEADO'}
                </span>
                <span className="text-sm text-navy-700">
                  {language === 'en'
                    ? 'Judicial outcome correlation'
                    : 'Correlación de resultado judicial'}
                </span>
                <span className="text-xs text-navy-500 ml-auto">
                  {language === 'en'
                    ? 'IRB approval pending'
                    : 'Aprobación de IRB pendiente'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-navy-900 mb-3">
                {language === 'en' ? 'How the Case Predictor Works' : 'Como Funciona el Predictor'}
              </h2>
              <p className="text-navy-500 text-sm">
                {language === 'en'
                  ? 'Takes about 2\u20133 minutes. You can review your results before subscribing.'
                  : 'Toma unos 2\u20133 minutos. Puedes ver tus resultados antes de suscribirte.'}
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: FileText,
                  title: language === 'en' ? 'Share Details' : 'Comparte Detalles',
                  desc: language === 'en'
                    ? 'Tell us your case type, state, and key facts.'
                    : 'Dinos el tipo de caso, estado y hechos clave.',
                },
                {
                  icon: Brain,
                  title: language === 'en' ? 'AI Analysis' : 'Analisis IA',
                  desc: language === 'en'
                    ? 'Our model compares your case to similar outcomes in your state.'
                    : 'Nuestro modelo compara tu caso con resultados similares.',
                },
                {
                  icon: BarChart3,
                  title: language === 'en' ? 'Get Your Estimate' : 'Obtén Tu Estimacion',
                  desc: language === 'en'
                    ? 'See an estimated likelihood range and confidence level.'
                    : 'Ve un rango de probabilidad estimado y nivel de confianza.',
                },
                {
                  icon: ArrowRight,
                  title: language === 'en' ? 'Get Next Steps' : 'Próximos Pasos',
                  desc: language === 'en'
                    ? 'Key factors and practical actions, including when to consult an attorney.'
                    : 'Factores clave y acciones practicas, incluyendo cuando consultar un abogado.',
                },
              ].map((item, i) => (
                <div key={item.title} className="text-center group">
                  <div className="w-14 h-14 bg-teal-50 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <item.icon className="w-7 h-7 text-teal-600" />
                  </div>
                  <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">{i + 1}</div>
                  <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-navy-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={startPrediction}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                {language === 'en' ? 'Start Free Case Prediction' : 'Iniciar Prediccion Gratis'}
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-navy-400 mt-3">
                {language === 'en'
                  ? 'Not legal advice. Statistical estimate only. No attorney-client relationship created.'
                  : 'No es asesoramiento legal. Solo estimacion estadistica.'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50 border-y border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">
                {language === 'en' ? 'What You Get' : 'Que Obtienes'}
              </h2>
              <p className="text-navy-500 text-sm">
                {language === 'en'
                  ? 'Every prediction includes four deliverables in one report.'
                  : 'Cada prediccion incluye cuatro entregables en un informe.'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Estimated Likelihood Range' : 'Rango de Probabilidad Estimado'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'A percentage range\u2014with a confidence level\u2014based on comparable cases in your jurisdiction. Not a guarantee.'
                    : 'Un rango de porcentaje con nivel de confianza basado en casos comparables en tu jurisdicción.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Key Factor Analysis' : 'Analisis de Factores Clave'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'The factors most likely to increase or decrease your estimated likelihood\u2014ranked by impact.'
                    : 'Los factores que mas aumentan o reducen tu probabilidad estimada, clasificados por impacto.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Similar Case Comparisons' : 'Comparaciones de Casos Similares'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'Examples of comparable cases in your state and how they were resolved, so you can see the pattern.'
                    : 'Ejemplos de casos comparables en tu estado y como se resolvieron para que puedas ver el patron.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Recommended Next Steps' : 'Próximos Pasos Recomendados'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'Practical next actions based on your estimate, including when it makes sense to consult an attorney.'
                    : 'Acciones practicas basadas en tu estimacion, incluyendo cuando tiene sentido consultar un abogado.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-3">{language === 'en' ? 'Pricing' : 'Precios'}</h2>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl border-2 border-teal-200 p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold font-serif text-navy-900 mb-2">$4.99</div>
                <p className="text-navy-500">{language === 'en' ? 'per prediction' : 'por prediccion'}</p>
              </div>
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-bold text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                {language === 'en' ? 'First prediction is FREE' : 'Primera prediccion es GRATIS'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                {[
                  language === 'en' ? 'Full prediction report' : 'Informe completo',
                  language === 'en' ? 'Factor analysis' : 'Analisis de factores',
                  language === 'en' ? 'Similar case data' : 'Datos de casos similares',
                  language === 'en' ? 'Next step recommendations' : 'Recomendaciones',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <button
                onClick={startPrediction}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                {language === 'en' ? 'Try Free Prediction' : 'Probar Prediccion Gratis'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="py-12 bg-navy-50 border-y border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-navy-900 mb-6 text-center">
              {language === 'en' ? 'Assumptions & Data Coverage' : 'Supuestos y Cobertura de Datos'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-navy-200 p-5">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'What Affects Accuracy' : 'Que Afecta la Precision'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Completeness of details you provide (more detail = narrower range)',
                    'Availability of comparable cases in your specific jurisdiction',
                    'Recency of case data (newer cases weighted more heavily)',
                    'Unique factors in your case that may not match historical patterns',
                  ] : [
                    'Completitud de los detalles que proporcionas (mas detalle = rango mas estrecho)',
                    'Disponibilidad de casos comparables en tu jurisdicción',
                    'Actualidad de los datos (casos recientes tienen mas peso)',
                    'Factores unicos en tu caso que pueden no coincidir con patrones historicos',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-navy-200 p-5">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'Data Coverage & Limitations' : 'Cobertura y Limitaciones de Datos'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Based on publicly available case outcome data from state and federal courts',
                    'Settlement outcomes (which are private) are not fully represented',
                    'Coverage varies by state and case type -- some areas have richer data',
                    'Data is updated periodically, not in real-time',
                  ] : [
                    'Basado en datos publicos de resultados de tribunales estatales y federales',
                    'Los acuerdos privados no estan completamente representados',
                    'La cobertura varia por estado y tipo de caso',
                    'Los datos se actualizan periodicamente, no en tiempo real',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 max-w-xl mx-auto">
              <CoverageConfidenceIndicator
                level="medium"
                caseType={language === 'en' ? 'Housing / Eviction' : 'Vivienda / Desalojo'}
                jurisdiction="Arizona"
              />
            </div>

            <div className="mt-8 max-w-xl mx-auto bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                {language === 'en' ? 'How We Calculate Coverage & Confidence' : 'Como Calculamos Cobertura y Confianza'}
              </h4>
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    {language === 'en' ? 'Source Coverage (25-95%)' : 'Cobertura de Fuentes (25-95%)'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Measures how many relevant statutes, case outcomes, and legal references our system found for your specific case type and jurisdiction. Higher coverage means more data points inform the estimate. It does not measure prediction accuracy.'
                      : 'Mide cuantos estatutos, resultados de casos y referencias legales relevantes encontro nuestro sistema para tu tipo de caso y jurisdicción. Mayor cobertura significa mas datos informando la estimacion. No mide la precision de la prediccion.'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    {language === 'en' ? 'Coverage Confidence (High / Medium / Low)' : 'Confianza de Cobertura (Alta / Media / Baja)'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Reflects the density and recency of publicly available case data for your state and case type. "High" means many recent comparable cases exist; "Low" means limited public data is available. Settlements and sealed cases are excluded from all calculations.'
                      : 'Refleja la densidad y actualidad de datos publicos de casos para tu estado y tipo de caso. "Alta" significa muchos casos recientes comparables; "Baja" significa datos publicos limitados. Los acuerdos y casos sellados se excluyen de todos los calculos.'}
                  </p>
                </div>
                <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-3">
                  {language === 'en'
                    ? 'These indicators help you understand the breadth of data behind your estimate -- not its correctness. Every legal situation is unique. Always consult a licensed attorney before making decisions.'
                    : 'Estos indicadores te ayudan a entender la amplitud de datos detras de tu estimacion, no su exactitud. Cada situación legal es unica. Siempre consulta un abogado antes de tomar decisiones.'}
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-md mx-auto">
              <InlineEmailCapture
                source="case_predictor"
                context="case_predictor"
                label={{
                  en: 'Email me a sample prediction report',
                  es: 'Enviar un informe de prediccion de muestra',
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AttorneyServiceDisclosure variant="expandable" context="case-predictor" />
          </div>
        </section>

        <section className="py-12 bg-amber-50 border-y border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">
                  {language === 'en' ? 'Important: What Case Predictor Is and Is Not' : 'Importante: Que Es y No Es el Predictor'}
                </h3>
                <div className="text-sm text-amber-800 space-y-2">
                  <p>{language === 'en' ? 'Case Predictor provides a statistical estimate based on publicly available case outcome data. It is NOT:' : 'El Predictor proporciona una estimacion estadistica. NO es:'}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{language === 'en' ? 'Legal advice or a guarantee of outcome' : 'Asesoramiento legal o garantia de resultado'}</li>
                    <li>{language === 'en' ? 'A substitute for consulting with a licensed attorney' : 'Un sustituto para consultar un abogado'}</li>
                    <li>{language === 'en' ? 'A determination of legal merit or viability of your case' : 'Una determinacion del merito legal de tu caso'}</li>
                  </ul>
                  <p>{language === 'en' ? 'Every case has unique circumstances. We strongly recommend consulting with an attorney before making legal decisions based on any prediction.' : 'Cada caso tiene circunstancias unicas. Recomendamos consultar un abogado antes de tomar decisiones legales.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
              <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                {language === 'en' ? 'When NOT to Rely on This Tool' : 'Cuando NO Confiar en Esta Herramienta'}
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-left">
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Imminent deadlines' : 'Fechas limite inminentes'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'If you have a court date or statute of limitations expiring soon, contact an attorney immediately.' : 'Si tienes una fecha de corte próximo, contacta un abogado.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Criminal charges' : 'Cargos criminales'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'Criminal matters require attorney representation. Predictions cannot account for prosecutor discretion.' : 'Los asuntos penales requieren representacion legal.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Custody disputes' : 'Disputas de custodia'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'Family court decisions depend on judicial discretion that predictions cannot capture.' : 'Las decisiones de custodia dependen de la discrecion judicial.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Safety concerns' : 'Preocupaciones de seguridad'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'If you are in danger, call 911 or a crisis hotline immediately.' : 'Si estas en peligro, llama al 911 inmediatamente.'}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
                <Link to="/find-attorney" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? 'Find an attorney now' : 'Encontrar abogado ahora'}</Link>
                <span className="text-red-300">|</span>
                <Link to="/pro-bono" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? "Can't afford an attorney? Pro bono options" : 'Opciones pro bono'}</Link>
                <span className="text-red-300">|</span>
                <Link to="/emergency-resources" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? 'Emergency resources' : 'Recursos de emergencia'}</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">{language === 'en' ? 'Have Questions First?' : 'Tienes Preguntas Primero?'}</h2>
            <p className="text-navy-100 mb-8 text-lg">
              {language === 'en' ? 'Start with a free question to understand your situation, then use Case Predictor when ready.' : 'Comienza con una pregunta gratis, luego usa el Predictor cuando estes listo.'}
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
            >
              {language === 'en' ? 'Ask My Question Free' : 'Hacer Mi Pregunta Gratis'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <RelatedLinks />
      <Footer />
        </>
      )}
    </div>
  );
}
