import OpenAI from 'openai';
import Recipe from '../models/Recipe.js';
import UserPreference from '../models/UserPreference.js';
import { getCurrentSeason } from './seasonService.js';

const AI_DAILY_LIMIT = 15;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function getOrCreatePrefs(userId) {
  let prefs = await UserPreference.findOne({ userId });
  if (!prefs) {
    prefs = await UserPreference.create({ userId });
  }
  return prefs;
}

async function checkRateLimit(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const prefs = await getOrCreatePrefs(userId);

  if (prefs.aiRequestDate !== today) {
    prefs.aiRequestDate = today;
    prefs.aiRequestCount = 0;
    await prefs.save();
  }

  if (prefs.aiRequestCount >= AI_DAILY_LIMIT) {
    return { allowed: false, prefs };
  }

  return { allowed: true, prefs };
}

async function incrementRateLimit(prefs) {
  prefs.aiRequestCount += 1;
  await prefs.save();
}

function buildPreferenceContext(prefs, likedRecipes) {
  if (!prefs) return 'No preference history yet.';

  const likedNames = likedRecipes?.map((r) => r.nameEn).join(', ') || 'none';
  const tags = [];
  if (prefs.inferredTags?.prefersMeat) tags.push('meat dishes');
  if (prefs.inferredTags?.prefersQuick) tags.push('quick meals');
  if (prefs.inferredTags?.preferredRegion) tags.push(`${prefs.inferredTags.preferredRegion} style`);

  return `User usually likes: ${likedNames}. Preferences: ${tags.join(', ') || 'general Pakistani home cooking'}.`;
}

function excludeSkipped(recipes, skippedIds = []) {
  const skipped = new Set(skippedIds.map((id) => id.toString()));
  return recipes.filter((r) => !skipped.has(r._id.toString()));
}

function scoreRecipe(recipe, wizardAnswers = {}, prefs = null, likedIds = new Set()) {
  let score = 0;
  const season = getCurrentSeason();

  if (recipe.seasons?.includes(season) || recipe.seasons?.includes('all')) score += 3;
  if (wizardAnswers.meal && recipe.mealType === wizardAnswers.meal) score += 5;
  if (wizardAnswers.preference === 'meat' && recipe.tags?.includes('meat')) score += 4;
  if (wizardAnswers.preference === 'veg' && recipe.tags?.includes('veg')) score += 4;
  if (wizardAnswers.preference === 'both') score += 1;
  if (wizardAnswers.time === 'quick' && recipe.prepTimeMinutes <= 30) score += 4;
  if (wizardAnswers.time === 'normal' && recipe.prepTimeMinutes <= 60) score += 2;
  if (wizardAnswers.time === 'allday' && (recipe.tags?.includes('festive') || recipe.prepTimeMinutes >= 60)) {
    score += 3;
  }
  if (wizardAnswers.who === 'guests' && recipe.tags?.includes('guest-friendly')) score += 4;
  if (wizardAnswers.who === 'family' && recipe.servings >= 4) score += 2;
  if (wizardAnswers.who === 'me' && recipe.prepTimeMinutes <= 40) score += 2;
  if (wizardAnswers.occasion && wizardAnswers.occasion !== 'none') {
    if (recipe.occasions?.some((o) => o.slug === wizardAnswers.occasion)) score += 6;
  }
  if (likedIds.has(recipe._id.toString())) score += 3;
  if (prefs?.inferredTags?.prefersQuick && recipe.prepTimeMinutes <= 30) score += 2;
  if (prefs?.inferredTags?.prefersMeat && recipe.tags?.includes('meat')) score += 1;
  if (prefs?.inferredTags?.preferredRegion && recipe.region?.slug === prefs.inferredTags.preferredRegion) {
    score += 2;
  }

  score += Math.random() * 0.8;
  return score;
}

