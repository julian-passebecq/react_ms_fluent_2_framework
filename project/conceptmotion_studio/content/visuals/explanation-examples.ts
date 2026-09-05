import { compileTableJoin, compileTableState, type CollectionFlowSpec, type CollectionFrame, type CollectionPlacement, type ExplanationStep, type ExplanationTrack, type LoopFrame, type LoopSceneSpec, type TableJoinSpec, type WorkflowSpec } from '@conceptmotion/core';
import type { FigureSpec } from '@datapass/content';
import { orders, ranked, sqlVisuals } from './sql';
import { visual } from './model';
import { visualById } from './index';

type Values = Record<string, string | number | boolean | null>;
const cue = (id: string, title: string, entityIds: readonly string[], codeRefs: readonly string[], values: Values): ExplanationStep => ({ id, title, focus: { entityIds, codeRefs, stateKeys: Object.keys(values) }, state: Object.entries(values).map(([key, value]) => ({ key, label: key, value })) });
function figure(id: string, title: string, renderer: string, spec: unknown, captions: string[], invariant: string): FigureSpec {
  return { ...visual(id, title, renderer === 'algorithm.loop' ? 'Algorithms' : 'Data engineering', renderer, spec, captions, invariant, 'visual-explanation').figure, status: 'Deterministic teaching fixture; no execution', verifiedAt: '2026-09-05' };
}

function joinExample(id: string): FigureSpec {
  const original = sqlVisuals.find(v => v.id === id)!.figure;
  const join = (original.spec as unknown as { join: TableJoinSpec }).join;
  const result = compileTableJoin(join);
  const steps: ExplanationStep[] = [cue('read-input', 'Read the source rows and their join keys.', [], ['read'], { emitted: 0, leftRows: join.left.rows.length, rightRows: join.right.rows.length })];
  const revealCounts = [0];
  const captions = ['Source rows retain their identity as each matching pair creates a new result row.'];
  result.rows.forEach((row, i) => {
    const sources = [row.leftRowId && `left:${row.leftRowId}`, row.rightRowId && `right:${row.rightRowId}`].filter((v): v is string => Boolean(v));
    const unmatched = row.rightRowId === null;
    steps.push(cue(`probe-${i}`, unmatched ? 'NO MATCH · keep the left row.' : `MATCH · ${row.leftRowId} pairs with ${row.rightRowId}.`, sources, [unmatched ? 'unmatched' : 'match'], { emitted: i, left: row.leftRowId, right: row.rightRowId }));
    revealCounts.push(i);
    captions.push(unmatched ? `${row.leftRowId} has no matching customer. LEFT JOIN must still preserve this order.` : `${row.leftRowId} and ${row.rightRowId} have equal customer keys. One result is created for this pair.`);
    steps.push(cue(`emit-${i}`, unmatched ? 'NULL EXTEND · preserve the order; fill right columns with NULL.' : 'EMIT · create one result row for this pair.', [...sources, row.id], [unmatched ? 'null' : 'emit'], { emitted: i + 1, left: row.leftRowId, right: row.rightRowId }));
    revealCounts.push(i + 1);
    captions.push(unmatched ? `${row.leftRowId} survives as ${row.leftRowId} × NULL. No right-side record was invented.` : id === 'sql-grain' && i < 4 ? `Pair ${i + 1} of four for A: two orders × two dimension versions. These are pairs, not four distinct orders.` : `Emit ${row.leftRowId} × ${row.rightRowId}; ${i + 1} result rows now exist.`);
  });
  const explanation: ExplanationTrack = { codeLines: [{ id: 'read', text: 'FROM orders AS l' }, { id: 'match', text: (join.joinType === 'left' ? 'LEFT JOIN' : 'INNER JOIN') + ' customers AS r ON l.customer = r.customer' }, { id: 'emit', text: 'SELECT l.*, r.*  -- one row per pair' }, ...(join.joinType === 'left' ? [{ id: 'unmatched', text: '-- LEFT JOIN keeps an unmatched left row' }, { id: 'null', text: '-- emit left values + NULL right columns' }] : [])], steps };
  return { ...original, spec: JSON.parse(JSON.stringify({ kind: 'join', version: '4', id, title: original.title, join, revealCounts, explanation })), fallbackText: captions.join(' '), subtitle: 'Match source rows, then create each result.', status: 'Deterministic teaching fixture; no SQL execution' };
}

