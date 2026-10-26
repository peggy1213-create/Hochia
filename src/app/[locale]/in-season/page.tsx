import { setRequestLocale } from 'next-intl/server';
import { cropsForMonth, currentMonth } from '@/lib/moa';
import SampleBanner from '@/components/SampleBanner';
import InSeasonClient from '@/components/InSeasonClient';

export const revalidate = 86400; // refresh the cached produce data daily

export default async function InSeasonPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const month = currentMonth();
  const crops = await cropsForMonth(month);

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <SampleBanner />
      <InSeasonClient crops={crops} month={month} />
    </div>
  );
}
