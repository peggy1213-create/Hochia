import { NextResponse, type NextRequest } from 'next/server';
import { menuForDate } from '@/lib/schoolApi';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const county = request.nextUrl.searchParams.get('county') ?? '';
  const date = request.nextUrl.searchParams.get('date') ?? '';
  const menu = await menuForDate(county, date);
  return NextResponse.json({ menu });
}
