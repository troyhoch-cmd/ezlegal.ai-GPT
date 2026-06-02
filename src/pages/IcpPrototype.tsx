import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, ShieldAlert, BookOpen, MapPin, Clock, CheckCircle2, AlertTriangle, Scale, Building2, HeartHandshake, Sparkles, ArrowRight, Gauge, FileCheck2, Globe as Globe2, Info } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

type Persona = 'individual' | 'business' | 'legal_aid';
type ReadingLevel = 'plain' | 'simpler' | 'technical';

const personaCopy: Record<Persona, { label: string; cta: string; sub: string; Icon: typeof Scale }> = {
  individual: {
    label: 'Individuals',
    cta: 'Get safe next steps',
    sub: 'Plain-language answers in English or Spanish with urgent-help routing.',
    Icon: Scale,
  },
  business: {
    label: 'Small Business',
    cta: 'Check my business issue',
    sub: 'Contractor forms, compliance checklists, and possible outcomes.',
    Icon: Building2,
  },
  legal_aid: {
    label: 'Legal Aid / Org',
    cta: 'Request partner demo',
    sub: 'White-label widget, grant reporting, and audit-ready governance.',
    Icon: HeartHandshake,
  },
};

const evalMetrics = [
  { label: 'Citation accuracy', value: 96.4, trend: '+1.2', tone: 'emerald' },
  { label: 'Jurisdiction accuracy', value: 94.1, trend: '+0.8', tone: 'teal' },
  { label: 'Spanish parity', value: 92.7, trend: '+2.4', tone: 'sky' },
  { label: 'Refusal accuracy', value: 98.0, trend: '+0.3', tone: 'slate' },
];

const jurisdictionMatrix = [
  { state: 'California', statutes: 'Full', regs: 'Full', caselaw: 'Broad', forms: 'Full', spanish: 96 },
  { state: 'Texas', statutes: 'Full', regs: 'Full', caselaw: 'Broad', forms: 'Partial', spanish: 89 },
  { state: 'Arizona', statutes: 'Full', regs: 'Full', caselaw: 'Full', forms: 'Full', spanish: 94 },
  { state: 'New York', statutes: 'Full', regs: 'Partial', caselaw: 'Broad', forms: 'Partial', spanish: 87 },
  { state: 'Florida', statutes: 'Full', regs: 'Full', caselaw: 'Broad', forms: 'Partial', spanish: 91 },
];

const sampleCitations = [
  {
    label: 'A.R.S. § 33-1368',
    summary: 'Arizona Residential Landlord Tenant Act — noncompliance by tenant',
    url: 'https://www.azleg.gov/ars/33/01368.htm',
  },
  {
    label: 'A.R.S. § 33-1375',
    summary: 'Periodic tenancy; hold-over remedies',
    url: 'https://www.azleg.gov/ars/33/01375.htm',
  },
];

