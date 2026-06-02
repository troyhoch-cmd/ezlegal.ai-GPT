import { useState } from 'react';
import {
  Shield, CheckCircle, AlertTriangle, XCircle, Download,
  ChevronDown, FileText, User, Lock, Eye, AlertCircle
} from 'lucide-react';
import { ProgressRing, StatCard } from '../charts';

const regulatoryRequirements = [
  { requirement: 'LSC Eligibility Verification', status: 'compliant', lastCheck: 'Jan 12, 2026', nextDue: 'Feb 12, 2026', category: 'Client Eligibility' },
  { requirement: 'Income Documentation', status: 'compliant', lastCheck: 'Jan 10, 2026', nextDue: 'Feb 10, 2026', category: 'Client Eligibility' },
  { requirement: 'Conflict of Interest Check', status: 'compliant', lastCheck: 'Jan 13, 2026', nextDue: 'Ongoing', category: 'Ethics' },
  { requirement: 'Case Closed Reporting', status: 'warning', lastCheck: 'Jan 5, 2026', nextDue: 'Jan 15, 2026', category: 'Reporting' },
  { requirement: 'Grant Expenditure Report', status: 'compliant', lastCheck: 'Dec 31, 2025', nextDue: 'Mar 31, 2026', category: 'Financial' },
  { requirement: 'Attorney Time Tracking', status: 'compliant', lastCheck: 'Jan 12, 2026', nextDue: 'Jan 31, 2026', category: 'Operations' },
  { requirement: 'Data Privacy Compliance', status: 'compliant', lastCheck: 'Jan 8, 2026', nextDue: 'Annual', category: 'Security' },
  { requirement: 'Board Meeting Minutes', status: 'warning', lastCheck: 'Nov 15, 2025', nextDue: 'Jan 20, 2026', category: 'Governance' }
];

const auditTrail = [
  { action: 'Client record accessed', user: 'Lisa Martinez', timestamp: 'Jan 13, 2026 2:45 PM', resource: 'Client #1234', severity: 'info' },
  { action: 'Case status updated', user: 'James Wilson', timestamp: 'Jan 13, 2026 1:30 PM', resource: 'Case #5678', severity: 'info' },
  { action: 'Document downloaded', user: 'Carlos Rivera', timestamp: 'Jan 13, 2026 11:15 AM', resource: 'Income Verification', severity: 'info' },
  { action: 'Bulk export requested', user: 'Admin User', timestamp: 'Jan 12, 2026 4:00 PM', resource: 'Monthly Report', severity: 'warning' },
  { action: 'Failed login attempt', user: 'Unknown', timestamp: 'Jan 12, 2026 3:22 PM', resource: 'System', severity: 'alert' },
  { action: 'Permission changed', user: 'Admin User', timestamp: 'Jan 11, 2026 10:00 AM', resource: 'User: E.Thompson', severity: 'warning' }
];

const trainingStatus = [
  { name: 'James Wilson', role: 'Attorney', ethics: true, privacy: true, lsc: true, lastTraining: 'Dec 2025' },
  { name: 'Lisa Martinez', role: 'Attorney', ethics: true, privacy: true, lsc: true, lastTraining: 'Dec 2025' },
  { name: 'Carlos Rivera', role: 'Attorney', ethics: true, privacy: false, lsc: true, lastTraining: 'Nov 2025' },
  { name: 'Emily Thompson', role: 'Paralegal', ethics: true, privacy: true, lsc: false, lastTraining: 'Jan 2026' },
  { name: 'Sarah Chen', role: 'Admin', ethics: true, privacy: true, lsc: true, lastTraining: 'Dec 2025' }
];

const riskAssessments = [
  { area: 'Data Security', level: 'low', score: 92, lastAssessment: 'Jan 2026' },
  { area: 'Regulatory Compliance', level: 'low', score: 88, lastAssessment: 'Jan 2026' },
  { area: 'Operational Risk', level: 'medium', score: 75, lastAssessment: 'Dec 2025' },
  { area: 'Financial Controls', level: 'low', score: 95, lastAssessment: 'Jan 2026' }
];

interface ComplianceDashboardProps {
  onExport?: () => void;
}

