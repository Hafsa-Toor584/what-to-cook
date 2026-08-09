import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function GuestCountPicker({ value, onChange, min = 2, max = 50 }) {
  const { t } = useTranslation();

  return (
    <div className="surface p-5 text-center">
      <p className="mb-4 text-lg font-bold text-leaf-800">{t('howManyGuests')}</p>
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          className="btn-secondary h-14 w-14 rounded-full p-0"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label="decrease"
        >
          <Minus />
        </button>
        <span className="min-w-[4rem] font-display text-5xl font-bold text-leaf-900">{value}</span>
        <button
          type="button"
          className="btn-secondary h-14 w-14 rounded-full p-0"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label="increase"
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}
