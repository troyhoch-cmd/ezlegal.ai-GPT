import { useState, useEffect, useRef } from 'react';
import {
  X, MessageSquare, Calendar, FileText, Send, Phone, Video, MapPin,
  Loader2, CheckCircle, AlertCircle, Award,
  DollarSign, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useActivityLog } from '../hooks/useActivityLog';
import type { LawyerProfile } from '../data/arizonaLawyers';

interface LawyerConnectionModalProps {
  lawyer: LawyerProfile;
  initialTab?: 'chat' | 'appointment' | 'quote';
  onClose: () => void;
}

interface Message {
  id: string;
  sender_type: 'user' | 'lawyer' | 'system';
  sender_name: string;
  message: string;
  message_type: string;
  created_at: string;
}

interface Connection {
  id: string;
  status: string;
  connection_type: string;
}

export default function LawyerConnectionModal({ lawyer, initialTab = 'chat', onClose }: LawyerConnectionModalProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { logLawyerMatch } = useActivityLog();
  const [activeTab, setActiveTab] = useState<'chat' | 'appointment' | 'quote'>(initialTab);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [showWhatNext, setShowWhatNext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [appointmentForm, setAppointmentForm] = useState({
    type: 'phone' as 'phone' | 'video' | 'in_person',
    preferredDate: '',
    preferredTime: '',
    alternateDate: '',
    alternateTime: '',
    caseType: '',
    description: '',
  });

  const [quoteForm, setQuoteForm] = useState({
    serviceType: '',
    description: '',
    urgency: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    budgetRange: '',
    feeStructure: 'flexible' as 'hourly' | 'flat_fee' | 'contingency' | 'retainer' | 'flexible',
  });

  useEffect(() => {
    if (user) {
      loadOrCreateConnection();
    }
  }, [user, lawyer.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadOrCreateConnection = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: existingConnection } = await supabase
        .from('lawyer_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('lawyer_id', lawyer.id)
        .eq('connection_type', 'chat')
        .maybeSingle();

      if (existingConnection) {
        setConnection(existingConnection);
        await loadMessages(existingConnection.id);
      } else {
        const { data: newConnection, error } = await supabase
          .from('lawyer_connections')
          .insert({
            user_id: user.id,
            lawyer_id: lawyer.id,
            lawyer_name: lawyer.name,
            lawyer_image: lawyer.image,
            lawyer_practice_areas: lawyer.practiceAreas,
            connection_type: 'chat',
            status: 'active',
          })
          .select()
          .single();

        if (!error && newConnection) {
          setConnection(newConnection);
          await supabase.from('lawyer_messages').insert({
            connection_id: newConnection.id,
            sender_type: 'system',
            sender_id: 'system',
            sender_name: 'EZLegal',
            message: `Connection started with ${lawyer.name}. Send a message to introduce yourself and your legal needs.`,
            message_type: 'system',
          });
          await loadMessages(newConnection.id);
          logLawyerMatch({
            lawyerId: lawyer.id,
            lawyerName: lawyer.name,
            practiceArea: lawyer.practiceAreas[0],
            action: 'connected'
          });
        }
      }
    } catch (error) {
      console.error('Error loading connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (connectionId: string) => {
    const { data, error } = await supabase
      .from('lawyer_messages')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !connection || !user) return;

    setSending(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .maybeSingle();

    const senderName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User' : 'User';

    const { error } = await supabase.from('lawyer_messages').insert({
      connection_id: connection.id,
      sender_type: 'user',
      sender_id: user.id,
      sender_name: senderName,
      message: newMessage,
      message_type: 'text',
    });

    if (!error) {
      setNewMessage('');
      await loadMessages(connection.id);
    }
    setSending(false);
  };

  const submitAppointmentRequest = async () => {
    if (!user || !appointmentForm.preferredDate || !appointmentForm.preferredTime) return;

    setSending(true);
    try {
      const { data: newConnection, error: connError } = await supabase
        .from('lawyer_connections')
        .insert({
          user_id: user.id,
          lawyer_id: lawyer.id,
          lawyer_name: lawyer.name,
          lawyer_image: lawyer.image,
          lawyer_practice_areas: lawyer.practiceAreas,
          connection_type: 'appointment',
          status: 'pending',
        })
        .select()
        .single();

      if (connError) throw connError;

      const { error: apptError } = await supabase.from('appointment_requests').insert({
        connection_id: newConnection.id,
        user_id: user.id,
        lawyer_id: lawyer.id,
        appointment_type: appointmentForm.type,
        preferred_date: appointmentForm.preferredDate,
        preferred_time: appointmentForm.preferredTime,
        alternate_date: appointmentForm.alternateDate || null,
        alternate_time: appointmentForm.alternateTime || null,
        case_type: appointmentForm.caseType || null,
        case_description: appointmentForm.description || null,
      });

      if (apptError) throw apptError;

      const appointmentTypeLabel = {
        phone: 'Phone call',
        video: 'Video call',
        in_person: 'In-person meeting',
      }[appointmentForm.type];

      await supabase.from('lawyer_messages').insert({
        connection_id: newConnection.id,
        sender_type: 'system',
        sender_id: 'system',
        sender_name: 'EZLegal',
        message: `Appointment request sent: ${appointmentTypeLabel} on ${appointmentForm.preferredDate} at ${appointmentForm.preferredTime}`,
        message_type: 'appointment_request',
        metadata: { appointment_type: appointmentForm.type, date: appointmentForm.preferredDate, time: appointmentForm.preferredTime },
      });

      setSubmitSuccess('appointment');
      setAppointmentForm({
        type: 'phone',
        preferredDate: '',
        preferredTime: '',
        alternateDate: '',
        alternateTime: '',
        caseType: '',
        description: '',
      });
    } catch (error) {
      console.error('Error submitting appointment:', error);
    } finally {
      setSending(false);
    }
  };

  const submitQuoteRequest = async () => {
    if (!user || !quoteForm.serviceType || !quoteForm.description) return;

    setSending(true);
    try {
      const { data: newConnection, error: connError } = await supabase
        .from('lawyer_connections')
        .insert({
          user_id: user.id,
          lawyer_id: lawyer.id,
          lawyer_name: lawyer.name,
          lawyer_image: lawyer.image,
          lawyer_practice_areas: lawyer.practiceAreas,
          connection_type: 'quote',
          status: 'pending',
        })
        .select()
        .single();

      if (connError) throw connError;

      const { error: quoteError } = await supabase.from('quote_requests').insert({
        connection_id: newConnection.id,
        user_id: user.id,
        lawyer_id: lawyer.id,
        service_type: quoteForm.serviceType,
        case_description: quoteForm.description,
        urgency: quoteForm.urgency,
        budget_range: quoteForm.budgetRange || null,
        preferred_fee_structure: quoteForm.feeStructure,
      });

      if (quoteError) throw quoteError;

      await supabase.from('lawyer_messages').insert({
        connection_id: newConnection.id,
        sender_type: 'system',
        sender_id: 'system',
        sender_name: 'EZLegal',
        message: `Quote request sent for ${quoteForm.serviceType}`,
        message_type: 'quote_request',
        metadata: { service_type: quoteForm.serviceType, urgency: quoteForm.urgency },
      });

      setSubmitSuccess('quote');
      setQuoteForm({
        serviceType: '',
        description: '',
        urgency: 'normal',
        budgetRange: '',
        feeStructure: 'flexible',
      });
    } catch (error) {
      console.error('Error submitting quote:', error);
    } finally {
      setSending(false);
    }
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
  ];

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Sign In Required</h3>
          <p className="text-slate-600 mb-6">Please sign in to connect with attorneys.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <a href="/login" className="px-4 py-2 bg-[#0067FF] text-white rounded-lg hover:bg-[#0052CC]">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#0067FF] to-teal-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={lawyer.image} alt={lawyer.name} className="w-12 h-12 rounded-full border-2 border-white/30 object-cover" />
            <div className="text-white">
              <h2 className="text-lg font-bold">{lawyer.name}</h2>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Award className="w-4 h-4 text-amber-300" />
                <span>{lawyer.experience} years</span>
                <span className="mx-1">-</span>
                <span>{lawyer.practiceAreas.slice(0, 2).join(', ')}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-slate-200">
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'appointment', label: 'Request Appointment', icon: Calendar },
            { id: 'quote', label: 'Request Quote', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as typeof activeTab); setSubmitSuccess(null); }}
              className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#0067FF] border-b-2 border-[#0067FF] bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="border-b border-slate-100">
          <button
            onClick={() => setShowWhatNext(!showWhatNext)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0067FF]" />
              <span className="font-medium">
                {language === 'en' ? 'What happens next?' : 'Que pasa despues?'}
              </span>
            </div>
            {showWhatNext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showWhatNext && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg border ${activeTab === 'chat' ? 'border-[#0067FF] bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <MessageSquare className="w-4 h-4 text-[#0067FF]" />
                    <span className="text-xs font-semibold text-slate-800">
                      {language === 'en' ? 'Chat' : 'Chat'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {language === 'en'
                      ? 'Messages go to the attorney\'s office. This is not a live chat -- response times vary by office.'
                      : 'Los mensajes van a la oficina del abogado. No es un chat en vivo -- los tiempos de respuesta varian.'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg border ${activeTab === 'appointment' ? 'border-[#0067FF] bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="w-4 h-4 text-[#0067FF]" />
                    <span className="text-xs font-semibold text-slate-800">
                      {language === 'en' ? 'Appointment' : 'Cita'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {language === 'en'
                      ? 'The office confirms or proposes alternatives within 24-48 hours. You\'ll be notified of their response.'
                      : 'La oficina confirma o propone alternativas dentro de 24-48 horas. Se le notificara de su respuesta.'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg border ${activeTab === 'quote' ? 'border-[#0067FF] bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="w-4 h-4 text-[#0067FF]" />
                    <span className="text-xs font-semibold text-slate-800">
                      {language === 'en' ? 'Quote' : 'Cotizacion'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {language === 'en'
                      ? 'The office reviews your case details and provides a fee estimate within 2-3 business days.'
                      : 'La oficina revisa los detalles de su caso y proporciona un estimado de honorarios en 2-3 dias habiles.'}
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1.5">
                <p className="font-medium">
                  {language === 'en' ? 'Important:' : 'Importante:'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>
                    {language === 'en'
                      ? 'This is a directory listing, not a warm handoff. The attorney has not been pre-notified about your case.'
                      : 'Esta es una lista de directorio, no una referencia directa. El abogado no ha sido notificado previamente sobre su caso.'}
                  </li>
                  <li>
                    {language === 'en'
                      ? `This attorney practices in ${lawyer.location}. Verify they serve your geographic area.`
                      : `Este abogado ejerce en ${lawyer.location}. Verifique que sirve su area geografica.`}
                  </li>
                  <li>
                    {language === 'en'
                      ? 'If you don\'t receive a response within the expected timeframe, try another attorney or contact us for help.'
                      : 'Si no recibe una respuesta dentro del plazo esperado, intente con otro abogado o contactenos para ayuda.'}
                  </li>
                  <li>
                    {language === 'en'
                      ? 'No referral fees are charged. Attorney ranking is not influenced by payment or sponsorship.'
                      : 'No se cobran honorarios de referencia. La clasificacion de abogados no esta influenciada por pagos o patrocinios.'}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0067FF]" />
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${
                          msg.sender_type === 'system'
                            ? 'bg-slate-100 text-slate-600 text-center w-full rounded-lg'
                            : msg.sender_type === 'user'
                              ? 'bg-[#0067FF] text-white rounded-2xl rounded-br-md'
                              : 'bg-slate-200 text-slate-800 rounded-2xl rounded-bl-md'
                        } px-4 py-3`}>
                          {msg.sender_type !== 'system' && (
                            <p className={`text-xs font-medium mb-1 ${msg.sender_type === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                              {msg.sender_name}
                            </p>
                          )}
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.sender_type === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 border-t border-slate-200">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-3 bg-[#0067FF] hover:bg-[#0052CC] text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Messages are sent directly to {lawyer.name}'s office. Response times may vary.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'appointment' && (
            <div className="p-6 overflow-y-auto max-h-[500px]">
              {submitSuccess === 'appointment' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Appointment Request Sent!</h3>
                  <p className="text-slate-600 mb-6">
                    {lawyer.name}'s office will review your request and respond within 24-48 hours.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(null)}
                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Request Another Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Request Appointment with {lawyer.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">Select your preferred meeting type and time</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Appointment Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'phone', label: 'Phone Call', icon: Phone },
                        { id: 'video', label: 'Video Call', icon: Video },
                        { id: 'in_person', label: 'In Person', icon: MapPin },
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setAppointmentForm(f => ({ ...f, type: type.id as typeof f.type }))}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                            appointmentForm.type === type.id
                              ? 'border-[#0067FF] bg-blue-50 text-[#0052CC]'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <type.icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date *</label>
                      <input
                        type="date"
                        value={appointmentForm.preferredDate}
                        onChange={(e) => setAppointmentForm(f => ({ ...f, preferredDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time *</label>
                      <select
                        value={appointmentForm.preferredTime}
                        onChange={(e) => setAppointmentForm(f => ({ ...f, preferredTime: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                      >
                        <option value="">Select time...</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Alternate Date (optional)</label>
                      <input
                        type="date"
                        value={appointmentForm.alternateDate}
                        onChange={(e) => setAppointmentForm(f => ({ ...f, alternateDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Alternate Time (optional)</label>
                      <select
                        value={appointmentForm.alternateTime}
                        onChange={(e) => setAppointmentForm(f => ({ ...f, alternateTime: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                      >
                        <option value="">Select time...</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Case Type</label>
                    <select
                      value={appointmentForm.caseType}
                      onChange={(e) => setAppointmentForm(f => ({ ...f, caseType: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                    >
                      <option value="">Select case type...</option>
                      {lawyer.practiceAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Brief Description of Your Matter (optional)</label>
                    <textarea
                      value={appointmentForm.description}
                      onChange={(e) => setAppointmentForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      placeholder="Briefly describe what you'd like to discuss..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                    />
                  </div>

                  <button
                    onClick={submitAppointmentRequest}
                    disabled={sending || !appointmentForm.preferredDate || !appointmentForm.preferredTime}
                    className="w-full bg-[#0067FF] hover:bg-[#0052CC] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                    Request Appointment
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quote' && (
            <div className="p-6 overflow-y-auto max-h-[500px]">
              {submitSuccess === 'quote' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Quote Request Sent!</h3>
                  <p className="text-slate-600 mb-6">
                    {lawyer.name}'s office will review your request and provide a quote within 2-3 business days.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(null)}
                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Request Another Quote
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Request Quote from {lawyer.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">Describe your legal needs to receive a fee estimate</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Service Type *</label>
                    <select
                      value={quoteForm.serviceType}
                      onChange={(e) => setQuoteForm(f => ({ ...f, serviceType: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                    >
                      <option value="">Select service type...</option>
                      {lawyer.practiceAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                      <option value="Consultation">Initial Consultation</option>
                      <option value="Document Review">Document Review</option>
                      <option value="Full Representation">Full Representation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description of Your Legal Needs *</label>
                    <textarea
                      value={quoteForm.description}
                      onChange={(e) => setQuoteForm(f => ({ ...f, description: e.target.value }))}
                      rows={4}
                      placeholder="Please describe your situation and what legal assistance you need..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Urgency Level</label>
                      <select
                        value={quoteForm.urgency}
                        onChange={(e) => setQuoteForm(f => ({ ...f, urgency: e.target.value as typeof f.urgency }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                      >
                        <option value="low">Low - No rush</option>
                        <option value="normal">Normal - Within a week</option>
                        <option value="high">High - Within a few days</option>
                        <option value="urgent">Urgent - Immediate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Budget Range (optional)</label>
                      <select
                        value={quoteForm.budgetRange}
                        onChange={(e) => setQuoteForm(f => ({ ...f, budgetRange: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                      >
                        <option value="">Prefer not to say</option>
                        <option value="under_500">Under $500</option>
                        <option value="500_1000">$500 - $1,000</option>
                        <option value="1000_2500">$1,000 - $2,500</option>
                        <option value="2500_5000">$2,500 - $5,000</option>
                        <option value="5000_10000">$5,000 - $10,000</option>
                        <option value="over_10000">Over $10,000</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Fee Structure</label>
                    <select
                      value={quoteForm.feeStructure}
                      onChange={(e) => setQuoteForm(f => ({ ...f, feeStructure: e.target.value as typeof f.feeStructure }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0067FF] focus:border-[#0067FF]"
                    >
                      <option value="flexible">Flexible / No Preference</option>
                      <option value="hourly">Hourly Rate</option>
                      <option value="flat_fee">Flat Fee</option>
                      <option value="contingency">Contingency Fee</option>
                      <option value="retainer">Retainer</option>
                    </select>
                  </div>

                  {lawyer.averageBillingRate > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">{lawyer.name}'s average hourly rate:</span> ${lawyer.averageBillingRate}/hr
                        </p>
                        <p className="text-xs text-slate-500">Actual fees may vary based on case complexity</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={submitQuoteRequest}
                    disabled={sending || !quoteForm.serviceType || !quoteForm.description}
                    className="w-full bg-[#0067FF] hover:bg-[#0052CC] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    Send Quote Request
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
