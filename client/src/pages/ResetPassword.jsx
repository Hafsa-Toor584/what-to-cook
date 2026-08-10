import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      setSession(data.token, data.user);
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
            'radial-gradient(ellipse 80% 50% at 80% 10%, rgba(232,146,26,0.45), transparent 55%), radial-gradient(ellipse 70% 60% at 10% 30%, rgba(74,135,96,0.55), transparent 50%), linear-gradient(195deg, #1e3a2a 0%, #254632 48%, #8a5a18 140%)',
        }}
      />

      <div className="relative flex justify-end">
        <LanguageSwitcher light />
      </div>

      <div className="relative animate-fade-up space-y-3">
        <h1 className="font-display text-4xl font-extrabold leading-tight text-white">
          {t('resetPasswordTitle')}
        </h1>
        <p className="text-lg font-semibold text-white/90">{t('resetPasswordIntro')}</p>
      </div>

      <div className="relative surface animate-fade-up space-y-5 p-6" style={{ animationDelay: '80ms' }}>
        {token ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block space-y-1">
              <span className="font-bold text-leaf-800">{t('newPassword')}</span>
              <input
                className="field"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold text-leaf-800">{t('confirmPassword')}</span>
              <input
                className="field"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            {error && <p className="font-semibold text-red-700">{error}</p>}
            <button className="btn-primary w-full" type="submit" disabled={busy}>
              {busy ? t('loading') : t('savePassword')}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="font-semibold text-red-700">{t('resetLinkInvalid')}</p>
            <Link className="btn-primary block w-full text-center" to="/forgot-password">
              {t('sendResetLink')}
            </Link>
          </div>
        )}
        <p className="text-center font-semibold text-leaf-700">
          <Link className="font-bold text-spice-600 underline" to="/login">
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
