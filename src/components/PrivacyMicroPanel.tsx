import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Trash2, Database, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface PrivacyMicroPanelProps {
  context: 'chat' | 'intake' | 'checkout';
  className?: string;
}

const CONTEXT_INFO: Record<string, {
  title: string;
  points: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
}> = {
  chat: {
    title: 'Your Privacy',
    points: [
      { icon: <Lock className="w-3.5 h-3.5" />, text: 'TLS 1.3 + AES-256 encryption (SOC 2 infrastructure)' },
      { icon: <Database className="w-3.5 h-3.5" />, text: 'Row-level security isolates your data' },
      { icon: <Trash2 className="w-3.5 h-3.5" />, text: 'Delete or export anytime in Settings' },
      { icon: <Shield className="w-3.5 h-3.5" />, text: 'Zero data used for AI model training' },
    ],
  },
  intake: {
    title: 'Pro Bono Privacy',
    points: [
      { icon: <Lock className="w-3.5 h-3.5" />, text: 'Information shared only with matched attorneys' },
      { icon: <Database className="w-3.5 h-3.5" />, text: 'AES-256 encrypted storage' },
      { icon: <Trash2 className="w-3.5 h-3.5" />, text: 'Request deletion at any time' },
      { icon: <Shield className="w-3.5 h-3.5" />, text: 'Hosted on SOC 2 Type II certified infrastructure' },
    ],
  },
  checkout: {
    title: 'Payment Security',
    points: [
      { icon: <Lock className="w-3.5 h-3.5" />, text: 'Payments processed by Stripe (PCI-DSS compliant)' },
      { icon: <Database className="w-3.5 h-3.5" />, text: 'We never store your full card number' },
      { icon: <Trash2 className="w-3.5 h-3.5" />, text: 'Cancel subscription anytime' },
      { icon: <Shield className="w-3.5 h-3.5" />, text: '30-day money-back guarantee' },
    ],
  },
};

export default function PrivacyMicroPanel({ context, className = '' }: PrivacyMicroPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const info = CONTEXT_INFO[context];

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-xl overflow-hidden ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-slate-700">{info.title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-200">
          <ul className="space-y-2 mb-3">
            {info.points.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-green-600 mt-0.5">{point.icon}</span>
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/privacy"
            className="text-xs text-[#0067FF] hover:underline inline-flex items-center gap-1"
          >
            Full Privacy Policy
          </Link>
        </div>
      )}
    </div>
  );
}

export function PrivacyMicroPanelInline({ context }: { context: 'chat' | 'intake' | 'checkout' }) {
  const info = CONTEXT_INFO[context];

  return (
    <div className="flex items-center gap-4 text-xs text-slate-500">
      <div className="flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-green-600" />
        <span>{info.points[0].text}</span>
      </div>
      <span className="text-slate-300">|</span>
      <Link
        to="/privacy"
        className="text-[#0067FF] hover:underline inline-flex items-center gap-1"
      >
        Privacy Policy
      </Link>
    </div>
  );
}

export function PrivacyGlancePanel({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-stone-50 to-primary-50 border border-stone-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-stone-900">Your Data & Privacy</h3>
          <p className="text-sm text-stone-600">How we protect your information</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 border border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-success-600" />
            <span className="text-sm font-semibold text-stone-900">No AI Training</span>
          </div>
          <p className="text-xs text-stone-600">Your data is never used to train AI models</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-stone-900">90-Day Retention</span>
          </div>
          <p className="text-xs text-stone-600">Chat history auto-deleted after 90 days</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <Trash2 className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-stone-900">Your Control</span>
          </div>
          <p className="text-xs text-stone-600">Delete or export your data anytime</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link
          to="/privacy"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          Privacy Policy
        </Link>
        <Link
          to="/trust-center"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          Trust Center
        </Link>
        <Link
          to="/ai-governance"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          AI Governance
        </Link>
      </div>
    </div>
  );
}
