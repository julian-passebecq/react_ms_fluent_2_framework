import { useEffect, useState } from 'react';
import { useReducedMotion } from '@conceptmotion/react';
import { AssessmentRunner, ChallengeWorkbench, type usePracticeWorkspace } from '@datapass/learning';
import { appendAssessmentAttempt, updateChallengeProgress } from '@datapass/progress';
import { Button, Field, Textarea } from '@fluentui/react-components';
import { useLocale } from '@datapass/ui';
import { buildInterviewSession } from '../data/sessions';
import type { InterviewMode } from '../data/domains';
import { practiceItemById } from '../../../../content/practice';
import { migratedFigures, figureForPracticeId, visualById } from '../../../../content/visuals';
import { interviewReasoningKey, interviewReviewGuidance } from '../data/review-guidance';

export default function SessionPage({ mode, domain, workspace, onBack }: { mode: InterviewMode; domain: string; workspace: ReturnType<typeof usePracticeWorkspace>; onBack: () => void }) {
  const [session] = useState(() => buildInterviewSession(mode, domain, workspace.state.progress));
  const [remaining, setRemaining] = useState(session.assessment.durationSeconds ?? 0);
  const [running, setRunning] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { locale } = useLocale();
  const reducedMotion = useReducedMotion();
  const [attemptId] = useState(() => `${session.assessment.id}:attempt:${Date.now()}`);
  const [startedAt] = useState(() => new Date().toISOString());
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const reasoningKey = interviewReasoningKey(session.assessment.id);
  const guidance = interviewReviewGuidance(session.questions.map(question => question.domain ?? ''));
  useEffect(() => { if (!running || submitted || remaining <= 0) return; const timer = window.setInterval(() => setRemaining(current => Math.max(0, current - 1)), 1000); return () => window.clearInterval(timer); }, [running, submitted, remaining]);
  const item = practiceItemById(session.practiceId)!;
  const discussionFigure = figureForPracticeId(item.id);
  if (!session.questions.length) return <><h1>No mistakes or flags to review yet</h1><p>Complete a session or flag a question. Only real local results enter this queue.</p><Button onClick={onBack}>Back to sessions</Button></>;
  return <><div className="interview-session-tools"><Button onClick={onBack}>Back to sessions</Button>{session.assessment.durationSeconds && <><span role="timer" aria-label="Advisory time remaining">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</span><Button disabled={submitted} onClick={() => setRunning(value => !value)}>{running ? 'Pause timer' : 'Resume timer'}</Button></>}<span>{Object.keys(answers).length} / {session.questions.length} answered</span></div>
    {session.assessment.durationSeconds && remaining === 0 && <p role="status">Time target reached. Finish and submit when ready; no answer is discarded.</p>}
    <section className="interview-reasoning" aria-labelledby="interview-reasoning-title">
      <div className="interview-reasoning-copy">
        <p className="dp-learning-eyebrow">1 · FRAME YOUR APPROACH</p>
        <h1 id="interview-reasoning-title">Explain the reasoning behind your answer.</h1>
        <p>State the goal, the assumptions, and one trade-off you would discuss with a teammate. Then work through the questions below.</p>
      </div>
      <Field label="Your interview reasoning" hint="Personal rehearsal notes, saved on this device. These notes are not graded.">
        <Textarea rows={4} resize="vertical" readOnly={submitted} value={workspace.state.notes[reasoningKey] ?? ''} onChange={(_, data) => workspace.setNote(reasoningKey, data.value)} />
      </Field>
    </section>
    <div className="interview-answer-stage"><p className="dp-learning-eyebrow">2 · ANSWER & EXPLAIN</p>
      <AssessmentRunner headingLevel={2} assessment={session.assessment} questions={session.questions} figures={migratedFigures} reducedMotion={reducedMotion} locale={locale} attemptId={attemptId} onAnswerChange={(id, value) => setAnswers(current => ({ ...current, [id]: value }))} onSubmit={submission => { setSubmitted(true); const attempt = { ...submission.attempt, startedAt, submittedAt: new Date().toISOString() }; workspace.updateProgress(current => appendAssessmentAttempt(current, session.assessment.id, attempt)); }} />
    </div>
    {submitted && <section className="interview-reasoning-review" aria-labelledby="interview-reasoning-review-title">
      <p className="dp-learning-eyebrow">3 · REVIEW YOUR REASONING</p>
      <h2 id="interview-reasoning-review-title">What makes the explanation strong?</h2>
      <p>Compare these discussion points with your notes. Only the selected and ordered answers above contribute to the score.</p>
      {guidance.map(domain => <article key={domain.id} className="interview-domain-review">
        <h3>{domain.title}</h3><div className="interview-review-columns">
          <div><h4>Strong-answer points</h4><ul>{domain.strongAnswer.map(point => <li key={point}>{point}</li>)}</ul><p className="interview-reasoning-sequence">{domain.steps.join(' → ')}</p></div>
          <div><h4>Trade-offs to discuss</h4><ul>{domain.tradeOffs.map(point => <li key={point}>{point}</li>)}</ul></div>
        </div>
      </article>)}
    </section>}
    <section className="interview-review"><h2>Flag questions for review</h2><div className="interview-flags">{session.questions.map((question, index) => <Button key={question.id} aria-pressed={workspace.state.progress.challenges[question.id]?.flagged ?? false} onClick={() => workspace.updateProgress(current => updateChallengeProgress(current, question.id, { flagged: !current.challenges[question.id]?.flagged }))}>Flag question {index + 1}</Button>)}</div></section>
    <section className="interview-coding"><h2>Optional coding discussion</h2><p>Explain your approach out loud, then draft it. This workspace is ungraded and separate from the selected-answer score.</p><Button onClick={() => setShowCode(current => !current)}>{showCode ? 'Close coding discussion' : 'Open coding discussion'}</Button>{showCode && <ChallengeWorkbench key={item.id} challenge={item} figure={discussionFigure} figureCaptions={discussionFigure ? visualById(discussionFigure.id)?.captions : undefined} progress={workspace.state.progress} onProgressChange={workspace.updateProgress} notes={workspace.state.notes[item.id]} onNotesChange={value => workspace.setNote(item.id, value)} locale={locale} reducedMotion={reducedMotion} />}</section>
  </>;
}
