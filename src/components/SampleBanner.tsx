import { useTranslations } from 'next-intl';

export default function SampleBanner() {
  const t = useTranslations('common');
  return (
    <div className="flex items-center gap-2 rounded-[10px] bg-accent px-3 py-2 text-xs font-semibold leading-snug text-ink">
      {t('sample')}
    </div>
  );
}
