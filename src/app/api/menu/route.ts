import { NextResponse, type NextRequest } from 'next/server';
import { menuForDate, latestMenu } from '@/lib/schoolApi';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const county = request.nextUrl.searchParams.get('county') ?? '';
  const date = request.nextUrl.searchParams.get('date') ?? '';

  if (date) {
    const menu = await menuForDate(county, date);
    return NextResponse.json({ date, menu });
  }

  // No date: return the most recent available menu.
  const latest = await latestMenu(county);
  return NextResponse.json(latest ?? { date: null, menu: null });
}
