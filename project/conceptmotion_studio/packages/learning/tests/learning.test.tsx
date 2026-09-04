import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import type {
  AssessmentSpec,
  NotebookSpec,
  QuestionSpec,
  RuntimeTarget,
} from '@datapass/content';
import { createEmptyProgressState, type ProgressStateV2 } from '@datapass/progress';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

class TestResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', TestResizeObserver);
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

vi.mock('@datapass/code', () => ({
  CodeEditor: ({ ariaLabel, language, value, onChange, readOnly }: {
    ariaLabel: string;
    language: string;
    value: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
  }) => (
    <textarea
      aria-label={ariaLabel}
      data-code-editor={language}
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
  CodeDiff: ({ ariaLabel, original, modified }: { ariaLabel: string; original: string; modified: string }) => (
    <div data-code-diff="true" aria-label={ariaLabel}><del>{original}</del><ins>{modified}</ins></div>
  ),
}));

vi.mock('@datapass/figure', () => ({
  FigureView: ({ figure }: { figure: { id: string } }) => <div data-figure-view={figure.id} />,
}));

import {
  AssessmentRunner,
  GuidedExercise,
  NotebookLesson,
  ProgressSummary,
  RuntimeLauncher,
  evaluateQuestion,
  gradeAssessment,
  isSafeNotebookMediaSource,
  parseSafeMarkdown,
  summarizeProgress,
  validateRuntimeTarget,
} from '../src/index';

const hosts: Array<{ element: HTMLDivElement; root: Root }> = [];

afterEach(async () => {
  while (hosts.length) {
    const current = hosts.pop()!;
    await act(async () => current.root.unmount());
    current.element.remove();
  }
});

async function render(node: React.ReactNode): Promise<HTMLDivElement> {
  const element = document.createElement('div');
  document.body.append(element);
  const root = createRoot(element);
  hosts.push({ element, root });
  await act(async () => root.render(<FluentProvider theme={webLightTheme}>{node}</FluentProvider>));
  return element;
}

function button(element: HTMLElement, label: string): HTMLButtonElement {
  const match = [...element.querySelectorAll('button')].find((candidate) => candidate.textContent?.trim() === label);
  if (!(match instanceof HTMLButtonElement)) throw new Error(`Button “${label}” was not found.`);
  return match;
}

describe('notebook learning surfaces', () => {
  const notebook: NotebookSpec = {
    id: 'notebook.sql.where',
    title: 'Filtering rows',
    language: 'sql',
    provenance: {
      sourceFile: 'where.ipynb',
      sourceSha256: 'a'.repeat(64),
      importerVersion: '2.0.0',
      notebookFormat: 4,
    },
    cells: [
      { id: 'intro', type: 'markdown', markdown: '# WHERE\n\n- Keep matching rows\n- Preserve columns' },
      { id: 'query', type: 'code', language: 'sql', source: 'SELECT * FROM t;', editable: true, execution: 'none' },
      { id: 'output', type: 'text-output', text: '2 rows', source: 'reference' },
      { id: 'table', type: 'table-output', columns: ['id'], rows: [[1], [2]], source: 'reference' },
      { id: 'figure', type: 'figure', figureId: 'figure.where' },
      { id: 'note', type: 'callout', tone: 'tip', title: 'Remember', content: 'NULL needs IS NULL.' },
    ],
  };

  it('renders structured cells, figures and source outputs without execution controls', async () => {
    const element = await render(
      <NotebookLesson
        notebook={notebook}
        figures={[{
          id: 'figure.where', kind: 'static', rendererId: 'static.text', title: 'Rows',
          spec: { text: 'rows' }, fallbackText: 'Rows are filtered.',
        }]}
      />,
    );
    expect(element.querySelector('[data-notebook-id="notebook.sql.where"]')).not.toBeNull();
    expect(element.querySelectorAll('[data-cell-id]')).toHaveLength(6);
    expect(element.querySelector('[data-code-editor="sql"]')).not.toBeNull();
    expect(element.querySelector('[data-reference-output="text"]')?.textContent).toContain('Saved reference output');
    expect(element.querySelector('[data-reference-output="table"]')?.textContent).toContain('it was not run here');
    expect(element.querySelector('[data-figure-view="figure.where"]')).not.toBeNull();
    expect(element.querySelector('table caption')?.textContent).toContain('source notebook');
    expect([...element.querySelectorAll('button')].some((control) => /^(run|execute)$/i.test(control.textContent ?? ''))).toBe(false);
  });

  it('keeps Markdown and media handling deterministic and free of raw HTML execution', async () => {
    expect(parseSafeMarkdown('# Title\n\n1. One\n2. Two\n\n```sql\nselect 1\n```').map((block) => block.kind))
      .toEqual(['heading', 'ordered-list', 'code']);
    expect(isSafeNotebookMediaSource('./media/chart.png')).toBe(true);
    expect(isSafeNotebookMediaSource('data:image/png;base64,AAAA')).toBe(true);
    expect(isSafeNotebookMediaSource('javascript:alert(1)')).toBe(false);
    expect(isSafeNotebookMediaSource('../secret.png')).toBe(false);
    expect(isSafeNotebookMediaSource('/media/%2e%2e/secret.png')).toBe(false);
    expect(isSafeNotebookMediaSource('https://user:secret@example.com/chart.png')).toBe(false);
  });
});

describe('GuidedExercise', () => {
  it('implements Try to Hint to Reveal to Compare while never offering Run', async () => {
    const element = await render(
      <GuidedExercise
        id="exercise.where"
        language="sql"
        starter="SELECT * FROM sales"
        hints={['Filter with WHERE.']}
        solution="SELECT * FROM sales WHERE amount > 0"
        explanation="The predicate removes non-positive rows."
      />,
    );
    const exercise = element.querySelector('[data-exercise-id="exercise.where"]')!;
    expect(exercise.getAttribute('data-guided-step')).toBe('try');
    expect(exercise.getAttribute('data-execution')).toBe('none');
    expect([...exercise.querySelectorAll('button')].some((control) => /^run$/i.test(control.textContent ?? ''))).toBe(false);

    await act(async () => button(element, 'Show hint').click());
    expect(exercise.getAttribute('data-guided-step')).toBe('hint');
    expect(element.textContent).toContain('Filter with WHERE.');

    await act(async () => button(element, 'Reveal solution').click());
    expect(exercise.getAttribute('data-guided-step')).toBe('reveal');
    expect(element.textContent).toContain('Reference solution');

    await act(async () => button(element, 'Compare').click());
    expect(exercise.getAttribute('data-guided-step')).toBe('compare');
    expect(element.querySelector('[data-code-diff="true"]')).not.toBeNull();
  });

  it('labels PySpark exercises as display-only', async () => {
    const element = await render(<GuidedExercise id="spark" language="pyspark" starter="df.show()" />);
    expect(element.textContent).toContain('PySpark is display-only');
    expect(element.textContent).toContain('Spark does not run in this site');
  });
});

const questions: readonly QuestionSpec[] = [
  { id: 'single', type: 'single-choice', prompt: 'Single?', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], correctOptionId: 'a', explanation: 'A is right.' },
  { id: 'multiple', type: 'multiple-choice', prompt: 'Multiple?', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }], correctOptionIds: ['a', 'c'] },
  { id: 'boolean', type: 'true-false', prompt: 'True?', correct: true },
  { id: 'order', type: 'ordering', prompt: 'Order?', items: [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }], correctOrderIds: ['two', 'one'] },
  { id: 'match', type: 'matching', prompt: 'Match?', leftItems: [{ id: 'sql', label: 'SQL' }], rightItems: [{ id: 'rows', label: 'Rows' }], correctMatches: [{ leftId: 'sql', rightId: 'rows' }] },
  { id: 'code', type: 'code-choice', prompt: 'Code?', language: 'sql', options: [{ id: 'good', label: 'Good', code: 'SELECT 1' }, { id: 'bad', label: 'Bad', code: 'SELECT' }], correctOptionId: 'good' },
  { id: 'figure', type: 'figure-choice', prompt: 'Figure?', options: [{ id: 'left', label: 'Left', figureId: 'f-left' }, { id: 'right', label: 'Right', figureId: 'f-right' }], correctOptionId: 'right' },
];

