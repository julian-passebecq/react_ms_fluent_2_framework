# Current project state — 7 September 2026

## Why this file exists

The project accumulated framework work, six consumer experiments, a VizForge line, post-hardening validation and Table Trace evidence in parallel. This page is the shortest answer to: where are we, why are we here, and what should happen next?

## Framework epochs

1. Historical six-consumer V4 baseline: `ce8353ee0878ca74b2fe24a1af7de657a6ba61f2`.
2. Post-hardening framework main: `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`.

Historical experiment conclusions remain attached to the original pin. Later checks must say explicitly when they use post-hardening main.

## Current promotion decision

Table Trace PR #3 is open, draft and unmerged.

- base: `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`
- candidate head: `6652930fa6ea036aec8cc87cbfe4a2d85ea83230`
- evidence: 15 consumer-authored traces across Formation and Visual Algorithms; zero consumer renderer implementations; zero authored geometry/keyframes.
- Director position: promote the bounded semantic family in principle, but require the small serialized-boundary/semantic-ID hardening pass before merge. Do not repin consumers automatically.

## What has been proved

- Independent consumers can reuse Datapass/ConceptMotion packages rather than rebuilding core UI, Figure playback, progress, code workbench and semantic renderer infrastructure.
- Table Trace is strong repeated-consumer evidence for semantic reuse.
- Cloud Architecture has a post-hardening consumer validation merged to its main.
- VizForge has advanced to a V1.2 consumer/package line, but its package/distribution maturity still needs project-level comparison against the broader ecosystem before expanding scope.

## What remains uncertain and must be re-audited

Do not infer release truth from source existence or old QA documents. Reconstruct exact current branch/head/CI/release status for Formation, Code Lab, Visual Algorithms, Norsk and Portfolio, plus the current Table Trace evidence branches and VizForge V1.2 release evidence.

## Project P0

1. external/versioned package consumption;
2. portable canonical content exports;
3. one framework-pin/bootstrap contract;
4. AI capability registry and concise authoring pack;
5. renderer-selection guidance;
6. synchronized code/rule to visual-state focus;
7. usable wide-Figure behavior on phones;
8. VizForge package/fixture/all-family QA/player/versioning/cross-repository stabilization.

## Immediate operating sequence

1. Technical Lead performs current web/library/architecture comparison and produces the research ZIP + Mermaid architecture maps.
2. CEO/Product UX Principal audits current consumer sites/screenshots and records the user's product preferences and product-level problems.
3. Director reconciles both into a bounded two-agent coding cycle and independent test brief.
4. Audit/Backlog Writer records exact evidence and creates the next dated control ZIP.
5. Director returns the consolidated outcome to the Technical Lead and CEO before the next architecture/product decision.

## Closed scope unless explicitly reopened

Do not start generalized charts, Visual Factory/D3 storytelling, GeoStory, earthquake/flood/movie reusable map systems, Power BI custom visual generation/adapters, backend/auth/cloud sync, universal judge, fake Spark/SQL/Jupyter execution, or another graph engine.
