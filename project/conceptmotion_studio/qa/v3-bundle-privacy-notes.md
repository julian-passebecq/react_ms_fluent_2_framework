# V3 public bundle repository privacy gate

`node scripts/check-bundle-privacy.mjs` requires all nine built outputs: Studio, Formation, Code Sandbox, Code Interview, Algorithm Atlas, Architecture Atlas, Pilot Center, Storybook and legacy. It recursively inspects every non-binary artifact, including hidden Vite manifests, JavaScript, CSS, HTML, JSON, SVG and source maps. Missing or empty outputs fail; unexpected symbolic links fail rather than being silently skipped. Known raster/media/font/Wasm/PDF binary extensions are excluded. The report is `qa/v3-bundle-privacy.json`.

The enforced denylist is the three audited private source repositories under the `julian-passebecq` GitHub owner: `leetcodedataeng`, `mlweb` and `architectureweb`. Public source-family names and repository-relative provenance remain valid. Exact GitHub, SSH, raw-content, API and codeload paths are checked case-insensitively, including JSON slash/ASCII Unicode/hex escaping, HTML character entities and percent/double-percent URL encoding. Decoding is bounded to six layers and does not evaluate code. Lookalike repository names, unrelated owners and the public framework repository do not fail.

`scripts/check-v3-bundles.mjs` imports the same scanner for all six V3 consumer outputs and records its result alongside the existing size/lazy-Monaco assertions. No bundle budgets were changed. The standalone nine-output command belongs after Storybook and legacy builds in the full release gate.

## Verified evidence

- `pnpm exec vitest run scripts/check-bundle-privacy.test.mjs`: **PASS**, 16 tests, 1 file, 367 ms. Covers escaped URL forms, all three private names, source-family/public-repository false positives, a leaked encoded URL inside `sourcesContent` in a `.js.map`, a leaked HTML link, binary exclusion, clean source maps, required/nonempty build outputs, and the exact nine-output policy.
- `node scripts/check-bundle-privacy.mjs`: **PASS** against the existing nine outputs on 2026-09-04; 311 text artifacts inspected, 15 binary assets excluded, zero prohibited repository URL matches. The final integrated build/CI must rerun this gate against freshly produced outputs; its generated report is authoritative.
- Pilot Center review confirmed explicit runtime-only overlay import, strict validated HTTP(S) links without embedded credentials, a clearly labeled private backup, a separate canonical public-registry export and no static private-overlay import. Existing Pilot browser/unit tests exercise actual public-export exclusion after a runtime synthetic private overlay is imported.

## Deliberate limit

This is a release gate for the audited private repository URLs, not a universal secret scanner or a guarantee against deliberate code obfuscation, arbitrary base64 encoding, secrets embedded in binary media, or unknown private repositories. Local private note values are runtime-only and cannot be known to a static build scan; their exclusion is verified separately by the Pilot export/model/browser tests.
