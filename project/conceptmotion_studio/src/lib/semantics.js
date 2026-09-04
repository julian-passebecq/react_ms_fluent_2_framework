/** Pure semantic helpers kept separate from D3 so correctness can be unit-tested offline. */
export function daxEffectiveFilters(frame = {}) {
  const effective = { ...(frame.filters || {}), ...(frame.calc || {}) };
  for (const key of frame.remove || []) delete effective[key];
  return effective;
}

export function orderedValues(values, order) {
  const sequence = order || values.map((_, index) => index);
  return sequence.map((index) => values[index]);
}

/**
 * Build the relational output represented by a join storyboard frame.
 * `frame.pairs` is authoritative for the timeline: [leftIndex, rightIndex],
 * with null on the absent side for an outer/anti row.
 *
 * Semi/anti scenes intentionally project only the left side and deduplicate
 * left IDs because EXISTS/NOT EXISTS do not multiply left rows.
 */
export function joinResultRows(scene = {}, frame = {}) {
  const left = scene.left || { columns: [], rows: [] };
  const right = scene.right || { columns: [], rows: [] };
  const pairs = Array.isArray(frame.pairs) ? frame.pairs : [];
  const leftColumns = left.columns || [];
  const rightColumns = right.columns || [];
  const leftRows = left.rows || [];
  const rightRows = right.rows || [];
  const leftOnly = scene.joinType === 'semi' || scene.joinType === 'anti';

  if (leftOnly) {
    const seen = new Set();
    const rows = [];
    for (const [li] of pairs) {
      if (li == null || seen.has(li) || !leftRows[li]) continue;
      seen.add(li);
      rows.push({ id: `L${li}`, values: [...leftRows[li]], leftIndex: li, rightIndex: null });
    }
    return { columns: leftColumns.map((column) => `L.${column}`), rows };
  }

  const columns = [
    ...leftColumns.map((column) => `L.${column}`),
    ...rightColumns.map((column) => `R.${column}`)
  ];
  const rows = pairs.map(([li, ri], index) => ({
    id: `${li == null ? 'N' : `L${li}`}-${ri == null ? 'N' : `R${ri}`}-${index}`,
    leftIndex: li,
    rightIndex: ri,
    values: [
      ...(li == null ? leftColumns.map(() => 'NULL') : (leftRows[li] || leftColumns.map(() => '?'))),
      ...(ri == null ? rightColumns.map(() => 'NULL') : (rightRows[ri] || rightColumns.map(() => '?')))
    ]
  }));
  return { columns, rows };
}
