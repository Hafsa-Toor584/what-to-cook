import { useEffect, useState } from 'react';
import { recipeName } from '../utils/names';

const mealEmoji = {
  breakfast: '🍳',
  lunch: '🍛',
  dinner: '🌙',
  snack: '🥟',
  dessert: '🍮',
  drink: '🥤',
};

export default function DishImage({ recipe, lang = 'en', className = '', overlay = false }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const alt = recipe ? recipeName(recipe, lang) : 'Dish';
  const fallback = mealEmoji[recipe?.mealType] || '🍽️';

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [recipe?.imageUrl, recipe?._id]);

  if (!recipe?.imageUrl || failed) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-leaf-200 via-leaf-100 to-spice-100 text-5xl ${className}`}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-leaf-100 ${className}`}>
      {!loaded && <div className="skeleton absolute inset-0" />}
      <img
        src={recipe.imageUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`h-full w-full object-cover transition duration-500 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
      <div
        className={`pointer-events-none absolute inset-0 ${
          overlay
            ? 'bg-gradient-to-t from-black/80 via-leaf-900/25 to-transparent'
            : 'bg-gradient-to-t from-black/30 via-transparent to-transparent'
        }`}
      />
    </div>
  );
}