function buildSmartReason(recipe, wizardAnswers = {}, language = 'en') {
  const name = language === 'ur' ? recipe.nameUr : recipe.nameEn;
  const bits = [];

  if (wizardAnswers.time === 'quick' && recipe.prepTimeMinutes <= 30) {
    bits.push(language === 'ur' ? 'جلدی تیار ہو جاتی ہے' : 'ready in about 30 minutes');
  }
  if (wizardAnswers.who === 'guests' && recipe.tags?.includes('guest-friendly')) {
    bits.push(language === 'ur' ? 'مہمانوں کے لیے اچھی ہے' : 'great for guests');
  }
  if (wizardAnswers.who === 'family') {
    bits.push(language === 'ur' ? 'خاندان کے ساتھ شیئر کریں' : 'nice for family sharing');
  }
  if (wizardAnswers.preference === 'veg' && recipe.tags?.includes('veg')) {
    bits.push(language === 'ur' ? 'سبزی والی ڈش' : 'fits your veg preference');
  }
  if (wizardAnswers.preference === 'meat' && recipe.tags?.includes('meat')) {
    bits.push(language === 'ur' ? 'گوشت کی پسند کے مطابق' : 'matches your meat preference');
  }
  if (wizardAnswers.occasion && wizardAnswers.occasion !== 'none') {
    bits.push(language === 'ur' ? 'اس موقع کے لیے موزوں' : 'fits this occasion');
  }
  if (recipe.seasons?.includes(getCurrentSeason())) {
    bits.push(language === 'ur' ? 'موسم کے مطابق' : 'good for this season');
  }

  if (!bits.length) {
    return language === 'ur'
      ? `${name} آج کے لیے آسان گھر کا انتخاب ہے۔`
      : `${name} is a simple home-style pick for today.`;
  }

  return language === 'ur'
    ? `${name} اس لیے: ${bits.slice(0, 2).join('، ')}۔`
    : `${name} — ${bits.slice(0, 2).join(', ')}.`;
}

function withReasons(recipes, wizardAnswers, language) {
  return recipes.map((r) => {
    const obj = typeof r.toObject === 'function' ? r.toObject() : { ...r };
    return {
      ...obj,
      aiReason: buildSmartReason(r, wizardAnswers, language),
    };
  });
}

function buildGuestMenuFallback(recipes, wizardAnswers, language) {
  const byType = {
    main: recipes.filter((r) => ['lunch', 'dinner'].includes(r.mealType) && r.tags?.includes('meat')),
    side: recipes.filter((r) => r.tags?.includes('veg') || r.mealType === 'snack'),
    drink: recipes.filter((r) => r.mealType === 'drink'),
    dessert: recipes.filter((r) => r.mealType === 'dessert'),
  };

  const pick = (list, fallbackList) => {
    const pool = list.length ? list : fallbackList;
    return pool[0] || null;
  };

  const roles = ['main', 'side', 'drink', 'dessert'];
  const used = new Set();
  const menu = [];

  for (const role of roles) {
    const candidate =
      pick(
        byType[role].filter((r) => !used.has(r._id.toString())),
        recipes.filter((r) => !used.has(r._id.toString()))
      );
    if (!candidate) continue;
    used.add(candidate._id.toString());
    const reason = buildSmartReason(candidate, { ...wizardAnswers, who: 'guests' }, language);
    const recipe = {
      ...(typeof candidate.toObject === 'function' ? candidate.toObject() : candidate),
      aiReason: reason,
    };
    menu.push({ recipe, role, reason });
  }

  return menu;
}

export async function filterRecipesByWizard(wizardAnswers = {}, skippedIds = [], prefs = null) {
  const and = [];

  if (wizardAnswers.meal) {
    and.push({ mealType: wizardAnswers.meal });
  }

  if (wizardAnswers.preference === 'meat') {
    and.push({ tags: 'meat' });
  } else if (wizardAnswers.preference === 'veg') {
    and.push({ tags: 'veg' });
  }

  if (wizardAnswers.time === 'quick') {
    and.push({ prepTimeMinutes: { $lte: 30 } });
  } else if (wizardAnswers.time === 'normal') {
    and.push({ prepTimeMinutes: { $lte: 60 } });
  }

  if (wizardAnswers.who === 'guests') {
    and.push({ tags: 'guest-friendly' });
  }

  const season = getCurrentSeason();
  and.push({ $or: [{ seasons: season }, { seasons: 'all' }] });

  let recipes = await Recipe.find(and.length ? { $and: and } : {})
    .populate('region occasions')
    .limit(80);

  // Soften if too few matches
  if (recipes.length < 4) {
    const loose = [];
    if (wizardAnswers.meal) loose.push({ mealType: wizardAnswers.meal });
    loose.push({ $or: [{ seasons: season }, { seasons: 'all' }] });
    recipes = await Recipe.find({ $and: loose }).populate('region occasions').limit(80);
  }

  if (wizardAnswers.occasion && wizardAnswers.occasion !== 'none') {
    const occasionMatched = recipes.filter((r) =>
      r.occasions?.some((o) => o.slug === wizardAnswers.occasion)
    );
    if (occasionMatched.length) recipes = occasionMatched;
  }

  const likedIds = new Set((prefs?.likedRecipes || []).map((id) => id.toString()));
  recipes = excludeSkipped(recipes, skippedIds);
  recipes.sort((a, b) => scoreRecipe(b, wizardAnswers, prefs, likedIds) - scoreRecipe(a, wizardAnswers, prefs, likedIds));

  return recipes.slice(0, 12);
}

