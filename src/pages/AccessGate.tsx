import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import TrustBadges, { SecurityDisclosure } from '../components/TrustBadges';
import {
  Shield,
  FileText,
  Users,
  Briefcase,
  LogIn,
  UserPlus,
  Mail,
  AlertCircle,
  Clock,
  Ban,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  CheckCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

type TokenStatus = 'loading' | 'valid' | 'expired' | 'revoked' | 'not_found' | 'max_uses' | 'wrong_email';

interface TokenInfo {
  tokenId: string;
  resourceType: string;
  resourceId: string | null;
  resourceName: string | null;
  allowedEmail: string | null;
  createdByName: string | null;
}

const resourceIcons: Record<string, typeof FileText> = {
  matter: Briefcase,
  document: FileText,
  workspace: Users,
  general: Shield,
  invite: UserPlus
};

const resourceLabels: Record<string, string> = {
  matter: 'Legal Matter',
  document: 'Document',
  workspace: 'Workspace',
  general: 'Resource',
  invite: 'Invitation'
};

export default function AccessGate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestName, setRequestName] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  const token = searchParams.get('token');
  const next = searchParams.get('next') || '/chatbot';

  useEffect(() => {
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(next)}`);
      return;
    }

    validateToken();
  }, [token]);

  useEffect(() => {
    if (user && tokenStatus === 'valid' && tokenInfo) {
      if (tokenInfo.allowedEmail && user.email !== tokenInfo.allowedEmail) {
        setTokenStatus('wrong_email');
        return;
      }
      logTokenUsage('logged_in');
      navigate(next);
    }
  }, [user, tokenStatus, tokenInfo]);

  const validateToken = async () => {
    if (!token) return;

    const { data, error } = await supabase.rpc('validate_access_token', {
      p_token: token
    });

    if (error || !data || data.length === 0) {
      setTokenStatus('not_found');
      return;
    }

    const result = data[0];

    if (!result.valid) {
      switch (result.error_code) {
        case 'TOKEN_EXPIRED':
          setTokenStatus('expired');
          break;
        case 'TOKEN_REVOKED':
          setTokenStatus('revoked');
          break;
        case 'MAX_USES_EXCEEDED':
          setTokenStatus('max_uses');
          break;
        default:
          setTokenStatus('not_found');
      }

      if (result.token_id) {
        setTokenInfo({
          tokenId: result.token_id,
          resourceType: result.resource_type,
          resourceId: result.resource_id,
          resourceName: result.resource_name,
          allowedEmail: result.allowed_email,
          createdByName: result.created_by_name
        });
      }
      return;
    }

    setTokenInfo({
      tokenId: result.token_id,
      resourceType: result.resource_type,
      resourceId: result.resource_id,
      resourceName: result.resource_name,
      allowedEmail: result.allowed_email,
      createdByName: result.created_by_name
    });
    setTokenStatus('valid');
    logTokenUsage('viewed');
  };

  const logTokenUsage = async (action: string) => {
    if (!tokenInfo?.tokenId) return;

    await supabase.from('access_token_usage').insert({
      token_id: tokenInfo.tokenId,
      user_id: user?.id || null,
      email: user?.email || requestEmail || null,
      action
    });

    if (action === 'logged_in' || action === 'signed_up') {
      await supabase.rpc('increment_token_usage', { p_token_id: tokenInfo.tokenId });
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitting(true);
    setRequestError('');

    const { error } = await supabase.from('access_requests').insert({
      email: requestEmail,
      full_name: requestName,
      resource_type: tokenInfo?.resourceType || 'general',
      resource_id: tokenInfo?.resourceId || null,
      resource_name: tokenInfo?.resourceName || null,
      reason: requestReason,
      status: 'pending'
    });

    if (error) {
      setRequestError('Unable to submit request. Please try again.');
      setRequestSubmitting(false);
      return;
    }

    logTokenUsage('requested_access');
    setRequestSuccess(true);
    setRequestSubmitting(false);
  };

  const handleLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(`/access?token=${token}&next=${next}`)}`);
  };

  const handleSignup = () => {
    navigate(`/signup?redirect=${encodeURIComponent(`/access?token=${token}&next=${next}`)}`);
  };

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    navigate(`/login?redirect=${encodeURIComponent(`/access?token=${token}&next=${next}`)}`);
  };

  if (authLoading || tokenStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-navy-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  const ResourceIcon = tokenInfo ? resourceIcons[tokenInfo.resourceType] || Shield : Shield;
  const resourceLabel = tokenInfo ? resourceLabels[tokenInfo.resourceType] || 'Resource' : 'Resource';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-navy-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/">
            <img
              src="/red-and-grey-minamali-business-card-2-1-2.svg"
              alt="ezLegal.ai"
              className="h-12 w-auto mx-auto"
            />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {tokenStatus === 'valid' && !user && (
            <ValidAccessContent
              tokenInfo={tokenInfo}
              resourceIcon={ResourceIcon}
              resourceLabel={resourceLabel}
              showRequestForm={showRequestForm}
              setShowRequestForm={setShowRequestForm}
              requestEmail={requestEmail}
              setRequestEmail={setRequestEmail}
              requestName={requestName}
              setRequestName={setRequestName}
              requestReason={requestReason}
              setRequestReason={setRequestReason}
              requestSubmitting={requestSubmitting}
              requestSuccess={requestSuccess}
              requestError={requestError}
              onRequestAccess={handleRequestAccess}
              onLogin={handleLogin}
              onSignup={handleSignup}
            />
          )}

          {tokenStatus === 'wrong_email' && (
            <WrongEmailContent
              tokenInfo={tokenInfo}
              userEmail={user?.email || ''}
              onSwitchAccount={handleSwitchAccount}
              onRequestAccess={() => setShowRequestForm(true)}
            />
          )}

          {tokenStatus === 'expired' && (
            <ExpiredContent
              tokenInfo={tokenInfo}
              onRequestAccess={() => setShowRequestForm(true)}
            />
          )}

          {tokenStatus === 'revoked' && (
            <RevokedContent tokenInfo={tokenInfo} />
          )}

          {tokenStatus === 'max_uses' && (
            <MaxUsesContent
              tokenInfo={tokenInfo}
              onRequestAccess={() => setShowRequestForm(true)}
            />
          )}

          {tokenStatus === 'not_found' && (
            <NotFoundContent />
          )}

          {showRequestForm && !requestSuccess && (
            <RequestAccessForm
              email={requestEmail}
              setEmail={setRequestEmail}
              name={requestName}
              setName={setRequestName}
              reason={requestReason}
              setReason={setRequestReason}
              submitting={requestSubmitting}
              error={requestError}
              onSubmit={handleRequestAccess}
              onCancel={() => setShowRequestForm(false)}
            />
          )}

          {requestSuccess && (
            <RequestSuccessContent email={requestEmail} />
          )}
        </div>

        <div className="mt-6">
          <TrustBadges variant="compact" />
        </div>

        <div className="mt-4 text-center">
          <a
            href="/contact"
            className="text-sm text-navy-500 hover:text-navy-700 inline-flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            Need help? Contact support
          </a>
        </div>
      </div>
    </div>
  );
}

