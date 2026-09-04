import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Slider,
  Tab,
  TabList,
  Text,
} from '@fluentui/react-components';
import { Eye20Regular, SelectObjectSkew20Regular } from '@fluentui/react-icons';
import { compileRegressionFrame, type LineageSpec } from '@conceptmotion/core';
import { ConceptScene } from '@conceptmotion/react';
import {
  ExplainerShell,
  FigureFrame,
  InspectorPanel,
  PageHeader,
  TimelineControls,
  useLocale,
} from '@datapass/ui';
import { SvgExportButton } from '../components/SvgExportButton';
import {
  columnLineageFixture,
  createPipelineDiagram,
  pipelineFlowKinds,
  salesModelLineage,
} from '../data/diagramFixtures';
import {
  joinLessonFrames,
  joinSceneSpec,
  loopLessonFrames,
  loopScene,
  regressionLessonFrames,
  regressionScene,
} from '../data/semanticFixtures';
import { figureLabels, timelineLabels } from '../lib/localizedChrome';
import { useTimeline } from '../lib/useTimeline';

type ExplainerId = 'join' | 'loop' | 'regression' | 'pipeline' | 'model' | 'column-lineage';

const explainers: Array<{ id: ExplainerId; label: string; eyebrow: string; frames: number }> = [
  { id: 'join', label: 'Join fan-out', eyebrow: 'TABLE SEMANTICS', frames: joinLessonFrames.length },
  { id: 'loop', label: 'Loop + state', eyebrow: 'PROGRAMMING', frames: loopLessonFrames.length },
  { id: 'regression', label: 'Regression', eyebrow: 'STATISTICS / ML', frames: regressionLessonFrames.length },
  { id: 'pipeline', label: 'Data flow', eyebrow: 'CLOUD / DATA', frames: 4 },
  { id: 'model', label: 'Data model', eyebrow: 'MODEL', frames: 1 },
  { id: 'column-lineage', label: 'Column lineage', eyebrow: 'LINEAGE FIXTURE', frames: columnLineageFixture.frames.length },
];

const pipelineCaptions = [
  'Data enters Bronze with a flow grammar selected by the learner.',
  'A dashed control signal activates transformation independently of data movement.',
  'An explicit failure marker routes invalid records to quarantine.',
  'Approved records recover into the serving path without hiding the failure history.',
];

