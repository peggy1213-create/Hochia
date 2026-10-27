// Single storage module. Every feature reads/writes settings through here, so
// a real account backend can replace the body later without touching callers.
// Uses localStorage, wrapped in try/catch, with an in-memory fallback.

export type Region = { countyZh: string; districtZh?: string };

export type UserSettings = {
  region?: Region;
  school?: string;
  servings: number;
  diet: string[];
  setupDone: boolean;
};

const KEY = 'hochia.prefs.v1';

const DEFAULTS: UserSettings = {
  servings: 4,
  diet: [],
  setupDone: false,
};

let memory: UserSettings | null = null;

function hasStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const k = '__hochia_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadSettings(): UserSettings {
  if (hasStorage()) {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<UserSettings>) };
    } catch {
      /* fall through */
    }
  }
  return memory ? { ...memory } : { ...DEFAULTS };
}

export function saveSettings(settings: UserSettings): void {
  memory = { ...settings };
  if (hasStorage()) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* in-memory only */
    }
  }
}

export function updateSettings(patch: Partial<UserSettings>): UserSettings {
  const next = { ...loadSettings(), ...patch };
  saveSettings(next);
  return next;
}
