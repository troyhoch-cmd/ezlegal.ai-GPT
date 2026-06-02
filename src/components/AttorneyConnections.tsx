import { useState, useEffect } from 'react';
import {
  MessageSquare, Calendar, FileText, Clock, CheckCircle, XCircle,
  AlertCircle, ChevronRight, Phone, Video, MapPin, Loader2,
  Search, Eye, RefreshCw, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { arizonaLawyers, type LawyerProfile } from '../data/arizonaLawyers';
import LawyerConnectionModal from './LawyerConnectionModal';

const PIPELINE_STAGES = [
  { label: 'Requested', key: 'requested', sla: '< 1 day' },
  { label: 'In Review', key: 'in_review', sla: '1-3 biz days' },
  { label: 'Matched', key: 'matched', sla: '' },
];

function getStageIndex(status: string, _type: string): number {
  switch (status) {
    case 'pending': return 0;
    case 'active': return 1;
    case 'confirmed':
    case 'accepted':
    case 'completed': return 2;
    default: return -1;
  }
}

function getTimelineNote(conn: { status: string; created_at: string; last_activity_at: string }): string {
  const days = Math.floor((Date.now() - new Date(conn.created_at).getTime()) / (1000 * 60 * 60 * 24));
  if (conn.status === 'pending') {
    if (days === 0) return 'Submitted today. Typical response: 1-3 business days.';
    if (days <= 3) return `Submitted ${days} day${days > 1 ? 's' : ''} ago. Expected response within ${3 - days} more business day${3 - days !== 1 ? 's' : ''}.`;
    if (days <= 5) return `Submitted ${days} days ago. Response may be delayed -- consider contacting another attorney.`;
    return `Submitted ${days} days ago. No response received. We recommend reaching out to a different attorney.`;
  }
  if (conn.status === 'active') return 'Attorney is reviewing your request. Next step: confirmation or follow-up questions.';
  return `Matched on ${new Date(conn.last_activity_at).toLocaleDateString()}.`;
}

function isNewConnection(createdAt: string): boolean {
  return (Date.now() - new Date(createdAt).getTime()) < 1000 * 60 * 60 * 2;
}

interface Connection {
  id: string;
  lawyer_id: string;
  lawyer_name: string;
  lawyer_image: string;
  lawyer_practice_areas: string[];
  connection_type: 'chat' | 'appointment' | 'quote';
  status: string;
  last_activity_at: string;
  created_at: string;
}

interface AppointmentRequest {
  id: string;
  connection_id: string;
  appointment_type: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  confirmed_datetime: string | null;
  case_type: string | null;
}

interface QuoteRequest {
  id: string;
  connection_id: string;
  service_type: string;
  status: string;
  quote_amount: number | null;
  urgency: string;
}

interface Props {
  compact?: boolean;
  limit?: number;
}

export default function AttorneyConnections({ compact = false, limit }: Props) {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'chats' | 'appointments' | 'quotes'>('all');
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: connData } = await supabase
        .from('lawyer_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity_at', { ascending: false });

      if (connData) {
        setConnections(connData);
      }

      const { data: apptData } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (apptData) {
        setAppointments(apptData);
      }

      const { data: quoteData } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (quoteData) {
        setQuotes(quoteData);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
      case 'accepted':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'declined':
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
      case 'accepted':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'declined':
      case 'cancelled':
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-5 h-5" />;
      case 'appointment':
        return <Calendar className="w-5 h-5" />;
      case 'quote':
        return <FileText className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'in_person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const handleConnectionClick = (connection: Connection) => {
    const lawyer = arizonaLawyers.find(l => l.id === connection.lawyer_id);
    if (lawyer) {
      setSelectedLawyer(lawyer);
      setSelectedConnection(connection);
    }
  };

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.lawyer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'chats' && conn.connection_type === 'chat') ||
      (activeTab === 'appointments' && conn.connection_type === 'appointment') ||
      (activeTab === 'quotes' && conn.connection_type === 'quote');
    return matchesSearch && matchesTab;
  });

  const displayConnections = limit ? filteredConnections.slice(0, limit) : filteredConnections;

  const stats = {
    total: connections.length,
    chats: connections.filter(c => c.connection_type === 'chat').length,
    appointments: appointments.length,
    quotes: quotes.length,
    pending: connections.filter(c => c.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0067FF]" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#0067FF]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Attorney Connections</h3>
              <p className="text-sm text-slate-500">{stats.total} active connections</p>
            </div>
          </div>
          <button
            onClick={loadConnections}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {displayConnections.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No attorney connections yet</p>
            <p className="text-sm text-slate-500 mt-1">Browse lawyers to start a conversation</p>
            <a
              href="/dashboard/lawyer-profiles"
              className="inline-block mt-4 px-4 py-2 bg-[#0067FF] hover:bg-[#0052CC] text-white rounded-lg text-sm font-medium"
            >
              Find Attorneys
            </a>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayConnections.map(conn => {
              const stage = getStageIndex(conn.status, conn.connection_type);
              const isStale = (Date.now() - new Date(conn.created_at).getTime()) / (1000 * 60 * 60 * 24) > 5;
              return (
                <div key={conn.id} className="p-4">
                  <button
                    onClick={() => handleConnectionClick(conn)}
                    className="w-full flex items-center gap-4 hover:bg-slate-50 transition-colors text-left rounded-lg -m-1 p-1"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={conn.lawyer_image || 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={conn.lawyer_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                        conn.connection_type === 'chat' ? 'bg-blue-100 text-blue-600' :
                        conn.connection_type === 'appointment' ? 'bg-green-100 text-green-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {getConnectionIcon(conn.connection_type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{conn.lawyer_name}</p>
                      <p className="text-sm text-slate-500 truncate">
                        {conn.connection_type === 'chat' ? 'Chat conversation' :
                         conn.connection_type === 'appointment' ? 'Appointment request' :
                         'Quote request'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(conn.status)}`}>
                        {getStatusIcon(conn.status)}
                        {conn.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(conn.last_activity_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>

                  {(conn.status === 'pending' || conn.status === 'active') && stage >= 0 && (
                    <div className="mt-3 ml-1">
                      <div className="flex items-center gap-1" role="group" aria-label="Referral progress">
                        {PIPELINE_STAGES.map((s, i) => {
                          const reached = stage > i;
                          const current = stage === i;
                          return (
                            <div key={s.label} className="flex items-center flex-1">
                              <div className="flex flex-col items-center flex-1">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  reached ? 'bg-teal-600 text-white' :
                                  current ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-400' :
                                  'bg-slate-100 text-slate-400'
                                }`}>
                                  {reached ? <CheckCircle className="w-3 h-3" /> : i + 1}
                                </div>
                                <span className={`text-[10px] mt-0.5 ${
                                  reached || current ? 'text-teal-700 font-medium' : 'text-slate-400'
                                }`}>{s.label}</span>
                                {s.sla && current && (
                                  <span className="text-[9px] text-slate-400">{s.sla}</span>
                                )}
                              </div>
                              {i < PIPELINE_STAGES.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-0.5 rounded ${
                                  reached ? 'bg-teal-400' : 'bg-slate-200'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimelineNote(conn)}
                      </p>
                      {conn.status === 'pending' && isNewConnection(conn.created_at) && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-[10px] text-blue-700 font-medium">What to expect:</p>
                          <ul className="text-[10px] text-blue-600 mt-0.5 space-y-0.5">
                            <li>The attorney will review your request within 1-3 business days</li>
                            <li>You will receive an update here and by email when they respond</li>
                            <li>No response is guaranteed -- you can contact other attorneys anytime</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {stage === -1 && (
                    <div className="mt-2 ml-1 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600">
                        This request was {conn.status}.
                        <Link to="/dashboard/lawyer-profiles" className="text-[#0067FF] hover:underline ml-1">
                          Browse other attorneys
                        </Link>
                      </p>
                    </div>
                  )}

                  {conn.status === 'pending' && isStale && (
                    <div className="mt-2 ml-1 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-amber-800 font-medium">No response yet</p>
                          <p className="text-[10px] text-amber-600 mt-0.5">
                            Attorneys are not obligated to respond. You may
                            <Link to="/dashboard/lawyer-profiles" className="text-[#0067FF] hover:underline mx-1">
                              contact another attorney
                            </Link>
                            or
                            <Link to="/emergency-resources" className="text-[#0067FF] hover:underline mx-1">
                              view emergency resources
                            </Link>
                            if urgent.
                          </p>
                          <p className="text-[10px] text-amber-500 mt-1 italic">
                            ezLegal.ai facilitates introductions only and does not guarantee attorney response.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {connections.length > (limit || 0) && (
          <div className="p-4 border-t border-slate-200">
            <a
              href="/dashboard?tab=connections"
              className="w-full py-2 flex items-center justify-center gap-2 text-[#0067FF] hover:text-[#0052CC] font-medium text-sm"
            >
              View All Connections
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {selectedLawyer && (
          <LawyerConnectionModal
            lawyer={selectedLawyer}
            initialTab={selectedConnection?.connection_type || 'chat'}
            onClose={() => {
              setSelectedLawyer(null);
              setSelectedConnection(null);
              loadConnections();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#0067FF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.chats}</p>
              <p className="text-sm text-slate-500">Active Chats</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.appointments}</p>
              <p className="text-sm text-slate-500">Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.quotes}</p>
              <p className="text-sm text-slate-500">Quote Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
              <p className="text-sm text-slate-500">Pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'chats', label: 'Chats' },
                { id: 'appointments', label: 'Appointments' },
                { id: 'quotes', label: 'Quotes' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#0067FF] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search attorneys..."
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
              />
            </div>
          </div>
        </div>

        {displayConnections.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No connections found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'Try a different search term' : 'Connect with attorneys to get legal help'}
            </p>
            <a
              href="/dashboard/lawyer-profiles"
              className="inline-block px-6 py-3 bg-[#0067FF] hover:bg-[#0052CC] text-white rounded-lg font-medium"
            >
              Browse Attorneys
            </a>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayConnections.map(conn => {
              const appointment = appointments.find(a => a.connection_id === conn.id);
              const quote = quotes.find(q => q.connection_id === conn.id);

              return (
                <div
                  key={conn.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={conn.lawyer_image || 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={conn.lawyer_name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white ${
                        conn.connection_type === 'chat' ? 'bg-blue-500 text-white' :
                        conn.connection_type === 'appointment' ? 'bg-green-500 text-white' :
                        'bg-amber-500 text-white'
                      }`}>
                        {getConnectionIcon(conn.connection_type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-900">{conn.lawyer_name}</h4>
                          <p className="text-sm text-slate-500">
                            {conn.lawyer_practice_areas?.slice(0, 2).join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(conn.status)}`}>
                            {getStatusIcon(conn.status)}
                            {conn.status}
                          </span>
                          <button
                            onClick={() => handleConnectionClick(conn)}
                            className="p-2 text-[#0067FF] hover:bg-blue-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {conn.connection_type === 'appointment' && appointment && (
                        <div className="mt-3 bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              {getAppointmentTypeIcon(appointment.appointment_type)}
                              <span className="capitalize">{appointment.appointment_type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(appointment.preferred_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.preferred_time}</span>
                            </div>
                          </div>
                          {appointment.case_type && (
                            <p className="mt-2 text-sm text-slate-600">
                              <span className="font-medium">Case type:</span> {appointment.case_type}
                            </p>
                          )}
                        </div>
                      )}

                      {conn.connection_type === 'quote' && quote && (
                        <div className="mt-3 bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-900 font-medium">{quote.service_type}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Urgency: <span className="capitalize">{quote.urgency}</span>
                              </p>
                            </div>
                            {quote.quote_amount && (
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">${quote.quote_amount.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Quoted</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(() => {
                        const stage = getStageIndex(conn.status, conn.connection_type);
                        const isStale = (Date.now() - new Date(conn.created_at).getTime()) / (1000 * 60 * 60 * 24) > 5;
                        return (
                          <>
                            {(conn.status === 'pending' || conn.status === 'active') && stage >= 0 && (
                              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2" role="group" aria-label="Referral progress">
                                  {PIPELINE_STAGES.map((s, i) => {
                                    const reached = stage > i;
                                    const current = stage === i;
                                    return (
                                      <div key={s.label} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center flex-1">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            reached ? 'bg-teal-600 text-white' :
                                            current ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-400' :
                                            'bg-slate-200 text-slate-400'
                                          }`}>
                                            {reached ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                                          </div>
                                          <span className={`text-[11px] mt-1 text-center ${
                                            reached || current ? 'text-teal-700 font-medium' : 'text-slate-400'
                                          }`}>{s.label}</span>
                                          {s.sla && current && (
                                            <span className="text-[10px] text-slate-400">{s.sla}</span>
                                          )}
                                        </div>
                                        {i < PIPELINE_STAGES.length - 1 && (
                                          <div className={`h-0.5 flex-1 mx-1 rounded ${
                                            reached ? 'bg-teal-400' : 'bg-slate-200'
                                          }`} />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {getTimelineNote(conn)}
                                </p>
                                {conn.status === 'pending' && isNewConnection(conn.created_at) && (
                                  <div className="mt-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-700 font-medium mb-1">What to expect:</p>
                                    <ul className="text-xs text-blue-600 space-y-0.5">
                                      <li>The attorney will review your request within 1-3 business days</li>
                                      <li>You will receive an update here and by email when they respond</li>
                                      <li>No response is guaranteed -- you can contact other attorneys anytime</li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {conn.status === 'pending' && isStale && (
                              <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-amber-800 font-medium">No response received</p>
                                    <p className="text-xs text-amber-600 mt-1">
                                      Attorneys are not obligated to respond to referral requests. You may{' '}
                                      <Link to="/dashboard/lawyer-profiles" className="text-[#0067FF] hover:underline">
                                        contact another attorney
                                      </Link>{' '}
                                      or{' '}
                                      <Link to="/emergency-resources" className="text-[#0067FF] hover:underline">
                                        view emergency resources
                                      </Link>{' '}
                                      if your matter is urgent.
                                    </p>
                                    <p className="text-[10px] text-amber-500 mt-1.5 italic">
                                      ezLegal.ai facilitates introductions only and does not guarantee attorney response or representation.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {stage === -1 && (
                              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-600">
                                  This request was {conn.status}.{' '}
                                  <Link to="/dashboard/lawyer-profiles" className="text-[#0067FF] hover:underline">
                                    Browse other attorneys
                                  </Link>
                                </p>
                              </div>
                            )}
                          </>
                        );
                      })()}

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          Last activity: {new Date(conn.last_activity_at).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleConnectionClick(conn)}
                          className="text-sm text-[#0067FF] hover:text-[#0052CC] font-medium flex items-center gap-1"
                        >
                          {conn.connection_type === 'chat' ? 'Open Chat' : 'View Details'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedLawyer && (
        <LawyerConnectionModal
          lawyer={selectedLawyer}
          initialTab={selectedConnection?.connection_type || 'chat'}
          onClose={() => {
            setSelectedLawyer(null);
            setSelectedConnection(null);
            loadConnections();
          }}
        />
      )}
    </div>
  );
}
