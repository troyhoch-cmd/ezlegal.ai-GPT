import { useState, useEffect } from 'react';
import {
  Shield, Clock, User, Filter, Search, Download,
  ChevronLeft, ChevronRight, Eye, Activity, AlertTriangle,
  CheckCircle, XCircle, Edit, Trash2, Plus, UserCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuditLog {
  id: string;
  user_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_email?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <Plus className="w-4 h-4 text-success-600" />,
  read: <Eye className="w-4 h-4 text-blue-600" />,
  update: <Edit className="w-4 h-4 text-amber-600" />,
  delete: <Trash2 className="w-4 h-4 text-red-600" />,
  login: <UserCheck className="w-4 h-4 text-success-600" />,
  logout: <XCircle className="w-4 h-4 text-stone-500" />,
  export: <Download className="w-4 h-4 text-primary-600" />,
  assign: <User className="w-4 h-4 text-accent-600" />,
  approve: <CheckCircle className="w-4 h-4 text-success-600" />,
  reject: <XCircle className="w-4 h-4 text-red-600" />,
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-success-50 text-success-700 border-success-200',
  read: 'bg-blue-50 text-blue-700 border-blue-200',
  update: 'bg-amber-50 text-amber-700 border-amber-200',
  delete: 'bg-red-50 text-red-700 border-red-200',
  login: 'bg-success-50 text-success-700 border-success-200',
  logout: 'bg-stone-50 text-stone-700 border-stone-200',
  export: 'bg-primary-50 text-primary-700 border-primary-200',
  assign: 'bg-accent-50 text-accent-700 border-accent-200',
  approve: 'bg-success-50 text-success-700 border-success-200',
  reject: 'bg-red-50 text-red-700 border-red-200',
};

const MOCK_LOGS: AuditLog[] = [
  { id: '1', user_id: 'u1', action_type: 'assign', entity_type: 'case', entity_id: 'c123', details: { attorney: 'James Wilson', client: 'Maria Garcia' }, ip_address: '192.168.1.1', user_agent: 'Chrome/120', created_at: new Date(Date.now() - 300000).toISOString(), user_email: 'admin@legalaid.org' },
  { id: '2', user_id: 'u2', action_type: 'approve', entity_type: 'pro_bono_application', entity_id: 'pb456', details: { applicant: 'Robert Chen', eligibility_score: 92 }, ip_address: '192.168.1.2', user_agent: 'Firefox/121', created_at: new Date(Date.now() - 900000).toISOString(), user_email: 'coordinator@legalaid.org' },
  { id: '3', user_id: 'u1', action_type: 'export', entity_type: 'report', entity_id: 'r789', details: { report_type: 'monthly_impact', format: 'PDF' }, ip_address: '192.168.1.1', user_agent: 'Chrome/120', created_at: new Date(Date.now() - 3600000).toISOString(), user_email: 'admin@legalaid.org' },
  { id: '4', user_id: 'u3', action_type: 'update', entity_type: 'case', entity_id: 'c124', details: { field: 'status', old_value: 'pending', new_value: 'active' }, ip_address: '192.168.1.3', user_agent: 'Safari/17', created_at: new Date(Date.now() - 7200000).toISOString(), user_email: 'attorney@legalaid.org' },
  { id: '5', user_id: 'u2', action_type: 'create', entity_type: 'client', entity_id: 'cl567', details: { name: 'Sarah Johnson', matter: 'Housing Dispute' }, ip_address: '192.168.1.2', user_agent: 'Firefox/121', created_at: new Date(Date.now() - 10800000).toISOString(), user_email: 'coordinator@legalaid.org' },
  { id: '6', user_id: 'u1', action_type: 'login', entity_type: 'session', entity_id: null, details: { method: 'password' }, ip_address: '192.168.1.1', user_agent: 'Chrome/120', created_at: new Date(Date.now() - 14400000).toISOString(), user_email: 'admin@legalaid.org' },
  { id: '7', user_id: 'u4', action_type: 'reject', entity_type: 'pro_bono_application', entity_id: 'pb457', details: { applicant: 'John Doe', reason: 'Income exceeds threshold' }, ip_address: '192.168.1.4', user_agent: 'Edge/120', created_at: new Date(Date.now() - 18000000).toISOString(), user_email: 'reviewer@legalaid.org' },
  { id: '8', user_id: 'u3', action_type: 'read', entity_type: 'case', entity_id: 'c125', details: { case_name: 'Brown v. Landlord Corp' }, ip_address: '192.168.1.3', user_agent: 'Safari/17', created_at: new Date(Date.now() - 21600000).toISOString(), user_email: 'attorney@legalaid.org' },
];

export default function AuditLogsDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const logsPerPage = 10;

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lso_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        setLogs(data);
      } else {
        setLogs(MOCK_LOGS);
      }
    } catch {
      setLogs(MOCK_LOGS);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action_type === filterAction;
    const matchesEntity = filterEntity === 'all' || log.entity_type === filterEntity;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const uniqueActions = [...new Set(logs.map(l => l.action_type))];
  const uniqueEntities = [...new Set(logs.map(l => l.entity_type))];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Details', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
        log.user_email || 'System',
        log.action_type,
        log.entity_type,
        log.entity_id || '-',
        JSON.stringify(log.details).replace(/,/g, ';'),
        log.ip_address || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Audit Logs</h2>
            <p className="text-stone-600 text-sm">Track all system activity and user actions</p>
          </div>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-500" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Entities</option>
              {uniqueEntities.map(entity => (
                <option key={entity} value={entity}>{entity.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-stone-600 text-sm mb-1">
            <Activity className="w-4 h-4" />
            <span>Total Events</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">{logs.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-stone-600 text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>Last 24h</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 86400000)).length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-stone-600 text-sm mb-1">
            <User className="w-4 h-4" />
            <span>Unique Users</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {new Set(logs.map(l => l.user_id)).size}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Sensitive Actions</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {logs.filter(l => ['delete', 'reject', 'export'].includes(l.action_type)).length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide">Details</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wide">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading audit logs...
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-stone-400" />
                        <span className="text-sm text-stone-700">{formatTimestamp(log.created_at)}</span>
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-stone-600" />
                        </div>
                        <span className="text-sm text-stone-700">{log.user_email || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ACTION_COLORS[log.action_type] || 'bg-stone-50 text-stone-700 border-stone-200'}`}>
                        {ACTION_ICONS[log.action_type] || <Activity className="w-4 h-4" />}
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-stone-700">{log.entity_type.replace('_', ' ')}</span>
                      {log.entity_id && (
                        <span className="text-xs text-stone-400 ml-1">#{log.entity_id.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-stone-600 truncate max-w-[200px] block">
                        {Object.entries(log.details).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-stone-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200">
            <div className="text-sm text-stone-600">
              Showing {(currentPage - 1) * logsPerPage + 1} - {Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-stone-600 hover:bg-stone-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-stone-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-stone-600 hover:bg-stone-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">Audit Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 text-stone-400 hover:text-stone-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Timestamp</label>
                <p className="text-stone-900">{new Date(selectedLog.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">User</label>
                <p className="text-stone-900">{selectedLog.user_email || 'System'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Action</label>
                <p className="text-stone-900 capitalize">{selectedLog.action_type}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Entity</label>
                <p className="text-stone-900">{selectedLog.entity_type} {selectedLog.entity_id && `(${selectedLog.entity_id})`}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Details</label>
                <pre className="mt-1 p-3 bg-stone-50 rounded-lg text-sm text-stone-700 overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
              {selectedLog.ip_address && (
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">IP Address</label>
                  <p className="text-stone-900">{selectedLog.ip_address}</p>
                </div>
              )}
              {selectedLog.user_agent && (
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">User Agent</label>
                  <p className="text-stone-900 text-sm">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
