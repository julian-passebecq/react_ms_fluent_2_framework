import type { Meta, StoryObj } from '@storybook/react-vite';
import { FigurePlayer } from '../packages/figure/src';
import { visualById } from '../content/visuals';

const meta={title:'V3/Golden reuse gallery',component:FigurePlayer,args:{reducedMotion:true}} satisfies Meta<typeof FigurePlayer>;
export default meta;
type Story=StoryObj<typeof meta>;
const args=(id:string)=>({figure:visualById(id)!.figure,captions:visualById(id)!.captions});
export const GrainAndJoin:Story={args:args('sql-left-join')};
export const GroupVersusDetail:Story={args:args('sql-group')};
export const StableSort:Story={args:args('algorithm-stable-sort')};
export const BreadthFirst:Story={args:args('algorithm-bfs')};
export const RepeatSafeWorkflow:Story={args:args('de-retry')};
export const LeakageBoundary:Story={args:args('ml-leakage')};