function sorting(insertion: boolean): FigureSpec {
  const id = insertion ? 'algorithm-stable-sort' : 'algorithm-bubble-sort';
  const values = insertion ? ['3a', '1', '3b', '2'] : ['5', '1', '4', '2'];
  const title = insertion ? 'Insertion sort: shift, then place the key' : 'Bubble sort: compare, swap, keep';
  const items = values.map((value, i) => ({ id: `i${i}`, value, label: `item ${i + 1}` }));
  const order = items.map(i => i.id);
  const valueOf = (itemId: string) => parseInt(values[Number(itemId.slice(1))], 10);
  const frames: LoopFrame[] = [];
  let comparisons = 0;
  let moves = 0;
  const emit = (operation: string, caption: string, active: string[], i: number, j: number, done: string[], pointer?: string) => frames.push({ id: `${operation.toLowerCase()}-${frames.length}`, iteration: i, operation, caption, order: [...order], activeItemIds: [...active], doneItemIds: [...done], pointerItemId: pointer, codeLineIds: [operation.toLowerCase()], variables: { i, j, comparisons, [insertion ? 'shifts' : 'swaps']: moves } });
  if (insertion) {
    for (let i = 1; i < order.length; i++) {
      const key = order[i];
      let j = i;
      emit('KEY', `Hold ${values[Number(key.slice(1))]} as the key; the prefix before it is sorted.`, [key], i, j, order.slice(0, i), key);
      while (j > 0) {
        const previous = order[j - 1];
        comparisons++;
        emit('COMPARE', 'Compare the key with the previous value. Shift only a strictly larger value.', [previous, key], i, j, order.slice(0, j - 1), key);
        if (valueOf(previous) <= valueOf(key)) break;
        [order[j - 1], order[j]] = [order[j], order[j - 1]];
        moves++; j--;
        emit('SHIFT', 'The larger value moves right; the held key moves toward its insertion position.', [previous, key], i, j, order.slice(0, j), key);
      }
      emit('PLACE', 'Place the key. The sorted prefix grows; equal keys keep their original order.', [key], i, j, order.slice(0, i + 1), key);
    }
  } else {
    for (let i = 0; i < order.length - 1; i++) {
      for (let j = 0; j < order.length - i - 1; j++) {
        const active = [order[j], order[j + 1]];
        comparisons++;
        emit('COMPARE', 'Compare the adjacent highlighted values.', active, i, j, order.slice(order.length - i));
        if (valueOf(order[j]) > valueOf(order[j + 1])) {
          [order[j], order[j + 1]] = [order[j + 1], order[j]]; moves++;
          emit('SWAP', 'The left value is larger: the same two items exchange positions.', active, i, j, order.slice(order.length - i));
        } else emit('KEEP', 'The pair is already ordered. Keep both positions.', active, i, j, order.slice(order.length - i));
      }
    }
  }
  emit('DONE', insertion ? 'Sorted: 1, 2, 3a, 3b. Equal-key identity is preserved.' : 'Sorted: 1, 2, 4, 5. Every swap retained both item identities.', [], values.length - 1, 0, order);
  const codeLines = insertion ? [{ id: 'key', text: 'key = values[i]' }, { id: 'compare', text: 'while j > 0 and values[j - 1] > key:' }, { id: 'shift', text: '    values[j] = values[j - 1]; j -= 1' }, { id: 'place', text: 'values[j] = key' }, { id: 'done', text: 'return values' }] : [{ id: 'compare', text: 'if values[j] > values[j + 1]:' }, { id: 'swap', text: '    swap(values[j], values[j + 1])' }, { id: 'keep', text: 'else: keep the pair' }, { id: 'done', text: 'return values' }];
  const spec: LoopSceneSpec = { kind: 'loop', version: '4', id, title, items, codeLines, frames, explanation: { steps: frames.map(f => cue(f.id, `${f.operation} · ${String(f.caption)}`, f.activeItemIds ?? [], f.codeLineIds, f.variables as Values)) } };
  return figure(id, title, 'algorithm.loop', spec, frames.map(f => String(f.caption)), insertion ? 'Before each insertion, the prefix is sorted. Shift only larger values to preserve stability.' : 'Each pass moves the largest remaining value to the end.');
}

