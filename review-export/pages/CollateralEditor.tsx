import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  Save,
  Download,
  Send,
  Image as ImageIcon,
  QrCode,
  Plus,
  Trash2,
  History,
  Loader2,
  Bold,
  Italic,
  List as ListIcon,
  CheckCircle2,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Section {
  heading: string;
  content: string[];
}

interface Draft {
  id: string;
  asset_id: string;
  title: string;
  subtitle: string;
  content_sections: Section[];
  cover_image_url: string;
  qr_payload: string;
  accent_color: string;
  status: 'draft' | 'ready' | 'sent' | 'archived';
  version: number;
  updated_at: string;
}

interface Version {
  id: string;
  version: number;
  note: string;
  created_at: string;
}

const ACCENT_SWATCHES = ['#0d9488', '#1e3a8a', '#ea580c', '#059669', '#be123c', '#0369a1'];

export default function CollateralEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const isAdmin = profile?.is_admin === true;

  const loadVersions = useCallback(async (draftId: string) => {
    const { data } = await supabase
      .from('collateral_draft_versions')
      .select('id, version, note, created_at')
      .eq('draft_id', draftId)
      .order('version', { ascending: false });
    setVersions((data as Version[]) ?? []);
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('collateral_drafts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setMessage({ kind: 'err', text: error?.message ?? 'Draft not found' });
        setLoading(false);
        return;
      }
      setDraft(data as Draft);
      setLoading(false);
      loadVersions(id);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, loadVersions]);

  useEffect(() => {
    if (!draft?.qr_payload) {
      setQrDataUrl('');
      return;
    }
    QRCode.toDataURL(draft.qr_payload, { width: 240, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [draft?.qr_payload]);

  function patch(updates: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...updates } : d));
    setDirty(true);
  }

  function updateSection(index: number, patchSection: Partial<Section>) {
    setDraft((d) => {
      if (!d) return d;
      const next = d.content_sections.map((s, i) =>
        i === index ? { ...s, ...patchSection } : s,
      );
      return { ...d, content_sections: next };
    });
    setDirty(true);
  }

  function updateBullet(sectionIdx: number, bulletIdx: number, value: string) {
    setDraft((d) => {
      if (!d) return d;
      const section = d.content_sections[sectionIdx];
      const nextBullets = section.content.map((b, i) => (i === bulletIdx ? value : b));
      const nextSections = d.content_sections.map((s, i) =>
        i === sectionIdx ? { ...s, content: nextBullets } : s,
      );
      return { ...d, content_sections: nextSections };
    });
    setDirty(true);
  }

  function addBullet(sectionIdx: number) {
    setDraft((d) => {
      if (!d) return d;
      const section = d.content_sections[sectionIdx];
      const nextSections = d.content_sections.map((s, i) =>
        i === sectionIdx ? { ...s, content: [...section.content, ''] } : s,
      );
      return { ...d, content_sections: nextSections };
    });
    setDirty(true);
  }

  function removeBullet(sectionIdx: number, bulletIdx: number) {
    setDraft((d) => {
      if (!d) return d;
      const section = d.content_sections[sectionIdx];
      const nextSections = d.content_sections.map((s, i) =>
        i === sectionIdx
          ? { ...s, content: section.content.filter((_, j) => j !== bulletIdx) }
          : s,
      );
      return { ...d, content_sections: nextSections };
    });
    setDirty(true);
  }

  function addSection() {
    patch({
      content_sections: [...(draft?.content_sections ?? []), { heading: 'New section', content: [''] }],
    });
  }

  function removeSection(sectionIdx: number) {
    if (!draft) return;
    patch({
      content_sections: draft.content_sections.filter((_, i) => i !== sectionIdx),
    });
  }

  async function save(status?: Draft['status'], note = '') {
    if (!draft || !profile?.id) return;
    setSaving(true);
    try {
      const nextVersion = draft.version + 1;
      const { error: versionError } = await supabase.from('collateral_draft_versions').insert({
        draft_id: draft.id,
        version: draft.version,
        snapshot: {
          title: draft.title,
          subtitle: draft.subtitle,
          content_sections: draft.content_sections,
          cover_image_url: draft.cover_image_url,
          qr_payload: draft.qr_payload,
          accent_color: draft.accent_color,
          status: draft.status,
        },
        note,
        saved_by: profile.id,
      });
      if (versionError) throw versionError;

      const { error } = await supabase
        .from('collateral_drafts')
        .update({
          title: draft.title,
          subtitle: draft.subtitle,
          content_sections: draft.content_sections,
          cover_image_url: draft.cover_image_url,
          qr_payload: draft.qr_payload,
          accent_color: draft.accent_color,
          status: status ?? draft.status,
          version: nextVersion,
          updated_by: profile.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', draft.id);
      if (error) throw error;
      setDraft({ ...draft, version: nextVersion, status: status ?? draft.status });
      setDirty(false);
      setMessage({ kind: 'ok', text: `Saved as v${nextVersion}` });
      loadVersions(draft.id);
    } catch (e: unknown) {
      const text = e instanceof Error ? e.message : 'Save failed';
      setMessage({ kind: 'err', text });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 2500);
    }
  }

  async function uploadImage(file: File, onDone: (url: string) => void) {
    if (!profile?.id) return;
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('collateral-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      setMessage({ kind: 'err', text: error.message });
      return;
    }
    const { data } = supabase.storage.from('collateral-images').getPublicUrl(path);
    onDone(data.publicUrl);
  }

  async function exportPdf() {
    if (!previewRef.current || !draft) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(imgData, 'PNG', (pageWidth - w) / 2, 24, w, h);
      pdf.save(`${draft.title.replace(/\s+/g, '-').toLowerCase()}-v${draft.version}.pdf`);
    } catch (e: unknown) {
      const text = e instanceof Error ? e.message : 'PDF export failed';
      setMessage({ kind: 'err', text });
    } finally {
      setExporting(false);
    }
  }

  async function sendEmail(recipients: Array<{ email: string; name?: string }>, subject: string) {
    if (!draft || !profile?.id) return;
    setSending(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-asset-email`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients,
          assetName: draft.title,
          assetType: 'collateral',
          contentSections: draft.content_sections,
          subject,
          assetId: draft.asset_id,
          sentBy: profile.id,
        }),
      });
      if (!res.ok) throw new Error(`Send failed (${res.status})`);
      await save('sent', `Sent to ${recipients.length} recipient(s)`);
      setShowSend(false);
      setMessage({ kind: 'ok', text: 'Email sent' });
    } catch (e: unknown) {
      const text = e instanceof Error ? e.message : 'Send failed';
      setMessage({ kind: 'err', text });
    } finally {
      setSending(false);
      setTimeout(() => setMessage(null), 2500);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="bg-white p-8 rounded-xl border border-navy-200 max-w-md text-center">
          <h1 className="text-xl font-bold text-navy-900 mb-2">Admin access required</h1>
          <p className="text-navy-600 text-sm">
            The collateral studio is restricted to founders and C-suite admins.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <p className="text-navy-600">Draft not found.</p>
      </div>
    );
  }

  const accent = draft.accent_color;

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      <header className="bg-white border-b border-navy-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-3 flex items-center gap-3 flex-wrap">
          <Link
            to="/admin/collateral"
            className="p-2 -ml-2 rounded-lg hover:bg-navy-50 text-navy-600"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <input
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="w-full text-lg font-semibold text-navy-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-1"
            />
            <p className="text-xs text-navy-500 flex items-center gap-2 mt-0.5">
              v{draft.version} &middot; {draft.status}
              {dirty && <span className="text-amber-600">&middot; unsaved changes</span>}
            </p>
          </div>

          {message && (
            <div
              className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                message.kind === 'ok' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.kind === 'ok' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVersions(true)}
              className="p-2 rounded-lg text-navy-700 hover:bg-navy-50"
              aria-label="Version history"
              title="Version history"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={exportPdf}
              disabled={exporting}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-navy-200 hover:bg-navy-50 flex items-center gap-1.5 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => setShowSend(true)}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-navy-200 hover:bg-navy-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
            <button
              onClick={() => save()}
              disabled={saving || !dirty}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={() => save('ready', 'Marked ready')}
              disabled={saving}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-50 hidden md:inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark ready
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 lg:px-6 py-6 grid lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] gap-6">
        <EditorPanel
          draft={draft}
          accent={accent}
          onField={patch}
          onUpdateSection={updateSection}
          onUpdateBullet={updateBullet}
          onAddBullet={addBullet}
          onRemoveBullet={removeBullet}
          onAddSection={addSection}
          onRemoveSection={removeSection}
          onUploadImage={uploadImage}
        />

        <PreviewPanel ref={previewRef} draft={draft} accent={accent} qrDataUrl={qrDataUrl} />
      </div>

      {showVersions && (
        <VersionsDrawer versions={versions} onClose={() => setShowVersions(false)} />
      )}

      {showSend && (
        <SendDialog
          defaultSubject={`${draft.title} — ezLegal.ai`}
          sending={sending}
          onClose={() => setShowSend(false)}
          onSend={sendEmail}
        />
      )}
    </div>
  );
}

interface EditorPanelProps {
  draft: Draft;
  accent: string;
  onField: (updates: Partial<Draft>) => void;
  onUpdateSection: (idx: number, patch: Partial<Section>) => void;
  onUpdateBullet: (sIdx: number, bIdx: number, value: string) => void;
  onAddBullet: (sIdx: number) => void;
  onRemoveBullet: (sIdx: number, bIdx: number) => void;
  onAddSection: () => void;
  onRemoveSection: (idx: number) => void;
  onUploadImage: (file: File, onDone: (url: string) => void) => void;
}

function EditorPanel({
  draft,
  accent,
  onField,
  onUpdateSection,
  onUpdateBullet,
  onAddBullet,
  onRemoveBullet,
  onAddSection,
  onRemoveSection,
  onUploadImage,
}: EditorPanelProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const inlineTargetRef = useRef<{ s: number; b: number } | null>(null);

  function exec(cmd: 'bold' | 'italic' | 'insertUnorderedList') {
    document.execCommand(cmd);
  }

  function openInlineImagePicker(s: number, b: number) {
    inlineTargetRef.current = { s, b };
    inlineInputRef.current?.click();
  }

  return (
    <aside className="bg-white border border-navy-200 rounded-xl overflow-hidden flex flex-col lg:max-h-[calc(100vh-140px)]">
      <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
        <h2 className="font-semibold text-navy-900">Editor</h2>
        <div className="flex items-center gap-1 text-navy-500">
          <button onClick={() => exec('bold')} className="p-1.5 rounded hover:bg-navy-50" title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => exec('italic')} className="p-1.5 rounded hover:bg-navy-50" title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => exec('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-navy-50"
            title="Bullet list"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        <section>
          <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
            Subtitle / audience
          </label>
          <input
            value={draft.subtitle}
            onChange={(e) => onField({ subtitle: e.target.value })}
            className="mt-1 w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Who this is for"
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
              Cover image
            </label>
            <button
              onClick={() => coverInputRef.current?.click()}
              className="text-xs text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Upload
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadImage(f, (url) => onField({ cover_image_url: url }));
                e.target.value = '';
              }}
            />
          </div>
          {draft.cover_image_url ? (
            <div className="relative group">
              <img
                src={draft.cover_image_url}
                alt=""
                className="w-full h-32 object-cover rounded-lg border border-navy-200"
              />
              <button
                onClick={() => onField({ cover_image_url: '' })}
                className="absolute top-1 right-1 bg-white/90 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove cover"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => coverInputRef.current?.click()}
              className="w-full h-24 rounded-lg border-2 border-dashed border-navy-200 text-navy-400 text-xs flex items-center justify-center hover:border-teal-400 hover:text-teal-600 transition-colors"
            >
              No cover image
            </button>
          )}
        </section>

        <section>
          <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
            Accent colour
          </label>
          <div className="flex items-center gap-2 mt-2">
            {ACCENT_SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => onField({ accent_color: c })}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  accent === c ? 'border-navy-900 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </section>

        <section>
          <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5" /> QR payload (URL or text)
          </label>
          <input
            value={draft.qr_payload}
            onChange={(e) => onField({ qr_payload: e.target.value })}
            className="mt-1 w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="https://ezlegal.ai/partner/..."
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
              Content sections ({draft.content_sections.length})
            </label>
            <button
              onClick={onAddSection}
              className="text-xs text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add section
            </button>
          </div>

          {draft.content_sections.map((section, sIdx) => (
            <div key={sIdx} className="border border-navy-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={section.heading}
                  onChange={(e) => onUpdateSection(sIdx, { heading: e.target.value })}
                  className="flex-1 font-semibold text-navy-900 bg-transparent border-b border-transparent focus:border-teal-500 focus:outline-none text-sm"
                  placeholder="Section heading"
                />
                <button
                  onClick={() => onRemoveSection(sIdx)}
                  className="p-1 text-navy-400 hover:text-red-600"
                  aria-label="Remove section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {section.content.map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2">
                  <span className="text-navy-400 mt-2.5 text-xs">&bull;</span>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateBullet(sIdx, bIdx, e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: bullet }}
                    className="flex-1 min-h-[2.25rem] px-2 py-1.5 text-sm text-navy-800 border border-transparent hover:border-navy-200 focus:border-teal-500 focus:outline-none rounded"
                  />
                  <button
                    onClick={() => openInlineImagePicker(sIdx, bIdx)}
                    className="p-1 text-navy-400 hover:text-teal-600"
                    aria-label="Insert image"
                    title="Insert image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveBullet(sIdx, bIdx)}
                    className="p-1 text-navy-400 hover:text-red-600"
                    aria-label="Remove bullet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => onAddBullet(sIdx)}
                className="text-xs text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-1"
              >
                <Plus className="w-3 h-3" /> Add bullet
              </button>
            </div>
          ))}

          <input
            ref={inlineInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              const target = inlineTargetRef.current;
              if (f && target) {
                onUploadImage(f, (url) => {
                  const existing = draft.content_sections[target.s]?.content[target.b] ?? '';
                  const next = `${existing} <img src="${url}" alt="" class="inline-block max-h-32 my-2 rounded" />`;
                  onUpdateBullet(target.s, target.b, next);
                });
              }
              inlineTargetRef.current = null;
              e.target.value = '';
            }}
          />
        </section>
      </div>
    </aside>
  );
}

interface PreviewPanelProps {
  draft: Draft;
  accent: string;
  qrDataUrl: string;
}

const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(function PreviewPanel(
  { draft, accent, qrDataUrl },
  ref,
) {
  return (
    <div className="bg-navy-100 border border-navy-200 rounded-xl p-4 overflow-auto lg:max-h-[calc(100vh-140px)]">
      <p className="text-xs text-navy-500 uppercase tracking-wider mb-3 px-1">Live preview</p>
      <div
        ref={ref}
        className="bg-white mx-auto rounded-lg shadow-sm overflow-hidden"
        style={{ width: 816, maxWidth: '100%' }}
      >
        <div
          className="px-10 py-8 text-white"
          style={{ background: `linear-gradient(135deg, ${accent}, #1e3a8a)` }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">ezLegal.ai</p>
          <h1 className="text-3xl font-bold mt-2 leading-tight">{draft.title}</h1>
          {draft.subtitle && <p className="text-sm opacity-90 mt-2">{draft.subtitle}</p>}
        </div>

        {draft.cover_image_url && (
          <img
            src={draft.cover_image_url}
            alt=""
            className="w-full h-48 object-cover"
            crossOrigin="anonymous"
          />
        )}

        <div className="px-10 py-8 space-y-6">
          {draft.content_sections.map((section, i) => (
            <section key={i}>
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-2"
                style={{ color: accent }}
              >
                {section.heading}
              </h2>
              <ul className="space-y-2">
                {section.content.map((bullet, j) => (
                  <li key={j} className="text-sm text-navy-800 leading-relaxed flex gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: accent }}
                    />
                    <span
                      className="flex-1"
                      dangerouslySetInnerHTML={{ __html: bullet || '&nbsp;' }}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div
          className="px-10 py-6 border-t border-navy-100 flex items-center justify-between"
          style={{ backgroundColor: '#f8fafc' }}
        >
          <div>
            <p className="text-xs text-navy-500 uppercase tracking-wider">Learn more</p>
            <p className="text-sm font-semibold text-navy-900">ezlegal.ai</p>
            {draft.qr_payload && (
              <p className="text-xs text-navy-500 mt-1 break-all max-w-[240px]">
                {draft.qr_payload}
              </p>
            )}
          </div>
          {qrDataUrl && <img src={qrDataUrl} alt="QR code" className="w-24 h-24" />}
        </div>
      </div>
    </div>
  );
});

function VersionsDrawer({
  versions,
  onClose,
}: {
  versions: Version[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex" role="dialog">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative ml-auto w-full max-w-sm bg-white h-full shadow-xl flex flex-col">
        <header className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2">
            <History className="w-4 h-4" /> Version history
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-navy-50">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {versions.length === 0 && (
            <p className="text-sm text-navy-500">No saved versions yet.</p>
          )}
          {versions.map((v) => (
            <div key={v.id} className="border border-navy-200 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-navy-900">v{v.version}</p>
                <p className="text-xs text-navy-500">
                  {new Date(v.created_at).toLocaleString()}
                </p>
              </div>
              {v.note && <p className="text-xs text-navy-600 mt-1">{v.note}</p>}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function SendDialog({
  defaultSubject,
  sending,
  onClose,
  onSend,
}: {
  defaultSubject: string;
  sending: boolean;
  onClose: () => void;
  onSend: (recipients: Array<{ email: string; name?: string }>, subject: string) => void;
}) {
  const [raw, setRaw] = useState('');
  const [subject, setSubject] = useState(defaultSubject);

  function submit() {
    const recipients = raw
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((email) => ({ email }));
    if (recipients.length === 0) return;
    onSend(recipients, subject);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2">
            <Send className="w-4 h-4" /> Send collateral
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-navy-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
          Subject
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 mb-4 w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
          Recipients (comma or newline separated)
        </label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={4}
          placeholder="partner@example.org, team@nonprofit.org"
          className="mt-1 w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-navy-200 hover:bg-navy-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={sending || raw.trim() === ''}
            className="px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send and archive
          </button>
        </div>
      </div>
    </div>
  );
}
