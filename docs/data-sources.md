# Hochia — Data Sources (Phase 0 findings)

_Last updated: 2026-10-26. Status legend: ✅ confirmed against live endpoint with real samples · ⚠️ from metadata only · ❓ unverified._

This project caches open data server-side; **the client never calls government APIs directly**.

---

## 1. 農業部 — 每月盛產農產品產地 (In-Season produce) ✅ WORKING

The "In Season" tab's data source. Fully reachable and keyless.

| Item | Value |
|---|---|
| Dataset | 每月盛產農產品產地 (Monthly peak-season produce by origin), id `061` |
| Provider | 農糧署 / 農業部 (Agriculture & Food Agency, Ministry of Agriculture) |
| Endpoint (JSON) | `https://data.moa.gov.tw/Service/OpenData/DataFileService.aspx?UnitId=061` |
| CSV variant | same URL with the platform's CSV service (JSON used here) |
| Auth / API key | **None** |
| Format | JSON array of flat objects |
| Size | ~806 KB, **4010 records** (whole year, all 12 months — not just the current month) |
| Update frequency | Listed as 即時 (real-time); page showed last update 2026/08/31 |
| Licence | 政府資料開放授權條款 (Government Open Data Licence) — attribution: 資料來源：農業部農糧署 |

### Fields (all 7 present on every one of the 4010 rows) ✅

| Field | Meaning | Example |
|---|---|---|
| `type` | Category | 水果 / 蔬菜 / 花卉 / 雜糧 / 特作 |
| `month` | Peak month (1–12, string, **may be blank**) | `"9"` |
| `crop` | Official crop name | `芒果`, `甘藍` |
| `variety` | Variety name | `凱特` |
| `county` | County/city (uses 臺, **may be blank**) | `臺南市` |
| `town` | Township/district | `玉井區` |
| `picture_url` | Variety image (**almost always empty**) | `""` |

### Data-quality notes (from profiling the real file)
- **Blank months:** 47 / 4010 rows have `month == ""` (and the same rows also have blank `county`). Must tolerate — drop or bucket as "unknown". Matches the spec's warning.
- **Official vs common names (confirmed):** `甘藍` (117 rows), **not** `高麗菜` (0); `結球白菜` (131), **not** `大白菜` (0). ⇒ `ingredient_crop_map` is required to join with school-lunch ingredient names.
- **Granularity is town-level:** avg ~7 rows per (crop, month); 569 distinct (crop, month) pairs. Aggregate up to (crop, month, county) for the UI.
- **Only 18 counties appear** (not all 22). Offshore (金門/連江/澎湖) and low-volume counties are absent — the "local vs all Taiwan" filter must handle counties with zero in-season rows.
- **`picture_url` is unusable:** only 50 / 4010 rows have one. Don't rely on crop images.
- **`type` includes 花卉 (flowers, 163 rows)** — non-edible; filter out for a food app.
- `month` is a string digit without leading zero (`"9"` not `"09"`) — normalize to int.

### API access & ingestion (confirmed)
- **Only one documented endpoint:** `GET https://data.moa.gov.tw/Service/OpenData/DataFileService.aspx?UnitId=061`. The only parameter is `UnitId`. **No API key / authkey**, no login.
- **No server-side filtering or paging** is documented (no `$top`/`$skip`, no month/county/type filter param). ⇒ **Ingestion downloads the whole file** (one ~806 KB request, 4010 rows covering all 12 months) and filters/aggregates by month + county in our backend. One daily/weekly cron pull is enough.
- JSON and CSV are both offered; we use JSON. An "advanced search" page (`open_search.aspx?id=061`) and an API manual (`農業部OpenData-每月盛產農產品產地-API介接說明書-V1.1.pdf`, behind a JS postback) exist if we later want filtered queries — download the PDF into `docs/samples/` if needed.
- **Attribution to show in-app:** 資料來源：農業部農糧署（每月盛產農產品產地）.

Real samples saved: [`moa_061.json`](samples/moa_061.json) (full), [`moa_061_sample.json`](samples/moa_061_sample.json) (40 rows).

---

## 2. 校園食材登錄平臺 OpenAPI (school lunch) ✅ CONFIRMED with real samples

Source for Today / school menus / This Week ingredients. Registered an access code (`POST /accountReg/`), pulled real datasets for 臺北市 (both grades, 2025/05), and confirmed every column below. **Dish names exist; nutrition does not.** Requests must send a normal `User-Agent` header — the server returns **403** to Python's default UA. The old public CSV mirrors on data.gov.tw are dead; the live API is the only path.

| Item | Value |
|---|---|
| Docs | `https://fatraceschool.k12ea.gov.tw/cateringservice/web/openapi_doc/v1/index.html` |
| OpenAPI JSON | `https://fatraceschool.k12ea.gov.tw/cateringservice/web/openapi_doc/v1/openapi.json` |
| API base | `https://fatraceschool.k12ea.gov.tw/cateringservice/openapi` |
| Auth | **Access code required.** `POST /accountReg/` with an email → code emailed to that address → used as `accesscode` on all other calls |
| Transport | All endpoints are **POST**, `application/json` |
| Update frequency | 不定期更新 (irregular), **monthly** granularity |
| Licence | 政府資料開放授權條款-第1版 (Government Open Data Licence v1) |

### Endpoints (confirmed from openapi.json) ✅
| Path | Body | Returns |
|---|---|---|
| `POST /accountReg/` | `account` (email) | `message` (code is emailed) |
| `POST /county/` | `accesscode` | `message`, `countyList[]` |
| `POST /opendatadataset/` | `accesscode`, `year`, `month`, `county` | `message`, `datasetList[]` of `{year,month,county,grade,datasetname,createdate}` |
| `POST /opendatadownload/` | `accesscode`, `year`, `month`, `county`, `grade`, `datasetname` | `message`, …, `link` (file download URL, CSV) |

