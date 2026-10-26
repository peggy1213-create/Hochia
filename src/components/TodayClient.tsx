'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { loadSettings } from '@/lib/userStore';
import { findCounty } from '@/lib/regions';
import { menusForCounty } from '@/lib/schoolData';

const WD_ZH = ['一', '二', '三', '四', '五', '六', '日'];
const WD_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function weekDays() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { idx: i, date: d.getDate(), weekend: i >= 5 };
  });
  return { days, todayIdx: dow };
}

export default function TodayClient() {
  const t = useTranslations('today');
  const locale = useLocale();
  const [countyZh, setCountyZh] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [sel, setSel] = useState(0);
  const [days, setDays] = useState<ReturnType<typeof weekDays>['days']>([]);

  useEffect(() => {
    setCountyZh(loadSettings().region?.countyZh);
    const wk = weekDays();
    setDays(wk.days);
    setSel(wk.todayIdx);
    setReady(true);
  }, []);

  if (!ready || days.length === 0) return null;

  const wd = locale === 'en' ? WD_EN : WD_ZH;
  const county = findCounty(countyZh);
  const countyName = county ? (locale === 'en' ? county.en : county.zh) : '';
  const city = menusForCounty(countyZh);
  const weekend = days[sel]?.weekend;

  const pill = (
    <Link
      href="/region"
      className="inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-surface px-3 py-2 font-bold shadow-sm"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px] text-primary">
        <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2.2" />
      </svg>
      {countyName || t('changeCity')}
      <span className="text-muted">›</span>
    </Link>
  );

  const dateRow = (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {days.map((d) => {
        const active = d.idx === sel;
        return (
          <button
            key={d.idx}
            type="button"
            aria-pressed={active}
            onClick={() => setSel(d.idx)}
            className={`flex min-h-[58px] min-w-[48px] flex-none flex-col items-center justify-center gap-0.5 rounded-xl border text-xs ${
              active ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-muted'
            }`}
          >
            <span>{wd[d.idx]}</span>
            <b className={`text-lg tabular-nums ${active ? 'text-white' : 'text-ink'}`}>{d.date}</b>
          </button>
        );
      })}
    </div>
  );

  const seasonShortcut = (
    <Link href="/in-season" className="card flex items-center justify-between p-4">
      <span className="font-bold">{t('toSeason')}</span>
      <span className="text-muted">›</span>
    </Link>
  );

  if (!city) {
    return (
      <div className="flex flex-col gap-3">
        {pill}
        {dateRow}
        <Link href="/region" className="card block p-6 text-center text-muted">
          {t('cityOnly')} <span className="font-bold text-primary">{t('changeCity')}</span>
        </Link>
      </div>
    );
  }

  if (weekend) {
    return (
      <div className="flex flex-col gap-3">
        {pill}
        {dateRow}
        <div className="card p-4">
          <div className="eyebrow">{t('noSchool')}</div>
          <p className="mt-2 text-muted">{t('noSchoolBody')}</p>
        </div>
        {seasonShortcut}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {pill}
      {dateRow}

      <div className="card overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
        <div className="p-4">
          <div className="eyebrow">
            {t('pickTitle')} · {t('pickWhy')}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {city.pick.map((n) => {
              const d = city.dishes[n];
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
          {city.schools.map((s, i) => (
            <li key={i}>
              <Link
                href={`/school/${encodeURIComponent(countyZh!)}/${i}`}
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
    </div>
  );
}
