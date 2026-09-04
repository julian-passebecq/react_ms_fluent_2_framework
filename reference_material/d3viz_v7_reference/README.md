# Newsroom Observatory — D3.js · V4

A no-database MVP for three related news-visualization features:

1. **The Economist corpus observatory** — weekly topic/country mention trends from private PDF issues.
2. **Economist cover → dashboard** — selected cover arguments converted into a small D3 dashboard using derived metrics and structure.
3. **BBC / NRK → visual** — recent BBC Technology and NRK technology-oriented headlines pulled server-side, with one-click **three-view D3 story fingerprints** and a local paste-an-article studio.

## V4 improvement pass

V4 focuses on two things: making the newsroom UI easier to reuse/share, and turning the DataVis recovery sandbox into a source-comparison environment rather than a collection of approximations.

- The main app now restores and writes filter state to the URL (`mode`, `source`, `topic`, `geo`, `issue`, `q`) and includes **Copy view** for shareable filtered links.
- Tablet/mobile layout, horizontal navigation, source rails, focus states, reduced-motion behaviour and SVG accessibility metadata were tightened.
- The user-supplied `D3_template-main.zip` is bundled under `sandbox/recovered/`: **80 raw DataVis working-copy files** plus hashes/provenance metadata.
- **11 demos** can switch between a modern D3 7 reconstruction and a locally runnable recovered page/source. A new source-backed tooltip demo brings the live Recovery Lab to **25 demos**.
- Raw recovered files remain untouched; generated local wrappers remove only remote/missing D3 imports so comparison pages are deterministic.


## Why there is no MongoDB

MongoDB is unnecessary for this first version. The browser only needs small, derived datasets. Keep the PDF ingestion offline/private and deploy static JSON with the site.

**MVP architecture**

```text
Private Economist PDFs
       │
       ▼
Python ingestion (pdftotext + controlled topic/country dictionaries)
       │
       ├── data/economist_stats.json  ──► D3 corpus charts
       └── data/catalog.json          ──► cover/article catalogue

BBC Technology RSS ─┐
                    ├─► Netlify serverless function ─► article cards ─► D3 story fingerprint
NRK topic/RSS ──────┘
```

Later, when you have a full year, a good analytics upgrade is **Parquet + DuckDB during the build**. If you add a browser admin/upload flow or multiple users, use **object storage for PDFs** (for example R2/S3/Supabase Storage) and **Postgres/Supabase for metadata**. MongoDB is still optional, not required.

## Where to put Economist PDFs

Do **not** commit source magazine PDFs to the public website repository. Create a private local folder:

```text
private_input/
  economist/
    The_Economist_2026-09-05.pdf
    The_Economist_2026-09-12.pdf
```

`private_input/` and all `*.pdf` files are git-ignored.

Then rebuild the derived stats:

```bash
python3 scripts/ingest_economist.py private_input/economist/*.pdf
```

The three issues supplied in this chat have already been ingested into `data/economist_stats.json`. The curated article/cover metadata used by the prototype is in `data/catalog.json`.

### What the ingestion does

- extracts PDF text with `pdftotext -layout`;
- keeps pages with Economist editorial running headers and drops obvious covers/ads/TOC/indicator tables from counts;
- infers the issue date;
- counts a controlled list of topic terms;
- counts country references;
- records approximate corpus word count;
- writes only aggregate derived data to the public site.

This is intentionally transparent and deterministic. For a larger corpus, replace/augment the dictionaries with NER/topic classification and store results in Parquet.

## Run locally

The site fetches local JSON, so use an HTTP server rather than opening `index.html` directly:

```bash
cd news-viz-observatory
python3 -m http.server 8080
```

Open `http://localhost:8080`.

The **Economist** views work locally. The BBC/NRK view will use `data/news_fallback.json` unless you run the Netlify dev server, because the live source code is a Netlify function.

## Run with live BBC / NRK locally

If Netlify CLI is installed:

```bash
netlify dev
```

The function is `netlify/functions/news.mjs`.

It uses:

- BBC Technology RSS as the first source;
- NRK's `Teknologi og data` topic page first;
- NRK latest-news RSS as a fallback, filtered for technology terms;
- a five-minute server/cache window.