function collectionFigure(spec: CollectionFlowSpec, invariant: string): FigureSpec { return figure(spec.id, String(spec.title), 'collection.flow', spec, spec.frames.map(f => String(f.caption)), invariant); }
const placements = (entries: Record<string, string[]>): CollectionPlacement[] => Object.entries(entries).flatMap(([containerId, ids]) => ids.map(itemId => ({ itemId, containerId })));

function groupExample(): FigureSpec {
  const start = placements({ detail: orders.rows.map(r => r.id) });
  const gathered = orders.rows.map(r => ({ itemId: r.id, containerId: `group-${r.values.customer}` }));
  const summaries = ['A', 'B', 'C'].map(key => ({ id: `total-${key}`, containerId: `group-${key}`, label: `${key} · SUM = ${orders.rows.filter(r => r.values.customer === key).reduce((n, r) => n + Number(r.values.amount), 0)}`, sourceItemIds: orders.rows.filter(r => r.values.customer === key).map(r => r.id), collapsed: true }));
  const frames: CollectionFrame[] = [
    { id: 'detail', operation: 'READ', caption: 'Four orders enter. Customer A appears twice.', placements: start },
    { id: 'gather', operation: 'GROUP', caption: 'Move each order into its customer group; keep the contributing order IDs.', placements: gathered, activeItemIds: ['o1', 'o2'], activeContainerIds: ['group-A'] },
    { id: 'collapse', operation: 'AGGREGATE', caption: 'Collapse each group into one total. Four order rows become three customer results.', placements: gathered, summaries },
  ];
  return collectionFigure({ kind: 'collection', version: '4', id: 'sql-group', title: 'GROUP BY changes the grain', containers: [{ id: 'detail', label: 'Detail orders' }, ...['A', 'B', 'C'].map(k => ({ id: `group-${k}`, label: `Customer ${k}` }))], items: orders.rows.map(r => ({ id: r.id, label: `${r.id} · ${r.values.customer} · ${r.values.amount}` })), frames, explanation: { codeLines: [{ id: 'read', text: 'FROM orders' }, { id: 'group', text: 'GROUP BY customer' }, { id: 'sum', text: 'SELECT customer, SUM(amount)' }], steps: frames.map((f, i) => cue(f.id, f.operation, i ? ['o1', 'o2'] : [], [['read'], ['group'], ['sum']][i], { inputRows: 4, outputRows: i === 2 ? 3 : 4, grain: i === 2 ? 'customer' : 'order', total: 250 })) } }, 'Aggregation changes grain; contributor identity explains each output total.');
}

