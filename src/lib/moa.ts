// Live data layer for the Ministry of Agriculture "monthly peak-season produce"
// open dataset (UnitId=061). Keyless JSON; fetched server-side and cached.
// The client never calls this endpoint directly.

const MOA_URL =
  'https://data.moa.gov.tw/Service/OpenData/DataFileService.aspx?UnitId=061';

export type MoaRow = {
  type: string;
  month: string;
  crop: string;
  variety: string;
  county: string;
  town: string;
  picture_url: string;
};

export type FoodGroup = 'fruit' | 'veg' | 'grain';

export type Crop = {
  crop: string;
  group: FoodGroup;
  /** all peak months (1-12) */
  months: number[];
  /** producing counties for the requested month, most-frequent first */
  counties: string[];
};

export type CropDetail = {
  crop: string;
  group: FoodGroup;
  months: number[];
  /** all producing counties across the year, most-frequent first */
  counties: string[];
};

const GROUP: Record<string, FoodGroup> = {
  水果: 'fruit',
  蔬菜: 'veg',
  雜糧: 'grain',
  特作: 'veg',
};

function groupFor(type: string): FoodGroup {
  return GROUP[type] ?? 'veg';
}

function isFood(row: MoaRow): boolean {
  if (row.type === '花卉') return false; // flowers
  if (/茶/.test(row.crop)) return false; // teas
  return true;
}

async function fetchRows(): Promise<MoaRow[]> {
  try {
    const res = await fetch(MOA_URL, {
      next: { revalidate: 60 * 60 * 24 }, // refresh daily
      headers: { 'User-Agent': 'Hochia/0.1' },
    });
    if (!res.ok) return [];
    return (await res.json()) as MoaRow[];
  } catch {
    return [];
  }
}

/** Contiguous month ranges, e.g. [1,2,3,8,9] -> "1–3、8–9". */
export function monthRange(months: number[]): string {
  const s = [...months].sort((a, b) => a - b);
  if (s.length === 0) return '';
  const parts: string[] = [];
  let start = s[0];
  let prev = s[0];
  for (const m of s.slice(1)) {
    if (m === prev + 1) {
      prev = m;
    } else {
      parts.push(start === prev ? `${start}` : `${start}–${prev}`);
      start = prev = m;
    }
  }
  parts.push(start === prev ? `${start}` : `${start}–${prev}`);
  return parts.join('、');
}

/** Crops whose peak includes `month`, ranked by number of producing counties. */
export async function cropsForMonth(month: number): Promise<Crop[]> {
  const rows = await fetchRows();
  const by = new Map<
    string,
    { type: string; months: Set<number>; monthCounty: Map<string, number> }
  >();

  for (const r of rows) {
    if (!isFood(r)) continue;
    const m = parseInt(r.month, 10);
    const e =
      by.get(r.crop) ?? { type: r.type, months: new Set<number>(), monthCounty: new Map<string, number>() };
    if (!Number.isNaN(m)) e.months.add(m);
    if (m === month && r.county) e.monthCounty.set(r.county, (e.monthCounty.get(r.county) ?? 0) + 1);
    by.set(r.crop, e);
  }

  const out: Crop[] = [];
  for (const [crop, e] of by) {
    if (!e.months.has(month)) continue;
    const counties = [...e.monthCounty.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
    out.push({ crop, group: groupFor(e.type), months: [...e.months].sort((a, b) => a - b), counties });
  }
  out.sort((a, b) => b.counties.length - a.counties.length);
  return out;
}

/** Full-year detail for one crop (all producing counties, all peak months). */
export async function cropDetail(crop: string): Promise<CropDetail | null> {
  const rows = await fetchRows();
  const months = new Set<number>();
  const county = new Map<string, number>();
  let type = '';
  let found = false;
  for (const r of rows) {
    if (r.crop !== crop || !isFood(r)) continue;
    found = true;
    type = r.type;
    const m = parseInt(r.month, 10);
    if (!Number.isNaN(m)) months.add(m);
    if (r.county) county.set(r.county, (county.get(r.county) ?? 0) + 1);
  }
  if (!found) return null;
  return {
    crop,
    group: groupFor(type),
    months: [...months].sort((a, b) => a - b),
    counties: [...county.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c),
  };
}

export function currentMonth(): number {
  return new Date().getMonth() + 1;
}
