import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, CalendarDays, ChefHat, UserRound } from 'lucide-react';

const items = [
  { to: '/', icon: Home, labelKey: 'home', end: true },
  { to: '/browse', icon: Search, labelKey: 'browse' },
  { to: '/plans', icon: CalendarDays, labelKey: 'plans' },
  { to: '/wizard', icon: ChefHat, labelKey: 'help' },
  { to: '/profile', icon: UserRound, labelKey: 'profile' },
];

export default function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-leaf-200/70 bg-cream-50/95 backdrop-blur-xl">
      <ul className="mx-auto grid max-w-7xl grid-cols-5 gap-1 px-2 sm:px-6 lg:px-8 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {items.map(({ to, icon: Icon, labelKey, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[3.6rem] flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-bold transition sm:flex-row sm:gap-2 sm:text-sm ${
                  isActive
                    ? 'bg-leaf-800 text-white shadow-soft'
                    : 'text-leaf-600 hover:bg-leaf-100/70'
                }`
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2.4} />
              <span>{t(labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
