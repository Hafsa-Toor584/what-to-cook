import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChefHat, Search, Snowflake, Sun, CloudRain, Flower2, Users, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DishCard from '../components/DishCard';
import SkeletonCard from '../components/SkeletonCard';
import { recipeName } from '../utils/names';

const seasonIcons = {
  winter: Snowflake,
  spring: Flower2,
  summer: Sun,
  monsoon: CloudRain,
};

const planCards = [
  { type: 'daily', labelKey: 'today', icon: ChefHat },
  { type: 'weekly', labelKey: 'thisWeek', icon: CalendarDays },
  { type: 'monthly', labelKey: 'thisMonth', icon: CalendarDays },
  { type: 'guest', labelKey: 'guestsComing', icon: Users },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';
  const [season, setSeason] = useState('winter');
  const [featured, setFeatured] = useState([]);
  const [creating, setCreating] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    api
      .get('/health')
      .then(({ data }) => {
        setSeason(data.season || 'winter');
        return api.get('/recipes', { params: { season: data.season } });
      })
      .then(({ data }) => {
        if (data?.length) {
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setFeatured(shuffled.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  const SeasonIcon = seasonIcons[season] || Snowflake;
  const heroRecipe = featured[0];
  const heroImage = !heroFailed && heroRecipe?.imageUrl ? heroRecipe.imageUrl : null;
  const firstName = user?.name?.split(' ')[0] || '';

  const startPlan = async (type) => {
    if (type === 'guest') {
      navigate('/plans/new/guest');
      return;
    }
    setCreating(true);
    try {
      const preferredRegion = user?.preferredRegion?._id || user?.preferredRegion;
      const { data } = await api.post('/plans', {
        type,
        startDate: new Date().toISOString(),
        regionFilter: preferredRegion
          ? { enabled: true, regionId: preferredRegion }
          : { enabled: false, regionId: null },
      });
      navigate(`/plans/${data._id}`);
    } catch {
      navigate(`/plans/new/${type}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
        <div className="relative min-h-[58vh] sm:min-h-[62vh]">
          {heroImage ? (
            <img
              src={heroImage}
              alt={heroRecipe ? recipeName(heroRecipe, lang) : t('appName')}
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover animate-hero-zoom"
              onError={() => setHeroFailed(true)}
            />
          ) : (
            <div
              className="absolute inset-0 animate-hero-zoom"
              style={{
                background:
                  'radial-gradient(ellipse 90% 60% at 30% 20%, rgba(232,146,26,0.45), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 40%, rgba(151,192,162,0.35), transparent 50%), linear-gradient(160deg, #1e3a2a 0%, #2c563c 45%, #a35c0d 120%)',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-[var(--bg-top)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-top)] via-transparent to-transparent" />

          <div className="relative mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-between px-4 pb-10 pt-5 sm:min-h-[62vh] sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-2xl font-extrabold tracking-tight text-white drop-shadow-md animate-fade-up sm:text-3xl">
                {t('appName')}
              </p>
              <LanguageSwitcher light />
            </div>

            <div className="max-w-xl space-y-4 animate-fade-up" style={{ animationDelay: '80ms' }}>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-spice-200">
                {t('hello', { name: firstName })}
              </p>
              <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-white drop-shadow-md sm:text-5xl lg:text-6xl">
                {t('whatToday')}
              </h1>
              <p className="text-lg font-semibold text-white/90 sm:text-xl">{t('tagline')}</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/wizard" className="btn-accent inline-flex shadow-lift">
                  <ChefHat className="h-5 w-5" />
                  {t('helpMeDecide')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/browse" className="btn-secondary inline-flex bg-white/90">
                  <Search className="h-5 w-5" />
                  {t('browseDishes')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 animate-fade-up">
        <button
          type="button"
          onClick={() => navigate(`/browse?season=${season}`)}
          className="inline-flex items-center gap-2 rounded-full bg-leaf-800 px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-leaf-900 active:scale-95"
        >
          <SeasonIcon className="h-4 w-4" />
          {t('seasonBadge', { season: t(season) })}
          <ArrowRight className="h-4 w-4 opacity-80" />
        </button>
      </div>

      <section className="space-y-3 animate-fade-up">
        <h2 className="font-display text-xl font-bold text-leaf-900 sm:text-2xl">{t('createPlan')}</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {planCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <button
                key={card.type}
                type="button"
                disabled={creating}
                onClick={() => startPlan(card.type)}
                style={{ animationDelay: `${i * 50}ms` }}
                className="animate-fade-up flex min-h-[7.5rem] flex-col items-start justify-between rounded-[1.5rem] border border-leaf-200/80 bg-white/85 p-4 text-start shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.98]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-100 text-leaf-800">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-base font-extrabold leading-tight text-leaf-900">{t(card.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 animate-fade-up">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-leaf-900 sm:text-2xl">{t('todaysPick')}</h2>
          <Link to="/browse" className="text-sm font-bold text-leaf-700 underline-offset-2 hover:underline">
            {t('browseDishes')}
          </Link>
        </div>
        {featured.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((recipe) => (
              <DishCard
                key={recipe._id}
                featured
                recipe={recipe}
                onClick={() => navigate(`/recipes/${recipe._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
      </section>
    </div>
  );
}
