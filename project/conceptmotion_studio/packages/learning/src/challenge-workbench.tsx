import { useId, useState } from 'react';
import type { ChallengeDefinition, FigureSpec, PracticeItem } from '@datapass/content';
import { CodeDiff, CodeEditor } from '@datapass/code';
import { FigureView, figureStepCount } from '@datapass/figure';
import { ChallengeShell } from '@datapass/ui';
import { setChallengeDraft, updateChallengeProgress, type ProgressStateV2 } from '@datapass/progress';
import { Badge, Button, Field, Select, Tab, TabList, Textarea } from '@fluentui/react-components';

export interface ChallengeWorkbenchProps {
  challenge: ChallengeDefinition;
  progress: ProgressStateV2;
  onProgressChange: (change: (state: ProgressStateV2) => ProgressStateV2) => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  figure?: FigureSpec;
  reducedMotion?: boolean;
  locale?: string;
}
/** Shared practice/application composition. Code strings are displayed and compared, never executed. */
export function ChallengeWorkbench({ challenge, progress, onProgressChange, notes = '', onNotesChange, figure, reducedMotion = false, locale = 'en' }: ChallengeWorkbenchProps) {
  const id = useId();
  const [left, setLeft] = useState('description');
  const [right, setRight] = useState('code');
  const [variantId, setVariantId] = useState(challenge.variants[0].id);
  const [hints, setHints] = useState(0);
  const [frame, setFrame] = useState(0);
  const variant = challenge.variants.find(v => v.id === variantId) ?? challenge.variants[0];
  const status = progress.challenges[challenge.id];
  const draft = status?.drafts[variant.id] ?? variant.starter;
  const item = challenge as Partial<PracticeItem>;
  const activeFigure = figure ?? challenge.figure;
  const frameCount = activeFigure ? figureStepCount(activeFigure) : 1;
  const currentFrame = Math.min(frame, frameCount - 1);
  return <ChallengeShell className="dp-practice-workbench" data-testid="challenge-workbench"
    header={<header><h1>{challenge.title}</h1><div className="dp-practice-badges"><Badge appearance="outline">{challenge.domain}</Badge><Badge appearance="outline">{challenge.difficulty}</Badge><Badge appearance="outline">Reference only · no execution</Badge></div></header>}
    leftPaneId={`${id}-information`} rightPaneId={`${id}-code`} leftPaneLabel={`${left} challenge panel`} rightPaneLabel={`${right} editor panel`}
    leftTabs={<TabList selectedValue={left} onTabSelect={(_, data) => setLeft(String(data.value))} aria-label="Challenge information">
      {['description', 'visualize', 'hints', 'notes'].map(tab => <Tab key={tab} value={tab} aria-controls={`${id}-information`}>{tab[0].toUpperCase() + tab.slice(1)}</Tab>)}
    </TabList>}
    leftPane={<div className="dp-practice-copy">
      {left === 'description' && <article><h2>Problem</h2><p>{challenge.summary}</p>{item.concept && <><h3>Mental model</h3><p>{item.concept}</p></>}{challenge.schema && <><h3>Input shape / context</h3><p>{challenge.schema}</p></>}{challenge.input && <pre>{challenge.input}</pre>}{item.why && <><h3>Why it matters</h3><p>{item.why}</p></>}{item.pitfall && <aside><h3>Watch for</h3><p>{item.pitfall}</p></aside>}{item.source && <footer><h3>Source</h3><p>{item.source.repository} · {item.source.itemId}</p>{item.source.sourcePack && <p>{item.source.sourcePack}</p>}<small>Imported from revision {item.source.revision.slice(0, 12)}. Source metadata and attribution are preserved in the corpus.</small></footer>}</article>}
      {left === 'visualize' && (activeFigure ? <><p>Illustrative semantic figure. Its sample data may differ from this challenge; it is not an execution result.</p><FigureView figure={activeFigure} reducedMotion={reducedMotion} locale={locale} frameIndex={currentFrame} /><div className="dp-practice-actions"><Button disabled={currentFrame === 0} onClick={() => setFrame(Math.max(0, currentFrame - 1))}>Previous visual step</Button><Button disabled={currentFrame >= frameCount - 1} onClick={() => setFrame(Math.min(frameCount - 1, currentFrame + 1))}>Next visual step</Button><Button onClick={() => setFrame(0)}>Reset visual</Button></div></> : <><h2>Reason through the transformation</h2><p>{item.concept ?? challenge.summary}</p><p>No semantic figure is attached to this item. Use the input grain and expected transformation as your visual model; there is no fabricated execution output.</p></>)}
      {left === 'hints' && <><h2>Progressive hints</h2><ol>{challenge.hints.slice(0, hints).map((hint, index) => <li key={index}>{hint}</li>)}</ol><Button disabled={hints >= challenge.hints.length} onClick={() => setHints(current => current + 1)}>Reveal next hint</Button><p>{hints} / {challenge.hints.length} revealed</p></>}
      {left === 'notes' && <Field label="Your reasoning notes"><Textarea value={notes} onChange={(_, data) => onNotesChange?.(data.value)} resize="vertical" rows={10} /></Field>}
    </div>}
    rightTabs={<div className="dp-practice-editor-toolbar"><TabList selectedValue={right} onTabSelect={(_, data) => setRight(String(data.value))} aria-label="Code view">{['code', 'solution', 'compare'].map(tab => <Tab key={tab} value={tab} aria-controls={`${id}-code`}>{tab[0].toUpperCase() + tab.slice(1)}</Tab>)}</TabList><Field label="Language / engine"><Select aria-label="Language / engine" value={variant.id} onChange={event => setVariantId(event.target.value)}>{challenge.variants.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</Select></Field></div>}
    rightPane={<div className="dp-practice-editor">{variant.language === 'pyspark' && <p role="note">PySpark: display, explanation and external practice only. No Spark session or Jupyter kernel.</p>}{variant.note && <p>{variant.note}</p>}
      {right === 'compare' ? <CodeDiff ariaLabel="Reference solution and draft comparison" language={variant.monacoLanguage} original={variant.solution} modified={draft} height="26rem" readOnly /> : <CodeEditor ariaLabel={right === 'code' ? 'Practice code editor' : 'Reference solution'} language={variant.monacoLanguage} value={right === 'code' ? draft : variant.solution} height="26rem" readOnly={right !== 'code'} path={`practice/${challenge.id}/${variant.id}/${right}`} onChange={value => onProgressChange(current => setChallengeDraft(current, challenge.id, variant.id, value))} />}
      {right !== 'code' && variant.explanation && <section><h2>Reference explanation</h2><p>{variant.explanation}</p></section>}
    </div>}
    bottomPanel={<div className="dp-practice-actions" aria-label="Local challenge progress">{(['mastered', 'review', 'flagged'] as const).map(key => <Button key={key} aria-pressed={status?.[key] ?? false} onClick={() => onProgressChange(current => updateChallengeProgress(current, challenge.id, { [key]: !current.challenges[challenge.id]?.[key] }))}>{key === 'mastered' ? 'Mastered' : key === 'review' ? 'Review later' : 'Flag'}</Button>)}<small>Drafts and self-assessed progress stay on this device. Comparison is not grading.</small></div>}
  />;
}
