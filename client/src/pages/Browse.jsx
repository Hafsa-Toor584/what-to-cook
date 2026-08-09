import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import DishCard from '../components/DishCard';
import FilterChips from '../components/FilterChips';
import RegionToggle from '../components/RegionToggle';
import { occasionName } from '../utils/names';
import { useAuth } from '../context/AuthContext';

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'];
const seasons = ['winter', 'spring', 'summer', 'monsoon'];

export default function Browse() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';
  const seasonFromUrl = searchParams.get('season') || '';

  const [recipes, setRecipes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [currentSeason, setCurrentSeason] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState(seasons.includes(seasonFromUrl) ? seasonFromUrl : '');
  const [mealType, setMealType] = useState('');
  const [occasion, setOccasion] = useState('');
  const [regionEnabled, setRegionEnabled] = useState(Boolean(user?.preferredRegion));
  const [regionId, setRegionId] = useState(user?.preferredRegion || '');
  const [filtersOpen, setFiltersOpen] = useState(Boolean(seasonFromUrl));

  const hasFilters = Boolean(search || season || mealType || occasion || (regionEnabled && regionId));
  const activeFilterCount = [season, mealType, occasion, regionEnabled && regionId].filter(Boolean).length;

  useEffect(() => {
    if (seasons.includes(seasonFromUrl)) {
      setSeason(seasonFromUrl);
      setFiltersOpen(true);
    }
  }, [seasonFromUrl]);

  useEffect(() => {
    Promise.all([api.get('/regions'), api.get('/occasions'), api.get('/health')])
      .then(([r, o, h]) => {
        setRegions(r.data);
        setOccasions(o.data);
        setCurrentSeason(h.data.season || '');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (season) params.season = season;
    if (mealType) params.mealType = mealType;
    if (occasion) params.occasion = occasion;
    if (regionEnabled && regionId) {
      params.region = regionId;
      params.regionBased = 'true';
    }
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .get('/recipes', { params })
        .then(({ data }) => setRecipes(data))
        .catch(() => setRecipes([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [search, season, mealType, occasion, regionEnabled, regionId]);

  const clearFilters = () => {
    setSearch('');
    setSeason('');
    setMealType('');
    setOccasion('');
    setRegionEnabled(false);
    setRegionId('');
  };

  return (
    <div className="space-y-5 pt-5">
      <header className="animate-fade-up space-y-1">
        <h1 className="font-display text-3xl font-extrabold text-leaf-900">{t('browseDishes')}</h1>
        <p className="font-semibold text-leaf-600">{t('browseHint')}</p>
      </header>

      <div className="animate-fade-up relative" style={{ animationDelay: '60ms' }}>
        <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-leaf-400" />
        <input
          className="field ps-12"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {currentSeason && !season && (
        <button
          type="button"
          onClick={() => setSeason(currentSeason)}
          className="w-full rounded-2xl border border-dashed border-leaf-400/70 bg-leaf-50/90 px-4 py-3 text-start text-sm font-bold text-leaf-800 animate-fade-up"
        >
          {t('seasonHint', { season: t(currentSeason) })}
        </button>
      )}

      <div className="animate-fade-up space-y-3" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="btn-secondary flex-1 justify-between px-4 py-3 text-sm"
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {t('filters')}
              {activeFilterCount > 0 && (
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-leaf-800 px-1.5 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <ChevronDown className={`h-5 w-5 transition ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
          {hasFilters && (
            <button type="button" className="btn-ghost shrink-0 text-sm" onClick={clearFilters}>
              {t('clearFilters')}
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="space-y-4 rounded-[1.75rem] border border-leaf-200/70 bg-white/85 p-4 shadow-soft animate-fade-up">
            <RegionToggle
              enabled={regionEnabled}
              regionId={regionId}
              regions={regions}
              onEnabledChange={setRegionEnabled}
              onRegionChange={setRegionId}
            />

            <div className="space-y-2">
              <p className="font-bold text-leaf-800">{t('season')}</p>
              <FilterChips
                options={seasons.map((s) => ({ id: s, label: t(s) }))}
                value={season}
                onChange={setSeason}
                getLabel={(o) => o.label}
              />
            </div>

            <div className="min-w-0 space-y-2">
              <p className="font-bold text-leaf-800">{t('mealType')}</p>
              <FilterChips
                layout="grid"
                options={mealTypes.map((m) => ({ id: m, label: t(m) }))}
                value={mealType}
                onChange={setMealType}
                getLabel={(o) => o.label}
              />
            </div>

            <div className="min-w-0 space-y-2">
              <p className="font-bold text-leaf-800">{t('occasion')}</p>
              <FilterChips
                layout="grid"
                options={occasions.map((o) => ({
                  id: o._id,
                  label: `${o.icon || ''} ${occasionName(o, lang)}`.trim(),
                }))}
                value={occasion}
                onChange={setOccasion}
                getLabel={(o) => o.label}
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon="🍲"
          title={t('noResults')}
          message={t('tryDifferent')}
          action={
            hasFilters ? (
              <button type="button" className="btn-primary mt-2" onClick={clearFilters}>
                {t('clearFilters')}
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-bold text-leaf-600">{t('dishCount', { count: recipes.length })}</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe, i) => (
              <div key={recipe._id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}>
                <DishCard recipe={recipe} onClick={() => navigate(`/recipes/${recipe._id}`)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
