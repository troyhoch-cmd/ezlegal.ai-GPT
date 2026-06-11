import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle, XCircle, AlertTriangle, BarChart3, Settings, ArrowRight, RefreshCw, MessageSquare, Flag } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { getPartnerProfile, getPartnerReferrals, updateReferralStatus } from '../lib/intake/persistence';
import { requirePartnerAccess, requireReferralOwnership } from '../lib/intake/security';

type ReferralRecord = {
  id: string;
  jurisdiction: string | null;
  language: string | null;
  issue_area: string | null;
  affordability_status: string | null;
  risk_level: string | null;
  referral_status: string;
  created_at: string;
};

type PartnerProfile = {
  id: string;
  org_type: string;
  jurisdictions_served: string[];
  issue_areas: string[];
  languages_supported: string[];
  intake_volume: string;
  accepts_warm_referrals: boolean;
  requires_conflict_check: boolean;
  status: string;
};

type StatusFilter = 'all' | 'new' | 'accepted' | 'declined' | 'conflict' | 'completed';

const STATUS_LABELS: Record<string, string> = {
  new: 'New — awaiting your review',
  accepted: 'Accepted — client referral in progress',
  declined: 'Declined — referral not accepted',
  conflict: 'Conflict flagged — possible conflict of interest',
  completed: 'Completed — referral fulfilled',
  info_requested: 'Info Requested — waiting for additional details',
};

