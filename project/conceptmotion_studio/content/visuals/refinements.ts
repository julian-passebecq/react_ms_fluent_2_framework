import { compileTableJoin, type ExplanationCodeLine, type ExplanationStep, type ExplanationTrack, type LoopSceneSpec, type TableJoinSpec } from '@conceptmotion/core';
import { toCanonicalJsonValue } from '@datapass/content';
import type { VisualMigration } from './model';

export const refinedVisualIds = ['sql-filter', 'sql-inner-join', 'sql-left-join', 'sql-grain', 'sql-group', 'sql-window-rank', 'algorithm-binary-search', 'algorithm-sliding-window', 'algorithm-two-pointers', 'algorithm-prefix-sum', 'de-retry'] as const;
type Values = Record<string, readonly [label: string, value: string | number | boolean | null]>;
const code = (lines: readonly (readonly [string, string])[]): ExplanationCodeLine[] => lines.map(([id, text]) => ({ id, text }));
const step = (id: string, title: string, entityIds: readonly string[], codeRefs: readonly string[], values: Values, stateKeys = Object.keys(values)): ExplanationStep => ({ id, title, focus: { entityIds, codeRefs, stateKeys }, state: Object.entries(values).map(([key, [label, value]]) => ({ key, label, value })) });
const itemIds = (start: number, end: number) => Array.from({ length: end - start }, (_, i) => `i${start + i}`);

function loopTrack(id: string, spec: LoopSceneSpec): { codeLines: ExplanationCodeLine[]; explanation: ExplanationTrack } {
  if (id === 'algorithm-binary-search') return {
    codeLines: code([['mid', 'mid = (lo + hi) // 2'], ['compare', 'compare values[mid] with target'], ['upper', 'if value < target: lo = mid + 1'], ['lower', 'if value > target: hi = mid - 1'], ['found', 'if value == target: return mid']]),
    explanation: { steps: [
      step('compare-middle', 'Compare first; retain only a possible interval.', itemIds(0, 7), ['mid', 'compare', 'upper'], { lo: ['lo', 0], hi: ['hi', 6], mid: ['mid', 3], comparison: ['Comparison', '9 < 13'], next: ['Next interval', '[4, 6]'] }, ['mid', 'comparison', 'next']),
      step('compare-upper-half', 'The midpoint is too large; lower the upper bound.', itemIds(4, 7), ['mid', 'compare', 'lower'], { lo: ['lo', 4], hi: ['hi', 6], mid: ['mid', 5], comparison: ['Comparison', '18 > 13'], next: ['Next interval', '[4, 4]'] }, ['mid', 'comparison', 'next']),
      step('found-target', 'One remaining candidate equals the target.', ['i4'], ['compare', 'found'], { lo: ['lo', 4], hi: ['hi', 4], mid: ['mid', 4], comparison: ['Comparison', '13 = 13'], found: ['Returned index', 4] }, ['comparison', 'found']),
    ] },
  };
  if (id === 'algorithm-sliding-window') return {
    codeLines: code([['first', 'sum = sum(values[0:3])'], ['remove', 'sum -= values[left - 1]'], ['add', 'sum += values[right]'], ['best', 'best = max(best, sum)']]),
    explanation: { steps: [
      step('first-window', 'Build the first window once.', itemIds(0, 3), ['first', 'best'], { left: ['left', 0], right: ['right', 2], outgoing: ['Outgoing', '—'], incoming: ['Incoming', '2 + 1 + 3'], sum: ['Window sum', 6], best: ['Best so far', 6] }),
      step('slide-one', 'Subtract the outgoing value; add the incoming value.', itemIds(1, 4), ['remove', 'add', 'best'], { left: ['left', 1], right: ['right', 3], outgoing: ['Outgoing', 2], incoming: ['Incoming', 2], sum: ['6 − 2 + 2', 6], best: ['Best so far', 6] }, ['outgoing', 'incoming', 'sum']),
      step('slide-two', 'The changed boundary values create a better window.', itemIds(2, 5), ['remove', 'add', 'best'], { left: ['left', 2], right: ['right', 4], outgoing: ['Outgoing', 1], incoming: ['Incoming', 4], sum: ['6 − 1 + 4', 9], best: ['Best so far', 9] }, ['outgoing', 'incoming', 'sum', 'best']),
    ] },
  };
  if (id === 'algorithm-two-pointers') return {
    codeLines: code([['sum', 'pair_sum = values[left] + values[right]'], ['shrink', 'if pair_sum > target: right -= 1'], ['grow', 'if pair_sum < target: left += 1'], ['found', 'if pair_sum == target: return left, right']]),
    explanation: { steps: [
      step('shrink-right', 'A sum that is too large rules out the rightmost value.', ['i0', 'i4'], ['sum', 'shrink'], { left: ['left', 0], right: ['right', 4], sum: ['1 + 11', 12], target: ['Target', 9], next: ['Next right', 3] }, ['sum', 'next']),
      step('grow-left', 'A sum that is too small rules out the leftmost value.', ['i0', 'i3'], ['sum', 'grow'], { left: ['left', 0], right: ['right', 3], sum: ['1 + 7', 8], target: ['Target', 9], next: ['Next left', 1] }, ['sum', 'next']),
      step('found-pair', 'The two retained endpoints form the requested sum.', ['i1', 'i3'], ['sum', 'found'], { left: ['left', 1], right: ['right', 3], sum: ['2 + 7', 9], target: ['Target', 9], answer: ['Returned indices', '(1, 3)'] }, ['sum', 'answer']),
    ] },
  };
  const prefix = [0, 2, 3, 6, 8];
  return {
    codeLines: code([['build', 'prefix[i + 1] = prefix[i] + values[i]'], ['query', 'range_sum = prefix[right] - prefix[left]']]),
    explanation: { steps: [
      ...spec.frames.slice(0, 4).map((_, i) => step(`build-prefix-${i + 1}`, 'Store the sum before the next index.', [`i${i}`], ['build'], { index: ['Input index', i], previous: ['Previous prefix', prefix[i]], value: ['Input value', Number(spec.items[i].value)], prefix: [`prefix[${i + 1}]`, prefix[i + 1]], built: ['Prefix built', prefix.slice(0, i + 2).join(', ')] }, ['previous', 'value', 'prefix'])),
      step('query-half-open-range', 'Two prefix endpoints answer a half-open range.', itemIds(1, 4), ['query'], { left: ['left (inclusive)', 1], right: ['right (exclusive)', 4], upper: ['prefix[4]', 8], lower: ['prefix[1]', 2], result: ['8 − 2', 6] }, ['upper', 'lower', 'result']),
    ] },
  };
}

