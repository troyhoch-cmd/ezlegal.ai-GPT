import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Phone, MessageCircle, ExternalLink, X, Heart, Home, Shield, Clock, UserCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type CrisisType = 'domestic_violence' | 'self_harm' | 'homelessness' | 'detention' | 'urgent_deadline';

interface CrisisEscalationCardProps {
  crisisType: CrisisType;
  onDismiss: () => void;
  triggerMessage?: string;
  jurisdiction?: string;
}

const CRISIS_CONFIG: Record<CrisisType, {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  message: string;
  humanHelpLabel: string;
  humanHelpDescription: string;
  resources: Array<{
    label: string;
    action: string;
    type: 'phone' | 'text' | 'link';
    urgent?: boolean;
  }>;
}> = {
  domestic_violence: {
    icon: <Heart className="w-5 h-5" />,
    iconBg: 'bg-rose-100 text-rose-600',
    title: 'Safety Resources Available',
    message: 'If you or someone you know is experiencing domestic violence, immediate help is available 24/7.',
    humanHelpLabel: 'Speak with a DV Advocate',
    humanHelpDescription: 'Connect with a trained domestic violence advocate who can help with safety planning and resources.',
    resources: [
      { label: 'National DV Hotline', action: '1-800-799-7233', type: 'phone', urgent: true },
      { label: 'Text START to 88788', action: 'sms:88788?body=START', type: 'text' },
      { label: 'Safety Planning Guide', action: '/emergency-resources', type: 'link' },
    ],
  },
  self_harm: {
    icon: <Heart className="w-5 h-5" />,
    iconBg: 'bg-rose-100 text-rose-600',
    title: 'You Are Not Alone',
    message: 'If you are having thoughts of self-harm, please reach out. Free, confidential support is available 24/7.',
    humanHelpLabel: 'Talk to a Crisis Counselor Now',
    humanHelpDescription: 'A trained crisis counselor is available 24/7 to listen and help.',
    resources: [
      { label: '988 Suicide & Crisis Lifeline', action: '988', type: 'phone', urgent: true },
      { label: 'Text HOME to 741741', action: 'sms:741741?body=HOME', type: 'text' },
      { label: 'Crisis Chat Online', action: 'https://988lifeline.org/chat/', type: 'link' },
    ],
  },
  homelessness: {
    icon: <Home className="w-5 h-5" />,
    iconBg: 'bg-amber-100 text-amber-600',
    title: 'Housing Emergency Resources',
    message: 'Facing eviction or homelessness? Immediate assistance may be available in your area.',
    humanHelpLabel: 'Connect with a Housing Counselor',
    humanHelpDescription: 'Get free help from a HUD-certified housing counselor who can guide you through your options.',
    resources: [
      { label: 'HUD Housing Counseling', action: '1-800-569-4287', type: 'phone', urgent: true },
      { label: 'Find Local Shelters', action: 'https://www.hud.gov/findshelter', type: 'link' },
      { label: 'Emergency Rental Assistance', action: '/emergency-resources', type: 'link' },
    ],
  },
  detention: {
    icon: <Shield className="w-5 h-5" />,
    iconBg: 'bg-blue-100 text-blue-600',
    title: 'Legal Rights During Detention',
    message: 'If you or a loved one has been detained, you have rights. Free legal help may be available.',
    humanHelpLabel: 'Request Free Legal Consultation',
    humanHelpDescription: 'Connect with an immigration attorney or legal aid organization for a free consultation.',
    resources: [
      { label: 'ACLU Know Your Rights', action: 'https://www.aclu.org/know-your-rights', type: 'link', urgent: true },
      { label: 'Find Immigration Attorney', action: '/lawyers?specialty=immigration', type: 'link' },
      { label: 'Crisis Resources', action: '/emergency-resources', type: 'link' },
    ],
  },
  urgent_deadline: {
    icon: <Clock className="w-5 h-5" />,
    iconBg: 'bg-orange-100 text-orange-600',
    title: 'Time-Sensitive Legal Matter',
    message: 'For matters with imminent deadlines, we strongly recommend speaking with a licensed attorney.',
    humanHelpLabel: 'Get Urgent Legal Help',
    humanHelpDescription: 'Connect with an attorney who can help with your time-sensitive matter.',
    resources: [
      { label: 'Find an Attorney Now', action: '/lawyers', type: 'link', urgent: true },
      { label: 'Check Pro Bono Eligibility', action: '/pro-bono', type: 'link' },
      { label: 'Legal Aid Organizations', action: '/emergency-resources', type: 'link' },
    ],
  },
};

