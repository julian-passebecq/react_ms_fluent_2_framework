# Web research notes for v1.1 handoff

Research date: 2026-09-04.

These URLs are references for future source-aware documentation/update work. They are NOT permission to hard-code current feature status forever.

## Microsoft Fabric official sources

- Documentation root: https://learn.microsoft.com/en-us/fabric/
- What's New: https://learn.microsoft.com/en-us/fabric/fundamentals/whats-new
- What's New archive: https://learn.microsoft.com/en-us/fabric/fundamentals/whats-new-archive
- Fabric roadmap/release plan: https://learn.microsoft.com/fabric/release-plan/overview
- Release management: https://learn.microsoft.com/en-us/fabric/enterprise/fabric-release-management
- Runtime release channels: https://learn.microsoft.com/en-us/fabric/data-engineering/release-channels

Why they matter later:

- official docs are authoritative source candidates for feature/version/lifecycle claims;
- What's New/roadmap/release notes can emit future normalized `ChangeEvent`s;
- Fabric releases frequently enough that docs/books should store explicit source + verified metadata.

Foundation v1.1 must not crawl these URLs.

## Historical D3 in Power BI reference

https://www.mssqltips.com/sqlservertip/5273/how-to-render-d3js-custom-charts-in-power-bi-desktop/

Published in 2018. Useful as historical evidence of the motivation to reuse unusual D3 visualizations in Power BI, but its old third-party D3 Visual workflow is NOT the modern architecture for this platform.

Use `POWERBI_D3_V2.md` as the future architecture source of truth.

## Existing Microsoft Product Watch project

Repository: `julian-passebecq/microsoft_news_hub_netlify_v2`

Future reuse should focus on source registry + scheduled refresh + current/history separation + health/status, not its prior UI.
