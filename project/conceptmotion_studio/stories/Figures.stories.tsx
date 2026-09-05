import type { Meta, StoryObj } from '@storybook/react-vite';
import { toCanonicalJsonValue } from '../packages/core/src/index';
import { ConceptScene } from '../packages/react/src/index';
import type { FigureSpec } from '../packages/content/src/index';
import { FigureView } from '../packages/figure/src/index';
import { FigureFrame, FreshnessStamp } from '../packages/ui/src/index';
import {
  joinSceneSpec,
  loopScene,
  regressionScene,
  tableSceneSpec,
} from '../apps/studio/src/data/semanticFixtures';
import {
  columnLineageFixture,
  createPipelineDiagram,
  workflowFixture,
} from '../apps/studio/src/data/diagramFixtures';

const meta = {
  title: 'Foundation/Figures',
  component: FigureView,
  parameters: {
    docs: { description: { component: 'Production FigureView/ConceptScene renderer-neutral compositions and preserved semantic families. Prefer FigurePlayer presentationSize props for new consumer compositions; historical minimumHeight examples remain compatible.' } },
    datapass: { sourceFiles: ['packages/figure/src/registry.tsx', 'packages/ui/src/figure.tsx'], guide: 'docs/AUTHORING_DX.md' },
    chromatic: { pauseAnimationAtEnd: true },
  },
} satisfies Meta<typeof FigureView>;

export default meta;
type Story = StoryObj;

function semanticFigure(
  id: string,
  kind: FigureSpec['kind'],
  rendererId: string,
  title: FigureSpec['title'],
  spec: unknown,
  fallbackText: FigureSpec['fallbackText'],
  staticState = 0,
): FigureSpec {
  return {
    id,
    kind,
    rendererId,
    title,
    subtitle: 'A canonical semantic fixture rendered through the shared adapter registry.',
    takeaway: 'Stable entity IDs preserve meaning across every visual state.',
    spec: toCanonicalJsonValue(spec),
    sourceIds: ['source.gallery.local-fixtures'],
    conceptIds: [`concept.${rendererId}`],
    verifiedAt: '2026-09-04T10:00:00Z',
    fallbackText,
    staticState,
    reducedMotionState: staticState,
    profile: 'professional',
  };
}

const tableFigure = semanticFigure(
  'figure.table-filter-sort',
  'concept',
  'table.transform',
  { en: 'Filter and sort with stable rows', no: 'Filtrer og sorter med stabile rader' },
  tableSceneSpec,
  'An order table filters to late orders, then sorts them by descending amount.',
  2,
);

const joinFigure = semanticFigure(
  'figure.customer-order-join',
  'concept',
  'table.join',
  'One-to-many customer join',
  joinSceneSpec,
  'Customers on the left connect to matching orders on the right; unmatched customers remain visible in the left join.',
  3,
);

const loopFigure = semanticFigure(
  'figure.sum-even-loop',
  'concept',
  'algorithm.loop',
  'Accumulate even values',
  loopScene,
  'A pointer visits four values. Only eight and six update the running total, producing fourteen.',
  4,
);

const regressionFigure = semanticFigure(
  'figure.regression-residuals',
  'chart',
  'statistics.regression',
  'Residuals explain model fit',
  regressionScene,
  'Six points surround a fitted line. Residual guides show prediction error for each point.',
  2,
);

const flowFigure = semanticFigure(
  'figure.medallion-flow',
  'diagram',
  'diagram.flow',
  'Source to governed BI',
  createPipelineDiagram('data-batch'),
  'A batch data path moves from an operational source through bronze, silver, gold, a semantic model, and a BI report.',
  1,
);

const lineageFigure = semanticFigure(
  'figure.order-column-lineage',
  'lineage',
  'lineage.model',
  'Column-level revenue lineage',
  columnLineageFixture,
  'Columns from raw order tables map into date, revenue, and key columns in the gold fact table.',
  1,
);

const workflowFigure = semanticFigure(
  'figure.sales-refresh-workflow',
  'workflow',
  'workflow.topology',
  'Provider-neutral sales refresh',
  workflowFixture,
  'A workflow extracts orders, checks quality, builds silver data, publishes gold data, and handles failure paths.',
  0,
);

export const FigureFrameContract: Story = {
  render: () => (
    <FigureFrame
      title="Renderer-neutral figure frame"
      subtitle="The frame owns title, metadata, fallback, source, and actions—not rendering coordinates."
      takeaway="A production ConceptScene remains replaceable inside the shared frame."
      metadata={<FreshnessStamp verifiedAt="2026-09-04T10:00:00Z" state="current" />}
      actions={<button className="gallery-toolbar-button" type="button">Copy figure link</button>}
      source="source.gallery.local-fixtures"
      note="Static gallery frame 2"
      fallback="An order table containing only late orders sorted by amount descending."
      fallbackMode="details"
      minimumHeight="24rem"
    >
      <ConceptScene
        spec={tableSceneSpec}
        frameIndex={2}
        reducedMotion
        ariaLabel="Late orders sorted by descending amount"
        fallback="An order table containing only late orders sorted by amount descending."
      />
    </FigureFrame>
  ),
};

export const TableTransform: Story = {
  args: { figure: tableFigure, frameIndex: 2, minimumHeight: '24rem' },
};

export const TableJoin: Story = {
  args: { figure: joinFigure, frameIndex: 3, minimumHeight: '25rem' },
};

export const AlgorithmLoop: Story = {
  args: { figure: loopFigure, frameIndex: 4, minimumHeight: '24rem' },
};

export const Regression: Story = {
  args: { figure: regressionFigure, frameIndex: 2, minimumHeight: '24rem' },
};

export const DiagramFlow: Story = {
  args: { figure: flowFigure, frameIndex: 1, minimumHeight: '29rem' },
};

export const LineageModel: Story = {
  args: { figure: lineageFigure, frameIndex: 1, minimumHeight: '27rem' },
};

export const WorkflowTopology: Story = {
  args: { figure: workflowFigure, frameIndex: 0, minimumHeight: '31rem' },
};

export const ReducedMotionStaticState: Story = {
  args: {
    figure: flowFigure,
    frameIndex: 3,
    reducedMotion: true,
    minimumHeight: '29rem',
    className: 'gallery-static-state',
  },
  parameters: {
    reducedMotion: 'reduce',
  },
};
