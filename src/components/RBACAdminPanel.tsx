import { useState, useEffect } from 'react';
import {
  Users, Shield, UserPlus, Search, Check, X, AlertCircle,
  ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
}

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  roles: Role[];
}

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  entity_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  resolved_at: string | null;
  requested_by: {
    email: string;
    full_name: string;
  };
  decisions: Array<{
    id: string;
    decision: string;
    comments: string;
    decided_at: string;
    decided_by: {
      email: string;
    };
  }>;
}

export default function RBACAdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'approvals'>('users');
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [decisionComment, setDecisionComment] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadRoles(), loadUsers(), loadApprovalRequests()]);
    setLoading(false);
  };

  const loadRoles = async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (!error && data) {
      setRoles(data);
    }
  };

  const loadUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .order('full_name');

    if (error || !profiles) return;

    const { data: userRolesData } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role:roles(id, name, description, permissions)
      `);

    const { data: authUsers } = await supabase.auth.admin.listUsers().catch(() => ({ data: null }));

    const usersWithRoles: UserWithRoles[] = profiles.map(profile => {
      const userRoles = userRolesData
        ?.filter(ur => ur.user_id === profile.id)
        .map(ur => ur.role as unknown as Role)
        .filter(Boolean) || [];

      const authUser = authUsers?.users?.find(u => u.id === profile.id);

      return {
        id: profile.id,
        email: authUser?.email || 'Unknown',
        full_name: profile.full_name || 'Unknown User',
        roles: userRoles,
      };
    });

    setUsers(usersWithRoles);
  };

  const loadApprovalRequests = async () => {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(`
        *,
        requested_by_profile:profiles!approval_requests_requested_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const requestsWithDetails = await Promise.all(
        data.map(async (request) => {
          const { data: decisions } = await supabase
            .from('approval_decisions')
            .select(`
              *,
              decided_by_profile:profiles!approval_decisions_decided_by_fkey(full_name)
            `)
            .eq('request_id', request.id);

          return {
            ...request,
            requested_by: {
              email: '',
              full_name: request.requested_by_profile?.full_name || 'Unknown',
            },
            decisions: decisions?.map(d => ({
              ...d,
              decided_by: {
                email: d.decided_by_profile?.full_name || 'Unknown',
              },
            })) || [],
          };
        })
      );

      setApprovalRequests(requestsWithDetails as ApprovalRequest[]);
    }
  };

  const assignRole = async (userId: string, roleId: string) => {
    setProcessingAction(`assign-${roleId}`);

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: user?.id,
      });

    if (!error) {
      await loadUsers();
    }

    setProcessingAction(null);
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const removeRole = async (userId: string, roleId: string) => {
    setProcessingAction(`remove-${roleId}`);

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (!error) {
      await loadUsers();
    }

    setProcessingAction(null);
  };

  const handleApprovalDecision = async (requestId: string, decision: 'approve' | 'reject') => {
    setProcessingAction(`decision-${requestId}`);

    const { error: decisionError } = await supabase
      .from('approval_decisions')
      .insert({
        request_id: requestId,
        decided_by: user?.id,
        decision,
        comments: decisionComment,
      });

    if (!decisionError) {
      const newStatus = decision === 'approve' ? 'approved' : 'rejected';

      await supabase
        .from('approval_requests')
        .update({
          status: newStatus,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      await loadApprovalRequests();
    }

    setProcessingAction(null);
    setDecisionComment('');
    setExpandedRequest(null);
  };

  const filteredUsers = users.filter(
    u =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = approvalRequests.filter(r => r.status === 'pending');
  const resolvedRequests = approvalRequests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200">
        <nav className="flex" aria-label="Admin tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'roles'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" aria-hidden="true" />
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'approvals'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            Approval Queue
            {pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">User Role Management</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Assigned Roles</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{u.full_name}</p>
                          <p className="text-sm text-slate-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          {u.roles.length === 0 ? (
                            <span className="text-sm text-slate-400 italic">No roles assigned</span>
                          ) : (
                            u.roles.map((role) => (
                              <span
                                key={role.id}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
                              >
                                {role.name}
                                <button
                                  onClick={() => removeRole(u.id, role.id)}
                                  disabled={processingAction === `remove-${role.id}`}
                                  className="hover:text-red-600 transition-colors"
                                  aria-label={`Remove ${role.name} role`}
                                >
                                  {processingAction === `remove-${role.id}` ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowRoleModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" aria-hidden="true" />
                          Assign Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">System Roles</h3>
            <div className="grid gap-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 capitalize">{role.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                    </div>
                    <Shield className="w-5 h-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Permissions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((perm, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-md"
                        >
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Approval Queue</h3>

            {pendingRequests.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-amber-600 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  Pending Approval ({pendingRequests.length})
                </h4>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden"
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                              <h5 className="font-semibold text-slate-900">{request.title}</h5>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{request.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>Requested by: {request.requested_by.full_name}</span>
                              <span>Type: {request.entity_type}</span>
                              <span>
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {expandedRequest === request.id ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" aria-hidden="true" />
                          )}
                        </div>
                      </div>

                      {expandedRequest === request.id && (
                        <div className="px-4 pb-4 border-t border-amber-200 pt-4">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Decision Comments (Optional)
                            </label>
                            <textarea
                              value={decisionComment}
                              onChange={(e) => setDecisionComment(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Add a comment for your decision..."
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprovalDecision(request.id, 'approve')}
                              disabled={processingAction === `decision-${request.id}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              {processingAction === `decision-${request.id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprovalDecision(request.id, 'reject')}
                              disabled={processingAction === `decision-${request.id}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              {processingAction === `decision-${request.id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resolvedRequests.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-4">
                  Recently Resolved
                </h4>
                <div className="space-y-3">
                  {resolvedRequests.slice(0, 10).map((request) => (
                    <div
                      key={request.id}
                      className={`p-4 border rounded-xl ${
                        request.status === 'approved'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {request.status === 'approved' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{request.title}</p>
                            <p className="text-sm text-slate-600">
                              {request.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                              {request.resolved_at
                                ? new Date(request.resolved_at).toLocaleDateString()
                                : 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {approvalRequests.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
                <p className="text-slate-500">No approval requests</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showRoleModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-role-title"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
              <h3 id="assign-role-title" className="text-lg font-bold text-white">
                Assign Role to {selectedUser.full_name}
              </h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Select a role to assign to this user:
              </p>
              <div className="space-y-2">
                {roles
                  .filter((role) => !selectedUser.roles.some((r) => r.id === role.id))
                  .map((role) => (
                    <button
                      key={role.id}
                      onClick={() => assignRole(selectedUser.id, role.id)}
                      disabled={processingAction === `assign-${role.id}`}
                      className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all disabled:opacity-50"
                    >
                      <div className="text-left">
                        <p className="font-semibold text-slate-900 capitalize">{role.name}</p>
                        <p className="text-sm text-slate-600">{role.description}</p>
                      </div>
                      {processingAction === `assign-${role.id}` ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                      ) : (
                        <UserPlus className="w-5 h-5 text-primary-600" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                {roles.filter((role) => !selectedUser.roles.some((r) => r.id === role.id))
                  .length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    User already has all available roles
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
