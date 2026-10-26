'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitch from './LanguageSwitch';

export default function Header() {
  const t = useTranslations('header');
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-primary px-4 py-3 text-white">
      <div className="text-xl font-black tracking-wide">
        Hochia
        <span className="ml-1.5 text-xs font-medium tracking-widest opacity-80">{t('tagline')}</span>
      </div>
      <LanguageSwitch />
    </header>
  );
}
