import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow an alternate build dir (e.g. when a dev server holds .next).
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default withNextIntl(nextConfig);
