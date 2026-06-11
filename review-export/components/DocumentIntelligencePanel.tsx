import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  ListTree,
  ShieldCheck,
  Workflow,
  Compass,
  FileSearch,
  ChevronRight,
  X,
  PenLine,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Action = 'analyze' | 'triage' | 'research_plan' | 'suggest_clause';

interface Clause {
  id: string;
  clause_index: number;
  heading: string;
  snippet: string;
  clause_type: string;
}

interface Risk {
  id: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  suggestion: string;
  clause_id: string | null;
}

interface Suggestion {
  id: string;
  title: string;
  suggested_text: string;
  rationale: string;
}

interface Triage {
  detected_matter_type: string;
  urgency: string;
  suggested_template_slug: string;
  routing_recommendation: string;
  confidence: number;
}

interface ResearchStep {
  step_order: number;
  step_type: string;
  title: string;
  detail: string;
}

interface Props {
  documentId: string | null;
  documentContent: string;
  onClose?: () => void;
}

const SEVERITY_STYLES: Record<Risk['severity'], string> = {
  critical: 'border-rose-300 bg-rose-50 text-rose-900',
  high: 'border-rose-200 bg-rose-50/70 text-rose-900',
  medium: 'border-amber-200 bg-amber-50 text-amber-900',
  low: 'border-sky-200 bg-sky-50 text-sky-900',
  info: 'border-slate-200 bg-slate-50 text-slate-800',
};

const SEVERITY_DOT: Record<Risk['severity'], string> = {
  critical: 'bg-rose-600',
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-sky-500',
  info: 'bg-slate-400',
};

