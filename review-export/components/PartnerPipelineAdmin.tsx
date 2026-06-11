import { useState, useEffect } from 'react';
import { Building2, Search, ChevronDown, ChevronRight, Plus, Eye, CreditCard as Edit, Loader2, ArrowRight, Clock, CheckCircle, X, Save, Phone, Mail, Globe, Users, TrendingUp, AlertCircle, Star, Filter, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Partner {
  id: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  partner_type: string;
  tier: string;
  pipeline_stage: string;
  pipeline_substage: string;
  source: string;
  assigned_to: string;
  priority: string;
  monthly_value: number;
  language_preference: string;
  notes: string;
  last_contact_at: string;
  pilot_start_date: string;
  pilot_end_date: string;
  contract_start_date: string;
  contract_end_date: string;
  created_at: string;
  updated_at: string;
}

interface PipelineActivity {
  id: string;
  activity_type: string;
  from_stage: string;
  to_stage: string;
  description: string;
  created_at: string;
}

const PIPELINE_STAGES = [
  { id: 'lead', label: 'Lead', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'discovery', label: 'Discovery', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { id: 'proposal', label: 'Proposal', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'pilot', label: 'Pilot', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { id: 'onboarding', label: 'Onboarding', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'active', label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'paused', label: 'Paused', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { id: 'churned', label: 'Churned', color: 'bg-red-100 text-red-700 border-red-200' },
];

const PARTNER_TYPES = [
  { id: 'legal_aid', label: 'Legal Aid' },
  { id: 'enterprise', label: 'Enterprise' },
  { id: 'technology', label: 'Technology' },
  { id: 'nonprofit', label: 'Nonprofit' },
  { id: 'government', label: 'Government' },
];

const PRIORITY_OPTIONS = [
  { id: 'low', label: 'Low', color: 'text-slate-600' },
  { id: 'medium', label: 'Medium', color: 'text-blue-600' },
  { id: 'high', label: 'High', color: 'text-amber-600' },
  { id: 'critical', label: 'Critical', color: 'text-red-600' },
];

const ACTIVITY_TYPES = [
  { id: 'note', label: 'Note' },
  { id: 'email', label: 'Email Sent' },
  { id: 'call', label: 'Phone Call' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'proposal_sent', label: 'Proposal Sent' },
  { id: 'demo_scheduled', label: 'Demo Scheduled' },
  { id: 'follow_up', label: 'Follow Up' },
];

export default function PartnerPipelineAdmin() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [activities, setActivities] = useState<PipelineActivity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    const { data } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    setPartners(data || []);
    setLoading(false);
  };

  const fetchActivities = async (partnerId: string) => {
    const { data } = await supabase
      .from('partner_pipeline_activities')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
      .limit(20);

    setActivities(data || []);
  };

  const updatePartnerStage = async (partnerId: string, newStage: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    await supabase.from('partners').update({ pipeline_stage: newStage }).eq('id', partnerId);

    await supabase.from('partner_pipeline_activities').insert({
      partner_id: partnerId,
      activity_type: 'stage_change',
      from_stage: partner.pipeline_stage,
      to_stage: newStage,
      description: `Moved from ${partner.pipeline_stage} to ${newStage}`,
      performed_by: user?.id,
    });

    fetchPartners();
    if (selectedPartner?.id === partnerId) {
      setSelectedPartner({ ...partner, pipeline_stage: newStage });
      fetchActivities(partnerId);
    }
  };

  const openPartnerDetail = (partner: Partner) => {
    setSelectedPartner(partner);
    fetchActivities(partner.id);
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || p.pipeline_stage === stageFilter;
    const matchesType = typeFilter === 'all' || p.partner_type === typeFilter;
    return matchesSearch && matchesStage && matchesType;
  });

  const stageGroups = PIPELINE_STAGES.map(stage => ({
    ...stage,
    partners: filteredPartners.filter(p => p.pipeline_stage === stage.id),
  }));

  const pipelineStats = {
    total: partners.length,
    active: partners.filter(p => p.pipeline_stage === 'active').length,
    inPipeline: partners.filter(p => !['active', 'churned', 'paused'].includes(p.pipeline_stage)).length,
    totalValue: partners.reduce((sum, p) => sum + (p.monthly_value || 0), 0),
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-navy-900">Partner Pipeline</h2>
          <p className="text-navy-500 mt-1">Manage partner relationships and track pipeline progress</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-navy-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">{pipelineStats.total}</p>
              <p className="text-xs text-navy-500">Total Partners</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-navy-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">{pipelineStats.inPipeline}</p>
              <p className="text-xs text-navy-500">In Pipeline</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-navy-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">{pipelineStats.active}</p>
              <p className="text-xs text-navy-500">Active Partners</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-navy-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900">${pipelineStats.totalValue.toLocaleString()}</p>
              <p className="text-xs text-navy-500">Monthly Value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search partners..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-navy-200 rounded-xl text-navy-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-navy-900"
        >
          <option value="all">All Stages</option>
          {PIPELINE_STAGES.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-navy-900"
        >
          <option value="all">All Types</option>
          {PARTNER_TYPES.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <div className="flex bg-white border border-navy-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('pipeline')}
            className={`px-4 py-2.5 text-sm font-medium ${viewMode === 'pipeline' ? 'bg-teal-600 text-white' : 'text-navy-600'}`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2.5 text-sm font-medium ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'text-navy-600'}`}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === 'pipeline' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stageGroups.map(stage => (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className={`px-3 py-2 rounded-t-xl border ${stage.color} flex items-center justify-between`}>
                <span className="text-sm font-semibold">{stage.label}</span>
                <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">
                  {stage.partners.length}
                </span>
              </div>
              <div className="bg-navy-50/50 border border-t-0 border-navy-200 rounded-b-xl p-2 min-h-[200px] space-y-2">
                {stage.partners.map(partner => (
                  <button
                    key={partner.id}
                    onClick={() => openPartnerDetail(partner)}
                    className="w-full bg-white rounded-lg p-3 border border-navy-100 hover:border-teal-300 hover:shadow-sm transition-all text-left"
                  >
                    <p className="text-sm font-semibold text-navy-900 truncate">{partner.organization_name}</p>
                    <p className="text-xs text-navy-500 truncate">{partner.contact_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-navy-100 rounded text-navy-600">
                        {PARTNER_TYPES.find(t => t.id === partner.partner_type)?.label}
                      </span>
                      {partner.monthly_value > 0 && (
                        <span className="text-xs text-teal-600 font-semibold">
                          ${partner.monthly_value}/mo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className={`w-2 h-2 rounded-full ${
                        partner.priority === 'critical' ? 'bg-red-500' :
                        partner.priority === 'high' ? 'bg-amber-500' :
                        partner.priority === 'medium' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`} />
                      <span className="text-xs text-navy-400 capitalize">{partner.priority}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-navy-50 border-b border-navy-200">
                <th className="text-left text-xs font-semibold text-navy-600 px-4 py-3">Organization</th>
                <th className="text-left text-xs font-semibold text-navy-600 px-4 py-3">Contact</th>
                <th className="text-left text-xs font-semibold text-navy-600 px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-navy-600 px-4 py-3">Stage</th>
                <th className="text-left text-xs font-semibold text-navy-600 px-4 py-3">Priority</th>
                <th className="text-left text-xs font-semibold text-navy-600 px-4 py-3">Value</th>
                <th className="text-left text-xs font-semibold text-navy-600 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map(partner => {
                const stageDef = PIPELINE_STAGES.find(s => s.id === partner.pipeline_stage);
                return (
                  <tr key={partner.id} className="border-b border-navy-100 hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-navy-900">{partner.organization_name}</p>
                      <p className="text-xs text-navy-500">{partner.website}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-navy-800">{partner.contact_name}</p>
                      <p className="text-xs text-navy-500">{partner.contact_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-navy-100 rounded text-navy-600">
                        {PARTNER_TYPES.find(t => t.id === partner.partner_type)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded border ${stageDef?.color}`}>
                        {stageDef?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold capitalize ${
                        PRIORITY_OPTIONS.find(p => p.id === partner.priority)?.color
                      }`}>
                        {partner.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-navy-800">
                      {partner.monthly_value > 0 ? `$${partner.monthly_value}/mo` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openPartnerDetail(partner)}
                        className="text-teal-600 hover:text-teal-500 text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPartners.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-navy-500">
                    No partners found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedPartner && (
        <PartnerDetailDrawer
          partner={selectedPartner}
          activities={activities}
          onClose={() => setSelectedPartner(null)}
          onStageChange={(stage) => updatePartnerStage(selectedPartner.id, stage)}
          onAddActivity={() => setShowActivityModal(true)}
          onRefresh={() => {
            fetchPartners();
            fetchActivities(selectedPartner.id);
          }}
        />
      )}

      {showAddModal && (
        <AddPartnerModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            fetchPartners();
          }}
        />
      )}

      {showActivityModal && selectedPartner && (
        <AddActivityModal
          partnerId={selectedPartner.id}
          userId={user?.id || ''}
          onClose={() => setShowActivityModal(false)}
          onAdded={() => {
            setShowActivityModal(false);
            fetchActivities(selectedPartner.id);
          }}
        />
      )}
    </div>
  );
}

function PartnerDetailDrawer({
  partner,
  activities,
  onClose,
  onStageChange,
  onAddActivity,
  onRefresh,
}: {
  partner: Partner;
  activities: PipelineActivity[];
  onClose: () => void;
  onStageChange: (stage: string) => void;
  onAddActivity: () => void;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(partner);

  const handleSave = async () => {
    await supabase.from('partners').update({
      organization_name: formData.organization_name,
      contact_name: formData.contact_name,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      website: formData.website,
      partner_type: formData.partner_type,
      tier: formData.tier,
      priority: formData.priority,
      monthly_value: formData.monthly_value,
      assigned_to: formData.assigned_to,
      notes: formData.notes,
      language_preference: formData.language_preference,
    }).eq('id', partner.id);

    setEditing(false);
    onRefresh();
  };

  const stageDef = PIPELINE_STAGES.find(s => s.id === partner.pipeline_stage);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-navy-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-navy-900">{partner.organization_name}</h2>
            <span className={`text-xs px-2 py-1 rounded border ${stageDef?.color}`}>{stageDef?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="p-2 text-navy-600 hover:bg-navy-100 rounded-lg">
                <Edit className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-500">
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
            )}
            <button onClick={onClose} className="p-2 text-navy-600 hover:bg-navy-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-navy-700 mb-3">Move to Stage</h3>
            <div className="flex flex-wrap gap-2">
              {PIPELINE_STAGES.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => onStageChange(stage.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    partner.pipeline_stage === stage.id
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-navy-600 border-navy-200 hover:border-teal-300'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Contact</label>
              {editing ? (
                <input
                  value={formData.contact_name}
                  onChange={e => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
                />
              ) : (
                <p className="mt-1 text-sm text-navy-800">{partner.contact_name}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Email</label>
              {editing ? (
                <input
                  value={formData.contact_email}
                  onChange={e => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
                />
              ) : (
                <p className="mt-1 text-sm text-navy-800 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-navy-400" />
                  {partner.contact_email}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Phone</label>
              {editing ? (
                <input
                  value={formData.contact_phone}
                  onChange={e => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
                />
              ) : (
                <p className="mt-1 text-sm text-navy-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-navy-400" />
                  {partner.contact_phone || '-'}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Website</label>
              {editing ? (
                <input
                  value={formData.website}
                  onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
                />
              ) : (
                <p className="mt-1 text-sm text-navy-800 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-navy-400" />
                  {partner.website || '-'}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Type</label>
              {editing ? (
                <select
                  value={formData.partner_type}
                  onChange={e => setFormData(prev => ({ ...prev, partner_type: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
                >
                  {PARTNER_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              ) : (
                <p className="mt-1 text-sm text-navy-800">
                  {PARTNER_TYPES.find(t => t.id === partner.partner_type)?.label}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Priority</label>
              {editing ? (
                <select
                  value={formData.priority}
                  onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
                >
                  {PRIORITY_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              ) : (
                <p className={`mt-1 text-sm font-semibold capitalize ${PRIORITY_OPTIONS.find(p => p.id === partner.priority)?.color}`}>
                  {partner.priority}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Monthly Value</label>
              {editing ? (
                <input
                  type="number"
                  value={formData.monthly_value}
                  onChange={e => setFormData(prev => ({ ...prev, monthly_value: Number(e.target.value) }))}
                  className="mt-1 w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
                />
              ) : (
                <p className="mt-1 text-sm text-navy-800">${partner.monthly_value || 0}/mo</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Notes</label>
            {editing ? (
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 resize-none"
              />
            ) : (
              <p className="mt-1 text-sm text-navy-700 whitespace-pre-wrap">{partner.notes || 'No notes'}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-navy-700">Activity Timeline</h3>
              <button
                onClick={onAddActivity}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-500 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Activity
              </button>
            </div>
            {activities.length === 0 ? (
              <p className="text-sm text-navy-400 text-center py-6">No activities recorded</p>
            ) : (
              <div className="space-y-3">
                {activities.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.activity_type === 'stage_change' ? 'bg-teal-100' :
                        activity.activity_type === 'email' ? 'bg-blue-100' :
                        activity.activity_type === 'call' ? 'bg-amber-100' :
                        activity.activity_type === 'meeting' ? 'bg-green-100' :
                        'bg-navy-100'
                      }`}>
                        {activity.activity_type === 'stage_change' ? <ArrowRight className="w-3.5 h-3.5 text-teal-600" /> :
                         activity.activity_type === 'email' ? <Mail className="w-3.5 h-3.5 text-blue-600" /> :
                         activity.activity_type === 'call' ? <Phone className="w-3.5 h-3.5 text-amber-600" /> :
                         activity.activity_type === 'meeting' ? <Users className="w-3.5 h-3.5 text-green-600" /> :
                         <MessageSquare className="w-3.5 h-3.5 text-navy-600" />}
                      </div>
                      <div className="w-px flex-1 bg-navy-200 mt-1" />
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="text-sm text-navy-800">{activity.description}</p>
                      <p className="text-xs text-navy-400 mt-1">
                        {new Date(activity.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddPartnerModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [formData, setFormData] = useState({
    organization_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    partner_type: 'legal_aid',
    tier: 'pro',
    priority: 'medium',
    source: 'manual',
    notes: '',
    language_preference: 'en',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('partners').insert({
      ...formData,
      pipeline_stage: 'lead',
    });
    setSaving(false);
    onAdded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-navy-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">Add New Partner</h2>
          <button onClick={onClose} className="p-2 text-navy-600 hover:bg-navy-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1">Organization Name *</label>
            <input
              required
              value={formData.organization_name}
              onChange={e => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
              className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Contact Name *</label>
              <input
                required
                value={formData.contact_name}
                onChange={e => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Email *</label>
              <input
                required
                type="email"
                value={formData.contact_email}
                onChange={e => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Phone</label>
              <input
                value={formData.contact_phone}
                onChange={e => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Website</label>
              <input
                value={formData.website}
                onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://"
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Type</label>
              <select
                value={formData.partner_type}
                onChange={e => setFormData(prev => ({ ...prev, partner_type: e.target.value }))}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
              >
                {PARTNER_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
              >
                {PRIORITY_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-1">Language</label>
              <select
                value={formData.language_preference}
                onChange={e => setFormData(prev => ({ ...prev, language_preference: e.target.value }))}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 resize-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-navy-100 text-navy-700 rounded-lg font-semibold text-sm hover:bg-navy-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-500 transition-all disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddActivityModal({
  partnerId,
  userId,
  onClose,
  onAdded,
}: {
  partnerId: string;
  userId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [activityType, setActivityType] = useState('note');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('partner_pipeline_activities').insert({
      partner_id: partnerId,
      activity_type: activityType,
      description,
      performed_by: userId,
    });
    setSaving(false);
    onAdded();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="border-b border-navy-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">Add Activity</h2>
          <button onClick={onClose} className="p-2 text-navy-600 hover:bg-navy-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1">Activity Type</label>
            <select
              value={activityType}
              onChange={e => setActivityType(e.target.value)}
              className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900"
            >
              {ACTIVITY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1">Description *</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="What happened?"
              className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 resize-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-navy-100 text-navy-700 rounded-lg font-semibold text-sm hover:bg-navy-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-500 transition-all disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
