import { useState } from 'react';
import {
  TrendingUp, Users, Briefcase, Clock, CheckCircle,
  Calendar, Filter, Download, ChevronDown
} from 'lucide-react';
import { BarChart, LineChart, StatCard, ProgressRing } from '../charts';

const monthlyTrends = [
  { label: 'Aug', value: 142 },
  { label: 'Sep', value: 158 },
  { label: 'Oct', value: 175 },
  { label: 'Nov', value: 163 },
  { label: 'Dec', value: 189 },
  { label: 'Jan', value: 212 }
];

const casesByType = [
  { label: 'Housing', value: 87 },
  { label: 'Family', value: 64 },
  { label: 'Employment', value: 45 },
  { label: 'Consumer', value: 38 },
  { label: 'Immigration', value: 29 },
  { label: 'Other', value: 24 }
];

const weeklyProgress = [
  { week: 'Week 1', closed: 12, opened: 18 },
  { week: 'Week 2', closed: 15, opened: 14 },
  { week: 'Week 3', closed: 19, opened: 16 },
  { week: 'Week 4', closed: 14, opened: 11 }
];

interface MonthlyImpactDashboardProps {
  onExport?: () => void;
}

export default function MonthlyImpactDashboard({ onExport }: MonthlyImpactDashboardProps) {
  const [timePeriod, setTimePeriod] = useState('january-2026');
  const [compareMode, setCompareMode] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Monthly Impact Dashboard</h2>
          <p className="text-sm text-stone-500">Track your organization's monthly performance and outcomes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="appearance-none bg-white border border-stone-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-stone-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="january-2026">January 2026</option>
              <option value="december-2025">December 2025</option>
              <option value="november-2025">November 2025</option>
              <option value="q4-2025">Q4 2025</option>
              <option value="year-2025">Full Year 2025</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              compareMode ? 'bg-teal-100 text-teal-700' : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Compare
          </button>
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
          title="Cases Closed"
          value="47"
          change="+12%"
          trend="up"
          icon={<CheckCircle className="w-5 h-5" />}
          color="success"
          description="vs. 42 last month"
        />
        <StatCard
          title="Clients Served"
          value="156"
          change="+8%"
          trend="up"
          icon={<Users className="w-5 h-5" />}
          color="teal"
          description="Active and new clients"
        />
        <StatCard
          title="Hours Logged"
          value="342"
          change="+15%"
          trend="up"
          icon={<Clock className="w-5 h-5" />}
          color="blue"
          description="$102,600 equivalent value"
        />
        <StatCard
          title="Success Rate"
          value="87%"
          change="+3%"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
          color="warning"
          description="Cases resolved favorably"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900">Clients Served Trend</h3>
              <p className="text-sm text-stone-500">6-month rolling trend</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-stone-500">
                <span className="w-3 h-0.5 bg-teal-500 rounded"></span>
                Clients
              </span>
            </div>
          </div>
          <LineChart
            data={monthlyTrends}
            height={220}
            color="stroke-teal-500"
            showArea={true}
          />
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-bold text-stone-900 mb-4">Monthly Goals</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <ProgressRing value={47} max={50} size={70} color="stroke-success-500" label="Cases Closed" />
              <div>
                <div className="text-lg font-bold text-stone-900">47 / 50</div>
                <div className="text-xs text-stone-500">Goal: 50 cases</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing value={342} max={400} size={70} color="stroke-blue-500" label="Pro Bono Hours" />
              <div>
                <div className="text-lg font-bold text-stone-900">342 / 400</div>
                <div className="text-xs text-stone-500">Goal: 400 hours</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing value={156} max={150} size={70} color="stroke-teal-500" label="Clients Served" />
              <div>
                <div className="text-lg font-bold text-success-600">156 / 150</div>
                <div className="text-xs text-success-600">Goal exceeded!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900">Cases by Practice Area</h3>
              <p className="text-sm text-stone-500">Distribution of closed cases</p>
            </div>
            <Briefcase className="w-5 h-5 text-stone-400" />
          </div>
          <BarChart data={casesByType} height={200} orientation="horizontal" />
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900">Weekly Case Flow</h3>
              <p className="text-sm text-stone-500">Cases opened vs. closed by week</p>
            </div>
            <Calendar className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-4">
            {weeklyProgress.map((week, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-stone-600 font-medium">{week.week}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-success-600">+{week.opened} opened</span>
                    <span className="text-blue-600">{week.closed} closed</span>
                  </div>
                </div>
                <div className="flex gap-1 h-4">
                  <div
                    className="bg-success-400 rounded-l"
                    style={{ width: `${(week.opened / 20) * 100}%` }}
                  />
                  <div
                    className="bg-blue-500 rounded-r"
                    style={{ width: `${(week.closed / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success-400 rounded"></div>
              <span className="text-xs text-stone-600">Opened</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs text-stone-600">Closed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">$127,800</div>
            <div className="text-teal-100 text-sm">Economic Value of Services</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">23.4</div>
            <div className="text-teal-100 text-sm">Avg. Days to Resolution</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">4.8</div>
            <div className="text-teal-100 text-sm">Client Satisfaction Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">92%</div>
            <div className="text-teal-100 text-sm">Intake Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
