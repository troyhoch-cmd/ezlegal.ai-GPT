import { useState } from 'react';
import {
  Shield,
  Home,
  Briefcase,
  Car,
  Scale,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Download,
  Share2
} from 'lucide-react';

interface RightsCategory {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  rights: {
    title: string;
    do: string[];
    dont: string[];
    emergency?: string;
  }[];
}

const RIGHTS_CATEGORIES: RightsCategory[] = [
  {
    id: 'ice',
    icon: Shield,
    title: 'Si ICE Toca Tu Puerta',
    subtitle: 'Tus derechos ante inmigración',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    rights: [
      {
        title: 'En tu casa',
        do: [
          'NO ABRAS la puerta - pregunta si tienen una orden judicial firmada por un JUEZ',
          'Si muestran una orden, pídela por debajo de la puerta o por la ventana',
          'Verifica que la orden tenga tu NOMBRE y DIRECCIÓN correctos',
          'Tienes derecho a guardar silencio - di "Quiero hablar con un abogado"',
          'Puedes grabar el encuentro desde dentro de tu casa'
        ],
        dont: [
          'NO firmes nada sin hablar con un abogado primero',
          'NO mientas ni des documentos falsos',
          'NO corras ni te resistas físicamente',
          'NO digas dónde naciste ni tu estatus migratorio'
        ],
        emergency: 'Línea de emergencia: 1-800-354-9796'
      },
      {
        title: 'En la calle o en tu trabajo',
        do: [
          'Pregunta "¿Soy libre de irme?" - Si dicen sí, vete calmadamente',
          'Tienes derecho a guardar silencio',
          'Puedes decir "No consiento a una búsqueda"',
          'Memoriza el número de un abogado o de la línea de ayuda'
        ],
        dont: [
          'NO corras ni hagas movimientos bruscos',
          'NO contestes preguntas sobre tu estatus',
          'NO muestres documentos de otro país'
        ]
      }
    ]
  },
  {
    id: 'work',
    icon: Briefcase,
    title: 'Tus Derechos en el Trabajo',
    subtitle: 'Sin importar tu estatus migratorio',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    rights: [
      {
        title: 'Derecho al salario mínimo',
        do: [
          'Tienes derecho al salario mínimo de tu estado',
          'Tienes derecho a horas extra (tiempo y medio después de 40 horas)',
          'Tu patrón NO puede amenazarte con llamar a inmigración',
          'Guarda todos tus recibos de pago y horas trabajadas'
        ],
        dont: [
          'NO aceptes que te paguen menos del mínimo',
          'NO trabajes "de gratis" ni horas no pagadas',
          'NO tengas miedo de reportar - hay protecciones para ti'
        ]
      },
      {
        title: 'Discriminación y acoso',
        do: [
          'Tienes derecho a un ambiente de trabajo seguro',
          'Puedes reportar discriminación por raza, origen, sexo',
          'Documenta todo: fechas, testigos, mensajes',
          'Puedes presentar queja ante EEOC sin importar tu estatus'
        ],
        dont: [
          'NO aceptes acoso sexual o comentarios racistas',
          'NO dejes que el miedo te impida reportar'
        ]
      },
      {
        title: 'Si te deben dinero',
        do: [
          'Puedes demandar por salarios no pagados',
          'Tienes 2-3 años para reclamar (depende del estado)',
          'Puedes recuperar salarios aunque ya no trabajes ahí',
          'Las cortes laborales generalmente no preguntan sobre estatus'
        ],
        dont: [
          'NO firmes documentos que dicen que te pagaron si no es cierto',
          'NO esperes demasiado - hay límites de tiempo'
        ]
      }
    ]
  },
  {
    id: 'housing',
    icon: Home,
    title: 'Tus Derechos de Vivienda',
    subtitle: 'Como inquilino en Estados Unidos',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    rights: [
      {
        title: 'Desalojos',
        do: [
          'Tu casero DEBE darte aviso por escrito antes de desalojarte',
          'El aviso debe darte tiempo (usualmente 30-60 días)',
          'Tienes derecho a ir a corte y defender tu caso',
          'Puedes pedir tiempo adicional al juez'
        ],
        dont: [
          'NO te vayas solo porque el casero te dice - necesita orden de corte',
          'NO ignores los papeles de la corte',
          'El casero NO puede cambiar las cerraduras sin orden judicial'
        ]
      },
      {
        title: 'Depósito y reparaciones',
        do: [
          'Tienes derecho a que te devuelvan tu depósito',
          'Documenta con fotos el estado del apartamento al entrar y salir',
          'Tu casero debe hacer reparaciones necesarias',
          'Puedes llamar al inspector de vivienda si hay problemas serios'
        ],
        dont: [
          'NO pagues más de lo que dice tu contrato',
          'NO hagas reparaciones mayores sin permiso escrito'
        ]
      }
    ]
  },
  {
    id: 'police',
    icon: Scale,
    title: 'Con la Policía',
    subtitle: 'Tus derechos constitucionales',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    rights: [
      {
        title: 'Si te detienen',
        do: [
          'Tienes derecho a guardar silencio - úsalo',
          'Tienes derecho a un abogado - pídelo',
          'Mantén las manos visibles y calmadas',
          'Puedes preguntar "¿Soy libre de irme?"'
        ],
        dont: [
          'NO corras ni te resistas',
          'NO mientas - mejor guarda silencio',
          'NO consientas a búsquedas - di "No consiento"',
          'NO firmes nada sin entenderlo'
        ]
      },
      {
        title: 'Si te arrestan',
        do: [
          'Da solo tu nombre',
          'Pide hablar con un abogado inmediatamente',
          'Tienes derecho a una llamada telefónica',
          'Recuerda: la policía puede mentirte, tú no deberías mentirles'
        ],
        dont: [
          'NO hables de tu caso con otros detenidos',
          'NO firmes una declaración sin abogado',
          'NO te declares culpable sin hablar con un abogado'
        ],
        emergency: 'Si te arrestan, llama a un familiar para que contacte a un abogado'
      }
    ]
  },
  {
    id: 'traffic',
    icon: Car,
    title: 'En el Tráfico',
    subtitle: 'Si te para la policía',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    rights: [
      {
        title: 'Durante la parada',
        do: [
          'Detente en un lugar seguro y apaga el motor',
          'Mantén las manos en el volante donde se vean',
          'Da tu licencia y registro si te los piden',
          'Puedes grabar la interacción en muchos estados'
        ],
        dont: [
          'NO bajes del carro a menos que te lo pidan',
          'NO busques en tu bolsa/guantera sin avisar primero',
          'NO consientas a buscar tu carro - di "No consiento"',
          'NO discutas con el oficial'
        ]
      },
      {
        title: 'Si no tienes licencia',
        do: [
          'Mantén la calma y sé respetuoso',
          'En algunos estados, la policía local no puede detenerte por inmigración',
          'Conoce las leyes de tu estado - algunas ciudades son "santuario"'
        ],
        dont: [
          'NO manejes si puedes evitarlo',
          'NO des identificación de otro país si no te la piden'
        ]
      }
    ]
  }
];

