import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import '../globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import FirstRunSetup from '@/components/FirstRunSetup';

export const metadata: Metadata = {
  title: 'Hochia',
  description: 'Decide what to eat today — Taiwan school lunches plus peak-season produce.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-ground shadow-[0_0_0_1px_var(--border)]">
            <Header />
            <main className="flex-1">{children}</main>
            <BottomNav />
          </div>
          <FirstRunSetup />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