function rankExample(): FigureSpec {
  const rows = [ranked.rows[0], ranked.rows[2], ranked.rows[1], ranked.rows[3]];
  const partitioned = [ranked.rows[1], ranked.rows[0], ranked.rows[3], ranked.rows[2]];
  const make = (withRank: boolean) => partitioned.map(r => ({ itemId: r.id, containerId: `partition-${r.values.customer}`, ...(withRank ? { annotation: `rank ${r.values.rank}` } : {}) }));
  const frames: CollectionFrame[] = [
    { id: 'input', operation: 'READ', caption: 'Four events, one row per event.', placements: placements({ input: rows.map(r => r.id) }) },
    { id: 'partition', operation: 'PARTITION', caption: 'Gather by customer and order newest first inside each partition.', placements: make(false), activeContainerIds: ['partition-A', 'partition-B'] },
    { id: 'rank', operation: 'RANK', caption: 'Attach ROW_NUMBER within each partition. All four original events remain.', placements: make(true), activeItemIds: partitioned.map(r => r.id) },
  ];
  return collectionFigure({ kind: 'collection', version: '4', id: 'sql-window-rank', title: 'Window ranking preserves row grain', containers: [{ id: 'input', label: 'Input events' }, { id: 'partition-A', label: 'Customer A' }, { id: 'partition-B', label: 'Customer B' }], items: rows.map(r => ({ id: r.id, label: `${r.id} · t=${r.values.time}` })), frames, explanation: { codeLines: [{ id: 'partition', text: 'PARTITION BY customer' }, { id: 'order', text: 'ORDER BY time DESC, event_id' }, { id: 'rank', text: 'ROW_NUMBER() OVER (...)' }], steps: frames.map((f, i) => cue(f.id, f.operation, f.activeItemIds ?? [], i === 0 ? [] : i === 1 ? ['partition', 'order'] : ['rank'], { rows: 4, grain: 'event', partitions: i ? 2 : 0 })) } }, 'Partitioning and ranking keep every input row; ties require deterministic ordering.');
}

function windowExample(): FigureSpec {
  const values = [10, 20, 30, 40, 50];
  const table = { id: 'daily', columns: [{ id: 'day' }, { id: 'amount' }], rows: values.map((amount, i) => ({ id: `r${i + 1}`, values: { day: i + 1, amount } })) };
  const windows = values.map((_, i) => ({ currentRowId: `r${i + 1}`, memberRowIds: values.slice(Math.max(0, i - 1), i + 1).map((__, n) => `r${Math.max(0, i - 1) + n + 1}`) }));
  const explanation: ExplanationTrack = { codeLines: [{ id: 'sum', text: 'SUM(amount) OVER (ORDER BY day' }, { id: 'frame', text: 'ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)' }], steps: windows.map((w, i) => cue(`window-${i}`, `CURRENT ROW ${i + 1} · advance the frame`, w.memberRowIds, ['sum', 'frame'], { currentRow: i + 1, members: w.memberRowIds.join(', '), sum: values[i] + (values[i - 1] ?? 0) })) };
  return figure('sql-rows-between', 'A moving ROWS BETWEEN frame', 'table.transform', { kind: 'table', version: '4', id: 'sql-rows-between', title: 'One preceding row through the current row', frames: values.map(() => compileTableState(table)), windowFrames: windows, explanation }, windows.map((w, i) => `Current row ${i + 1}: frame ${w.memberRowIds.join(', ')}; sum=${values[i] + (values[i - 1] ?? 0)}.`), 'The frame moves around the current row; the input grain stays one row per day.');
}

