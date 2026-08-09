import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ur from './ur.json';

const saved = localStorage.getItem('wtc_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ur: { translation: ur },
  },
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function applyDocumentDirection(lang) {
  const rtl = lang === 'ur';
  document.documentElement.lang = lang;
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', rtl);
}

applyDocumentDirection(saved);

export default i18n;
