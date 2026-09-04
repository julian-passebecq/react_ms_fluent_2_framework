import './styles.css';
export { ChallengeWorkbench } from './challenge-workbench';
export type { ChallengeWorkbenchProps } from './challenge-workbench';
export { parsePracticeWorkspace, serializePracticeWorkspace, usePracticeWorkspace } from './practice-state';
export type { PracticeWorkspaceState } from './practice-state';

export {
  AssessmentRunner,
  evaluateQuestion,
  gradeAssessment,
} from './assessment';
export type {
  AssessmentRunnerProps,
  AssessmentSubmission,
  QuestionEvaluation,
} from './assessment';

export { GuidedExercise } from './exercise';
export type { GuidedExerciseProps, GuidedExerciseStep } from './exercise';

export {
  NotebookCellView as NotebookCell,
  NotebookCellView,
  NotebookLesson,
  isSafeNotebookMediaSource,
  parseSafeMarkdown,
} from './notebook';
export type { NotebookCellViewProps, NotebookLessonProps } from './notebook';

export { ProgressSummary, summarizeProgress } from './progress';
export type {
  ProgressSummaryProps,
  ProgressSummaryScope,
  ProgressSummarySnapshot,
} from './progress';

export { RuntimeLauncher, validateRuntimeTarget } from './runtime';
export type {
  RuntimeLauncherProps,
  RuntimeTargetValidation,
} from './runtime';

export { resolveLearningText, resolveOptionalLearningText } from './localization';
export type { LearningLocale } from './localization';