export function ExplainersPage() {
  const { locale } = useLocale();
  const [selected, setSelected] = useState<ExplainerId>('join');
  const definition = explainers.find((item) => item.id === selected)!;
  const timeline = useTimeline(definition.frames, selected);
  const frameIndex = Math.min(timeline.currentStep, Math.max(0, definition.frames - 1));
  const [selectedEntityId, setSelectedEntityId] = useState<string>();
  const [flowKind, setFlowKind] = useState(pipelineFlowKinds[0].id);
  const [slope, setSlope] = useState(regressionScene.frames[0].slope);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected === 'regression') setSlope(regressionScene.frames[frameIndex].slope);
  }, [selected, frameIndex]);
  useEffect(() => setSelectedEntityId(undefined), [selected]);

  const pipelineSpec = useMemo(() => createPipelineDiagram(flowKind), [flowKind]);
  const regressionBase = regressionScene.frames[Math.min(frameIndex, regressionScene.frames.length - 1)];
  const regressionWithSlope = useMemo(() => compileRegressionFrame({
    ...regressionScene,
    frames: [{ ...regressionBase, id: `${regressionBase.id}:${slope}`, slope }],
  }, 0), [regressionBase, slope]);

  const copy = getExplainerCopy(selected, frameIndex, slope, regressionWithSlope.mse);
  const fallback = getFallback(selected, frameIndex);

  const figure = (
    <div ref={visualRef}>
      <FigureFrame
        {...figureLabels(locale)}
        title={copy.title}
        subtitle={copy.subtitle}
        takeaway={copy.caption}
        metadata={(
          <div className="metadata-row">
            <Badge appearance="tint" color="informative">{copy.operation}</Badge>
            <Badge appearance="outline">stable IDs</Badge>
            {selectedEntityId && <Badge appearance="outline">selected: {selectedEntityId}</Badge>}
          </div>
        )}
        toolbar={selected === 'pipeline' ? (
          <div className="toolbar-row" role="group" aria-label="Pipeline flow kind">
            {pipelineFlowKinds.map((mode) => <Button key={mode.id} size="small" appearance={flowKind === mode.id ? 'primary' : 'subtle'} onClick={() => setFlowKind(mode.id)}>{mode.label}</Button>)}
          </div>
        ) : selected === 'regression' ? (
          <label className="parameter-control">
            <span>Slope β₁</span>
            <Slider min={0.3} max={1.6} step={0.01} value={slope} onChange={(_, data) => setSlope(data.value)} aria-label="Regression slope" />
            <output>{slope.toFixed(2)} · MSE {regressionWithSlope.mse.toFixed(2)}</output>
          </label>
        ) : undefined}
        exportAction={<SvgExportButton hostRef={visualRef} filename={`${selected}-${frameIndex + 1}.svg`} />}
        source="Local Foundation v1.1 fixture"
        note={selected === 'column-lineage' ? 'The JSON fixture is parser-like input; no SQL parser is included.' : 'Motion communicates semantic state; reduced motion jumps to the complete state.'}
        fallback={fallback}
        fallbackMode="details"
        minimumHeight="27rem"
      >
        <div className="visual-host" data-testid={`explainer-${selected}`}>
          {selected === 'join' && (
            <ConceptScene spec={joinSceneSpec} frameIndex={frameIndex} reducedMotion={timeline.reducedMotion} selectedId={selectedEntityId} onSelect={setSelectedEntityId} options={{ locale, transitionDurationMs: 500 / timeline.speed }} fallback={fallback} />
          )}
          {selected === 'loop' && (
            <ConceptScene spec={loopScene} frameIndex={frameIndex} reducedMotion={timeline.reducedMotion} selectedId={selectedEntityId} onSelect={setSelectedEntityId} options={{ locale, transitionDurationMs: 500 / timeline.speed }} fallback={fallback} />
          )}
          {selected === 'regression' && (
            <ConceptScene spec={regressionScene} frameIndex={frameIndex} parameter={slope} reducedMotion={timeline.reducedMotion} selectedId={selectedEntityId} onSelect={setSelectedEntityId} options={{ locale, transitionDurationMs: 300 }} fallback={fallback} />
          )}
          {selected === 'pipeline' && (
            <ConceptScene spec={pipelineSpec} frameIndex={frameIndex} reducedMotion={timeline.reducedMotion} selectedId={selectedEntityId} onSelect={setSelectedEntityId} options={{ locale }} fallback={fallback} />
          )}
          {selected === 'model' && (
            <ConceptScene spec={salesModelLineage} reducedMotion={timeline.reducedMotion} selectedId={selectedEntityId} onSelect={setSelectedEntityId} options={{ locale }} fallback={fallback} />
          )}
          {selected === 'column-lineage' && (
            <ConceptScene spec={columnLineageFixture} frameIndex={frameIndex} reducedMotion={timeline.reducedMotion} selectedId={selectedEntityId} onSelect={setSelectedEntityId} options={{ locale }} fallback={fallback} />
          )}
        </div>
      </FigureFrame>
    </div>
  );

  const narrative = (
    <div className="explainer-narrative">
      <span className="surface-card__eyebrow">{definition.eyebrow}</span>
      <h2>{copy.objective}</h2>
      <p>{copy.why}</p>
      <div className="concept-invariant">
        <b>{locale === 'no' ? 'Invariant' : 'Invariant'}</b>
        <span>{copy.invariant}</span>
      </div>
      {selected === 'loop' && <LoopCode frameIndex={frameIndex} />}
      {selected === 'column-lineage' && <LineageExpression spec={columnLineageFixture} index={frameIndex} />}
    </div>
  );

  const aside = (
    <InspectorPanel title={locale === 'no' ? 'Tilstandsdetaljer' : 'State details'} description="Renderer-independent semantic evidence">
      <dl className="inspector-list">
        <div><dt>Renderer family</dt><dd>{rendererLabel(selected)}</dd></div>
        <div><dt>Frame</dt><dd>{frameIndex + 1} / {definition.frames}</dd></div>
        <div><dt>Operation</dt><dd>{copy.operation}</dd></div>
        <div><dt>Selected entity</dt><dd>{selectedEntityId ?? 'None'}</dd></div>
        {selected === 'regression' && <><div><dt>Slope</dt><dd>{slope.toFixed(2)}</dd></div><div><dt>Mean squared error</dt><dd>{regressionWithSlope.mse.toFixed(3)}</dd></div></>}
        {selected === 'loop' && Object.entries(loopLessonFrames[frameIndex].variables).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}
      </dl>
      <div className="semantic-id-note"><SelectObjectSkew20Regular /><Text size={200}>Select diagram objects with pointer, Enter or Space.</Text></div>
    </InspectorPanel>
  );

  return (
    <ExplainerShell
      data-testid="explainers-page"
      narrativeLabel={locale === 'no' ? 'Forklaring' : 'Explanation'}
      figureLabel={locale === 'no' ? 'Interaktiv figur' : 'Interactive figure'}
      asideLabel={locale === 'no' ? 'Merknader og tilstand' : 'Annotations and state'}
      header={(
        <div className="page-stack">
          <PageHeader
            eyebrow="EXPLAINER · SEMANTIC MOTION"
            title={locale === 'no' ? 'Bevegelse som forklarer årsak' : 'Motion that explains cause'}
            description={locale === 'no' ? 'Velg en liten, fokusert leksjon. Hver ramme fungerer også uten animasjon.' : 'Choose a small, focused lesson. Every frame remains complete without animation.'}
            metadata={<Badge appearance="outline" icon={<Eye20Regular />}>6 gold scenes</Badge>}
          />
          <TabList className="explainer-tabs" selectedValue={selected} onTabSelect={(_, data) => setSelected(data.value as ExplainerId)} aria-label="Gold-standard explainer">
            {explainers.map((item) => <Tab key={item.id} id={`explainer-tab-${item.id}`} aria-controls="explainer-figure-panel" value={item.id}>{item.label}</Tab>)}
          </TabList>
        </div>
      )}
      narrative={narrative}
      figure={figure}
      figureId="explainer-figure-panel"
      figureLabelledBy={`explainer-tab-${selected}`}
      aside={aside}
      timeline={definition.frames > 1 ? <TimelineControls {...timeline.controls} currentStep={frameIndex} labels={timelineLabels(locale)} /> : undefined}
      footer={<div className="state-strip"><b>{copy.operation}</b><span>{copy.caption}</span>{timeline.reducedMotion && <Badge appearance="tint">Reduced motion</Badge>}</div>}
    />
  );
}

