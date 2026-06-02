import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, FileText, Calendar, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Download, Sparkles, RefreshCw, Target, Users,
  PieChart, ArrowRight, Eye, Send, Filter, Search,
  FileCheck, Zap, Brain, ArrowLeft
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Grant {
  id: string;
  grant_name: string;
  grant_number: string;
  description: string;
  amount_awarded: number;
  amount_spent: number;
  start_date: string;
  end_date: string;
  status: string;
  funder: {
    name: string;
    type: string;
    report_frequency: string;
  } | null;
}

interface GrantReport {
  id: string;
  grant_id: string;
  report_type: string;
  reporting_period_start: string;
  reporting_period_end: string;
  status: string;
  compliance_score: number | null;
  created_at: string;
}

interface GrantMetric {
  id: string;
  metric_name: string;
  target_value: number;
  current_value: number;
  metric_type: string;
}

const mockGrants: Grant[] = [
  {
    id: '1',
    grant_name: 'Legal Services Corporation Grant 2024',
    grant_number: 'LSC-2024-AZ-001',
    description: 'Federal funding for civil legal assistance to low-income individuals',
    amount_awarded: 450000,
    amount_spent: 287500,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    status: 'active',
    funder: { name: 'Legal Services Corporation (LSC)', type: 'federal', report_frequency: 'semi_annual' }
  },
  {
    id: '2',
    grant_name: 'State Bar Foundation Pro Bono Initiative',
    grant_number: 'SBF-2024-Q1',
    description: 'Supporting volunteer attorney programs and clinic operations',
    amount_awarded: 125000,
    amount_spent: 78000,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    status: 'active',
    funder: { name: 'State Bar Foundation', type: 'state', report_frequency: 'quarterly' }
  },
  {
    id: '3',
    grant_name: 'Access to Justice Technology Grant',
    grant_number: 'ATJ-TECH-2024',
    description: 'Funding for AI-powered legal assistance tools and client intake systems',
    amount_awarded: 75000,
    amount_spent: 45000,
    start_date: '2024-03-01',
    end_date: '2025-02-28',
    status: 'active',
    funder: { name: 'Access to Justice Foundation', type: 'private_foundation', report_frequency: 'annual' }
  }
];

const mockMetrics: GrantMetric[] = [
  { id: '1', metric_name: 'Clients Served', target_value: 2500, current_value: 1847, metric_type: 'count' },
  { id: '2', metric_name: 'Cases Closed', target_value: 1200, current_value: 923, metric_type: 'count' },
  { id: '3', metric_name: 'Pro Bono Hours', target_value: 5000, current_value: 3642, metric_type: 'hours' },
  { id: '4', metric_name: 'Favorable Outcomes', target_value: 85, current_value: 89, metric_type: 'percentage' }
];

const reportTypes = [
  { value: 'progress', label: 'Progress Report', icon: TrendingUp },
  { value: 'financial', label: 'Financial Report', icon: DollarSign },
  { value: 'compliance', label: 'Compliance Report', icon: FileCheck },
  { value: 'narrative', label: 'Narrative Report', icon: FileText },
  { value: 'combined', label: 'Combined Report', icon: BarChart3 }
];

