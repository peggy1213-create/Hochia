'use client';

import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LanguageSwitch() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const current = (params?.locale as string) ?? routing.defaultLocale;

  return (
    <div className="flex gap-0.5 rounded-full bg-white/15 p-[3px]" role="group" aria-label="Language">
      {routing.locales.map((loc) => {
        const active = loc === current;
        return (
          <button
            key={loc}
            type="button"
            aria-pressed={active}
            onClick={() => router.replace(pathname, { locale: loc })}
            className={`min-h-[34px] rounded-full px-3 text-xs font-bold transition ${
              active ? 'bg-white text-primary' : 'text-white/75'
            }`}
          >
            {loc === 'zh-TW' ? '中文' : 'EN'}
          </button>
        );
      })}
    </div>
  );
}