function ValidAccessContent({
  tokenInfo,
  resourceIcon: ResourceIcon,
  resourceLabel,
  showRequestForm,
  setShowRequestForm,
  onLogin,
  onSignup
}: {
  tokenInfo: TokenInfo | null;
  resourceIcon: typeof Shield;
  resourceLabel: string;
  showRequestForm: boolean;
  setShowRequestForm: (v: boolean) => void;
  requestEmail: string;
  setRequestEmail: (v: string) => void;
  requestName: string;
  setRequestName: (v: string) => void;
  requestReason: string;
  setRequestReason: (v: string) => void;
  requestSubmitting: boolean;
  requestSuccess: boolean;
  requestError: string;
  onRequestAccess: (e: React.FormEvent) => void;
  onLogin: () => void;
  onSignup: () => void;
}) {
  if (showRequestForm) return null;

  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ResourceIcon className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy-800 mb-2">
          {tokenInfo?.resourceName || `Access ${resourceLabel}`}
        </h1>
        {tokenInfo?.createdByName && (
          <p className="text-navy-600">
            Shared by <span className="font-medium">{tokenInfo.createdByName}</span>
          </p>
        )}
      </div>

      <div className="bg-navy-50 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold text-navy-700 mb-2">
          Sign in to continue
        </h2>
        <p className="text-sm text-navy-600">
          To access this {resourceLabel.toLowerCase()}, please sign in to your ezLegal account
          or create a free account.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onLogin}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Sign In
        </button>

        <button
          onClick={onSignup}
          className="w-full bg-white hover:bg-navy-50 text-navy-800 font-semibold py-3.5 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Create Free Account
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-navy-200">
        <button
          onClick={() => setShowRequestForm(true)}
          className="w-full text-sm text-navy-600 hover:text-navy-800 flex items-center justify-center gap-1"
        >
          <Mail className="w-4 h-4" />
          Request access without signing in
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <SecurityDisclosure className="mt-6" />
    </div>
  );
}

