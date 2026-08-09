import { useTranslation } from 'react-i18next';
import { applyDocumentDirection } from '../i18n';
import { useAuth } from '../context/AuthContext';

export default function LanguageSwitcher({ className = '', light = false }) {
  const { i18n, t } = useTranslation();
  const { user, updateUser } = useAuth();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';

  const setLang = async (next) => {
    localStorage.setItem('wtc_lang', next);
    i18n.changeLanguage(next);
    applyDocumentDirection(next);
    if (user) {
      try {
        await updateUser({ preferredLanguage: next });
      } catch {
        /* ignore sync errors */
      }
    }
  };

  return (
    <div
      className={`inline-flex rounded-2xl p-1 ${
        light ? 'bg-white/20 backdrop-blur-md' : 'border-2 border-leaf-200 bg-white/85'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`min-h-touch rounded-xl px-3 text-sm font-bold transition ${
          lang === 'en'
            ? light
              ? 'bg-white text-leaf-900'
              : 'bg-leaf-800 text-white'
            : light
              ? 'text-white/90'
              : 'text-leaf-800'
        }`}
      >
        {t('english')}
      </button>
      <button
        type="button"
        onClick={() => setLang('ur')}
        className={`min-h-touch rounded-xl px-3 font-urdu text-sm font-bold transition ${
          lang === 'ur'
            ? light
              ? 'bg-white text-leaf-900'
              : 'bg-leaf-800 text-white'
            : light
              ? 'text-white/90'
              : 'text-leaf-800'
        }`}
      >
        {t('urdu')}
      </button>
    </div>
  );
}
