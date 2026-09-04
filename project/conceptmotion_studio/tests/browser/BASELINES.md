# Browser visual regression baselines

The four Foundation screenshot checks stay enabled on Windows and hosted Linux.
Playwright's default snapshot naming keeps platform-specific font rasterization
separate (`*-win32.png` and `*-linux.png`); do not rename Windows images to Linux
names or remove the platform suffix. Desktop remains 1440 × 1000 and phone remains
390 × 844, with the existing light/en-US/reduced-motion capture settings and the
existing `maxDiffPixelRatio: 0.01` assertions.

## Reviewed Linux baseline provenance

The initial Linux images are the unmodified actual image attachments from
[V2 Actions run 33913887435](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33913887435),
commit `8cccd77ecd0d0b60b1d28ee2e41cffe5ec78a26f`, artifact
`playwright-report` (ID `9952583496`). All pre-browser gates passed; the browser
result was 16 passed and four failures exclusively for absent Linux PNGs.

Environment recorded by that run:

- GitHub runner `ubuntu-24.04`, image `20260831.293.1`.
- Node `24.19.0`, pnpm `11.19.0`, Playwright `1.62.1` (frozen lockfile).
- Chrome stable `152.0.7977.82`, installed with Playwright's Chrome channel setup.

Each actual image was inspected against its existing Windows counterpart before
adoption. The scenes retain the same content, stable rows/nodes, geometry, selected
workflow node and restrained styling. Linux text uses the platform font fallback.
Workflow captures intentionally show the current scroll viewport of the wide
semantic diagram; this is also present in the Windows baselines and is not a new
page-overflow regression. The existing browser overflow assertions remain intact.

| Linux filename | Dimensions | SHA-256 |
| --- | --- | --- |
| `table-scene-desktop-chrome-desktop-chrome-linux.png` | 556 × 321 | `61211c793e6eabe65913e010c03d2e1f5d143d6b0cd30e54e97c5537fb49f052` |
| `table-scene-phone-chrome-phone-chrome-linux.png` | 354 × 261 | `27a691fffb2affc0b7a3114232ca2c983e5709073fec73bab8da85d3c26e14dd` |
| `workflow-scene-desktop-chrome-desktop-chrome-linux.png` | 644 × 481 | `8d73076041b2c28afac7f22d37fde517b718faa2487f1b32089eb5c2e19dc708` |
| `workflow-scene-phone-chrome-phone-chrome-linux.png` | 354 × 481 | `9a40bc24b41af8f7d50fe8502768bcbf484bed742deb41eb8e4ec3cb1b2ff233` |

## Updating intentionally changed scenes

1. Run the ordinary browser suite first; inspect the actual/expected/diff images
   and verify the change is intended. A missing baseline is still a failure.
2. Generate only the affected platform's baselines in the matching environment:
   `pnpm exec playwright test tests/browser/foundation.spec.ts --update-snapshots`.
   Prefer the current hosted Linux environment for Linux images; a local Windows
   update must not overwrite Linux images. Existing hosted failure artifacts may
   supply initial missing baselines only after the same visual review.
3. Review all changed PNGs, record environment/provenance, and commit them with
   the responsible implementation change. Never enable automatic snapshot updates
   in the normal CI gate or increase the comparison tolerance to hide a change.
4. Run the unchanged suite again and require a successful hosted Actions run.

The Chrome stable channel and GitHub runner image can advance independently of
the lockfile. A browser or font update requires explicit visual review, not
automatic baseline acceptance. These platform-specific baselines fix the V2
missing-image failure without switching browser engines or changing existing
test behavior.