function rendererLabel(selected: ExplainerId) {
  return ({ join: 'table.join', loop: 'algorithm.loop', regression: 'statistics.regression', pipeline: 'diagram.flow', model: 'lineage.model', 'column-lineage': 'lineage.model' } as const)[selected];
}

function getExplainerCopy(selected: ExplainerId, index: number, slope: number, mse: number) {
  if (selected === 'join') return {
    title: 'One key can multiply result rows', subtitle: 'LEFT JOIN fan-out with stable input and output identities',
    objective: 'Why does the result contain more rows than the customer table?', why: 'A join emits one output for every matching pair—not one output per key.', invariant: 'Every surviving result row names the exact left and right source IDs.',
    operation: joinLessonFrames[index].operation, caption: joinLessonFrames[index].caption,
  };
  if (selected === 'loop') return {
    title: 'Code, pointer and variables advance together', subtitle: 'A small Python loop accumulates only even values',
    objective: 'Connect a line of code to the state it changes.', why: 'The pointer supplies context; the highlighted branch explains whether total changes.', invariant: 'After each iteration, total equals the sum of even values already visited.',
    operation: loopLessonFrames[index].frame.operation, caption: String(loopLessonFrames[index].frame.caption),
  };
  if (selected === 'regression') return {
    title: 'Residuals reveal the quality of a fitted line', subtitle: 'Directly manipulate slope β₁',
    objective: 'See what a model parameter changes.', why: 'Each vertical residual measures observed minus predicted value; MSE summarizes their squared length.', invariant: 'The data points stay fixed while only the model and its errors respond.',
    operation: `SLOPE ${slope.toFixed(2)}`, caption: `Current mean squared error is ${mse.toFixed(3)}.`,
  };
  if (selected === 'pipeline') return {
    title: 'Data and orchestration use separate flow grammar', subtitle: 'Source → Bronze → Silver → Gold → semantic model → BI',
    objective: 'Read what moves and why.', why: 'Batch, stream, CDC, control, failure and recovery have different line patterns, markers and labels.', invariant: 'Changing ingestion mode never turns a control dependency into a data edge.',
    operation: ['INGEST', 'TRANSFORM', 'FAILURE', 'RECOVERY'][index], caption: pipelineCaptions[index],
  };
  if (selected === 'model') return {
    title: 'A star schema is a network of explicit ports', subtitle: 'Fact grain and dimension keys stay visible',
    objective: 'Trace filter and relationship endpoints.', why: 'Column ports preserve exact meaning when the same table participates in more than one relation.', invariant: 'Relationships reference stable asset and column IDs—not screen coordinates.',
    operation: 'MODEL TOPOLOGY', caption: 'Dimension key ports connect to matching foreign-key ports on the fact.',
  };
  const relation = columnLineageFixture.relations[index];
  return {
    title: 'Column lineage arrives as structured evidence', subtitle: 'Fixture-driven parser output without a parser implementation',
    objective: 'Trace one derived target back to its inputs.', why: 'The renderer consumes stable table and column endpoints plus optional expression and source span.', invariant: 'Every lineage endpoint validates before geometry is rendered.',
    operation: relation.changeType?.toUpperCase() ?? 'LINEAGE', caption: String(relation.derivation ?? relation.label ?? relation.id),
  };
}

