import { useState, useEffect } from 'react';
import {
  Brain, Target, Users, Clock, CheckCircle, X,
  Filter, Search, TrendingUp,
  PlusCircle, Sparkles, Award, ArrowRight, Loader2,
  ThumbsUp, ThumbsDown, MessageSquare, BarChart3, MapPin, Briefcase
} from 'lucide-react';
import CaseIntakeForm from './CaseIntakeForm';
import LawyerProfileModal from './LawyerProfileModal';
import { arizonaLawyers, type LawyerProfile } from '../data/arizonaLawyers';

interface CaseQueueItem {
  id: string;
  clientName: string;
  caseType: string;
  caseDescription: string;
  urgencyLevel: string;
  complexityScore: number;
  matchingStatus: string;
  createdAt: string;
  assignedAttorneyName?: string;
}

interface MatchResult {
  matchId: string;
  attorneyId: string;
  attorneyName: string;
  confidenceScore: number;
  rankPosition: number;
  expertiseScore: number;
  availabilityScore: number;
  status: string;
  lawyer?: LawyerProfile;
}

interface MatchingStats {
  totalCases: number;
  pendingCases: number;
  matchedCases: number;
  avgConfidenceScore: number;
  matchAccuracyRate: number;
  avgTimeToMatch: number;
}

const DEMO_ORG_ID = 'demo-org-id';

const mockCases: CaseQueueItem[] = [
  {
    id: '1',
    clientName: 'Maria Garcia',
    caseType: 'housing',
    caseDescription: 'Facing eviction due to alleged lease violation. Landlord claims unauthorized occupant.',
    urgencyLevel: 'critical',
    complexityScore: 75,
    matchingStatus: 'pending',
    createdAt: '2026-01-14T10:30:00Z',
  },
  {
    id: '2',
    clientName: 'Robert Chen',
    caseType: 'employment',
    caseDescription: 'Unpaid wages claim against former employer for 3 months of work.',
    urgencyLevel: 'high',
    complexityScore: 55,
    matchingStatus: 'matched',
    createdAt: '2026-01-13T14:20:00Z',
    assignedAttorneyName: 'Ali J. Farhang',
  },
  {
    id: '3',
    clientName: 'Sarah Johnson',
    caseType: 'family',
    caseDescription: 'Custody modification request due to relocation for employment.',
    urgencyLevel: 'normal',
    complexityScore: 80,
    matchingStatus: 'pending',
    createdAt: '2026-01-12T09:15:00Z',
  },
  {
    id: '4',
    clientName: 'David Smith',
    caseType: 'consumer',
    caseDescription: 'Debt collection harassment and potential FDCPA violations.',
    urgencyLevel: 'normal',
    complexityScore: 45,
    matchingStatus: 'in_progress',
    createdAt: '2026-01-11T16:45:00Z',
  },
  {
    id: '5',
    clientName: 'Jennifer Martinez',
    caseType: 'immigration',
    caseDescription: 'Visa renewal complications and work authorization issues.',
    urgencyLevel: 'high',
    complexityScore: 65,
    matchingStatus: 'pending',
    createdAt: '2026-01-10T11:00:00Z',
  },
  {
    id: '6',
    clientName: 'Michael Torres',
    caseType: 'personal_injury',
    caseDescription: 'Auto accident with serious injuries, insurance dispute.',
    urgencyLevel: 'critical',
    complexityScore: 85,
    matchingStatus: 'matched',
    createdAt: '2026-01-09T08:30:00Z',
    assignedAttorneyName: 'Kevin Moore',
  },
];

