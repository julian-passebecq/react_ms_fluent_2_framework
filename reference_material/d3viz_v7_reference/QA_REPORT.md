# Newsroom Observatory V4 — QA / improvement report

**Pass date:** 2026-09-03

## What changed in V4

### Main newsroom app

- URL state now preserves `mode`, `source`, `topic`, `geo`, `issue` and search query.
- Added **Copy view** so a filtered dashboard/news view can be shared directly.
- Improved medium/mobile layout: horizontal mode nav, horizontal source rail, stacked cover layout, reduced card density on small screens.
- Added clearer focus treatment and reduced-motion handling.
- D3 SVG roots now receive basic accessible image semantics instead of being anonymous SVG containers.

### D3 Recovery Lab

- Bundled the `datavis.fr/` directory from the supplied `D3_template-main.zip` as a local recovered working copy.
- Preserved **80 raw files byte-for-byte** and generated `SOURCE_INDEX.json` with size + SHA-256 for each file.
- Added **11 deterministic runtime wrappers**. Raw recovered HTML is not edited; wrappers only provide a local `<base>` and remove remote/missing D3 imports so source comparison does not depend on a CDN.
- Added **Modern rebuild ↔ Recovered page** preview switching.
- Added **Modern ↔ Recovered JS** code switching and copy action.
- Added recovery-status filters in the demo sidebar.
- Added a new source-backed **SVG Tooltip** reconstruction, bringing the lab to **25 runnable demos**.
- Standard source-backed demos now use bundled recovered data locally rather than calling a GitHub raw URL at runtime.

## Automated checks

All completed successfully:

```text
PASS  app.js syntax
PASS  sandbox/sandbox.js syntax
PASS  netlify/functions/news.mjs syntax
PASS  recovered source JavaScript syntax used by 11 mapped demos
PASS  Python compilation
PASS  data/catalog.json
PASS  data/economist_stats.json
PASS  data/news_fallback.json
PASS  sandbox/recovery_inventory.json
PASS  sandbox/recovered/SOURCE_INDEX.json
PASS  duplicate-ID check for main + sandbox HTML
PASS  local HTML href/src existence check
PASS  80 recovered raw-file size + SHA-256 checks
PASS  11 recovered runtime wrapper checks
PASS  raw bundled datavis.fr directory matches the uploaded archive extraction
```

Local HTTP smoke checks returned **200** for the main app, D3 lab, JS/data assets, source index and all 11 recovered comparison pages.

## Library-version decision

- Modern D3 code remains on **D3 7.9.0**.
- Maps remain on **Leaflet 1.9.4**, the current stable release.
- Leaflet 2.0 is still prerelease/alpha, so migrating the recovery lab to it would create unnecessary compatibility churn for the old Leaflet/D3 tutorial patterns.
- Historical comparison pages retain their bundled D3 v4/v5 runtime where that is part of the recovered working copy.

## Recovery search result in this pass

No convincing new copy of the remaining P0/P1 raw assets was found. In particular:

- `fullscreenBilouette.html` — still missing; exact GitHub search mainly returns this project's own hunt list.
- `from1901to2020.json` — still not recovered; derivative GitHub examples reference the exact filename, which corroborates the archived tutorial, but do not contain the large source dataset.
- `wordsCount2016.csv` — still missing; exact GitHub search again mainly returns this project's own manifest.

The user-supplied D3 template archive therefore remains the most useful recovery gain in V4.

## Browser-rendering limitation

A local recovered page was served successfully over HTTP, but the container's headless Chromium process did not terminate within the QA timeout and produced environment/DBus errors. Therefore this report **does not claim pixel-perfect visual browser QA**.

Recommended final deployment check:

1. Chrome desktop at ~1440 px and ~1024 px.
2. Chrome/Firefox responsive view around 390 px width.
3. Open several source-backed demos and switch **Modern rebuild ↔ Recovered page**.
4. Test RATP/Leaflet interactions with an internet connection for map tiles and the remote full-GeoJSON mirror.
5. Test BBC/NRK live mode through Netlify rather than a plain static HTTP server.
