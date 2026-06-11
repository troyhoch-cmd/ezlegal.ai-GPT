import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import TrustBadges, { SecurityDisclosure } from '../components/TrustBadges';
import { Shield, Zap, Lock, Globe, Loader2 } from 'lucide-react';
import { translateAuthError } from '../lib/microcopy';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { signIn, signInWithOAuth } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(translateAuthError(error.message, language));
      setLoading(false);
    } else {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setError('');
    setOauthLoading(provider);
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    const { error } = await signInWithOAuth(provider, `${window.location.origin}${redirectTo}`);
    if (error) {
      setError(translateAuthError(error.message, language));
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-navy-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-navy-900 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Español' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block">
            <div className="text-center mb-6">
              <img
                src="/red-and-grey-minamali-business-card-2-1-2.svg"
                alt="ezLegal.ai"
                className="h-14 w-auto mx-auto mb-6"
              />
            </div>

            <h1 className="text-3xl font-bold text-navy-900 mb-4">
              {t('login.welcomeBack')}
            </h1>
            <p className="text-lg text-navy-600 mb-8">
              {t('login.continueHelp')}
            </p>

            <div className="bg-gradient-to-br from-navy-50 to-white rounded-xl p-6 mb-6 border border-navy-200">
              <div className="text-2xl font-bold text-teal-600 mb-2">{t('login.freeToStart')}</div>
              <div className="text-navy-600 font-medium mb-1">{t('login.freeForever')}</div>
              <div className="text-sm text-navy-600">{t('login.noCreditCard')}</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-navy-600">
                <div className="w-8 h-8 bg-navy-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-teal-600" />
                </div>
                <span><strong>{t('login.ethicalAi')}</strong> {t('login.neverTrains')}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-navy-600">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <span><strong>{t('login.access247')}</strong> {t('login.wheneverYouNeed')}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-navy-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-blue-600" />
                </div>
                <span><strong>{t('login.bankSecurity')}</strong> {t('login.encryption')}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-center mb-6 md:hidden">
              <img
                src="/red-and-grey-minamali-business-card-2-1-2.svg"
                alt="ezLegal.ai"
                className="h-12 w-auto mx-auto mb-4"
              />
              <p className="text-navy-600">{t('auth.login.subtitle')}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={oauthLoading !== null}
                  className="w-full bg-white hover:bg-navy-50 text-navy-800 font-medium py-3 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Continue with Google"
                >
                  {oauthLoading === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthLogin('azure')}
                  disabled={oauthLoading !== null}
                  className="w-full bg-white hover:bg-navy-50 text-navy-800 font-medium py-3 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Continue with Microsoft"
                >
                  {oauthLoading === 'azure' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                  )}
                  Continue with Microsoft
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-navy-500">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy-600 mb-2">
                    {t('auth.login.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-navy-600">
                      {t('auth.login.password')}
                    </label>
                    <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                      {t('auth.login.forgot')}
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                    placeholder={t('login.enterPassword')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('login.signingIn') : t('auth.login.submit')}
                </button>
              </form>

              <div className="mt-6 text-center text-sm space-y-2">
                <div>
                  <span className="text-navy-600">{t('auth.login.noAccount')} </span>
                  <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                    {t('auth.login.signUp')}
                  </Link>
                </div>
                <div>
                  <Link to="/pricing" className="text-navy-600 hover:text-teal-600 font-medium">
                    {t('login.viewPricing')}
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-navy-200">
                <TrustBadges variant="inline" className="justify-center" />
              </div>

              <SecurityDisclosure className="mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
