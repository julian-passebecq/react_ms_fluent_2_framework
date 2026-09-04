import type { LoopFrame, LoopSceneSpec } from '@conceptmotion/core';
import { visual } from './model';

function loop(id: string, title: string, values: readonly (number | string)[], code: string, frames: readonly Omit<LoopFrame, 'id' | 'iteration' | 'codeLineIds'>[], invariant: string, family: string, practiceId: string) {
  const spec: LoopSceneSpec = { kind: 'loop', version: '3', id, title, items: values.map((value, index) => ({ id: `i${index}`, value })), codeLines: [{ id: 'logic', text: code }], frames: frames.map((frame, index) => ({ ...frame, id: `${id}-${index}`, iteration: index, codeLineIds: ['logic'] })) };
  return visual(id, title, 'Algorithms', 'algorithm.loop', spec, spec.frames.map(f => String(f.caption)), invariant, family, [practiceId]);
}
const ids = (start: number, end: number) => Array.from({ length: Math.max(0, end - start) }, (_, i) => `i${i + start}`);
export const algorithmVisuals = [
  loop('algorithm-scan', 'Linear scan: visit every item', [8, 3, 6, 2], 'total += values[i]', [
    { operation: 'initialize', caption: 'Before reading an item, total=0.', variables: { total: 0 } },
    ...[8, 11, 17, 19].map((total, i) => ({ operation: 'accumulate', caption: `Read index ${i}; the prefix sum is ${total}.`, pointerItemId: `i${i}`, doneItemIds: ids(0, i), activeItemIds: [`i${i}`], variables: { total } })),
  ], 'After visiting index i, total equals the sum of the visited prefix.', 'scan', 'al-linear-search'),
  loop('algorithm-binary-search', 'Binary search: discard half', [2, 4, 7, 9, 13, 18, 21], 'mid = (lo + hi) // 2', [
    { operation: 'compare', caption: 'Target 13 is greater than middle value 9: retain indices 4–6.', pointerItemId: 'i3', activeItemIds: ids(0, 7), variables: { lo: 0, hi: 6, target: 13 } },
    { operation: 'narrow', caption: 'At index 5, value 18 is too large: retain index 4.', pointerItemId: 'i5', activeItemIds: ids(4, 7), doneItemIds: ids(0, 4), variables: { lo: 4, hi: 6, target: 13 } },
    { operation: 'found', caption: 'Index 4 contains 13. The target was never discarded.', pointerItemId: 'i4', activeItemIds: ['i4'], variables: { lo: 4, hi: 4, found: 4 } },
  ], 'The sorted candidate interval always contains the target if it exists.', 'binary-search', 'al-binary-search'),
  loop('algorithm-frequency', 'Frequency map: count by key', ['a', 'b', 'a', 'c'], 'counts[value] += 1', [
    { operation: 'count a', caption: 'First a: a=1.', pointerItemId: 'i0', variables: { a: 1, b: 0, c: 0 } },
    { operation: 'count b', caption: 'b receives its own bucket.', pointerItemId: 'i1', doneItemIds: ['i0'], variables: { a: 1, b: 1, c: 0 } },
    { operation: 'count a again', caption: 'The second a increments the same key, not a new bucket.', pointerItemId: 'i2', doneItemIds: ids(0, 2), variables: { a: 2, b: 1, c: 0 } },
    { operation: 'complete', caption: 'Final counts a=2, b=1, c=1 sum to four observations.', pointerItemId: 'i3', doneItemIds: ids(0, 3), variables: { a: 2, b: 1, c: 1 } },
  ], 'The sum of all bucket counts equals the number of processed items.', 'hash-frequency', 'al-frequency-map'),
  loop('algorithm-stack-queue', 'Stack and queue choose different ends', ['A', 'B', 'C'], 'stack.pop() / queue.popleft()', [
    { operation: 'arrive A', caption: 'A arrives first in both structures.', activeItemIds: ['i0'], variables: { stack: 'A', queue: 'A' } },
    { operation: 'arrive B and C', caption: 'Arrival order is A, B, C for both.', activeItemIds: ids(0, 3), variables: { stack: 'A,B,C', queue: 'A,B,C' } },
    { operation: 'LIFO versus FIFO', caption: 'A stack removes newest C; a queue removes oldest A. The remaining states differ.', activeItemIds: ['i0', 'i2'], variables: { stack: 'A,B', queue: 'B,C' } },
  ], 'Stack is last-in-first-out; queue is first-in-first-out.', 'stack-queue', 'al-stack-queue'),
  loop('algorithm-two-pointers', 'Two pointers: converge on a sum', [1, 2, 4, 7, 11], 'move left or right by comparison', [
    { operation: 'sum too large', caption: '1+11=12 > 9. Move right inward because values are sorted.', activeItemIds: ['i0', 'i4'], variables: { left: 0, right: 4, sum: 12 } },
    { operation: 'sum too small', caption: '1+7=8 < 9. Move left inward.', activeItemIds: ['i0', 'i3'], variables: { left: 0, right: 3, sum: 8 } },
    { operation: 'pair found', caption: '2+7=9 at indices 1 and 3.', activeItemIds: ['i1', 'i3'], variables: { left: 1, right: 3, sum: 9 } },
  ], 'Sorted order makes each discarded end provably unable to form the target pair.', 'two-pointers', 'al-two-pointers'),
  loop('algorithm-sliding-window', 'Sliding window: subtract, then add', [2, 1, 3, 2, 4], 'sum += incoming - outgoing', [
    { operation: 'first window', caption: 'Indices 0–2 total 2+1+3=6.', activeItemIds: ids(0, 3), variables: { start: 0, sum: 6, best: 6 } },
    { operation: 'slide one', caption: 'Remove 2 and add 2: sum stays 6.', activeItemIds: ids(1, 4), variables: { start: 1, sum: 6, best: 6 } },
    { operation: 'slide again', caption: 'Remove 1 and add 4: sum becomes 9, the best window.', activeItemIds: ids(2, 5), variables: { start: 2, sum: 9, best: 9 } },
  ], 'The active set always has three consecutive items; its sum updates in O(1).', 'sliding-window', 'al-sliding-window'),
  loop('algorithm-prefix-sum', 'Prefix sum: turn ranges into subtraction', [2, 1, 3, 2], 'prefix[i + 1] = prefix[i] + x', [
    ...[2, 3, 6, 8].map((sum, i) => ({ operation: 'build prefix', caption: `prefix[${i + 1}]=${sum}; prefix[0]=0.`, pointerItemId: `i${i}`, doneItemIds: ids(0, i), variables: { prefix: sum } })),
    { operation: 'range query', caption: 'Sum on [1,4) is prefix[4]-prefix[1]=8-2=6.', activeItemIds: ids(1, 4), variables: { upper: 8, lower: 2, range: 6 } },
  ], 'Prefix endpoints use a half-open interval: sum[l:r] = prefix[r] - prefix[l].', 'prefix-sum', 'al-prefix-sum'),
  loop('algorithm-stable-sort', 'Stable sort preserves equal-key identity', ['3a', '1', '3b', '2'], 'insert item after equal keys', [
    { operation: 'input', caption: '3a precedes 3b in the source.', order: ids(0, 4), variables: { sorted: 1 } },
    { operation: 'insert 1', caption: 'Move 1 before 3a; the two equal keys keep their order.', order: ['i1', 'i0', 'i2', 'i3'], activeItemIds: ['i1'], variables: { sorted: 2 } },
    { operation: 'insert 2', caption: 'Final order 1,2,3a,3b. Stable IDs moved rather than being recreated.', order: ['i1', 'i3', 'i0', 'i2'], doneItemIds: ids(0, 4), variables: { sorted: 4 } },
  ], 'Equal keys retain their original relative order: 3a remains before 3b.', 'sort', 'al-sorting'),
  loop('algorithm-top-k', 'Top K: keep a bounded candidate set', [5, 1, 9, 3, 8], 'if value > min(heap): replace_min()', [
    { operation: 'fill k=2', caption: 'First candidates are 1 and 5; minimum is 1.', activeItemIds: ['i0', 'i1'], variables: { heap: '1,5', k: 2 } },
    { operation: 'replace minimum', caption: '9 replaces 1. Candidates are 5 and 9.', activeItemIds: ['i0', 'i2'], pointerItemId: 'i2', variables: { heap: '5,9', k: 2 } },
    { operation: 'skip small value', caption: '3 cannot enter because 3 < minimum 5.', activeItemIds: ['i0', 'i2'], pointerItemId: 'i3', variables: { heap: '5,9', k: 2 } },
    { operation: 'replace again', caption: '8 replaces 5. The final top two values are 8 and 9.', activeItemIds: ['i2', 'i4'], variables: { heap: '8,9', k: 2 } },
  ], 'After each item, the bounded set contains the largest K values seen so far.', 'heap-top-k', 'al-heap-top-k'),
  loop('algorithm-interval-merge', 'Merge intervals after sorting starts', ['[1,3]', '[2,5]', '[8,9]'], 'if next.start <= end: extend end', [
    { operation: 'start interval', caption: 'Current interval is [1,3].', activeItemIds: ['i0'], variables: { start: 1, end: 3 } },
    { operation: 'overlap', caption: 'Next start 2 <= current end 3, so extend to [1,5].', activeItemIds: ['i0', 'i1'], variables: { start: 1, end: 5 } },
    { operation: 'gap', caption: '8 > 5 closes [1,5]; the new interval is [8,9].', doneItemIds: ['i0', 'i1'], activeItemIds: ['i2'], variables: { closed: '[1,5]', current: '[8,9]' } },
  ], 'Output intervals are sorted and disjoint; their union equals the input union.', 'intervals', 'al-merge-intervals'),
];