export default function KnowYourRightsSection() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('ice');
  const [expandedRight, setExpandedRight] = useState<string | null>(null);

  return (
    <section lang="es" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Shield className="w-4 h-4" />
            INFORMACIÓN IMPORTANTE
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Conoce Tus Derechos
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            No importa tu estatus migratorio, tienes derechos constitucionales en Estados Unidos.
            Conocerlos puede protegerte a ti y a tu familia.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {RIGHTS_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setExpandedCategory(category.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                  expandedCategory === category.id
                    ? 'bg-slate-800 border-2 border-teal-500'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center`}>
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{category.title}</div>
                  <div className="text-sm text-slate-400">{category.subtitle}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {RIGHTS_CATEGORIES.filter(c => c.id === expandedCategory).map((category) => (
              <div key={category.id} className="space-y-4">
                {category.id === 'ice' && (
                  <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <div>
                        <div className="font-semibold text-white">Si ICE está en tu puerta AHORA:</div>
                        <a href="tel:+18003549796" className="text-red-300 hover:text-red-200 font-bold">
                          Llama: 1-800-354-9796 (Línea de Emergencia 24/7)
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {category.rights.map((right, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedRight(expandedRight === `${category.id}-${index}` ? null : `${category.id}-${index}`)}
                      className="w-full p-5 flex items-center justify-between text-left"
                    >
                      <h4 className="font-semibold text-white text-lg">{right.title}</h4>
                      {expandedRight === `${category.id}-${index}` ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {expandedRight === `${category.id}-${index}` && (
                      <div className="px-5 pb-5 space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="font-semibold text-green-400">SÍ PUEDES / DEBES:</span>
                          </div>
                          <ul className="space-y-2">
                            {right.do.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-300">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="font-semibold text-red-400">NO DEBES:</span>
                          </div>
                          <ul className="space-y-2">
                            {right.dont.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-300">
                                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {right.emergency && (
                          <div className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-amber-400">
                              <Phone className="w-4 h-4" />
                              <span className="font-semibold">{right.emergency}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <div className="bg-gradient-to-r from-teal-900/50 to-emerald-900/50 border border-teal-500/30 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-semibold text-white mb-1">
                        Descarga esta guía para tenerla siempre
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Guarda en tu teléfono o imprime para tu familia
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                      <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                        <Share2 className="w-4 h-4" />
                        Compartir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
