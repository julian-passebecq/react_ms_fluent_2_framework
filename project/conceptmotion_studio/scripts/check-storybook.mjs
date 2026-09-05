import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Preserve all 38 V3 story IDs plus the eight approved V4 compositions.
export const REQUIRED_STORIES = [
  "v4-visual-explanations--pair-by-pair-join",
  "v4-visual-explanations--left-join-null",
  "v4-visual-explanations--cardinality",
  "v4-visual-explanations--group-grain",
  "v4-visual-explanations--window-rank",
  "v4-visual-explanations--moving-rows-frame",
  "v4-visual-explanations--bubble-swap",
  "v4-visual-explanations--insertion-shift",
  "v4-visual-explanations--dfs-worklist",
  "v4-visual-explanations--partition-shuffle",
  "v4-visual-explanations--skew",
  "v4-visual-explanations--repartition",
  "v4-visual-explanations--coalesce",
  "v4-visual-explanations--backfill",
  "foundation-code--json-validation-error",
  "foundation-code--lazy-loading-contract",
  "foundation-code--read-only-python-reference",
  "foundation-code--solution-diff",
  "foundation-explorer--detail-drawer-open",
  "foundation-explorer--filtered-empty-state",
  "foundation-explorer--phone-project-cards",
  "foundation-explorer--project-cards",
  "foundation-explorer--project-table",
  "foundation-explorer--selected-card",
  "foundation-figures--algorithm-loop",
  "foundation-figures--diagram-flow",
  "foundation-figures--figure-frame-contract",
  "foundation-figures--lineage-model",
  "foundation-figures--reduced-motion-static-state",
  "foundation-figures--regression",
  "foundation-figures--table-join",
  "foundation-figures--table-transform",
  "foundation-figures--workflow-topology",
  "foundation-product-surfaces--assessment-and-local-progress",
  "foundation-product-surfaces--challenge-default",
  "foundation-product-surfaces--challenge-diff",
  "foundation-product-surfaces--challenge-hints",
  "foundation-product-surfaces--challenge-solution",
  "foundation-product-surfaces--imported-notebook-lesson",
  "foundation-product-surfaces--knowledge-current",
  "foundation-product-surfaces--knowledge-needs-review",
  "foundation-product-surfaces--workflow-run-state",
  "foundation-shell--desktop-application-shell",
  "foundation-shell--navigation-with-status",
  "foundation-shell--norwegian-application-shell",
  "foundation-shell--phone-application-shell",
  "v3-golden-reuse-gallery--breadth-first",
  "v3-golden-reuse-gallery--grain-and-join",
  "v3-golden-reuse-gallery--group-versus-detail",
  "v3-golden-reuse-gallery--leakage-boundary",
  "v3-golden-reuse-gallery--repeat-safe-workflow",
  "v3-golden-reuse-gallery--stable-sort",
  "v4-approved-compositions--architecture-semantic-node",
  "v4-approved-compositions--challenge-with-figure",
  "v4-approved-compositions--compact-figure",
  "v4-approved-compositions--expanded-figure",
  "v4-approved-compositions--learning-reasoning",
  "v4-approved-compositions--project-galaxy-selection",
  "v4-approved-compositions--regular-figure",
  "v4-approved-compositions--sources-and-details"
];
export function checkStorybookIndex(index) {
  const entries = Object.values(index.entries ?? {}).filter((entry) => entry.type === 'story');
  const actual = new Set(entries.map((entry) => entry.id));
  const missing = REQUIRED_STORIES.filter((id) => !actual.has(id));
  if (missing.length) throw new Error(`Storybook is missing required production compositions: ${missing.join(', ')}`);
  return { storyCount: entries.length, preservedV3: 38, approvedV4: 8, visualExplanations: 14 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const filename = fileURLToPath(new URL('../storybook-static/index.json', import.meta.url));
  console.log('Storybook indexed compositions: PASS', checkStorybookIndex(JSON.parse(readFileSync(filename, 'utf8'))));
}
