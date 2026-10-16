import { useLanguage } from '../contexts/LanguageContext';
import { translateAuthError } from '../lib/microcopy';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(true);
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setIsValidSession(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(en ? 'Passwords do not match' : 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError(en ? 'Password must be at least 8 characters long' : 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      setError(translateAuthError(error.message, language));
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  if (!isValidSession && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-navy-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/red-and-grey-minamali-business-card-2-1-2.svg"
              alt="ezLegal.ai"
              className="h-14 w-auto mx-auto mb-6"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">{en ? "Invalid or Expired Link" : "Enlace no v\u00e1lido o caducado"}</h2>
              <p className="text-navy-600 mb-6">
                {en ? "This password reset link is invalid or has expired. Please request a new one." : "Este enlace no es v\u00e1lido o ha caducado. Solicita uno nuevo."}
              </p>
              <Link
                to="/forgot-password"
                className="inline-block w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition-all text-center"
              >
                {en ? "Request New Link" : "Solicitar un enlace nuevo"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-navy-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/red-and-grey-minamali-business-card-2-1-2.svg"
            alt="ezLegal.ai"
            className="h-14 w-auto mx-auto mb-6"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">{en ? "Password Updated" : "Contrase\u00f1a actualizada"}</h2>
              <p className="text-navy-600 mb-6">
                {en ? "Your password has been successfully reset. You will be redirected to sign in shortly." : "Tu contrase\u00f1a se ha restablecido. En breve ir\u00e1s al inicio de sesi\u00f3n."}
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition-all text-center"
              >
                {en ? "Sign In Now" : "Iniciar sesi\u00f3n"}
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">{en ? "Create New Password" : "Crear contrase\u00f1a nueva"}</h2>
                <p className="text-navy-600">
                  Enter your new password below. Make sure it's at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-navy-600 mb-2">
                    {en ? "New Password" : "Contrase\u00f1a nueva"}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                    placeholder={en ? 'Enter new password' : 'Escribe la contraseña nueva'}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-600 mb-2">
                    {en ? "Confirm New Password" : "Confirmar contrase\u00f1a nueva"}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                    placeholder={en ? 'Confirm new password' : 'Confirma la contraseña nueva'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (en ? 'Updating...' : 'Actualizando…') : (en ? 'Update Password' : 'Actualizar contraseña')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
