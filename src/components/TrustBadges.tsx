import { Shield, Lock, Award, FileCheck, Eye } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'compact' | 'full' | 'inline';
  showSOC2?: boolean;
  showEncryption?: boolean;
  showPrivacy?: boolean;
  showCompliance?: boolean;
  className?: string;
}

export default function TrustBadges({
  variant = 'compact',
  showSOC2 = true,
  showEncryption = true,
  showPrivacy = true,
  showCompliance = true,
  className = ''
}: TrustBadgesProps) {
  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-4 text-xs text-slate-500 ${className}`}>
        {showEncryption && (
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            TLS 1.3 + AES-256
          </span>
        )}
        {showSOC2 && (
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            SOC 2 Infrastructure
          </span>
        )}
        {showPrivacy && (
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Never trains on your data
          </span>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
        {showEncryption && (
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-xs font-medium text-slate-600">TLS 1.3 + AES-256</span>
          </div>
        )}
        {showSOC2 && (
          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-700">Secure</span>
          </div>
        )}
        {showPrivacy && (
          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Private</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-slate-50 rounded-xl p-6 border border-slate-200 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-700 mb-4 text-center">
        Your data is protected
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {showSOC2 && (
          <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-slate-800">SOC 2 Type II</span>
            <span className="text-xs text-slate-500">Infrastructure</span>
          </div>
        )}
        {showEncryption && (
          <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-slate-800">AES-256</span>
            <span className="text-xs text-slate-500">Encryption</span>
          </div>
        )}
        {showPrivacy && (
          <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Your Data</span>
            <span className="text-xs text-slate-500">Never sold</span>
          </div>
        )}
        {showCompliance && (
          <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-2">
              <FileCheck className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-xs font-semibold text-slate-800">CCPA</span>
            <span className="text-xs text-slate-500">Compliant</span>
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200">
        <a
          href="/trust-center"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
        >
          <Award className="w-3 h-3" />
          View Trust Center
        </a>
      </div>
    </div>
  );
}

export function SecurityDisclosure({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center text-xs text-slate-500 space-y-1 ${className}`}>
      <p className="flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Your information is encrypted and secure
      </p>
      <p>
        <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
        {' · '}
        <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
      </p>
    </div>
  );
}
