import { useState } from 'react';
import { Calculator, TrendingDown } from 'lucide-react';

export default function ROICalculator() {
  const [requests, setRequests] = useState(20);
  const [minutes, setMinutes] = useState(45);
  const [hourlyRate, setHourlyRate] = useState(75);

  const monthlyHours = Math.round((requests * minutes) / 60);
  const estimatedSavings = Math.round(monthlyHours * hourlyRate * 0.6);
  const hoursSaved = Math.round(monthlyHours * 0.6);

  return (
    <div className="bg-white rounded-2xl border border-navy-200 p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
          <Calculator className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-navy-900">Estimate Your Time Savings</h3>
          <p className="text-sm text-navy-500">See how intake automation could reduce admin work</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div>
          <label htmlFor="roi-requests" className="block text-sm font-medium text-navy-700 mb-2">
            Legal requests per month
          </label>
          <input
            id="roi-requests"
            type="range"
            min={1}
            max={100}
            value={requests}
            onChange={(e) => setRequests(+e.target.value)}
            className="w-full accent-teal-600"
          />
          <span className="block text-center text-lg font-bold text-navy-900 mt-1">{requests}</span>
        </div>
        <div>
          <label htmlFor="roi-minutes" className="block text-sm font-medium text-navy-700 mb-2">
            Avg. minutes organizing each
          </label>
          <input
            id="roi-minutes"
            type="range"
            min={10}
            max={120}
            step={5}
            value={minutes}
            onChange={(e) => setMinutes(+e.target.value)}
            className="w-full accent-teal-600"
          />
          <span className="block text-center text-lg font-bold text-navy-900 mt-1">{minutes} min</span>
        </div>
        <div>
          <label htmlFor="roi-rate" className="block text-sm font-medium text-navy-700 mb-2">
            Internal hourly cost ($)
          </label>
          <input
            id="roi-rate"
            type="range"
            min={25}
            max={300}
            step={5}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(+e.target.value)}
            className="w-full accent-teal-600"
          />
          <span className="block text-center text-lg font-bold text-navy-900 mt-1">${hourlyRate}/hr</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingDown className="w-5 h-5 text-teal-600" />
              <span className="text-3xl font-bold text-teal-700">{hoursSaved} hrs</span>
            </div>
            <p className="text-sm text-navy-600">Estimated admin time that could be reduced monthly</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-teal-700 mb-1">${estimatedSavings.toLocaleString()}</div>
            <p className="text-sm text-navy-600">Estimated monthly value of time saved</p>
          </div>
        </div>
        <p className="text-xs text-navy-500 mt-4 text-center">
          Based on conservative 60% automation of intake organization tasks. Actual results vary.
        </p>
      </div>
    </div>
  );
}
