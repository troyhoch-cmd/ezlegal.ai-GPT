import { useState } from 'react';
import {
  CheckCircle, Clock, AlertTriangle, XCircle, ChevronDown, ChevronRight,
  Shield, ExternalLink, Flag
} from 'lucide-react';
import { aiSafetySections } from '../../data/aiSafety';
import { governanceChecklist, type GovernanceStatus } from '../../data/governanceChecklist';
import { governanceSections, governanceDisclaimer, reportProblemCTA } from '../../data/governanceCopy';
import { contentRegistry, getStatusLabel, getStatusColor, type ReviewStatus } from '../../data/legalContentStatus';
import { useLanguage } from '../../contexts/LanguageContext';

type EvidenceStatus = 'complete' | 'in-progress' | 'pending-review' | 'not-started' | 'blocked';

interface EvidenceClaim {
  id: string;
  claim: { en: string; es: string };
  status: EvidenceStatus;
  evidence?: string | null;
  owner?: string | null;
  lastUpdated?: string | null;
  blockerNote?: string | null;
}

function StatusBadge({ status, lang }: { status: EvidenceStatus; lang: 'en' | 'es' }) {
  const config: Record<EvidenceStatus, { icon: typeof CheckCircle; className: string; label: { en: string; es: string } }> = {
    complete: { icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: { en: 'Complete', es: 'Completo' } },
    'in-progress': { icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200', label: { en: 'In progress', es: 'En progreso' } },
    'pending-review': { icon: AlertTriangle, className: 'bg-slate-100 text-slate-700 border-slate-300', label: { en: 'Pending legal/security review', es: 'Pendiente de revision legal/seguridad' } },
    'not-started': { icon: XCircle, className: 'bg-slate-50 text-slate-500 border-slate-200', label: { en: 'Not started', es: 'No iniciado' } },
    blocked: { icon: AlertTriangle, className: 'bg-red-50 text-red-700 border-red-200', label: { en: 'Blocked', es: 'Bloqueado' } },
  };
  const { icon: Icon, className, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label[lang]}
    </span>
  );
}

