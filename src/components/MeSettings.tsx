'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { loadSettings, saveSettings, type UserSettings } from '@/lib/userStore';
import { findCounty } from '@/lib/regions';
import RegionGrid from './RegionGrid';

const DIETS = ['veg', 'nobeef', 'noseafood'] as const;

export default function MeSettings() {
  const t = useTranslations('me');
  const tr = useTranslations('region');
  const td = useTranslations('diets');
  const locale = useLocale();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => setSettings(loadSettings()), []);

  if (!settings) {
    return <div className="card p-4 text-muted">…</div>;
  }

  const persist = (next: UserSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const county = findCounty(settings.region?.countyZh);
  const regionLabel = county
    ? locale === 'en'
      ? county.en
      : county.zh
    : tr('change');
  const dietLabel =
    settings.diet.map((d) => td(d)).join(locale === 'en' ? ', ' : '、') || t('dietNone');

  return (
    <div className="flex flex-col gap-3">
      <div className="card p-4">
        <div className="flex flex-col divide-y divide-border">
          <button
            onClick={() => setPicking((p) => !p)}
            className="flex items-center justify-between py-3.5 text-left"
          >
            <span>
              <b className="block">{t('region')}</b>
              <span className="text-sm text-muted">{regionLabel}</span>
            </span>
            <span className="text-muted">{tr('change')}</span>
          </button>

          <div className="flex items-center justify-between py-3.5">
            <b>{t('servings')}</b>
            <div className="flex items-center overflow-hidden rounded-xl border border-border">
              <button
                type="button"
                disabled={settings.servings <= 1}
                onClick={() => persist({ ...settings, servings: Math.max(1, settings.servings - 1) })}
                className="h-10 w-10 bg-surface text-lg font-bold text-primary disabled:text-border"
              >
                −
              </button>
              <span className="min-w-[44px] text-center font-extrabold tabular-nums">
                {settings.servings}
              </span>
              <button
                type="button"
                disabled={settings.servings >= 8}
                onClick={() => persist({ ...settings, servings: Math.min(8, settings.servings + 1) })}
                className="h-10 w-10 bg-surface text-lg font-bold text-primary disabled:text-border"
              >
                +
              </button>
            </div>
          </div>

          <div className="py-3.5">
            <b>{t('diet')}</b>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIETS.map((d) => {
                const active = settings.diet.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      persist({
                        ...settings,
                        diet: active
                          ? settings.diet.filter((x) => x !== d)
                          : [...settings.diet, d],
                      })
                    }
                    className="chip"
                  >
                    {td(d)}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-muted">{dietLabel}</p>
          </div>
        </div>
      </div>

      {picking && (
        <div className="card p-4">
          <div className="eyebrow mb-3">{tr('pickTitle')}</div>
          <RegionGrid
            valueZh={settings.region?.countyZh}
            onSelect={(zh) => {
              persist({
                ...settings,
                region: { countyZh: zh, districtZh: findCounty(zh)?.districts?.[0]?.zh },
              });
              setPicking(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