describe('assessment grading and feedback modes', () => {
  it('grades all seven question contracts deterministically', () => {
    const values = ['a', ['c', 'a'], true, ['two', 'one'], { sql: 'rows' }, 'good', 'right'] as const;
    expect(questions.map((question, index) => evaluateQuestion(question, values[index]).correct)).toEqual([
      true, true, true, true, true, true, true,
    ]);
    expect(evaluateQuestion(questions[1], ['a', 'a', 'c']).correct).toBe(true);
    expect(evaluateQuestion(questions[3], ['one', 'two']).correct).toBe(false);

    const assessment: AssessmentSpec = {
      id: 'all-types', title: 'All types', mode: 'practice',
      questionIds: questions.map((question) => question.id), passingScore: 80,
    };
    const answerValues = Object.fromEntries(questions.map((question, index) => [question.id, values[index]]));
    const result = gradeAssessment(assessment, questions, answerValues, 'attempt.stable');
    expect(result.score).toMatchObject({ earned: 7, possible: 7, percent: 100, passed: true });
    expect(result.attempt).toMatchObject({ id: 'attempt.stable', status: 'submitted', assessmentId: 'all-types' });
    expect(result.attempt.startedAt).toBeUndefined();
    expect(result.attempt.submittedAt).toBeUndefined();
  });

  it('renders an accessible input surface for every supported question type', async () => {
    const assessment: AssessmentSpec = {
      id: 'render-all', title: 'Render all', mode: 'interview', questionIds: questions.map((question) => question.id),
    };
    const element = await render(<AssessmentRunner assessment={assessment} questions={questions} />);
    expect(element.querySelectorAll('[data-question-id]')).toHaveLength(7);
    expect(element.querySelector('[data-question-id="multiple"] input[type="checkbox"]')).not.toBeNull();
    expect(element.querySelector('[data-question-id="order"] [data-order-item-id="one"]')).not.toBeNull();
    expect(element.querySelector('[data-question-id="match"] select')).not.toBeNull();
    expect(element.querySelector('[data-question-id="code"] code[data-language="sql"]')).not.toBeNull();
    expect(element.querySelector('[data-question-id="figure"]')).not.toBeNull();
    expect(element.querySelectorAll('[data-feedback-state]')).toHaveLength(0);
  });

  it('shows immediate practice feedback but withholds mock-exam feedback until submit', async () => {
    const practice: AssessmentSpec = { id: 'practice', title: 'Practice', mode: 'practice', questionIds: ['single'] };
    const practiceHost = await render(<AssessmentRunner assessment={practice} questions={questions} />);
    await act(async () => practiceHost.querySelector<HTMLInputElement>('input[value="a"]')!.click());
    expect(practiceHost.querySelector('[data-feedback-state="correct"]')).not.toBeNull();
    expect(practiceHost.textContent).toContain('A is right.');

    const mock: AssessmentSpec = { id: 'mock', title: 'Mock', mode: 'mock-exam', questionIds: ['single'] };
    const mockHost = await render(<AssessmentRunner assessment={mock} questions={questions} />);
    await act(async () => mockHost.querySelector<HTMLInputElement>('input[value="a"]')!.click());
    expect(mockHost.querySelector('[data-feedback-state]')).toBeNull();
    expect(mockHost.textContent).not.toContain('A is right.');
    await act(async () => button(mockHost, 'Submit assessment').click());
    expect(mockHost.querySelector('[data-feedback-state="correct"]')).not.toBeNull();
    expect(mockHost.textContent).toContain('1 / 1');
  });
});

