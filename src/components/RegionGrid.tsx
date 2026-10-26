'use client';

import { useLocale } from 'next-intl';
import { COUNTIES } from '@/lib/regions';

export default function RegionGrid({
  valueZh,
  onSelect,
}: {
  valueZh?: string;
  onSelect: (countyZh: string) => void;
}) {
  const locale = useLocale();
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {COUNTIES.map((c) => {
        const active = valueZh === c.zh;
        return (
          <button
            key={c.zh}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(c.zh)}
            className={`flex min-h-[52px] items-center justify-center rounded-xl border px-2 text-center font-bold ${
              active
                ? 'border-primary bg-[#E6F0E0] text-[color:var(--primary-hover)]'
                : 'border-border bg-surface text-ink'
            }`}
          >
            {locale === 'en' ? c.en : c.zh}
          </button>
        );
      })}
    </div>
  );
}
