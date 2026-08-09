import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import api from '../api/client';
import { ingredientName, recipeName, stepText } from '../utils/names';
import DishImage from '../components/DishImage';
import SkeletonCard from '../components/SkeletonCard';

export default function RecipeDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const guestCount = params.get('guestCount');
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';

  const [recipe, setRecipe] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('recipe');
  const [checked, setChecked] = useState({});
  const [liked, setLiked] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [busyAction, setBusyAction] = useState('');

  useEffect(() => {
    setMessage('');
    setLiked(false);
    setSkipped(false);
    setExplanation('');
    const q = guestCount ? { guestCount } : undefined;
    api
      .get(`/recipes/${id}`, { params: q })
      .then(({ data }) => setRecipe(data))
      .catch(() => setRecipe(null))
      .finally(() => setLoading(false));

    api
      .get('/preferences')
      .then(({ data }) => {
        const likedIds = (data?.likedRecipes || []).map((r) => (r._id || r).toString());
        const skippedIds = (data?.skippedRecipes || []).map((r) => (r._id || r).toString());
        setLiked(likedIds.includes(id));
        setSkipped(skippedIds.includes(id));
      })
      .catch(() => {});
  }, [id, guestCount]);

  const like = async () => {
    if (busyAction) return;
    setBusyAction('like');
    setMessage('');
    try {
      await api.post(`/recipes/${id}/like`);
      setLiked(true);
      setSkipped(false);
      setMessage(liked ? t('alreadyLiked') : t('likedSaved'));
    } catch {
      setMessage(t('error'));
    } finally {
      setBusyAction('');
    }
  };

  const skip = async () => {
    if (busyAction) return;
    setBusyAction('skip');
    setMessage('');
    try {
      await api.post(`/recipes/${id}/skip`);
      setSkipped(true);
      setLiked(false);
      setMessage(t('skippedSaved'));
      setTimeout(() => navigate('/browse'), 700);
    } catch {
      setMessage(t('error'));
      setBusyAction('');
    }
  };

  const explain = async () => {
    try {
      const { data } = await api.post('/ai/explain', { recipeId: id, language: lang });
      setExplanation(data.explanation);
    } catch (err) {
      setExplanation(err.response?.data?.message || t('error'));
    }
  };

  const toggleCheck = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  if (loading) return <div className="pt-5"><SkeletonCard /></div>;
  if (!recipe) return <p className="pt-5 font-semibold text-red-700">{t('error')}</p>;

  const ingredients = recipe.scaledIngredients || recipe.ingredients || [];

  return (
    <div className="space-y-5 pt-4">
      <div className="relative -mx-4 overflow-hidden animate-pop sm:-mx-6 lg:-mx-8">
        <DishImage recipe={recipe} lang={lang} overlay className="aspect-[5/4] w-full sm:aspect-[16/10]" />
        <button
          type="button"
          className="absolute start-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-leaf-900 shadow-soft backdrop-blur"
          onClick={() => navigate(-1)}
          aria-label={t('back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h1 className={`font-display text-3xl font-extrabold text-white drop-shadow-md ${lang === 'ur' ? 'font-urdu' : ''}`}>
            {recipeName(recipe, lang)}
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm font-bold text-leaf-700">
        <span className="rounded-full bg-leaf-100 px-3 py-1.5">{t('minutes', { count: recipe.prepTimeMinutes })}</span>
        <span className="rounded-full bg-leaf-100 px-3 py-1.5">{t('servings', { count: recipe.servings })}</span>
        {recipe.mealType && (
          <span className="rounded-full bg-spice-100 px-3 py-1.5 text-spice-700">{t(recipe.mealType)}</span>
        )}
        {liked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-800 px-3 py-1.5 text-white">
            <Check className="h-3.5 w-3.5" />
            {t('likedDishes')}
          </span>
        )}
      </div>

      {(recipe.scaledFor || guestCount) && (
        <p className="font-bold text-spice-600">{t('scaledFor', { count: recipe.scaledFor || guestCount })}</p>
      )}

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-leaf-100/80 p-1">
        {['recipe', 'groceries'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-xl py-3 text-sm font-bold transition ${
              tab === key ? 'bg-white text-leaf-900 shadow-sm' : 'text-leaf-600'
            }`}
          >
            {t(key === 'recipe' ? 'steps' : 'ingredients')}
          </button>
        ))}
      </div>

      {tab === 'groceries' ? (
        <section className="surface space-y-3 p-4">
          <ul className="space-y-2">
            {ingredients.map((ing, i) => {
              const key = `${ing.nameEn}-${i}`;
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 font-semibold text-leaf-800 hover:bg-leaf-50">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(checked[key])}
                        onChange={() => toggleCheck(key)}
                        className="h-5 w-5 rounded border-leaf-300"
                      />
                      <span className={lang === 'ur' ? 'font-urdu' : ''}>{ingredientName(ing, lang)}</span>
                    </span>
                    <span>
                      {ing.quantity} {ing.unit}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="surface space-y-3 p-4">
          <ol className="space-y-4">
            {(recipe.steps || []).map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-leaf-600 to-leaf-800 text-sm font-bold text-white shadow-sm">
                  {i + 1}
                </span>
                <p className={`pt-2 font-semibold leading-relaxed text-leaf-800 ${lang === 'ur' ? 'font-urdu' : ''}`}>
                  {stepText(step, lang)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={`btn-primary ${liked ? 'ring-4 ring-leaf-300' : ''}`}
          onClick={like}
          disabled={Boolean(busyAction)}
        >
          {liked ? <Check className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
          {busyAction === 'like' ? t('loading') : t('like')}
        </button>
        <button
          type="button"
          className={`btn-secondary ${skipped ? 'opacity-70' : ''}`}
          onClick={skip}
          disabled={Boolean(busyAction)}
        >
          <ThumbsDown className="h-4 w-4" />
          {busyAction === 'skip' ? t('loading') : t('skip')}
        </button>
      </div>

      {message && (
        <p className="rounded-2xl bg-leaf-100 px-4 py-3 text-center text-sm font-bold text-leaf-800 animate-fade-up">
          {message}
        </p>
      )}

      <button type="button" className="btn-ghost w-full" onClick={explain}>
        <Sparkles className="h-4 w-4" />
        {t('whyThis')}
      </button>

      {explanation && (
        <p className="surface p-4 font-semibold leading-relaxed text-leaf-800">{explanation}</p>
      )}
    </div>
  );
}