export default function PartnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'settings'>('overview');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedReferral, setExpandedReferral] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  async function loadData() {
    setLoading(true);
    setError(null);
    const access = await requirePartnerAccess();
    if (!access.ok) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const p = await getPartnerProfile();
    if (!p) {
      setError('Could not load partner profile. Please try again.');
      setLoading(false);
      return;
    }
    setProfile(p);
    const r = await getPartnerReferrals(p.id);
    setReferrals(r);
    setLoading(false);
  }

  async function handleStatusChange(referralId: string, newStatus: string) {
    const ownershipCheck = await requireReferralOwnership(referralId);
    if (!ownershipCheck.ok) {
      console.error('[PartnerDashboard] Security check failed:', ownershipCheck.reason);
      return;
    }
    const success = await updateReferralStatus(referralId, newStatus);
    if (success) {
      setReferrals((prev) =>
        prev.map((r) => (r.id === referralId ? { ...r, referral_status: newStatus } : r))
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
          <p className="text-slate-500 mt-3">Loading partner dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button onClick={loadData} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            Try again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No Partner Profile Found</h2>
          <p className="text-slate-600 mb-6">
            Complete the organization partner intake to set up your dashboard.
          </p>
          <button
            onClick={() => navigate('/for-organizations')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = {
    total: referrals.length,
    new: referrals.filter((r) => r.referral_status === 'new').length,
    accepted: referrals.filter((r) => r.referral_status === 'accepted').length,
    declined: referrals.filter((r) => r.referral_status === 'declined').length,
    conflict: referrals.filter((r) => r.referral_status === 'conflict').length,
    completed: referrals.filter((r) => r.referral_status === 'completed').length,
  };

  const filteredReferrals = statusFilter === 'all'
    ? referrals
    : referrals.filter((r) => r.referral_status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Partner Dashboard</h1>
            <p className="text-slate-600 text-sm mt-1">
              {profile.org_type} — {profile.jurisdictions_served.join(', ')}
            </p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {[
            { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { id: 'referrals' as const, label: 'Referrals', icon: Users },
            { id: 'settings' as const, label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
              {tab.id === 'referrals' && stats.new > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded-full">{stats.new}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <StatCard label="Total" value={stats.total} icon={Users} color="slate" />
              <StatCard label="New" value={stats.new} icon={Clock} color="blue" />
              <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle} color="green" />
              <StatCard label="Conflict" value={stats.conflict} icon={Flag} color="amber" />
              <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="teal" />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Profile Summary</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500">Issue Areas</dt>
                  <dd className="text-slate-800 mt-0.5">{profile.issue_areas.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Languages</dt>
                  <dd className="text-slate-800 mt-0.5">{profile.languages_supported.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Intake Volume</dt>
                  <dd className="text-slate-800 mt-0.5">{profile.intake_volume}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Warm Referrals</dt>
                  <dd className="text-slate-800 mt-0.5">{profile.accepts_warm_referrals ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-4">
            {/* Status filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(['all', 'new', 'accepted', 'conflict', 'declined', 'completed'] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    statusFilter === f
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== 'all' && ` (${stats[f as keyof typeof stats] ?? 0})`}
                </button>
              ))}
            </div>

            {filteredReferrals.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">
                  {statusFilter === 'all'
                    ? 'No referrals yet. They will appear here as clients are matched to your organization.'
                    : `No ${statusFilter} referrals.`}
                </p>
              </div>
            ) : (
              filteredReferrals.map((referral) => (
                <ReferralCard
                  key={referral.id}
                  referral={referral}
                  onStatusChange={handleStatusChange}
                  requiresConflictCheck={profile.requires_conflict_check}
                  expanded={expandedReferral === referral.id}
                  onToggleExpand={() => setExpandedReferral(expandedReferral === referral.id ? null : referral.id)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Partner Settings</h3>
            <p className="text-slate-600 text-sm mb-4">
              To update your organization profile, please contact support or re-submit the partner intake form.
            </p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Organization Type</dt>
                <dd className="text-slate-800 font-medium">{profile.org_type}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Conflict Check Required</dt>
                <dd className="text-slate-800 font-medium">{profile.requires_conflict_check ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Profile Status</dt>
                <dd className="text-slate-800 font-medium capitalize">{profile.status}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Jurisdictions</dt>
                <dd className="text-slate-800 font-medium">{profile.jurisdictions_served.join(', ')}</dd>
              </div>
            </dl>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Users; color: string }) {
  const colorMap: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    teal: 'bg-teal-100 text-teal-700',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className={`w-8 h-8 rounded-lg ${colorMap[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function ReferralCard({
  referral,
  onStatusChange,
  requiresConflictCheck,
  expanded,
  onToggleExpand,
}: {
  referral: ReferralRecord;
  onStatusChange: (id: string, status: string) => void;
  requiresConflictCheck: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    completed: 'bg-slate-100 text-slate-700',
    conflict: 'bg-amber-100 text-amber-700',
    info_requested: 'bg-sky-100 text-sky-700',
  };

  const canAct = ['new', 'info_requested'].includes(referral.referral_status);
  const canComplete = referral.referral_status === 'accepted';

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[referral.referral_status] ?? 'bg-slate-100 text-slate-600'}`}>
                {referral.referral_status}
              </span>
              {referral.risk_level === 'emergency' && (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="w-3 h-3" /> Urgent
                </span>
              )}
              <button onClick={onToggleExpand} className="text-xs text-teal-600 hover:text-teal-800 ml-auto">
                {expanded ? 'Less' : 'Details'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {referral.jurisdiction && (
                <div><span className="text-slate-400">Jurisdiction:</span> <span className="text-slate-700">{referral.jurisdiction}</span></div>
              )}
              {referral.issue_area && (
                <div><span className="text-slate-400">Issue:</span> <span className="text-slate-700">{referral.issue_area}</span></div>
              )}
              {referral.language && (
                <div><span className="text-slate-400">Language:</span> <span className="text-slate-700">{referral.language}</span></div>
              )}
              {referral.affordability_status && (
                <div><span className="text-slate-400">Affordability:</span> <span className="text-slate-700">{referral.affordability_status}</span></div>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-2">
              {new Date(referral.created_at).toLocaleDateString()}
            </p>
          </div>

          {canAct && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {requiresConflictCheck && (
                <button
                  onClick={() => onStatusChange(referral.id, 'conflict')}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200 rounded hover:bg-amber-50 transition-colors"
                  title="Flag a possible conflict of interest"
                >
                  Conflict
                </button>
              )}
              <button
                onClick={() => onStatusChange(referral.id, 'accepted')}
                className="px-3 py-1.5 text-xs font-medium text-green-700 border border-green-200 rounded hover:bg-green-50 transition-colors"
                title="Accept this referral and begin intake"
              >
                Accept
              </button>
              <button
                onClick={() => onStatusChange(referral.id, 'declined')}
                className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded hover:bg-red-50 transition-colors"
                title="Decline this referral"
              >
                Decline
              </button>
              <button
                onClick={() => onStatusChange(referral.id, 'info_requested')}
                className="px-3 py-1.5 text-xs font-medium text-sky-700 border border-sky-200 rounded hover:bg-sky-50 transition-colors"
                title="Request more information before deciding"
              >
                <MessageSquare className="w-3 h-3 inline mr-1" />
                Info
              </button>
            </div>
          )}

          {canComplete && (
            <button
              onClick={() => onStatusChange(referral.id, 'completed')}
              className="px-3 py-1.5 text-xs font-medium text-teal-700 border border-teal-200 rounded hover:bg-teal-50 transition-colors shrink-0"
              title="Mark referral as completed"
            >
              <CheckCircle className="w-3 h-3 inline mr-1" />
              Complete
            </button>
          )}
        </div>
      </div>

      {/* Expanded detail view */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 text-xs space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-400 block">Status</span>
              <span className="text-slate-700">{STATUS_LABELS[referral.referral_status] ?? referral.referral_status}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Risk Level</span>
              <span className="text-slate-700">{referral.risk_level ?? 'Normal'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Referral Source</span>
              <span className="text-slate-700">ezLegal intake flow</span>
            </div>
            <div>
              <span className="text-slate-400 block">Created</span>
              <span className="text-slate-700">{new Date(referral.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Consent</span>
              <span className="text-slate-700">Client consented to referral sharing</span>
            </div>
            <div>
              <span className="text-slate-400 block">Assignment</span>
              <span className="text-slate-700">Matched to your organization</span>
            </div>
          </div>
          <p className="text-slate-400 pt-1 border-t border-slate-200">
            Actions on this referral are logged for audit purposes. Your organization can only view referrals assigned to you.
          </p>
        </div>
      )}
    </div>
  );
}
