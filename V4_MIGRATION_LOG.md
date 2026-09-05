# V4 migration log

## Baseline and strategy

V4 starts from exact final V3 `36c01d404e0acfd0bf9b55417ad48b4e9285586c` on `main`. The fetched remote matched the clean local tree; hosted baseline run [33924063684](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33924063684) was successful. The attached V4 handoff was extracted into a new read-only reference directory and all 26 supplied byte-count/SHA-256 records were verified. The ten primary documents were read before the target matrix and factorisation decisions were recorded.

This is an additive consolidation, not a platform/corpus re-import or app migration. There are still seven application entry points, thirty migrated Figures, 323 practice items/500 variants, 36 interview questions and ten public registry records. No renderer family or product app is added.

## Implemented sequence

1. Recorded DELIVERED/PARTIAL/MISSING/CONFLICTING baseline targets and evidence-backed extraction/non-extraction decisions in the audit and factorisation reports.
2. Added shared semantic surface tokens and native `ContentDetails`; extended Figure presentation with consumer-controlled sizes, metadata visibility and human attribution props. Old unsized renderers retain 960×540. FigureSpec remains unchanged.
3. Refined eleven existing scenes using optional semantic `ExplanationTrack` fields inside their existing scene payloads. Stable identities, algorithms, outcomes and source records remain intact. Shared SVG code/state cues replace potential per-consumer drawing logic.
4. Applied consumer language/hierarchy and Figure presentation changes across Formation, Sandbox, Interview, both Atlases, Pilot Galaxy and Visual Sandbox. Existing stores, navigation, corpus projections and execution boundaries remain in their original owners.
5. Added four structural authoring schemas, tested snippets/settings/tasks, layered agent/Copilot guidance and eight approved Storybook compositions while preserving the previous 38 IDs. Build scripts and existing gate names remain compatible.
6. Ran targeted unit, type, build and desktop/phone checks before the finished-tree release gate. Exact release evidence belongs in [V4_TEST_REPORT.md](V4_TEST_REPORT.md); byte measurements belong in [V4_BUNDLE_REPORT.md](V4_BUNDLE_REPORT.md).

## Formation naming and data compatibility

The product is Formation. Visible catalog/lesson/progress copy no longer presents it as Dubreu or leads with importer/schema/runtime implementation details. The original SQL notebook's introductory source prose is overridden by one explicit stable cell ID at the presentation layer; original IPYNB bytes, generated import hash, download URLs and source provenance remain unchanged.

Existing `course.dubreu.*`, `lesson.dubreu.*`, notebook/assessment/runtime/source IDs, draft ID `challenge.dubreu.notebook-drafts`, progress schema V2, `datapass:progress:v2` and V1.1 migration keys are deliberately retained. `useFormationProgress` is the consumer-facing helper; the old helper remains a compatible alias. Historical reports, fixtures and attribution remain historical rather than being rewritten as newly sourced content.

No storage migration or destructive reset is needed. Existing links, downloads, attempts, code drafts, flags, local Pilot notes and private overlays remain valid. A reproduced Formation submission-remount bug was fixed by holding the attempt identity until the user explicitly starts another attempt; submission no longer erases the displayed review.

## Intentional presentation changes

`FigureView` and `FigurePlayer` default to consumer metadata. Raw renderer/source/concept/feature IDs and verification details move behind a native disclosure; developer mode restores inspectable metadata. This is an intentional visible-copy change, not an identifier rename. Functional tests keep checking the same semantic selection, but open details when asserting a raw ID.

Figure sizes are optional React props, not JSON envelope fields. Existing clients that omit them retain the old viewport. Explicit sizes can change the SVG viewBox/export dimensions, while repeated export of the same size/state remains deterministic. Required visible attribution is supplied separately as human `source`/`note` content. New step captions use authored state text instead of duplicating a static takeaway.

Technical notebook/progress details similarly become optional. Standalone `AssessmentRunner` still defaults to h1; embedded consumers can choose h2. Code Sandbox advertises Visualize only for real mapped Figures. Interview review guidance remains local product policy rather than a new grading engine.

## Files and output compatibility

The private workspace release label is 4.0.0; existing package/content schema versions are not force-bumped. `build:v3` still builds the same consumers. Bundle gates now write V4-named evidence files, and refreshed consumer screenshots use `qa/v4-screenshots`, preserving historical V3 evidence. All original screenshot comparisons remain enabled; no threshold is relaxed.

The root README and current handoff point to V4 reports. Old `START_HERE.md`, master prompts, reports and prototype handoff remain preserved historical references. No branch reset, force push or unrelated repository modification is part of this migration.

The initial V4 hosted run found a fallback-font title overflow in opt-in Architecture/Galaxy nodes, while all legacy screenshot comparisons passed. A focused follow-up keeps the same 14px/card geometry and semantic identities, replacing character-count wrapping with deterministic glyph-width budgeting and wider-font regressions. Exact failing-run and corrected-tree evidence is retained in the test report; no baseline or tolerance update masks the defect.

## Deliberate deferrals

No VS Code extension, MCP server, additional app, universal layout/state package, backend, auth, cloud sync, Spark/Jupyter execution, universal judge, pipeline execution, live source monitoring, news/mail/social integration, D3 Power BI rewrite, GeoStory or full ML renderer expansion. Backups, interview review policy, provider translations and Pilot local state stay local until genuine reuse warrants extraction.
