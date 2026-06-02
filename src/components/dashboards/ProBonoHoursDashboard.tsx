import { useState } from 'react';
import {
  Clock, Users, DollarSign, Target, Download, Filter,
  ChevronDown, Star, TrendingUp, Award
} from 'lucide-react';
import { BarChart, ProgressRing, StatCard } from '../charts';

const hoursByPracticeArea = [
  { label: 'Housing', value: 124, goal: 150, color: 'bg-teal-500' },
  { label: 'Family Law', value: 98, goal: 100, color: 'bg-blue-500' },
  { label: 'Employment', value: 56, goal: 75, color: 'bg-warning-500' },
  { label: 'Immigration', value: 42, goal: 50, color: 'bg-success-500' },
  { label: 'Consumer', value: 22, goal: 25, color: 'bg-error-500' }
];

const topVolunteers = [
  { name: 'James Wilson', firm: 'Wilson & Associates', hours: 48, cases: 12, badge: 'gold' },
  { name: 'Lisa Martinez', firm: 'Martinez Legal', hours: 42, cases: 8, badge: 'gold' },
  { name: 'Carlos Rivera', firm: 'Rivera Law Group', hours: 38, cases: 10, badge: 'silver' },
  { name: 'Emily Thompson', firm: 'Thompson & Co.', hours: 35, cases: 7, badge: 'silver' },
  { name: 'Michael Chen', firm: 'Chen Legal Services', hours: 32, cases: 9, badge: 'bronze' },
  { name: 'Sarah Johnson', firm: 'Johnson Legal Aid', hours: 28, cases: 6, badge: 'bronze' }
];

const monthlyHoursTrend = [
  { label: 'Aug', value: 285 },
  { label: 'Sep', value: 312 },
  { label: 'Oct', value: 298 },
  { label: 'Nov', value: 345 },
  { label: 'Dec', value: 367 },
  { label: 'Jan', value: 342 }
];

interface ProBonoHoursDashboardProps {
  onExport?: () => void;
}

export default function ProBonoHoursDashboard({ onExport }: ProBonoHoursDashboardProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'attorneys' | 'practice-areas'>('overview');
  const [timePeriod, setTimePeriod] = useState('january-2026');

  const totalHours = 342;
  const hourlyRate = 300;
  const totalValue = totalHours * hourlyRate;
  const goalHours = 400;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Pro Bono Hours Tracking</h2>
          <p className="text-sm text-stone-500">Monitor volunteer attorney contributions and value</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-100 rounded-lg p-1">
            {['overview', 'attorneys', 'practice-areas'].map((mode) => (
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
          title="Total Hours"
          value={totalHours}
          change="+15%"
          trend="up"
          icon={<Clock className="w-5 h-5" />}
          color="teal"
          description={`${Math.round((totalHours/goalHours)*100)}% of monthly goal`}
        />
        <StatCard
          title="Billable Value"
          value={`$${(totalValue/1000).toFixed(1)}K`}
          change="+12%"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          color="success"
          description={`At $${hourlyRate}/hr rate`}
        />
        <StatCard
          title="Active Volunteers"
          value="28"
          change="+4"
          trend="up"
          icon={<Users className="w-5 h-5" />}
          color="blue"
          description="Contributing this month"
        />
        <StatCard
          title="Avg Hours/Attorney"
          value="12.2"
          change="+2.1"
          trend="up"
          icon={<Target className="w-5 h-5" />}
          color="warning"
          description="Per active volunteer"
        />
      </div>

      {viewMode === 'overview' && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Goal Progress</h3>
              <div className="flex justify-center mb-4">
                <ProgressRing
                  value={totalHours}
                  max={goalHours}
                  size={160}
                  thickness={16}
                  color="stroke-teal-500"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-900">{totalHours} / {goalHours}</div>
                <div className="text-sm text-stone-500">Hours logged this month</div>
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <span className="text-success-600 font-semibold">{goalHours - totalHours} hours</span>
                  <span className="text-stone-500"> to reach goal</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">Hours by Practice Area</h3>
                <span className="text-xs text-stone-500">Goal vs Actual</span>
              </div>
              <div className="space-y-4">
                {hoursByPracticeArea.map((area, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-stone-700">{area.label}</span>
                      <span className="text-stone-500">{area.value} / {area.goal} hrs</span>
                    </div>
                    <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${area.color}`}
                        style={{ width: `${Math.min((area.value / area.goal) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900">Monthly Hours Trend</h3>
              <TrendingUp className="w-5 h-5 text-stone-400" />
            </div>
            <BarChart data={monthlyHoursTrend} height={180} />
          </div>
        </>
      )}

      {viewMode === 'attorneys' && (
        <div className="bg-white rounded-xl border border-stone-200">
          <div className="p-5 border-b border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900">Top Contributing Attorneys</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50 rounded-lg">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Rank</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Attorney</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Firm</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Hours</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Cases</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Value</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {topVolunteers.map((volunteer, idx) => (
                  <tr key={idx} className="hover:bg-stone-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">#{idx + 1}</span>
                        {volunteer.badge === 'gold' && <Award className="w-5 h-5 text-warning-500" />}
                        {volunteer.badge === 'silver' && <Award className="w-5 h-5 text-stone-400" />}
                        {volunteer.badge === 'bronze' && <Award className="w-5 h-5 text-orange-400" />}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-stone-900">{volunteer.name}</div>
                    </td>
                    <td className="px-5 py-4 text-stone-600">{volunteer.firm}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-teal-600">{volunteer.hours}</span>
                    </td>
                    <td className="px-5 py-4 text-center text-stone-700">{volunteer.cases}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold text-success-600">
                        ${(volunteer.hours * hourlyRate / 1000).toFixed(1)}K
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Award className="w-4 h-4 text-teal-500" />
                        <span className="font-semibold text-stone-700">{volunteer.badge}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'practice-areas' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {hoursByPracticeArea.map((area, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">{area.label}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  area.value >= area.goal ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
                }`}>
                  {Math.round((area.value / area.goal) * 100)}% of goal
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-stone-50 rounded-lg">
                  <div className="text-xl font-bold text-stone-900">{area.value}</div>
                  <div className="text-xs text-stone-500">Hours</div>
                </div>
                <div className="text-center p-3 bg-stone-50 rounded-lg">
                  <div className="text-xl font-bold text-success-600">
                    ${(area.value * hourlyRate / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-stone-500">Value</div>
                </div>
                <div className="text-center p-3 bg-stone-50 rounded-lg">
                  <div className="text-xl font-bold text-stone-900">{Math.floor(area.value / 8)}</div>
                  <div className="text-xs text-stone-500">Cases</div>
                </div>
              </div>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${area.color}`}
                  style={{ width: `${Math.min((area.value / area.goal) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-stone-500 mt-1">
                <span>0 hrs</span>
                <span>{area.goal} hrs (goal)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4">Billable Hour Equivalency Summary</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-3xl font-bold">{totalHours}</div>
            <div className="text-blue-100 text-sm">Total Pro Bono Hours</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-3xl font-bold">${hourlyRate}</div>
            <div className="text-blue-100 text-sm">Market Hourly Rate</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-3xl font-bold">${(totalValue/1000).toFixed(1)}K</div>
            <div className="text-blue-100 text-sm">Total Economic Value</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-3xl font-bold">$1.23M</div>
            <div className="text-blue-100 text-sm">YTD Cumulative Value</div>
          </div>
        </div>
      </div>
    </div>
  );
}
