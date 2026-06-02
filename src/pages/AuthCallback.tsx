import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finish = async () => {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      const errorDescription = searchParams.get('error_description') || searchParams.get('error');

      if (errorDescription) {
        setError(decodeURIComponent(errorDescription));
        return;
      }

      try {
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const hash = window.location.hash;
          if (hash && hash.includes('access_token')) {
            await new Promise((resolve) => setTimeout(resolve, 150));
            const { data: { session: retry } } = await supabase.auth.getSession();
            if (!retry) throw new Error('Sign-in completed but no session was created.');
          } else {
            throw new Error('Sign-in completed but no session was created.');
          }
        }

        navigate(redirectTo, { replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
        setError(message);
      }
    };

    finish();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-navy-900 mb-2">We couldn't sign you in</h1>
          <p className="text-sm text-navy-700 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
          >
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 p-4" role="status" aria-live="polite">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" aria-hidden="true" />
        <p className="text-navy-900 font-semibold">Finishing sign-in...</p>
        <p className="text-sm text-navy-600 mt-1">Hold tight, this only takes a moment.</p>
      </div>
    </div>
  );
}