function smartFallback({ wizardMatches, wizardAnswers, planType, language, message }) {
  if (planType === 'guest') {
    const guestMenu = buildGuestMenuFallback(wizardMatches, wizardAnswers, language);
    return {
      source: 'smart',
      suggestions: guestMenu.map((m) => m.recipe),
      guestMenu,
      message,
    };
  }

  return {
    source: 'smart',
    suggestions: withReasons(wizardMatches.slice(0, 6), wizardAnswers, language),
    message,
  };
}

export async function getAISuggestions({
  userId,
  wizardAnswers,
  planType,
  guestCount,
  language = 'en',
  useAI = true,
}) {
  const prefs = await getOrCreatePrefs(userId);
  const skippedIds = prefs.skippedRecipes || [];
  const wizardMatches = await filterRecipesByWizard(wizardAnswers, skippedIds, prefs);

  if (wizardAnswers) {
    prefs.wizardHistory = [
      ...(prefs.wizardHistory || []).slice(-9),
      { date: new Date(), answers: wizardAnswers },
    ];
    await prefs.save();
  }

  if (!useAI) {
    return smartFallback({
      wizardMatches,
      wizardAnswers,
      planType,
      language,
      message: language === 'ur' ? 'آپ کے جوابات سے اسمارٹ میچ۔' : 'Smart matches from your answers.',
    });
  }

  const rateCheck = await checkRateLimit(userId);
  if (!rateCheck.allowed) {
    return smartFallback({
      wizardMatches,
      wizardAnswers,
      planType,
      language,
      message:
        language === 'ur'
          ? 'آج AI کی حد پوری۔ اسمارٹ تجاویز دکھا رہے ہیں۔'
          : 'Daily AI limit reached. Showing smart matches.',
    });
  }

  const client = getOpenAIClient();
  if (!client) {
    return smartFallback({
      wizardMatches,
      wizardAnswers,
      planType,
      language,
      message:
        language === 'ur'
          ? 'اسمارٹ تجاویز (OpenAI کلید شامل کریں تو مکمل AI)۔'
          : 'Smart matches ready. Add an OpenAI key for full AI.',
    });
  }

  const likedRecipes = await Recipe.find({ _id: { $in: prefs.likedRecipes || [] } }).limit(5);
  const candidates = wizardMatches.length
    ? wizardMatches.slice(0, 40)
    : await filterRecipesByWizard({}, skippedIds, prefs);
  const season = getCurrentSeason();

  const recipeList = candidates
    .map(
      (r) =>
        `- id: ${r._id}, name: ${r.nameEn} (${r.mealType}, ${r.prepTimeMinutes}min, tags: ${r.tags.join(', ')})`
    )
    .join('\n');

  const langLabel = language === 'ur' ? 'Urdu' : 'English';

  const prompt =
    planType === 'guest'
      ? `Suggest a complete Pakistani guest menu for ${guestCount || 6} people.
Context: ${JSON.stringify(wizardAnswers)}. Season: ${season}.
${buildPreferenceContext(prefs, likedRecipes)}
Available dishes (use exact id):
${recipeList}
Respond in JSON: { "menu": [{ "role": "main|side|drink|dessert", "recipeId": "mongodb id from list", "reason": "short reason in ${langLabel}" }] }`
      : `Suggest 4 Pakistani dishes for today.
Context: ${JSON.stringify(wizardAnswers)}. Season: ${season}. Plan: ${planType}.
${buildPreferenceContext(prefs, likedRecipes)}
Available dishes (use exact id):
${recipeList}
Respond in JSON: { "suggestions": [{ "recipeId": "mongodb id from list", "reason": "short reason in ${langLabel}" }] }`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful Pakistani home cooking assistant. Only suggest dishes from the provided list using exact recipeId values. Keep reasons very simple and warm.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    await incrementRateLimit(prefs);

    const parsed = JSON.parse(completion.choices[0].message.content);
    const idToRecipe = new Map(candidates.map((r) => [r._id.toString(), r]));

    if (planType === 'guest') {
      const menuItems = (parsed.menu || [])
        .map((item) => {
          const recipe = idToRecipe.get(item.recipeId?.toString());
          if (!recipe) return null;
          return {
            recipe: { ...recipe.toObject(), aiReason: item.reason },
            role: item.role,
            reason: item.reason,
          };
        })
        .filter(Boolean);

      if (!menuItems.length) {
        return smartFallback({ wizardMatches, wizardAnswers, planType, language });
      }

      return {
        source: 'ai',
        suggestions: menuItems.map((m) => m.recipe),
        guestMenu: menuItems,
        aiResponse: parsed,
      };
    }

    const matched = (parsed.suggestions || [])
      .map((s) => {
        const recipe = idToRecipe.get(s.recipeId?.toString());
        if (!recipe) return null;
        return { ...recipe.toObject(), aiReason: s.reason };
      })
      .filter(Boolean);

    if (!matched.length) {
      return smartFallback({ wizardMatches, wizardAnswers, planType, language });
    }

    return {
      source: 'ai',
      suggestions: matched,
      aiResponse: parsed,
    };
  } catch {
    return smartFallback({
      wizardMatches,
      wizardAnswers,
      planType,
      language,
      message:
        language === 'ur'
          ? 'AI دستیاب نہیں۔ اسمارٹ تجاویز دکھا رہے ہیں۔'
          : 'AI unavailable. Showing smart matches.',
    });
  }
}

