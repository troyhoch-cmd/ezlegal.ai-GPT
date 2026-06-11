import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  User,
  FileText,
  Briefcase,
  Users,
  Shield,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  Calendar
} from 'lucide-react';

interface AccessRequest {
  id: string;
  email: string;
  full_name: string | null;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  status: string;
  reason: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  expires_at: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  denied: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  expired: { bg: 'bg-slate-100', text: 'text-slate-500', icon: AlertCircle }
};

const resourceIcons: Record<string, typeof FileText> = {
  matter: Briefcase,
  document: FileText,
  workspace: Users,
  general: Shield
};

export default function AccessRequestQueue() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');

    let query = supabase
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError('Failed to load access requests');
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  };

  const handleAction = async (requestId: string, action: 'approved' | 'denied') => {
    if (!profile) return;

    setProcessing(true);

    const { error: updateError } = await supabase
      .from('access_requests')
      .update({
        status: action,
        admin_notes: adminNotes || null,
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      setError('Failed to update request');
      setProcessing(false);
      return;
    }

    setSelectedRequest(null);
    setAdminNotes('');
    setProcessing(false);
    fetchRequests();
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.resource_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  if (!profile?.is_admin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
        <p className="text-red-600">You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Access Requests</h2>
          <p className="text-sm text-slate-500">
            {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email, name, or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Search access requests"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            aria-label="Filter by status"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">No requests found</h3>
          <p className="text-sm text-slate-500">
            {filter === 'pending'
              ? 'No pending access requests at this time.'
              : 'No requests match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Requester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRequests.map((request) => {
                  const status = statusColors[request.status] || statusColors.pending;
                  const StatusIcon = status.icon;
                  const ResourceIcon = resourceIcons[request.resource_type] || Shield;

                  return (
                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {request.full_name || 'Unknown'}
                            </p>
                            <p className="text-sm text-slate-500">{request.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <ResourceIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {request.resource_name || request.resource_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {request.status === 'pending' ? (
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-sm text-slate-500 hover:text-slate-700"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
          processing={processing}
          onApprove={() => handleAction(selectedRequest.id, 'approved')}
          onDeny={() => handleAction(selectedRequest.id, 'denied')}
          onClose={() => {
            setSelectedRequest(null);
            setAdminNotes('');
          }}
        />
      )}
    </div>
  );
}

function RequestDetailModal({
  request,
  adminNotes,
  setAdminNotes,
  processing,
  onApprove,
  onDeny,
  onClose
}: {
  request: AccessRequest;
  adminNotes: string;
  setAdminNotes: (v: string) => void;
  processing: boolean;
  onApprove: () => void;
  onDeny: () => void;
  onClose: () => void;
}) {
  const status = statusColors[request.status] || statusColors.pending;
  const StatusIcon = status.icon;
  const isPending = request.status === 'pending';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-slate-800">
                Access Request
              </h2>
              <p className="text-sm text-slate-500">
                Submitted {new Date(request.created_at).toLocaleString()}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Requester
            </label>
            <p className="font-medium text-slate-800">{request.full_name || 'Not provided'}</p>
            <p className="text-sm text-slate-600">{request.email}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Resource
            </label>
            <p className="text-slate-800">
              {request.resource_name || request.resource_type}
            </p>
          </div>

          {request.reason && (
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Reason for Request
              </label>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-700">{request.reason}</p>
              </div>
            </div>
          )}

          {request.admin_notes && !isPending && (
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Admin Notes
              </label>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-700">{request.admin_notes}</p>
              </div>
            </div>
          )}

          {isPending && (
            <div>
              <label
                htmlFor="admin-notes"
                className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1"
              >
                Add Notes (Optional)
              </label>
              <textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Add notes about this decision..."
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          {isPending ? (
            <div className="flex gap-3">
              <button
                onClick={onDeny}
                disabled={processing}
                className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Deny
              </button>
              <button
                onClick={onApprove}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
