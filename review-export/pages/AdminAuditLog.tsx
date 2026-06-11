import { useState, useEffect } from 'react';
import { Shield, Search, Filter, Download, Calendar, User, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  resource_name?: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  created_at: string;
  admin_email?: string;
  admin_name?: string;
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, [selectedAction, selectedResourceType, dateRange]);

  const loadLogs = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedAction !== 'all') {
        query = query.eq('action', selectedAction);
      }

      if (selectedResourceType !== 'all') {
        query = query.eq('entity_type', selectedResourceType);
      }

      if (dateRange !== 'all') {
        const daysAgo = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const logsWithAdminInfo = await Promise.all(
        (data || []).map(async (log) => {
          if (log.admin_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', log.admin_id)
              .single();

            return {
              ...log,
              admin_email: profile?.email,
              admin_name: profile?.full_name
            };
          }
          return log;
        })
      );

      setLogs(logsWithAdminInfo);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Admin', 'Action', 'Resource Type', 'Resource ID', 'Resource Name'];
    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.admin_email || log.admin_id,
      log.action,
      log.entity_type,
      log.entity_id || '',
      log.resource_name || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredLogs = logs.filter(log =>
    searchTerm === '' ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const actionColors = {
    create: 'bg-green-100 text-green-700 border-green-200',
    update: 'bg-blue-100 text-blue-700 border-blue-200',
    delete: 'bg-red-100 text-red-700 border-red-200',
    view: 'bg-gray-100 text-gray-700 border-gray-200',
    export: 'bg-purple-100 text-purple-700 border-purple-200',
    login: 'bg-teal-100 text-teal-700 border-teal-200',
    logout: 'bg-amber-100 text-amber-700 border-amber-200'
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-navy-900">Audit Log</h1>
        </div>
        <p className="text-navy-600">Track all admin actions for compliance and accountability</p>
      </div>

      <div className="bg-white rounded-xl border border-navy-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
            <option value="export">Export</option>
          </select>

          <select
            value={selectedResourceType}
            onChange={(e) => setSelectedResourceType(e.target.value)}
            className="px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Resources</option>
            <option value="user">Users</option>
            <option value="document">Documents</option>
            <option value="conversation">Conversations</option>
            <option value="widget">Widgets</option>
            <option value="role">Roles</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-200 p-12 text-center">
          <Shield className="w-16 h-16 text-navy-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-navy-900 mb-2">No audit logs found</h2>
          <p className="text-navy-600">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50 border-b border-navy-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Timestamp</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Admin</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Action</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Resource</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-700 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-navy-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <td className="px-6 py-4 text-sm text-navy-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-navy-400" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-navy-400" />
                        <div>
                          <div className="font-medium text-navy-900">{log.admin_name || 'Unknown'}</div>
                          <div className="text-xs text-navy-500">{log.admin_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${actionColors[log.action as keyof typeof actionColors] || actionColors.view}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-navy-400" />
                        <div>
                          <div className="font-medium text-navy-900">{log.entity_type}</div>
                          {log.resource_name && (
                            <div className="text-xs text-navy-500">{log.resource_name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-navy-600">
                      {expandedLog === log.id ? (
                        <div className="space-y-2">
                          {log.entity_id && (
                            <div className="text-xs">
                              <span className="font-medium">ID:</span> {log.entity_id}
                            </div>
                          )}
                          {log.new_values && Object.keys(log.new_values).length > 0 && (
                            <div className="text-xs">
                              <span className="font-medium">Changes:</span>
                              <pre className="mt-1 p-2 bg-navy-50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.new_values, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-teal-600 hover:underline">Click to expand</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Audit Log Security</p>
            <p className="text-blue-700">
              All admin actions are automatically logged and cannot be deleted. Logs are retained for compliance and can be exported for reporting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
