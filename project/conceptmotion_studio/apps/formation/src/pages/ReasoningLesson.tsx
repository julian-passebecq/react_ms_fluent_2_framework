import { FigurePlayer } from '@datapass/figure';
import { AssessmentRunner } from '@datapass/learning';
import { appendAssessmentAttempt, type ProgressStateV2 } from '@datapass/progress';
import { useLocale } from '@datapass/ui';
import { visualById } from '../../../../content/visuals';
import { reasoningModules, reasoningSources } from '../data/reasoning';

export function ReasoningLesson({ lessonId, progress, updateProgress }: {lessonId:string;progress:ProgressStateV2;updateProgress:(operation:(state:ProgressStateV2)=>ProgressStateV2)=>void}) {
  const module = reasoningModules.find(item=>item.lesson.id===lessonId);
  const { locale } = useLocale();
  if (!module) return null;
  return <div className="formation-reasoning" data-testid="formation-reasoning">
    <nav className="formation-reasoning-index" aria-label="Thinking module sections">
      {module.sections.map(section=><a key={section.id} href={`#section-${section.id}`} onClick={event=>{event.preventDefault();document.getElementById(`section-${section.id}`)?.scrollIntoView({behavior:'auto'});}}>{section.title}</a>)}
    </nav>
    {module.sections.map(section=>{
      const visual=section.visualId ? visualById(section.visualId) : undefined;
      return <section className="formation-reasoning-section" id={`section-${section.id}`} key={section.id}>
        <h2>{section.title}</h2><p>{section.text}</p>
        {visual ? <FigurePlayer figure={visual.figure} captions={visual.captions} locale={locale}/> : null}
        <p className="formation-checkpoint"><strong>Checkpoint</strong> {section.checkpoint}</p>
      </section>;
    })}
    <AssessmentRunner assessment={module.assessment} questions={module.questions} locale={locale}
      attemptId={`${module.assessment.id}:attempt:${(progress.assessments[module.assessment.id]?.attempts.length??0)+1}`}
      onSubmit={submission=>updateProgress(current=>appendAssessmentAttempt(current,module.assessment.id,submission.attempt))}/>
    <footer className="formation-sources"><h2>Sources and scope</h2><p>Original reasoning lessons. Reference behavior checked 4 September 2026; dialect-specific syntax is identified explicitly.</p>
      <ul>{reasoningSources.filter(source=>module.lesson.sourceIds?.includes(source.id)).map(source=><li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{String(source.title)}</a></li>)}</ul>
    </footer>
  </div>;
}
