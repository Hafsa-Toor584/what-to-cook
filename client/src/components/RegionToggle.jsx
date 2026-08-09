import { useTranslation } from 'react-i18next';
import { regionName } from '../utils/names';

export default function RegionToggle({ enabled, regionId, regions, onEnabledChange, onRegionChange }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';

  return (
    <div className="surface space-y-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-leaf-800">{t('regionBased')}</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onEnabledChange(!enabled)}
          className={`relative h-9 w-16 rounded-full transition ${enabled ? 'bg-leaf-700' : 'bg-leaf-200'}`}
        >
          <span
            className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition ${
              enabled ? 'start-8' : 'start-1'
            }`}
          />
        </button>
      </div>
      {enabled && (
        <select
          className="field"
          value={regionId || ''}
          onChange={(e) => onRegionChange(e.target.value)}
        >
          <option value="">{t('pickRegion')}</option>
          {regions.map((r) => (
            <option key={r._id} value={r._id}>
              {regionName(r, lang)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
