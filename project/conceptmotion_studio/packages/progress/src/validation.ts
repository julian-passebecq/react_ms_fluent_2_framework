import {
  PROGRESS_SCHEMA_VERSION,
  type AssessmentAnswer,
  type AssessmentAnswerValue,
  type AssessmentAttempt,
  type AssessmentProgress,
  type AssessmentScore,
  type ChallengeProgress,
  type LessonPosition,
  type LessonProgress,
  type ProgressStateV2
} from './types';

export type ProgressValidationSeverity = 'error' | 'warning';

export interface ProgressValidationIssue {
  readonly code: string;
  readonly path: string;
  readonly message: string;
  readonly severity: ProgressValidationSeverity;
}

export interface ProgressValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ProgressValidationIssue[];
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function error(code: string, path: string, message: string): ProgressValidationIssue {
  return { code, path, message, severity: 'error' };
}

function warning(code: string, path: string, message: string): ProgressValidationIssue {
  return { code, path, message, severity: 'warning' };
}

function result(issues: readonly ProgressValidationIssue[]): ProgressValidationResult {
  const stable = [...issues].sort((left, right) =>
    compareText(left.path, right.path) || compareText(left.code, right.code) || compareText(left.message, right.message)
  );
  return { valid: !stable.some((issue) => issue.severity === 'error'), issues: stable };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function optionalDate(value: unknown): boolean {
  return value === undefined || (typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value)));
}

function stringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every(nonEmptyString);
}

