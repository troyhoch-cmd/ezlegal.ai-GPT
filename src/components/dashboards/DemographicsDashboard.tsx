import { useState } from 'react';
import {
  Users, MapPin, DollarSign, Briefcase, Download, ChevronDown,
  Globe, Home, GraduationCap, Heart
} from 'lucide-react';
import { BarChart, DonutChart, HeatMap, StatCard } from '../charts';

const ageDistribution = [
  { label: '18-24', value: 23, color: 'stroke-teal-400' },
  { label: '25-34', value: 38, color: 'stroke-teal-500' },
  { label: '35-44', value: 45, color: 'stroke-blue-500' },
  { label: '45-54', value: 28, color: 'stroke-warning-500' },
  { label: '55-64', value: 16, color: 'stroke-success-500' },
  { label: '65+', value: 6, color: 'stroke-stone-400' }
];

const incomeDistribution = [
  { label: '0-50% FPL', value: 67, color: 'bg-error-500' },
  { label: '50-100% FPL', value: 52, color: 'bg-warning-500' },
  { label: '100-150% FPL', value: 28, color: 'bg-teal-500' },
  { label: '150-200% FPL', value: 9, color: 'bg-blue-500' }
];

const caseTypeDistribution = [
  { label: 'Housing', value: 87 },
  { label: 'Family Law', value: 64 },
  { label: 'Employment', value: 45 },
  { label: 'Consumer Debt', value: 38 },
  { label: 'Immigration', value: 29 },
  { label: 'Public Benefits', value: 18 },
  { label: 'Other', value: 12 }
];

const countyData = [
  { county: 'Maricopa', value: 89 },
  { county: 'Pima', value: 34 },
  { county: 'Pinal', value: 12 },
  { county: 'Yavapai', value: 8 },
  { county: 'Coconino', value: 6 },
  { county: 'Mohave', value: 4 },
  { county: 'Yuma', value: 3 },
  { county: 'Apache', value: 2 }
];

const languageData = [
  { label: 'English', value: 98, color: 'stroke-teal-500' },
  { label: 'Spanish', value: 42, color: 'stroke-blue-500' },
  { label: 'Navajo', value: 8, color: 'stroke-warning-500' },
  { label: 'Vietnamese', value: 4, color: 'stroke-success-500' },
  { label: 'Other', value: 4, color: 'stroke-stone-400' }
];

const diversityMetrics = [
  { label: 'Hispanic/Latino', percentage: 38 },
  { label: 'White', percentage: 32 },
  { label: 'Black/African American', percentage: 18 },
  { label: 'Native American', percentage: 7 },
  { label: 'Asian', percentage: 3 },
  { label: 'Other/Multiple', percentage: 2 }
];

interface DemographicsDashboardProps {
  onExport?: () => void;
}

