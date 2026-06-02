import { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, TrendingUp, Star,
  MessageSquare, Download, ChevronDown, ThumbsUp, AlertTriangle
} from 'lucide-react';
import { DonutChart, BarChart, LineChart, StatCard } from '../charts';

const resolutionData = [
  { label: 'Favorable', value: 82, color: 'stroke-success-500' },
  { label: 'Partially Favorable', value: 24, color: 'stroke-warning-500' },
  { label: 'Unfavorable', value: 12, color: 'stroke-error-500' },
  { label: 'Pending', value: 38, color: 'stroke-stone-400' }
];

const satisfactionTrend = [
  { label: 'Aug', value: 4.5 },
  { label: 'Sep', value: 4.6 },
  { label: 'Oct', value: 4.5 },
  { label: 'Nov', value: 4.7 },
  { label: 'Dec', value: 4.8 },
  { label: 'Jan', value: 4.8 }
];

const outcomesByArea = [
  { label: 'Housing', value: 89 },
  { label: 'Family', value: 84 },
  { label: 'Employment', value: 91 },
  { label: 'Consumer', value: 78 },
  { label: 'Immigration', value: 86 }
];

const recentFeedback = [
  { client: 'M.G.', rating: 5, comment: 'Attorney Wilson was incredibly helpful with my eviction case. I got to keep my home.', date: 'Jan 10, 2026', outcome: 'Favorable' },
  { client: 'R.C.', rating: 5, comment: 'Quick response and great communication throughout the process.', date: 'Jan 8, 2026', outcome: 'Favorable' },
  { client: 'S.J.', rating: 4, comment: 'Good guidance on custody matters. Still waiting on final ruling.', date: 'Jan 5, 2026', outcome: 'Pending' },
  { client: 'D.S.', rating: 5, comment: 'Debt was discharged. Thank you for the pro bono help!', date: 'Jan 3, 2026', outcome: 'Favorable' }
];

const followUpData = [
  { metric: 'Housing Stability (6mo)', value: 94, description: 'Clients still in housing after 6 months' },
  { metric: 'Debt Reduction', value: 78, description: 'Average debt reduction achieved' },
  { metric: 'Employment Retention', value: 89, description: 'Clients retained employment' },
  { metric: 'Family Reunification', value: 67, description: 'Successful custody arrangements' }
];

interface OutcomesAnalysisDashboardProps {
  onExport?: () => void;
}

