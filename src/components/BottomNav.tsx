'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ICONS: Record<string, ReactNode> = {
  today: (
    <svg viewBox="0 0 24 24" {...stroke} className="h-6 w-6">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </svg>
  ),
  inSeason: (
    <svg viewBox="0 0 24 24" {...stroke} className="h-6 w-6">
      <path d="M11 20A7 7 0 0 1 4 13c4 0 7 3 7 7Z" />
      <path d="M13 20a7 7 0 0 1 7-9c0 4-3 9-7 9Z" />
      <path d="M11 20v-5" />
    </svg>
  ),
  thisWeek: (
    <svg viewBox="0 0 24 24" {...stroke} className="h-6 w-6">
      <path d="M3 9h18l-1.5 10.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5Z" />
      <path d="M3 9l2.5-5h13L21 9" />
      <path d="M9 13v4M15 13v4" />
    </svg>
  ),
  me: (
    <svg viewBox="0 0 24 24" {...stroke} className="h-6 w-6">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  ),
};

const TABS = [
  { href: '/today', key: 'today' },
  { href: '/in-season', key: 'inSeason' },
  { href: '/this-week', key: 'thisWeek' },
  { href: '/me', key: 'me' },
] as const;

export default function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-20 flex border-t border-border bg-surface px-1"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Sections"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href || (tab.href === '/today' && pathname === '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-[7px] text-[11px] font-semibold ${
              active ? 'text-primary' : 'text-muted'
            }`}
          >
            {ICONS[tab.key]}
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
