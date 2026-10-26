'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadSettings } from '@/lib/userStore';
import { findCounty } from '@/lib/regions';
import { weekForCounty, type FoodGroup } from '@/lib/weekData';

const GROUPS: Array<'all' | FoodGroup> = ['all', 'veg', 'pro', 'grain'];
const GK: Record<string, 'groupAll' | 'groupVeg' | 'groupPro' | 'groupGrain'> = {
  all: 'groupAll',
  veg: 'groupVeg',
  pro: 'groupPro',
  grain: 'groupGrain',
};

export default function ThisWeekClient() {
  const t = useTranslations('thisWeek');
  const locale = useLocale();
  const [countyZh, setCountyZh] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [group, setGroup] = useState<'all' | FoodGroup>('all');

  useEffect(() => {
    setCountyZh(loadSettings().region?.countyZh);
    setReady(true);
  }, []);

  if (!ready) return null;

  const county = findCounty(countyZh);
  const countyName = county ? (locale === 'en' ? county.en : county.zh) : '—';
  const items = weekForCounty(countyZh);

  if (!items) {
    return (
      <Link href="/me" className="card block p-6 text-center text-muted">
        {t('cityOnly')}
      </Link>
    );
  }

  const hero = items[0];
  const filtered = group === 'all' ? items : items.filter((i) => i.group === group);

  return (
    <>
      <div
        className="rounded-card p-[18px] text-white"
        style={{ background: 'linear-gradient(135deg,#2F6B3F,#3C864F)' }}
      >
        <div className="text-xs font-bold uppercase tracking-wider text-white/85">
          {t('heroEyebrow')}
        </div>
        <div className="text-[27px] font-black leading-tight">{hero.name}</div>
        <div className="opacity-90">{t('atSchools', { n: hero.schools })}</div>
        {hero.peak && (
          <span className="mt-3 inline-block rounded-full bg-accent px-2.5 py-1 text-xs font-extrabold text-ink">
            {t('inSeasonNow')}
          </span>
        )}
      </div>

      <h2 className="text-lg font-extrabold">{t('ranked')}</h2>
      <p className="text-sm text-muted">{t('note', { county: countyName })}</p>

      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <button key={g} className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>
            {t(GK[g])}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <ul className="flex flex-col divide-y divide-border">
          {filtered.map((w, i) => (
            <li key={i} className="flex items-center gap-3 py-3.5">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-tint text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" strokeLinejoin="round">
                  <path d="M6 8h12l-1 11a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 19Z" />
                  <path d="M9 8a3 3 0 0 1 6 0" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <b className="block">
                  {w.name}{' '}
                  {w.peak && (
                    <span className="ml-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-ink">
                      {t('inSeason')}
                    </span>
                  )}
                </b>
                <span className="text-sm text-muted">
                  {t('atSchools', { n: w.schools })} · {t(GK[w.group])}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