export default function OutcomesAnalysisDashboard({ onExport }: OutcomesAnalysisDashboardProps) {
  const [timePeriod, setTimePeriod] = useState('january-2026');
  const [viewMode, setViewMode] = useState<'overview' | 'satisfaction' | 'long-term'>('overview');

  const totalCases = resolutionData.reduce((sum, d) => sum + d.value, 0);
  const favorableRate = Math.round((resolutionData[0].value / (totalCases - resolutionData[3].value)) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Outcomes Analysis</h2>
          <p className="text-sm text-stone-500">Track case resolutions, client satisfaction, and long-term impact</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-100 rounded-lg p-1">
            {['overview', 'satisfaction', 'long-term'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as typeof viewMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
          title="Success Rate"
          value={`${favorableRate}%`}
          change="+3%"
          trend="up"
          icon={<CheckCircle className="w-5 h-5" />}
          color="success"
          description="Favorable outcomes"
        />
        <StatCard
          title="Cases Resolved"
          value="118"
          change="+14"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
          color="teal"
          description="This period"
        />
        <StatCard
          title="Client Satisfaction"
          value="4.8"
          change="+0.1"
          trend="up"
          icon={<Star className="w-5 h-5" />}
          color="warning"
          description="Average rating (5.0 max)"
        />
        <StatCard
          title="Avg Resolution Time"
          value="23 days"
          change="-4 days"
          trend="up"
          icon={<Clock className="w-5 h-5" />}
          color="blue"
          description="Faster than last month"
        />
      </div>

      {viewMode === 'overview' && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Case Resolution Distribution</h3>
              <DonutChart
                data={resolutionData}
                centerValue={`${favorableRate}%`}
                centerLabel="Success Rate"
              />
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">Success Rate by Practice Area</h3>
                <span className="text-xs text-stone-500">% Favorable Outcomes</span>
              </div>
              <BarChart
                data={outcomesByArea}
                height={220}
                orientation="horizontal"
                maxValue={100}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Resolution Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Favorable', count: 82, icon: <CheckCircle className="w-5 h-5" />, color: 'text-success-600 bg-success-50' },
                  { label: 'Partially Favorable', count: 24, icon: <ThumbsUp className="w-5 h-5" />, color: 'text-warning-600 bg-warning-50' },
                  { label: 'Unfavorable', count: 12, icon: <XCircle className="w-5 h-5" />, color: 'text-error-600 bg-error-50' },
                  { label: 'Pending Resolution', count: 38, icon: <Clock className="w-5 h-5" />, color: 'text-stone-600 bg-stone-100' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="font-medium text-stone-900">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-stone-900">{item.count}</span>
                      <span className="text-sm text-stone-500 ml-1">cases</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Key Performance Indicators</h3>
              <div className="space-y-4">
                <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-success-900 font-medium">Cases Won/Settled Favorably</span>
                    <span className="text-2xl font-bold text-success-700">82</span>
                  </div>
                  <div className="text-sm text-success-700 mt-1">69.5% of resolved cases</div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-900 font-medium">Median Days to Resolution</span>
                    <span className="text-2xl font-bold text-blue-700">18</span>
                  </div>
                  <div className="text-sm text-blue-700 mt-1">5 days faster than average</div>
                </div>
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-teal-900 font-medium">Money Recovered for Clients</span>
                    <span className="text-2xl font-bold text-teal-700">$89.4K</span>
                  </div>
                  <div className="text-sm text-teal-700 mt-1">Wages, settlements, damages</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'satisfaction' && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Overall Satisfaction</h3>
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-warning-600 mb-2">4.8</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${star <= 4.8 ? 'text-warning-400 fill-warning-400' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-stone-500">Based on 156 responses</p>
              </div>
              <div className="space-y-2 pt-4 border-t border-stone-100">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const counts = [98, 42, 12, 3, 1];
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm text-stone-600 w-4">{rating}</span>
                      <Star className="w-4 h-4 text-warning-400 fill-warning-400" />
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning-400 rounded-full"
                          style={{ width: `${(counts[5 - rating] / 156) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-stone-500 w-8">{counts[5 - rating]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">Satisfaction Trend</h3>
                <span className="text-xs text-stone-500">6-month average</span>
              </div>
              <LineChart
                data={satisfactionTrend}
                height={200}
                color="stroke-warning-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200">
            <div className="p-5 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-stone-400" />
                <h3 className="font-bold text-stone-900">Recent Client Feedback</h3>
              </div>
            </div>
            <div className="divide-y divide-stone-100">
              {recentFeedback.map((feedback, idx) => (
                <div key={idx} className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-teal-700">{feedback.client}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= feedback.rating ? 'text-warning-400 fill-warning-400' : 'text-stone-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-stone-500">{feedback.date}</span>
                        </div>
                      </div>
                      <p className="text-stone-700">{feedback.comment}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      feedback.outcome === 'Favorable' ? 'bg-success-100 text-success-700' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {feedback.outcome}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === 'long-term' && (
        <>
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Long-Term Impact Measurement</h3>
            <p className="text-teal-100 mb-4">Tracking client outcomes 6-12 months after case resolution</p>
            <div className="grid md:grid-cols-4 gap-4">
              {followUpData.map((item, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold">{item.value}%</div>
                  <div className="text-sm text-white/90 font-medium">{item.metric}</div>
                  <div className="text-xs text-white/70 mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Follow-Up Response Rate</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                  <div>
                    <span className="font-medium text-stone-900">30-Day Follow-Up</span>
                    <p className="text-sm text-stone-500">Response rate</p>
                  </div>
                  <span className="text-2xl font-bold text-teal-600">78%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                  <div>
                    <span className="font-medium text-stone-900">6-Month Check-In</span>
                    <p className="text-sm text-stone-500">Response rate</p>
                  </div>
                  <span className="text-2xl font-bold text-teal-600">62%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                  <div>
                    <span className="font-medium text-stone-900">12-Month Survey</span>
                    <p className="text-sm text-stone-500">Response rate</p>
                  </div>
                  <span className="text-2xl font-bold text-teal-600">45%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Recidivism Prevention</h3>
              <div className="space-y-4">
                <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-success-600" />
                    <div>
                      <div className="text-2xl font-bold text-success-700">91%</div>
                      <div className="text-sm text-success-700">No repeat legal issues within 12 months</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-warning-600" />
                    <div>
                      <div className="text-2xl font-bold text-warning-700">9%</div>
                      <div className="text-sm text-warning-700">Required additional assistance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
