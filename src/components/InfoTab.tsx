import { useTranslations } from 'next-intl';
import SampleBanner from './SampleBanner';

type Ns = 'today' | 'inSeason' | 'thisWeek';

export default function InfoTab({ ns }: { ns: Ns }) {
  const t = useTranslations(ns);
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <SampleBanner />
      <h1 className="text-xl font-extrabold text-balance">{t('title')}</h1>
      <p className="text-muted">{t('intro')}</p>
      <div className="card p-4 text-sm text-muted">{t('comingSoon')}</div>
    </div>
  );
}
