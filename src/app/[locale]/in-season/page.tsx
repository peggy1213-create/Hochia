import { setRequestLocale } from 'next-intl/server';
import InfoTab from '@/components/InfoTab';

export default function InSeasonPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <InfoTab ns="inSeason" />;
}
