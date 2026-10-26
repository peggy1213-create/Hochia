'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadSettings, saveSettings, type UserSettings } from '@/lib/userStore';
import { COUNTIES, findCounty } from '@/lib/regions';
import RegionGrid from './RegionGrid';

const DIETS = ['veg', 'nobeef', 'noseafood'] as const;

export default function FirstRunSetup() {
  const t = useTranslations('setup');
  const td = useTranslations('diets');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    if (!s.setupDone) setOpen(true);
  }, []);

  if (!open || !settings) return null;

  const patch = (p: Partial<UserSettings>) => setSettings((s) => ({ ...s!, ...p }));
  const finish = () => {
    saveSettings({ ...settings, setupDone: true });
    setOpen(false);
  };
  const toggleDiet = (d: string) =>
    patch({ diet: settings.diet.includes(d) ? settings.diet.filter((x) => x !== d) : [...settings.diet, d] });

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-ink/50">
      <div
        className="max-h-[92%] w-full max-w-[430px] mx-auto overflow-y-auto rounded-t-[22px] bg-ground px-5 pt-6"
        style={{ paddingBottom: 'calc(22px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mb-4 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-[7px] rounded-full ${i === step ? 'w-[18px] bg-primary' : 'w-[7px] bg-border'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-black text-balance">{t('welcomeTitle')}</h3>
            <p className="-mt-2 text-muted">{t('welcomeBody')}</p>
            <button onClick={() => setStep(1)} className="btn-primary w-full">
              {t('next')}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-black">{t('areaTitle')}</h3>
            <p className="-mt-2 text-muted">{t('areaBody')}</p>
            <RegionGrid
              valueZh={settings.region?.countyZh}
              onSelect={(zh) => patch({ region: { countyZh: zh, districtZh: findCounty(zh)?.districts?.[0]?.zh } })}
            />
            <button onClick={() => setStep(2)} className="btn-primary w-full">
              {t('next')}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-black">{t('prefsTitle')}</h3>
            <p className="-mt-2 text-muted">{t('prefsBody')}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-xl border border-border">
                <button
                  type="button"
                  disabled={settings.servings <= 1}
                  onClick={() => patch({ servings: Math.max(1, settings.servings - 1) })}
                  className="h-11 w-11 bg-surface text-xl font-bold text-primary disabled:text-border"
                >
                  −
                </button>
                <span className="min-w-[52px] text-center text-lg font-extrabold tabular-nums">
                  {settings.servings}
                </span>
                <button
                  type="button"
                  disabled={settings.servings >= 8}
                  onClick={() => patch({ servings: Math.min(8, settings.servings + 1) })}
                  className="h-11 w-11 bg-surface text-xl font-bold text-primary disabled:text-border"
                >
                  +
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {DIETS.map((d) => {
                const active = settings.diet.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleDiet(d)}
                    className={`min-h-[52px] rounded-xl border px-2 font-bold ${
                      active
                        ? 'border-primary bg-[#E6F0E0] text-[color:var(--primary-hover)]'
                        : 'border-border bg-surface text-ink'
                    }`}
                  >
                    {td(d)}
                  </button>
                );
              })}
            </div>
            <button onClick={finish} className="btn-primary w-full">
              {t('start')}
            </button>
          </div>
        )}

        <button
          onClick={finish}
          className="mx-auto mt-3 block min-h-[40px] text-sm font-semibold text-muted"
        >
          {t('skip')}
        </button>
      </div>
    </div>
  );
}
