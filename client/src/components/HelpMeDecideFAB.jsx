import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChefHat } from 'lucide-react';

export default function HelpMeDecideFAB() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  if (
    pathname === '/' ||
    pathname.startsWith('/wizard') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  ) {
    return null;
  }

  return (
    <Link
      to="/wizard"
      className="fixed bottom-24 end-4 z-30 inline-flex min-h-touch items-center gap-2 rounded-full bg-spice-500 px-4 py-3 text-sm font-extrabold text-white shadow-lift transition hover:bg-spice-600 active:scale-95 animate-soft-float"
    >
      <ChefHat className="h-5 w-5" />
      {t('helpMeDecide')}
    </Link>
  );
}
