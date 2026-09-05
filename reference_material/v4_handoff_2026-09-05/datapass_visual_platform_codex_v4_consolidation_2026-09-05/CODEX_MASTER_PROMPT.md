# Codex V4 master prompt

Continue `julian-passebecq/react_ms_fluent_2_framework` from the final V3 `main` branch. Expected baseline is commit `36c01d404e0acfd0bf9b55417ad48b4e9285586c` or a direct descendant. Do not reset or replace the working tree.

Read the full V4 handoff before implementation.

## Objective

V3 proved the shared platform by delivering Formation, Code Sandbox, Code Interview, Algorithm Atlas, Architecture Atlas, Pilot Center and Visual Sandbox on top of shared contracts and packages. V4 is a consolidation and visual-refinement release. Do not chase more application count.

## Mandatory order

1. Confirm clean/current Git state and exact baseline SHA.
2. Read the V3 audit/test/reuse/visual-migration reports already in the repository.
3. Produce a DELIVERED/PARTIAL/MISSING/CONFLICTING matrix against this V4 handoff.
4. Run targeted baseline checks before changing architecture-sensitive code.
5. Implement the smallest coherent delta.
6. Use targeted tests/builds while developing.
7. Run one complete local release gate on the finished tree.
8. Commit/push `main` if credentials permit.
9. Verify hosted GitHub Actions on the final commit.
10. Return exact SHA, hosted run URL/conclusion, changed shared APIs, consumer changes, visual evidence and remaining V5 deferrals.

## Required V4 work

### A. Consumer presentation cleanup

Separate consumer-facing content from developer/audit metadata. Hide or move internal IDs, schema versions, renderer IDs, source IDs and migration/runtime details out of normal consumer views.

Formation must be simply `Formation` in consumer-facing product language. Remove user-visible historical `Dubreu` wording from normal public learning routes/fixture prose unless an attribution/legal requirement truly needs it. Keep provenance in audit/migration material when needed. Preserve stable IDs/persistence keys or document a safe migration.

### B. Visual refinement

Implement a restrained shared visual grammar using Fluent tokens plus additive Datapass semantic tokens. Keep warm neutral canvas, navy, muted teal and sparse amber. Improve surface hierarchy, typography and subtle elevation without marketing gradients/glow/glass.

Add a consumer-controlled Figure presentation size layer (`compact | regular | expanded` or equivalent) without putting viewport sizing into semantic FigureSpec. Small algorithm/table figures should stop sitting inside needlessly large canvases.

### C. Proven factorisation

Audit repetition across all seven applications. Extract only patterns with real evidence (normally 3+ consumers or a clear semantic boundary). Do not create another mega-package or wrapper framework. Keep consumer policy local.

### D. ConceptMotion refinement

Improve approximately 8–12 existing high-value scenes with clearer synchronized code/data/state cues using stable semantic references. Prioritize SQL filter/join/grain/group/window, binary search, sliding window, two pointers, prefix sum and retry/idempotency. Preserve existing renderer families unless the audit proves one genuinely new generic primitive is necessary.

### E. Consumer-specific polish

- Formation: course/reasoning hierarchy, cleaner metadata, compact figures, no public Dubreu wording.
- Code Sandbox: make Visualize clearly discoverable when a Figure exists; preserve full corpus and workbench.
- Code Interview: improve session/question/review hierarchy; keep it distinct and ungraded where intended.
- Algorithm Atlas: compact figures and synchronized explanation cues.
- Architecture Atlas: improve generic semantic node presentation/icon categories and active-path legibility on the existing DiagramSpec/layout stack.
- Pilot Center: improve Project Galaxy hierarchy/category/status semantics on the same deterministic layout; no force simulation.
- Visual Sandbox: remain a technical authoring tool; add only authoring clarity/schema/docs improvements.

### F. AI / VS Code developer experience

Add repo-native VS Code tasks/settings/snippets and Copilot/agent instructions. Add JSON Schema support only where it can be tested against the existing TypeScript/validator source of truth. Do not build a VS Code extension in V4.

### G. QA

Preserve all existing V3 gates. Do not weaken screenshots, Axe checks, privacy gates or overflow thresholds to get green. Add focused V4 regressions and final hosted CI proof.

## Explicit non-goals

No new end-user app by default. No backend, auth, cloud sync, Spark/Jupyter execution, universal judge, D3 Power BI rewrite, GeoStory, news/mail/social integrations, full ML renderer expansion, full legacy renderer rewrite, or VS Code extension.

## Required final reports

- V4_AUDIT_SELF_REVIEW.md
- V4_FACTORISATION_REPORT.md
- V4_VISUAL_REVIEW.md
- V4_DX_REPORT.md
- V4_TEST_REPORT.md
- V4_BUNDLE_REPORT.md
- V4_MIGRATION_LOG.md

Keep the reports factual and tied to test/build/screenshot evidence.