const mockMatches: Record<string, MatchResult[]> = {
  '1': [
    { matchId: 'm1', attorneyId: 'darren-clausen', attorneyName: 'Darren Clausen', confidenceScore: 94, rankPosition: 1, expertiseScore: 98, availabilityScore: 85, status: 'proposed', lawyer: arizonaLawyers.find(l => l.id === 'darren-clausen') },
    { matchId: 'm2', attorneyId: 'ali-farhang', attorneyName: 'Ali J. Farhang', confidenceScore: 87, rankPosition: 2, expertiseScore: 82, availabilityScore: 90, status: 'proposed', lawyer: arizonaLawyers.find(l => l.id === 'ali-farhang') },
    { matchId: 'm3', attorneyId: 'thomas-norton', attorneyName: 'Thomas Norton', confidenceScore: 78, rankPosition: 3, expertiseScore: 75, availabilityScore: 80, status: 'proposed', lawyer: arizonaLawyers.find(l => l.id === 'thomas-norton') },
  ],
  '3': [
    { matchId: 'm4', attorneyId: 'colleen-contreras', attorneyName: 'Colleen Contreras', confidenceScore: 96, rankPosition: 1, expertiseScore: 98, availabilityScore: 92, status: 'proposed', lawyer: arizonaLawyers.find(l => l.id === 'colleen-contreras') },
    { matchId: 'm5', attorneyId: 'thomas-norton', attorneyName: 'Thomas Norton', confidenceScore: 85, rankPosition: 2, expertiseScore: 88, availabilityScore: 78, status: 'proposed', lawyer: arizonaLawyers.find(l => l.id === 'thomas-norton') },
  ],
  '4': [
    { matchId: 'm6', attorneyId: 'ali-farhang', attorneyName: 'Ali J. Farhang', confidenceScore: 91, rankPosition: 1, expertiseScore: 95, availabilityScore: 82, status: 'proposed', lawyer: arizonaLawyers.find(l => l.id === 'ali-farhang') },
  ],
  '5': [
    { matchId: 'm7', attorneyId: 'tiffney-johnson', attorneyName: 'Tiffney Johnson', confidenceScore: 98, rankPosition: 1, expertiseScore: 99, availabilityScore: 95, status: 'proposed', lawyer: arizonaLawyers.find(l => l.id === 'tiffney-johnson') },
  ],
};

const mockStats: MatchingStats = {
  totalCases: 156,
  pendingCases: 12,
  matchedCases: 144,
  avgConfidenceScore: 89,
  matchAccuracyRate: 94,
  avgTimeToMatch: 2.4,
};

