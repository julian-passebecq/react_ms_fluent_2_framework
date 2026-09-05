import type { Meta, StoryObj } from '@storybook/react-vite';
import { FigurePlayer } from '../packages/figure/src';
import { visualExplanationFigure } from '../content/visuals/explanation-examples';

export default {
  title: 'V4/Visual explanations',
  parameters: { datapass: { status: 'approved-composition', guide: '../../V4_VISUAL_AUTHORING_GUIDE.md', runtime: 'Production FigurePlayer; deterministic fixtures, no execution' }, docs: { description: { component: 'Approved semantic motion: preserve identities, name the operation, synchronize code/state. Use the same canonical examples through @datapass/canonical/explanations in external consumers.' } } },
} satisfies Meta;
type Story = StoryObj;
const show = (id: string): Story => ({ render: () => <FigurePlayer figure={visualExplanationFigure(id)} presentationSize="compact" showInspector={false} /> });
export const PairByPairJoin = show('sql-inner-join');
export const LeftJoinNull = show('sql-left-join');
export const Cardinality = show('sql-grain');
export const GroupGrain = show('sql-group');
export const WindowRank = show('sql-window-rank');
export const MovingRowsFrame = show('sql-rows-between');
export const BubbleSwap = show('algorithm-bubble-sort');
export const InsertionShift = show('algorithm-stable-sort');
export const DfsWorklist = show('algorithm-dfs-worklist');
export const PartitionShuffle = show('de-shuffle');
export const Skew = show('de-skew');
export const Repartition = show('de-repartition');
export const Coalesce = show('de-coalesce');
export const Backfill = show('de-backfill');
