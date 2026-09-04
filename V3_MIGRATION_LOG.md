# V3 migration log

## Baseline and order

Implementation started from clean `main` at `8cccd77ecd0d0b60b1d28ee2e41cffe5ec78a26f`, verified against the remote. The attached V3 handoff was safely extracted under `reference_material/v3_handoff_2026-09-04/`; all 20 supplied SHA-256 entries matched. START_HERE, V2_POST_IMPLEMENTATION_AUDIT, V3_SCOPE_AND_BOUNDARIES and CODEX_MASTER_PROMPT were read first, followed by the relevant app, visual-language and QA specifications. Attached text was treated as source material under the user's explicit V3 request, not as independent authorization to add integrations.

### 1. Hosted CI repaired first

Run `33913887435` passed every stage except four missing Linux screenshots. Its actual outputs were recovered from artifact `9952583496`, visually reviewed and added unchanged as Linux baselines. Existing comparison assertions and 1% pixel tolerance remain. Provenance/update instructions are in `tests/browser/BASELINES.md`.

Commit `df98913de2a4b01a319db627b740cdd8513c05cd` was pushed before V3 implementation. [Run 33916767119](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33916767119) concluded **success**. This proves the repaired V2 baseline independently of V3.

### 2. Additive contracts and content

Moved the former Studio challenge type into pure shared content and kept a compatibility re-export. Added deterministic practice normalization and pinned source records. Added opt-in radial/layered Diagram layout without changing unspecified-provider geometry. Added FigurePlayer and shared ChallengeWorkbench using existing controls, renderer and editor boundaries.

### 3. Source migrations

| Source | Pinned revision | Migration |
| --- | --- | --- |
| leetcodedataeng | `a3bff6aeeb89af5e379b4d8c168b3b1f581fe026` | 211 curriculum + 60 SQL + 24 engine + 28 Python = 323 distinct items; 500 variants, 24 curriculum tracks, 10 cheat sheets |
| mlweb | `a3b5a8e3f9166b137cfa32ea4924255c8717eec1` | Three shared illustrative ML concepts within the 30-scene library |
| architectureweb | `26f1ca6e501f68b3bab4217c4d13059a6796134e` | Four workload families × four provider lenses, normalized into eight stable stages |

Source working trees were not modified. Main refs were verified; source research used pinned git objects. No old UI/CSS/renderer/vendor-logo implementation was copied. The practice snapshot, per-file hashes, notices and Apache license remain in `content/practice`. Normal CI needs no source checkout or network migration.

A GitHub visibility audit confirmed all three source repositories are private and the implementation target is public. Consumer module graphs therefore use opaque source attribution and a deterministic `catalog.public.json` projection. Full source records/pins remain nonbundled migration evidence. An emitted-file scan covers all nine build outputs, including source maps, rather than relying only on source-level checks.

### 4. Consumers

Renamed `apps/dubreu-formation` to `apps/formation`; updated package, commands, TypeScript references, Vite output and product chrome. Stable lesson IDs, local progress key, notebook filenames and source provenance remain unchanged. Two reasoning capstones add 12 authored sections and eight prediction questions without claiming import of the unavailable private Dubreu corpus.

Added distinct Code Sandbox, Code Interview, Algorithm Atlas, Architecture Atlas and Pilot Center apps. Studio retains all old routes and adds a lazy production Visual Sandbox route. Canonical public registry data moved to workspace content with a Studio compatibility re-export.

### 5. QA and finish

Retained every old QA gate and added full-corpus reconciliation, all-scene semantic invariants, per-package coverage reporting/floors, new consumer browser flows, six V3 Golden Gallery stories, manifest budgets and private-overlay build guards. Local QA found/fixed a Pilot sidebar overlap, submitted-answer readability, invalid Fluent Field props and Monaco test targeting of its native edit context. Tests were corrected to drive the real accessible editor; no assertion or visual regression was disabled.

See the test/audit reports for final evidence. No deployment beyond the explicitly requested repository commit/push and hosted GitHub Actions was performed.

## Migration/rollback notes

Existing V1.1/V2 keys and IDs remain readable. Formation's filesystem rename is the intentional path change; use `pnpm run dev:consumer` and `dist-formation`. New apps own distinct local keys. Pilot and practice backups are explicit local files; preserve them before clearing browser data. No automatic migration from the old external trainer's browser storage is claimed. Historical V1/V2 reports and source handoffs remain unchanged.
