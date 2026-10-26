import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { dayMenu } from '@/lib/schoolData';

export default async function SchoolPage({
  params,
}: {
  params: { locale: string; county: string; day: string; idx: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations('today');
  const county = decodeURIComponent(params.county);
  const menu = dayMenu(county, Number(params.day));
  const school = menu?.schools[Number(params.idx)];
  if (!menu || !school) notFound();

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <Link href="/today" className="inline-flex items-center gap-1 font-bold text-primary">
        ‹ {t('title')}
      </Link>
      <h1 className="text-xl font-extrabold">{school.name}</h1>
      <p className="text-muted">
        {school.district} · {menu.date} · {t('schoolMenu')}
      </p>

      <div className="card p-4">
        <ul className="flex flex-col divide-y divide-border">
          {school.menu.map((n, i) => {
            const d = menu.dishes[n];
            if (!d) return null;
            const ings = d.ings
              .map((ig) => (ig.cert ? `${ig.name} ·${ig.cert}` : ig.name))
              .join('、');
            return (
              <li key={i} className="flex items-start gap-3 py-3.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-tint text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                    <path d="M4 10h16v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block">
                    {n}{' '}
                    <span className="ml-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-ink">
                      {d.cat}
                    </span>
                  </b>
                  <span className="text-sm text-muted">{ings || '—'}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