function partitionExample(mode: 'hash' | 'shuffle' | 'skew' | 'repartition' | 'coalesce'): FigureSpec {
  if (mode === 'repartition' || mode === 'coalesce') return resizeExample(mode === 'coalesce');
  const keys = mode === 'skew' ? [0, 0, 0, 0, 0, 1] : [0, 1, 2, 3, 4, 5];
  const ids = keys.map((_, i) => `r${i + 1}`);
  const containers = [{ id: 'map0', label: 'Map partition 0' }, { id: 'map1', label: 'Map partition 1' }, { id: 'reduce0', label: 'Destination 0' }, { id: 'reduce1', label: 'Destination 1' }];
  let current = placements({ map0: ids.slice(0, 3), map1: ids.slice(3) });
  const destination = (id: string) => `reduce${keys[ids.indexOf(id)] % 2}`;
  const frames: CollectionFrame[] = [{ id: 'input', operation: 'READ', caption: 'Read six stable rows from two source partitions.', placements: current }];
  const steps = [cue('input', 'READ · inspect the starting partitions', [], ['read'], { rows: 6, moved: 0, destinations: 2 })];
  const batches = ids.map(id => [id]);
  frames.push({ id: 'route', operation: 'HASH', caption: 'Teaching hash: destination = key modulo 2. Equal keys choose the same destination; this is not Spark’s internal hash.', placements: current.map(p => ({ ...p, annotation: `→ ${destination(p.itemId).slice(-1)}` })), activeItemIds: ids });
  steps.push(cue('route', 'HASH · key % 2', ids, ['route'], { rows: 6, moved: 0, rule: 'key % 2' }));
  let moved = 0;
  batches.forEach((batch, i) => {
    current = current.map(p => batch.includes(p.itemId) ? { itemId: p.itemId, containerId: destination(p.itemId) } : p);
    moved += batch.length;
    const id = `transfer-${i}`;
    const operation = 'TRANSFER';
    const caption = `Move ${batch.join(', ')} to destination ${destination(batch[0]).slice(-1)}; preserve row identity.`;
    frames.push({ id, operation, caption, placements: current, activeItemIds: batch, activeContainerIds: [destination(batch[0])] });
    steps.push(cue(id, operation, batch, ['move'], { rows: 6, moved, load0: current.filter(p => p.containerId === 'reduce0').length, load1: current.filter(p => p.containerId === 'reduce1').length }));
  });
  frames.push({ id: 'complete', operation: mode === 'shuffle' ? 'REDUCE' : 'COMPLETE', caption: mode === 'skew' ? 'Five rows land in destination 0, only one in destination 1. Adding partitions alone cannot split this hot key.' : mode === 'shuffle' ? 'Map-side rows have crossed the shuffle boundary. Reducers now process their local rows. This fixture does not execute Spark.' : 'Both destinations contain three rows. All six identities survive the redistribution.', placements: current });
  steps.push(cue('complete', frames.at(-1)!.operation, [], ['done'], { rows: 6, moved, load0: mode === 'skew' ? 5 : 3, load1: mode === 'skew' ? 1 : 3 }));
  const title = { hash: 'Hash partitioning routes equal keys together', shuffle: 'Shuffle: map → transfer → reduce', skew: 'Skew overloads one destination' }[mode];
  return collectionFigure({ kind: 'collection', version: '4', id: `de-${mode}`, title, containers, items: ids.map((id, i) => ({ id, label: `${id} · key ${keys[i]}` })), frames, explanation: { codeLines: [{ id: 'read', text: 'read source partitions  -- teaching fixture' }, { id: 'route', text: 'target = key % 2  -- illustrative hash' }, { id: 'move', text: 'transfer row to its destination' }, { id: 'done', text: mode === 'shuffle' ? 'reduce locally in each destination' : 'assert every original row survives' }], steps } }, 'Stable item membership makes redistribution and load visible; this is an illustrative trace, not runtime execution.');
}