### Datasets available per (county, grade, month) — confirmed from live API ✅
`/opendatadataset/` returns ~15 entries for a county+month. Per county, split by **grade** (`國中小` / `高中職`):
- **午餐菜色資料集** (dishes) — the dish list.
- **午餐菜色及食材資料集** (dishes **+** ingredients) — the core table: dish ↔ ingredient ↔ cert.
- **午餐食材及供應商資料集** (ingredients + suppliers).

Plus nationwide (`county: 全國`): **調味料及供應商資料集** (seasonings), **學校供餐團膳業者資料集** (catering vendors); and one undated reference: **食材中文名稱資料集** (canonical ingredient names — useful for the ingredient↔crop map and translation).

### Confirmed columns (from real 臺北市 2025/05 samples in `docs/samples/`) ✅
- **午餐菜色資料集** (5 cols): `市縣名稱, 區域名稱, 學校名稱, 供餐日期, 菜色名稱`
  - e.g. `臺北市 | 松山區 | 臺北市松山區介壽國中 | 2025/05/01 | 三杯雞`
- **午餐菜色及食材資料集** (16 cols): `市縣名稱, 區域名稱, 學校名稱, 供餐日期, 供餐業者, 供餐業者統一編號, 食材供應商名稱, 食材供應商統編, 菜色類別, 菜色名稱, 食材名稱, 調味料供應商名稱, 調味料供應商統編, 調味料名稱, 認證標章, 認證號碼`
  - e.g. `… | 2025/05/01 | 主食 | 白米飯 | 白米 | … | 產銷履歷 | ="2504290174906379"`
- **午餐食材及供應商資料集** (14 cols): same as above **minus** `菜色類別, 菜色名稱` (ingredient-level only).

### Resolved — the big design questions ✅
- **Dishes EXIST.** `菜色名稱` (三杯雞, 大醬豬肉豆腐…) with `菜色類別` (主食 / 主菜 / 副菜 / 湯 / 點心). ⇒ the spec's **dish-centric** model (`dish → dish_ingredient`, `dish_canonical`, "most-common dish combo") is fully buildable, and `午餐菜色及食材資料集` gives the dish→ingredient join directly.
- **Nutrition does NOT exist.** No calorie or food-group-serving columns in any dataset. ⇒ **drop** the spec's nutrition tags / food-group servings, or derive a coarse group from `菜色類別`/ingredient heuristics. Settled, not a maybe.
- **Certification** confirmed: `認證標章` (產銷履歷, 溯源農糧產品, CAS, 有機…) + `認證號碼`.
- **Daily menus:** `供餐日期` is a single date (per school per day) — so "today's menu" and weekday browsing work.
- **No photos, no geolocation.** Only `市縣名稱 / 區域名稱 / 學校名稱`. "Near you" = same `區域名稱` (district) → county fallback.
- **Ingestion gotchas:** 統編 / 認證號碼 come Excel-text-guarded as `="…"` (strip the `="` and `"`). Files are **big** — one county+grade+month 國中小 ≈ 92k rows / 21 MB (食材) and ≈ 23 MB (菜色及食材); nationwide is far larger. Encoding is UTF-8 **with BOM** (`utf-8-sig`). Ingest per county, stream, don't hold nationwide files in memory.
- **Attribution:** 資料來源：教育部國教署 校園食材登錄平臺.

---

## Phase 0 — complete ✅

Both sources are confirmed against live data, with real samples saved in `docs/samples/` (農業部 full JSON; 臺北市 school-lunch CSVs trimmed to 300-row samples). The one open design question — dish-centric vs ingredient-centric — is **resolved: dish-centric**, since both dishes and a dish→ingredient join exist. Nutrition is confirmed unavailable. Ready for Phase 1.

---

## Proposed data model (revised after Phase 0)

Confirmed-buildable now (農業部):
- `county`, `district` — reference tables (seed from the datasets).
- `crop_peak(crop, type, month, county, variety)` — from dataset 061; drop 花卉, bucket blank month/county as unknown.
- `ingredient_crop_map(school_ingredient_name, moa_crop_name, note)` — hand-maintained **CSV in repo**; seed with 甘藍↔高麗菜, 結球白菜↔大白菜, etc.
- `translation(source_text, type: dish|ingredient|place|crop, en_text, status: ai|reviewed)` — LLM-filled, CSV-overridable.

Confirmed (school lunch):
- `school(county, district, name, serving_vendor)` — **no geocode**; "nearby" = same `區域名稱` → county fallback.
- `dish(name)` + `dish_canonical(name)` — from `午餐菜色資料集`; normalize variants (三杯雞 / 三杯雞丁 / 塔香三杯雞).
- `menu_dish(school, date, dish, 菜色類別)` — from `午餐菜色(及食材)資料集`.
- `dish_ingredient(dish, ingredient_name, cert_label, cert_no, supplier)` — from `午餐菜色及食材資料集`.
- `ingredient` + canonical names from `食材中文名稱資料集`.
- **No `nutrition` table** — not in the data. Food-group tags, if shown, come from `菜色類別` or an ingredient→group heuristic, clearly labelled as derived.
- Aggregates: dish frequency by district/day (for "today's pick"), ingredient frequency by county/week (for "This Week").
- `recipe_cache(dish_canonical, servings_base, locale, …)` — only if 在家煮 is (re)added; the data supports it.

**Design decision — resolved:** Hochia is **dish-centric**, matching the spec, with ingredients hanging off dishes. Nutrition features are dropped for lack of source data.