export async function explainRecipe({ userId, recipeId, language = 'en' }) {
  const rateCheck = await checkRateLimit(userId);
  if (!rateCheck.allowed) {
    return { explanation: language === 'ur' ? 'آج AI کی حد پوری ہو گئی۔' : 'Daily AI limit reached.' };
  }

  const client = getOpenAIClient();
  const recipe = await Recipe.findById(recipeId).populate('region occasions');
  if (!recipe) return { explanation: '' };

  if (!client) {
    return {
      explanation: buildSmartReason(recipe, { meal: recipe.mealType }, language),
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Explain in 2 simple sentences why ${recipe.nameEn} is a good dish to cook today. Language: ${
            language === 'ur' ? 'Urdu' : 'English'
          }.`,
        },
      ],
      max_tokens: 120,
    });

    await incrementRateLimit(rateCheck.prefs);

    return { explanation: completion.choices[0].message.content.trim() };
  } catch {
    return {
      explanation: buildSmartReason(recipe, { meal: recipe.mealType }, language),
    };
  }
}

export async function updatePreferences(userId, recipeId, action) {
  let prefs = await UserPreference.findOne({ userId });
  if (!prefs) {
    prefs = await UserPreference.create({ userId });
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) return prefs;

  const rid = recipeId.toString();
  if (action === 'like') {
    if (!prefs.likedRecipes.some((id) => id.toString() === rid)) {
      prefs.likedRecipes.push(recipeId);
    }
    prefs.skippedRecipes = prefs.skippedRecipes.filter((id) => id.toString() !== rid);
  } else if (action === 'skip') {
    if (!prefs.skippedRecipes.some((id) => id.toString() === rid)) {
      prefs.skippedRecipes.push(recipeId);
    }
    prefs.likedRecipes = prefs.likedRecipes.filter((id) => id.toString() !== rid);
  }

  if (recipe.tags.includes('meat')) prefs.inferredTags.prefersMeat = true;
  if (recipe.tags.includes('quick') || recipe.prepTimeMinutes <= 30) {
    prefs.inferredTags.prefersQuick = true;
  }
  if (recipe.region) {
    const populated = await recipe.populate('region');
    prefs.inferredTags.preferredRegion = populated.region?.slug || null;
  }

  await prefs.save();
  return prefs;
}
