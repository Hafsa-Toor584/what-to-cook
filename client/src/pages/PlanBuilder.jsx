import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, ShoppingBasket, X } from 'lucide-react';
import api from '../api/client';
import DishCard from '../components/DishCard';
import { recipeName } from '../utils/names';
import { useAuth } from '../context/AuthContext';

const mealSlots = ['breakfast', 'lunch', 'dinner'];

function recipeIdOf(item) {
  if (!item) return null;
  if (typeof item === 'string') return item;
  return item._id || item.id;
}

export default function PlanBuilder() {
  const { id, type: newType } = useParams();
  const isNew = Boolean(newType);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      setError('');
      try {
        if (isNew) {
          const { data } = await api.post('/plans', {
            type: newType,
            startDate: new Date().toISOString(),
            regionFilter: user?.preferredRegion
              ? { enabled: true, regionId: user.preferredRegion }
              : { enabled: false, regionId: null },
          });
          navigate(`/plans/${data._id}`, { replace: true });
          return;
        }
        const { data } = await api.get(`/plans/${id}`);
        setPlan(data);
      } catch (err) {
        setError(err.response?.data?.message || t('error'));
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [id, isNew, newType]);

  useEffect(() => {
    if (!picker) return;
    api
      .get('/recipes', { params: { mealType: picker.meal } })
      .then(({ data }) => setRecipes(data))
      .catch(() => setRecipes([]));
  }, [picker]);

  const days = useMemo(() => plan?.days || [], [plan]);

  const updateMeals = async (dayIndex, meal, nextIds) => {
    if (!plan) return;
    const nextDays = days.map((day, i) => {
      if (i !== dayIndex) return day;
      return {
        ...day,
        meals: {
          breakfast: (day.meals?.breakfast || []).map(recipeIdOf).filter(Boolean),
          lunch: (day.meals?.lunch || []).map(recipeIdOf).filter(Boolean),
          dinner: (day.meals?.dinner || []).map(recipeIdOf).filter(Boolean),
          [meal]: nextIds,
        },
      };
    });
    setSaving(true);
    try {
      const { data } = await api.put(`/plans/${plan._id}`, { days: nextDays });
      setPlan(data);
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    } finally {
      setSaving(false);
    }
  };

  const addRecipe = async (recipe) => {
    if (!picker) return;
    const current = (days[picker.dayIndex]?.meals?.[picker.meal] || []).map(recipeIdOf).filter(Boolean);
    if (!current.includes(recipe._id)) {
      await updateMeals(picker.dayIndex, picker.meal, [...current, recipe._id]);
      try {
        await api.post(`/recipes/${recipe._id}/like`);
      } catch {
        /* optional */
      }
    }
    setPicker(null);
  };

  const removeRecipe = async (dayIndex, meal, recipeId) => {
    const current = (days[dayIndex]?.meals?.[meal] || []).map(recipeIdOf).filter(Boolean);
    await updateMeals(
      dayIndex,
      meal,
      current.filter((x) => x !== recipeId)
    );
  };

  if (loading || isNew) {
    return <p className="font-semibold text-leaf-700">{t('loading')}</p>;
  }

  if (!plan) {
    return <p className="font-semibold text-red-700">{error || t('error')}</p>;
  }

  return (
    <div className="space-y-5 pt-5">
      <header className="flex items-center gap-3 animate-fade-up">
        <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-leaf-900">
            {t(plan.type === 'daily' ? 'today' : plan.type === 'weekly' ? 'thisWeek' : plan.type === 'monthly' ? 'thisMonth' : 'guestsComing')}
          </h1>
          {saving && <p className="text-sm font-semibold text-leaf-600">{t('loading')}</p>}
        </div>
      </header>

      {error && <p className="font-semibold text-red-700">{error}</p>}

      <div className="space-y-4">
        {days.map((day, dayIndex) => (
          <section key={day.date || dayIndex} className="surface space-y-3 p-4">
            <h2 className="font-extrabold text-leaf-900">
              {plan.type === 'daily'
                ? t('today')
                : t('day', { n: dayIndex + 1 })}
              <span className="ms-2 text-sm font-semibold text-leaf-600">
                {day.date ? new Date(day.date).toLocaleDateString() : ''}
              </span>
            </h2>
            {mealSlots.map((meal) => {
              const items = day.meals?.[meal] || [];
              return (
                <div key={meal} className="rounded-2xl bg-leaf-50/80 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-bold text-leaf-800">{t(meal)}</p>
                    <button
                      type="button"
                      className="btn-ghost text-sm"
                      onClick={() => setPicker({ dayIndex, meal })}
                    >
                      <Plus className="h-4 w-4" />
                      {t('pickDish')}
                    </button>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-sm font-semibold text-leaf-600">{t('emptyPlan')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((item) => {
                        const rid = recipeIdOf(item);
                        const label =
                          typeof item === 'object'
                            ? recipeName(item, lang)
                            : rid;
                        return (
                          <li
                            key={rid}
                            className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2"
                          >
                            <Link className="font-bold text-leaf-900" to={`/recipes/${rid}`}>
                              {label}
                            </Link>
                            <button
                              type="button"
                              className="text-leaf-600"
                              onClick={() => removeRecipe(dayIndex, meal, rid)}
                              aria-label={t('remove')}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>
        ))}
      </div>

      <Link to={`/plans/${plan._id}/groceries`} className="btn-primary w-full">
        <ShoppingBasket className="h-5 w-5" />
        {t('viewGroceries')}
      </Link>

      {picker && (
        <div className="fixed inset-0 z-50 flex items-end bg-leaf-950/40 p-3 sm:items-center sm:justify-center">
          <div className="surface max-h-[85vh] w-full max-w-lg overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-leaf-900">
                {t('pickDish')} · {t(picker.meal)}
              </h3>
              <button type="button" className="btn-ghost" onClick={() => setPicker(null)}>
                <X />
              </button>
            </div>
            <div className="grid gap-3">
              {recipes.map((recipe) => (
                <DishCard key={recipe._id} recipe={recipe} onClick={() => addRecipe(recipe)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