function sqlTrack(entry: VisualMigration): ExplanationTrack {
  if (entry.id === 'sql-filter') return { codeLines: code([['from', 'SELECT customer, amount FROM orders'], ['where', 'WHERE amount >= 70;']]), steps: [
    step('read-orders', 'Start at order grain.', ['o1', 'o2', 'o3', 'o4'], ['from'], { rows: ['Input rows', 4], grain: ['One row represents', 'an order'], threshold: ['Amount threshold', 70] }),
    step('retain-matches', 'Evaluate the predicate; keep the same surviving orders.', ['o1', 'o3'], ['where'], { rows: ['Retained rows', 2], removed: ['Filtered rows', 2], grain: ['One row represents', 'an order'] }),
  ] };
  if (entry.id === 'sql-group') return { codeLines: code([['from', 'SELECT customer, SUM(amount) AS total'], ['group', 'FROM orders GROUP BY customer;']]), steps: [
    step('order-grain', 'The input has two separate orders for customer A.', ['o1', 'o2'], ['from'], { rows: ['Input rows', 4], grain: ['Input grain', 'order'], total: ['Amount total', 250], a: ['A amounts', '100 + 50'] }),
    step('customer-grain', 'Aggregation creates one row for each customer.', ['group-A', 'group-B', 'group-C'], ['from', 'group'], { rows: ['Output rows', 3], grain: ['Output grain', 'customer'], total: ['Conserved total', 250], a: ['Customer A total', 150] }),
  ] };
  if (entry.id === 'sql-window-rank') return { codeLines: code([['select', 'SELECT customer, time,'], ['window', '  ROW_NUMBER() OVER ('], ['partition', '    PARTITION BY customer'], ['order', '    ORDER BY time DESC) AS rank'], ['from', 'FROM events;']]), steps: [
    step('event-grain', 'Start with four whole event records.', ['a-old', 'a-new', 'b-old', 'b-new'], ['select', 'from'], { rows: ['Input rows', 4], grain: ['One row represents', 'an event'], partitions: ['Customer partitions', 2] }),
    step('rank-within-partitions', 'Rank inside each customer; retain every original event.', ['a-new', 'b-new'], ['window', 'partition', 'order'], { rows: ['Output rows', 4], grain: ['Grain is unchanged', 'event'], a: ['A: newest / older', '1 / 2'], b: ['B: newest / older', '1 / 2'] }),
  ] };
  const spec = entry.figure.spec as unknown as { join: TableJoinSpec; revealCounts: number[] };
  const result = compileTableJoin(spec.join);
  const grain = entry.id === 'sql-grain';
  const left = entry.id === 'sql-left-join';
  const last = result.rows.filter(row => left ? row.leftRowId === 'o4' : true);
  return { codeLines: code([['select', 'SELECT o.customer, o.amount, c.segment'], ['join', `FROM orders o ${left ? 'LEFT' : 'INNER'} JOIN customers c`], ['key', '  ON o.customer = c.customer;']]), steps: [
    step('read-join-keys', grain ? 'The dimension key is not unique.' : 'Compare customer keys, not row positions.', [...spec.join.left.rows.map(row => `left:${row.id}`), ...spec.join.right.rows.map(row => `right:${row.id}`)], ['join', 'key'], { inputs: ['Orders in input', 4], aOrders: ['Orders with A', 2], aVersions: ['Dimension rows with A', grain ? 2 : 1], output: ['Revealed pairs', 0] }),
    step('match-customer-a', grain ? 'Two orders times two versions creates four pairs.' : 'Two A orders each match the same dimension record.', ['left:o1', 'left:o2', 'right:a', ...(grain ? ['right:a2'] : []), ...result.rows.slice(0, spec.revealCounts[1]).map(row => row.id)], ['key'], { aOrders: ['A orders', 2], aVersions: ['A dimension rows', grain ? 2 : 1], output: ['2 × matches per order', grain ? 4 : 2], grain: ['One output row', 'a matched pair'] }),
    step('complete-join', left ? 'An unmatched order survives with NULL dimension fields.' : grain ? 'Five pairs are only three matched distinct orders.' : 'Only the three matching orders appear in the result.', [...last.map(row => row.id), ...(left ? ['left:o4'] : [])], ['join', 'key'], { output: ['Output rows', result.rows.length], distinct: ['Distinct orders out', left ? 4 : 3], nulls: ['NULL-extended rows', left ? 1 : 0], grain: ['One output row', left ? 'pair or unmatched' : 'matched pair'] }),
  ] };
}

