import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, BarChart3, Clock, CheckCircle, AlertCircle,
  Calendar, Briefcase, TrendingUp, Download, Filter, Search,
  ChevronRight, ArrowUpRight, ArrowDownRight, UserCheck, Scale,
  Building2, Mail, Star, Eye, PlusCircle, Bell,
  MessageSquare, Zap, Brain, Target, RefreshCw, Send, Sparkles,
  Activity, Shield, ExternalLink, X, PieChart
} from 'lucide-react';
import Navigation from '../components/Navigation';
import OutcomePredictionPanel from '../components/OutcomePredictionPanel';
import { CasePredictionInput } from '../services/prediction-service';
import {
  MonthlyImpactDashboard,
  ProBonoHoursDashboard,
  OutcomesAnalysisDashboard,
  DemographicsDashboard,
  AIPerformanceDashboard,
  ComplianceDashboard,
  ReportGeneratorDashboard,
  AuditLogsDashboard
} from '../components/dashboards';
import AICaseMatchingDashboard from '../components/AICaseMatchingDashboard';
import LSOGovernanceDisclosures from '../components/LSOGovernanceDisclosures';

interface Client {
  id: number;
  name: string;
  matter: string;
  status: string;
  attorney: string;
  priority: string;
  intake: string;
  aiScore?: number;
  aiInsight?: string;
  caseType: string;
  jurisdiction: string;
  hasDocumentation: boolean;
  documentationQuality: 'none' | 'partial' | 'complete' | 'excellent';
  hasOpposingCounsel: boolean;
}

interface Attorney {
  id: number;
  name: string;
  specialty: string;
  cases: number;
  hours: number;
  available: boolean;
  matchScore?: number;
}

interface Notification {
  id: number;
  type: 'case' | 'attorney' | 'report' | 'urgent' | 'ai';
  message: string;
  time: string;
  read: boolean;
}

const mockClients: Client[] = [
  { id: 1, name: 'Maria Garcia', matter: 'Eviction Defense', status: 'Active', attorney: 'James Wilson', priority: 'High', intake: '2026-01-05', aiScore: 92, aiInsight: 'High likelihood of successful defense based on documentation', caseType: 'housing', jurisdiction: 'Arizona', hasDocumentation: true, documentationQuality: 'excellent', hasOpposingCounsel: true },
  { id: 2, name: 'Robert Chen', matter: 'Wage Claim', status: 'Pending Review', attorney: 'Unassigned', priority: 'Medium', intake: '2026-01-07', aiScore: 78, aiInsight: 'Strong case - recommend employment specialist', caseType: 'employment', jurisdiction: 'Arizona', hasDocumentation: true, documentationQuality: 'complete', hasOpposingCounsel: false },
  { id: 3, name: 'Sarah Johnson', matter: 'Family Law - Custody', status: 'Active', attorney: 'Lisa Martinez', priority: 'High', intake: '2026-01-02', aiScore: 85, aiInsight: 'Documentation complete, court date approaching', caseType: 'family', jurisdiction: 'Arizona', hasDocumentation: true, documentationQuality: 'complete', hasOpposingCounsel: true },
  { id: 4, name: 'David Smith', matter: 'Consumer Debt', status: 'Closed - Resolved', attorney: 'James Wilson', priority: 'Low', intake: '2025-12-15', aiScore: 95, aiInsight: 'Successfully resolved - debt discharged', caseType: 'consumer', jurisdiction: 'Arizona', hasDocumentation: true, documentationQuality: 'excellent', hasOpposingCounsel: false },
  { id: 5, name: 'Jennifer Brown', matter: 'Immigration - DACA', status: 'Active', attorney: 'Carlos Rivera', priority: 'High', intake: '2026-01-06', aiScore: 88, aiInsight: 'Time-sensitive renewal - deadline Jan 20', caseType: 'immigration', jurisdiction: 'Arizona', hasDocumentation: true, documentationQuality: 'partial', hasOpposingCounsel: false },
];

const mockAttorneys: Attorney[] = [
  { id: 1, name: 'James Wilson', specialty: 'Housing, Consumer', cases: 8, hours: 24, available: true, matchScore: 95 },
  { id: 2, name: 'Lisa Martinez', specialty: 'Family Law', cases: 5, hours: 18, available: true, matchScore: 88 },
  { id: 3, name: 'Carlos Rivera', specialty: 'Immigration', cases: 6, hours: 22, available: false, matchScore: 92 },
  { id: 4, name: 'Emily Thompson', specialty: 'Employment', cases: 4, hours: 12, available: true, matchScore: 85 },
];

const mockNotifications: Notification[] = [
  { id: 1, type: 'urgent', message: 'URGENT: Court deadline tomorrow for Maria Garcia case', time: '5 min ago', read: false },
  { id: 2, type: 'ai', message: 'AI matched 3 new cases to available attorneys', time: '15 min ago', read: false },
  { id: 3, type: 'case', message: 'New intake: Robert Chen - Wage Claim', time: '1 hour ago', read: true },
  { id: 4, type: 'attorney', message: 'James Wilson completed case #1234', time: '2 hours ago', read: true },
  { id: 5, type: 'report', message: 'Monthly impact report ready for download', time: '3 hours ago', read: true },
];

