'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { loadSettings, saveSettings } from '@/lib/userStore';
import { findCounty } from '@/lib/regions';
import RegionGrid from './RegionGrid';

export default function RegionSelectClient() {
  const tr = useTranslations('region');
  const router = useRouter();
  const [countyZh, setCountyZh] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCountyZh(loadSettings().region?.countyZh);
    setReady(true);
  }, []);

  if (!ready) return null;

  function select(zh: string) {
    const s = loadSettings();
    saveSettings({
      ...s,
      region: { countyZh: zh, districtZh: findCounty(zh)?.districts?.[0]?.zh },
      setupDone: true,
    });
    router.push('/today');
  }

  return (
    <>
      <h1 className="text-xl font-extrabold">{tr('pickTitle')}</h1>
      <p className="text-muted">{tr('pickBody')}</p>
      <RegionGrid valueZh={countyZh} onSelect={select} />
    </>
  );
}
