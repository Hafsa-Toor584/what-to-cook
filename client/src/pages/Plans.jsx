import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

const typeLabel = {
  daily: 'today',
  weekly: 'thisWeek',
  monthly: 'thisMonth',
  guest: 'guestsComing',
};

export default function Plans() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/plans')
      .then(({ data }) => setPlans(data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 pt-5">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl font-extrabold text-leaf-900">{t('yourPlans')}</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {['daily', 'weekly', 'monthly', 'guest'].map((type) => (
          <button
            key={type}
            type="button"
            className="btn-secondary"
            onClick={() => navigate(type === 'guest' ? '/plans/new/guest' : `/plans/new/${type}`)}
          >
            {t(typeLabel[type])}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-semibold text-leaf-700">{t('loading')}</p>
      ) : plans.length === 0 ? (
        <p className="font-semibold text-leaf-700">{t('emptyPlan')}</p>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Link
              key={plan._id}
              to={`/plans/${plan._id}`}
              className="surface block p-4 transition hover:bg-white"
            >
              <p className="text-lg font-extrabold text-leaf-900">{t(typeLabel[plan.type] || 'plans')}</p>
              <p className="text-sm font-semibold text-leaf-600">
                {new Date(plan.startDate || plan.createdAt).toLocaleDateString()}
                {plan.guestCount ? ` · ${t('forPeople', { count: plan.guestCount })}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
