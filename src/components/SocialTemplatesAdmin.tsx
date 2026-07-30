import { useState, useEffect } from 'react';
import {
  Plus, Save, Trash2, Loader2, Edit, X,
  MessageCircle, Facebook, MapPin, GripVertical,
  Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SocialTemplate {
  id: string;
  platform: string;
  icon_name: string;
  color: string;
  label_en: string;
  label_es: string;
  text_en: string;
  text_es: string;
  is_active: boolean;
  display_order: number;
}

const PLATFORM_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366]' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]' },
  { value: 'nextdoor', label: 'Nextdoor', icon: MapPin, color: 'bg-[#8ED500]' },
  { value: 'instagram', label: 'Instagram', icon: MessageCircle, color: 'bg-[#E4405F]' },
  { value: 'twitter', label: 'X / Twitter', icon: MessageCircle, color: 'bg-[#1DA1F2]' },
  { value: 'linkedin', label: 'LinkedIn', icon: MessageCircle, color: 'bg-[#0A66C2]' },
  { value: 'email', label: 'Email', icon: MessageCircle, color: 'bg-[#EA4335]' },
  { value: 'sms', label: 'SMS / Text', icon: MessageCircle, color: 'bg-[#5B5EA6]' },
];

const ICON_MAP: Record<string, typeof MessageCircle> = {
  MessageCircle,
  Facebook,
  MapPin,
};

function getIcon(name: string) {
  return ICON_MAP[name] || MessageCircle;
}

export default function SocialTemplatesAdmin() {
  const [templates, setTemplates] = useState<SocialTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TemplateFormData>({ platform: '', label_en: '', label_es: '', text_en: '', text_es: '' });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({
    platform: 'whatsapp',
    label_en: '',
    label_es: '',
    text_en: '',
    text_es: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('social_media_templates')
      .select('*')
      .order('display_order');
    setTemplates((data || []) as SocialTemplate[]);
    setLoading(false);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setSaving(id);
    await supabase
      .from('social_media_templates')
      .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
      .eq('id', id);
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentActive } : t));
    setSaving(null);
  };

  const handleStartEdit = (template: SocialTemplate) => {
    setEditingId(template.id);
    setEditForm({
      platform: template.platform,
      label_en: template.label_en,
      label_es: template.label_es,
      text_en: template.text_en,
      text_es: template.text_es,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(editingId);

    const platformConfig = PLATFORM_OPTIONS.find(p => p.value === editForm.platform);
    await supabase
      .from('social_media_templates')
      .update({
        platform: editForm.platform,
        icon_name: platformConfig?.icon.displayName || 'MessageCircle',
        color: platformConfig?.color || 'bg-gray-500',
        label_en: editForm.label_en,
        label_es: editForm.label_es,
        text_en: editForm.text_en,
        text_es: editForm.text_es,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingId);

    await loadTemplates();
    setEditingId(null);
    setEditForm({ platform: '', label_en: '', label_es: '', text_en: '', text_es: '' });
    setSaving(null);
  };

  const handleCreate = async () => {
    setSaving('new');
    const platformConfig = PLATFORM_OPTIONS.find(p => p.value === newForm.platform);
    const maxOrder = templates.reduce((max, t) => Math.max(max, t.display_order), 0);

    await supabase
      .from('social_media_templates')
      .insert({
        platform: newForm.platform,
        icon_name: platformConfig?.icon.displayName || 'MessageCircle',
        color: platformConfig?.color || 'bg-gray-500',
        label_en: newForm.label_en,
        label_es: newForm.label_es,
        text_en: newForm.text_en,
        text_es: newForm.text_es,
        display_order: maxOrder + 1,
      });

    await loadTemplates();
    setShowNew(false);
    setNewForm({ platform: 'whatsapp', label_en: '', label_es: '', text_en: '', text_es: '' });
    setSaving(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    setSaving(id);
    await supabase.from('social_media_templates').delete().eq('id', id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Social Media Templates</h2>
          <p className="text-sm text-navy-500 mt-1">
            Manage the social media post templates shown on the Media Kit page.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl border border-navy-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">New Template</h3>
            <button onClick={() => setShowNew(false)} className="text-navy-400 hover:text-navy-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <TemplateForm
            form={newForm}
            onChange={setNewForm}
            onSave={handleCreate}
            onCancel={() => setShowNew(false)}
            saving={saving === 'new'}
          />
        </div>
      )}

      <div className="space-y-4">
        {templates.map(template => {
          const Icon = getIcon(template.icon_name);
          const isEditing = editingId === template.id;

          return (
            <div
              key={template.id}
              className={`bg-white rounded-xl border ${
                template.is_active ? 'border-navy-200' : 'border-navy-100 opacity-60'
              } overflow-hidden`}
            >
              <div className={`${template.color} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-white/60" />
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold text-sm">{template.label_en}</span>
                  {!template.is_active && (
                    <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Hidden</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(template.id, template.is_active)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title={template.is_active ? 'Hide template' : 'Show template'}
                  >
                    {template.is_active
                      ? <Eye className="w-4 h-4 text-white" />
                      : <EyeOff className="w-4 h-4 text-white/70" />
                    }
                  </button>
                  <button
                    onClick={() => isEditing ? setEditingId(null) : handleStartEdit(template)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isEditing
                      ? <X className="w-4 h-4 text-white" />
                      : <Edit className="w-4 h-4 text-white" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="p-5">
                  <TemplateForm
                    form={editForm}
                    onChange={setEditForm}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingId(null)}
                    saving={saving === template.id}
                  />
                </div>
              ) : (
                <div className="p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">English</span>
                      <div className="bg-navy-50 rounded-lg p-3 mt-1">
                        <p className="text-sm text-navy-800 whitespace-pre-wrap leading-relaxed">{template.text_en}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Spanish</span>
                      <div className="bg-navy-50 rounded-lg p-3 mt-1">
                        <p className="text-sm text-navy-800 whitespace-pre-wrap leading-relaxed">{template.text_es}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {templates.length === 0 && !showNew && (
        <div className="text-center py-16 bg-navy-50 rounded-xl">
          <MessageCircle className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-600 font-medium">No templates yet</p>
          <p className="text-sm text-navy-400 mt-1">Create your first social media post template above.</p>
        </div>
      )}
    </div>
  );
}

interface TemplateFormData {
  platform: string;
  label_en: string;
  label_es: string;
  text_en: string;
  text_es: string;
}

function TemplateForm({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  form: TemplateFormData;
  onChange: (form: TemplateFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const update = (field: keyof TemplateFormData, value: string) => onChange({ ...form, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-navy-600 mb-1">Platform</label>
        <select
          value={form.platform || 'whatsapp'}
          onChange={e => onChange({ ...form, platform: e.target.value })}
          className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          {PLATFORM_OPTIONS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-navy-600 mb-1">Label (EN)</label>
          <input
            type="text"
            value={form.label_en || ''}
            onChange={e => update('label_en', e.target.value)}
            className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g. WhatsApp Message"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy-600 mb-1">Label (ES)</label>
          <input
            type="text"
            value={form.label_es || ''}
            onChange={e => update('label_es', e.target.value)}
            className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g. Mensaje de WhatsApp"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy-600 mb-1">Post Text (EN)</label>
        <textarea
          value={form.text_en || ''}
          onChange={e => update('text_en', e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          placeholder="English post template..."
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy-600 mb-1">Post Text (ES)</label>
        <textarea
          value={form.text_es || ''}
          onChange={e => update('text_es', e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          placeholder="Spanish post template..."
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={saving || !form.label_en || !form.text_en}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-navy-600 hover:text-navy-800 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
