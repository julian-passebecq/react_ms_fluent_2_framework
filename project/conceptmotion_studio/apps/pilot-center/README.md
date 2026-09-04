# Pilot Center

Personal, device-local project overview, shared-registry cards/table/galaxy, next actions and structured ideas. Not a public portfolio or hosted integration service.

Run from the workspace with `pnpm run dev:pilot-center` (port 4180), or `pnpm --filter @datapass/pilot-center dev`. The public records come directly from `content/projects.ts`; the app's pure `projectRegistryToDiagram` adapter emits shared DiagramSpec and opts into the production radial layout. No bespoke renderer or Monaco integration is included.

Notes and annotations use `datapass:pilot-center:v1` through the existing guarded progress storage adapter. Backups have explicit schema version 1, stable canonical serialization, strict type/ID/URL validation, a 1 MB limit and a preview-before-apply workflow. Corrupt stored content is retained and downloadable; memory edits cannot overwrite it until an explicit validated restore. Delete has an immediate undo affordance.

Optional private metadata must be imported at runtime through Backups → Private project overlay. A gitignored `content/projects.private.local.json` file may hold `{ "schemaVersion": 1, "overlays": [{ "projectId": "project.formation", "nextAction": "Review course flow" }] }`. The build never imports or fetches this file. Private links and notes are included in downloaded private backups, never public registry edits. There is no backend, sync, auth, mail, news, social or usage integration.

Studio tool links target the local development server on 4173. D3 Studio uses the destination already declared in the canonical public registry.
