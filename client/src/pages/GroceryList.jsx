import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Copy, MessageCircle, Share2 } from 'lucide-react';
import api from '../api/client';
import { ingredientName } from '../utils/names';

export default function GroceryList() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith('ur') ? 'ur' : 'en';
  const [data, setData] = useState(null);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [shareNote, setShareNote] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(`/plans/${id}/groceries`)
      .then(({ data: payload }) => {
        if (alive) setData(payload);
      })
      .catch(() => {
        if (alive) setData(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!shareNote) return undefined;
    const timer = setTimeout(() => setShareNote(''), 2500);
    return () => clearTimeout(timer);
  }, [shareNote]);

  const shareText = useMemo(() => {
    if (!data) return '';
    const lines = [`${t('groceryList')} — ${t('appName')}`];
    if (data.guestCount) lines.push(t('forPeople', { count: data.guestCount }));
    lines.push('');
    for (const item of data.items || []) {
      lines.push(`• ${ingredientName(item, lang)} — ${item.quantity} ${item.unit}`);
    }
    return lines.join('\n');
  }, [data, lang, t]);

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setShareNote(t('copied'));
    } catch {
      setShareNote(t('copyFailed'));
    }
  };

  const shareList = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t('groceryList'), text: shareText });
        return;
      } catch {
        // Share sheet dismissed or unavailable; fall back to clipboard
      }
    }
    copyList();
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
  };

  if (loading) return <p className="font-semibold text-leaf-700">{t('loading')}</p>;
  if (!data) return <p className="font-semibold text-red-700">{t('error')}</p>;

  return (
    <div className="space-y-5 pt-5">
      <header className="flex items-center gap-3">
        <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-leaf-900">{t('groceryList')}</h1>
          <p className="text-sm font-semibold text-leaf-600">
            {t('items', { count: data.itemCount || data.items?.length || 0 })}
            {data.guestCount ? ` · ${t('forPeople', { count: data.guestCount })}` : ''}
          </p>
        </div>
      </header>

      {(data.items || []).length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={shareList}>
              <Share2 className="h-5 w-5" />
              {t('share')}
            </button>
            <button type="button" className="btn-secondary" onClick={shareOnWhatsApp}>
              <MessageCircle className="h-5 w-5" />
              {t('whatsapp')}
            </button>
            <button type="button" className="btn-secondary" onClick={copyList}>
              <Copy className="h-5 w-5" />
              {t('copy')}
            </button>
          </div>
          {shareNote && (
            <p className="flex items-center gap-2 font-bold text-leaf-700">
              <Check className="h-4 w-4" />
              {shareNote}
            </p>
          )}
        </div>
      )}

      <ul className="space-y-2">
        {(data.items || []).map((item, i) => {
          const key = `${item.nameEn}-${item.unit}-${i}`;
          const done = checked[key];
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setChecked((c) => ({ ...c, [key]: !c[key] }))}
                className={`surface flex w-full items-start gap-3 p-4 text-start transition ${
                  done ? 'opacity-60' : ''
                }`}
              >
                <span
                  className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${
                    done ? 'border-leaf-700 bg-leaf-700 text-white' : 'border-leaf-300'
                  }`}
                >
                  {done ? '✓' : ''}
                </span>
                <span className="flex-1">
                  <span
                    className={`block text-lg font-extrabold text-leaf-900 ${done ? 'line-through' : ''} ${
                      lang === 'ur' ? 'font-urdu' : ''
                    }`}
                  >
                    {ingredientName(item, lang)}
                  </span>
                  <span className="font-semibold text-leaf-700">
                    {item.quantity} {item.unit}
                  </span>
                  {item.fromRecipes?.length > 0 && (
                    <span className="mt-1 block text-xs font-semibold text-leaf-500">
                      {t('fromRecipes', { names: item.fromRecipes.join(', ') })}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
