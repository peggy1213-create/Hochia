'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadSettings } from '@/lib/userStore';
import { findCounty } from '@/lib/regions';

type DayMenu = {
  date: string;
  pick: string[];
  dishes: Record<string, { cat: string; ings: { name: string; cert: string | null }[] }>;
  schools: { name: string; district: string; menu: string[] }[];
};

const WD_ZH = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
const WD_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TodayClient() {
  const t = useTranslations('today');
  const locale = useLocale();
  const [countyZh, setCountyZh] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [iso, setIso] = useState('');
  const [menu, setMenu] = useState<DayMenu | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCountyZh(loadSettings().region?.countyZh);
    setIso(toIso(new Date()));
    setReady(true);
  }, []);

  const wdIdx = iso ? (new Date(iso + 'T00:00:00').getDay() + 6) % 7 : 0;
  const weekend = wdIdx >= 5;

  useEffect(() => {
    if (!ready || !countyZh || !iso || weekend) {
      setMenu(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/menu?county=${encodeURIComponent(countyZh)}&date=${iso}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setMenu((d.menu as DayMenu) ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMenu(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ready, countyZh, iso, weekend]);

  if (!ready || !iso) return null;

  const wd = locale === 'en' ? WD_EN : WD_ZH;
  const county = findCounty(countyZh);
  const countyName = county ? (locale === 'en' ? county.en : county.zh) : '';

  const pill = (
    <Link
      href="/region"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 font-bold shadow-sm"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px] text-primary">
        <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2.2" />
      </svg>
      {countyName || t('changeCity')}
      <span className="text-muted">›</span>
    </Link>
  );

  const topBar = (
    <div className="flex flex-wrap items-center gap-2">
      {pill}
      <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 font-bold text-ink">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px] text-primary">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
        <input
          type="date"
          value={iso}
          onChange={(e) => e.target.value && setIso(e.target.value)}
          aria-label={t('pickDate')}
          className="w-[8.5rem] bg-transparent font-bold text-ink outline-none"
        />
      </label>
      <span className="rounded-full bg-tint px-2.5 py-1 text-sm font-semibold">{wd[wdIdx]}</span>
    </div>
  );

  const seasonShortcut = (
    <Link href="/in-season" className="card flex items-center justify-between p-4">
      <span className="font-bold">{t('toSeason')}</span>
      <span className="text-muted">›</span>
    </Link>
  );

  let body: React.ReactNode;
  if (!countyZh) {
    body = (
      <Link href="/region" className="card block p-6 text-center text-muted">
        {t('noRegion')} <span className="font-bold text-primary">{t('changeCity')}</span>
      </Link>
    );
  } else if (weekend) {
    body = (
      <>
        <div className="card p-4">
          <div className="eyebrow">{t('noSchool')}</div>
          <p className="mt-2 text-muted">{t('noSchoolBody')}</p>
        </div>
        {seasonShortcut}
      </>
    );
  } else if (loading) {
    body = <div className="card p-6 text-center text-muted">{t('loading')}</div>;
  } else if (!menu) {
    body = (
      <>
        <div className="card p-6 text-center text-muted">{t('noMenu')}</div>
        {seasonShortcut}
      </>
    );
  } else {
    body = (
      <>
        <div className="card overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
          <div className="p-4">
            <div className="eyebrow">
              {t('pickTitle')} · {t('pickWhy')}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {menu.pick.map((n) => {
                const d = menu.dishes[n];
                if (!d) return null;
                return (
                  <div key={n} className="flex items-baseline gap-2.5">
                    <span className="h-2 w-2 flex-none -translate-y-0.5 rounded-full bg-secondary" />
                    <span className="font-bold">{n}</span>
                    <span className="rounded-full bg-tint px-2.5 py-1 text-xs font-semibold">{d.cat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {seasonShortcut}

        <h2 className="text-lg font-extrabold">{t('nearby')}</h2>
        <div className="card p-4">
          <ul className="flex flex-col divide-y divide-border">
            {menu.schools.map((s, i) => (
              <li key={i}>
                <Link
                  href={`/school/${encodeURIComponent(countyZh)}/${iso}/${i}`}
                  className="flex items-center gap-3 py-3.5"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-tint text-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" strokeLinejoin="round">
                      <path d="M3 10l9-5 9 5-9 5Z" />
                      <path d="M7 12v5c0 1 2 2 5 2s5-1 5-2v-5" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block">{s.name}</b>
                    <span className="text-sm text-muted">{s.district}</span>
                  </span>
                  <span className="flex-none text-muted">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {topBar}
      {body}
    </div>
  );
}