export default function ComplianceDashboard({ onExport }: ComplianceDashboardProps) {
  const [timePeriod, setTimePeriod] = useState('january-2026');
  const [viewMode, setViewMode] = useState<'overview' | 'audit' | 'training'>('overview');

  const compliantCount = regulatoryRequirements.filter(r => r.status === 'compliant').length;
  const warningCount = regulatoryRequirements.filter(r => r.status === 'warning').length;
  const nonCompliantCount = regulatoryRequirements.filter(r => r.status === 'non-compliant').length;
  const complianceRate = Math.round((compliantCount / regulatoryRequirements.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Compliance Monitoring</h2>
          <p className="text-sm text-stone-500">Track regulatory requirements, audit trails, and risk assessments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-100 rounded-lg p-1">
            {['overview', 'audit', 'training'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as typeof viewMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="appearance-none bg-white border border-stone-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-stone-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="january-2026">January 2026</option>
              <option value="q4-2025">Q4 2025</option>
              <option value="year-2025">Full Year 2025</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>
          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Compliance Rate"
          value={`${complianceRate}%`}
          icon={<Shield className="w-5 h-5" />}
          color="success"
          description={`${compliantCount} of ${regulatoryRequirements.length} requirements met`}
        />
        <StatCard
          title="Items Needing Attention"
          value={warningCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="warning"
          description="Approaching deadlines"
        />
        <StatCard
          title="Audit Events"
          value="156"
          icon={<Eye className="w-5 h-5" />}
          color="blue"
          description="This month"
        />
        <StatCard
          title="Training Completion"
          value="94%"
          icon={<User className="w-5 h-5" />}
          color="teal"
          description="Staff certifications current"
        />
      </div>

      {viewMode === 'overview' && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Compliance Status</h3>
              <div className="flex justify-center mb-4">
                <ProgressRing
                  value={complianceRate}
                  max={100}
                  size={140}
                  thickness={14}
                  color="stroke-success-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-success-50 rounded-lg">
                  <div className="text-xl font-bold text-success-700">{compliantCount}</div>
                  <div className="text-xs text-success-600">Compliant</div>
                </div>
                <div className="p-3 bg-warning-50 rounded-lg">
                  <div className="text-xl font-bold text-warning-700">{warningCount}</div>
                  <div className="text-xs text-warning-600">Warning</div>
                </div>
                <div className="p-3 bg-error-50 rounded-lg">
                  <div className="text-xl font-bold text-error-700">{nonCompliantCount}</div>
                  <div className="text-xs text-error-600">Non-Compliant</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">Risk Assessment Summary</h3>
                <span className="text-xs text-stone-500">Last updated: Jan 2026</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {riskAssessments.map((risk, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-stone-900">{risk.area}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        risk.level === 'low' ? 'bg-success-100 text-success-700' :
                        risk.level === 'medium' ? 'bg-warning-100 text-warning-700' :
                        'bg-error-100 text-error-700'
                      }`}>
                        {risk.level.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            risk.score >= 85 ? 'bg-success-500' :
                            risk.score >= 70 ? 'bg-warning-500' :
                            'bg-error-500'
                          }`}
                          style={{ width: `${risk.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-stone-700">{risk.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-stone-400" />
                <h3 className="font-bold text-stone-900">Regulatory Requirements Tracker</h3>
              </div>
              <div className="flex gap-2">
                {['All', 'Warning', 'Overdue'].map((filter) => (
                  <button
                    key={filter}
                    className="px-3 py-1 text-sm rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Requirement</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Category</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Status</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Last Check</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Next Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {regulatoryRequirements.map((req, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="px-5 py-4 font-medium text-stone-900">{req.requirement}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-stone-100 rounded text-xs font-medium text-stone-600">
                          {req.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                          req.status === 'compliant' ? 'bg-success-100 text-success-700' :
                          req.status === 'warning' ? 'bg-warning-100 text-warning-700' :
                          'bg-error-100 text-error-700'
                        }`}>
                          {req.status === 'compliant' && <CheckCircle className="w-3 h-3" />}
                          {req.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                          {req.status === 'non-compliant' && <XCircle className="w-3 h-3" />}
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-stone-600">{req.lastCheck}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-sm font-medium ${
                          req.status === 'warning' ? 'text-warning-600' : 'text-stone-600'
                        }`}>
                          {req.nextDue}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {viewMode === 'audit' && (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">Audit Trail Summary</h3>
                <p className="text-blue-100">Complete record of system activities</p>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">156</div>
                <div className="text-sm text-blue-100">Total Events</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">12</div>
                <div className="text-sm text-blue-100">Unique Users</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">3</div>
                <div className="text-sm text-blue-100">Alerts</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm text-blue-100">Critical Issues</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-stone-400" />
                <h3 className="font-bold text-stone-900">Recent Activity Log</h3>
              </div>
              <button className="text-teal-600 hover:text-teal-700 text-sm font-semibold">
                View Full Log
              </button>
            </div>
            <div className="divide-y divide-stone-100">
              {auditTrail.map((event, idx) => (
                <div key={idx} className="p-4 hover:bg-stone-50">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      event.severity === 'info' ? 'bg-blue-500' :
                      event.severity === 'warning' ? 'bg-warning-500' :
                      'bg-error-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-stone-900">{event.action}</span>
                        <span className="text-xs text-stone-500">{event.timestamp}</span>
                      </div>
                      <div className="text-sm text-stone-600 mt-1">
                        <span className="text-teal-600">{event.user}</span>
                        <span className="mx-2">-</span>
                        <span>{event.resource}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === 'training' && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Training Completion</h3>
              <div className="flex justify-center mb-4">
                <ProgressRing
                  value={94}
                  max={100}
                  size={140}
                  thickness={14}
                  color="stroke-teal-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <span className="text-stone-700">Ethics Training</span>
                  <span className="text-success-600 font-bold">100%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <span className="text-stone-700">Privacy & Security</span>
                  <span className="text-warning-600 font-bold">80%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <span className="text-stone-700">LSC Compliance</span>
                  <span className="text-warning-600 font-bold">80%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200">
              <div className="p-5 border-b border-stone-200">
                <h3 className="font-bold text-stone-900">Staff Certification Status</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Staff Member</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Role</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Ethics</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Privacy</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">LSC</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Last Training</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {trainingStatus.map((person, idx) => (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="px-5 py-4 font-medium text-stone-900">{person.name}</td>
                        <td className="px-5 py-4 text-stone-600">{person.role}</td>
                        <td className="px-5 py-4 text-center">
                          {person.ethics ? (
                            <CheckCircle className="w-5 h-5 text-success-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-error-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {person.privacy ? (
                            <CheckCircle className="w-5 h-5 text-success-500 mx-auto" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-warning-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {person.lsc ? (
                            <CheckCircle className="w-5 h-5 text-success-500 mx-auto" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-warning-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-stone-600">{person.lastTraining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-warning-50 border border-warning-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-warning-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-warning-900">Training Reminders</h3>
                <ul className="mt-2 space-y-2 text-sm text-warning-800">
                  <li>Carlos Rivera: Privacy & Security training due by Jan 31, 2026</li>
                  <li>Emily Thompson: LSC Compliance certification required by Feb 15, 2026</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