function EvidenceRow({ claim, lang }: { claim: EvidenceClaim; lang: 'en' | 'es' }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = claim.evidence || claim.owner || claim.lastUpdated || claim.blockerNote;

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`w-full flex items-start gap-3 py-3 px-4 text-left ${hasDetails ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'} transition-colors`}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-800">{claim.claim[lang]}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={claim.status} lang={lang} />
          {hasDetails && (
            expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>
      {expanded && hasDetails && (
        <div className="px-4 pb-3 ml-4 border-l-2 border-slate-100">
          <dl className="space-y-1 text-xs">
            {claim.evidence && (
              <div>
                <dt className="text-slate-400 font-medium">{lang === 'es' ? 'Evidencia' : 'Evidence'}</dt>
                <dd className="text-slate-600">{claim.evidence}</dd>
              </div>
            )}
            {claim.owner && (
              <div>
                <dt className="text-slate-400 font-medium">{lang === 'es' ? 'Responsable' : 'Owner'}</dt>
                <dd className="text-slate-600">{claim.owner}</dd>
              </div>
            )}
            {claim.lastUpdated && (
              <div>
                <dt className="text-slate-400 font-medium">{lang === 'es' ? 'Actualizado' : 'Last updated'}</dt>
                <dd className="text-slate-600">{claim.lastUpdated}</dd>
              </div>
            )}
            {claim.blockerNote && (
              <div className="mt-1 p-2 bg-red-50 rounded border border-red-100">
                <dt className="text-red-600 font-medium">{lang === 'es' ? 'Bloqueo' : 'Blocker'}</dt>
                <dd className="text-red-700">{claim.blockerNote}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: { en: string; es: string }; children: React.ReactNode }) {
  const { language } = useLanguage();
  const l = language === 'es' ? 'es' : 'en';
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">
        {title[l]}
      </h2>
      {children}
    </section>
  );
}

function mapGovernanceToEvidence(status: GovernanceStatus): EvidenceStatus {
  return status;
}

function mapReviewToEvidence(status: ReviewStatus): EvidenceStatus {
  switch (status) {
    case 'approved': return 'complete';
    case 'under-review': return 'in-progress';
    case 'pending-review': return 'pending-review';
    case 'needs-revision': return 'in-progress';
    case 'expired': return 'blocked';
    case 'ai-generated': return 'pending-review';
    case 'draft': return 'not-started';
  }
}

export default function TrustEvidenceMatrix() {
  const { language } = useLanguage();
  const l = language === 'es' ? 'es' : 'en';

  const aiDoesSection = aiSafetySections.find(s => s.id === 'what-ai-does');
  const aiDoesNotSection = aiSafetySections.find(s => s.id === 'what-ai-does-not-do');
  const legalInfoSection = aiSafetySections.find(s => s.id === 'legal-info-vs-advice');
  const humanReviewSection = aiSafetySections.find(s => s.id === 'human-review');
  const privacySection = aiSafetySections.find(s => s.id === 'privacy');
  const sourceSection = aiSafetySections.find(s => s.id === 'source-grounding');
  const biasSection = aiSafetySections.find(s => s.id === 'bias-language');

  const dataHandlingGovernance = governanceSections.find(s => s.id === 'data-handling');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Disclaimer */}
      <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            {governanceDisclaimer[l]}
          </p>
        </div>
      </div>

      {/* Section 1: What AI does / does not do */}
      <Section title={{ en: '1. What AI does and does not do', es: '1. Que hace y que no hace la IA' }}>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          {aiDoesSection && (
            <div className="bg-white">
              <h3 className="text-sm font-semibold text-slate-700 px-4 pt-3 pb-1">{aiDoesSection.heading[l]}</h3>
              {aiDoesSection.items.map((item, i) => (
                <EvidenceRow
                  key={`does-${i}`}
                  lang={l}
                  claim={{
                    id: `does-${i}`,
                    claim: item.text,
                    status: item.verified ? 'complete' : 'pending-review',
                    evidence: item.verified ? (l === 'es' ? 'Implementado y verificado' : 'Implemented and verified') : null,
                  }}
                />
              ))}
            </div>
          )}
          {aiDoesNotSection && (
            <div className="bg-white border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 px-4 pt-3 pb-1">{aiDoesNotSection.heading[l]}</h3>
              {aiDoesNotSection.items.map((item, i) => (
                <EvidenceRow
                  key={`doesnot-${i}`}
                  lang={l}
                  claim={{
                    id: `doesnot-${i}`,
                    claim: item.text,
                    status: item.verified ? 'complete' : 'pending-review',
                    evidence: item.verified ? (l === 'es' ? 'Divulgado en pagina de seguridad de IA' : 'Disclosed on AI safety page') : null,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Section 2: Legal information vs legal advice */}
      <Section title={{ en: '2. Legal information vs legal advice', es: '2. Informacion legal vs asesoria legal' }}>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          {legalInfoSection?.items.map((item, i) => (
            <EvidenceRow
              key={`legal-${i}`}
              lang={l}
              claim={{
                id: `legal-${i}`,
                claim: item.text,
                status: item.verified ? 'complete' : 'pending-review',
                evidence: item.verified ? (l === 'es' ? 'Descargo de responsabilidad visible en toda la plataforma' : 'Disclaimer visible throughout platform') : null,
              }}
            />
          ))}
        </div>
      </Section>

      {/* Section 3: Human help and escalation */}
      <Section title={{ en: '3. Human help and escalation', es: '3. Ayuda humana y escalacion' }}>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          {humanReviewSection?.items.map((item, i) => (
            <EvidenceRow
              key={`human-${i}`}
              lang={l}
              claim={{
                id: `human-${i}`,
                claim: item.text,
                status: item.verified ? 'complete' : 'in-progress',
                evidence: item.verified
                  ? (l === 'es' ? 'Flujos de escalamiento implementados' : 'Escalation flows implemented')
                  : null,
                owner: 'Safety lead',
              }}
            />
          ))}
        </div>
      </Section>

      {/* Section 4: Privacy and data handling */}
      <Section title={{ en: '4. Privacy and data handling', es: '4. Privacidad y manejo de datos' }}>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          {privacySection?.items.map((item, i) => (
            <EvidenceRow
              key={`privacy-${i}`}
              lang={l}
              claim={{
                id: `privacy-${i}`,
                claim: item.text,
                status: item.verified ? 'complete' : 'pending-review',
                evidence: item.verified
                  ? (l === 'es' ? 'Politica de privacidad y controles RLS' : 'Privacy policy and RLS controls')
                  : null,
                blockerNote: !item.verified && dataHandlingGovernance?.statusNote
                  ? dataHandlingGovernance.statusNote[l]
                  : null,
              }}
            />
          ))}
        </div>
      </Section>

      {/* Section 5: Source grounding and jurisdiction limits */}
      <Section title={{ en: '5. Source grounding and jurisdiction limits', es: '5. Fuentes y limites jurisdiccionales' }}>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          {sourceSection?.items.map((item, i) => (
            <EvidenceRow
              key={`source-${i}`}
              lang={l}
              claim={{
                id: `source-${i}`,
                claim: item.text,
                status: item.verified ? 'complete' : 'not-started',
                evidence: item.verified
                  ? (l === 'es' ? 'Formulario de estado/ZIP en admision' : 'State/ZIP form in intake')
                  : null,
                blockerNote: !item.verified
                  ? (l === 'es'
                    ? 'No iniciado hasta ser revisado por jurisdiccion'
                    : 'Not started until reviewed per jurisdiction')
                  : null,
              }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500 italic px-1">
          {l === 'es'
            ? 'La precision especifica por jurisdiccion se muestra como "No iniciado" hasta que sea revisada por un abogado autorizado en esa jurisdiccion.'
            : 'Jurisdiction-specific accuracy is shown as "Not started" until reviewed by a bar-admitted attorney in that jurisdiction.'}
        </p>
      </Section>

      {/* Section 6: Bias and language access */}
      <Section title={{ en: '6. Bias and language access', es: '6. Sesgo y acceso linguistico' }}>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          {biasSection?.items.map((item, i) => (
            <EvidenceRow
              key={`bias-${i}`}
              lang={l}
              claim={{
                id: `bias-${i}`,
                claim: item.text,
                status: item.verified ? 'complete' : 'in-progress',
                evidence: item.verified
                  ? (l === 'es' ? 'Funcionalidad bilingue EN/ES verificada' : 'Bilingual EN/ES functionality verified')
                  : null,
                blockerNote: !item.verified
                  ? (l === 'es' ? 'Documentando proceso formal de auditoria de sesgo' : 'Documenting formal bias audit process')
                  : null,
              }}
            />
          ))}
        </div>
      </Section>

      {/* Section 7: Governance checklist */}
      <Section title={{ en: '7. Governance checklist', es: '7. Lista de gobernanza' }}>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          {governanceChecklist.map((item) => (
            <EvidenceRow
              key={item.id}
              lang={l}
              claim={{
                id: item.id,
                claim: item.title,
                status: mapGovernanceToEvidence(item.status),
                evidence: item.evidence,
                owner: item.owner,
                lastUpdated: item.lastUpdated,
                blockerNote: item.blockerNote,
              }}
            />
          ))}
        </div>
      </Section>

      {/* Section 8: Content review registry */}
      <Section title={{ en: '8. Content review registry', es: '8. Registro de revision de contenido' }}>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          {contentRegistry.map((entry) => (
            <EvidenceRow
              key={entry.id}
              lang={l}
              claim={{
                id: entry.id,
                claim: entry.title,
                status: mapReviewToEvidence(entry.currentStatus),
                evidence: entry.flaggedIssues.length > 0
                  ? entry.flaggedIssues.join('; ')
                  : (entry.currentStatus === 'approved'
                    ? (l === 'es' ? 'Aprobado' : 'Approved')
                    : null),
                owner: entry.reviewerRole,
                lastUpdated: entry.lastReviewedAt,
                blockerNote: entry.currentStatus === 'pending-review'
                  ? (l === 'es' ? 'Pendiente de revision legal/seguridad.' : 'Pending legal/security review.')
                  : null,
              }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500 italic px-1">
          {l === 'es'
            ? 'Ningún contenido se presenta como "completamente auditado" o "de precisión garantizada" hasta completar revisión independiente.'
            : 'No content is claimed as "fully audited" or "guaranteed accurate" until independent review is complete.'}
        </p>
      </Section>

      {/* Report problem CTA */}
      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
        <a
          href="/trust-safety-report"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors"
        >
          <Flag className="w-4 h-4" />
          {reportProblemCTA[l]}
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
        <p className="mt-2 text-[11px] text-slate-500">
          {l === 'es'
            ? 'Revisamos todos los reportes y actualizamos esta página.'
            : 'We review all reports and update this page accordingly.'}
        </p>
      </div>
    </div>
  );
}
