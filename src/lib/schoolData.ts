// Baked multi-city school-lunch sample, extracted from the 校園食材登錄平臺
// OpenAPI (國中小, May 2025) for Taipei / Taichung / Tainan / Kaohsiung.
// Live ingestion of all cities (and the access-code flow) lands in Phase 2;
// until then the app serves this sample so the school features are real.

import data from './schoolData.json';

export type Ingredient = { name: string; cert: string | null };
export type SchoolDish = { cat: string; ings: Ingredient[] };
export type School = { name: string; district: string; menu: string[] };
export type CityMenu = {
  date: string;
  pick: string[];
  dishes: Record<string, SchoolDish>;
  schools: School[];
};

const CITY_MENUS = data as Record<string, CityMenu>;

export const SAMPLE_CITIES = Object.keys(CITY_MENUS);

export function menusForCounty(countyZh?: string): CityMenu | null {
  if (!countyZh) return null;
  return CITY_MENUS[countyZh] ?? null;
}