function validateAnswerValue(value: unknown): value is AssessmentAnswerValue {
  if (typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(nonEmptyString);
  return isRecord(value) && Object.entries(value).every(([key, item]) => nonEmptyString(key) && typeof item === 'string');
}

function validatePosition(value: unknown, path: string, issues: ProgressValidationIssue[]): value is LessonPosition {
  if (!isRecord(value)) {
    issues.push(error('progress.lesson.position.object', path, 'Recent lesson position must be an object.'));
    return false;
  }
  if (value.sectionId !== undefined && !nonEmptyString(value.sectionId)) issues.push(error('progress.lesson.position.section', `${path}.sectionId`, 'sectionId must be a non-empty string.'));
  if (value.cellId !== undefined && !nonEmptyString(value.cellId)) issues.push(error('progress.lesson.position.cell', `${path}.cellId`, 'cellId must be a non-empty string.'));
  if (value.step !== undefined && (!Number.isInteger(value.step) || (value.step as number) < 0)) issues.push(error('progress.lesson.position.step', `${path}.step`, 'step must be a non-negative integer.'));
  if (value.offset !== undefined && (typeof value.offset !== 'number' || !Number.isFinite(value.offset) || value.offset < 0)) issues.push(error('progress.lesson.position.offset', `${path}.offset`, 'offset must be a non-negative finite number.'));
  return true;
}

function validateChallenge(value: unknown, key: string, path: string, issues: ProgressValidationIssue[]): value is ChallengeProgress {
  if (!isRecord(value)) {
    issues.push(error('progress.challenge.object', path, 'Challenge progress must be an object.'));
    return false;
  }
  if (!nonEmptyString(value.id)) issues.push(error('progress.challenge.id', `${path}.id`, 'Challenge id is required.'));
  else if (value.id !== key) issues.push(error('progress.challenge.id.mismatch', `${path}.id`, `Challenge id must match record key "${key}".`));
  if (!['not-started', 'in-progress', 'completed'].includes(value.status as string)) issues.push(error('progress.challenge.status', `${path}.status`, 'Unknown challenge status.'));
  for (const flag of ['mastered', 'review', 'flagged'] as const) {
    if (typeof value[flag] !== 'boolean') issues.push(error('progress.challenge.flag', `${path}.${flag}`, `${flag} must be boolean.`));
  }
  if (!isRecord(value.drafts) || !Object.entries(value.drafts).every(([variantId, draft]) => nonEmptyString(variantId) && typeof draft === 'string')) {
    issues.push(error('progress.challenge.drafts', `${path}.drafts`, 'Drafts must map non-empty variant ids to strings.'));
  }
  if (!optionalDate(value.updatedAt)) issues.push(error('progress.date.invalid', `${path}.updatedAt`, 'updatedAt must be an ISO-compatible date.'));
  return true;
}

function validateLesson(value: unknown, key: string, path: string, issues: ProgressValidationIssue[]): value is LessonProgress {
  if (!isRecord(value)) {
    issues.push(error('progress.lesson.object', path, 'Lesson progress must be an object.'));
    return false;
  }
  if (!nonEmptyString(value.id)) issues.push(error('progress.lesson.id', `${path}.id`, 'Lesson id is required.'));
  else if (value.id !== key) issues.push(error('progress.lesson.id.mismatch', `${path}.id`, `Lesson id must match record key "${key}".`));
  if (value.courseId !== undefined && !nonEmptyString(value.courseId)) issues.push(error('progress.lesson.course', `${path}.courseId`, 'courseId must be a non-empty string.'));
  if (!['not-started', 'in-progress', 'completed'].includes(value.status as string)) issues.push(error('progress.lesson.status', `${path}.status`, 'Unknown lesson status.'));
  if (typeof value.completed !== 'boolean') issues.push(error('progress.lesson.completed', `${path}.completed`, 'completed must be boolean.'));
  if (value.status === 'completed' && value.completed !== true) issues.push(error('progress.lesson.completion.mismatch', path, 'Completed lesson status requires completed=true.'));
  if (value.completed === true && value.status !== 'completed') issues.push(error('progress.lesson.completion.mismatch', path, 'completed=true requires completed lesson status.'));
  if (value.recentPosition !== undefined) validatePosition(value.recentPosition, `${path}.recentPosition`, issues);
  if (!optionalDate(value.lastVisitedAt)) issues.push(error('progress.date.invalid', `${path}.lastVisitedAt`, 'lastVisitedAt must be an ISO-compatible date.'));
  if (!optionalDate(value.completedAt)) issues.push(error('progress.date.invalid', `${path}.completedAt`, 'completedAt must be an ISO-compatible date.'));
  return true;
}

function validateScore(value: unknown, path: string, issues: ProgressValidationIssue[]): value is AssessmentScore {
  if (!isRecord(value)) {
    issues.push(error('progress.assessment.score.object', path, 'Assessment score must be an object.'));
    return false;
  }
  for (const field of ['earned', 'possible', 'percent'] as const) {
    if (typeof value[field] !== 'number' || !Number.isFinite(value[field]) || (value[field] as number) < 0) {
      issues.push(error('progress.assessment.score.number', `${path}.${field}`, `${field} must be a non-negative finite number.`));
    }
  }
  if (typeof value.percent === 'number' && value.percent > 100) issues.push(error('progress.assessment.score.percent', `${path}.percent`, 'percent must not exceed 100.'));
  if (typeof value.earned === 'number' && typeof value.possible === 'number' && value.earned > value.possible) issues.push(error('progress.assessment.score.range', path, 'earned must not exceed possible.'));
  if (value.passed !== undefined && typeof value.passed !== 'boolean') issues.push(error('progress.assessment.score.passed', `${path}.passed`, 'passed must be boolean.'));
  return true;
}

function validateAnswer(value: unknown, key: string, path: string, issues: ProgressValidationIssue[]): value is AssessmentAnswer {
  if (!isRecord(value)) {
    issues.push(error('progress.assessment.answer.object', path, 'Assessment answer must be an object.'));
    return false;
  }
  if (!nonEmptyString(value.questionId)) issues.push(error('progress.assessment.answer.id', `${path}.questionId`, 'Question id is required.'));
  else if (value.questionId !== key) issues.push(error('progress.assessment.answer.id.mismatch', `${path}.questionId`, `Question id must match record key "${key}".`));
  if (!validateAnswerValue(value.value)) issues.push(error('progress.assessment.answer.value', `${path}.value`, 'Unsupported assessment answer value.'));
  if (value.correct !== undefined && typeof value.correct !== 'boolean') issues.push(error('progress.assessment.answer.correct', `${path}.correct`, 'correct must be boolean.'));
  for (const field of ['pointsEarned', 'pointsPossible'] as const) {
    if (value[field] !== undefined && (typeof value[field] !== 'number' || !Number.isFinite(value[field]) || (value[field] as number) < 0)) {
      issues.push(error('progress.assessment.answer.points', `${path}.${field}`, `${field} must be a non-negative finite number.`));
    }
  }
  if (typeof value.pointsEarned === 'number' && typeof value.pointsPossible === 'number' && value.pointsEarned > value.pointsPossible) {
    issues.push(error('progress.assessment.answer.points.range', path, 'pointsEarned must not exceed pointsPossible.'));
  }
  for (const field of ['domainIds', 'conceptIds'] as const) {
    if (value[field] !== undefined && !stringArray(value[field])) issues.push(error('progress.string-array', `${path}.${field}`, `${field} must be an array of non-empty strings.`));
  }
  return true;
}

function validateAttempt(value: unknown, assessmentId: string, path: string, issues: ProgressValidationIssue[]): value is AssessmentAttempt {
  if (!isRecord(value)) {
    issues.push(error('progress.assessment.attempt.object', path, 'Assessment attempt must be an object.'));
    return false;
  }
  if (!nonEmptyString(value.id)) issues.push(error('progress.assessment.attempt.id', `${path}.id`, 'Attempt id is required.'));
  if (value.assessmentId !== assessmentId) issues.push(error('progress.assessment.attempt.assessment', `${path}.assessmentId`, `assessmentId must be "${assessmentId}".`));
  if (!['in-progress', 'submitted'].includes(value.status as string)) issues.push(error('progress.assessment.attempt.status', `${path}.status`, 'Unknown attempt status.'));
  if (!optionalDate(value.startedAt)) issues.push(error('progress.date.invalid', `${path}.startedAt`, 'startedAt must be an ISO-compatible date.'));
  if (!optionalDate(value.submittedAt)) issues.push(error('progress.date.invalid', `${path}.submittedAt`, 'submittedAt must be an ISO-compatible date.'));
  if (!isRecord(value.answers)) issues.push(error('progress.assessment.answers', `${path}.answers`, 'answers must be a record.'));
  else Object.entries(value.answers).forEach(([questionId, answer]) => validateAnswer(answer, questionId, `${path}.answers.${questionId}`, issues));
  if (value.score !== undefined) validateScore(value.score, `${path}.score`, issues);
  if (value.status === 'in-progress' && value.score !== undefined) issues.push(warning('progress.assessment.score.early', `${path}.score`, 'In-progress attempts normally omit a revealed score.'));
  return true;
}

function validateAssessment(value: unknown, key: string, path: string, issues: ProgressValidationIssue[]): value is AssessmentProgress {
  if (!isRecord(value)) {
    issues.push(error('progress.assessment.object', path, 'Assessment progress must be an object.'));
    return false;
  }
  if (!nonEmptyString(value.id)) issues.push(error('progress.assessment.id', `${path}.id`, 'Assessment id is required.'));
  else if (value.id !== key) issues.push(error('progress.assessment.id.mismatch', `${path}.id`, `Assessment id must match record key "${key}".`));
  if (!Array.isArray(value.attempts)) {
    issues.push(error('progress.assessment.attempts', `${path}.attempts`, 'attempts must be an array.'));
    return true;
  }
  const attemptIds = new Set<string>();
  value.attempts.forEach((attempt, index) => {
    validateAttempt(attempt, key, `${path}.attempts[${index}]`, issues);
    if (isRecord(attempt) && nonEmptyString(attempt.id)) {
      if (attemptIds.has(attempt.id)) issues.push(error('progress.assessment.attempt.id.duplicate', `${path}.attempts[${index}].id`, `Duplicate attempt id "${attempt.id}".`));
      attemptIds.add(attempt.id);
    }
  });
  if (value.activeAttemptId !== undefined && (!nonEmptyString(value.activeAttemptId) || !attemptIds.has(value.activeAttemptId))) {
    issues.push(error('progress.assessment.active-attempt', `${path}.activeAttemptId`, 'activeAttemptId must resolve to an attempt.'));
  }
  return true;
}

export function validateProgressState(value: unknown): ProgressValidationResult {
  if (!isRecord(value)) return result([error('progress.state.object', '$', 'Progress state must be an object.')]);
  const issues: ProgressValidationIssue[] = [];
  if (value.schemaVersion !== PROGRESS_SCHEMA_VERSION) issues.push(error('progress.version.unsupported', 'schemaVersion', `Expected progress schema version ${PROGRESS_SCHEMA_VERSION}.`));
  for (const area of ['challenges', 'lessons', 'assessments'] as const) {
    if (!isRecord(value[area])) issues.push(error('progress.area.record', area, `${area} must be a record.`));
  }
  if (isRecord(value.challenges)) Object.entries(value.challenges).forEach(([id, entry]) => validateChallenge(entry, id, `challenges.${id}`, issues));
  if (isRecord(value.lessons)) Object.entries(value.lessons).forEach(([id, entry]) => validateLesson(entry, id, `lessons.${id}`, issues));
  if (isRecord(value.assessments)) Object.entries(value.assessments).forEach(([id, entry]) => validateAssessment(entry, id, `assessments.${id}`, issues));
  return result(issues);
}

export function formatProgressValidationIssues(validation: ProgressValidationResult): string {
  return validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
}

export function assertValidProgressState(value: unknown): ProgressStateV2 {
  const validation = validateProgressState(value);
  if (!validation.valid) throw new Error(`Invalid progress state:\n${formatProgressValidationIssues(validation)}`);
  return value as ProgressStateV2;
}
