import { useState } from 'react';
import {
  Brain, Clock, Target, Download, ChevronDown,
  FileText, CheckCircle, DollarSign, Sparkles, Activity
} from 'lucide-react';
import { BarChart, LineChart, ProgressRing, StatCard } from '../charts';

const aiUsageTrend = [
  { label: 'Aug', value: 245 },
  { label: 'Sep', value: 312 },
  { label: 'Oct', value: 389 },
  { label: 'Nov', value: 456 },
  { label: 'Dec', value: 534 },
  { label: 'Jan', value: 612 }
];

const featureUsage = [
  { label: 'Case Matching', value: 412 },
  { label: 'Eligibility Check', value: 389 },
  { label: 'Doc Generation', value: 234 },
  { label: 'Outcome Prediction', value: 178 },
  { label: 'AI Chat', value: 156 }
];

const processingMetrics = [
  { document: 'Intake Forms', avgTime: '12 sec', accuracy: 98.5, volume: 412 },
  { document: 'Court Documents', avgTime: '28 sec', accuracy: 97.2, volume: 156 },
  { document: 'Financial Records', avgTime: '18 sec', accuracy: 99.1, volume: 234 },
  { document: 'Immigration Forms', avgTime: '45 sec', accuracy: 96.8, volume: 89 }
];

const costSavings = [
  { category: 'Intake Processing', manual: 4.2, ai: 0.8, savings: 3.4 },
  { category: 'Document Generation', manual: 2.5, ai: 0.3, savings: 2.2 },
  { category: 'Case Matching', manual: 1.8, ai: 0.2, savings: 1.6 },
  { category: 'Eligibility Screening', manual: 1.2, ai: 0.1, savings: 1.1 }
];

interface AIPerformanceDashboardProps {
  onExport?: () => void;
}

