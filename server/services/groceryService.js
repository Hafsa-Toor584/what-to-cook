function normalizeKey(nameEn, unit) {
  return `${nameEn?.toLowerCase().trim()}|${unit?.toLowerCase().trim() || ''}`;
}

export function aggregateGroceries(recipes, guestCount = null) {
  const map = new Map();

  for (const recipe of recipes) {
    const baseServings = recipe.servings || 4;
    const scale = guestCount ? guestCount / baseServings : 1;

    for (const ing of recipe.ingredients || []) {
      const key = normalizeKey(ing.nameEn, ing.unit);
      const scaledQty = (ing.quantity || 0) * scale;

      if (map.has(key)) {
        const existing = map.get(key);
        existing.quantity += scaledQty;
        existing.fromRecipes.push(recipe.nameEn);
      } else {
        map.set(key, {
          nameEn: ing.nameEn,
          nameUr: ing.nameUr,
          quantity: scaledQty,
          unit: ing.unit,
          fromRecipes: [recipe.nameEn],
        });
      }
    }
  }

  return Array.from(map.values()).map((item) => ({
    ...item,
    quantity: Math.round(item.quantity * 100) / 100,
  }));
}

export function scaleRecipeIngredients(recipe, guestCount) {
  const baseServings = recipe.servings || 4;
  const scale = guestCount ? guestCount / baseServings : 1;

  return (recipe.ingredients || []).map((ing) => ({
    ...ing,
    quantity: Math.round((ing.quantity || 0) * scale * 100) / 100,
  }));
}
