import { useMemo, useState } from 'react';
import { Button, Field, Select, Switch } from '@fluentui/react-components';
import { JsonSpecEditor } from '@datapass/code';
import { FigurePlayer } from '@datapass/figure';
import { serializeDeterministic, type FigureSpec } from '@datapass/content';
import { PageHeader, useLocale } from '@datapass/ui';
import { migratedVisuals } from '../../../../content/visuals';
import { parseSandboxFigure } from '../data/visualSandbox';
import { ErrorBoundary } from '../components/ErrorBoundary';
import './VisualSandboxPage.css';

const fallback:FigureSpec={id:'sandbox-unsupported',kind:'chart',rendererId:'future.chart',title:'Unsupported adapter example',spec:{},fallbackText:'This is the accessible textual fallback for an unregistered future renderer.'};
const examples=[...migratedVisuals.map(entry=>entry.figure),fallback];
export function VisualSandboxPage(){
  const {locale,setLocale}=useLocale();
  const [exampleId,setExampleId]=useState(examples[0].id);
  const initial=serializeDeterministic(examples[0],2);
  const [source,setSource]=useState(initial);
  const [figure,setFigure]=useState(examples[0]);
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [width,setWidth]=useState('100%');
  const [message,setMessage]=useState('Ready to preview.');
  const result=useMemo(()=>parseSandboxFigure(source),[source]);
  const choose=(id:string)=>{const next=examples.find(item=>item.id===id)!;setExampleId(id);setSource(serializeDeterministic(next,2));setFigure(next);setMessage('Example loaded.');};
  return <div data-testid="visual-sandbox-page">
    <PageHeader title="Visual Sandbox" eyebrow="SEMANTIC SPECS" description="Edit a Figure contract and inspect the production renderer."/>
    <div className="visual-sandbox-toolbar">
      <Field label="Example"><Select aria-label="Figure example" value={exampleId} onChange={event=>choose(event.target.value)}>{examples.map(example=><option value={example.id} key={example.id}>{typeof example.title==='string'?example.title:example.title.en}</option>)}</Select></Field>
      <Field label="Preview width"><Select aria-label="Preview width" value={width} onChange={event=>setWidth(event.target.value)}><option value="100%">Available width</option><option value="390px">Phone · 390px</option><option value="900px">Desktop · 900px</option></Select></Field>
      <Field label="Locale"><Select aria-label="Preview locale" value={locale} onChange={event=>setLocale(event.target.value==='no'?'no':'en')}><option value="en">English</option><option value="no">Norsk</option></Select></Field>
      <Switch label="Reduced motion" checked={reduced} onChange={(_,data)=>setReduced(data.checked)}/>
    </div>
    <div className="visual-sandbox-grid">
      <section className="visual-sandbox-editor" aria-label="Figure JSON authoring">
        <JsonSpecEditor ariaLabel="Figure JSON spec" value={source} onChange={setSource} height="34rem" path="datapass://visual-sandbox/spec.json"/>
        <div className="visual-sandbox-actions">
          <Button appearance="primary" disabled={!result.figure} onClick={()=>{setFigure(result.figure!);setMessage('Valid Figure applied.');}}>Apply valid spec</Button>
          <Button onClick={()=>choose(exampleId)}>Reset example</Button>
          <Button onClick={()=>{const blob=new Blob([source],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='figure-spec.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Download JSON</Button>
        </div>
        <div role={result.issues.length?'alert':'status'} data-testid="sandbox-validation">{result.issues.length?<><strong>Spec not applied</strong><ul>{result.issues.map(issue=><li key={issue}>{issue}</li>)}</ul><p>The last valid preview is retained.</p></>:message}</div>
      </section>
      <section className="visual-sandbox-preview" aria-label="Production Figure preview">
        <div style={{width,maxWidth:'100%'}} data-testid="sandbox-preview-width">
          <ErrorBoundary key={serializeDeterministic(figure)}><FigurePlayer key={figure.id} figure={figure} locale={locale} reducedMotion={reduced}/></ErrorBoundary>
        </div>
      </section>
    </div>
  </div>;
}
