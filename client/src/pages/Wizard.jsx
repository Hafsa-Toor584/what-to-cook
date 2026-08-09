import { useMemo, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { ArrowLeft, Sparkles } from 'lucide-react';

import api from '../api/client';

import DishCard from '../components/DishCard';

import WizardStep from '../components/WizardStep';

import SkeletonCard from '../components/SkeletonCard';

import EmptyState from '../components/EmptyState';



const roleLabels = {

  main: 'roleMain',

  side: 'roleSide',

  drink: 'roleDrink',

  dessert: 'roleDessert',

};



export default function Wizard() {

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const [params] = useSearchParams();

  const planId = params.get('planId');

  const planType = params.get('planType') || 'daily';

  const guestCount = Number(params.get('guestCount')) || undefined;

  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';



  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState({

    who: '',

    meal: '',

    time: '',

    preference: '',

    occasion: 'none',

  });

  const [results, setResults] = useState(null);

  const [guestMenu, setGuestMenu] = useState(null);

  const [source, setSource] = useState('');

  const [banner, setBanner] = useState('');

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');



  const steps = useMemo(

    () => [

      {

        key: 'who',

        title: t('whoEating'),

        options: [

          { value: 'me', label: t('justMe'), icon: '🧍' },

          { value: 'family', label: t('family'), icon: '👨‍👩‍👧‍👦' },

          { value: 'guests', label: t('guests'), icon: '🎉' },

        ],

      },

      {

        key: 'meal',

        title: t('whatMeal'),

        options: [

          { value: 'breakfast', label: t('breakfast'), icon: '🍳' },

          { value: 'lunch', label: t('lunch'), icon: '🍛' },

          { value: 'dinner', label: t('dinner'), icon: '🌙' },

        ],

      },

      {

        key: 'time',

        title: t('howMuchTime'),

        options: [

          { value: 'quick', label: t('quick'), icon: '⚡' },

          { value: 'normal', label: t('normal'), icon: '⏱️' },

          { value: 'allday', label: t('allDay'), icon: '🕐' },

        ],

      },

      {

        key: 'preference',

        title: t('preference'),

        options: [

          { value: 'meat', label: t('meat'), icon: '🍖' },

          { value: 'veg', label: t('veg'), icon: '🥗' },

          { value: 'both', label: t('both'), icon: '🍽️' },

        ],

      },

      {

        key: 'occasion',

        title: t('anyOccasion'),

        options: [

          { value: 'none', label: t('none'), icon: '✨' },

          { value: 'ramadan-iftar', label: t('ramadan'), icon: '🕌' },

          { value: 'eid-ul-fitr', label: t('eid'), icon: '🌙' },

          { value: 'guest-visit', label: t('guests'), icon: '👥' },

        ],

      },

    ],

    [t]

  );



  const current = steps[step];

  const showingResults = Boolean(results);



  const wizardPayload = () => ({

    ...answers,

    preference: answers.preference === 'both' ? undefined : answers.preference,

  });



  const fetchSuggestions = async () => {

    setBusy(true);

    setError('');

    setBanner('');

    try {

      const { data } = await api.post('/ai/suggest', {

        wizardAnswers: wizardPayload(),

        planType,

        guestCount,

        language: lang,

        useAI: true,

      });

      setResults(data.suggestions || []);

      setGuestMenu(data.guestMenu || null);

      setSource(data.source || 'wizard');

      if (data.message) setBanner(data.message);

    } catch (err) {

      setError(err.response?.data?.message || t('error'));

    } finally {

      setBusy(false);

    }

  };



  const onPickOption = (value) => {

    const key = current.key;

    setAnswers({ ...answers, [key]: value });

    if (step < steps.length - 1) {

      setStep(step + 1);

    }

  };



  const addToPlan = async (recipe) => {

    if (!planId) {

      navigate(`/recipes/${recipe._id}${guestCount ? `?guestCount=${guestCount}` : ''}`);

      return;

    }

    try {

      const { data: plan } = await api.get(`/plans/${planId}`);

      const days = (plan.days || []).map((day, idx) => {

        const meals = {

          breakfast: (day.meals?.breakfast || []).map((x) => x._id || x),

          lunch: (day.meals?.lunch || []).map((x) => x._id || x),

          dinner: (day.meals?.dinner || []).map((x) => x._id || x),

        };

        if (idx === 0) {

          const slot = answers.meal || 'lunch';

          const list = meals[slot] || [];

          if (!list.includes(recipe._id)) list.push(recipe._id);

          meals[slot] = list;

        }

        return { ...day, meals };

      });

      await api.put(`/plans/${planId}`, { days });

      await api.post(`/recipes/${recipe._id}/like`).catch(() => {});

      navigate(`/plans/${planId}`);

    } catch {

      navigate(`/recipes/${recipe._id}`);

    }

  };



  const renderGuestMenu = () => {

    if (!guestMenu?.length) return null;

    const byRole = guestMenu.reduce((acc, item) => {

      const role = item.role || 'main';

      if (!acc[role]) acc[role] = [];

      acc[role].push(item);

      return acc;

    }, {});



    return Object.entries(byRole).map(([role, items]) => (

      <div key={role} className="space-y-3">

        <h3 className="font-display text-lg font-bold text-leaf-800">{t(roleLabels[role] || role)}</h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {items.map(({ recipe, reason }) => (

            <DishCard

              key={recipe._id}

              recipe={recipe}

              reason={reason}

              onClick={() => addToPlan(recipe)}

              action={<span className="mt-2 block text-sm font-bold text-spice-600">{t('addToPlan')}</span>}

            />

          ))}

        </div>

      </div>

    ));

  };



  return (

    <div className="space-y-5 pt-5">

      <header className="flex items-center gap-3">

        <button

          type="button"

          className="btn-ghost"

          onClick={() => {

            if (showingResults) {

              setResults(null);

              setGuestMenu(null);

              return;

            }

            if (step > 0) setStep(step - 1);

            else navigate(-1);

          }}

        >

          <ArrowLeft className="h-5 w-5" />

        </button>

        <h1 className="font-display text-2xl font-bold text-leaf-900">{t('wizardTitle')}</h1>

      </header>



      {!showingResults && (

        <>

          <div className="flex gap-2">

            {steps.map((_, i) => (

              <span

                key={i}

                className={`h-2.5 flex-1 rounded-full transition ${i <= step ? 'bg-leaf-700' : 'bg-leaf-200'}`}

              />

            ))}

          </div>

          <WizardStep

            title={current.title}

            options={current.options}

            value={answers[current.key]}

            onChange={onPickOption}

          />

          {step === steps.length - 1 && answers.occasion && (

            <button

              type="button"

              className="btn-primary w-full"

              disabled={busy || !answers.meal}

              onClick={fetchSuggestions}

            >

              <Sparkles className="h-5 w-5" />

              {busy ? t('loading') : t('getSuggestions')}

            </button>

          )}

        </>

      )}



      {busy && (

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <SkeletonCard />

          <SkeletonCard />

          <SkeletonCard />

        </div>

      )}



      {showingResults && !busy && (

        <div className="space-y-4 animate-fade-up">

          <div>

            <h2 className="font-display text-2xl font-bold text-leaf-900">{t('suggestions')}</h2>

            <p className="font-semibold text-leaf-600">

              {source === 'ai' ? t('fromAI') : source === 'smart' ? t('fromSmart') : t('fromWizard')}

            </p>

          </div>



          {banner && (

            <p className="rounded-2xl bg-spice-100 px-4 py-3 text-sm font-bold text-spice-700">{banner}</p>

          )}

          {error && <p className="font-semibold text-red-700">{error}</p>}



          {planType === 'guest' && guestMenu?.length ? (

            renderGuestMenu()

          ) : results.length === 0 ? (

            <EmptyState icon="🔍" title={t('noResults')} message={t('tryDifferent')} />

          ) : (

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {results.map((recipe) => (

                <DishCard

                  key={recipe._id}

                  recipe={recipe}

                  onClick={() => addToPlan(recipe)}

                  action={<span className="mt-2 block text-sm font-bold text-spice-600">{t('addToPlan')}</span>}

                />

              ))}

            </div>

          )}

        </div>

      )}

    </div>

  );

}