export default function AIPerformanceDashboard({ onExport }: AIPerformanceDashboardProps) {
  const [timePeriod, setTimePeriod] = useState('january-2026');
  const [viewMode, setViewMode] = useState<'overview' | 'processing' | 'savings'>('overview');

  const totalAIInteractions = 612;
  const avgAccuracy = 97.9;
  const timeSavedHours = 89;
  const costSaved = 8340;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">AI Performance Metrics</h2>
          <p className="text-sm text-stone-500">Monitor AI tool usage, accuracy, and efficiency gains</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-100 rounded-lg p-1">
            {['overview', 'processing', 'savings'].map((mode) => (
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
          title="AI Interactions"
          value={totalAIInteractions}
          change="+15%"
          trend="up"
          icon={<Brain className="w-5 h-5" />}
          color="blue"
          description="Total this month"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${avgAccuracy}%`}
          change="+0.3%"
          trend="up"
          icon={<Target className="w-5 h-5" />}
          color="success"
          description="Across all AI features"
        />
        <StatCard
          title="Time Saved"
          value={`${timeSavedHours}h`}
          change="+12h"
          trend="up"
          icon={<Clock className="w-5 h-5" />}
          color="teal"
          description="Staff hours automated"
        />
        <StatCard
          title="Cost Savings"
          value={`$${(costSaved/1000).toFixed(1)}K`}
          change="+18%"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          color="warning"
          description="Operational savings"
        />
      </div>

      {viewMode === 'overview' && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">AI Usage Trend</h3>
                <span className="text-xs text-stone-500">6-month growth</span>
              </div>
              <LineChart
                data={aiUsageTrend}
                height={220}
                color="stroke-blue-500"
                showArea={true}
              />
              <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between text-sm">
                <span className="text-stone-500">Growth Rate</span>
                <span className="font-bold text-success-600">+150% over 6 months</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">AI Accuracy Scores</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <ProgressRing value={89} max={100} size={70} color="stroke-blue-500" />
                  <div>
                    <div className="text-lg font-bold text-stone-900">89%</div>
                    <div className="text-xs text-stone-500">Case Matching</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressRing value={97} max={100} size={70} color="stroke-success-500" />
                  <div>
                    <div className="text-lg font-bold text-stone-900">97%</div>
                    <div className="text-xs text-stone-500">Eligibility Screening</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressRing value={94} max={100} size={70} color="stroke-teal-500" />
                  <div>
                    <div className="text-lg font-bold text-stone-900">94%</div>
                    <div className="text-xs text-stone-500">Document Processing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900">Feature Usage Distribution</h3>
              <Sparkles className="w-5 h-5 text-stone-400" />
            </div>
            <BarChart data={featureUsage} height={180} />
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">AI System Health</h3>
                <p className="text-blue-100">Real-time performance indicators</p>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></span>
                  <span className="text-sm">Online</span>
                </div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-xs text-blue-100">Uptime</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">124ms</div>
                <div className="text-xs text-blue-100">Avg Response Time</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-blue-100">Errors Today</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">v2.4.1</div>
                <div className="text-xs text-blue-100">Model Version</div>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'processing' && (
        <>
          <div className="bg-white rounded-xl border border-stone-200">
            <div className="p-5 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-stone-400" />
                <h3 className="font-bold text-stone-900">Document Processing Metrics</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Document Type</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Avg Processing Time</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Accuracy</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Volume Processed</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {processingMetrics.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="px-5 py-4 font-medium text-stone-900">{item.document}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                          <Clock className="w-4 h-4" />
                          {item.avgTime}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`font-bold ${item.accuracy >= 98 ? 'text-success-600' : 'text-warning-600'}`}>
                          {item.accuracy}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-stone-700">{item.volume}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-success-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Optimal
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Processing Speed Comparison</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">Manual Processing</span>
                    <span className="text-stone-900 font-bold">15 min avg</span>
                  </div>
                  <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-400 rounded-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">AI Processing</span>
                    <span className="text-success-600 font-bold">26 sec avg</span>
                  </div>
                  <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-success-500 rounded-full" style={{ width: '3%' }} />
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-success-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-success-700">35x</div>
                <div className="text-sm text-success-600">Faster Than Manual</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Automation Rate by Task</h3>
              <div className="space-y-4">
                {[
                  { task: 'Eligibility Determination', rate: 95 },
                  { task: 'Case Categorization', rate: 92 },
                  { task: 'Attorney Matching', rate: 89 },
                  { task: 'Document Extraction', rate: 87 },
                  { task: 'Follow-up Scheduling', rate: 78 }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-700">{item.task}</span>
                      <span className="font-bold text-stone-900">{item.rate}%</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'savings' && (
        <>
          <div className="bg-gradient-to-r from-success-600 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl mb-2">Total Monthly Savings</h3>
                <p className="text-success-100">AI automation ROI analysis</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">$8,340</div>
                <div className="text-success-100 text-sm">Operational Savings</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200">
            <div className="p-5 border-b border-stone-200">
              <h3 className="font-bold text-stone-900">Cost Savings by Category</h3>
              <p className="text-sm text-stone-500">Hours saved converted to dollar value at $25/hr</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Category</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Manual Hours</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">AI Hours</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Hours Saved</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Cost Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {costSavings.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="px-5 py-4 font-medium text-stone-900">{item.category}</td>
                      <td className="px-5 py-4 text-center text-stone-600">{item.manual}h</td>
                      <td className="px-5 py-4 text-center text-blue-600 font-semibold">{item.ai}h</td>
                      <td className="px-5 py-4 text-center text-success-600 font-bold">{item.savings}h</td>
                      <td className="px-5 py-4 text-center">
                        <span className="bg-success-100 text-success-700 px-2 py-1 rounded font-bold">
                          ${(item.savings * 25 * 30).toFixed(0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-stone-50">
                  <tr>
                    <td className="px-5 py-4 font-bold text-stone-900">Total</td>
                    <td className="px-5 py-4 text-center font-bold text-stone-700">9.7h/day</td>
                    <td className="px-5 py-4 text-center font-bold text-blue-600">1.4h/day</td>
                    <td className="px-5 py-4 text-center font-bold text-success-600">8.3h/day</td>
                    <td className="px-5 py-4 text-center">
                      <span className="bg-success-600 text-white px-3 py-1 rounded font-bold">
                        $6,225/mo
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Time Reduction Analytics</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-700">89 hrs</div>
                  <div className="text-sm text-blue-600">Staff Hours Saved</div>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-3xl font-bold text-teal-700">2.2 FTE</div>
                  <div className="text-sm text-teal-600">Equivalent Workload</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Efficiency Gains</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <span className="text-stone-700">Intake Processing</span>
                  <span className="text-success-600 font-bold">-81%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <span className="text-stone-700">Case Assignment</span>
                  <span className="text-success-600 font-bold">-89%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <span className="text-stone-700">Report Generation</span>
                  <span className="text-success-600 font-bold">-92%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Annual Projection</h3>
              <div className="text-center p-6 bg-gradient-to-br from-success-50 to-teal-50 rounded-lg border border-success-200">
                <div className="text-4xl font-bold text-success-700">$100K+</div>
                <div className="text-sm text-success-600 mt-1">Projected Annual Savings</div>
                <div className="mt-4 pt-4 border-t border-success-200">
                  <div className="text-lg font-bold text-teal-700">1,068 hrs</div>
                  <div className="text-xs text-teal-600">Annual Time Savings</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