export default function DocumentIntelligencePanel({ documentId, documentContent, onClose }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'clauses' | 'risks' | 'suggestions' | 'triage' | 'research'>('clauses');
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [triage, setTriage] = useState<Triage | null>(null);
  const [research, setResearch] = useState<ResearchStep[]>([]);
  const [triageText, setTriageText] = useState('');
  const [researchGoal, setResearchGoal] = useState('');

  async function callFn(body: Record<string, unknown>) {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error('Sign in required');
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-document`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed (${res.status})`);
    }
    return res.json();
  }

  async function runAnalyze() {
    if (!documentId || !documentContent) {
      setError('Save the document first to run deep analysis.');
      return;
    }
    setBusy('analyze');
    setError(null);
    try {
      await callFn({ action: 'analyze', documentId, content: documentContent });
      await loadAnalysisResults();
      setTab('clauses');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function loadAnalysisResults() {
    if (!documentId || !user) return;
    const [{ data: cl }, { data: rk }, { data: sg }] = await Promise.all([
      supabase
        .from('document_clauses')
        .select('id, clause_index, heading, snippet, clause_type')
        .eq('document_id', documentId)
        .order('clause_index'),
      supabase
        .from('document_risks')
        .select('id, severity, category, title, description, suggestion, clause_id')
        .eq('document_id', documentId),
      supabase
        .from('document_clause_suggestions')
        .select('id, title, suggested_text, rationale')
        .eq('document_id', documentId),
    ]);
    setClauses((cl ?? []) as Clause[]);
    setRisks((rk ?? []) as Risk[]);
    setSuggestions((sg ?? []) as Suggestion[]);
  }

  async function runTriage() {
    if (!triageText.trim()) return;
    setBusy('triage');
    setError(null);
    try {
      const res = await callFn({ action: 'triage', intakeText: triageText });
      setTriage(res.triage as Triage);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function runResearch() {
    if (!researchGoal.trim()) return;
    setBusy('research_plan');
    setError(null);
    try {
      const res = await callFn({ action: 'research_plan', goal: researchGoal, documentId });
      const { data: steps } = await supabase
        .from('document_research_steps')
        .select('step_order, step_type, title, detail')
        .eq('plan_id', res.planId)
        .order('step_order');
      setResearch((steps ?? []) as ResearchStep[]);
      try {
        sessionStorage.setItem('ezlegal-research-goal', researchGoal);
        const draftStep = (steps ?? []).find((s: ResearchStep) => s.step_type?.toLowerCase() === 'draft');
        if (draftStep) {
          sessionStorage.setItem('ezlegal-research-draft-step', JSON.stringify(draftStep));
        }
      } catch {}
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const tabs: Array<{ key: typeof tab; label: string; icon: typeof ListTree; count?: number }> = [
    { key: 'clauses', label: 'Clauses', icon: ListTree, count: clauses.length || undefined },
    { key: 'risks', label: 'Risks', icon: ShieldCheck, count: risks.length || undefined },
    { key: 'suggestions', label: 'Suggestions', icon: Sparkles, count: suggestions.length || undefined },
    { key: 'triage', label: 'Intake Triage', icon: Compass },
    { key: 'research', label: 'Research Plan', icon: FileSearch },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-teal-600" />
          <div>
            <h3 className="text-base font-semibold text-navy-900">Document Intelligence</h3>
            <p className="text-xs text-navy-500">
              Clause navigation, risk detection, drafting suggestions, intake triage, and research planning.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runAnalyze}
            disabled={busy === 'analyze' || !documentId}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {busy === 'analyze' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyze document
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-2">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition ${
              tab === key
                ? 'border border-b-white border-slate-200 bg-white text-teal-700'
                : 'text-slate-600 hover:text-teal-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {count !== undefined && (
              <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-600">{count}</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-5">
        {tab === 'clauses' && (
          <ClauseList clauses={clauses} risks={risks} />
        )}
        {tab === 'risks' && <RiskList risks={risks} />}
        {tab === 'suggestions' && <SuggestionList suggestions={suggestions} />}
        {tab === 'triage' && (
          <TriagePanel
            value={triageText}
            setValue={setTriageText}
            onRun={runTriage}
            busy={busy === 'triage'}
            triage={triage}
          />
        )}
        {tab === 'research' && (
          <ResearchPanel
            goal={researchGoal}
            setGoal={setResearchGoal}
            onRun={runResearch}
            busy={busy === 'research_plan'}
            steps={research}
            onDraftStep={(step) => {
              const params = new URLSearchParams({
                draft: '1',
                goal: researchGoal,
                step: step.title,
                detail: step.detail,
              });
              navigate(`/documents?${params.toString()}`);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ClauseList({ clauses, risks }: { clauses: Clause[]; risks: Risk[] }) {
  if (!clauses.length) {
    return (
      <EmptyState
        title="No clauses analyzed yet"
        description='Click "Analyze document" to segment the document into navigable clauses.'
      />
    );
  }
  const riskByClause = new Map<string, Risk[]>();
  risks.forEach((r) => {
    if (!r.clause_id) return;
    const arr = riskByClause.get(r.clause_id) ?? [];
    arr.push(r);
    riskByClause.set(r.clause_id, arr);
  });
  return (
    <ul className="space-y-2">
      {clauses.map((c) => {
        const clauseRisks = riskByClause.get(c.id) ?? [];
        return (
          <li
            key={c.id}
            className="rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {c.clause_type.replace(/_/g, ' ')}
                  </span>
                  <h4 className="truncate text-sm font-semibold text-navy-900">{c.heading}</h4>
                </div>
                <p className="mt-1.5 text-sm text-navy-600 line-clamp-3">{c.snippet}</p>
              </div>
              {clauseRisks.length > 0 && (
                <div className="flex flex-col items-end gap-1">
                  {clauseRisks.map((r) => (
                    <span
                      key={r.id}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${SEVERITY_STYLES[r.severity]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[r.severity]}`} />
                      {r.severity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function RiskList({ risks }: { risks: Risk[] }) {
  if (!risks.length) {
    return (
      <EmptyState
        title="No risks detected"
        description='Run "Analyze document" to surface missing clauses, overbroad language, and enforcement issues.'
      />
    );
  }
  const ordered = [...risks].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 } as const;
    return order[a.severity] - order[b.severity];
  });
  return (
    <ul className="space-y-3">
      {ordered.map((r) => (
        <li key={r.id} className={`rounded-xl border p-4 ${SEVERITY_STYLES[r.severity]}`}>
          <div className="flex items-start gap-3">
            <span className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${SEVERITY_DOT[r.severity]}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">{r.title}</h4>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
                  {r.severity}
                </span>
              </div>
              <p className="mt-1 text-sm">{r.description}</p>
              <p className="mt-2 rounded-md bg-white/70 p-2 text-sm">
                <span className="font-semibold">Suggested fix: </span>
                {r.suggestion}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SuggestionList({ suggestions }: { suggestions: Suggestion[] }) {
  if (!suggestions.length) {
    return (
      <EmptyState
        title="No drafting suggestions yet"
        description="We propose clause additions and edits after analyzing the document."
      />
    );
  }
  return (
    <ul className="space-y-3">
      {suggestions.map((s) => (
        <li key={s.id} className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <h4 className="text-sm font-semibold text-navy-900">{s.title}</h4>
          <p className="mt-1 text-xs text-navy-600">{s.rationale}</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-white p-3 text-xs text-navy-800">
            {s.suggested_text}
          </pre>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(s.suggested_text)}
              className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
            >
              Copy clause
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TriagePanel({
  value,
  setValue,
  onRun,
  busy,
  triage,
}: {
  value: string;
  setValue: (v: string) => void;
  onRun: () => void;
  busy: boolean;
  triage: Triage | null;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-navy-600">
        Describe the client situation in plain language. We'll classify matter type, detect urgency, and suggest a starting template.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Example: My landlord served me a 5-day eviction notice yesterday for unpaid rent. Court date is next Friday."
        className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
      />
      <button
        type="button"
        onClick={onRun}
        disabled={busy || !value.trim()}
        className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
        Run intake triage
      </button>
      {triage && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Matter type</dt>
              <dd className="mt-0.5 font-semibold text-navy-900">
                {triage.detected_matter_type.replace(/_/g, ' ')}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Urgency</dt>
              <dd
                className={`mt-0.5 font-semibold ${
                  triage.urgency === 'emergency'
                    ? 'text-rose-700'
                    : triage.urgency === 'priority'
                    ? 'text-amber-700'
                    : 'text-teal-700'
                }`}
              >
                {triage.urgency}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Suggested template</dt>
              <dd className="mt-0.5 font-semibold text-navy-900">
                {triage.suggested_template_slug.replace(/_/g, ' ')}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Confidence</dt>
              <dd className="mt-0.5 font-semibold text-navy-900">
                {Math.round(triage.confidence * 100)}%
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-navy-700">
            <ChevronRight className="mr-1 inline h-4 w-4 text-teal-600" />
            {triage.routing_recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

function ResearchPanel({
  goal,
  setGoal,
  onRun,
  busy,
  steps,
  onDraftStep,
}: {
  goal: string;
  setGoal: (v: string) => void;
  onRun: () => void;
  busy: boolean;
  steps: ResearchStep[];
  onDraftStep: (step: ResearchStep) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-navy-600">
        Describe the drafting or research goal. We'll plan a multi-step workflow: identify controlling law, survey case law, draft, review, and finalize.
      </p>
      <input
        type="text"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Example: Draft a non-compete enforceable in California for a SaaS sales role."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
      />
      <button
        type="button"
        onClick={onRun}
        disabled={busy || !goal.trim()}
        className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
        Build research plan
      </button>
      {steps.length > 0 && (
        <ol className="space-y-2">
          {steps.map((s) => (
            <li key={s.step_order} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                {s.step_order + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-navy-900">{s.title}</h4>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                    {s.step_type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-navy-600">{s.detail}</p>
                {s.step_type?.toLowerCase() === 'draft' && (
                  <button
                    type="button"
                    onClick={() => onDraftStep(s)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-700"
                  >
                    <PenLine className="h-3 w-3" />
                    Draft this now
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <h4 className="text-sm font-semibold text-navy-900">{title}</h4>
      <p className="mt-1 text-xs text-navy-600">{description}</p>
    </div>
  );
}
