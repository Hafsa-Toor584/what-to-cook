import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChefHat } from 'lucide-react';
import api from '../api/client';
import GuestCountPicker from '../components/GuestCountPicker';
import { occasionName } from '../utils/names';

export default function GuestPlan() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';
  const [step, setStep] = useState(1);
  const [guestCount, setGuestCount] = useState(8);
  const [occasions, setOccasions] = useState([]);
  const [occasionId, setOccasionId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/occasions')
      .then(({ data }) => setOccasions(data))
      .catch(() => {});
  }, []);

  const createPlan = async (goWizard) => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/plans', {
        type: 'guest',
        startDate: new Date().toISOString(),
        guestCount,
        occasionId: occasionId || null,
        isGuestMenu: true,
      });
      if (goWizard) {
        navigate(`/wizard?planId=${data._id}&planType=guest&guestCount=${guestCount}`);
      } else {
        navigate(`/plans/${data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 pt-5">
      <header className="flex items-center gap-3">
        <button type="button" className="btn-ghost" onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-leaf-900">{t('guestsComing')}</h1>
      </header>

      {step === 1 && (
        <div className="animate-fade-up space-y-4">
          <GuestCountPicker value={guestCount} onChange={setGuestCount} />
          <button type="button" className="btn-primary w-full" onClick={() => setStep(2)}>
            {t('next')}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-up space-y-4">
          <div className="surface space-y-3 p-4">
            <p className="text-lg font-bold text-leaf-800">
              {t('whyComing')} <span className="text-sm font-semibold text-leaf-500">({t('optional')})</span>
            </p>
            <div className="grid gap-2">
              <button
                type="button"
                className={`chip ${!occasionId ? 'chip-active' : ''}`}
                onClick={() => setOccasionId('')}
              >
                {t('none')}
              </button>
              {occasions.map((o) => (
                <button
                  key={o._id}
                  type="button"
                  className={`chip justify-start ${occasionId === o._id ? 'chip-active' : ''}`}
                  onClick={() => setOccasionId(o._id)}
                >
                  <span>{o.icon}</span>
                  {occasionName(o, lang)}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="font-semibold text-red-700">{error}</p>}
          <button type="button" className="btn-primary w-full" disabled={busy} onClick={() => createPlan(true)}>
            <ChefHat className="h-5 w-5" />
            {busy ? t('loading') : t('helpMeDecide')}
          </button>
          <button type="button" className="btn-secondary w-full" disabled={busy} onClick={() => createPlan(false)}>
            {t('illPick')}
          </button>
        </div>
      )}
    </div>
  );
}