function resizeExample(coalesce: boolean): FigureSpec {
  const ids = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];
  let current = placements({ p0: ids.slice(0, 2), p1: ids.slice(2, 4), p2: ids.slice(4) });
  const destination = (id: string) => coalesce ? id === 'r5' || id === 'r6' ? 'p0' : current.find(p => p.itemId === id)!.containerId : `p${ids.indexOf(id) % 2}`;
  const frames: CollectionFrame[] = [{ id: 'input', operation: 'READ', caption: 'The same six rows start in three partitions. Both examples target two partitions.', placements: current }];
  const steps = [cue('input', 'READ · identical input for both strategies', [], ['read'], { rows: 6, partitions: 3, target: 2, moved: 0 })];
  const batches = coalesce ? [['r5', 'r6']] : [['r2'], ['r3'], ['r5'], ['r6']];
  frames.push({ id: 'plan', operation: coalesce ? 'PLAN MERGE' : 'PLAN SHUFFLE', caption: coalesce ? 'Merge partition 2 as a whole into partition 0. Keep partition 1 intact.' : 'Repartition by key: even keys to partition 0, odd keys to partition 1.', placements: current });
  steps.push(cue('plan', coalesce ? 'MERGE WHOLE BLOCKS' : 'REDISTRIBUTE BY KEY', [], ['plan'], { rows: 6, target: 2, moved: 0 }));
  let moved = 0;
  batches.forEach((batch, i) => {
    current = current.map(p => batch.includes(p.itemId) ? { ...p, containerId: destination(p.itemId) } : p);
    moved += batch.length;
    const id = `move-${i}`;
    frames.push({ id, operation: coalesce ? 'MERGE' : 'TRANSFER', caption: coalesce ? 'Rows r5 and r6 move together; four original rows keep their positions.' : `Redistribute ${batch[0]} to its key bucket. Rows already in the right bucket remain there.`, placements: current, activeItemIds: batch });
    steps.push(cue(id, coalesce ? 'MERGE' : 'TRANSFER', batch, ['move'], { rows: 6, moved, load0: current.filter(p => p.containerId === 'p0').length, load1: current.filter(p => p.containerId === 'p1').length }));
  });
  frames.push({ id: 'complete', operation: 'COMPLETE', caption: coalesce ? 'Two partitions contain 4 and 2 rows. Whole-block merging used less movement, but did not balance load.' : 'Two partitions contain 3 rows each. Four items changed buckets in this teaching model.', placements: current });
  steps.push(cue('complete', 'COMPLETE · compare movement and load', [], ['done'], { rows: 6, partitions: 2, moved, loads: coalesce ? '4 / 2' : '3 / 3' }));
  return collectionFigure({ kind: 'collection', version: '4', id: coalesce ? 'de-coalesce' : 'de-repartition', title: coalesce ? 'Coalesce: merge whole partitions' : 'Repartition: redistribute by key', containers: [{ id: 'p0', label: 'Partition 0' }, { id: 'p1', label: 'Partition 1' }, { id: 'p2', label: 'Partition 2 → retired' }], items: ids.map((id, i) => ({ id, label: `${id} · key ${i}` })), frames, explanation: { codeLines: [{ id: 'read', text: 'input: three partitions, six stable rows' }, { id: 'plan', text: coalesce ? 'coalesce(2)  -- narrow dependency' : 'repartition(2, key)  -- shuffle' }, { id: 'move', text: coalesce ? 'merge a whole block; keep other blocks' : 'route by key % 2  -- illustrative hash' }, { id: 'done', text: 'same row identities; two output partitions' }], steps } }, coalesce ? 'Coalesce reduces partitions through a narrow dependency; whole-block merging may leave uneven load.' : 'Repartition redistributes by key with a shuffle. These small counts illustrate movement, not Spark network cost.');
}

function worklistExample(): FigureSpec {
  const states = [placements({ waiting: ['A', 'B', 'C'], stack: [], visited: [] }), placements({ waiting: ['B', 'C'], stack: ['A'], visited: [] }), placements({ waiting: [], stack: ['B', 'C'], visited: ['A'] }), placements({ waiting: [], stack: ['B'], visited: ['A', 'C'] }), placements({ waiting: [], stack: [], visited: ['A', 'C', 'B'] })];
  const captions = ['A has children B and C. The stack begins empty.', 'Push the root A.', 'Pop A; push B then C. The bottommost entry C is the top of this stack.', 'Pop newest C before B: LIFO determines the next visit.', 'Pop B. Visit order is A, C, B.'];
  const operations = ['READ', 'PUSH', 'POP / PUSH', 'POP', 'POP'];
  const frames = states.map((p, i) => ({ id: `worklist-${i}`, operation: operations[i], caption: captions[i], placements: p, activeItemIds: i ? [i === 1 || i === 2 ? 'A' : i === 3 ? 'C' : 'B'] : [] }));
  return collectionFigure({ kind: 'collection', version: '4', id: 'algorithm-dfs-worklist', title: 'DFS worklist: newest entry leaves first', containers: [{ id: 'waiting', label: 'Undiscovered' }, { id: 'stack', label: 'Stack · top at bottom' }, { id: 'visited', label: 'Visited order' }], items: ['A', 'B', 'C'].map(id => ({ id, label: id === 'A' ? 'A · children B, C' : `${id} · leaf` })), frames, explanation: { codeLines: [{ id: 'push', text: 'stack.push(root)' }, { id: 'pop', text: 'node = stack.pop(); visit(node)' }, { id: 'children', text: 'push unvisited children in order' }], steps: frames.map((f, i) => cue(f.id, operations[i], f.activeItemIds, i === 0 ? [] : i === 1 ? ['push'] : i === 2 ? ['pop', 'children'] : ['pop'], { stackSize: states[i].filter(p => p.containerId === 'stack').length, visited: states[i].filter(p => p.containerId === 'visited').map(p => p.itemId).join(', ') || 'none' })) } }, 'A LIFO worklist explores the newest discovered branch first; topology stays semantic, without another graph engine.');
}

