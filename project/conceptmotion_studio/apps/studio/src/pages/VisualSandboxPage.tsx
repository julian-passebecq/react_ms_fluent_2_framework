import { useMemo, useState } from 'react';
import { Button, Field, Select, Switch } from '@fluentui/react-components';
import { JsonSpecEditor } from '@datapass/code';
import { FigurePlayer, type FigurePresentationSize } from '@datapass/figure';
import { serializeDeterministic, type FigureSpec } from '@datapass/content';
import { ContentDetails, PageHeader, useLocale } from '@datapass/ui';
import { migratedVisuals } from '../../../../content/visuals';
import figureSchema from '../../../../schemas/authoring/figure.schema.json';
import { parseSandboxFigure } from '../data/visualSandbox';
import { tableTraceSandboxExamples } from '../data/tableTraceExample';
import { ErrorBoundary } from '../components/ErrorBoundary';
import './VisualSandboxPage.css';

const fallback: FigureSpec = {
  id: 'sandbox-unsupported', kind: 'chart', rendererId: 'future.chart',
  title: 'Unsupported adapter example', spec: {},
  fallbackText: 'This is the accessible textual fallback for an unregistered future renderer.',
};
const examples = [...migratedVisuals.map(entry => entry.figure), ...tableTraceSandboxExamples, fallback];
const schemaHook = { uri: 'urn:datapass:schema:figure:1', schema: figureSchema, fileMatch: ['datapass://visual-sandbox/spec.figure.json'] };

export function VisualSandboxPage() {
  const { locale, setLocale } = useLocale();
  const [exampleId, setExampleId] = useState(examples[0].id);
  const initial = serializeDeterministic(examples[0], 2);
  const [source, setSource] = useState(initial);
  const [appliedSource, setAppliedSource] = useState(initial);
  const [figure, setFigure] = useState(examples[0]);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [width, setWidth] = useState('100%');
  const [size, setSize] = useState<FigurePresentationSize>('regular');
  const [developer, setDeveloper] = useState(false);
  const [message, setMessage] = useState('Example applied. The preview matches the editor.');
  const result = useMemo(() => parseSandboxFigure(source), [source]);
  const dirty = source !== appliedSource;
  const state = result.issues.length ? 'invalid' : dirty ? 'valid-pending' : 'applied';

  const choose = (id: string) => {
    const next = examples.find(item => item.id === id)!;
    const serialized = serializeDeterministic(next, 2);
    setExampleId(id); setSource(serialized); setAppliedSource(serialized); setFigure(next);
    setMessage('Example applied. The preview matches the editor.');
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([source], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${exampleId}.figure.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="dp-consumer visual-sandbox-page" data-testid="visual-sandbox-page">
    <PageHeader title="Visual Sandbox" eyebrow="FIGURE AUTHORING" description="Choose an existing scene, edit its spec, then apply valid changes to the preview." />
    <div className="visual-sandbox-toolbar">
      <Field label="Example"><Select aria-label="Figure example" value={exampleId} onChange={event => choose(event.target.value)}>{examples.map(example => <option value={example.id} key={example.id}>{typeof example.title === 'string' ? example.title : example.title.en}</option>)}</Select></Field>
      <Field label="Presentation"><Select aria-label="Figure presentation" value={size} onChange={event => setSize(event.target.value as FigurePresentationSize)}><option value="compact">Compact · lesson or card</option><option value="regular">Regular · explanation</option><option value="expanded">Expanded · workbench</option></Select></Field>
      <Field label="Preview width"><Select aria-label="Preview width" value={width} onChange={event => setWidth(event.target.value)}><option value="100%">Available width</option><option value="390px">Phone · 390px</option><option value="900px">Desktop · 900px</option></Select></Field>
      <Field label="Locale"><Select aria-label="Preview locale" value={locale} onChange={event => setLocale(event.target.value === 'no' ? 'no' : 'en')}><option value="en">English</option><option value="no">Norsk</option></Select></Field>
      <Switch label="Reduced motion" checked={reduced} onChange={(_, data) => setReduced(data.checked)} />
      <Switch label="Developer details" checked={developer} onChange={(_, data) => setDeveloper(data.checked)} />
    </div>
    <div className="visual-sandbox-grid">
      <section className="visual-sandbox-editor" aria-label="Figure JSON authoring">
        <h2>1. Edit the spec</h2>
        <p className="visual-sandbox-help">Presentation size changes the preview, not your content. Specs are edited locally; code is never executed.</p>
        <JsonSpecEditor ariaLabel="Figure JSON spec" value={source} onChange={setSource} height="30rem" path="datapass://visual-sandbox/spec.figure.json" schema={schemaHook} />
        <div className="visual-sandbox-actions">
          <Button appearance="primary" disabled={!result.figure} onClick={() => { setFigure(result.figure!); setAppliedSource(source); setMessage('Valid Figure applied. The preview matches the editor.'); }}>Apply valid spec</Button>
          <Button onClick={() => choose(exampleId)}>Reset example</Button>
          <Button onClick={download}>Download JSON</Button>
        </div>
        <div className={`visual-sandbox-validation is-${state}`} role={result.issues.length ? 'alert' : 'status'} data-testid="sandbox-validation" data-authoring-state={state}>
          {result.issues.length ? <><strong>Spec not applied</strong><ul>{result.issues.map(issue => <li key={issue}>{issue}</li>)}</ul><p>The last valid preview is retained.</p></> : dirty ? <><strong>Valid changes ready to apply</strong><p>The preview still shows the last applied spec.</p></> : message}
        </div>
        <ContentDetails summary="Authoring help">
          <p>Editor suggestions check the Figure envelope locally. Apply also checks renderer semantics and bounded input; runtime validation remains authoritative.</p>
          <p><a href="https://github.com/julian-passebecq/react_ms_fluent_2_framework/blob/main/project/conceptmotion_studio/docs/AUTHORING_DX.md" target="_blank" rel="noreferrer">Authoring documentation</a> · <a href="http://localhost:6006/?path=/story/v4-approved-compositions--compact-figure" target="_blank" rel="noreferrer">Storybook examples (local server)</a></p>
          <p>Start the repository’s Storybook task to open the Golden Gallery. JSON download includes the editor draft, even when it is not yet valid. SVG export captures only the applied semantic step; transient motion travelers are omitted.</p>
        </ContentDetails>
      </section>
      <section className="visual-sandbox-preview" aria-label="Production Figure preview">
        <h2>2. Preview the applied spec</h2>
        <p className="visual-sandbox-help">{dirty ? 'Unapplied edits · preview preserved' : 'In sync with the editor'}</p>
        <div style={{ width, maxWidth: '100%' }} data-testid="sandbox-preview-width">
          <ErrorBoundary key={serializeDeterministic(figure)}><FigurePlayer key={figure.id} figure={figure} locale={locale} reducedMotion={reduced} presentationSize={size} metadataMode={developer ? 'developer' : 'consumer'} /></ErrorBoundary>
        </div>
      </section>
    </div>
  </div>;
}
