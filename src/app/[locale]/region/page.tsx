import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import RegionSelectClient from '@/components/RegionSelectClient';

export default async function RegionPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('today');
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <Link href="/today" className="inline-flex items-center gap-1 font-bold text-primary">
        ‹ {t('title')}
      </Link>
      <RegionSelectClient />
    </div>
  );
}
