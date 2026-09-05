import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Select } from '@fluentui/react-components';
import { ContentDetails } from '../packages/ui/src';
import { FigurePlayer } from '../packages/figure/src';
import { ChallengeWorkbench } from '../packages/learning/src';
import { createEmptyProgressState } from '../packages/progress/src';
import { resolveLocalizedText } from '../packages/content/src';
import { visualById } from '../content/visuals';
import { projectRegistry } from '../content/projects';
import { challengeCatalog } from '../apps/studio/src/data/challengeFixtures';
import { architectureFigure } from '../apps/architecture-atlas/src/data';
import { projectGalaxyFigure } from '../apps/pilot-center/src/projectDiagram';

const approved = (description: string, sourceFiles: string[]) => ({
  docs: { description: { story: description } },
  datapass: { status: 'approved-composition', sourceFiles, guide: 'docs/AUTHORING_DX.md', runtime: 'production components; no execution' },
});
const meta = {
  title: 'V4/Approved compositions',
  parameters: {
    docs: { description: { component: 'Approved production compositions. Reuse shared contracts and controls; keep consumer policy local. Presentation sizes never change FigureSpec, and details never replace required attribution.' } },
    datapass: { status: 'approved-composition', guide: 'docs/AUTHORING_DX.md' },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;
const binary = visualById('algorithm-binary-search')!;

export const CompactFigure: Story = {
  parameters: approved('Compact presentation for small algorithms. Stable code/data/state and reduced-motion stepping use the same production FigurePlayer.', ['packages/figure/src/player.tsx', 'content/visuals/algorithms.ts']),
  render: () => <FigurePlayer figure={binary.figure} captions={binary.captions} presentationSize="compact" reducedMotion />,
};
export const RegularFigure: Story = {
  parameters: approved('Regular presentation of exactly the same Figure content; viewport choices stay out of semantic specs.', ['packages/figure/src/player.tsx']),
  render: () => <FigurePlayer figure={binary.figure} captions={binary.captions} presentationSize="regular" reducedMotion />,
};
export const ExpandedFigure: Story = {
  parameters: approved('Expanded presentation is available for spacious workbench/architecture contexts without forking renderer geometry.', ['packages/figure/src/player.tsx']),
  render: () => <FigurePlayer figure={binary.figure} captions={binary.captions} presentationSize="expanded" reducedMotion />,
};
export const SourcesAndDetails: Story = {
  parameters: approved('Required attribution is visible. Internal IDs and audit provenance live in a keyboard-accessible, closed-by-default shared disclosure.', ['packages/ui/src/content-details.tsx']),
  render: () => <section className="gallery-stack"><h2>Read the grain before joining</h2><p>Ask whether each key appears once or many times on either side.</p><p>Illustrative data and explanation by Julian Passebecq.</p><ContentDetails><p>Figure: figure.sql-grain. Renderer: table.join.</p><p>Source: author-provided reference, retained in the migration audit. No private repository location is published.</p></ContentDetails></section>,
};
export const LearningReasoning: Story = {
  parameters: approved('A concise prediction prompt leads into the shared semantic figure; explanatory prose supports the figure rather than repeating implementation metadata.', ['content/visuals/sql.ts', 'packages/figure/src/player.tsx']),
  render: () => { const visual = visualById('sql-grain')!; return <section className="gallery-stack"><h2>Predict the output grain</h2><p>Two orders and two dimension versions share one key. How many matched pairs will that key produce?</p><FigurePlayer figure={visual.figure} captions={visual.captions} presentationSize="regular" reducedMotion /><ContentDetails summary="Reasoning guide"><p>For a shared key, each matching row on the left pairs with every matching row on the right. Check uniqueness before assuming one output row per order.</p></ContentDetails></section>; },
};
function ChallengeExample() {
  const [progress, setProgress] = useState(createEmptyProgressState);
  const [notes, setNotes] = useState('');
  return <ChallengeWorkbench challenge={challengeCatalog[0]} figure={visualById('sql-left-join')!.figure} progress={progress} onProgressChange={setProgress} notes={notes} onNotesChange={setNotes} reducedMotion />;
}
export const ChallengeWithFigure: Story = {
  parameters: approved('The production ChallengeWorkbench makes Visualize discoverable and shares code/diff/progress semantics. Story state is memory-only; comparison is not grading.', ['packages/learning/src/challenge-workbench.tsx', 'apps/studio/src/data/challengeFixtures.ts']),
  render: () => <ChallengeExample />,
};
export const ArchitectureSemanticNode: Story = {
  parameters: approved('Architecture stage/category/icon/selected-path semantics use the existing Diagram renderer and shared deterministic layout. No provider-specific graph component.', ['apps/architecture-atlas/src/data.ts', 'packages/svg/src/renderers/diagram.ts']),
  render: () => <FigurePlayer figure={architectureFigure('medallion', 'conceptual', 'layered')} presentationSize="expanded" frameIndex={3} selectedId="process" reducedMotion />,
};
function GalaxyExample() {
  const [selectedId, setSelectedId] = useState('project.formation');
  const selected = projectRegistry.find((project) => project.id === selectedId);
  return <section className="gallery-stack"><Field label="Select a public project"><Select value={selectedId} onChange={(_, data) => setSelectedId(data.value)}>{projectRegistry.map((project) => <option key={project.id} value={project.id}>{resolveLocalizedText(project.title)}</option>)}</Select></Field><FigurePlayer figure={projectGalaxyFigure(projectRegistry)} selectedId={selectedId} onSelect={setSelectedId} showInspector={false} presentationSize="expanded" reducedMotion /><p aria-live="polite">{selected ? `${resolveLocalizedText(selected.title)} · ${selected.kind} · ${selected.status}` : 'Project hub'}</p></section>;
}
export const ProjectGalaxySelection: Story = {
  parameters: approved('Canonical public registry drives the selected Figure node and readable details. No Pilot notes, private overlay, force simulation or copied graph implementation.', ['content/projects.registry.json', 'apps/pilot-center/src/projectDiagram.ts']),
  render: () => <GalaxyExample />,
};
