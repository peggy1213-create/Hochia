import { setRequestLocale } from 'next-intl/server';
import InfoTab from '@/components/InfoTab';

export default function ThisWeekPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <InfoTab ns="thisWeek" />;
}
