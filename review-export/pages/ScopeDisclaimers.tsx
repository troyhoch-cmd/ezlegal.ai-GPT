import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale, CheckCircle, XCircle, AlertTriangle, Shield,
  MessageSquare, Users, BookOpen, ArrowRight, HelpCircle,
  Gavel, Building2, Heart, Lock, Globe, Clock, Ban, Eye,
  AlertOctagon, MapPin, Phone, Award, FileText
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

interface TemplateRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  jurisdictions: string[];
  reviewer_name: string;
  reviewer_bar_state: string;
  last_reviewed_at: string;
  review_scope: string;
  disclaimer: string;
}

function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ScopeDisclaimers() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('document_templates')
      .select('id, slug, name, category, description, jurisdictions, reviewer_name, reviewer_bar_state, last_reviewed_at, review_scope, disclaimer')
      .eq('is_public', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setTemplates(data as TemplateRow[]);
        setTemplatesLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content">
        <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6">
                <Scale className="w-4 h-4 text-teal-300" />
                <span className="text-sm font-semibold">
                  {en ? 'Understanding Our Service' : 'Entendiendo Nuestro Servicio'}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                {en ? 'What We Do & Don\'t Do' : 'Lo Que Hacemos y No Hacemos'}
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                {en
                  ? 'Transparency is at the core of our mission. Here\'s exactly what ezLegal.ai provides and where our service ends.'
                  : 'La transparencia esta en el centro de nuestra mision. Aquí esta exactamente lo que ezLegal.ai proporciona y donde termina nuestro servicio.'
                }
              </p>
              <p className="text-sm text-white/50 mt-3">
                {en
                  ? 'Free legal information -- no attorney-client relationship -- see when to get legal help below.'
                  : 'Información legal gratuita -- sin relacion abogado-cliente -- vea cuando obtener ayuda legal abajo.'
                }
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-amber-50 border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-2">
                  {en ? 'Important Notice' : 'Aviso Importante'}
                </h2>
                <p className="text-navy-700 leading-relaxed">
                  {en ? (
                    <><strong>ezLegal.ai is not a law firm</strong> and does not provide legal advice. Use of our service does not create an attorney-client relationship. The information provided is for educational and informational purposes only. For specific legal advice tailored to your situation, consult with a licensed attorney in your jurisdiction.</>
                  ) : (
                    <><strong>ezLegal.ai no es un bufete de abogados</strong> y no proporciona asesoramiento legal. El uso de nuestro servicio no crea una relacion abogado-cliente. La información proporcionada es solo para fines educativos e informativos. Para asesoramiento legal especifico adaptado a su situación, consulte con un abogado licenciado en su jurisdicción.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900">
                    {en ? 'What We DO Provide' : 'Lo Que SI Proporcionamos'}
                  </h2>
                </div>

                <ul className="space-y-4">
                  {[
                    {
                      title: en ? 'Legal Information' : 'Información Legal',
                      desc: en
                        ? 'General explanations of laws, rights, legal processes, and terminology to help you understand legal concepts.'
                        : 'Explicaciones generales de leyes, derechos, procesos legales y terminologia para ayudarlo a entender conceptos legales.',
                    },
                    {
                      title: en ? 'Jurisdiction-Aware Guidance' : 'Orientación por Jurisdicción',
                      desc: en
                        ? 'Information adapted to your location, covering relevant laws and procedures in your state or country.'
                        : 'Información adaptada a su ubicacion, cubriendo leyes y procedimientos relevantes en su estado o pais.',
                    },
                    {
                      title: en ? 'Document Templates' : 'Plantillas de Documentos',
                      desc: en
                        ? 'Customizable legal document templates including NDAs, contracts, letters, and forms you can adapt to your needs.'
                        : 'Plantillas de documentos legales personalizables incluyendo NDAs, contratos, cartas y formularios que puede adaptar a sus necesidades.',
                    },
                    {
                      title: en ? 'Attorney Directory' : 'Directorio de Abogados',
                      desc: en
                        ? 'Access to our network of verified, bar-licensed attorneys when you need professional representation.'
                        : 'Acceso a nuestra red de abogados verificados y licenciados cuando necesite representacion profesional.',
                    },
                    {
                      title: en ? 'Educational Resources' : 'Recursos Educativos',
                      desc: en
                        ? 'Plain-language articles, guides, and explanations to help you understand your rights and options.'
                        : 'Articulos, guias y explicaciones en lenguaje simple para ayudarlo a entender sus derechos y opciones.',
                    },
                    {
                      title: en ? '24/7 Availability' : 'Disponibilidad 24/7',
                      desc: en
                        ? 'Get answers to your legal questions anytime, day or night, without waiting for office hours.'
                        : 'Obtenga respuestas a sus preguntas legales en cualquier momento, dia o noche, sin esperar horarios de oficina.',
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-navy-900">{item.title}</strong>
                        <p className="text-navy-600 text-sm mt-1">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900">
                    {en ? 'What We DON\'T Provide' : 'Lo Que NO Proporcionamos'}
                  </h2>
                </div>

                <ul className="space-y-4">
                  {[
                    {
                      title: en ? 'Legal Advice' : 'Asesoramiento Legal',
                      desc: en
                        ? 'We cannot tell you what to do in your specific situation or recommend a course of action. That requires a licensed attorney.'
                        : 'No podemos decirle que hacer en su situación especifica ni recomendar un curso de accion. Eso requiere un abogado licenciado.',
                    },
                    {
                      title: en ? 'Attorney-Client Privilege' : 'Privilegio Abogado-Cliente',
                      desc: en
                        ? 'Using ezLegal.ai does not create a privileged relationship. Your conversations are not protected by attorney-client privilege.'
                        : 'Usar ezLegal.ai no crea una relacion privilegiada. Sus conversaciones no estan protegidas por el privilegio abogado-cliente.',
                    },
                    {
                      title: en ? 'Court Representation' : 'Representacion en Corte',
                      desc: en
                        ? 'We cannot represent you in court, file legal documents on your behalf, or appear as your counsel.'
                        : 'No podemos representarlo en corte, presentar documentos legales en su nombre, ni aparecer como su abogado.',
                    },
                    {
                      title: en ? 'Guaranteed Outcomes' : 'Resultados Garantizados',
                      desc: en
                        ? 'We cannot predict or guarantee the outcome of any legal matter. Every case is unique and depends on many factors.'
                        : 'No podemos predecir ni garantizar el resultado de ningun asunto legal. Cada caso es unico y depende de muchos factores.',
                    },
                    {
                      title: en ? 'Negotiation on Your Behalf' : 'Negociacion en Su Nombre',
                      desc: en
                        ? 'We cannot negotiate with opposing parties, insurance companies, employers, or any third parties for you.'
                        : 'No podemos negociar con partes contrarias, companias de seguros, empleadores u otros terceros en su nombre.',
                    },
                    {
                      title: en ? 'Emergency Legal Services' : 'Servicios Legales de Emergencia',
                      desc: en
                        ? 'If you\'re facing immediate arrest, detention, or other emergencies, contact a local attorney or legal aid immediately.'
                        : 'Si enfrenta arresto inmediato, detencion u otras emergencias, contacte a un abogado local o ayuda legal inmediatamente.',
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-navy-900">{item.title}</strong>
                        <p className="text-navy-600 text-sm mt-1">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-stone-50 border-y border-stone-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-stone-600" />
                  </div>
                  <h2 className="text-xl font-bold text-navy-900">
                    {en ? 'Confidentiality & Privacy' : 'Confidencialidad y Privacidad'}
                  </h2>
                </div>
                <div className="space-y-3 text-sm text-navy-600">
                  <p>
                    <strong className="text-navy-900">{en ? 'No attorney-client privilege.' : 'Sin privilegio abogado-cliente.'}</strong>{' '}
                    {en
                      ? 'Because we are not a law firm, information you share with ezLegal.ai is not protected by attorney-client privilege. Do not share information you need to remain privileged.'
                      : 'Debido a que no somos un bufete de abogados, la información que comparte con ezLegal.ai no esta protegida por el privilegio abogado-cliente. No comparta información que necesite mantener privilegiada.'
                    }
                  </p>
                  <p>
                    <strong className="text-navy-900">{en ? 'What we store.' : 'Lo que almacenamos.'}</strong>{' '}
                    {en
                      ? 'Your conversations are encrypted with TLS 1.3 and AES-256 on SOC 2 Type II certified infrastructure. We retain chat history to improve your experience. We never use your data to train AI models.'
                      : 'Sus conversaciones estan encriptadas con TLS 1.3 y AES-256 en infraestructura certificada SOC 2 Tipo II. Retenemos el historial de chat para mejorar su experiencia. Nunca usamos sus datos para entrenar modelos de IA.'
                    }
                  </p>
                  <p>
                    <strong className="text-navy-900">{en ? 'Your control.' : 'Su control.'}</strong>{' '}
                    {en
                      ? 'You can export or delete your data at any time. We are CCPA compliant and honor all data access and deletion requests.'
                      : 'Puede exportar o eliminar sus datos en cualquier momento. Cumplimos con CCPA y honramos todas las solicitudes de acceso y eliminacion de datos.'
                    }
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    {en
                      ? 'Be cautious about entering highly sensitive details (SSNs, financial account numbers, medical records) unless necessary for your question.'
                      : 'Tenga cuidado al ingresar datos altamente sensibles (numeros de seguro social, cuentas financieras, registros medicos) a menos que sea necesario para su pregunta.'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <Ban className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-navy-900">
                    {en ? 'Prohibited Uses' : 'Usos Prohibidos'}
                  </h2>
                </div>
                <p className="text-sm text-navy-600 mb-4">
                  {en
                    ? 'ezLegal.ai must not be used for any of the following purposes. Violations may result in account suspension:'
                    : 'ezLegal.ai no debe usarse para ninguno de los siguientes propositos. Las violaciones pueden resultar en la suspension de la cuenta:'
                  }
                </p>
                <ul className="space-y-2 text-sm text-navy-700">
                  {[
                    en ? 'Harassment, threats, or intimidation of any person' : 'Acoso, amenazas o intimidacion de cualquier persona',
                    en ? 'Contacting individuals protected by restraining or court orders' : 'Contactar a personas protegidas por ordenes judiciales o de restricción',
                    en ? 'Generating discriminatory, defamatory, or hate-based content' : 'Generar contenido discriminatorio, difamatorio o basado en odio',
                    en ? 'Fraud, deception, or evasion of lawful obligations' : 'Fraude, engano o evasion de obligaciones legales',
                    en ? 'Unauthorized practice of law or impersonating an attorney' : 'Practica no autorizada del derecho o hacerse pasar por abogado',
                    en ? 'Creating communications intended to coerce or extort' : 'Crear comunicaciones destinadas a coaccionar o extorsionar',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertOctagon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-stone-200">
                  <Link
                    to="/trust-center"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
                  >
                    {en ? 'Report misuse' : 'Reportar mal uso'}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="templates" className="py-16 bg-white scroll-mt-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full mb-4">
                <Award className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-semibold text-navy-900">
                  {en ? 'Attorney-Reviewed Templates' : 'Plantillas Revisadas por Abogados'}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-3">
                {en ? 'Template Review Registry' : 'Registro de Revisión de Plantillas'}
              </h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                {en
                  ? 'Every template on ezLegal.ai is reviewed by a licensed U.S. attorney. The table below shows the reviewer of record, covered jurisdictions, and the most recent review date. Using a template does not create an attorney-client relationship.'
                  : 'Cada plantilla en ezLegal.ai es revisada por un abogado licenciado de EE.UU. La tabla muestra el abogado revisor, las jurisdicciones cubiertas y la fecha de revisión más reciente. Usar una plantilla no crea una relación abogado-cliente.'}
              </p>
            </div>

            {!templatesLoaded ? (
              <p className="text-center text-sm text-navy-500">{en ? 'Loading registry...' : 'Cargando registro...'}</p>
            ) : templates.length === 0 ? (
              <p className="text-center text-sm text-navy-500">{en ? 'No templates published yet.' : 'No hay plantillas publicadas.'}</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-navy-200 bg-white shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-navy-50 text-navy-800">
                    <tr>
                      <th scope="col" className="text-left font-semibold px-4 py-3">{en ? 'Template' : 'Plantilla'}</th>
                      <th scope="col" className="text-left font-semibold px-4 py-3">{en ? 'Category' : 'Categoría'}</th>
                      <th scope="col" className="text-left font-semibold px-4 py-3">{en ? 'Jurisdictions' : 'Jurisdicciones'}</th>
                      <th scope="col" className="text-left font-semibold px-4 py-3">{en ? 'Reviewer' : 'Revisor'}</th>
                      <th scope="col" className="text-left font-semibold px-4 py-3">{en ? 'Last Reviewed' : 'Última Revisión'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {templates.map((t) => (
                      <tr key={t.id} className="hover:bg-navy-50/50">
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <div>
                              <div className="font-semibold text-navy-900">{t.name}</div>
                              <div className="text-xs text-navy-500 mt-0.5 max-w-md">{t.description}</div>
                              <div className="text-[11px] text-navy-400 mt-1 italic">{t.review_scope}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="inline-block capitalize bg-navy-100 text-navy-700 text-xs font-medium rounded-full px-2.5 py-0.5">
                            {t.category.replace(/-/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap gap-1">
                            {t.jurisdictions.map((j) => (
                              <span key={j} className="inline-block bg-teal-50 text-teal-800 text-xs font-medium rounded px-1.5 py-0.5">
                                {j}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-navy-700">
                          <div className="font-medium">{t.reviewer_name}</div>
                          <div className="text-xs text-navy-500">{en ? 'Bar:' : 'Colegio:'} {t.reviewer_bar_state}</div>
                        </td>
                        <td className="px-4 py-3 align-top text-navy-700 whitespace-nowrap">
                          {formatReviewDate(t.last_reviewed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-navy-700">
              <p className="font-semibold text-navy-900 mb-1">
                {en ? 'What "attorney-reviewed" means here' : 'Qué significa "revisado por abogado" aquí'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-navy-700">
                <li>{en ? 'Reviewed by a licensed U.S. attorney admitted to the listed bar state.' : 'Revisado por un abogado licenciado admitido en el colegio indicado.'}</li>
                <li>{en ? 'Review covers legal accuracy for the listed jurisdictions, plain-language clarity, and scope disclaimers.' : 'La revisión cubre exactitud legal en las jurisdicciones listadas, claridad en lenguaje simple y avisos de alcance.'}</li>
                <li>{en ? 'Review does not cover your specific facts. Use of a template does not create an attorney-client relationship.' : 'La revisión no cubre sus hechos específicos. El uso de una plantilla no crea una relación abogado-cliente.'}</li>
                <li>{en ? 'Templates are re-reviewed at least annually or when the underlying law materially changes.' : 'Las plantillas se revisan al menos anualmente o cuando la ley subyacente cambia materialmente.'}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-teal-600" />
                  <h3 className="text-lg font-bold text-navy-900">
                    {en ? 'Accuracy & Limitations' : 'Precision y Limitaciones'}
                  </h3>
                </div>
                <div className="space-y-3 text-sm text-navy-600">
                  <p>
                    {en
                      ? 'Our AI draws from official state and federal sources, updated weekly. However:'
                      : 'Nuestra IA extrae de fuentes oficiales estatales y federales, actualizadas semanalmente. Sin embargo:'
                    }
                  </p>
                  <ul className="space-y-2">
                    {[
                      en ? 'Laws change frequently. Always verify current status with official sources before taking action.' : 'Las leyes cambian frecuentemente. Siempre verifique el estado actual con fuentes oficiales antes de tomar accion.',
                      en ? 'AI can make mistakes. If something seems incorrect, report it or consult an attorney.' : 'La IA puede cometer errores. Si algo parece incorrecto, reportelo o consulte a un abogado.',
                      en ? 'Citations are provided where available. Verify referenced statutes and case law independently.' : 'Las citas se proporcionan cuando estan disponibles. Verifique los estatutos y jurisprudencia citados de forma independiente.',
                      en ? 'Local rules and court-specific procedures may not be fully covered.' : 'Las reglas locales y procedimientos especificos de corte pueden no estar completamente cubiertos.',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold mt-0.5">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-teal-600" />
                  <h3 className="text-lg font-bold text-navy-900">
                    {en ? 'Jurisdiction & Coverage' : 'Jurisdicción y Cobertura'}
                  </h3>
                </div>
                <div className="space-y-3 text-sm text-navy-600">
                  <p>
                    {en
                      ? 'ezLegal.ai provides information for all 50 US states with primary depth in Arizona. Jurisdiction is determined by:'
                      : 'ezLegal.ai proporciona información para los 50 estados de EE.UU. con profundidad primaria en Arizona. La jurisdicción se determina por:'
                    }
                  </p>
                  <ul className="space-y-2">
                    {[
                      en ? 'Your selected state when using tools (negotiation planner, documents)' : 'Su estado seleccionado al usar herramientas (planificador de negociacion, documentos)',
                      en ? 'The context you provide in chat conversations' : 'El contexto que proporciona en conversaciones de chat',
                      en ? 'Your profile settings, if configured' : 'La configuracion de su perfil, si esta configurada',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold mt-0.5">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-stone-500 mt-2">
                    {en
                      ? 'If your jurisdiction is wrong, your results may not apply. Always confirm or change your jurisdiction before relying on guidance. Multi-state issues may require attorney consultation.'
                      : 'Si su jurisdicción es incorrecta, los resultados pueden no aplicar. Siempre confirme o cambie su jurisdicción antes de confiar en la orientación. Los problemas multi-estatales pueden requerir consulta con un abogado.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50 border-y border-navy-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                {en ? 'Legal Information vs. Legal Advice' : 'Información Legal vs. Asesoramiento Legal'}
              </h2>
              <p className="text-lg text-navy-600">
                {en
                  ? 'Understanding this distinction is crucial for using our service effectively'
                  : 'Entender esta distincion es crucial para usar nuestro servicio de manera efectiva'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-teal-600" />
                  <h3 className="text-lg font-bold text-navy-900">
                    {en ? 'Legal Information' : 'Información Legal'}
                  </h3>
                </div>
                <p className="text-navy-600 mb-4">
                  {en
                    ? 'What we provide - general knowledge about laws, rights, and processes'
                    : 'Lo que proporcionamos - conocimiento general sobre leyes, derechos y procesos'
                  }
                </p>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(en ? [
                    '"In most states, landlords must provide 30 days notice before eviction"',
                    '"An NDA typically includes confidentiality terms, duration, and exceptions"',
                    '"Employment discrimination claims often have a 180-300 day filing deadline"',
                  ] : [
                    '"En la mayoria de los estados, los caseros deben dar 30 dias de aviso antes del desalojo"',
                    '"Un NDA tipicamente incluye terminos de confidencialidad, duracion y excepciones"',
                    '"Las reclamaciones por discriminacion laboral a menudo tienen un plazo de 180-300 dias"',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">-</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Gavel className="w-6 h-6 text-amber-600" />
                  <h3 className="text-lg font-bold text-navy-900">
                    {en ? 'Legal Advice' : 'Asesoramiento Legal'}
                  </h3>
                </div>
                <p className="text-navy-600 mb-4">
                  {en
                    ? 'What only attorneys can provide - specific recommendations for your situation'
                    : 'Lo que solo los abogados pueden proporcionar - recomendaciones especificas para su situación'
                  }
                </p>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(en ? [
                    '"Based on your lease terms, you should respond by filing a motion to..."',
                    '"I recommend you sign this contract with these specific modifications..."',
                    '"Your case is strong and I advise pursuing litigation rather than settlement"',
                  ] : [
                    '"Basado en los terminos de su arrendamiento, debe responder presentando una mocion para..."',
                    '"Le recomiendo firmar este contrato con estas modificaciones especificas..."',
                    '"Su caso es fuerte y le aconsejo seguir con litigio en lugar de acuerdo"',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">-</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                {en ? 'When to Consult a Licensed Attorney' : 'Cuando Consultar a un Abogado Licenciado'}
              </h2>
              <p className="text-lg text-navy-600">
                {en
                  ? 'We\'ll always tell you when professional help would benefit your situation'
                  : 'Siempre le diremos cuando la ayuda profesional beneficiaria su situación'
                }
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: AlertTriangle,
                  iconBg: 'bg-red-100',
                  iconColor: 'text-red-600',
                  title: en ? 'Criminal Matters' : 'Asuntos Criminales',
                  desc: en
                    ? 'If you\'re facing criminal charges, under investigation, or have been arrested, immediately contact a criminal defense attorney.'
                    : 'Si enfrenta cargos criminales, esta bajo investigacion o ha sido arrestado, contacte inmediatamente a un abogado de defensa criminal.',
                },
                {
                  icon: Clock,
                  iconBg: 'bg-amber-100',
                  iconColor: 'text-amber-600',
                  title: en ? 'Urgent Deadlines' : 'Fechas Limite Urgentes',
                  desc: en
                    ? 'Court filing deadlines, statute of limitations, or response deadlines require professional attention to protect your rights.'
                    : 'Las fechas limite de presentacion ante la corte, prescripción o plazos de respuesta requieren atencion profesional para proteger sus derechos.',
                },
                {
                  icon: Building2,
                  iconBg: 'bg-teal-100',
                  iconColor: 'text-teal-600',
                  title: en ? 'High-Stakes Business' : 'Negocios de Alto Riesgo',
                  desc: en
                    ? 'Major contracts, mergers, acquisitions, or disputes with significant financial exposure should involve professional legal review.'
                    : 'Contratos importantes, fusiones, adquisiciones o disputas con exposicion financiera significativa deben involucrar revision legal profesional.',
                },
                {
                  icon: Heart,
                  iconBg: 'bg-rose-100',
                  iconColor: 'text-rose-600',
                  title: en ? 'Family & Custody' : 'Familia y Custodia',
                  desc: en
                    ? 'Child custody disputes, contested divorce, domestic violence, or guardianship matters require professional representation.'
                    : 'Disputas de custodia, divorcio contencioso, violencia doméstica o asuntos de tutela requieren representación profesional.',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                    <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                    <p className="text-navy-600 text-sm">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-gradient-to-r from-teal-50 to-navy-50 rounded-xl p-6 border border-teal-200">
              <div className="flex items-start gap-4">
                <Users className="w-8 h-8 text-teal-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">
                    {en ? 'Need an Attorney?' : 'Necesita un Abogado?'}
                  </h3>
                  <p className="text-navy-600 mb-4">
                    {en
                      ? 'Our directory includes verified, bar-licensed attorneys across multiple practice areas. We can help you find the right professional for your situation.'
                      : 'Nuestro directorio incluye abogados verificados y licenciados en multiples areas de practica. Podemos ayudarlo a encontrar al profesional adecuado para su situación.'
                    }
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/find-attorney"
                      className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700"
                    >
                      {en ? 'Browse Attorney Directory' : 'Explorar Directorio de Abogados'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/pro-bono"
                      className="inline-flex items-center gap-2 text-navy-600 font-semibold hover:text-navy-700"
                    >
                      {en ? 'Check Pro Bono Eligibility' : 'Verificar Elegibilidad Pro Bono'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Phone className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">
                    {en ? 'In Immediate Danger?' : 'En Peligro Inmediato?'}
                  </h3>
                  <p className="text-navy-600 text-sm mb-3">
                    {en
                      ? 'If you or someone you know is in immediate danger, self-help tools are not enough. Contact emergency services or crisis resources now.'
                      : 'Si usted o alguien que conoce esta en peligro inmediato, las herramientas de autoayuda no son suficientes. Contacte los servicios de emergencia o recursos de crisis ahora.'
                    }
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-700">
                      <Phone className="w-4 h-4" /> 911
                    </span>
                    <Link
                      to="/emergency-resources"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      {en ? 'Crisis Resources' : 'Recursos de Crisis'}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Shield className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                {en ? 'Our Commitment to You' : 'Nuestro Compromiso con Usted'}
              </h2>
              <p className="text-lg text-white/70">
                {en
                  ? 'Transparency, ethics, and your interests guide everything we do'
                  : 'Transparencia, etica y sus intereses guian todo lo que hacemos'
                }
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Lock,
                  iconColor: 'text-green-400',
                  title: en ? 'Privacy Protected' : 'Privacidad Protegida',
                  desc: en
                    ? 'Your conversations are encrypted with TLS 1.3 in transit and AES-256 at rest, and never used to train AI models. We\'re CCPA compliant and honor all data access and deletion requests.'
                    : 'Sus conversaciones estan encriptadas con TLS 1.3 en transito y AES-256 en reposo, y nunca se usan para entrenar modelos de IA. Cumplimos con CCPA y honramos todas las solicitudes de acceso y eliminacion de datos.',
                },
                {
                  icon: HelpCircle,
                  iconColor: 'text-teal-400',
                  title: en ? 'Honest Guidance' : 'Orientación Honesta',
                  desc: en
                    ? 'We\'ll always tell you when a matter is beyond our scope and requires professional legal help. No upselling, just honest recommendations.'
                    : 'Siempre le diremos cuando un asunto esta mas alla de nuestro alcance y requiere ayuda legal profesional. Sin ventas adicionales, solo recomendaciones honestas.',
                },
                {
                  icon: Globe,
                  iconColor: 'text-teal-400',
                  title: en ? 'Access to Justice' : 'Acceso a la Justicia',
                  desc: en
                    ? 'Our mission is to make legal information accessible to everyone, regardless of income or location. Legal knowledge should not be a luxury.'
                    : 'Nuestra mision es hacer la información legal accesible para todos, sin importar ingresos o ubicacion. El conocimiento legal no deberia ser un lujo.',
                },
                {
                  icon: Scale,
                  iconColor: 'text-amber-400',
                  title: en ? 'Ethical AI' : 'IA Etica',
                  desc: en
                    ? 'Our AI is designed with ethical guidelines, human oversight, and continuous monitoring to ensure responsible, accurate information delivery.'
                    : 'Nuestra IA esta disenada con pautas eticas, supervision humana y monitoreo continuo para garantizar la entrega responsable y precisa de información.',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <Icon className={`w-8 h-8 ${item.iconColor} mb-4`} />
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/70 text-sm">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {en ? 'Ready to Get Started?' : 'Listo para Comenzar?'}
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {en
                ? 'Now that you understand our service, explore how ezLegal.ai can help you navigate your legal questions with confidence.'
                : 'Ahora que comprende nuestro servicio, explore como ezLegal.ai puede ayudarlo a navegar sus preguntas legales con confianza.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ask"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-lg font-bold hover:bg-teal-50 transition-all shadow-lg"
              >
                <MessageSquare className="w-5 h-5" />
                {en ? 'Ask My Question Free' : 'Hacer Mi Pregunta Gratis'}
              </Link>
              <Link
                to="/find-attorney"
                className="inline-flex items-center justify-center gap-2 bg-teal-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-teal-400 transition-all border border-teal-400"
              >
                <Users className="w-5 h-5" />
                {en ? 'Find an Attorney' : 'Encontrar un Abogado'}
              </Link>
              <Link
                to="/ai-governance"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all border border-white/20"
              >
                <Shield className="w-5 h-5" />
                {en ? 'View AI Governance' : 'Ver Gobernanza de IA'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
