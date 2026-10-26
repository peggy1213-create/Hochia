import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { cropDetail, monthRange } from '@/lib/moa';

export const revalidate = 86400;

export default async function CropPage({
  params,
}: {
  params: { locale: string; crop: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations('inSeason');
  const crop = decodeURIComponent(params.crop);
  const detail = await cropDetail(crop);
  const monthWord = t('monthWord');

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <Link href="/in-season" className="inline-flex items-center gap-1 font-bold text-primary">
        ‹ {t('title')}
      </Link>
      <h1 className="text-xl font-extrabold">{crop}</h1>

      {detail ? (
        <div className="card flex flex-col gap-3 p-4">
          <div>
            <div className="eyebrow">{t('peakMonths')}</div>
            <div className="mt-1 font-bold">
              {monthRange(detail.months)}
              {monthWord ? ` ${monthWord}` : ''}
            </div>
          </div>
          <div>
            <div className="eyebrow">{t('mainCounties')}</div>
            <div className="mt-1">{detail.counties.slice(0, 6).join('、')}</div>
          </div>
        </div>
      ) : (
        <p className="text-muted">{t('loadError')}</p>
      )}

      <p className="text-xs text-muted">{t('attribution')}</p>
    </div>
  );
}