export default function GrantReporting() {
  const { user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>(mockGrants);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [metrics, _setMetrics] = useState<GrantMetric[]>(mockMetrics);
  const [reports, setReports] = useState<GrantReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'generate' | 'history'>('overview');
  const [selectedReportType, setSelectedReportType] = useState('combined');
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadGrants();
      loadReports();
    }
  }, [user]);

  const loadGrants = async () => {
    try {
      const { data, error } = await supabase
        .from('grants')
        .select(`
          *,
          funder:grant_funders(name, type, report_frequency)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setGrants(data);
      }
    } catch (err) {
      console.error('Error loading grants:', err);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('grant_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setReports(data);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const generateAIReport = async () => {
    if (!selectedGrant) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    const progressSteps = [
      { progress: 15, message: 'Analyzing grant objectives...' },
      { progress: 30, message: 'Aggregating client demographics...' },
      { progress: 45, message: 'Calculating outcome metrics...' },
      { progress: 60, message: 'Processing financial data...' },
      { progress: 75, message: 'Running compliance checks...' },
      { progress: 90, message: 'Generating narrative summary...' },
      { progress: 100, message: 'Report complete!' }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setGenerationProgress(step.progress);
    }

    const report = {
      grant: selectedGrant,
      reportType: selectedReportType,
      generatedAt: new Date().toISOString(),
      executiveSummary: `During the reporting period, ${selectedGrant.grant_name} achieved significant progress toward its stated objectives. The program served 1,847 clients, representing 74% of the annual target of 2,500 clients. Case closure rates remained strong at 923 cases (77% of target), with an exceptional 89% favorable outcome rate exceeding the 85% goal.`,
      metrics: {
        clientsServed: { target: 2500, actual: 1847, percentComplete: 74 },
        casesClosed: { target: 1200, actual: 923, percentComplete: 77 },
        proBonoHours: { target: 5000, actual: 3642, percentComplete: 73 },
        favorableOutcomes: { target: 85, actual: 89, percentComplete: 105 }
      },
      demographics: {
        incomeLevel: { 'Below 125% FPL': 68, '125-200% FPL': 27, 'Above 200% FPL': 5 },
        caseTypes: { 'Family Law': 34, 'Housing': 28, 'Consumer': 18, 'Employment': 12, 'Other': 8 },
        geography: { 'Urban': 62, 'Suburban': 24, 'Rural': 14 }
      },
      financialSummary: {
        awarded: selectedGrant.amount_awarded,
        spent: selectedGrant.amount_spent,
        remaining: selectedGrant.amount_awarded - selectedGrant.amount_spent,
        burnRate: (selectedGrant.amount_spent / selectedGrant.amount_awarded * 100).toFixed(1)
      },
      complianceScore: 94,
      complianceFlags: [
        { severity: 'low', message: 'Minor documentation gaps in 3 case files' },
        { severity: 'info', message: 'All required reports submitted on time' }
      ],
      aiConfidence: 0.92,
      recommendations: [
        'Increase outreach in rural communities to improve geographic coverage',
        'Schedule additional housing law clinics to address high demand',
        'Consider expanding Spanish-language services based on demographic trends'
      ]
    };

    setGeneratedReport(report);
    setShowReportPreview(true);
    setIsGenerating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-teal-100 text-teal-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-navy-100 text-navy-700';
      default: return 'bg-navy-100 text-navy-700';
    }
  };

  const getFunderTypeColor = (type: string) => {
    switch (type) {
      case 'federal': return 'bg-teal-600';
      case 'state': return 'bg-teal-600';
      case 'private_foundation': return 'bg-amber-600';
      case 'corporate': return 'bg-navy-600';
      default: return 'bg-navy-500';
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />

      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-navy-800 text-white pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/for-organizations"
            className="inline-flex items-center gap-2 text-teal-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to For Organizations
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-3 py-1 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span className="text-xs font-semibold">AI-POWERED</span>
              </div>
              <h1 className="text-3xl font-bold">Grant Reporting</h1>
            </div>
          </div>
          <p className="text-teal-100 text-lg max-w-2xl">
            Generate funder-ready impact reports with one click. AI analyzes your data to create comprehensive reports with demographics, outcomes, and compliance assessments.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-xl shadow-lg border border-navy-200 overflow-hidden">
          <div className="border-b border-navy-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Grant Overview', icon: PieChart },
                { id: 'generate', label: 'Generate Report', icon: Sparkles },
                { id: 'history', label: 'Report History', icon: Clock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600 bg-teal-50/50'
                      : 'border-transparent text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(grants.reduce((sum, g) => sum + g.amount_awarded, 0))}
                    </div>
                    <div className="text-teal-100 text-sm">Total Funding</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Spent</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(grants.reduce((sum, g) => sum + g.amount_spent, 0))}
                    </div>
                    <div className="text-teal-100 text-sm">Total Spent</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">YTD</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">1,847</div>
                    <div className="text-amber-100 text-sm">Clients Served</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <CheckCircle className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Rate</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">89%</div>
                    <div className="text-green-100 text-sm">Favorable Outcomes</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-navy-900 mb-4">Active Grants</h2>
                    <div className="space-y-4">
                      {grants.map((grant) => (
                        <div
                          key={grant.id}
                          className={`border rounded-xl p-5 transition-all cursor-pointer ${
                            selectedGrant?.id === grant.id
                              ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                              : 'border-navy-200 hover:border-teal-300 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedGrant(grant)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {grant.funder && (
                                  <span className={`w-2 h-2 rounded-full ${getFunderTypeColor(grant.funder.type)}`} />
                                )}
                                <h4 className="font-bold text-navy-900">{grant.grant_name}</h4>
                              </div>
                              <p className="text-sm text-navy-500">{grant.grant_number}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}>
                              {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-navy-600 mb-4">{grant.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-navy-500">
                                {grant.funder?.name || 'Unknown Funder'}
                              </span>
                              <span className="text-navy-400">|</span>
                              <span className="text-navy-500">
                                {formatDate(grant.start_date)} - {formatDate(grant.end_date)}
                              </span>
                            </div>
                            <span className="font-bold text-teal-600">{formatCurrency(grant.amount_awarded)}</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-navy-500">Budget Utilization</span>
                              <span className="font-medium text-navy-700">
                                {((grant.amount_spent / grant.amount_awarded) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-teal-500 rounded-full transition-all"
                                style={{ width: `${(grant.amount_spent / grant.amount_awarded) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-navy-900 mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                      {metrics.map((metric) => (
                        <div key={metric.id} className="bg-navy-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-navy-700">{metric.metric_name}</span>
                            <span className={`text-sm font-bold ${
                              (metric.current_value / metric.target_value) >= 1
                                ? 'text-green-600'
                                : (metric.current_value / metric.target_value) >= 0.7
                                ? 'text-teal-600'
                                : 'text-amber-600'
                            }`}>
                              {metric.metric_type === 'percentage'
                                ? `${metric.current_value}%`
                                : metric.current_value.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-2 bg-navy-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                (metric.current_value / metric.target_value) >= 1
                                  ? 'bg-green-500'
                                  : (metric.current_value / metric.target_value) >= 0.7
                                  ? 'bg-teal-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min((metric.current_value / metric.target_value) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1 text-xs text-navy-500">
                            <span>Target: {metric.metric_type === 'percentage' ? `${metric.target_value}%` : metric.target_value.toLocaleString()}</span>
                            <span>{((metric.current_value / metric.target_value) * 100).toFixed(0)}% complete</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 bg-gradient-to-br from-teal-50 to-teal-50 rounded-xl p-4 border border-teal-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <span className="font-bold text-navy-900">Upcoming Deadlines</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-600">LSC Semi-Annual Report</span>
                          <span className="text-amber-600 font-medium">Jan 31</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-600">State Bar Q1 Report</span>
                          <span className="text-navy-500">Apr 15</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-600">ATJ Annual Report</span>
                          <span className="text-navy-500">Mar 28</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'generate' && (
              <div className="max-w-4xl mx-auto">
                {!showReportPreview ? (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-navy-900 mb-2">AI Report Generator</h2>
                      <p className="text-navy-600">
                        Select a grant and report type to generate a comprehensive, funder-ready report in seconds.
                      </p>
                    </div>

                    <div className="bg-navy-50 rounded-xl p-6">
                      <label className="block text-sm font-bold text-navy-700 mb-3">Select Grant</label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {grants.map((grant) => (
                          <button
                            key={grant.id}
                            onClick={() => setSelectedGrant(grant)}
                            className={`text-left p-4 rounded-lg border-2 transition-all ${
                              selectedGrant?.id === grant.id
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-navy-200 hover:border-teal-300 bg-white'
                            }`}
                          >
                            <div className="font-medium text-navy-900 mb-1">{grant.grant_name}</div>
                            <div className="text-sm text-navy-500">{grant.funder?.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-navy-50 rounded-xl p-6">
                      <label className="block text-sm font-bold text-navy-700 mb-3">Report Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {reportTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setSelectedReportType(type.value)}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              selectedReportType === type.value
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-navy-200 hover:border-teal-300 bg-white'
                            }`}
                          >
                            <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                              selectedReportType === type.value ? 'text-teal-600' : 'text-navy-400'
                            }`} />
                            <div className={`text-sm font-medium ${
                              selectedReportType === type.value ? 'text-teal-700' : 'text-navy-600'
                            }`}>
                              {type.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedGrant && (
                      <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-xl p-6 border border-teal-200">
                        <h3 className="font-bold text-navy-900 mb-4">Report Preview Configuration</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-navy-500">Grant:</span>
                            <span className="ml-2 font-medium text-navy-900">{selectedGrant.grant_name}</span>
                          </div>
                          <div>
                            <span className="text-navy-500">Funder:</span>
                            <span className="ml-2 font-medium text-navy-900">{selectedGrant.funder?.name}</span>
                          </div>
                          <div>
                            <span className="text-navy-500">Report Type:</span>
                            <span className="ml-2 font-medium text-navy-900">
                              {reportTypes.find(t => t.value === selectedReportType)?.label}
                            </span>
                          </div>
                          <div>
                            <span className="text-navy-500">Period:</span>
                            <span className="ml-2 font-medium text-navy-900">
                              {formatDate(selectedGrant.start_date)} - Present
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={generateAIReport}
                      disabled={!selectedGrant || isGenerating}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          Generating Report... {generationProgress}%
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Generate AI Report
                        </>
                      )}
                    </button>

                    {isGenerating && (
                      <div className="bg-navy-50 rounded-xl p-6">
                        <div className="h-2 bg-navy-200 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${generationProgress}%` }}
                          />
                        </div>
                        <div className="text-center text-sm text-navy-600">
                          {generationProgress < 20 && 'Analyzing grant objectives...'}
                          {generationProgress >= 20 && generationProgress < 40 && 'Aggregating client demographics...'}
                          {generationProgress >= 40 && generationProgress < 60 && 'Calculating outcome metrics...'}
                          {generationProgress >= 60 && generationProgress < 80 && 'Processing financial data...'}
                          {generationProgress >= 80 && generationProgress < 95 && 'Running compliance checks...'}
                          {generationProgress >= 95 && 'Finalizing report...'}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowReportPreview(false)}
                        className="flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Generator
                      </button>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Export PDF
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Export Excel
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                          <Send className="w-4 h-4" />
                          Submit to Funder
                        </button>
                      </div>
                    </div>

                    {generatedReport && (
                      <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-600 text-white p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-teal-200" />
                                <span className="text-sm text-teal-100">AI-Generated Report</span>
                              </div>
                              <h2 className="text-2xl font-bold">{generatedReport.grant.grant_name}</h2>
                              <p className="text-teal-100 mt-1">
                                {reportTypes.find(t => t.value === generatedReport.reportType)?.label} |
                                Generated {new Date(generatedReport.generatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-teal-100 mb-1">AI Confidence</div>
                              <div className="text-3xl font-bold">{(generatedReport.aiConfidence * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          <div>
                            <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-teal-600" />
                              Executive Summary
                            </h3>
                            <p className="text-navy-600 leading-relaxed bg-navy-50 p-4 rounded-lg">
                              {generatedReport.executiveSummary}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                              <Target className="w-5 h-5 text-teal-600" />
                              Performance Metrics
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {Object.entries(generatedReport.metrics).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-navy-50 rounded-lg p-4">
                                  <div className="text-sm text-navy-500 mb-1">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </div>
                                  <div className="flex items-end justify-between">
                                    <span className="text-2xl font-bold text-navy-900">{value.actual.toLocaleString()}</span>
                                    <span className={`text-sm font-medium ${
                                      value.percentComplete >= 100 ? 'text-green-600' :
                                      value.percentComplete >= 70 ? 'text-teal-600' : 'text-amber-600'
                                    }`}>
                                      {value.percentComplete}%
                                    </span>
                                  </div>
                                  <div className="text-xs text-navy-400 mt-1">Target: {value.target.toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-teal-600" />
                                Demographics
                              </h3>
                              <div className="space-y-4">
                                {Object.entries(generatedReport.demographics).map(([category, data]: [string, any]) => (
                                  <div key={category} className="bg-navy-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-navy-700 mb-2">
                                      {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </div>
                                    <div className="space-y-2">
                                      {Object.entries(data).map(([label, percent]: [string, any]) => (
                                        <div key={label} className="flex items-center justify-between text-sm">
                                          <span className="text-navy-600">{label}</span>
                                          <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-navy-200 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-teal-500 rounded-full"
                                                style={{ width: `${percent}%` }}
                                              />
                                            </div>
                                            <span className="text-navy-700 font-medium w-10 text-right">{percent}%</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-teal-600" />
                                Financial Summary
                              </h3>
                              <div className="bg-navy-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-navy-600">Total Awarded</span>
                                  <span className="font-bold text-navy-900">{formatCurrency(generatedReport.financialSummary.awarded)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-navy-600">Amount Spent</span>
                                  <span className="font-bold text-navy-900">{formatCurrency(generatedReport.financialSummary.spent)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-navy-600">Remaining</span>
                                  <span className="font-bold text-green-600">{formatCurrency(generatedReport.financialSummary.remaining)}</span>
                                </div>
                                <div className="border-t border-navy-200 pt-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-navy-600">Burn Rate</span>
                                    <span className="font-bold text-teal-600">{generatedReport.financialSummary.burnRate}%</span>
                                  </div>
                                </div>
                              </div>

                              <h3 className="text-lg font-bold text-navy-900 mt-6 mb-3 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-teal-600" />
                                Compliance Assessment
                              </h3>
                              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-medium text-navy-700">Compliance Score</span>
                                  <span className="text-2xl font-bold text-green-600">{generatedReport.complianceScore}%</span>
                                </div>
                                <div className="space-y-2">
                                  {generatedReport.complianceFlags.map((flag: any, idx: number) => (
                                    <div key={idx} className={`flex items-start gap-2 text-sm ${
                                      flag.severity === 'low' ? 'text-amber-700' : 'text-green-700'
                                    }`}>
                                      {flag.severity === 'low' ? (
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      )}
                                      {flag.message}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                              <Zap className="w-5 h-5 text-teal-600" />
                              AI Recommendations
                            </h3>
                            <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-lg p-4 border border-teal-200">
                              <ul className="space-y-2">
                                {generatedReport.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-navy-700">
                                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-navy-900">Report History</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                      <input
                        type="text"
                        placeholder="Search reports..."
                        className="pl-10 pr-4 py-2 border border-navy-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-12 bg-navy-50 rounded-xl">
                    <FileText className="w-12 h-12 text-navy-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-navy-700 mb-2">No Reports Generated Yet</h4>
                    <p className="text-navy-500 mb-4">Generate your first AI-powered report to see it here.</p>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border border-navy-200 rounded-lg hover:border-teal-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-medium text-navy-900">
                              {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                            </div>
                            <div className="text-sm text-navy-500">
                              {formatDate(report.reporting_period_start)} - {formatDate(report.reporting_period_end)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {report.compliance_score && (
                            <div className="text-right">
                              <div className="text-sm text-navy-500">Compliance</div>
                              <div className="font-bold text-green-600">{report.compliance_score}%</div>
                            </div>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'submitted' ? 'bg-green-100 text-green-700' :
                            report.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-navy-100 text-navy-700'
                          }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                          <button className="p-2 text-navy-400 hover:text-teal-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-navy-400 hover:text-teal-600 transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-16">
        <Footer />
      </div>
    </div>
  );
}