describe('safe runtime boundaries', () => {
  const download: RuntimeTarget = {
    id: 'download', kind: 'download', label: 'Notebook', downloadPath: '/downloads/lesson.ipynb', executesExternally: false,
  };
  const colab: RuntimeTarget = {
    id: 'colab', kind: 'colab', label: 'Colab', url: 'https://colab.research.google.com/drive/configured', executesExternally: true,
  };
  const unsafe: RuntimeTarget = {
    id: 'unsafe', kind: 'external', label: 'Unsafe', url: 'javascript:alert(1)', executesExternally: true,
  };

  it('accepts only explicit safe downloads and HTTPS targets', async () => {
    expect(validateRuntimeTarget(download)).toMatchObject({ valid: true, href: '/downloads/lesson.ipynb' });
    expect(validateRuntimeTarget(colab)).toMatchObject({ valid: true });
    expect(validateRuntimeTarget(unsafe).valid).toBe(false);
    expect(validateRuntimeTarget({ ...download, downloadPath: '../secret.ipynb' }).valid).toBe(false);
    expect(validateRuntimeTarget({ ...download, downloadPath: '/downloads/%2e%2e/secret.ipynb' }).valid).toBe(false);
    expect(validateRuntimeTarget({ ...colab, url: 'https://user:secret@example.com' }).valid).toBe(false);

    const element = await render(<RuntimeLauncher targets={[download, colab, unsafe]} />);
    expect(element.querySelectorAll('a')).toHaveLength(2);
    expect(element.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(element.querySelector('[data-runtime-rejected="true"]')?.textContent).toContain('unsafe or incomplete');
    expect(element.textContent).toContain('Nothing runs in this site');
  });
});

describe('ProgressSummary', () => {
  it('summarizes scoped versioned progress without owning storage', async () => {
    const empty = createEmptyProgressState();
    const state: ProgressStateV2 = {
      ...empty,
      lessons: {
        one: { id: 'one', status: 'completed', completed: true },
        two: { id: 'two', status: 'in-progress', completed: false },
      },
      challenges: {
        c1: { id: 'c1', status: 'completed', drafts: {}, mastered: true, review: true, flagged: false },
      },
      assessments: {
        quiz: {
          id: 'quiz', attempts: [{ id: 'attempt', assessmentId: 'quiz', status: 'submitted', answers: {}, score: { earned: 4, possible: 5, percent: 80 } }],
        },
      },
    };
    expect(summarizeProgress(state)).toEqual({
      completedLessons: 1,
      totalLessons: 2,
      masteredChallenges: 1,
      totalChallenges: 1,
      submittedAttempts: 1,
      bestAssessmentPercent: 80,
      reviewItems: 1,
    });
    const element = await render(<ProgressSummary state={state} />);
    expect(element.textContent).toContain('1 / 2');
    expect(element.textContent).toContain('80%');
    expect(element.textContent).toContain('schema v2');
  });
});