Fetching is server-side because publishers may not allow cross-origin browser requests and because feed parsing should not be coupled to the UI.

## Deploy

This repository is Netlify-ready (`netlify.toml` is included). Publish the project root.

No database or environment variables are required for the current feeds.

## Data / copyright boundary

This prototype is designed to store and show **derived analysis** and publisher links, not to re-host full Economist/BBC/NRK articles. Keep subscription PDFs private. BBC's own terms distinguish personal RSS use from business use; commercial/business metadata or RSS use may require permission/licensing. Verify publisher terms before using the project commercially.

## Files

```text
index.html                         main application shell
styles.css                        responsive newsroom UI
app.js                            D3 charts, filters, search, three modes
data/catalog.json                 curated issue/article metadata
data/economist_stats.json         PDF-derived aggregate counts
data/news_fallback.json           clearly labelled local preview cards
scripts/ingest_economist.py       repeatable PDF → derived JSON pipeline
netlify/functions/news.mjs        BBC/NRK server-side feed bridge
netlify.toml                      Netlify deployment config
```

## Recommended next passes

- Upload every weekly Economist issue and extend the catalogue automatically from the contents pages.
- Replace manual article topic tags with NER + a controlled taxonomy.
- Add trend deltas: rising/falling topic vs 4-week moving average.
- Add country co-occurrence network and topic-country Sankey.
- Save specific BBC/NRK visual stories as small static JSON snapshots so the best weekly visuals can be kept permanently.
- The current paste studio analyses article/excerpt text only in the browser; add an explicit save action later if you want a permanent archive.
- Add an editorial annotation layer: `why this matters`, `chart choice`, and `source fields used`.

---

## D3 Recovery Lab · V4

Open:

```text
sandbox/index.html
```

The lab is deliberately separate from the newsroom product. It contains **25 runnable demos** and a recovery queue covering the 44 archived DataVis.fr tutorial entries indexed so far.

### Source comparison

For the 11 source-backed tutorials, the toolbar exposes:

```text
Modern rebuild  ↔  Recovered page
Modern code     ↔  Recovered JS
```

The bundled source families currently cover basic/advanced line charts, bar chart, dual-line chart, stacked bars, tooltip, France map, France population choropleth, Nobel map, world-temperature globe and advanced choropleth. Their raw source lives under `sandbox/recovered/datavis.fr/`; deterministic comparison wrappers live under `sandbox/recovered/runnable/`.

`SOURCE_INDEX.json` records the raw archive's **80 files**, SHA-256 hashes and demo mapping. The archive README and license supplied with the ZIP are preserved alongside it. This is treated as a recovered working copy, not as proof that every file is byte-identical to the former DataVis production server.

### Current runtime

- Modern lab: D3 **7.9.0**, Leaflet **1.9.4** stable, d3-cloud **1.2.9**.
- Recovered comparison pages: their bundled historical D3 v4/v5 runtime where applicable.
- Leaflet 2 remains prerelease, so the live reconstruction intentionally stays on 1.9.4.

### RATP recovery strategy

RATP remains the highest-value incomplete tutorial. The archived schema is preserved and the sandbox tries the matching public `stations.json` / `lines.json` mirror before its local fallback. Exact fullscreen wrappers and some historical input packages are still missing.

The unresolved list is maintained in:

```text
sandbox/RECOVERY_MANIFEST.md
sandbox/recovery_inventory.json
sandbox/recovered/SOURCE_INDEX.json
```

### QA

Run:

```bash
python3 scripts/smoke_test.py
```

V4 validates current JS syntax, JSON, duplicate HTML IDs, local references, all **80 recovered raw-file SHA-256 hashes**, all **11 local comparison wrappers**, and syntax for the recovered JavaScript used by the source-backed demos.

The container's Chromium process does not complete headless rendering reliably in this environment, so the QA report does **not** claim pixel-perfect browser verification. Do the final visual pass after deployment in normal Chrome/Firefox.

### Rebuild fallback fixtures

```bash
cd sandbox
python generate_dummy_data.py
```

Fallback fixtures are explicitly labelled and only remain for tutorials whose exact historical data package has not been recovered.
