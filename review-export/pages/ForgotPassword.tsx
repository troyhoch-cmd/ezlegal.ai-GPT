import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, ArrowLeft, CheckCircle, Globe } from 'lucide-react';
import { translateAuthError } from '../lib/microcopy';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(translateAuthError(error.message, language));
      setLoading(false);
    } else {
      setEmailSent(true);
      setLoading(false);
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

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/red-and-grey-minamali-business-card-2-1-2.svg"
            alt="ezLegal.ai"
            className="h-14 w-auto mx-auto mb-6"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {emailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mb-2">{t('forgot.checkEmail')}</h1>
              <p className="text-navy-600 mb-6">
                {t('forgot.sentTo')} <strong>{email}</strong>. {t('forgot.clickLink')}
              </p>
              <p className="text-sm text-navy-500 mb-6">
                {t('forgot.checkSpam')}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                >
                  {t('forgot.tryAgain')}
                </button>
                <Link
                  to="/login"
                  className="block w-full text-center text-teal-600 hover:text-teal-500 font-medium py-2"
                >
                  {t('auth.forgot.back')}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-teal-600" />
                </div>
                <h1 className="text-2xl font-bold text-navy-900 mb-2">{t('auth.forgot.title')}</h1>
                <p className="text-navy-600">
                  {t('auth.forgot.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy-600 mb-2">
                    {t('auth.forgot.email')}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('forgot.sending') : t('auth.forgot.submit')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-500 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('auth.forgot.back')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
