export function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1;

  if (month >= 11 || month <= 2) return 'winter';
  if (month >= 3 && month <= 4) return 'spring';
  if (month >= 5 && month <= 6) return 'summer';
  return 'monsoon';
}

export function getSeasonLabel(season, lang = 'en') {
  const labels = {
    en: { winter: 'Winter', summer: 'Summer', monsoon: 'Monsoon', spring: 'Spring' },
    ur: { winter: 'سردی', summer: 'گرمی', monsoon: 'بارش', spring: 'بہار' },
  };
  return labels[lang]?.[season] || season;
}
