// Baked multi-city, per-weekday school-lunch sample (國中小, week of 2025/05/12–16,
// Mon–Fri) for Taipei / Taichung / Tainan / Kaohsiung, from the 校園食材登錄平臺
// OpenAPI. The app maps a picked date's weekday to that day's sample menu.
// Live ingestion of every date and city (plus the access-code flow) is Phase 2.

import data from './schoolData.json';

export type Ingredient = { name: string; cert: string | null };
export type SchoolDish = { cat: string; ings: Ingredient[] };
export type School = { name: string; district: string; menu: string[] };
export type CityDay = {
  date: string;
  pick: string[];
  dishes: Record<string, SchoolDish>;
  schools: School[];
};

// Each city maps to an array of 5 days (index 0 = Monday … 4 = Friday).
const DATA = data as unknown as Record<string, CityDay[]>;

export const SAMPLE_CITIES = Object.keys(DATA);

export function weekFor(countyZh?: string): CityDay[] | null {
  if (!countyZh) return null;
  return DATA[countyZh] ?? null;
}

/** Menu for a weekday (0 = Mon … 4 = Fri). Null for weekends or unsampled cities. */
export function dayMenu(countyZh?: string, dayIdx?: number): CityDay | null {
  const week = weekFor(countyZh);
  if (!week || dayIdx == null || dayIdx < 0 || dayIdx >= week.length) return null;
  return week[dayIdx] ?? null;
}
