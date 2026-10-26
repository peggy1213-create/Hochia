// Baked "this week" ingredient ranking per city (number of 國中小 schools using
// each ingredient, week of 2025/05/12–16), from the 校園食材登錄平臺 OpenAPI.
// Food group is a heuristic (the source has no food-group column); 盛產 is
// flagged against May in-season produce. Live/all-city ingestion is Phase 2.

import data from './weekData.json';

export type FoodGroup = 'veg' | 'pro' | 'grain';
export type WeekItem = { name: string; group: FoodGroup; schools: number; peak: boolean };

const WEEK = data as Record<string, WeekItem[]>;

export function weekForCounty(countyZh?: string): WeekItem[] | null {
  if (!countyZh) return null;
  return WEEK[countyZh] ?? null;
}