export default function IcpPrototype() {
  const [persona, setPersona] = useState<Persona>('individual');
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('plain');
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [feedbackReason, setFeedbackReason] = useState<string>('');
  const [refusalOpen, setRefusalOpen] = useState(false);

  const persCopy = personaCopy[persona];

  const answerBody = useMemo(() => {
    if (readingLevel === 'technical') {
      return 'Under A.R.S. § 33-1368(B), a landlord may terminate a rental agreement for a material noncompliance that materially affects health and safety on 5 days\' written notice; for nonpayment of rent, § 33-1368(B) authorizes termination on 5 days\' notice unless cured. Jurisdictional overlays from local ordinances (e.g., Phoenix City Code § 18-4) may impose additional notice and cure requirements.';
    }
    if (readingLevel === 'simpler') {
      return 'In Arizona, your landlord usually must give you 5 days of written notice to pay rent before they can try to evict you. Some cities add extra steps. Save every notice and text you get.';
    }
    return 'In Arizona, your landlord generally needs to give you a written 5-day notice to pay rent before filing to evict. City rules can add protections. Keep every notice and message you receive.';
  }, [readingLevel]);

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-24 bg-slate-50 min-h-screen">
        <div className="mx-auto max-w-6xl px-4 pb-20">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
              <Sparkles className="h-3.5 w-3.5" />
              ICP Enhancements Prototype
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Best-in-class ICP upgrades, previewed end-to-end
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600 leading-relaxed">
              A working preview of the Phase 1 trust-and-safety improvements from the gap analysis:
              per-answer feedback, refusal transparency, public evaluation metrics, source freshness,
              reading-level controls, and contextual per-ICP CTAs.
            </p>
          </header>

          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Gauge className="h-3.5 w-3.5" />
              Pick the audience
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(Object.keys(personaCopy) as Persona[]).map((key) => {
                const { label, sub, cta, Icon } = personaCopy[key];
                const active = persona === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPersona(key)}
                    aria-pressed={active}
                    className={`text-left rounded-xl border p-4 transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      active
                        ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-300'
                        : 'border-slate-200 bg-white hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="text-sm font-semibold text-slate-900">{label}</div>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">{sub}</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                      {cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                <Clock className="h-3 w-3" /> Sources updated 3 days ago
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                <Globe2 className="h-3 w-3" /> Spanish parity 92.7%
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                <FileCheck2 className="h-3 w-3" /> Attorney-reviewed prompts
              </span>
            </div>
          </section>

          <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sample answer with citations
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <persCopy.Icon className="h-3.5 w-3.5" /> {persCopy.label}
                </div>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                Can my landlord evict me if I'm late on rent in Arizona?
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs">
                {(['plain', 'simpler', 'technical'] as ReadingLevel[]).map((lvl) => {
                  const active = lvl === readingLevel;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setReadingLevel(lvl)}
                      className={`rounded-full border px-3 py-1 font-semibold transition ${
                        active
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
                      }`}
                    >
                      {lvl === 'plain' && 'Plain English'}
                      {lvl === 'simpler' && 'Simpler (6th grade)'}
                      {lvl === 'technical' && 'Legal-technical'}
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                {answerBody}
              </p>

              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Citations
                </div>
                <ul className="mt-2 space-y-2">
                  {sampleCitations.map((c) => (
                    <li
                      key={c.label}
                      className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{c.label}</div>
                        <p className="text-xs text-slate-600">{c.summary}</p>
                      </div>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="shrink-0 rounded-md bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                      >
                        View source
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-600">Was this helpful?</span>
                <button
                  type="button"
                  onClick={() => setFeedback('up')}
                  aria-pressed={feedback === 'up'}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    feedback === 'up'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFeedback('down')}
                  aria-pressed={feedback === 'down'}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    feedback === 'down'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-slate-200 text-slate-600 hover:border-amber-300'
                  }`}
                >
                  <ThumbsDown className="h-3.5 w-3.5" /> No
                </button>
                {feedback === 'down' && (
                  <select
                    value={feedbackReason}
                    onChange={(e) => setFeedbackReason(e.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                  >
                    <option value="">Pick a reason</option>
                    <option value="inaccurate">Inaccurate</option>
                    <option value="outdated">Outdated source</option>
                    <option value="not_my_state">Wrong jurisdiction</option>
                    <option value="too_complex">Too complex</option>
                    <option value="too_generic">Too generic</option>
                  </select>
                )}
                {feedback && (
                  <span className="text-xs text-slate-500">Thanks — logged to ai_response_feedback.</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <ShieldAlert className="h-4 w-4" />
                  Refusal transparency
                </div>
                <p className="mt-2 text-sm text-amber-900/80 leading-relaxed">
                  When the model can't answer safely, we now tell the user why and where to go next.
                </p>
                <button
                  type="button"
                  onClick={() => setRefusalOpen((v) => !v)}
                  className="mt-3 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  {refusalOpen ? 'Hide example' : 'Show refusal example'}
                </button>
                {refusalOpen && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-white p-3 text-xs">
                    <div className="flex items-center gap-1 font-semibold text-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5" /> Reason: INSUFFICIENT_JURISDICTION_COVERAGE
                    </div>
                    <p className="mt-1 text-slate-700">
                      We don't have enough verified sources for Wyoming landlord notice periods to answer with confidence.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        to="/find-attorney"
                        className="rounded-md bg-teal-600 px-2.5 py-1 font-semibold text-white"
                      >
                        Talk to a human
                      </Link>
                      <Link
                        to="/emergency-resources"
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700"
                      >
                        Find legal aid near you
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <BookOpen className="h-4 w-4 text-teal-600" />
                  Public evaluation results
                </div>
                <p className="mt-1 text-xs text-slate-500">Last run: May 1, 2026 · Methodology published</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {evalMetrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">{m.label}</div>
                      <div className="mt-1 text-xl font-bold text-slate-900">
                        {m.value}
                        <span className="ml-0.5 text-xs text-slate-500">%</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600">{m.trend} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="h-4 w-4 text-teal-600" />
                Jurisdiction coverage matrix
              </div>
              <Link
                to="/scope-disclaimers"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Scope & limits <Info className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2 font-semibold">State</th>
                    <th className="px-3 py-2 font-semibold">Statutes</th>
                    <th className="px-3 py-2 font-semibold">Regulations</th>
                    <th className="px-3 py-2 font-semibold">Case law</th>
                    <th className="px-3 py-2 font-semibold">Forms</th>
                    <th className="px-3 py-2 font-semibold">Spanish parity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jurisdictionMatrix.map((row) => (
                    <tr key={row.state}>
                      <td className="px-3 py-2 font-semibold text-slate-900">{row.state}</td>
                      <td className="px-3 py-2"><CoverageChip level={row.statutes} /></td>
                      <td className="px-3 py-2"><CoverageChip level={row.regs} /></td>
                      <td className="px-3 py-2"><CoverageChip level={row.caselaw} /></td>
                      <td className="px-3 py-2"><CoverageChip level={row.forms} /></td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-teal-500"
                              style={{ width: `${row.spanish}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{row.spanish}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10 rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Contextual CTA for {persCopy.label}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-700"
              >
                {persCopy.cta}
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-slate-500">
                Wired through cta_experiments + engagement_analytics telemetry.
              </span>
            </div>
          </section>

          <div className="text-center text-xs text-slate-500">
            Prototype of the Phase 1 roadmap. Live data wires into Supabase tables described in the gap
            analysis (ai_response_feedback, refusal_events, evaluation_metrics, jurisdiction_coverage,
            cta_experiments).
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function CoverageChip({ level }: { level: string }) {
  const tone =
    level === 'Full'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : level === 'Broad'
      ? 'bg-teal-50 text-teal-700 ring-teal-200'
      : level === 'Partial'
      ? 'bg-amber-50 text-amber-700 ring-amber-200'
      : 'bg-slate-100 text-slate-600 ring-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${tone}`}>
      {level}
    </span>
  );
}
