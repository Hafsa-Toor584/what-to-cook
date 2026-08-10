import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MailCheck } from 'lucide-react';
import api from '../api/client';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() });
      setDevLink(data.resetUrl || '');
      setSent(true);
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

      <div className="relative flex justify-end">
        <LanguageSwitcher light />
      </div>

      <div className="relative animate-fade-up space-y-3">
        <h1 className="font-display text-4xl font-extrabold leading-tight text-white">
          {t('forgotPasswordTitle')}
        </h1>
        <p className="text-lg font-semibold text-white/90">{t('forgotPasswordIntro')}</p>
      </div>

      <div className="relative surface animate-fade-up space-y-5 p-6" style={{ animationDelay: '80ms' }}>
        {sent ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MailCheck className="mt-1 h-6 w-6 shrink-0 text-leaf-700" />
              <p className="font-semibold text-leaf-800">{t('resetLinkSent')}</p>
            </div>
            {devLink && (
              <a
                className="block break-all rounded-xl bg-leaf-50 p-3 text-sm font-bold text-spice-700 underline"
                href={devLink}
              >
                {devLink}
              </a>
            )}
            <Link className="btn-primary block w-full text-center" to="/login">
              {t('backToLogin')}
            </Link>
          </div>
        ) : (
          <>
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
              {error && <p className="font-semibold text-red-700">{error}</p>}
              <button className="btn-primary w-full" type="submit" disabled={busy}>
                {busy ? t('loading') : t('sendResetLink')}
              </button>
            </form>
            <p className="text-center font-semibold text-leaf-700">
              <Link className="font-bold text-spice-600 underline" to="/login">
                {t('backToLogin')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
