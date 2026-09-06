import type { FigureSpec } from '@datapass/content';

/** Canonical JSON-first example for the Visual Sandbox. No code is executed. */
export const tableTraceSandboxExample: FigureSpec = {
  id: 'sandbox-table-trace-filter',
  kind: 'concept',
  rendererId: 'table.trace',
  title: 'Table trace · filter rows',
  fallbackText: 'The status cells are read; late rows survive and the ok row is dropped.',
  staticState: 1,
  reducedMotionState: 1,
  profile: 'professional',
  spec: {
    kind: 'table-trace',
    version: '1',
    id: 'sandbox-table-trace-filter',
    title: 'Filter late orders',
    description: 'Cell-level predicate provenance and stable row correspondence.',
    views: [
      {
        id: 'before',
        role: 'input',
        label: 'Before',
        table: {
          id: 'orders',
          columns: [{ id: 'customer' }, { id: 'status' }, { id: 'amount' }],
          rows: [
            { id: 'o1', values: { customer: 'A', status: 'late', amount: 80 } },
            { id: 'o2', values: { customer: 'B', status: 'ok', amount: 20 } },
            { id: 'o3', values: { customer: 'C', status: 'late', amount: 70 } },
          ],
        },
      },
      {
        id: 'after',
        role: 'output',
        label: 'After',
        table: {
          id: 'orders',
          columns: [{ id: 'customer' }, { id: 'status' }, { id: 'amount' }],
          rows: [
            { id: 'o1', values: { customer: 'A', status: 'late', amount: 80 } },
            { id: 'o3', values: { customer: 'C', status: 'late', amount: 70 } },
          ],
        },
      },
    ],
    relations: [
      {
        id: 'read-status',
        kind: 'use',
        from: [
          { viewId: 'before', kind: 'cell', rowId: 'o1', columnId: 'status' },
          { viewId: 'before', kind: 'cell', rowId: 'o2', columnId: 'status' },
          { viewId: 'before', kind: 'cell', rowId: 'o3', columnId: 'status' },
        ],
        label: 'Evaluate status = late',
      },
      { id: 'keep-o1', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o1' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o1' }] },
      { id: 'drop-o2', kind: 'drop', from: [{ viewId: 'before', kind: 'row', rowId: 'o2' }] },
      { id: 'keep-o3', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o3' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o3' }] },
    ],
    frames: [
      { id: 'predicate', activeRelationIds: ['read-status'] },
      { id: 'result', activeRelationIds: ['keep-o1', 'drop-o2', 'keep-o3'] },
    ],
  },
};
