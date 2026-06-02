import { useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Shield, Users, CheckCircle, Zap, DollarSign, Lock,
  ArrowRight, Star, TrendingUp, Globe, Loader2
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { translateAuthError } from '../lib/microcopy';
import { setPendingPlan, readPendingPlan } from '../lib/plan-context';
import { recordConsent } from '../lib/consent';
import { trackEvent } from '../services/analytics-service';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { signUp, signInWithOAuth } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError(t('auth.signup.passwordMismatch'));
    }

    if (password.length < 6) {
      return setError(t('auth.signup.passwordWeak'));
    }

    if (!ageConfirmed) {
      return setError(
        language === 'en'
          ? 'You must be at least 13 years old to create an account.'
          : 'Debes tener al menos 13 años para crear una cuenta.'
      );
    }

    setLoading(true);
    trackEvent('signup_started', { source: 'signup_page' });

    const planParam = searchParams.get('plan');
    if (planParam) setPendingPlan(planParam, 'signup');

    const { error } = await signUp(email, password);

    if (error) {
      setError(translateAuthError(error.message, language));
      setLoading(false);
    } else {
      trackEvent('signup_completed', { source: 'signup_page' });
      void recordConsent({
        consentType: 'privacy_notice',
        source: 'signup_age_gate',
        language,
      });
      const pending = readPendingPlan();
      const redirectTo =
        (location.state as { redirectTo?: string })?.redirectTo ||
        searchParams.get('redirect') ||
        (pending ? `/checkout?plan=${pending.planId}` : '/dashboard');
      navigate(redirectTo);
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'azure') => {
    setError('');
    setOauthLoading(provider);
    const planParam = searchParams.get('plan');
    if (planParam) setPendingPlan(planParam, 'signup-oauth');
    const pending = readPendingPlan();
    const redirectTo =
      (location.state as { redirectTo?: string })?.redirectTo ||
      searchParams.get('redirect') ||
      (pending ? `/checkout?plan=${pending.planId}` : '/dashboard');
    const { error } = await signInWithOAuth(provider, `${window.location.origin}${redirectTo}`);
    if (error) {
      setError(translateAuthError(error.message, language));
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <div className="absolute top-20 right-4 z-10">
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-navy-900 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Español' : 'English'}</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{t('signup.freeBanner')}</span>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-navy-50 to-navy-50/30 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="hidden lg:block">
              <h1 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-4">
                {t('signup.heroTitle')}{' '}
                <span className="text-teal-600">{t('signup.heroHighlight')}</span>{' '}
                {t('signup.heroSuffix')}
              </h1>
              <p className="text-xl text-navy-600 mb-8 leading-relaxed">
                {t('signup.heroSubtitle')}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-success-200 ring-2 ring-success-100">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <div className="font-bold text-navy-900 mb-1">{t('signup.benefit1Title')}</div>
                    <div className="text-sm text-navy-600">{t('signup.benefit1Desc')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-navy-200">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 mb-1">{t('signup.benefit2Title')}</div>
                    <div className="text-sm text-navy-600">{t('signup.benefit2Desc')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-navy-200">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 mb-1">{t('signup.benefit3Title')}</div>
                    <div className="text-sm text-navy-600">{t('signup.benefit3Desc')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm border border-navy-200">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 mb-1">{t('signup.benefit4Title')}</div>
                    <div className="text-sm text-navy-600">{t('signup.benefit4Desc')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-navy-900 font-semibold">
                  <Users className="w-4 h-4" />
                  <span>{t('signup.socialProof')}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-center mb-6 lg:hidden">
                <h1 className="text-2xl font-bold text-navy-900 mb-2">
                  {t('signup.mobileTitle')}
                </h1>
                <p className="text-navy-600">{t('signup.mobileSubtitle')}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-navy-200">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1 rounded-full mb-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{t('signup.freeForever')}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">
                    {t('signup.formTitle')}
                  </h2>
                  <p className="text-sm text-navy-600">
                    {t('signup.formSubtitle')}
                  </p>
                </div>

                <div className="bg-success-50 border border-success-200 rounded-xl p-4 mb-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-success-700 font-bold text-sm mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('signup.unlimitedQuestions')}</span>
                  </div>
                  <p className="text-success-600 text-xs">
                    {t('signup.payOnlyForPacks')}
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignup('google')}
                    disabled={oauthLoading !== null || loading}
                    className="w-full bg-white hover:bg-navy-50 text-navy-800 font-medium py-3 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('signup.continueGoogle')}
                  >
                    {oauthLoading === 'google' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    {t('signup.continueGoogle')}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthSignup('azure')}
                    disabled={oauthLoading !== null || loading}
                    className="w-full bg-white hover:bg-navy-50 text-navy-800 font-medium py-3 px-4 rounded-lg border border-navy-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('signup.continueMicrosoft')}
                  >
                    {oauthLoading === 'azure' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 23 23" aria-hidden="true">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                      </svg>
                    )}
                    {t('signup.continueMicrosoft')}
                  </button>
                </div>

                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-navy-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-navy-500">{t('signup.orEmail')}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm" role="alert">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-2">
                      {t('auth.signup.email')}
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
                      className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-navy-900 placeholder-navy-400"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-2">
                      {t('auth.signup.password')}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-navy-900 placeholder-navy-400"
                      placeholder={t('signup.createPassword')}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-700 mb-2">
                      {t('auth.signup.confirm')}
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-navy-900 placeholder-navy-400"
                      placeholder={t('signup.confirmPassword')}
                    />
                  </div>

                  <label className="flex items-start gap-2 text-sm text-navy-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-navy-300 text-teal-600 focus:ring-teal-500"
                      required
                    />
                    <span>
                      {language === 'en'
                        ? 'I confirm I am at least 13 years old and agree to the '
                        : 'Confirmo que tengo al menos 13 años y acepto los '}
                      <Link to="/terms" className="text-teal-700 underline hover:text-teal-800">
                        {language === 'en' ? 'Terms' : 'Términos'}
                      </Link>
                      {language === 'en' ? ' and ' : ' y la '}
                      <Link to="/privacy" className="text-teal-700 underline hover:text-teal-800">
                        {language === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
                      </Link>
                      {'.'}
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading || !ageConfirmed}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      t('signup.creating')
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t('signup.createFreeAccount')}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-xs text-navy-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                      <span>{t('hero.noCreditCard')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                      <span>{t('signup.guarantee')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-success-500" />
                      <span>{t('signup.secure')}</span>
                    </div>
                  </div>
                </form>

                <div className="mt-6 text-center text-sm space-y-3">
                  <div>
                    <span className="text-navy-600">{t('auth.signup.hasAccount')} </span>
                    <Link to="/login" className="text-teal-600 hover:text-navy-700 font-medium">
                      {t('auth.signup.signIn')}
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-navy-200">
                    <div className="flex items-center justify-center gap-4 text-xs text-navy-500">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{t('login.bankSecurity')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t('trust.ssl')}</span>
                      </div>
                    </div>
                    <p className="text-xs text-navy-400 mt-2">
                      {t('signup.agreeTerms')}{' '}
                      <Link to="/terms" className="text-teal-600 hover:underline">{t('auth.signup.termsLink')}</Link>
                      {' '}{t('auth.signup.and')}{' '}
                      <Link to="/privacy" className="text-teal-600 hover:underline">{t('auth.signup.privacyLink')}</Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center lg:hidden">
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-navy-600">
                    <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                    <span>{t('signup.fiveStarRated')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-navy-600">
                    <TrendingUp className="w-4 h-4 text-success-500" />
                    <span>{t('signup.savingsAmount')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
