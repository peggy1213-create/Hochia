# Hochia 好食

A mobile-first web app that helps adults in Taiwan decide **what to eat today**, using school-lunch menus planned by school nutritionists (校園食材登錄平臺) plus monthly peak-season produce (農業部). The value is deciding *for* the user — one balanced meal idea for today, near them — not being a recipe library.

**Status: Phase 0 complete** (data spike). An interactive UI preview lives in [`preview/`](preview/).

## Preview

```bash
python -m http.server 5173 --directory preview
```

Then open <http://localhost:5173>. It's a single self-contained HTML prototype:

- Four tabs: 今天 Today · 本月盛產 In Season · 本週食材 This Week · 我的 Me
- Bilingual 繁體中文 / English, switchable and remembered
- All 22 counties/cities, picked from the home page
- Settings, language and city persisted to `localStorage`

In-Season produce is **real 農業部 open data** (October); school menus in the preview are illustrative placeholders.

## Data sources

Confirmed endpoints, columns, licence and attribution are documented in [docs/data-sources.md](docs/data-sources.md); real samples are in [`docs/samples/`](docs/samples/).

- **農業部 — 每月盛產農產品產地** (`UnitId=061`): keyless JSON, whole-year peak-season produce by crop/county.
- **校園食材登錄平臺 OpenAPI**: access-code (registered per email). Provides daily school dishes (`午餐菜色`), dish↔ingredient links (`午餐菜色及食材`), suppliers and certification labels (產銷履歷/CAS/有機). **No nutrition data.**

Attribution to display in-app: 資料來源：農業部農糧署；教育部國教署 校園食材登錄平臺.

## Planned stack (Phase 1+)

Next.js (App Router) + TypeScript + Tailwind CSS, next-intl, Postgres, scheduled ingestion jobs, and the Anthropic API (server-side, cached) for recipes and translations.

## Non-goals

Native apps, accounts/sign-up, push notifications, user-generated recipes, comments, payments.
