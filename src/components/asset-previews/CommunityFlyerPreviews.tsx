import { useState, useEffect } from 'react';
import {
  Scale, Home, Users, Briefcase, Globe, ShieldCheck, Shield,
  Phone, Mail, AlertTriangle, Smartphone, ExternalLink,
  FileText, Heart, DollarSign, Gavel
} from 'lucide-react';
import { generateQRDataURL } from '../../lib/qr-generator';

function QRCode({ url, size = 72 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => { generateQRDataURL(url, size * 2).then(setDataUrl); }, [url, size]);
  if (!dataUrl) return <div className="w-full h-full bg-navy-100 animate-pulse rounded" />;
  return <img src={dataUrl} alt={`QR code for ${url}`} width={size} height={size} className="rounded" />;
}

interface FlyerShellProps {
  title: string;
  subtitle: string;
  headerColor: string;
  headerIcon: React.ElementType;
  topics: { icon: React.ElementType; name: string; desc: string }[];
  steps: string[];
  emergencyLine: string;
  partnerId?: string;
  lang: 'en' | 'es';
  qrLabel: string;
  ctaLine: string;
}

function FlyerShell({
  title, subtitle, headerColor, headerIcon: Icon, topics, steps, emergencyLine, partnerId, lang, qrLabel, ctaLine,
}: FlyerShellProps) {
  const refId = partnerId || 'PARTNER_ID';
  const flyerUrl = `https://ezlegal.ai/${lang === 'es' ? 'es' : ''}?ref=${refId}`;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className={`${headerColor} px-6 py-5 text-center`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-sm">ezLegal.ai</span>
        </div>
        <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
        <p className="text-white/80 text-xs mt-1">{subtitle}</p>
        <p className="text-white/60 text-[10px] mt-2 font-medium flex items-center justify-center gap-1.5">
          <Globe className="w-3 h-3" />
          {lang === 'es' ? 'Disponible en Español e Inglés' : 'Available in English & Spanish'}
        </p>
      </div>

      <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
        <p className="text-amber-900 text-[11px] font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {lang === 'es'
            ? 'El 80% de las personas de bajos ingresos no pueden pagar un abogado'
            : '80% of low-income Americans cannot afford legal representation'}
        </p>
        <p className="text-amber-700 text-[8px] mt-0.5 ml-5">
          {lang === 'es'
            ? 'Fuente: Legal Services Corporation, The Justice Gap Report, 2022'
            : 'Source: Legal Services Corporation, The Justice Gap Report, 2022'}
        </p>
      </div>

      <div className="px-6 py-4">
        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-3">
          {lang === 'es' ? 'Lo Que Necesita Saber' : 'What You Need to Know'}
        </p>
        <div className="space-y-2">
          {topics.map((t, i) => (
            <div key={i} className="flex items-start gap-3 bg-navy-50 rounded-lg p-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <t.icon className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-navy-800">{t.name}</p>
                <p className="text-[9px] text-navy-500 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-3 border-t border-navy-100">
        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">
          {lang === 'es' ? 'Como Obtener Ayuda' : 'How to Get Help'}
        </p>
        <div className="space-y-1.5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-[10px] text-navy-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-navy-100 bg-teal-50">
        <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wider mb-3">{qrLabel}</p>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-lg border-2 border-teal-200 flex items-center justify-center flex-shrink-0 p-1">
            <QRCode url={flyerUrl} size={72} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-navy-800">{ctaLine}</p>
            </div>
            <p className="text-[10px] text-teal-600 font-medium flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> ezlegal.ai{lang === 'es' ? '/es' : ''}?ref={refId}
            </p>
            <span className="text-[9px] text-navy-500 flex items-center gap-1">
              <Phone className="w-3 h-3" /> WhatsApp: +1 (XXX) XXX-XXXX
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-teal-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-xs">
              {lang === 'es' ? 'GRATIS para organizaciones 501(c)(3)' : 'FREE for 501(c)(3) organizations'}
            </p>
            <p className="text-teal-100 text-[10px]">
              {lang === 'es' ? 'Solicite alianza: ezlegal.ai/partners' : 'Apply: ezlegal.ai/partners'}
            </p>
          </div>
          <p className="text-teal-100 text-[10px] flex items-center gap-1"><Mail className="w-3 h-3" /> partners@ezlegal.ai</p>
        </div>
      </div>

      <div className="px-6 py-3 bg-navy-800 border-t border-navy-700">
        <div className="flex items-start gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[9px] text-white font-bold">
              {lang === 'es' ? 'AVISO LEGAL IMPORTANTE' : 'IMPORTANT LEGAL NOTICE'}
            </p>
            <p className="text-[8px] text-navy-300 leading-relaxed mt-0.5">
              {lang === 'es'
                ? 'Información legal, no asesoramiento legal. No somos un bufete de abogados. El uso de ezLegal.ai no crea una relacion abogado-cliente.'
                : 'Legal information, not legal advice. Not a law firm. Use of ezLegal.ai does not create an attorney-client relationship.'}
              {' '}{emergencyLine}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 ml-5">
          <ShieldCheck className="w-3 h-3 text-teal-400" />
          <p className="text-[8px] text-navy-400">
            {lang === 'es' ? 'Como protegemos tu información: ezlegal.ai/privacidad' : 'How we protect your info: ezlegal.ai/privacy'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TenantRightsEN() {
  return (
    <FlyerShell
      title="Know Your Tenant Rights"
      subtitle="Free Legal Information for Renters"
      headerColor="bg-gradient-to-r from-[#0A1628] to-[#1a3a5c]"
      headerIcon={Home}
      lang="en"
      topics={[
        { icon: Home, name: 'Eviction Protections', desc: 'Your landlord must follow legal procedures. You have the right to proper notice before eviction.' },
        { icon: DollarSign, name: 'Security Deposits', desc: 'Know the rules on deposit limits, deductions, and the timeline for return after move-out.' },
        { icon: FileText, name: 'Repair Requests', desc: 'Your landlord must maintain habitable conditions. Learn how to properly request repairs in writing.' },
        { icon: ShieldCheck, name: 'Discrimination', desc: 'Fair Housing laws protect you from discrimination based on race, religion, family status, and more.' },
      ]}
      steps={[
        'Visit ezlegal.ai or scan the QR code below',
        'Ask your housing question in plain English',
        'Get an instant answer with real legal citations',
        'Connect with a local housing attorney if needed',
      ]}
      qrLabel="Get Free Help Now"
      ctaLine="Scan to learn your rights (takes 2 minutes)"
      emergencyLine="If you are in immediate danger, call 911. National Domestic Violence Hotline: 1-800-799-7233."
    />
  );
}

export function TenantRightsES() {
  return (
    <FlyerShell
      title="Conozca Sus Derechos como Inquilino"
      subtitle="Información Legal Gratuita para Inquilinos"
      headerColor="bg-gradient-to-r from-[#0A1628] to-[#1a3a5c]"
      headerIcon={Home}
      lang="es"
      topics={[
        { icon: Home, name: 'Proteccion contra Desalojos', desc: 'Su arrendador debe seguir procedimientos legales. Tiene derecho a un aviso adecuado.' },
        { icon: DollarSign, name: 'Depositos de Seguridad', desc: 'Conozca las reglas sobre limites, deducciones y plazos de devolucion.' },
        { icon: FileText, name: 'Solicitudes de Reparacion', desc: 'Su arrendador debe mantener condiciones habitables. Aprenda a solicitar reparaciones.' },
        { icon: ShieldCheck, name: 'Discriminacion', desc: 'Las leyes de Vivienda Justa lo protegen contra discriminacion por raza, religion, familia y mas.' },
      ]}
      steps={[
        'Visite ezlegal.ai o escanee el codigo QR',
        'Escriba su pregunta sobre vivienda en español',
        'Reciba una respuesta inmediata con citas legales',
        'Conectese con un abogado de vivienda si necesita mas ayuda',
      ]}
      qrLabel="Obtenga Ayuda Gratis Ahora"
      ctaLine="Escanea para conocer tus derechos (2 minutos)"
      emergencyLine="En emergencias, llame al 911. Linea de Violencia Domestica: 1-800-799-7233 (español)."
    />
  );
}

export function FamilyLawEN() {
  return (
    <FlyerShell
      title="Family Law Basics"
      subtitle="Free Legal Information for Families"
      headerColor="bg-gradient-to-r from-teal-700 to-teal-800"
      headerIcon={Users}
      lang="en"
      topics={[
        { icon: Users, name: 'Child Custody', desc: 'Understand legal vs. physical custody, parenting plans, and how courts make custody decisions.' },
        { icon: DollarSign, name: 'Child Support', desc: 'Learn how support amounts are calculated, modification processes, and enforcement options.' },
        { icon: FileText, name: 'Divorce Process', desc: 'Step-by-step guidance on filing, property division, and reaching agreements.' },
        { icon: Shield, name: 'Protection Orders', desc: 'How to obtain an order of protection and what rights it provides for you and your children.' },
      ]}
      steps={[
        'Visit ezlegal.ai or scan the QR code below',
        'Ask your family law question in plain English',
        'Get an instant answer with real legal citations',
        'Connect with a local family law attorney if needed',
      ]}
      qrLabel="Get Free Help Now"
      ctaLine="Scan to learn about family law (takes 2 minutes)"
      emergencyLine="If you are in immediate danger, call 911. National Domestic Violence Hotline: 1-800-799-7233."
    />
  );
}

export function FamilyLawES() {
  return (
    <FlyerShell
      title="Derecho de Familia: Lo Basico"
      subtitle="Información Legal Gratuita para Familias"
      headerColor="bg-gradient-to-r from-teal-700 to-teal-800"
      headerIcon={Users}
      lang="es"
      topics={[
        { icon: Users, name: 'Custodia de Hijos', desc: 'Entienda custodia legal vs. fisica, planes de crianza y decisiones judiciales.' },
        { icon: DollarSign, name: 'Manutencion', desc: 'Como se calculan los montos, procesos de modificacion y opciones de cumplimiento.' },
        { icon: FileText, name: 'Proceso de Divorcio', desc: 'Guia paso a paso para presentar, division de bienes y llegar a acuerdos.' },
        { icon: Shield, name: 'Ordenes de Proteccion', desc: 'Como obtener una orden de proteccion y que derechos le otorga.' },
      ]}
      steps={[
        'Visite ezlegal.ai o escanee el codigo QR',
        'Escriba su pregunta de familia en español',
        'Reciba una respuesta inmediata con citas legales',
        'Conectese con un abogado de familia si necesita mas ayuda',
      ]}
      qrLabel="Obtenga Ayuda Gratis Ahora"
      ctaLine="Escanea para información de familia (2 minutos)"
      emergencyLine="En emergencias, llame al 911. Linea de Violencia Domestica: 1-800-799-7233 (español)."
    />
  );
}

export function ImmigrationEN() {
  return (
    <FlyerShell
      title="Immigration: Know Your Rights"
      subtitle="Free Legal Information for Immigrants"
      headerColor="bg-gradient-to-r from-[#1a3a5c] to-[#0d5c6b]"
      headerIcon={Globe}
      lang="en"
      topics={[
        { icon: Shield, name: 'Your Constitutional Rights', desc: 'All people in the US have rights regardless of immigration status, including the right to remain silent.' },
        { icon: AlertTriangle, name: 'Notario Fraud', desc: 'Only licensed attorneys can provide immigration legal advice. Learn to spot notario fraud schemes.' },
        { icon: FileText, name: 'Know Before You Sign', desc: 'Never sign documents you do not understand. You have the right to an interpreter in court.' },
        { icon: Phone, name: 'Emergency Resources', desc: 'Know your ICE detention rights and keep emergency legal aid numbers accessible.' },
      ]}
      steps={[
        'Visit ezlegal.ai or scan the QR code below',
        'Ask your immigration question in English or Spanish',
        'Get an instant answer with real legal citations',
        'Connect with a vetted immigration attorney if needed',
      ]}
      qrLabel="Get Free Help Now"
      ctaLine="Scan to learn your rights (takes 2 minutes)"
      emergencyLine="If you are in immediate danger, call 911. ICE Detainee Helpline: 1-888-351-4024."
    />
  );
}

export function ImmigrationES() {
  return (
    <FlyerShell
      title="Inmigracion: Conozca Sus Derechos"
      subtitle="Información Legal Gratuita para Inmigrantes"
      headerColor="bg-gradient-to-r from-[#1a3a5c] to-[#0d5c6b]"
      headerIcon={Globe}
      lang="es"
      topics={[
        { icon: Shield, name: 'Sus Derechos Constitucionales', desc: 'Todas las personas en EE.UU. tienen derechos sin importar su estatus migratorio.' },
        { icon: AlertTriangle, name: 'Fraude de Notarios', desc: 'Solo abogados licenciados pueden dar consejo legal de inmigracion. Aprenda a detectar fraudes.' },
        { icon: FileText, name: 'Antes de Firmar', desc: 'Nunca firme documentos que no entienda. Tiene derecho a un interprete en la corte.' },
        { icon: Phone, name: 'Recursos de Emergencia', desc: 'Conozca sus derechos en detencion de ICE y tenga numeros de ayuda legal accesibles.' },
      ]}
      steps={[
        'Visite ezlegal.ai o escanee el codigo QR',
        'Escriba su pregunta de inmigracion en español',
        'Reciba una respuesta inmediata con citas legales',
        'Conectese con un abogado de inmigracion verificado',
      ]}
      qrLabel="Obtenga Ayuda Gratis Ahora"
      ctaLine="Escanea para conocer tus derechos (2 minutos)"
      emergencyLine="En emergencias, llame al 911. Linea de detenidos ICE: 1-888-351-4024."
    />
  );
}

export function ConsumerRightsEN() {
  return (
    <FlyerShell
      title="Consumer Protection Guide"
      subtitle="Free Legal Information for Consumers"
      headerColor="bg-gradient-to-r from-[#0d4a3a] to-[#0d5c4b]"
      headerIcon={ShieldCheck}
      lang="en"
      topics={[
        { icon: DollarSign, name: 'Debt Collection Rights', desc: 'Collectors cannot harass, threaten, or call at unreasonable hours. Know the FDCPA protections.' },
        { icon: AlertTriangle, name: 'Scam Prevention', desc: 'Learn to identify common scams targeting consumers -- phishing, fake debt collectors, and more.' },
        { icon: Gavel, name: 'Small Claims Court', desc: 'How to file a claim, monetary limits, what evidence to bring, and what to expect in court.' },
        { icon: FileText, name: 'Dispute Resolution', desc: 'Steps to dispute charges, file complaints with the CFPB, and resolve issues without court.' },
      ]}
      steps={[
        'Visit ezlegal.ai or scan the QR code below',
        'Describe your consumer issue in plain English',
        'Get an instant answer with legal protections that apply',
        'Connect with a consumer rights attorney if needed',
      ]}
      qrLabel="Get Free Help Now"
      ctaLine="Scan to protect yourself (takes 2 minutes)"
      emergencyLine="FTC Complaint Line: 1-877-382-4357. If threatened, call 911."
    />
  );
}

export function ConsumerRightsES() {
  return (
    <FlyerShell
      title="Guia de Proteccion al Consumidor"
      subtitle="Información Legal Gratuita para Consumidores"
      headerColor="bg-gradient-to-r from-[#0d4a3a] to-[#0d5c4b]"
      headerIcon={ShieldCheck}
      lang="es"
      topics={[
        { icon: DollarSign, name: 'Derechos ante Cobros', desc: 'Los cobradores no pueden acosar ni amenazar. Conozca las protecciones de la ley FDCPA.' },
        { icon: AlertTriangle, name: 'Prevencion de Estafas', desc: 'Aprenda a identificar estafas comunes: phishing, cobradores falsos y mas.' },
        { icon: Gavel, name: 'Reclamos Menores', desc: 'Como presentar un reclamo, limites monetarios, que evidencia llevar y que esperar.' },
        { icon: FileText, name: 'Resolucion de Disputas', desc: 'Pasos para disputar cargos, presentar quejas al CFPB y resolver sin ir a la corte.' },
      ]}
      steps={[
        'Visite ezlegal.ai o escanee el codigo QR',
        'Describa su problema de consumidor en español',
        'Reciba respuesta inmediata con protecciones legales',
        'Conectese con un abogado de derechos del consumidor',
      ]}
      qrLabel="Obtenga Ayuda Gratis Ahora"
      ctaLine="Escanea para protegerte (2 minutos)"
      emergencyLine="Linea de quejas FTC: 1-877-382-4357. Si le amenazan, llame al 911."
    />
  );
}

export function EmploymentEN() {
  return (
    <FlyerShell
      title="Know Your Employment Rights"
      subtitle="Free Legal Information for Workers"
      headerColor="bg-gradient-to-r from-[#3a2c0d] to-[#5c4a1a]"
      headerIcon={Briefcase}
      lang="en"
      topics={[
        { icon: DollarSign, name: 'Unpaid Wages', desc: 'You have the right to be paid for all hours worked, including overtime. Learn how to file a wage claim.' },
        { icon: Shield, name: 'Workplace Discrimination', desc: 'Federal and state laws protect you from discrimination based on race, sex, age, disability, and more.' },
        { icon: AlertTriangle, name: 'Wrongful Termination', desc: 'Learn when a firing is illegal -- retaliation, discrimination, and violation of employment contracts.' },
        { icon: Heart, name: 'Workplace Safety', desc: 'OSHA protects your right to a safe workplace. Learn how to report unsafe conditions anonymously.' },
      ]}
      steps={[
        'Visit ezlegal.ai or scan the QR code below',
        'Ask your employment question in plain English',
        'Get an instant answer with relevant labor laws cited',
        'Connect with an employment attorney if needed',
      ]}
      qrLabel="Get Free Help Now"
      ctaLine="Scan to learn your worker rights (takes 2 minutes)"
      emergencyLine="OSHA Hotline: 1-800-321-6742. If in danger, call 911."
    />
  );
}

export function EmploymentES() {
  return (
    <FlyerShell
      title="Conozca Sus Derechos Laborales"
      subtitle="Información Legal Gratuita para Trabajadores"
      headerColor="bg-gradient-to-r from-[#3a2c0d] to-[#5c4a1a]"
      headerIcon={Briefcase}
      lang="es"
      topics={[
        { icon: DollarSign, name: 'Salarios No Pagados', desc: 'Tiene derecho a que le paguen todas las horas trabajadas, incluyendo tiempo extra.' },
        { icon: Shield, name: 'Discriminacion Laboral', desc: 'Las leyes federales y estatales lo protegen contra discriminacion por raza, sexo, edad y mas.' },
        { icon: AlertTriangle, name: 'Despido Injusto', desc: 'Aprenda cuando un despido es ilegal: represalias, discriminacion, violacion de contrato.' },
        { icon: Heart, name: 'Seguridad en el Trabajo', desc: 'OSHA protege su derecho a un lugar de trabajo seguro. Reporte condiciones inseguras.' },
      ]}
      steps={[
        'Visite ezlegal.ai o escanee el codigo QR',
        'Escriba su pregunta laboral en español',
        'Reciba respuesta inmediata con leyes laborales citadas',
        'Conectese con un abogado laboral si necesita mas ayuda',
      ]}
      qrLabel="Obtenga Ayuda Gratis Ahora"
      ctaLine="Escanea para conocer tus derechos (2 minutos)"
      emergencyLine="Linea OSHA: 1-800-321-6742. En emergencias, llame al 911."
    />
  );
}