/** Content-only enrichment: IDs, existing semantic states and source mappings remain intact. */
export function refineVisual(entry: VisualMigration): VisualMigration {
  if (!(refinedVisualIds as readonly string[]).includes(entry.id)) return entry;
  const spec = entry.figure.spec as unknown as Record<string, unknown>;
  if (spec.kind === 'loop') {
    const loop = spec as unknown as LoopSceneSpec;
    const addition = loopTrack(entry.id, loop);
    return { ...entry, figure: { ...entry.figure, spec: toCanonicalJsonValue({ ...loop, ...addition, items: loop.items.map((item, index) => ({ ...item, label: `Index ${index}` })), frames: loop.frames.map((frame, index) => ({ ...frame, codeLineIds: addition.explanation.steps[index].focus.codeRefs ?? [] })) }) } };
  }
  const explanation: ExplanationTrack = entry.id === 'de-retry' ? {
    codeLines: code([['read', 'event = read_event()'], ['write', 'upsert(key=event.id, value=event.value)'], ['retry', 'retry_same_event_after_lost_response()'], ['publish', 'publish_after_success()']]),
    steps: [
      step('extract-event', 'Read one event; downstream work still waits.', ['extract'], ['read'], { event: ['Stable event key', 'event-42'], attempt: ['Write attempt', 0], rows: ['Stored keyed rows', 0], value: ['Stored value', '—'], publish: ['Publish', 'waiting'] }),
      step('write-key-once', 'The write takes effect, but its response can be lost.', ['upsert'], ['write'], { event: ['Stable event key', 'event-42'], attempt: ['Write attempt', 1], rows: ['Stored keyed rows', 1], value: ['Stored value', 80], publish: ['Publish', 'waiting'] }, ['event', 'attempt', 'rows', 'value']),
      step('retry-identical-key', 'Retry the same key, not an append with a new identity.', ['upsert'], ['retry', 'write'], { event: ['Stable event key', 'event-42'], attempt: ['Write attempt', 2], rows: ['Stored keyed rows', 1], value: ['Stored value', 80], publish: ['Publish', 'waiting'] }, ['event', 'attempt', 'rows', 'value']),
      step('acknowledge-write', 'The repeated write has the same state effect.', ['upsert', 'publish'], ['publish'], { event: ['Stable event key', 'event-42'], attempt: ['Write attempt', 2], rows: ['Stored keyed rows', 1], value: ['Stored value', 80], publish: ['Publish', 'running'] }, ['rows', 'value', 'publish']),
      step('complete-once', 'Completion preserves one keyed record.', ['publish'], ['publish'], { event: ['Stable event key', 'event-42'], attempt: ['Write attempt', 2], rows: ['Stored keyed rows', 1], value: ['Stored value', 80], publish: ['Publish', 'complete'] }, ['rows', 'publish']),
    ],
  } : sqlTrack(entry);
  return { ...entry, figure: { ...entry.figure, spec: toCanonicalJsonValue({ ...spec, explanation }) } };
}
