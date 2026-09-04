import type {
  AssessmentSpec,
  FigureSpec,
  MatchingQuestion,
  QuestionOption,
  QuestionSpec,
} from '@datapass/content';
import { FigureView } from '@datapass/figure';
import {
  createAssessmentScore,
  type AssessmentAnswer,
  type AssessmentAnswerValue,
  type AssessmentAttempt,
  type AssessmentScore,
} from '@datapass/progress';
import {
  Badge,
  Button,
  Checkbox,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Radio,
  RadioGroup,
  Select,
  Text,
} from '@fluentui/react-components';
import { useId, useMemo, useState, type ReactNode } from 'react';
import { resolveLearningText, type LearningLocale } from './localization';

export interface QuestionEvaluation {
  readonly correct: boolean;
  readonly pointsEarned: 0 | 1;
  readonly pointsPossible: 1;
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  const normalize = (values: readonly string[]) => [...new Set(values)].sort();
  const a = normalize(left);
  const b = normalize(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function sameOrder(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function evaluateQuestion(question: QuestionSpec, value: unknown): QuestionEvaluation {
  let correct = false;
  if (question.type === 'single-choice' || question.type === 'code-choice' || question.type === 'figure-choice') {
    correct = typeof value === 'string' && value === question.correctOptionId;
  } else if (question.type === 'multiple-choice') {
    correct = Array.isArray(value)
      && value.every((item) => typeof item === 'string')
      && sameSet(value, question.correctOptionIds);
  } else if (question.type === 'true-false') {
    correct = typeof value === 'boolean' && value === question.correct;
  } else if (question.type === 'ordering') {
    correct = Array.isArray(value)
      && value.every((item) => typeof item === 'string')
      && sameOrder(value, question.correctOrderIds);
  } else if (question.type === 'matching') {
    const matches = value && typeof value === 'object' && !Array.isArray(value)
      ? value as Readonly<Record<string, unknown>>
      : {};
    correct = Object.keys(matches).length === question.leftItems.length
      && question.correctMatches.every((pair) => matches[pair.leftId] === pair.rightId);
  }
  return { correct, pointsEarned: correct ? 1 : 0, pointsPossible: 1 };
}

function emptyAnswer(question: QuestionSpec): AssessmentAnswerValue {
  if (question.type === 'multiple-choice' || question.type === 'ordering') return [];
  if (question.type === 'matching') return {};
  return '';
}

export interface AssessmentSubmission {
  readonly assessmentId: string;
  readonly answers: Readonly<Record<string, AssessmentAnswer>>;
  readonly score: AssessmentScore;
  readonly attempt: AssessmentAttempt;
}

export function gradeAssessment(
  assessment: AssessmentSpec,
  questions: readonly QuestionSpec[],
  answerValues: Readonly<Record<string, AssessmentAnswerValue>>,
  attemptId = `${assessment.id}:attempt`,
): AssessmentSubmission {
  const questionsById = new Map(questions.map((question) => [question.id, question]));
  const answers: Record<string, AssessmentAnswer> = {};
  let earned = 0;

  for (const questionId of assessment.questionIds) {
    const question = questionsById.get(questionId);
    if (!question) throw new Error(`Assessment “${assessment.id}” references missing question “${questionId}”.`);
    const value = answerValues[questionId] ?? emptyAnswer(question);
    const evaluation = evaluateQuestion(question, value);
    earned += evaluation.pointsEarned;
    answers[questionId] = {
      questionId,
      value,
      correct: evaluation.correct,
      pointsEarned: evaluation.pointsEarned,
      pointsPossible: evaluation.pointsPossible,
      ...(question.domain ? { domainIds: [question.domain] } : {}),
      ...(question.conceptIds?.length ? { conceptIds: question.conceptIds } : {}),
    };
  }

  const score = createAssessmentScore(earned, assessment.questionIds.length, assessment.passingScore);
  const attempt: AssessmentAttempt = {
    id: attemptId,
    assessmentId: assessment.id,
    status: 'submitted',
    answers,
    score,
  };
  return { assessmentId: assessment.id, answers, score, attempt };
}

type FigureCollection = readonly FigureSpec[] | Readonly<Record<string, FigureSpec>>;

function figureRecord(figures: FigureCollection | undefined): Readonly<Record<string, FigureSpec>> {
  if (!figures) return {};
  if (Array.isArray(figures)) return Object.fromEntries(figures.map((figure) => [figure.id, figure]));
  return figures as Readonly<Record<string, FigureSpec>>;
}

function optionLabel(option: QuestionOption, locale: LearningLocale): string {
  return resolveLearningText(option.label, locale);
}

interface QuestionInputProps {
  readonly question: QuestionSpec;
  readonly value: AssessmentAnswerValue | undefined;
  readonly locale: LearningLocale;
  readonly disabled: boolean;
  readonly figures: Readonly<Record<string, FigureSpec>>;
  readonly reducedMotion: boolean;
  readonly onChange: (value: AssessmentAnswerValue) => void;
}

function ChoiceRadioGroup({
  question,
  options,
  value,
  locale,
  disabled,
  renderOption,
  onChange,
}: QuestionInputProps & {
  readonly options: readonly QuestionOption[];
  readonly renderOption?: (option: QuestionOption) => ReactNode;
}) {
  return (
    <RadioGroup
      aria-label={resolveLearningText(question.prompt, locale)}
      value={typeof value === 'string' ? value : ''}
      disabled={disabled}
      onChange={(_, data) => onChange(data.value)}
    >
      {options.map((option) => (
        <div key={option.id} className="dp-assessment-option" data-option-id={option.id}>
          <Radio value={option.id} label={optionLabel(option, locale)} />
          {renderOption?.(option)}
        </div>
      ))}
    </RadioGroup>
  );
}

function OrderingInput({ question, value, disabled, locale, onChange }: QuestionInputProps) {
  if (question.type !== 'ordering') return null;
  const configured = Array.isArray(value) && value.length === question.items.length
    ? value.filter((item): item is string => typeof item === 'string')
    : question.items.map((item) => item.id);
  const labels = new Map(question.items.map((item) => [item.id, optionLabel(item, locale)]));

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= configured.length) return;
    const next = [...configured];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <ol className="dp-assessment-ordering" aria-label="Ordered answer">
      {configured.map((id, index) => (
        <li key={id} data-order-item-id={id}>
          <span>{labels.get(id) ?? id}</span>
          <span className="dp-assessment-ordering__buttons">
            <Button
              size="small"
              disabled={disabled || index === 0}
              aria-label={`Move ${labels.get(id) ?? id} up`}
              onClick={() => move(index, -1)}
            >Up</Button>
            <Button
              size="small"
              disabled={disabled || index === configured.length - 1}
              aria-label={`Move ${labels.get(id) ?? id} down`}
              onClick={() => move(index, 1)}
            >Down</Button>
          </span>
        </li>
      ))}
    </ol>
  );
}

function MatchingInput({ question, value, disabled, locale, onChange }: QuestionInputProps) {
  if (question.type !== 'matching') return null;
  const matches = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Readonly<Record<string, string>>
    : {};
  return (
    <div className="dp-assessment-matching">
      {question.leftItems.map((left) => (
        <label key={left.id}>
          <span>{optionLabel(left, locale)}</span>
          <Select
            aria-label={`Match ${optionLabel(left, locale)}`}
            value={matches[left.id] ?? ''}
            disabled={disabled}
            onChange={(event) => onChange({ ...matches, [left.id]: event.target.value })}
          >
            <option value="">Choose a match</option>
            {question.rightItems.map((right) => (
              <option key={right.id} value={right.id}>{optionLabel(right, locale)}</option>
            ))}
          </Select>
        </label>
      ))}
    </div>
  );
}

function QuestionInput(props: QuestionInputProps) {
  const { question, value, locale, disabled, figures, reducedMotion, onChange } = props;
  if (question.type === 'single-choice') {
    return <ChoiceRadioGroup {...props} options={question.options} />;
  }
  if (question.type === 'multiple-choice') {
    const values = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
    return (
      <div className="dp-assessment-options" role="group" aria-label={resolveLearningText(question.prompt, locale)}>
        {question.options.map((option) => (
          <Checkbox
            key={option.id}
            label={optionLabel(option, locale)}
            checked={values.includes(option.id)}
            disabled={disabled}
            onChange={(_, data) => onChange(
              data.checked === true
                ? [...values, option.id]
                : values.filter((id) => id !== option.id),
            )}
          />
        ))}
      </div>
    );
  }
  if (question.type === 'true-false') {
    return (
      <RadioGroup
        aria-label={resolveLearningText(question.prompt, locale)}
        value={typeof value === 'boolean' ? String(value) : ''}
        disabled={disabled}
        onChange={(_, data) => onChange(data.value === 'true')}
      >
        <Radio value="true" label="True" />
        <Radio value="false" label="False" />
      </RadioGroup>
    );
  }
  if (question.type === 'ordering') return <OrderingInput {...props} />;
  if (question.type === 'matching') return <MatchingInput {...props} />;
  if (question.type === 'code-choice') {
    return (
      <ChoiceRadioGroup
        {...props}
        options={question.options}
        renderOption={(option) => {
          const code = question.options.find((candidate) => candidate.id === option.id)?.code;
          return code ? <pre className="dp-assessment-code" tabIndex={0} aria-label={`${question.language} answer option`}><code data-language={question.language}>{code}</code></pre> : null;
        }}
      />
    );
  }
  return (
    <ChoiceRadioGroup
      {...props}
      options={question.options}
      renderOption={(option) => {
        const figureId = question.options.find((candidate) => candidate.id === option.id)?.figureId;
        const figure = figureId ? figures[figureId] : undefined;
        return figure
          ? <FigureView figure={figure} locale={locale} reducedMotion={reducedMotion} minimumHeight="10rem" />
          : <Text size={200}>Figure “{figureId}” is unavailable.</Text>;
      }}
    />
  );
}

function feedbackFor(
  question: QuestionSpec,
  value: AssessmentAnswerValue | undefined,
  locale: LearningLocale,
) {
  const evaluation = evaluateQuestion(question, value);
  return (
    <MessageBar intent={evaluation.correct ? 'success' : 'error'} data-feedback-state={evaluation.correct ? 'correct' : 'incorrect'}>
      <MessageBarBody>
        <MessageBarTitle>{evaluation.correct ? 'Correct' : 'Not correct yet'}</MessageBarTitle>
        {question.explanation ? ` ${resolveLearningText(question.explanation, locale)}` : null}
      </MessageBarBody>
    </MessageBar>
  );
}

export interface AssessmentRunnerProps {
  readonly assessment: AssessmentSpec;
  readonly questions: readonly QuestionSpec[];
  readonly figures?: FigureCollection;
  readonly locale?: LearningLocale;
  readonly reducedMotion?: boolean;
  readonly initialAnswers?: Readonly<Record<string, AssessmentAnswerValue>>;
  readonly attemptId?: string;
  readonly onAnswerChange?: (questionId: string, value: AssessmentAnswerValue) => void;
  readonly onSubmit?: (submission: AssessmentSubmission) => void;
  readonly className?: string;
}

export function AssessmentRunner({
  assessment,
  questions,
  figures,
  locale = 'en',
  reducedMotion = false,
  initialAnswers = {},
  attemptId,
  onAnswerChange,
  onSubmit,
  className,
}: AssessmentRunnerProps) {
  const titleId = useId();
  const questionsById = useMemo(() => new Map(questions.map((question) => [question.id, question])), [questions]);
  const availableFigures = useMemo(() => figureRecord(figures), [figures]);
  const orderedQuestions = assessment.questionIds.map((id) => questionsById.get(id));
  const missingIds = assessment.questionIds.filter((id) => !questionsById.has(id));
  const [answers, setAnswers] = useState<Readonly<Record<string, AssessmentAnswerValue>>>(initialAnswers);
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  const [submission, setSubmission] = useState<AssessmentSubmission | null>(null);

  function answer(questionId: string, value: AssessmentAnswerValue) {
    if (submission) return;
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setTouched((current) => new Set(current).add(questionId));
    onAnswerChange?.(questionId, value);
  }

  function submit() {
    if (missingIds.length) return;
    const result = gradeAssessment(assessment, questions, answers, attemptId);
    setSubmission(result);
    onSubmit?.(result);
  }

  return (
    <section
      className={className ? `dp-assessment-runner ${className}` : 'dp-assessment-runner'}
      data-assessment-id={assessment.id}
      data-assessment-mode={assessment.mode}
      aria-labelledby={titleId}
    >
      <header className="dp-assessment-runner__header">
        <div>
          <p className="dp-learning-eyebrow">{assessment.mode.replace('-', ' ').toUpperCase()}</p>
          <h1 id={titleId}>{resolveLearningText(assessment.title, locale)}</h1>
        </div>
        <Badge appearance="outline">{assessment.questionIds.length} questions</Badge>
      </header>
      <Text>
        {assessment.mode === 'practice'
          ? 'Practice feedback appears after each answer.'
          : assessment.mode === 'mock-exam'
            ? 'Correctness and explanations remain hidden until you submit the mock exam.'
            : 'Interview review is self-paced; feedback appears after submission.'}
      </Text>

      {missingIds.length ? (
        <div role="alert">Missing questions: {missingIds.join(', ')}. This assessment cannot be submitted.</div>
      ) : null}

      <div className="dp-assessment-runner__questions">
        {orderedQuestions.map((question, index) => question ? (
          <fieldset key={question.id} className="dp-assessment-question" data-question-id={question.id}>
            <legend><span>{index + 1}.</span> {resolveLearningText(question.prompt, locale)}</legend>
            {question.figureId && availableFigures[question.figureId] ? (
              <FigureView
                figure={availableFigures[question.figureId]}
                locale={locale}
                reducedMotion={reducedMotion}
                minimumHeight="12rem"
              />
            ) : null}
            <QuestionInput
              question={question}
              value={answers[question.id]}
              locale={locale}
              disabled={Boolean(submission)}
              figures={availableFigures}
              reducedMotion={reducedMotion}
              onChange={(value) => answer(question.id, value)}
            />
            {(submission || (assessment.mode === 'practice' && touched.has(question.id)))
              ? feedbackFor(question, answers[question.id], locale)
              : null}
          </fieldset>
        ) : null)}
      </div>

      <footer className="dp-assessment-runner__footer">
        <Button appearance="primary" disabled={Boolean(submission) || missingIds.length > 0} onClick={submit}>
          Submit assessment
        </Button>
        {submission ? (
          <div className="dp-assessment-result" role="status" aria-live="polite">
            <strong>{submission.score.earned} / {submission.score.possible}</strong>
            <span>{submission.score.percent}%</span>
            {submission.score.passed !== undefined
              ? <Badge color={submission.score.passed ? 'success' : 'danger'}>{submission.score.passed ? 'Passed' : 'Not passed'}</Badge>
              : null}
          </div>
        ) : null}
      </footer>
    </section>
  );
}
