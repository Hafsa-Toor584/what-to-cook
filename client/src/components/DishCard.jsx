import { Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { recipeName } from '../utils/names';
import DishImage from './DishImage';

export default function DishCard({ recipe, onClick, selected, action, reason, featured = false }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';
  const name = recipeName(recipe, lang);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full overflow-hidden rounded-[1.75rem] bg-white/85 text-start shadow-soft transition hover:shadow-lift active:scale-[0.99] animate-pop ${
        selected ? 'ring-4 ring-spice-400' : ''
      }`}
    >
      <div className={`relative ${featured ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}>
        <DishImage recipe={recipe} lang={lang} overlay className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {recipe.region?.nameEn && (
              <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-leaf-800">
                {lang === 'ur' ? recipe.region.nameUr : recipe.region.nameEn}
              </span>
            )}
            {recipe.mealType && (
              <span className="rounded-full bg-spice-500/95 px-2.5 py-0.5 text-xs font-bold text-white">
                {t(recipe.mealType)}
              </span>
            )}
          </div>
          <h3
            className={`font-display font-bold leading-snug text-white drop-shadow-sm ${
              featured ? 'text-2xl' : 'text-xl'
            } ${lang === 'ur' ? 'font-urdu' : ''}`}
          >
            {name}
          </h3>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {(reason || recipe.aiReason) && (
          <p className={`text-sm font-semibold leading-snug text-spice-700 ${lang === 'ur' ? 'font-urdu' : ''}`}>
            {reason || recipe.aiReason}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-leaf-600">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {t('minutes', { count: recipe.prepTimeMinutes || 30 })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4" />
            {t('servings', { count: recipe.servings || 4 })}
          </span>
        </div>
        {action}
      </div>
    </button>
  );
}
