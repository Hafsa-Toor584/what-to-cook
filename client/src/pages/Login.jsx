import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
  const { t } = useTranslation();
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(232,146,26,0.4), transparent 55%), radial-gradient(ellipse 70% 60% at 90% 20%, rgba(74,135,96,0.5), transparent 50%), linear-gradient(165deg, #1e3a2a 0%, #2c563c 42%, #3d6b4a 75%, #8a5a18 160%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      <div className="relative flex justify-end">
        <LanguageSwitcher light />
      </div>

      <div className="relative animate-fade-up space-y-3">
        <h1 className="font-display text-5xl font-extrabold leading-tight text-white">
          {t('appName')}
        </h1>
        <p className="text-lg font-semibold text-white/90">{t('tagline')}</p>
      </div>

      <div className="relative surface animate-fade-up space-y-5 p-6" style={{ animationDelay: '80ms' }}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <span className="font-bold text-leaf-800">{t('email')}</span>
            <input
              className="field"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="font-bold text-leaf-800">{t('password')}</span>
            <input
              className="field"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="font-semibold text-red-700">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={busy}>
            {busy ? t('loading') : t('login')}
          </button>
        </form>
        <p className="text-center">
          <Link className="font-bold text-leaf-700 underline" to="/forgot-password">
            {t('forgotPassword')}
          </Link>
        </p>
        <p className="text-center font-semibold text-leaf-700">
          {t('noAccount')}{' '}
          <Link className="font-bold text-spice-600 underline" to="/register">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
