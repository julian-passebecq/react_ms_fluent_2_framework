/** Metadata-only index for catalog routes. Equality against scene mappings is tested. */
export const visualPracticeIds: readonly string[] = [
  'al-batching', 'al-binary-search', 'al-frequency-map', 'al-graph-traversal',
  'al-hash-join', 'al-heap-top-k', 'al-linear-search', 'al-merge-intervals',
  'al-prefix-sum', 'al-sliding-window', 'al-sorting', 'al-stack-queue',
  'al-topological-sort', 'al-two-pointers', 'eng-filter-active', 'eng-group-sum',
  'eng-inner-join', 'eng-latest-row',
];
const practiceIds = new Set(visualPracticeIds);
export const hasPracticeVisual = (sourceId: string): boolean => practiceIds.has(sourceId);
