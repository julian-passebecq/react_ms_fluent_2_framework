import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Select } from '@fluentui/react-components';
import { FigurePlayer } from '../packages/figure/src';
import { ContentDetails } from '../packages/ui/src';
import { dataPlatformFigure, dataPlatformSource, platformProviders, type PlatformProvider } from '../content/data-platform';

export default {
  title: 'V4/Data platform',
  parameters: {
    datapass: { status: 'approved-composition', guide: '../../V4_DATA_PLATFORM_AUTHORING_GUIDE.md', runtime: 'Production Figures and pure semantic fixtures' },
    docs: { description: { component: 'Copy the typed data-platform examples. Reuse lineage.model for fields and model relationships, diagram.flow for responsibilities, and WorkflowSpec for run behavior. All positions come from existing semantic layouts.' } },
  },
} satisfies Meta;
type Story = StoryObj;
const show = (id: string): Story => ({ render: () => <FigurePlayer figure={dataPlatformFigure(id)} presentationSize="compact" source={dataPlatformSource.label} /> });
export const StarSchema = show('sales-star-schema');
export const ColumnLineage = show('sales-column-lineage');
export const KpiLineage = show('sales-kpi-lineage');
export const MedallionLineage = show('medallion-asset-lineage');
export const BackfillRun = show('de-backfill');
export const WorkflowTopology = show('backfill-workflow-topology');

function ProviderExample() {
  const [provider, setProvider] = useState<PlatformProvider>('conceptual');
  return <section className="gallery-stack">
    <Field label="Provider lens"><Select value={provider} onChange={(_, data) => setProvider(data.value as PlatformProvider)}>{platformProviders.map(id => <option key={id}>{id}</option>)}</Select></Field>
    <FigurePlayer figure={dataPlatformFigure(`lakehouse-${provider}`)} presentationSize="expanded" source={dataPlatformSource.label} />
    <p>Operate coordinates and observes all six stages. Govern applies ownership, access and catalog policy across them. The two context links are representative.</p>
  </section>;
}
export const ProviderResponsibilities: Story = { render: () => <ProviderExample /> };
export const SalesLesson: Story = {
  render: () => <article className="gallery-stack gallery-article">
    <h1 style={{ lineHeight: 1.2 }}>Can a dimension change Revenue?</h1>
    <p>Predict which fields contribute to Revenue, then use the two Figures to distinguish data derivation from filter propagation.</p>
    <div className="gallery-figure-grid">
      <FigurePlayer figure={dataPlatformFigure('sales-star-schema')} presentationSize="compact" source={dataPlatformSource.label} />
      <FigurePlayer figure={dataPlatformFigure('sales-kpi-lineage')} presentationSize="compact" source={dataPlatformSource.label} />
    </div>
    <ContentDetails summary="Reasoning guide"><p>A product selection filters order-line facts through the many-to-one relationship. Revenue aggregates the remaining sales_amount values. A correct field derivation does not guarantee a correct model grain or filter direction.</p></ContentDetails>
  </article>,
};
export const TopologyAndRun: Story = {
  render: () => <section className="gallery-stack"><h1 style={{ lineHeight: 1.2 }}>Dependencies and a particular run</h1><p>The diagram describes fan-out and fan-in. Step through the sibling Workflow Figure to observe a retry within the same two-date backfill.</p><div className="gallery-figure-grid">
    <FigurePlayer figure={dataPlatformFigure('backfill-dependencies')} presentationSize="compact" />
    <FigurePlayer figure={dataPlatformFigure('de-backfill')} presentationSize="compact" />
  </div></section>,
};
