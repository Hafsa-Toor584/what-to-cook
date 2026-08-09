import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { recipeName, regionName } from '../utils/names';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';
  const [regions, setRegions] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [regionId, setRegionId] = useState(user?.preferredRegion || '');
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/regions').then(({ data }) => setRegions(data)).catch(() => {});
    api.get('/preferences').then(({ data }) => setPrefs(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setName(user?.name || '');
    const region = user?.preferredRegion;
    setRegionId(region?._id || region || '');
  }, [user]);

  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      await updateUser({
        name: name.trim(),
        preferredRegion: regionId || null,
        preferredLanguage: lang,
      });
      setMessage(t('saved'));
    } catch {
      setMessage(t('error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 pt-5">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl font-bold text-leaf-900">{t('profile')}</h1>
        <p className="font-semibold text-leaf-700">{user?.email}</p>
      </header>

      <section className="surface space-y-4 p-4">
        <label className="block space-y-1">
          <span className="font-bold text-leaf-800">{t('name')}</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <div className="space-y-2">
          <p className="font-bold text-leaf-800">{t('language')}</p>
          <LanguageSwitcher />
        </div>

        <label className="block space-y-1">
          <span className="font-bold text-leaf-800">{t('preferredRegion')}</span>
          <select className="field" value={regionId || ''} onChange={(e) => setRegionId(e.target.value)}>
            <option value="">{t('allRegions')}</option>
            {regions.map((r) => (
              <option key={r._id} value={r._id}>
                {regionName(r, lang)}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="btn-primary w-full" disabled={busy} onClick={save}>
          {busy ? t('loading') : t('save')}
        </button>
        {message && <p className="text-center font-bold text-leaf-700">{message}</p>}
      </section>

      {prefs?.likedRecipes?.length > 0 && (
        <section className="surface space-y-3 p-4">
          <h2 className="text-xl font-extrabold text-leaf-900">{t('likedDishes')}</h2>
          <ul className="space-y-2">
            {prefs.likedRecipes.map((r) => (
              <li key={r._id} className="font-bold text-leaf-800">
                {recipeName(r, lang)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <button type="button" className="btn-secondary w-full" onClick={logout}>
        {t('logout')}
      </button>
    </div>
  );
}