function WrongEmailContent({
  tokenInfo,
  userEmail,
  onSwitchAccount,
  onRequestAccess
}: {
  tokenInfo: TokenInfo | null;
  userEmail: string;
  onSwitchAccount: () => void;
  onRequestAccess: () => void;
}) {
  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy-800 mb-2">
          Different Account Required
        </h1>
        <p className="text-navy-600">
          This link was shared with <span className="font-medium">{tokenInfo?.allowedEmail}</span>
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          You're currently signed in as <span className="font-medium">{userEmail}</span>.
          To access this content, please sign in with the email address the link was shared with.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onSwitchAccount}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Switch Account
        </button>

        <button
          onClick={onRequestAccess}
          className="w-full bg-white hover:bg-navy-50 text-navy-800 font-semibold py-3.5 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Request Access for {userEmail}
        </button>
      </div>
    </div>
  );
}

function ExpiredContent({
  tokenInfo: _tokenInfo,
  onRequestAccess
}: {
  tokenInfo: TokenInfo | null;
  onRequestAccess: () => void;
}) {
  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-navy-500" />
        </div>
        <h1 className="text-2xl font-bold text-navy-800 mb-2">
          Link Expired
        </h1>
        <p className="text-navy-600">
          This access link is no longer valid
        </p>
      </div>

      <div className="bg-navy-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-navy-600">
          The link you're trying to use has expired. You can request a new access link
          from the person who shared this with you, or request access below.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onRequestAccess}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Request New Access
        </button>

        <Link
          to="/contact"
          className="w-full bg-white hover:bg-navy-50 text-navy-800 font-semibold py-3.5 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-2"
        >
          <HelpCircle className="w-5 h-5" />
          Contact Support
        </Link>
      </div>
    </div>
  );
}

function RevokedContent({ tokenInfo: _tokenInfo }: { tokenInfo: TokenInfo | null }) {
  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ban className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-navy-800 mb-2">
          Access Revoked
        </h1>
        <p className="text-navy-600">
          This access link has been deactivated
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-700">
          The owner of this content has revoked access. If you believe this is an error,
          please contact the person who shared this link with you.
        </p>
      </div>

      <Link
        to="/contact"
        className="w-full bg-white hover:bg-navy-50 text-navy-800 font-semibold py-3.5 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-2"
      >
        <HelpCircle className="w-5 h-5" />
        Contact Support
      </Link>
    </div>
  );
}

function MaxUsesContent({
  tokenInfo: _tokenInfo,
  onRequestAccess
}: {
  tokenInfo: TokenInfo | null;
  onRequestAccess: () => void;
}) {
  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy-800 mb-2">
          Link Limit Reached
        </h1>
        <p className="text-navy-600">
          This link has reached its maximum number of uses
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          Request a new link from the person who shared this with you, or submit an access request.
        </p>
      </div>

      <button
        onClick={onRequestAccess}
        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <Mail className="w-5 h-5" />
        Request Access
      </button>
    </div>
  );
}

function NotFoundContent() {
  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-navy-500" />
        </div>
        <h1 className="text-2xl font-bold text-navy-800 mb-2">
          Link Not Found
        </h1>
        <p className="text-navy-600">
          We couldn't find the resource you're looking for
        </p>
      </div>

      <div className="bg-navy-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-navy-600">
          This link may have been mistyped or the resource may have been removed.
          Please check the link and try again.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          to="/login"
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Sign In to Your Account
        </Link>

        <Link
          to="/"
          className="w-full bg-white hover:bg-navy-50 text-navy-800 font-semibold py-3.5 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

function RequestAccessForm({
  email,
  setEmail,
  name,
  setName,
  reason,
  setReason,
  submitting,
  error,
  onSubmit,
  onCancel
}: {
  email: string;
  setEmail: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  reason: string;
  setReason: (v: string) => void;
  submitting: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-8 border-t border-navy-200">
      <button
        onClick={onCancel}
        className="text-sm text-navy-500 hover:text-navy-700 mb-4 flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h2 className="text-lg font-semibold text-navy-800 mb-4">
        Request Access
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="request-email" className="block text-sm font-medium text-navy-700 mb-1">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="request-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="request-name" className="block text-sm font-medium text-navy-700 mb-1">
            Your name
          </label>
          <input
            id="request-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label htmlFor="request-reason" className="block text-sm font-medium text-navy-700 mb-1">
            Why do you need access?
          </label>
          <textarea
            id="request-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors resize-none"
            placeholder="Briefly explain your reason for requesting access..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Submit Request
            </>
          )}
        </button>
      </form>

      <SecurityDisclosure className="mt-6" />
    </div>
  );
}

function RequestSuccessContent({ email }: { email: string }) {
  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy-800 mb-2">
          Request Submitted
        </h1>
        <p className="text-navy-600">
          We'll notify you at <span className="font-medium">{email}</span> when your request is reviewed
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-800">
          Your access request has been submitted and is pending review.
          You'll receive an email once a decision has been made.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          to="/signup"
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Create Free Account While You Wait
        </Link>

        <Link
          to="/"
          className="w-full bg-white hover:bg-navy-50 text-navy-800 font-semibold py-3.5 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
