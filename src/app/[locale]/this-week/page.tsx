import { setRequestLocale } from 'next-intl/server';
import SampleBanner from '@/components/SampleBanner';
import ThisWeekClient from '@/components/ThisWeekClient';

export default function ThisWeekPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <SampleBanner />
      <ThisWeekClient />
    </div>
  );
}