export default function DemographicsDashboard({ onExport }: DemographicsDashboardProps) {
  const [timePeriod, setTimePeriod] = useState('january-2026');
  const [viewMode, setViewMode] = useState<'overview' | 'geographic' | 'diversity'>('overview');

  const totalClients = 156;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Demographics Dashboard</h2>
          <p className="text-sm text-stone-500">Understand your client population and service distribution</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-100 rounded-lg p-1">
            {['overview', 'geographic', 'diversity'].map((mode) => (
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
          title="Total Clients Served"
          value={totalClients}
          change="+8%"
          trend="up"
          icon={<Users className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Counties Served"
          value="8"
          icon={<MapPin className="w-5 h-5" />}
          color="blue"
          description="Across all regions"
        />
        <StatCard
          title="Below 100% FPL"
          value="76%"
          icon={<DollarSign className="w-5 h-5" />}
          color="warning"
          description="Of clients served"
        />
        <StatCard
          title="Languages Served"
          value="5+"
          icon={<Globe className="w-5 h-5" />}
          color="success"
          description="Including Spanish, Navajo"
        />
      </div>

      {viewMode === 'overview' && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Age Distribution</h3>
              <DonutChart
                data={ageDistribution}
                centerValue={totalClients.toString()}
                centerLabel="Total Clients"
              />
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">Income Level (Federal Poverty Level)</h3>
                <DollarSign className="w-5 h-5 text-stone-400" />
              </div>
              <div className="space-y-4">
                {incomeDistribution.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-stone-700">{item.label}</span>
                      <span className="text-stone-500">{item.value} clients ({Math.round((item.value/totalClients)*100)}%)</span>
                    </div>
                    <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${(item.value / totalClients) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 text-center">
                <span className="text-sm text-stone-600">
                  <span className="font-bold text-warning-600">76%</span> of clients below 100% Federal Poverty Level
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">Cases by Type</h3>
                <Briefcase className="w-5 h-5 text-stone-400" />
              </div>
              <BarChart data={caseTypeDistribution} height={200} orientation="horizontal" />
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">Primary Language</h3>
                <Globe className="w-5 h-5 text-stone-400" />
              </div>
              <DonutChart
                data={languageData}
                size={140}
                centerValue="5"
                centerLabel="Languages"
              />
            </div>
          </div>
        </>
      )}

      {viewMode === 'geographic' && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-900">Clients by County</h3>
                <MapPin className="w-5 h-5 text-stone-400" />
              </div>
              <HeatMap data={countyData} />
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Geographic Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-teal-900">Urban vs Rural</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-teal-700">Urban: </span>
                      <span className="font-bold text-teal-900">78%</span>
                    </div>
                    <div>
                      <span className="text-teal-700">Rural: </span>
                      <span className="font-bold text-teal-900">22%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="font-semibold text-blue-900 block mb-2">Top Service Areas</span>
                  <ol className="text-sm space-y-1">
                    <li className="flex justify-between text-blue-700">
                      <span>1. Phoenix Metro</span>
                      <span className="font-bold">57%</span>
                    </li>
                    <li className="flex justify-between text-blue-700">
                      <span>2. Tucson</span>
                      <span className="font-bold">22%</span>
                    </li>
                    <li className="flex justify-between text-blue-700">
                      <span>3. Other</span>
                      <span className="font-bold">21%</span>
                    </li>
                  </ol>
                </div>

                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <span className="font-semibold text-warning-900 block mb-2">Underserved Areas</span>
                  <p className="text-sm text-warning-700">
                    Rural counties (Apache, Navajo, Graham) show 40% lower access to services.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-bold text-stone-900 mb-4">Service Accessibility Analysis</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-3xl font-bold text-teal-600 mb-2">23 min</div>
                <div className="text-sm text-stone-600">Avg. Distance to Service Center</div>
                <div className="text-xs text-stone-500 mt-1">Phoenix Metro Area</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-3xl font-bold text-warning-600 mb-2">67 min</div>
                <div className="text-sm text-stone-600">Avg. Distance to Service Center</div>
                <div className="text-xs text-stone-500 mt-1">Rural Areas</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-3xl font-bold text-success-600 mb-2">89%</div>
                <div className="text-sm text-stone-600">Virtual Service Adoption</div>
                <div className="text-xs text-stone-500 mt-1">Post-COVID average</div>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'diversity' && (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">Diversity & Inclusion Metrics</h3>
                <p className="text-blue-100">Ensuring equitable access to legal services</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">68%</div>
                <div className="text-sm text-blue-100">Minority Clients Served</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">27%</div>
                <div className="text-sm text-blue-100">Spanish-Speaking Clients</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">5%</div>
                <div className="text-sm text-blue-100">Indigenous Clients</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Race/Ethnicity Distribution</h3>
              <div className="space-y-3">
                {diversityMetrics.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-stone-700">{item.label}</span>
                      <span className="text-stone-900 font-bold">{item.percentage}%</span>
                    </div>
                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-4">Population Comparison</h3>
              <p className="text-sm text-stone-600 mb-4">
                Our service population compared to national demographics
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <span className="text-success-900 font-medium">Hispanic/Latino</span>
                  <div className="text-right">
                    <span className="text-success-700 font-bold">38%</span>
                    <span className="text-success-600 text-sm ml-2">(AZ: 32%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-900 font-medium">Black/African American</span>
                  <div className="text-right">
                    <span className="text-blue-700 font-bold">18%</span>
                    <span className="text-blue-600 text-sm ml-2">(AZ: 5%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                  <span className="text-teal-900 font-medium">Native American</span>
                  <div className="text-right">
                    <span className="text-teal-700 font-bold">7%</span>
                    <span className="text-teal-600 text-sm ml-2">(AZ: 5%)</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-4 pt-4 border-t border-stone-100">
                * Over-representation indicates effective outreach to underserved communities
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-stone-400" />
              <h3 className="font-bold text-stone-900">Education Level Distribution</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { level: 'Less than High School', percentage: 18 },
                { level: 'High School/GED', percentage: 34 },
                { level: 'Some College', percentage: 28 },
                { level: "Bachelor's or Higher", percentage: 20 }
              ].map((item, idx) => (
                <div key={idx} className="text-center p-4 bg-stone-50 rounded-lg">
                  <div className="text-2xl font-bold text-stone-900">{item.percentage}%</div>
                  <div className="text-sm text-stone-600">{item.level}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
