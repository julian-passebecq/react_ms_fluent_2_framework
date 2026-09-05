# V4 consumer findings — 5 September 2026

Evidence source: `datapass_v4_consumer_hardening_codex_evidence_pack_2026-09-05.zip`, read in its prescribed order, starting with `00_READ_FIRST.md`. All 16 supplied byte counts and SHA-256 checksums matched. The user explicitly requested execution of `01_CODEX_MASTER_PROMPT.md` against the framework repository. The six summaries and selected implementation evidence supply requirements; the rerun plan is follow-up reference, not permission to change six other repositories in this pass. No consumer repository crawl was needed.

Historical framework pin: `ce8353ee0878ca74b2fe24a1af7de657a6ba61f2`. The working tree was clean at this commit. It remains an ancestor, never rewritten. Active root/workspace guidance, ten V4 handoff documents, the audit/factorisation matrix and latest V4 test/DX/migration reports were consulted. Baseline affected checks: 47 tests in four files passed using Node 24.19.0 and pnpm 11.19.0.

## Starting delta matrix

| Target | Status before this pass | Evidence / decision |
| --- | --- | --- |
| Semantic specs, stable IDs, deterministic layouts, Figure boundary | DELIVERED | Six summaries report zero new renderer families and zero framework-source patches. Preserve architecture. Visual Algorithms proves semantics only; its HTML compatibility presenter is not shared React runtime evidence. |
| Supported independent bootstrap | MISSING | All six invented source materialization strategies. Implement one selective, exact-commit source workspace. |
| Consumer-owned frozen lockfile | MISSING | Framework-node_modules symlinks, compatibility installs and missing locks recur. Make the consumer own dependency resolution and require its committed lock. |
| Canonical production release gate | MISSING | No audited consumer head has a proven complete canonical gate. Portfolio omits browser checks; others report environment/materialization blockers. Provide a production-preview browser gate and clean CI example. |
| Portable canonical data imports | PARTIAL | Canonical data exists, but Formation, Code Lab and Portfolio use internal filesystem paths. Add explicit package subpaths without moving/duplicating the original data. |
| External scaffold | PARTIAL | Four deterministic presets work inside the monorepo; standalone config/bootstrap/QA is missing. Preserve existing output and add external mode. |
| Domain API extensions | DEFER | Narrower consumer evidence; record individually in the backlog. |

## Audited consumer evidence

| Consumer | Audited head | Validated reuse / unresolved constraint |
| --- | --- | --- |
| Formation | `9546bc004732e0deafe8f969d14751863cff7f74` | Notebook cells, assessments, progress, Figure playback; source notebook/data/media corpus missing from pushed repository. |
| Code Lab | `7c3a37bd69898a70b8b76a9912c7bce29f797d26` | Shared ChallengeWorkbench, 323 items/500 variants, 18 visual mappings; bootstrap symlinks framework node_modules into consumer. |
| Visual Algorithms | `d7eb11622e4b5cd701f6fd86766f49c3568d5bc1` | Insertion sort, DFS and recursion use existing semantic families; real shared React/Figure runtime remains unproven in that consumer. |
| Cloud Architecture | `719b62d0d00fbb247578390e52507d1fcaa2db3a` | Seven workflows and 40 provider/layout variants with no authored geometry; production dependency gate blocked. |
| Norsk | `6ce139a3d075ad9a717b4cdc7a4f77bf9e49c670` | 215 records, shell/content/knowledge/progress reuse; French sidecar and challenge-shaped vocabulary adapter; compatibility QA is partial. |
| Portfolio | `22104f3b12bea69562c0f131e013eb20a7dcc9a6` | Shared scaffold/shell/public registry and semantic Galaxy mapping; production release command lacks browser/Axe/overflow/keyboard. |

Claims above are evidence-pack findings at the listed heads, not new independent consumer certifications. Framework fixture results and the final hosted commit belong in `V4_CONSUMER_HARDENING_REPORT.md` and the delivery message.
