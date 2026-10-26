import { setRequestLocale, getTranslations } from 'next-intl/server';
import SampleBanner from '@/components/SampleBanner';
import MeSettings from '@/components/MeSettings';

export default async function MePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('me');
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <SampleBanner />
      <h1 className="text-xl font-extrabold">{t('settings')}</h1>
      <MeSettings />

      <h2 className="mt-2 text-lg font-extrabold">{t('about')}</h2>
      <div className="card flex flex-col gap-2.5 p-4">
        <div>
          <div className="eyebrow">{t('sources')}</div>
          <p className="mt-1.5 text-muted">
            • {t('src1')}
            <br />• {t('src2')}
          </p>
        </div>
        <div className="rounded-[10px] bg-tint px-3 py-2.5 text-sm">{t('disclaimer')}</div>
      </div>
    </div>
  );
}
