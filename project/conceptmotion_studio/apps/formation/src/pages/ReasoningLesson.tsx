import { FigurePlayer } from '@datapass/figure';
import { AssessmentRunner } from '@datapass/learning';
import { appendAssessmentAttempt, type ProgressStateV2 } from '@datapass/progress';
import { ContentDetails, useLocale } from '@datapass/ui';
import { Button, Select } from '@fluentui/react-components';
import { useRef } from 'react';
import { visualById } from '../../../../content/visuals';
import { reasoningModules, reasoningSources } from '../data/reasoning';

export function ReasoningLesson({ lessonId, progress, updateProgress }: {lessonId:string;progress:ProgressStateV2;updateProgress:(operation:(state:ProgressStateV2)=>ProgressStateV2)=>void}) {
  const module = reasoningModules.find(item=>item.lesson.id===lessonId);
  const { locale } = useLocale();
  const sectionPicker = useRef<HTMLSelectElement>(null);
  if (!module) return null;
  const jumpTo = (id: string) => {
    const target = document.getElementById(id);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: 'auto', block: 'start' });
  };
  const backToSections = <Button appearance="subtle" onClick={() => {
    sectionPicker.current?.focus({ preventScroll: true });
    sectionPicker.current?.closest('nav')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }}>{locale === 'no' ? 'Til seksjonsvalg' : 'Back to sections'}</Button>;
  return <div className="formation-reasoning" data-testid="formation-reasoning">
    <nav className="formation-reasoning-index" aria-label="Thinking module sections">
      <label htmlFor="formation-section-picker">{locale === 'no' ? 'Hopp til seksjon' : 'Jump to section'}</label>
      <Select id="formation-section-picker" key={lessonId} ref={sectionPicker} defaultValue={`section-${module.sections[0].id}`}>
        {module.sections.map(section => <option key={section.id} value={`section-${section.id}`}>{section.title}</option>)}
        <option value="formation-reasoning-assessment">{locale === 'no' ? 'Øving' : 'Practice'} · {String(module.assessment.title)}</option>
      </Select>
      <Button appearance="secondary" onClick={() => sectionPicker.current && jumpTo(sectionPicker.current.value)}>{locale === 'no' ? 'Hopp' : 'Jump'}</Button>
    </nav>
    {module.sections.map(section=>{
      const visual=section.visualId ? visualById(section.visualId) : undefined;
      return <section className="formation-reasoning-section" id={`section-${section.id}`} key={section.id} tabIndex={-1} aria-labelledby={`section-${section.id}-title`}>
        <h2 id={`section-${section.id}-title`}>{section.title}</h2><p>{section.text}</p>
        {visual ? <FigurePlayer figure={visual.figure} captions={visual.captions} locale={locale} presentationSize={visual.figure.rendererId === 'table.join' ? 'regular' : 'compact'} showInspector={false}/> : null}
        <p className="formation-checkpoint"><strong>Checkpoint</strong> {section.checkpoint}</p>
        {backToSections}
      </section>;
    })}
    <section id="formation-reasoning-assessment" className="formation-reasoning-assessment" tabIndex={-1} aria-label={String(module.assessment.title)}>
      <AssessmentRunner headingLevel={2} assessment={module.assessment} questions={module.questions} locale={locale}
      attemptId={`${module.assessment.id}:attempt:${(progress.assessments[module.assessment.id]?.attempts.length??0)+1}`}
      onSubmit={submission=>updateProgress(current=>appendAssessmentAttempt(current,module.assessment.id,submission.attempt))}/>
      {backToSections}
    </section>
    <ContentDetails className="formation-sources" summary="Sources and scope"><p>Original reasoning lessons. Reference behavior checked 4 September 2026; dialect-specific syntax is identified explicitly.</p>
      <ul>{reasoningSources.filter(source=>module.lesson.sourceIds?.includes(source.id)).map(source=><li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{String(source.title)}</a></li>)}</ul>
    </ContentDetails>
  </div>;
}
