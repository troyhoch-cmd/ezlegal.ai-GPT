import { useState } from 'react';
import {
  FileText, Download, Calendar, Clock, Mail, Sparkles,
  ChevronDown, Check, Settings, RefreshCw, Send, Plus, Trash2
} from 'lucide-react';

const reportTemplates = [
  { id: 'monthly-impact', name: 'Monthly Impact Report', description: 'Comprehensive summary of cases, hours, and outcomes', category: 'Impact', aiPowered: true },
  { id: 'pro-bono-hours', name: 'Pro Bono Hours Summary', description: 'Attorney volunteer hours and billable equivalency', category: 'Operations', aiPowered: false },
  { id: 'grant-report', name: 'Grant Progress Report', description: 'Funder-ready report with KPIs and narratives', category: 'Funding', aiPowered: true },
  { id: 'demographics', name: 'Demographics Analysis', description: 'Client population breakdown and diversity metrics', category: 'Analytics', aiPowered: false },
  { id: 'outcomes', name: 'Outcomes Summary', description: 'Case resolution rates and client satisfaction', category: 'Impact', aiPowered: true },
  { id: 'compliance', name: 'Compliance Report', description: 'Regulatory requirements and audit trail', category: 'Compliance', aiPowered: false }
];

const scheduledReports = [
  { name: 'Monthly Impact Report', frequency: 'Monthly', nextRun: 'Feb 1, 2026', recipients: 3, status: 'active' },
  { name: 'Pro Bono Hours Summary', frequency: 'Weekly', nextRun: 'Jan 20, 2026', recipients: 2, status: 'active' },
  { name: 'Grant Progress Report', frequency: 'Quarterly', nextRun: 'Apr 1, 2026', recipients: 5, status: 'active' }
];

const recentReports = [
  { name: 'January 2026 Impact Report', generated: 'Jan 13, 2026 9:00 AM', format: 'PDF', size: '2.4 MB', aiGenerated: true },
  { name: 'Q4 2025 Grant Summary', generated: 'Jan 2, 2026 10:30 AM', format: 'PDF', size: '4.1 MB', aiGenerated: true },
  { name: 'December Pro Bono Hours', generated: 'Dec 31, 2025 11:45 AM', format: 'Excel', size: '1.2 MB', aiGenerated: false },
  { name: 'Annual Report 2025', generated: 'Dec 28, 2025 2:00 PM', format: 'PowerPoint', size: '8.7 MB', aiGenerated: true }
];

interface ReportGeneratorDashboardProps {
  onExport?: () => void;
}

export default function ReportGeneratorDashboard({ onExport: _onExport }: ReportGeneratorDashboardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-01-31' });
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeNarratives, setIncludeNarratives] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'generate' | 'scheduled' | 'history'>('generate');

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">AI Report Generator</h2>
          <p className="text-sm text-stone-500">Create customized reports with AI-powered narratives and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-100 rounded-lg p-1">
            {['generate', 'scheduled', 'history'].map((mode) => (
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
        </div>
      </div>

      {viewMode === 'generate' && (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">AI-Powered Report Generation</h3>
                <p className="text-blue-100">Generate professional, funder-ready reports with intelligent narratives</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">6</div>
                <div className="text-sm text-blue-100">Report Templates</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-blue-100">Export Formats</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">Auto</div>
                <div className="text-sm text-blue-100">Scheduling Available</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Select Report Template</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {reportTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">{template.name}</span>
                          {template.aiPowered && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-500 mt-1">{template.description}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="w-5 h-5 text-teal-600" />
                      )}
                    </div>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded">
                      {template.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Report Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Export Format</label>
                  <div className="relative">
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full appearance-none bg-white border border-stone-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="excel">Excel Spreadsheet</option>
                      <option value="powerpoint">PowerPoint Presentation</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
                    />
                    <span className="text-sm text-stone-700">Include charts & visualizations</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNarratives}
                      onChange={(e) => setIncludeNarratives(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
                    />
                    <span className="text-sm text-stone-700">AI-generated narratives</span>
                  </label>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!selectedTemplate || isGenerating}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'scheduled' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-stone-900">Scheduled Reports</h3>
            <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" />
              New Schedule
            </button>
          </div>

          <div className="bg-white rounded-xl border border-stone-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Report</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Frequency</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Next Run</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Recipients</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Status</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {scheduledReports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-stone-400" />
                          <span className="font-medium text-stone-900">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2 py-1 bg-stone-100 rounded text-xs font-medium text-stone-600">
                          {report.frequency}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-stone-600">
                          <Calendar className="w-4 h-4" />
                          {report.nextRun}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-stone-600">
                          <Mail className="w-4 h-4" />
                          {report.recipients}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          report.status === 'active' ? 'bg-success-100 text-success-700' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-700">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-teal-600">
                            <Send className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-error-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900">Automated Report Delivery</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Scheduled reports are automatically generated and emailed to recipients. Reports can be customized with AI-generated executive summaries and insights.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'history' && (
        <>
          <div className="bg-white rounded-xl border border-stone-200">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-bold text-stone-900">Recent Reports</h3>
              <span className="text-sm text-stone-500">Last 30 days</span>
            </div>
            <div className="divide-y divide-stone-100">
              {recentReports.map((report, idx) => (
                <div key={idx} className="p-5 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        report.format === 'PDF' ? 'bg-error-100 text-error-600' :
                        report.format === 'Excel' ? 'bg-success-100 text-success-600' :
                        'bg-warning-100 text-warning-600'
                      }`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">{report.name}</span>
                          {report.aiGenerated && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-stone-500 mt-1">
                          Generated: {report.generated}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-medium text-stone-700">{report.format}</span>
                        <div className="text-xs text-stone-500">{report.size}</div>
                      </div>
                      <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-stone-200 p-5 text-center">
              <div className="text-3xl font-bold text-stone-900">24</div>
              <div className="text-sm text-stone-500">Reports Generated (30 days)</div>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-5 text-center">
              <div className="text-3xl font-bold text-blue-600">18</div>
              <div className="text-sm text-stone-500">AI-Enhanced Reports</div>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-5 text-center">
              <div className="text-3xl font-bold text-success-600">156 MB</div>
              <div className="text-sm text-stone-500">Total Storage Used</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
