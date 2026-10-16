import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

// Spanish rendering of the existing policy; retains its section anchors and terms.
const sections = [
  ['introduction', '1. Introducción', [
    'Esta política explica cómo ezLegal.ai recopila, usa, comparte y protege la información de quienes visitan ezlegal.ai y utilizan sus servicios de información legal con IA. Atendemos a personas, familias, pequeñas empresas y organizaciones de asistencia legal y pro bono. LegalBreeze proporciona nuestra tecnología e IA.',
    'Ofrecemos información legal, no asesoría legal. No somos un bufete de abogados. Las comunicaciones en esta plataforma no están protegidas por el privilegio abogado-cliente. Nuestra cobertura actual se centra en Arizona.'
  ]],
  ['ethical-ai', '2. Compromiso con la IA ética', [
    'Tus conversaciones y documentos no se utilizan para entrenar nuestros modelos de IA. Identificamos las interacciones con IA y las distinguimos de los servicios humanos. Ofrecemos opciones de revisión humana para decisiones importantes, trabajamos para reducir sesgos y priorizamos el acceso a la justicia en comunidades desatendidas.'
  ]],
  ['collection', '3. Información que recopilamos', [
    'La información que proporcionas puede incluir nombre, correo electrónico, contraseña protegida y datos de contacto; estado o jurisdicción y categorías de interés; preguntas, documentos y detalles de tu asunto; mensajes a soporte y comentarios. Stripe procesa los pagos; no almacenamos números completos de tarjeta.',
    'Recopilamos información del dispositivo y navegador, sistema operativo e identificadores; páginas y funciones utilizadas, duración del uso, dirección IP, horas de acceso y registros de errores. Usamos cookies para sesiones y preferencias, y analítica con consentimiento.',
    'No solicitamos números de Seguro Social salvo cuando un formulario legal específico los requiera. No recopilamos datos biométricos, números completos de tarjeta ni, de forma intencionada, información de menores de 18 años. Evita incluir datos sensibles que no sean necesarios.'
  ]],
  ['use', '4. Cómo usamos tu información', [
    'Usamos tu información para prestar servicios de información legal y generación de documentos; encontrar recursos de asistencia legal y pro bono; adaptar la experiencia a tu jurisdicción; procesar pagos y suscripciones; enviar actualizaciones y alertas de seguridad, y promociones con consentimiento; mejorar el servicio mediante analítica agregada y anónima; y cumplir obligaciones legales y proteger nuestros derechos.'
  ]],
  ['sharing', '5. Cuándo compartimos información', [
    'Compartimos información cuando autorizas una derivación a un abogado o a un servicio pro bono; con proveedores que nos ayudan a operar, incluidos alojamiento, procesamiento de IA, pagos y analítica; cuando lo exige la ley o una orden judicial, o para proteger derechos y seguridad; y en una fusión o adquisición, con aviso.',
    'No vendemos información personal ni datos de tu asunto a anunciantes, intermediarios de datos ni terceros para fines de marketing. No podemos prometer que nunca habrá divulgación a autoridades cuando exista una obligación legal.'
  ]],
  ['security', '6. Seguridad de los datos', [
    'La política de seguridad contempla cifrado durante la transmisión y en reposo mediante nuestros proveedores de infraestructura, controles de acceso por roles y por fila, autenticación multifactor, registros de auditoría y copias de seguridad. Supabase proporciona infraestructura administrada. Los controles de acceso limitan los datos a usuarios autorizados. Consulta la información de seguridad para más detalles.'
  ]],
  ['retention', '7. Conservación de los datos', [
    'El historial de chat se conserva durante 90 días por defecto, con configuración en ajustes. Los documentos se conservan hasta que los elimines o cierres tu cuenta. Los datos de cuenta se conservan mientras esté activa y durante 30 días después de la eliminación. Las obligaciones legales pueden exigir conservar ciertos datos por más tiempo.',
    'Puedes solicitar exportar o eliminar tus datos mediante la configuración de tu cuenta o escribiendo a privacy@ezlegal.ai.'
  ]],
  ['rights', '8. Tus derechos', [
    'Según tu ubicación, puedes tener derecho a acceder a tus datos, corregirlos, solicitar su eliminación, exportarlos en un formato legible por máquina, cancelar comunicaciones comerciales y limitar el procesamiento. Usa la configuración de tu cuenta o escribe a privacy@ezlegal.ai. Respondemos a las solicitudes en un plazo de 30 días. Puedes comunicar inquietudes mediante el Centro de confianza.'
  ]],
  ['children', '9. Privacidad de menores', [
    'El servicio no está dirigido a menores de 18 años. No recopilamos intencionadamente sus datos personales. Si crees que hemos recibido información de un menor, contacta inmediatamente a privacy@ezlegal.ai.'
  ]],
  ['international', '10. Usuarios internacionales', [
    'Atendemos principalmente a usuarios en Estados Unidos. Si accedes desde otro país, tu información puede transferirse y procesarse en Estados Unidos, donde las leyes de protección de datos pueden diferir. La política vigente indica que el uso del servicio supone consentimiento a esa transferencia.'
  ]],
  ['changes', '11. Cambios en esta política', [
    'Podemos actualizar esta política. Publicaremos los cambios y actualizaremos la fecha de revisión. Los cambios importantes se comunicarán por correo o mediante un aviso destacado en la plataforma. Revisa esta política periódicamente.'
  ]],
  ['contact', '12. Contacto', [
    'Para preguntas de privacidad o para ejercer tus derechos, escribe al equipo de privacidad de ezLegal.ai: privacy@ezlegal.ai. Nuestro objetivo es responder en un plazo de 30 días.'
  ]],
] as const;

export default function PrivacyPolicySpanish() {
  return <div className="min-h-screen bg-navy-50">
    <Navigation />
    <main id="main-content" lang="es" className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <header className="mb-8">
          <p className="text-sm font-semibold text-teal-800 mb-2">Tu información, tus decisiones</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">Política de privacidad</h1>
          <p className="text-navy-700">Versión en español de la política vigente. Fecha de entrada en vigor: 15 de enero de 2026.</p>
        </header>
        <nav aria-label="Contenido de la política" className="grid sm:grid-cols-2 gap-2 rounded-xl border border-navy-200 bg-white p-5 mb-8">
          {sections.map(([id, title]) => <a key={id} href={`#${id}`} className="underline text-teal-800 py-2">{title}</a>)}
        </nav>
        {sections.map(([id, title, paragraphs]) => <section key={id} id={id} className="scroll-mt-24 mb-5 rounded-xl border border-navy-200 bg-white p-5 sm:p-7">
          <h2 className="text-xl font-bold text-navy-900 mb-3">{title}</h2>
          {paragraphs.map(p => <p key={p} className="text-navy-700 leading-relaxed mb-3">{p}</p>)}
        </section>)}
        <div className="flex flex-wrap gap-4 text-teal-800 font-semibold underline">
          <Link to="/dashboard/profile?tab=data">Exportar o eliminar mis datos</Link>
          <a href="mailto:privacy@ezlegal.ai">Contactar al equipo de privacidad</a>
          <Link to="/trust-center">Centro de confianza</Link>
          <Link to="/scope-disclaimers">Alcance y avisos legales</Link>
          <Link to="/urgent-help">Ayuda urgente</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
