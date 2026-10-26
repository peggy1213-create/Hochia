'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadSettings } from '@/lib/userStore';
import { findCounty } from '@/lib/regions';
import { monthRange, type Crop, type FoodGroup } from '@/lib/moa';

const GROUPS: Array<'all' | FoodGroup> = ['all', 'fruit', 'veg', 'grain'];
const GROUP_KEY: Record<string, 'groupAll' | 'groupFruit' | 'groupVeg' | 'groupGrain'> = {
  all: 'groupAll',
  fruit: 'groupFruit',
  veg: 'groupVeg',
  grain: 'groupGrain',
};

export default function InSeasonClient({ crops, month }: { crops: Crop[]; month: number }) {
  const t = useTranslations('inSeason');
  const locale = useLocale();
  const [countyZh, setCountyZh] = useState<string | undefined>(undefined);
  const [scope, setScope] = useState<'local' | 'all'>('local');
  const [group, setGroup] = useState<'all' | FoodGroup>('all');

  useEffect(() => {
    setCountyZh(loadSettings().region?.countyZh);
  }, []);

  const county = findCounty(countyZh);
  const countyName = county ? (locale === 'en' ? county.en : county.zh) : '';

  const { items, widened } = useMemo(() => {
    let list = crops;
    if (group !== 'all') list = list.filter((c) => c.group === group);
    let w = false;
    if (scope === 'local' && countyZh) {
      const loc = list.filter((c) => c.counties.includes(countyZh));
      if (loc.length) list = loc;
      else w = true;
    }
    return { items: list, widened: w };
  }, [crops, group, scope, countyZh]);

  const monthWord = t('monthWord');

  return (
    <>
      <h1 className="text-xl font-extrabold text-balance">{t('titleMonth', { month })}</h1>
      <p className="text-muted">{t('intro')}</p>

      <div className="flex flex-wrap gap-2">
        <button className="chip" aria-pressed={scope === 'local'} onClick={() => setScope('local')}>
          {t('local', { county: countyName || '—' })}
        </button>
        <button className="chip" aria-pressed={scope === 'all'} onClick={() => setScope('all')}>
          {t('all')}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <button key={g} className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>
            {t(GROUP_KEY[g])}
          </button>
        ))}
      </div>

      {widened && (
        <div className="rounded-[10px] bg-tint px-3 py-2.5 text-sm">
          {t('localEmpty', { county: countyName || '—' })}
        </div>
      )}

      <div className="card p-4">
        {items.length === 0 ? (
          <p className="py-6 text-center text-muted">{crops.length === 0 ? t('loadError') : t('emptyGroup')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {items.map((c) => (
              <li key={c.crop}>
                <Link
                  href={`/crop/${encodeURIComponent(c.crop)}`}
                  className="flex items-center gap-3 py-3.5"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-tint text-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                      <path d="M11 20A7 7 0 0 1 4 13c4 0 7 3 7 7Z" strokeLinejoin="round" />
                      <path d="M13 20a7 7 0 0 1 7-9c0 4-3 9-7 9Z" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block">{c.crop}</b>
                    <span className="text-sm text-muted">
                      {t('peakMonths')} {monthRange(c.months)}
                      {monthWord ? ` ${monthWord}` : ''}
                    </span>
                  </span>
                  <span className="flex-none text-muted">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted">{t('attribution')}</p>
    </>
  );
}