const stats = [
  { label: 'Active Clients', value: '156', change: '+12%', trend: 'up', icon: <Users className="w-5 h-5" /> },
  { label: 'Cases This Month', value: '47', change: '+8%', trend: 'up', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Pro Bono Hours', value: '342', change: '+15%', trend: 'up', icon: <Clock className="w-5 h-5" /> },
  { label: 'Resolution Rate', value: '87%', change: '+3%', trend: 'up', icon: <CheckCircle className="w-5 h-5" /> },
];

const aiMetrics = [
  { label: 'AI Case Matches', value: '89%', description: 'Successful attorney-case matches' },
  { label: 'Avg Resolution', value: '23 days', description: 'Faster than manual by 40%' },
  { label: 'Eligibility Checks', value: '412', description: 'Automated this month' },
  { label: 'Documents Generated', value: '156', description: 'Forms auto-filled' },
];

export default function LSODashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'attorneys' | 'reports' | 'ai-hub' | 'integrations' | 'impact' | 'hours' | 'outcomes' | 'demographics' | 'ai-metrics' | 'compliance' | 'report-gen' | 'case-matching' | 'audit-logs' | 'governance'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showPredictionPanel, setShowPredictionPanel] = useState(false);
  const [predictionClient, setPredictionClient] = useState<Client | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<{ attorney: Attorney | null; client: Client | null }>({ attorney: null, client: null });
  const [showDocGenModal, setShowDocGenModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClientPortalModal, setShowClientPortalModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showInviteAttorneyModal, setShowInviteAttorneyModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState<string | null>(null);
  const [showAttorneyProfileModal, setShowAttorneyProfileModal] = useState<Attorney | null>(null);
  const [showClientViewModal, setShowClientViewModal] = useState<Client | null>(null);
  const [filterOptions, setFilterOptions] = useState({ status: '', priority: '', attorney: '' });
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getClientPredictionInput = (client: Client): CasePredictionInput => ({
    caseType: client.caseType,
    jurisdiction: client.jurisdiction,
    urgencyLevel: client.priority === 'High' ? 'high' : client.priority === 'Medium' ? 'medium' : 'low',
    incomeEligible: true,
    hasDocumentation: client.hasDocumentation,
    documentationQuality: client.documentationQuality,
    hasOpposingCounsel: client.hasOpposingCounsel,
    attorneySpecialtyMatch: client.attorney !== 'Unassigned',
    attorneyYearsExperience: client.attorney !== 'Unassigned' ? 8 : 0,
  });

  const openPredictionForClient = (client: Client) => {
    setPredictionClient(client);
    setShowPredictionPanel(true);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const runAiMatching = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'ai',
        message: 'AI matched 2 unassigned cases to optimal attorneys',
        time: 'Just now',
        read: false
      }, ...prev]);
    }, 2000);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowExportModal(false);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'report',
        message: `Data exported successfully as ${exportFormat.toUpperCase()}`,
        time: 'Just now',
        read: false
      }, ...prev]);
    }, 1500);
  };

  const handleGenerateDoc = () => {
    if (!selectedDocType) return;
    setIsGeneratingDoc(true);
    setTimeout(() => {
      setIsGeneratingDoc(false);
      setShowDocGenModal(false);
      setSelectedDocType('');
      setNotifications(prev => [{
        id: Date.now(),
        type: 'case',
        message: `${selectedDocType} document generated successfully`,
        time: 'Just now',
        read: false
      }, ...prev]);
    }, 2000);
  };

  const handleAssignCase = () => {
    if (showAssignModal.attorney && showAssignModal.client) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'case',
        message: `${showAssignModal.client!.name}'s case assigned to ${showAssignModal.attorney!.name}`,
        time: 'Just now',
        read: false
      }, ...prev]);
      setShowAssignModal({ attorney: null, client: null });
    }
  };

  const filteredClients = mockClients.filter(client => {
    if (filterOptions.status && client.status !== filterOptions.status) return false;
    if (filterOptions.priority && client.priority !== filterOptions.priority) return false;
    if (filterOptions.attorney && client.attorney !== filterOptions.attorney) return false;
    if (searchTerm && !client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !client.matter.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-navy-100">
      <Navigation />

      <div className="pt-24 pb-4 bg-gradient-to-r from-teal-700 to-teal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">Arizona Legal Aid Society</h1>
                  <span className="bg-warning-400 text-navy-900 text-xs font-bold px-2 py-0.5 rounded">DEMO</span>
                </div>
                <p className="text-teal-100 text-sm">AI-Powered Organization Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  aria-expanded={showNotifications}
                  aria-haspopup="true"
                  className="relative bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:ring-white focus:ring-offset-teal-700"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-navy-200 z-50">
                    <div className="p-4 border-b border-navy-200 flex items-center justify-between">
                      <h2 className="font-bold text-navy-900">Notifications</h2>
                      <button onClick={markAllRead} className="text-xs text-teal-600 hover:text-teal-700 font-semibold">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-navy-100 hover:bg-navy-50 ${!notif.read ? 'bg-teal-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              notif.type === 'urgent' ? 'bg-error-500' :
                              notif.type === 'ai' ? 'bg-teal-500' :
                              notif.type === 'case' ? 'bg-teal-500' :
                              notif.type === 'attorney' ? 'bg-warning-500' :
                              'bg-navy-400'
                            }`} />
                            <div>
                              <p className={`text-sm ${!notif.read ? 'font-semibold text-navy-900' : 'text-navy-700'}`}>
                                {notif.message}
                              </p>
                              <p className="text-xs text-navy-400 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                aria-label="Open AI Assistant"
                aria-expanded={showAiAssistant}
                className="bg-gradient-to-r from-teal-500 to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg min-h-[44px] focus:ring-white focus:ring-offset-teal-700"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                AI Assistant
              </button>
              <Link
                to="/for-organizations"
                aria-label="Learn more about ezLegal.ai for organizations"
                className="bg-white hover:bg-teal-50 text-teal-700 px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors min-h-[44px]"
              >
                Learn More
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showAiAssistant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Brain className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">AI Legal Operations Assistant</h3>
                  <p className="text-sm text-teal-100">ezLegal.ai | by Legalbreeze®</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiAssistant(false)}
                aria-label="Close AI Assistant"
                className="text-white/80 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus:ring-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-navy-50 rounded-lg p-4">
                <p className="text-navy-700">
                  Hello! I can help you with case analysis, attorney matching, report generation, and operational insights. What would you like to know?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Which cases need immediate attention?',
                  'Match unassigned cases to attorneys',
                  'Generate grant impact summary',
                  'Predict case outcomes for pending matters'
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAiQuery(suggestion)}
                    className="text-left p-3 bg-teal-50 hover:bg-teal-100 rounded-lg text-sm text-teal-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask about cases, attorneys, or operations..."
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  aria-label="Send message to AI Assistant"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 min-w-[44px] min-h-[44px]"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPredictionPanel && predictionClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <div className="absolute -top-12 left-0 text-white">
              <p className="text-sm font-semibold">Outcome Prediction for: {predictionClient.name}</p>
              <p className="text-xs text-white/70">{predictionClient.matter}</p>
            </div>
            <OutcomePredictionPanel
              caseData={getClientPredictionInput(predictionClient)}
              onClose={() => {
                setShowPredictionPanel(false);
                setPredictionClient(null);
              }}
            />
          </div>
        </div>
      )}

      {showDocGenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-navy-700 to-navy-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <FileText className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Generate Legal Document</h3>
                  <p className="text-sm text-navy-300">AI-powered document generation</p>
                </div>
              </div>
              <button onClick={() => setShowDocGenModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Document Type</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select document type...</option>
                  <option value="Eviction Response">Eviction Response</option>
                  <option value="Wage Claim Form">Wage Claim Form</option>
                  <option value="Child Custody Motion">Child Custody Motion</option>
                  <option value="Debt Validation Letter">Debt Validation Letter</option>
                  <option value="Immigration Form I-130">Immigration Form I-130</option>
                  <option value="Small Claims Complaint">Small Claims Complaint</option>
                  <option value="Restraining Order Petition">Restraining Order Petition</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Select Client</label>
                <select className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                  <option value="">Select client...</option>
                  {mockClients.map(client => (
                    <option key={client.id} value={client.id}>{client.name} - {client.matter}</option>
                  ))}
                </select>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-teal-700">
                    <p className="font-semibold">AI will auto-fill document fields</p>
                    <p className="text-teal-600">Client data, case details, and jurisdiction-specific requirements will be populated automatically.</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDocGenModal(false)}
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateDoc}
                  disabled={!selectedDocType || isGeneratingDoc}
                  aria-busy={isGeneratingDoc}
                  aria-disabled={!selectedDocType || isGeneratingDoc}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 min-h-[48px] disabled:bg-navy-300 disabled:text-navy-500 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingDoc ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" aria-hidden="true" /> Generate Document</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-navy-700 to-navy-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Download className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Export Data</h3>
                  <p className="text-sm text-navy-300">Download case and client data</p>
                </div>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-3">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['csv', 'pdf', 'excel'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        exportFormat === format
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-navy-200 hover:border-navy-300'
                      }`}
                    >
                      <div className="font-bold uppercase">{format}</div>
                      <div className="text-xs text-navy-500">
                        {format === 'csv' && 'Spreadsheet'}
                        {format === 'pdf' && 'Document'}
                        {format === 'excel' && 'Excel File'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Data to Export</label>
                <div className="space-y-2">
                  {['All Clients', 'Active Cases', 'Pro Bono Hours', 'Attorney Assignments', 'Monthly Report'].map((option) => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg cursor-pointer hover:bg-navy-100">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded" />
                      <span className="text-sm text-navy-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  aria-busy={isExporting}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 min-h-[48px] disabled:bg-teal-400 transition-colors"
                >
                  {isExporting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> Exporting...</>
                  ) : (
                    <><Download className="w-4 h-4" aria-hidden="true" /> Export Data</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showClientPortalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-warning-600 to-warning-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <MessageSquare className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Client Portal</h3>
                  <p className="text-sm text-warning-100">Secure client communication</p>
                </div>
              </div>
              <button onClick={() => setShowClientPortalModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-navy-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-teal-600">12</div>
                  <div className="text-sm text-navy-500">Active Portals</div>
                </div>
                <div className="bg-navy-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-warning-600">5</div>
                  <div className="text-sm text-navy-500">Unread Messages</div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-navy-900">Recent Client Messages</h4>
                {mockClients.slice(0, 3).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-700 font-bold text-sm">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-navy-900 text-sm">{client.name}</div>
                        <div className="text-xs text-navy-500">{client.matter}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-navy-400" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowClientPortalModal(false)}
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Close
                </button>
                <button className="flex-1 bg-warning-600 hover:bg-warning-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Full Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-navy-700 to-navy-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Filter className="w-6 h-6" />
                <h3 className="font-bold">Filter Clients</h3>
              </div>
              <button onClick={() => setShowFilterModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Status</label>
                <select
                  value={filterOptions.status}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Closed - Resolved">Closed - Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Priority</label>
                <select
                  value={filterOptions.priority}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Assigned Attorney</label>
                <select
                  value={filterOptions.attorney}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, attorney: e.target.value }))}
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Attorneys</option>
                  <option value="Unassigned">Unassigned</option>
                  {mockAttorneys.map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setFilterOptions({ status: '', priority: '', attorney: '' });
                  }}
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInviteAttorneyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <UserCheck className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Invite Volunteer Attorney</h3>
                  <p className="text-sm text-teal-100">Add to your pro bono network</p>
                </div>
              </div>
              <button onClick={() => setShowInviteAttorneyModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="attorney@legalaid.org"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Practice Areas</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Housing', 'Family Law', 'Employment', 'Immigration', 'Consumer', 'Criminal'].map((area) => (
                    <label key={area} className="flex items-center gap-2 p-2 bg-navy-50 rounded cursor-pointer hover:bg-navy-100">
                      <input type="checkbox" className="w-4 h-4 text-teal-600 rounded" />
                      <span className="text-sm text-navy-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInviteAttorneyModal(false)}
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowInviteAttorneyModal(false);
                    setNotifications(prev => [{
                      id: Date.now(),
                      type: 'attorney',
                      message: 'Invitation sent to volunteer attorney',
                      time: 'Just now',
                      read: false
                    }, ...prev]);
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal.attorney && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Target className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Assign Case to {showAssignModal.attorney.name}</h3>
                  <p className="text-sm text-teal-100">Select a case to assign</p>
                </div>
              </div>
              <button onClick={() => setShowAssignModal({ attorney: null, client: null })} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <Brain className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-teal-900">AI Match Score: {showAssignModal.attorney.matchScore}%</p>
                    <p className="text-xs text-teal-700">Specialty: {showAssignModal.attorney.specialty}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Select Case</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {mockClients.filter(c => c.attorney === 'Unassigned' || c.status === 'Pending Review').map((client) => (
                    <label
                      key={client.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        showAssignModal.client?.id === client.id
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-navy-200 hover:border-teal-300 hover:bg-navy-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="client"
                        checked={showAssignModal.client?.id === client.id}
                        onChange={() => setShowAssignModal(prev => ({ ...prev, client }))}
                        className="w-4 h-4 text-teal-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-navy-900">{client.name}</div>
                        <div className="text-sm text-navy-500">{client.matter}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        client.priority === 'High' ? 'bg-error-100 text-error-700' :
                        client.priority === 'Medium' ? 'bg-warning-100 text-warning-700' :
                        'bg-navy-100 text-navy-600'
                      }`}>
                        {client.priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAssignModal({ attorney: null, client: null })}
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCase}
                  disabled={!showAssignModal.client}
                  aria-disabled={!showAssignModal.client}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 min-h-[48px] disabled:bg-navy-300 disabled:text-navy-500 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAttorneyProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6">
              <button onClick={() => setShowAttorneyProfileModal(null)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {showAttorneyProfileModal.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-bold">{showAttorneyProfileModal.name}</h3>
                  <p className="text-teal-100">{showAttorneyProfileModal.specialty}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-navy-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-navy-900">{showAttorneyProfileModal.cases}</div>
                  <div className="text-xs text-navy-500">Active Cases</div>
                </div>
                <div className="bg-navy-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-navy-900">{showAttorneyProfileModal.hours}</div>
                  <div className="text-xs text-navy-500">Hours MTD</div>
                </div>
                <div className="bg-navy-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-teal-600 flex items-center justify-center gap-1">
                    <Target className="w-4 h-4" />
                    {showAttorneyProfileModal.matchScore}%
                  </div>
                  <div className="text-xs text-navy-500">Match Score</div>
                </div>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-teal-900">AI Match Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-teal-200 rounded-full h-3">
                    <div
                      className="bg-teal-600 h-3 rounded-full"
                      style={{ width: `${showAttorneyProfileModal.matchScore}%` }}
                    />
                  </div>
                  <span className="font-bold text-teal-700">{showAttorneyProfileModal.matchScore}%</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAttorneyProfileModal(null)}
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowAttorneyProfileModal(null);
                    setShowAssignModal({ attorney: showAttorneyProfileModal, client: null });
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold"
                >
                  Assign Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showClientViewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Users className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">{showClientViewModal.name}</h3>
                  <p className="text-sm text-teal-100">{showClientViewModal.matter}</p>
                </div>
              </div>
              <button onClick={() => setShowClientViewModal(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-navy-500 uppercase tracking-wider">Status</label>
                  <p className="font-semibold text-navy-900">{showClientViewModal.status}</p>
                </div>
                <div>
                  <label className="text-xs text-navy-500 uppercase tracking-wider">Priority</label>
                  <p className="font-semibold text-navy-900">{showClientViewModal.priority}</p>
                </div>
                <div>
                  <label className="text-xs text-navy-500 uppercase tracking-wider">Assigned Attorney</label>
                  <p className="font-semibold text-navy-900">{showClientViewModal.attorney}</p>
                </div>
                <div>
                  <label className="text-xs text-navy-500 uppercase tracking-wider">Intake Date</label>
                  <p className="font-semibold text-navy-900">{showClientViewModal.intake}</p>
                </div>
                <div>
                  <label className="text-xs text-navy-500 uppercase tracking-wider">Case Type</label>
                  <p className="font-semibold text-navy-900 capitalize">{showClientViewModal.caseType}</p>
                </div>
                <div>
                  <label className="text-xs text-navy-500 uppercase tracking-wider">Jurisdiction</label>
                  <p className="font-semibold text-navy-900">{showClientViewModal.jurisdiction}</p>
                </div>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-teal-900">AI Case Analysis</span>
                  <span className="ml-auto bg-teal-600 text-white text-xs px-2 py-0.5 rounded font-bold">Score: {showClientViewModal.aiScore}</span>
                </div>
                <p className="text-sm text-teal-700">{showClientViewModal.aiInsight}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClientViewModal(null)}
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowClientViewModal(null);
                    openPredictionForClient(showClientViewModal);
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Full Prediction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showIntegrationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <RefreshCw className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Connect {showIntegrationModal}</h3>
                  <p className="text-sm text-teal-100">Configure integration settings</p>
                </div>
              </div>
              <button onClick={() => setShowIntegrationModal(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-700">
                  Connecting to {showIntegrationModal} will enable bi-directional data sync, automated case transfers, and real-time notifications.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">API Key</label>
                <input
                  type="password"
                  placeholder="Enter your API key"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Organization ID</label>
                <input
                  type="text"
                  placeholder="Enter your organization ID"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowIntegrationModal(null)}
                  className="flex-1 px-4 py-3 border border-navy-300 rounded-lg font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowIntegrationModal(null);
                    setNotifications(prev => [{
                      id: Date.now(),
                      type: 'case',
                      message: `${showIntegrationModal} integration configured successfully`,
                      time: 'Just now',
                      read: false
                    }, ...prev]);
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border border-navy-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-navy-400 uppercase tracking-wider font-semibold px-2 py-1 self-center">Operations</span>
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" />, highlight: false },
              { id: 'case-matching', label: 'AI Matching', icon: <Target className="w-4 h-4" />, highlight: true },
              { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" />, highlight: false },
              { id: 'attorneys', label: 'Attorneys', icon: <UserCheck className="w-4 h-4" />, highlight: false },
              { id: 'ai-hub', label: 'AI Hub', icon: <Brain className="w-4 h-4" />, highlight: false },
              { id: 'integrations', label: 'Integrations', icon: <RefreshCw className="w-4 h-4" />, highlight: false }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
                    : tab.highlight
                      ? 'bg-gradient-to-r from-teal-50 to-teal-50 text-teal-700 border border-teal-300 hover:from-teal-100 hover:to-teal-100'
                      : 'text-navy-600 hover:bg-navy-100'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.highlight && activeTab !== tab.id && (
                  <span className="bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">NEW</span>
                )}
              </button>
            ))}
          </div>
          <div className="w-px bg-navy-200 mx-2 hidden lg:block" />
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-navy-400 uppercase tracking-wider font-semibold px-2 py-1 self-center">Analytics</span>
            {[
              { id: 'impact', label: 'Impact', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'hours', label: 'Pro Bono Hours', icon: <Clock className="w-4 h-4" /> },
              { id: 'outcomes', label: 'Outcomes', icon: <CheckCircle className="w-4 h-4" /> },
              { id: 'demographics', label: 'Demographics', icon: <PieChart className="w-4 h-4" /> },
              { id: 'ai-metrics', label: 'AI Metrics', icon: <Activity className="w-4 h-4" /> },
              { id: 'compliance', label: 'Compliance', icon: <Shield className="w-4 h-4" /> },
              { id: 'report-gen', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
              { id: 'audit-logs', label: 'Audit Logs', icon: <Activity className="w-4 h-4" /> },
              { id: 'governance', label: 'Governance', icon: <Shield className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
                    : 'text-navy-600 hover:bg-navy-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-navy-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-success-600' : 'text-error-600'
                    }`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-navy-900">{stat.value}</div>
                  <div className="text-sm text-navy-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-teal-600 to-teal-600 rounded-xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI-Powered Operations</h3>
                    <p className="text-teal-100 text-sm">Intelligent automation for your legal aid program</p>
                  </div>
                </div>
                <button
                  onClick={runAiMatching}
                  disabled={isAiProcessing}
                  aria-busy={isAiProcessing}
                  aria-label={isAiProcessing ? 'AI matching in progress' : 'Run AI case matching'}
                  className="bg-white hover:bg-teal-50 text-teal-700 px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors min-h-[44px] disabled:bg-white/70 disabled:text-teal-400"
                >
                  {isAiProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" aria-hidden="true" />
                      Run AI Matching
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {aiMetrics.map((metric, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-sm text-teal-100">{metric.label}</div>
                    <div className="text-xs text-teal-200 mt-1">{metric.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-navy-200">
                <div className="p-5 border-b border-navy-200 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-navy-900">Priority Cases</h2>
                    <p className="text-sm text-navy-500">AI-ranked by urgency and success probability</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className="text-teal-600 hover:text-teal-700 text-sm font-semibold flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-navy-100">
                  {mockClients.slice(0, 4).map((client) => (
                    <div
                      key={client.id}
                      className="p-4 hover:bg-navy-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            (client.aiScore || 0) >= 85 ? 'bg-success-100 text-success-600' :
                            (client.aiScore || 0) >= 70 ? 'bg-warning-100 text-warning-600' :
                            'bg-navy-100 text-navy-600'
                          }`}>
                            <span className="font-bold text-sm">{client.aiScore}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-navy-900">{client.name}</div>
                            <div className="text-sm text-navy-500">{client.matter}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            client.status === 'Active' ? 'bg-success-100 text-success-700' :
                            client.status === 'Pending Review' ? 'bg-warning-100 text-warning-700' :
                            'bg-navy-100 text-navy-600'
                          }`}>
                            {client.status}
                          </span>
                          <div className="text-xs text-navy-400 mt-1">{client.intake}</div>
                        </div>
                      </div>
                      {selectedClient?.id === client.id && (
                        <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-100">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <Brain className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-teal-900">AI Insight</p>
                                <p className="text-sm text-teal-700 mt-1">{client.aiInsight}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPredictionForClient(client);
                              }}
                              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              Full Prediction
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-navy-200">
                  <div className="p-5 border-b border-navy-200">
                    <h2 className="font-bold text-navy-900">Real-Time Activity</h2>
                  </div>
                  <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
                    {notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notif.type === 'urgent' ? 'bg-error-500' :
                          notif.type === 'ai' ? 'bg-teal-500' :
                          notif.type === 'case' ? 'bg-teal-500' :
                          notif.type === 'attorney' ? 'bg-warning-500' :
                          'bg-navy-400'
                        }`} />
                        <div>
                          <p className="text-sm text-navy-700">{notif.message}</p>
                          <p className="text-xs text-navy-400">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl shadow-sm p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-xl mb-1">Monthly Impact</h2>
                      <p className="text-teal-100 text-sm">January 2026</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">847</div>
                      <div className="text-xs text-teal-200">Clients Served</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">$127K</div>
                      <div className="text-xs text-teal-200">Value of Services</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full bg-white hover:bg-teal-50 text-teal-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-navy-900">Available Volunteer Attorneys</h2>
                  <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded">AI-Scored</span>
                </div>
                <div className="space-y-3">
                  {mockAttorneys.filter(a => a.available).map((attorney) => (
                    <div key={attorney.id} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-700 font-bold text-sm">
                              {attorney.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {attorney.matchScore}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-navy-900">{attorney.name}</div>
                          <div className="text-xs text-navy-500">{attorney.specialty}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${attorney.available ? 'bg-teal-100 text-teal-700' : 'bg-stone-100 text-stone-600'}`}>
                          {attorney.available ? 'Available' : 'Busy'}
                        </span>
                        <button
                          onClick={() => setShowAssignModal({ attorney, client: null })}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-5">
                <h2 className="font-bold text-navy-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('case-matching')}
                    className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-lg font-semibold text-sm flex items-center gap-3 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    New Intake
                  </button>
                  <button
                    onClick={() => setActiveTab('case-matching')}
                    className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-lg font-semibold text-sm flex items-center gap-3 transition-colors"
                  >
                    <Target className="w-5 h-5" />
                    AI Match Cases
                  </button>
                  <button
                    onClick={() => setShowDocGenModal(true)}
                    className="bg-navy-600 hover:bg-navy-700 text-white p-4 rounded-lg font-semibold text-sm flex items-center gap-3 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    Generate Docs
                  </button>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="bg-navy-600 hover:bg-navy-700 text-white p-4 rounded-lg font-semibold text-sm flex items-center gap-3 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Export Data
                  </button>
                  <button
                    onClick={() => setShowClientPortalModal(true)}
                    className="bg-warning-600 hover:bg-warning-700 text-white p-4 rounded-lg font-semibold text-sm flex items-center gap-3 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Client Portal
                  </button>
                  <Link
                    to="/grant-reporting"
                    className="bg-success-600 hover:bg-success-700 text-white p-4 rounded-lg font-semibold text-sm flex items-center gap-3 transition-colors"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Grant Report
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl shadow-sm border border-navy-200">
            <div className="p-5 border-b border-navy-200 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-bold text-navy-900 text-lg">Client Management</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-navy-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    filterOptions.status || filterOptions.priority || filterOptions.attorney
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-navy-300 text-navy-600 hover:bg-navy-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  {(filterOptions.status || filterOptions.priority || filterOptions.attorney) && (
                    <span className="bg-teal-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {[filterOptions.status, filterOptions.priority, filterOptions.attorney].filter(Boolean).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('case-matching')}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Intake
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-50 text-left">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">AI Score</th>
                    <th className="px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Client</th>
                    <th className="px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Matter</th>
                    <th className="px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Attorney</th>
                    <th className="px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Priority</th>
                    <th className="px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-navy-50">
                      <td className="px-5 py-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          (client.aiScore || 0) >= 85 ? 'bg-success-100 text-success-700' :
                          (client.aiScore || 0) >= 70 ? 'bg-warning-100 text-warning-700' :
                          'bg-navy-100 text-navy-600'
                        }`}>
                          <span className="font-bold text-sm">{client.aiScore}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-navy-900">{client.name}</div>
                        <div className="text-xs text-navy-500">Intake: {client.intake}</div>
                      </td>
                      <td className="px-5 py-4 text-navy-700">{client.matter}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          client.status === 'Active' ? 'bg-success-100 text-success-700' :
                          client.status === 'Pending Review' ? 'bg-warning-100 text-warning-700' :
                          'bg-navy-100 text-navy-600'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-navy-700">{client.attorney}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          client.priority === 'High' ? 'bg-error-100 text-error-700' :
                          client.priority === 'Medium' ? 'bg-warning-100 text-warning-700' :
                          'bg-navy-100 text-navy-600'
                        }`}>
                          {client.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowClientViewModal(client)}
                            aria-label={`View details for ${client.name}`}
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-semibold text-sm flex items-center justify-center rounded-lg min-w-[40px] min-h-[40px] transition-colors"
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => openPredictionForClient(client)}
                            aria-label={`Run outcome prediction for ${client.name}`}
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 flex items-center justify-center rounded-lg min-w-[40px] min-h-[40px] transition-colors"
                          >
                            <Brain className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'attorneys' && (
          <div className="bg-white rounded-xl shadow-sm border border-navy-200">
            <div className="p-5 border-b border-navy-200 flex items-center justify-between">
              <h2 className="font-bold text-navy-900 text-lg">Volunteer Attorney Network</h2>
              <button
                onClick={() => setShowInviteAttorneyModal(true)}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Invite Attorney
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-5">
              {mockAttorneys.map((attorney) => (
                <div key={attorney.id} className="border border-navy-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-700 font-bold">
                            {attorney.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                          {attorney.matchScore}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-navy-900">{attorney.name}</div>
                        <div className="text-sm text-navy-500">{attorney.specialty}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      attorney.available ? 'bg-success-100 text-success-700' : 'bg-navy-100 text-navy-600'
                    }`}>
                      {attorney.available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center py-3 border-y border-navy-100">
                    <div>
                      <div className="text-xl font-bold text-navy-900">{attorney.cases}</div>
                      <div className="text-xs text-navy-500">Active Cases</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-navy-900">{attorney.hours}</div>
                      <div className="text-xs text-navy-500">Hours (MTD)</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-teal-600 flex items-center justify-center gap-1">
                        <Target className="w-4 h-4" />
                        {attorney.matchScore}%
                      </div>
                      <div className="text-xs text-navy-500">Match Score</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowAssignModal({ attorney, client: null })}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Assign Case
                    </button>
                    <button
                      onClick={() => setShowAttorneyProfileModal(attorney)}
                      className="px-4 py-2 border border-navy-300 rounded-lg text-sm font-medium text-navy-600 hover:bg-navy-50"
                    >
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai-hub' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-600 to-teal-600 rounded-xl p-8 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-10 h-10" />
                    <div>
                      <h2 className="text-2xl font-bold">AI Operations Hub</h2>
                      <p className="text-teal-100">Intelligent automation for legal aid operations</p>
                    </div>
                  </div>
                  <p className="text-teal-50 max-w-2xl">
                    Our AI continuously analyzes your cases, matches attorneys, predicts outcomes, and generates insights to help you serve more clients effectively.
                  </p>
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <div className="text-4xl font-bold">89%</div>
                  <div className="text-sm text-teal-100">AI Accuracy</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Target className="w-6 h-6" />, title: 'Smart Case Matching', desc: 'AI matches cases to optimal attorneys', stat: 'Active', color: 'bg-teal-600', action: () => setActiveTab('case-matching') },
                { icon: <Activity className="w-6 h-6" />, title: 'Outcome Analysis', desc: 'Case success probability insights', stat: 'Enabled', color: 'bg-teal-600', action: () => mockClients[0] && openPredictionForClient(mockClients[0]) },
                { icon: <FileText className="w-6 h-6" />, title: 'Document Generation', desc: 'Auto-fill forms with client data', stat: 'Ready', color: 'bg-success-600', action: () => setShowDocGenModal(true) },
                { icon: <Sparkles className="w-6 h-6" />, title: 'Eligibility Screening', desc: 'Instant poverty guideline checks', stat: 'Automated', color: 'bg-warning-600', action: () => setActiveTab('case-matching') },
              ].map((feature, idx) => (
                <button
                  key={idx}
                  onClick={feature.action}
                  className="bg-white rounded-xl p-5 border border-navy-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all text-left group"
                >
                  <div className={`${feature.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-navy-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-navy-600 mb-3">{feature.desc}</p>
                  <div className="text-lg font-bold text-teal-600">{feature.stat}</div>
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-navy-200 shadow-sm">
                <div className="p-5 border-b border-navy-200">
                  <h3 className="font-bold text-navy-900">AI Case Analysis Queue</h3>
                  <p className="text-sm text-navy-500">Cases pending AI review and matching</p>
                </div>
                <div className="p-5 space-y-3">
                  {mockClients.filter(c => c.status === 'Pending Review').map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-navy-900">{client.name}</div>
                        <div className="text-sm text-navy-500">{client.matter}</div>
                      </div>
                      <button
                        onClick={() => openPredictionForClient(client)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Brain className="w-4 h-4" />
                        Analyze
                      </button>
                    </div>
                  ))}
                  {mockClients.filter(c => c.status === 'Pending Review').length === 0 && (
                    <div className="text-center py-8 text-navy-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success-500" />
                      <p>All cases have been analyzed!</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-navy-200 shadow-sm">
                <div className="p-5 border-b border-navy-200">
                  <h3 className="font-bold text-navy-900">AI Insights</h3>
                  <p className="text-sm text-navy-500">Recent AI-generated recommendations</p>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { type: 'optimization', text: '3 housing cases could be consolidated for efficiency', icon: <TrendingUp className="w-5 h-5" /> },
                    { type: 'alert', text: 'Immigration case deadline approaching - prioritize Carlos Rivera assignment', icon: <AlertCircle className="w-5 h-5" /> },
                    { type: 'success', text: 'Attorney match accuracy improved 5% this month', icon: <CheckCircle className="w-5 h-5" /> },
                    { type: 'suggestion', text: 'Consider recruiting employment law specialists - high demand detected', icon: <Sparkles className="w-5 h-5" /> },
                  ].map((insight, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${
                      insight.type === 'alert' ? 'bg-warning-50 border border-warning-200' :
                      insight.type === 'success' ? 'bg-success-50 border border-success-200' :
                      'bg-teal-50 border border-teal-200'
                    }`}>
                      <div className={`${
                        insight.type === 'alert' ? 'text-warning-600' :
                        insight.type === 'success' ? 'text-success-600' :
                        'text-teal-600'
                      }`}>
                        {insight.icon}
                      </div>
                      <p className="text-sm text-navy-700">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-navy-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-navy-900 mb-2">Case Management Integrations</h2>
              <p className="text-navy-600 mb-6">Connect your existing systems for seamless data synchronization</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'LegalServer', status: 'available', desc: 'Bi-directional sync with LegalServer CMS', logo: <Scale className="w-8 h-8" /> },
                  { name: 'Salesforce', status: 'available', desc: 'Connect to Salesforce nonprofit cloud', logo: <Building2 className="w-8 h-8" /> },
                  { name: 'Clio', status: 'coming', desc: 'Practice management integration', logo: <Briefcase className="w-8 h-8" /> },
                  { name: 'Case Manager Pro', status: 'available', desc: 'Import/export case data', logo: <FileText className="w-8 h-8" /> },
                  { name: 'Google Workspace', status: 'connected', desc: 'Calendar and document sync', logo: <Calendar className="w-8 h-8" /> },
                  { name: 'Microsoft 365', status: 'available', desc: 'Teams and Outlook integration', logo: <Mail className="w-8 h-8" /> },
                ].map((integration, idx) => (
                  <div key={idx} className="border border-navy-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-navy-100 text-navy-600 p-3 rounded-lg">
                        {integration.logo}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        integration.status === 'connected' ? 'bg-success-100 text-success-700' :
                        integration.status === 'available' ? 'bg-teal-100 text-teal-700' :
                        'bg-navy-100 text-navy-600'
                      }`}>
                        {integration.status === 'connected' ? 'Connected' :
                         integration.status === 'available' ? 'Available' : 'Coming Soon'}
                      </span>
                    </div>
                    <h3 className="font-bold text-navy-900 mb-1">{integration.name}</h3>
                    <p className="text-sm text-navy-600 mb-4">{integration.desc}</p>
                    <button
                      onClick={() => {
                        if (integration.status !== 'coming') {
                          setShowIntegrationModal(integration.name);
                        }
                      }}
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                        integration.status === 'connected'
                          ? 'bg-success-100 text-success-700 hover:bg-success-200'
                          : integration.status === 'available'
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-navy-100 text-navy-400 cursor-not-allowed'
                      }`}
                    >
                      {integration.status === 'connected' ? 'Manage' :
                       integration.status === 'available' ? 'Connect' : 'Notify Me'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-teal-50 rounded-xl border border-teal-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 text-teal-600 p-3 rounded-lg">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-navy-900 text-lg mb-1">LegalServer Integration</h3>
                  <p className="text-navy-600 mb-4">
                    Our LegalServer integration provides bi-directional sync that surpasses standard integrations. Transfer cases with one click, automatically sync volunteer placements, and receive real-time notifications.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-teal-200">
                      <div className="text-2xl font-bold text-teal-600">1-Click</div>
                      <div className="text-sm text-navy-600">Case Transfer</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-teal-200">
                      <div className="text-2xl font-bold text-teal-600">Real-Time</div>
                      <div className="text-sm text-navy-600">Data Sync</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-teal-200">
                      <div className="text-2xl font-bold text-teal-600">AI-Enhanced</div>
                      <div className="text-sm text-navy-600">Data Analysis</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowIntegrationModal('LegalServer')}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Configure LegalServer Integration
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-navy-200 shadow-sm p-6">
              <h3 className="font-bold text-navy-900 mb-4">API Access</h3>
              <p className="text-navy-600 mb-4">
                Build custom integrations with our RESTful API. Full documentation available for Professional and Enterprise plans.
              </p>
              <div className="bg-navy-900 rounded-lg p-4 font-mono text-sm text-navy-300 mb-4">
                <div className="text-success-400">// Example API Request</div>
                <div>curl -X GET https://api.ezlegal.ai/v1/cases \</div>
                <div className="pl-4">-H "Authorization: Bearer YOUR_API_KEY"</div>
              </div>
              <button
                onClick={() => {
                  setNotifications(prev => [{
                    id: Date.now(),
                    type: 'case',
                    message: 'API documentation opened in new tab',
                    time: 'Just now',
                    read: false
                  }, ...prev]);
                }}
                className="bg-navy-900 hover:bg-navy-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View API Documentation
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-success-600 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">AI-Powered Grant Reporting</h2>
                  <p className="text-success-100">Generate comprehensive, funder-ready reports with one click</p>
                </div>
                <button className="bg-white hover:bg-success-50 text-success-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                  <Sparkles className="w-5 h-5" />
                  Generate AI Report
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: <BarChart3 className="w-5 h-5" />, title: 'Monthly Impact', desc: 'Comprehensive monthly summary for grant reporting.', color: 'bg-teal-100 text-teal-600' },
                { icon: <Clock className="w-5 h-5" />, title: 'Pro Bono Hours', desc: 'Attorney volunteer hours and case assignments.', color: 'bg-warning-100 text-warning-600' },
                { icon: <TrendingUp className="w-5 h-5" />, title: 'Outcomes Analysis', desc: 'Case resolution rates and client outcomes.', color: 'bg-success-100 text-success-600' },
                { icon: <Users className="w-5 h-5" />, title: 'Demographics', desc: 'Client demographics and service distribution.', color: 'bg-teal-100 text-teal-600' },
                { icon: <Target className="w-5 h-5" />, title: 'AI Performance', desc: 'AI matching accuracy and automation metrics.', color: 'bg-navy-100 text-navy-600' },
                { icon: <Shield className="w-5 h-5" />, title: 'Compliance', desc: 'Audit trail and data integrity reports.', color: 'bg-error-100 text-error-600' },
              ].map((report, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-navy-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`${report.color} p-2 rounded-lg`}>
                      {report.icon}
                    </div>
                    <h3 className="font-bold text-navy-900">{report.title}</h3>
                  </div>
                  <p className="text-sm text-navy-600 mb-3">{report.desc}</p>
                  <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-semibold">
                    <Download className="w-4 h-4" />
                    Generate Report
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6">
              <h2 className="font-bold text-navy-900 text-lg mb-4">Recent Reports</h2>
              <div className="space-y-3">
                {[
                  { name: 'January 2026 Impact Report', date: 'Jan 8, 2026', type: 'Monthly', aiGenerated: true },
                  { name: 'Q4 2025 Grant Summary', date: 'Jan 2, 2026', type: 'Quarterly', aiGenerated: true },
                  { name: 'December 2025 Pro Bono Hours', date: 'Dec 31, 2025', type: 'Monthly', aiGenerated: false },
                  { name: 'Annual Report 2025', date: 'Dec 28, 2025', type: 'Annual', aiGenerated: true },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-navy-400" />
                      <div>
                        <div className="font-semibold text-navy-900 flex items-center gap-2">
                          {report.name}
                          {report.aiGenerated && (
                            <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-navy-500">{report.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-navy-500 bg-white px-2 py-1 rounded border border-navy-200">
                        {report.type}
                      </span>
                      <button className="text-teal-600 hover:text-teal-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'impact' && <MonthlyImpactDashboard />}
        {activeTab === 'hours' && <ProBonoHoursDashboard />}
        {activeTab === 'outcomes' && <OutcomesAnalysisDashboard />}
        {activeTab === 'demographics' && <DemographicsDashboard />}
        {activeTab === 'ai-metrics' && <AIPerformanceDashboard />}
        {activeTab === 'compliance' && <ComplianceDashboard />}
        {activeTab === 'report-gen' && <ReportGeneratorDashboard />}
        {activeTab === 'case-matching' && <AICaseMatchingDashboard />}
        {activeTab === 'audit-logs' && <AuditLogsDashboard />}
        {activeTab === 'governance' && <LSOGovernanceDisclosures embedded />}

        <div className="mt-8 bg-gradient-to-r from-warning-50 to-teal-50 border border-warning-200 rounded-xl p-6 text-center">
          <h3 className="font-bold text-navy-900 text-lg mb-2">This is a Demo Dashboard</h3>
          <p className="text-navy-600 mb-4">Ready to transform how your organization delivers legal aid with AI?</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/for-organizations"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
            >
              View Pricing & Features
            </Link>
            <a
              href="mailto:partners@ezlegal.ai"
              className="bg-white hover:bg-navy-50 text-navy-700 px-6 py-2.5 rounded-lg font-semibold border border-navy-300 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
