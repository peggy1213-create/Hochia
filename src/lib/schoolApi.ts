// Live, cached server-side access to school-lunch menus from the
// 校園食材登錄平臺 OpenAPI. Needs FATRACE_ACCESS_CODE (server env, gitignored).
// The API serves one large monthly CSV per county/grade, so we download+parse
// a month once and cache the structured result (revalidated daily); callers
// then read a single date out of it. Never imported by client components.

import { unstable_cache } from 'next/cache';

const BASE = 'https://fatraceschool.k12ea.gov.tw/cateringservice/openapi';
const UA = 'Hochia/0.1';
const DATASET = '午餐菜色及食材資料集';
const GRADE = '國中小';
const MAX_SCHOOLS = 60;

export type Ingredient = { name: string; cert: string | null };
export type SchoolDish = { cat: string; ings: Ingredient[] };
export type School = { name: string; district: string; menu: string[] };
export type DayMenu = {
  date: string;
  pick: string[];
  dishes: Record<string, SchoolDish>;
  schools: School[];
};

async function post(path: string, body: unknown) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

function clean(input: string): string {
  let s = (input || '').trim();
  const trim = (open: string, close: string) => {
    if (s.split(open).length > s.split(close).length) {
      const idx = s.lastIndexOf(open);
      if (idx > 0) s = s.slice(0, idx).trim();
    }
  };
  trim('(', ')');
  trim('（', '）');
  return s;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false;
      } else field += c;
    } else if (c === '"' && field === '') {
      inQ = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const getMonthMenus = unstable_cache(
  async (county: string, year: string, month: string): Promise<Record<string, DayMenu> | null> => {
    const code = process.env.FATRACE_ACCESS_CODE;
    if (!code) return null;

    let list: Array<Record<string, string>> = [];
    try {
      const ds = await post('/opendatadataset/', { accesscode: code, year, month, county });
      list = ds.datasetList || [];
    } catch {
      return null;
    }
    const target = list.find(
      (d) => d.datasetname === DATASET && d.grade === GRADE && d.county === county,
    );
    if (!target) return null;

    let link = '';
    try {
      const dl = await post('/opendatadownload/', {
        accesscode: code, year, month, county, grade: GRADE, datasetname: DATASET,
      });
      link = dl.link || '';
    } catch {
      return null;
    }
    if (!link) return null;

    let text = '';
    try {
      const res = await fetch(encodeURI(link), { cache: 'no-store', headers: { 'User-Agent': UA } });
      if (!res.ok) return null;
      text = await res.text();
    } catch {
      return null;
    }

    const rows = parseCSV(text.replace(/^﻿/, ''));
    if (rows.length < 2) return null;
    const h = rows[0];
    const iDist = h.indexOf('區域名稱');
    const iSchool = h.indexOf('學校名稱');
    const iDate = h.indexOf('供餐日期');
    const iCat = h.indexOf('菜色類別');
    const iDish = h.indexOf('菜色名稱');
    const iIng = h.indexOf('食材名稱');
    const iCert = h.indexOf('認證標章');
    if (iDate < 0 || iDish < 0 || iSchool < 0) return null;

    type SchoolAcc = { district: string; dishes: string[] };
    type DishAcc = { cat: string; ings: Ingredient[]; seen: Set<string> };
    const byDate = new Map<string, { schools: Map<string, SchoolAcc>; dishes: Map<string, DishAcc> }>();

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const date = (row[iDate] || '').trim();
      const school = (row[iSchool] || '').trim();
      const dish = clean(row[iDish] || '');
      if (!date || !school || !dish) continue;

      let dd = byDate.get(date);
      if (!dd) {
        dd = { schools: new Map(), dishes: new Map() };
        byDate.set(date, dd);
      }
      if (!dd.schools.has(school)) {
        if (dd.schools.size >= MAX_SCHOOLS) continue;
        dd.schools.set(school, { district: (row[iDist] || '').trim(), dishes: [] });
      }
      const sa = dd.schools.get(school)!;
      if (!sa.dishes.includes(dish)) sa.dishes.push(dish);

      let dc = dd.dishes.get(dish);
      if (!dc) {
        dc = { cat: (iCat >= 0 ? row[iCat] || '' : '').trim(), ings: [], seen: new Set() };
        dd.dishes.set(dish, dc);
      }
      const ing = (iIng >= 0 ? row[iIng] || '' : '').trim();
      if (ing && !dc.seen.has(ing) && dc.ings.length < 6) {
        dc.seen.add(ing);
        dc.ings.push({ name: ing, cert: (iCert >= 0 ? row[iCert] || '' : '').trim() || null });
      }
    }

    const out: Record<string, DayMenu> = {};
    for (const [date, dd] of byDate) {
      const schools: School[] = [...dd.schools.entries()].map(([name, a]) => ({
        name: name.replace(county, '').trim(),
        district: a.district,
        menu: a.dishes.slice(0, 16),
      }));
      const dishes: Record<string, SchoolDish> = {};
      for (const [n, c] of dd.dishes) dishes[n] = { cat: c.cat, ings: c.ings };

      const catCount = new Map<string, Map<string, number>>();
      for (const s of schools) {
        for (const n of s.menu) {
          const cat = dishes[n]?.cat;
          if (!cat) continue;
          const m = catCount.get(cat) ?? new Map<string, number>();
          m.set(n, (m.get(n) ?? 0) + 1);
          catCount.set(cat, m);
        }
      }
      const pick: string[] = [];
      for (const cat of ['主食', '主菜', '蔬菜', '湯品', '副菜']) {
        if (pick.length >= 4) break;
        const m = catCount.get(cat);
        if (!m) continue;
        const top = [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        if (top && !pick.includes(top)) pick.push(top);
      }
      out[date] = { date, pick, dishes, schools };
    }
    return out;
  },
  ['school-month-menus-v1'],
  { revalidate: 86400 },
);

/** Live menu for one county + ISO date (YYYY-MM-DD), or null if unavailable. */
export async function menuForDate(countyZh: string, iso: string): Promise<DayMenu | null> {
  if (!countyZh || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-');
  const data = await getMonthMenus(countyZh, y, m);
  if (!data) return null;
  return data[`${y}/${m}/${d}`] ?? null;
}