export default function AICaseMatchingDashboard() {
  const [activeView, setActiveView] = useState<'queue' | 'matches' | 'attorneys' | 'analytics'>('queue');
  const [cases, setCases] = useState<CaseQueueItem[]>(mockCases);
  const [selectedCase, setSelectedCase] = useState<CaseQueueItem | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [stats] = useState<MatchingStats>(mockStats);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [isRunningMatch, setIsRunningMatch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);

  useEffect(() => {
    if (selectedCase && mockMatches[selectedCase.id]) {
      setMatches(mockMatches[selectedCase.id]);
    } else {
      setMatches([]);
    }
  }, [selectedCase]);

  const runAIMatching = async (caseId: string) => {
    setIsRunningMatch(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    setCases(prev => prev.map(c =>
      c.id === caseId ? { ...c, matchingStatus: 'matched' } : c
    ));

    if (selectedCase?.id === caseId) {
      setMatches(mockMatches['1'] || []);
    }

    setIsRunningMatch(false);
  };

  const acceptMatch = (matchId: string) => {
    setMatches(prev => prev.map(m =>
      m.matchId === matchId
        ? { ...m, status: 'accepted' }
        : m.matchId !== matchId && m.status === 'proposed'
          ? { ...m, status: 'cancelled' }
          : m
    ));

    if (selectedCase) {
      const acceptedMatch = matches.find(m => m.matchId === matchId);
      setCases(prev => prev.map(c =>
        c.id === selectedCase.id
          ? { ...c, matchingStatus: 'matched', assignedAttorneyName: acceptedMatch?.attorneyName }
          : c
      ));
    }
  };

  const declineMatch = (matchId: string) => {
    setMatches(prev => prev.map(m =>
      m.matchId === matchId ? { ...m, status: 'declined' } : m
    ));
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.matchingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCaseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      housing: 'Housing & Eviction',
      employment: 'Employment',
      family: 'Family Law',
      consumer: 'Consumer & Debt',
      immigration: 'Immigration',
      personal_injury: 'Personal Injury',
    };
    return labels[type] || type;
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-error-100 text-error-700 border-error-300',
      high: 'bg-warning-100 text-warning-700 border-warning-300',
      normal: 'bg-blue-100 text-blue-700 border-blue-300',
      low: 'bg-stone-100 text-stone-600 border-stone-300',
    };
    return colors[urgency] || 'bg-stone-100 text-stone-600';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning-100 text-warning-700',
      in_progress: 'bg-blue-100 text-blue-700',
      matched: 'bg-success-100 text-success-700',
      no_match: 'bg-error-100 text-error-700',
    };
    return colors[status] || 'bg-stone-100 text-stone-600';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-success-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  if (showIntakeForm) {
    return (
      <div className="p-6">
        <CaseIntakeForm
          organizationId={DEMO_ORG_ID}
          onSuccess={(caseId) => {
            setShowIntakeForm(false);
            setCases(prev => [{
              id: caseId,
              clientName: 'New Client',
              caseType: 'housing',
              caseDescription: 'New case submitted',
              urgencyLevel: 'normal',
              complexityScore: 50,
              matchingStatus: 'pending',
              createdAt: new Date().toISOString(),
            }, ...prev]);
          }}
          onCancel={() => setShowIntakeForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI + Lawyer Match</h2>
              <p className="text-blue-100">Intelligent attorney-case pairing powered by machine learning</p>
            </div>
          </div>
          <button
            onClick={() => setShowIntakeForm(true)}
            className="bg-white hover:bg-blue-50 text-blue-700 px-5 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            New Case Intake
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.totalCases}</div>
            <div className="text-sm text-blue-100">Total Cases</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.pendingCases}</div>
            <div className="text-sm text-blue-100">Pending Match</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.matchedCases}</div>
            <div className="text-sm text-blue-100">Matched</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.avgConfidenceScore}%</div>
            <div className="text-sm text-blue-100">Avg Confidence</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.matchAccuracyRate}%</div>
            <div className="text-sm text-blue-100">Accuracy Rate</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.avgTimeToMatch}h</div>
            <div className="text-sm text-blue-100">Avg Match Time</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-stone-100 rounded-lg w-fit">
        {[
          { id: 'queue', label: 'Case Queue', icon: <Target className="w-4 h-4" /> },
          { id: 'matches', label: 'Match Review', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'attorneys', label: 'Attorney Pool', icon: <Users className="w-4 h-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as typeof activeView)}
            className={`px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 transition-all ${
              activeView === tab.id
                ? 'bg-white text-teal-700 shadow'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeView === 'queue' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="p-4 border-b border-stone-200">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search cases..."
                    className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="matched">Matched</option>
                </select>
                <button className="flex items-center gap-2 px-3 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50">
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {filteredCases.map(caseItem => (
                <div
                  key={caseItem.id}
                  onClick={() => setSelectedCase(caseItem)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedCase?.id === caseItem.id
                      ? 'bg-teal-50 border-l-4 border-l-teal-500'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-stone-900">{caseItem.clientName}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getUrgencyColor(caseItem.urgencyLevel)}`}>
                          {caseItem.urgencyLevel}
                        </span>
                      </div>
                      <p className="text-sm text-teal-600 font-medium mb-1">
                        {getCaseTypeLabel(caseItem.caseType)}
                      </p>
                      <p className="text-sm text-stone-600 line-clamp-2">
                        {caseItem.caseDescription}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
                        <span>Complexity: {caseItem.complexityScore}</span>
                        <span>{new Date(caseItem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(caseItem.matchingStatus)}`}>
                        {caseItem.matchingStatus.replace('_', ' ')}
                      </span>
                      {caseItem.assignedAttorneyName && (
                        <p className="text-xs text-stone-500 mt-1">
                          {caseItem.assignedAttorneyName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200">
            {selectedCase ? (
              <>
                <div className="p-4 border-b border-stone-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900">Case Details</h3>
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-stone-900 text-lg">{selectedCase.clientName}</h4>
                    <p className="text-teal-600 font-medium">{getCaseTypeLabel(selectedCase.caseType)}</p>
                  </div>

                  <div className="bg-stone-50 rounded-lg p-3">
                    <p className="text-sm text-stone-700">{selectedCase.caseDescription}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-stone-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-stone-900">{selectedCase.complexityScore}</div>
                      <div className="text-xs text-stone-500">Complexity</div>
                    </div>
                    <div className={`rounded-lg p-3 ${getUrgencyColor(selectedCase.urgencyLevel)}`}>
                      <div className="text-lg font-bold capitalize">{selectedCase.urgencyLevel}</div>
                      <div className="text-xs opacity-80">Urgency</div>
                    </div>
                  </div>

                  {selectedCase.matchingStatus === 'pending' && (
                    <button
                      onClick={() => runAIMatching(selectedCase.id)}
                      disabled={isRunningMatch}
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                    >
                      {isRunningMatch ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Finding Best Matches...
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          Run AI Matching
                        </>
                      )}
                    </button>
                  )}

                  {matches.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-stone-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        AI Match Recommendations
                      </h4>
                      {matches.map((match, index) => (
                        <div
                          key={match.matchId}
                          className={`border rounded-lg p-3 transition-all ${
                            match.status === 'accepted'
                              ? 'border-success-300 bg-success-50'
                              : match.status === 'declined'
                                ? 'border-stone-200 bg-stone-50 opacity-60'
                                : 'border-stone-200 hover:border-teal-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {index === 0 && match.status === 'proposed' && (
                                <Award className="w-5 h-5 text-warning-500" />
                              )}
                              <div>
                                <div
                                  className="font-semibold text-stone-900 hover:text-teal-600 cursor-pointer"
                                  onClick={() => match.lawyer && setSelectedLawyer(match.lawyer)}
                                >
                                  {match.attorneyName}
                                </div>
                                <div className="text-xs text-stone-500">Rank #{match.rankPosition}</div>
                              </div>
                            </div>
                            <div className={`text-2xl font-bold ${getConfidenceColor(match.confidenceScore)}`}>
                              {match.confidenceScore}%
                            </div>
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white rounded px-2 py-1">
                              <span className="text-stone-500">Expertise:</span>
                              <span className="ml-1 font-semibold text-stone-900">{match.expertiseScore}%</span>
                            </div>
                            <div className="bg-white rounded px-2 py-1">
                              <span className="text-stone-500">Availability:</span>
                              <span className="ml-1 font-semibold text-stone-900">{match.availabilityScore}%</span>
                            </div>
                          </div>

                          {match.status === 'proposed' && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => acceptMatch(match.matchId)}
                                className="flex-1 bg-success-600 hover:bg-success-700 text-white py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Accept
                              </button>
                              <button
                                onClick={() => declineMatch(match.matchId)}
                                className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                Decline
                              </button>
                            </div>
                          )}

                          {match.status === 'accepted' && (
                            <div className="mt-3 flex items-center gap-2 text-success-700 text-sm font-semibold">
                              <CheckCircle className="w-4 h-4" />
                              Match Accepted
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Target className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="font-semibold text-stone-900 mb-2">Select a Case</h3>
                <p className="text-sm text-stone-500">
                  Click on a case from the queue to view details and run AI matching
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'matches' && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200">
          <div className="p-5 border-b border-stone-200">
            <h3 className="font-bold text-stone-900">Recent Match Activity</h3>
            <p className="text-sm text-stone-500">Review and manage AI-generated case-attorney matches</p>
          </div>
          <div className="divide-y divide-stone-100">
            {cases.filter(c => c.matchingStatus === 'matched').map(caseItem => (
              <div key={caseItem.id} className="p-4 hover:bg-stone-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-success-100 text-success-700 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">{caseItem.clientName}</div>
                      <div className="text-sm text-stone-500">{getCaseTypeLabel(caseItem.caseType)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-stone-400" />
                        <span className="font-semibold text-stone-900">{caseItem.assignedAttorneyName}</span>
                      </div>
                      <div className="text-xs text-stone-500">
                        Matched {new Date(caseItem.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMatch(mockMatches[caseItem.id]?.[0] || null);
                        setShowFeedbackModal(true);
                      }}
                      className="text-teal-600 hover:text-teal-700 p-2"
                      title="Provide Feedback"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'attorneys' && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900">Arizona Attorney Pool</h3>
              <p className="text-sm text-stone-500">Licensed attorneys available for case matching</p>
            </div>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Add Attorney Profile
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {arizonaLawyers.map(lawyer => (
              <div
                key={lawyer.id}
                className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedLawyer(lawyer)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={lawyer.image}
                        alt={lawyer.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                        lawyer.availability === 'Available' ? 'bg-green-500' :
                        lawyer.availability === 'Busy' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900">{lawyer.name}</div>
                      <div className="flex items-center gap-1 text-sm text-teal-600">
                        <MapPin className="w-3 h-3" />
                        {lawyer.location}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    lawyer.availability === 'Available'
                      ? 'bg-success-100 text-success-700'
                      : 'bg-warning-100 text-warning-700'
                  }`}>
                    {lawyer.availability}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {lawyer.practiceAreas.slice(0, 3).map(area => (
                    <span key={area} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                      {area}
                    </span>
                  ))}
                  {lawyer.practiceAreas.length > 3 && (
                    <span className="text-xs text-stone-500">+{lawyer.practiceAreas.length - 3}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center py-3 border-y border-stone-100">
                  <div>
                    <div className="text-lg font-bold text-stone-900">{lawyer.experience}</div>
                    <div className="text-xs text-stone-500">Years Exp</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-teal-600">
                      <Award className="w-4 h-4" />
                      {lawyer.verified ? 'Verified' : 'Pending'}
                    </div>
                    <div className="text-xs text-stone-500">Status</div>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLawyer(lawyer);
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded text-sm font-semibold"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900">Match Performance</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Acceptance Rate</span>
                  <span className="font-bold text-success-600">87%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div className="bg-success-500 h-2 rounded-full" style={{ width: '87%' }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">First Match Success</span>
                  <span className="font-bold text-blue-600">72%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900">Time Metrics</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-stone-600">Avg Time to Match</span>
                    <span className="font-bold text-stone-900">2.4 hours</span>
                  </div>
                  <p className="text-xs text-stone-500">Down 15% from last month</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-stone-600">Avg Response Time</span>
                    <span className="font-bold text-stone-900">18 hours</span>
                  </div>
                  <p className="text-xs text-stone-500">Attorney response to match</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-warning-100 text-warning-600 p-2 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900">Top Performers</h3>
              </div>
              <div className="space-y-3">
                {arizonaLawyers.slice(0, 3).map((lawyer, index) => (
                  <div
                    key={lawyer.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-stone-50 p-1 rounded"
                    onClick={() => setSelectedLawyer(lawyer)}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-warning-100 text-warning-700' :
                      index === 1 ? 'bg-stone-200 text-stone-600' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {index + 1}
                    </span>
                    <img src={lawyer.image} alt={lawyer.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-stone-900">{lawyer.name}</div>
                      <div className="text-xs text-stone-500">{lawyer.experience} years - {lawyer.practiceAreas[0]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-stone-900">AI Model Insights</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-stone-900 mb-2">Most Predictive Factors</h4>
                <div className="space-y-2">
                  {[
                    { factor: 'Practice Area Match', weight: 35 },
                    { factor: 'Attorney Availability', weight: 25 },
                    { factor: 'Geographic Proximity', weight: 20 },
                    { factor: 'Historical Success', weight: 20 },
                  ].map(item => (
                    <div key={item.factor} className="flex items-center gap-2">
                      <div className="flex-1 bg-stone-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.weight}%` }} />
                      </div>
                      <span className="text-sm text-stone-600 w-32">{item.factor}</span>
                      <span className="text-sm font-semibold text-stone-900 w-8">{item.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-stone-900 mb-2">Model Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-success-600">94%</div>
                    <div className="text-sm text-stone-600">Prediction Accuracy</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">v2.3</div>
                    <div className="text-sm text-stone-600">Model Version</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-600">12K</div>
                    <div className="text-sm text-stone-600">Training Cases</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-warning-600">Weekly</div>
                    <div className="text-sm text-stone-600">Retraining</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-bold text-stone-900">Match Feedback</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-stone-600">
                How well did the AI match work for this case?
              </p>
              <div className="flex gap-4 justify-center py-4">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-stone-200 rounded-xl hover:border-success-500 hover:bg-success-50 transition-all"
                >
                  <ThumbsUp className="w-8 h-8 text-success-600" />
                  <span className="text-sm font-semibold text-stone-700">Good Match</span>
                </button>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-stone-200 rounded-xl hover:border-error-500 hover:bg-error-50 transition-all"
                >
                  <ThumbsDown className="w-8 h-8 text-error-600" />
                  <span className="text-sm font-semibold text-stone-700">Poor Match</span>
                </button>
              </div>
              <textarea
                placeholder="Additional feedback (optional)..."
                rows={3}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLawyer && (
        <LawyerProfileModal
          lawyer={selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
        />
      )}
    </div>
  );
}
