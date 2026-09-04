import { useEffect, useState } from 'react';
import { AssessmentRunner, ChallengeWorkbench, type usePracticeWorkspace } from '@datapass/learning';
import { appendAssessmentAttempt, updateChallengeProgress } from '@datapass/progress';
import { Button } from '@fluentui/react-components';
import { useLocale } from '@datapass/ui';
import { buildInterviewSession } from '../data/sessions';
import type { InterviewMode } from '../data/domains';
import { practiceItemById } from '../../../../content/practice';
import { migratedFigures, figureForPracticeId } from '../../../../content/visuals';

export default function SessionPage({ mode, domain, workspace, onBack }: { mode: InterviewMode; domain: string; workspace: ReturnType<typeof usePracticeWorkspace>; onBack: () => void }) {
  const [session] = useState(() => buildInterviewSession(mode, domain, workspace.state.progress));
  const [remaining, setRemaining] = useState(session.assessment.durationSeconds ?? 0);
  const [running, setRunning] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { locale } = useLocale();
  const [attemptId] = useState(() => `${session.assessment.id}:attempt:${Date.now()}`);
  const [startedAt] = useState(() => new Date().toISOString());
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  useEffect(() => { if (!running || submitted || remaining <= 0) return; const timer = window.setInterval(() => setRemaining(current => Math.max(0, current - 1)), 1000); return () => window.clearInterval(timer); }, [running, submitted, remaining]);
  const item = practiceItemById(session.practiceId)!;
  if (!session.questions.length) return <><h1>No mistakes or flags to review yet</h1><p>Complete a session or flag a question. Only real local results enter this queue.</p><Button onClick={onBack}>Back to sessions</Button></>;
  return <><div className="interview-session-tools"><Button onClick={onBack}>Back to sessions</Button>{session.assessment.durationSeconds && <><span role="timer" aria-label="Advisory time remaining">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</span><Button disabled={submitted} onClick={() => setRunning(value => !value)}>{running ? 'Pause timer' : 'Resume timer'}</Button></>}<span>{Object.keys(answers).length} / {session.questions.length} answered</span></div>
    {session.assessment.durationSeconds && remaining === 0 && <p role="status">Time target reached. Finish and submit when ready; no answer is discarded.</p>}
    <AssessmentRunner assessment={session.assessment} questions={session.questions} figures={migratedFigures} reducedMotion={window.matchMedia('(prefers-reduced-motion: reduce)').matches} locale={locale} attemptId={attemptId} onAnswerChange={(id, value) => setAnswers(current => ({ ...current, [id]: value }))} onSubmit={submission => { setSubmitted(true); const attempt = { ...submission.attempt, startedAt, submittedAt: new Date().toISOString() }; workspace.updateProgress(current => appendAssessmentAttempt(current, session.assessment.id, attempt)); }} />
    <section className="interview-review"><h2>Flag questions for review</h2><div className="interview-flags">{session.questions.map((question, index) => <Button key={question.id} aria-pressed={workspace.state.progress.challenges[question.id]?.flagged ?? false} onClick={() => workspace.updateProgress(current => updateChallengeProgress(current, question.id, { flagged: !current.challenges[question.id]?.flagged }))}>Flag question {index + 1}</Button>)}</div></section>
    <section className="interview-coding"><h2>Optional coding discussion</h2><p>Explain your approach out loud, then draft it. This workspace is ungraded and separate from the selected-answer score.</p><Button onClick={() => setShowCode(current => !current)}>{showCode ? 'Close coding discussion' : 'Open coding discussion'}</Button>{showCode && <ChallengeWorkbench key={item.id} challenge={item} figure={figureForPracticeId(item.id)} progress={workspace.state.progress} onProgressChange={workspace.updateProgress} notes={workspace.state.notes[item.id]} onNotesChange={value => workspace.setNote(item.id, value)} locale={locale} />}</section>
  </>;
}