function getFallback(selected: ExplainerId, index: number) {
  if (selected === 'join') {
    const result = joinLessonFrames[index].state;
    return <table className="fallback-table"><caption>Join output at step {index + 1}</caption><thead><tr>{result.columns.map((column) => <th key={column.id}>{column.id.split('.').at(-1)}</th>)}</tr></thead><tbody>{result.rows.map((row) => <tr key={row.id}>{result.columns.map((column) => <td key={column.id}>{String(row.values[column.id] ?? 'NULL')}</td>)}</tr>)}</tbody></table>;
  }
  if (selected === 'loop') {
    const frame = loopLessonFrames[index];
    return <p>Iteration {frame.frame.iteration}. Pointer: {frame.frame.pointerItemId ?? 'not started'}. Variables: {JSON.stringify(frame.variables)}.</p>;
  }
  if (selected === 'regression') return <p>Six fixed observations with a fitted straight line and a vertical residual for each point.</p>;
  if (selected === 'pipeline') return <p>Source, Bronze, Silver, Gold, semantic model and BI are linked by labeled data edges. An orchestrator has a separate control edge; invalid rows have a marked failure route.</p>;
  const spec: LineageSpec = selected === 'model' ? salesModelLineage : columnLineageFixture;
  return <ul>{spec.relations.map((relation) => <li key={relation.id}>{relation.sources.map((source) => `${source.assetId}.${source.columnId ?? '*'}`).join(' + ')} → {relation.target.assetId}.{relation.target.columnId ?? '*'}</li>)}</ul>;
}

function LoopCode({ frameIndex }: { frameIndex: number }) {
  const active = new Set(loopLessonFrames[frameIndex].frame.codeLineIds);
  return <pre className="synced-code" aria-label="Synchronized Python code">{loopScene.codeLines.map((line, index) => <code key={line.id} className={active.has(line.id) ? 'is-active' : ''}><span>{index + 1}</span>{line.text}</code>)}</pre>;
}

function LineageExpression({ spec, index }: { spec: typeof columnLineageFixture; index: number }) {
  const relation = spec.relations[index];
  const label = typeof relation.label === 'string' ? relation.label : relation.label?.en ?? relation.label?.no ?? relation.id;
  return <div className="expression-card"><b>{label}</b><code>{relation.expression}</code><span>fixture.sql · line {relation.sourceSpan?.start.line}</span></div>;
}