function workflowExample(): FigureSpec {
  const spec: WorkflowSpec = { kind: 'workflow', version: '4', id: 'de-backfill', title: 'Backfill: fan out, retry, then fan in', nodes: [{ id: 'start', label: 'Select dates' }, { id: 'day1', label: 'September 1' }, { id: 'day2', label: 'September 2' }, { id: 'publish', label: 'Publish both dates' }], edges: [{ from: 'start', to: 'day1', condition: 'success' }, { from: 'start', to: 'day2', condition: 'success' }, { from: 'day1', to: 'publish', condition: 'success' }, { from: 'day2', to: 'publish', condition: 'success' }], runs: [{ id: 'backfill-2026-09-01-02', label: 'Backfill September 1–2', frames: [{ id: 'select', states: { start: { status: 'running' } } }, { id: 'fan-out', states: { start: { status: 'success' }, day1: { status: 'running', attempt: 1 }, day2: { status: 'running', attempt: 1 } } }, { id: 'retry', states: { day1: { status: 'success' }, day2: { status: 'retrying', attempt: 2 } } }, { id: 'fan-in', states: { day2: { status: 'success', attempt: 2 }, publish: { status: 'running' } } }, { id: 'complete', states: { publish: { status: 'success' } } }] }] };
  const captions = ['Select two historical dates; keep their scopes separate.', 'Run both date tasks independently after selection succeeds.', 'September 1 is done. Retry September 2; publish still waits.', 'Both date tasks succeeded; fan-in releases publish.', 'Both dates are published. This is a prerecorded DAG state trace.'];
  const explanation: ExplanationTrack = { codeLines: [{ id: 'scope', text: 'backfill dates = [Sep 1, Sep 2]' }, { id: 'fanout', text: 'start >> [day1, day2]' }, { id: 'retry', text: 'retry day2; preserve its date scope' }, { id: 'fanin', text: '[day1, day2] >> publish  -- all success' }], steps: captions.map((caption, i) => cue(spec.runs![0].frames[i].id, caption, [i === 0 ? 'start' : i === 2 ? 'day2' : i > 2 ? 'publish' : 'day1'], [[ 'scope' ], ['fanout'], ['retry'], ['fanin'], ['fanin']][i], { dates: 2, attempt: i >= 2 ? 2 : 1, publish: i < 3 ? 'waiting' : i === 3 ? 'running' : 'success' })) };
  return figure(spec.id, String(spec.title), 'workflow.run', { ...spec, explanation }, captions, 'Backfill scopes are explicit; publish waits for both dates, including the retried task.');
}

/** Approved explanatory variants retain canonical concept/item IDs. The preserved
 * thirty-scene migration gallery remains unchanged for historical compatibility. */
export const visualExplanationFigures: readonly FigureSpec[] = [joinExample('sql-inner-join'), joinExample('sql-left-join'), joinExample('sql-grain'), groupExample(), rankExample(), windowExample(), sorting(false), sorting(true), visualById('algorithm-binary-search')!.figure, worklistExample(), ...(['hash', 'shuffle', 'skew', 'repartition', 'coalesce'] as const).map(partitionExample), visualById('de-retry')!.figure, workflowExample()];
export const visualExplanationFigure = (id: string): FigureSpec => {
  const result = visualExplanationFigures.find(f => f.id === id);
  if (!result) throw new Error(`Unknown approved explanation ${id}.`);
  return result;
};