export function detectCrisis(message: string): CrisisType | null {
  const lowerMessage = message.toLowerCase();

  const dvKeywords = ['domestic violence', 'abusive relationship', 'partner abuse', 'husband hit', 'wife hit', 'boyfriend hit', 'girlfriend hit', 'being abused', 'hurting me', 'restraining order', 'protective order'];
  if (dvKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'domestic_violence';
  }

  const selfHarmKeywords = ['kill myself', 'end my life', 'suicide', 'want to die', 'self harm', 'hurt myself', 'no reason to live'];
  if (selfHarmKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'self_harm';
  }

  const homelessKeywords = ['homeless', 'kicked out', 'evicted', 'locked out', 'nowhere to go', 'living in car', 'on the street', 'shelter', 'eviction notice'];
  if (homelessKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'homelessness';
  }

  const detentionKeywords = ['detained', 'arrested', 'in jail', 'immigration detention', 'ice arrested', 'deported', 'custody'];
  if (detentionKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'detention';
  }

  const urgentKeywords = ['court tomorrow', 'hearing tomorrow', 'deadline today', 'due tomorrow', 'filing deadline', 'must respond today', 'eviction date'];
  if (urgentKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'urgent_deadline';
  }

  return null;
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('ezlegal-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ezlegal-session-id', sessionId);
  }
  return sessionId;
}

export default function CrisisEscalationCard({
  crisisType,
  onDismiss,
  triggerMessage,
  jurisdiction
}: CrisisEscalationCardProps) {
  const config = CRISIS_CONFIG[crisisType];
  const { user } = useAuth();
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [requestingHelp, setRequestingHelp] = useState(false);
  const [helpRequested, setHelpRequested] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const timer = setTimeout(() => {
      const heading = containerRef.current?.querySelector<HTMLElement>('h4');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissWithFocusReturn = useCallback(() => {
    logDismissal();
    onDismiss();
    requestAnimationFrame(() => {
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    });
  }, [onDismiss]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismissWithFocusReturn();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleDismissWithFocusReturn]);

  useEffect(() => {
    logCrisisIncident();
  }, [crisisType]);

  const logCrisisIncident = async () => {
    try {
      const { data, error } = await supabase
        .from('crisis_incidents')
        .insert({
          user_id: user?.id || null,
          session_id: getSessionId(),
          crisis_type: crisisType,
          trigger_message: triggerMessage?.substring(0, 500),
          jurisdiction: jurisdiction || null,
          resources_shown: config.resources.map(r => r.label),
        })
        .select('id')
        .single();

      if (!error && data) {
        setIncidentId(data.id);
      }
    } catch {
      // Silent fail - don't disrupt user experience
    }
  };

  const logDismissal = async () => {
    if (!incidentId) return;

    try {
      await supabase
        .from('crisis_incidents')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', incidentId);
    } catch {
      // Silent fail
    }
  };

  const handleHumanEscalation = async () => {
    setRequestingHelp(true);

    if (incidentId) {
      try {
        await supabase
          .from('crisis_incidents')
          .update({ escalated_to_human: true })
          .eq('id', incidentId);
      } catch {
        // Silent fail
      }
    }

    setTimeout(() => {
      setRequestingHelp(false);
      setHelpRequested(true);
    }, 1500);
  };

  const handleDismiss = () => {
    handleDismissWithFocusReturn();
  };

  const handleResourceClick = (resource: typeof config.resources[0]) => {
    if (resource.type === 'phone') {
      window.location.href = `tel:${resource.action}`;
    } else if (resource.type === 'text') {
      window.location.href = resource.action;
    }
  };

  return (
    <div ref={containerRef} role="alertdialog" aria-label="Crisis resources" className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-5 shadow-lg animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />
              <h4 className="font-bold text-slate-900">{config.title}</h4>
            </div>
            <p className="text-sm text-slate-700 mt-1">{config.message}</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
          aria-label="Dismiss crisis resources"
        >
          <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
        </button>
      </div>

      <div className="bg-white border-2 border-blue-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-slate-900 mb-1">{config.humanHelpLabel}</h5>
            <p className="text-sm text-slate-600 mb-3">{config.humanHelpDescription}</p>

            {helpRequested ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">
                  Your request has been logged. A specialist will review your situation.
                  In the meantime, please use the resources below for immediate assistance.
                </p>
              </div>
            ) : (
              <button
                onClick={handleHumanEscalation}
                disabled={requestingHelp}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md disabled:opacity-50"
              >
                {requestingHelp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Requesting Help...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" aria-hidden="true" />
                    Request Human Specialist
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Immediate Resources
      </p>
      <div className="grid gap-2">
        {config.resources.map((resource, index) => {
          if (resource.type === 'link') {
            const isExternal = resource.action.startsWith('http');
            if (isExternal) {
              return (
                <a
                  key={index}
                  href={resource.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    resource.urgent
                      ? 'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{resource.label}</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              );
            }
            return (
              <Link
                key={index}
                to={resource.action}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  resource.urgent
                    ? 'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{resource.label}</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </Link>
            );
          }

          return (
            <button
              key={index}
              onClick={() => handleResourceClick(resource)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                resource.urgent
                  ? 'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{resource.label}</span>
              {resource.type === 'phone' && <Phone className="w-4 h-4" aria-hidden="true" />}
              {resource.type === 'text' && <MessageCircle className="w-4 h-4" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-red-200">
        <Link
          to="/emergency-resources"
          className="text-sm text-red-700 hover:text-red-900 font-medium inline-flex items-center gap-1"
        >
          View all crisis resources <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
