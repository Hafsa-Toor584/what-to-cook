export function recipeName(recipe, lang) {
  if (!recipe) return '';
  return lang === 'ur' ? recipe.nameUr || recipe.nameEn : recipe.nameEn;
}

export function regionName(region, lang) {
  if (!region) return '';
  return lang === 'ur' ? region.nameUr || region.nameEn : region.nameEn;
}

export function occasionName(occasion, lang) {
  if (!occasion) return '';
  return lang === 'ur' ? occasion.nameUr || occasion.nameEn : occasion.nameEn;
}

export function stepText(step, lang) {
  return lang === 'ur' ? step.stepUr || step.stepEn : step.stepEn;
}

export function ingredientName(ing, lang) {
  return lang === 'ur' ? ing.nameUr || ing.nameEn : ing.nameEn;
}
