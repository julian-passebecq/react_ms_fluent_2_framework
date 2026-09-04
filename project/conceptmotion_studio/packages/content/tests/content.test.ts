import { describe, expect, it } from 'vitest';
import type {
  ContentCatalog,
  NotebookSpec,
  QuestionSpec,
} from '../src';
import {
  parseContentCatalog,
  serializeContentCatalog,
  serializeDeterministic,
  validateAppRecipe,
  validateContentCatalog,
  validateFigureSpec,
  validateNotebookSpec,
  validateQuestionSpec,
  validateRuntimeTarget,
} from '../src';

const hash = 'a'.repeat(64);

function questions(): QuestionSpec[] {
  const common = { prompt: 'Choose', explanation: 'Because.' } as const;
  return [
    { ...common, id: 'q.single', type: 'single-choice', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], correctOptionId: 'a' },
    { ...common, id: 'q.multiple', type: 'multiple-choice', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], correctOptionIds: ['a', 'b'] },
    { ...common, id: 'q.boolean', type: 'true-false', correct: true },
    { ...common, id: 'q.order', type: 'ordering', items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], correctOrderIds: ['b', 'a'] },
    {
      ...common,
      id: 'q.match',
      type: 'matching',
      leftItems: [{ id: 'l1', label: 'Left 1' }, { id: 'l2', label: 'Left 2' }],
      rightItems: [{ id: 'r1', label: 'Right 1' }, { id: 'r2', label: 'Right 2' }],
      correctMatches: [{ leftId: 'l1', rightId: 'r2' }, { leftId: 'l2', rightId: 'r1' }],
    },
    {
      ...common,
      id: 'q.code',
      type: 'code-choice',
      language: 'sql',
      options: [{ id: 'a', label: 'A', code: 'SELECT 1' }, { id: 'b', label: 'B', code: 'SELECT 2' }],
      correctOptionId: 'a',
    },
    {
      ...common,
      id: 'q.figure',
      type: 'figure-choice',
      options: [{ id: 'a', label: 'A', figureId: 'figure.filter' }, { id: 'b', label: 'B', figureId: 'figure.filter' }],
      correctOptionId: 'b',
    },
  ];
}

function catalog(): ContentCatalog {
  return {
    version: '2',
    sources: [{
      id: 'source.course',
      title: 'Original course',
      url: 'https://example.test/course',
      attribution: 'Example author',
      license: { id: 'CC-BY-SA-4.0', requiresAttribution: true },
    }],
    figures: [{
      id: 'figure.filter',
      kind: 'concept',
      rendererId: 'table.transform',
      title: { en: 'Filtering', no: 'Filtrering' },
      fallbackText: 'Rows that do not match are removed.',
      spec: { tableId: 'orders', visibleRowIds: ['row.1'] },
      sourceIds: ['source.course'],
    }],
    runtimeTargets: [
      { id: 'runtime.download', kind: 'download', label: 'Download notebook', downloadPath: '/downloads/course.ipynb', executesExternally: false },
      { id: 'runtime.colab', kind: 'colab', label: 'Open in Colab', url: 'https://colab.research.google.com/example', executesExternally: true },
    ],
    notebooks: [{
      id: 'notebook.sql',
      title: 'SQL lesson',
      language: 'sql',
      provenance: { sourceFile: 'sql.ipynb', sourceSha256: hash, importerVersion: '2.0.0', notebookFormat: 4, sourceId: 'source.course' },
      sourceIds: ['source.course'],
      runtimeTargetIds: ['runtime.download'],
      cells: [
        { id: 'cell.intro', type: 'markdown', markdown: '# SQL', sourceHash: hash },
        { id: 'cell.code', type: 'code', language: 'sql', source: 'SELECT 1', execution: 'none', referenceOutputIds: ['cell.output'] },
        { id: 'cell.output', type: 'text-output', text: '1', source: 'reference' },
        { id: 'cell.figure', type: 'figure', figureId: 'figure.filter' },
      ],
    }],
    questions: questions(),
    assessments: [{ id: 'assessment.sql', title: 'SQL check', mode: 'practice', questionIds: questions().map((question) => question.id), passingScore: 70, sourceIds: ['source.course'] }],
    challengeIds: ['challenge.sql'],
    courses: [{
      id: 'course.sql',
      title: 'SQL',
      sourceIds: ['source.course'],
      runtimeTargetIds: ['runtime.download'],
      modules: [{
        id: 'module.basics',
        title: 'Basics',
        lessons: [{
          id: 'lesson.filter', title: 'Filter rows', notebookId: 'notebook.sql', figureIds: ['figure.filter'],
          challengeIds: ['challenge.sql'], assessmentIds: ['assessment.sql'], vocabularyTopicIds: ['topic.sql'],
          sourceIds: ['source.course'], runtimeTargetIds: ['runtime.colab'],
        }],
      }],
    }],
    projects: [
      { id: 'project.old', title: 'Old app', url: 'https://old.example.test', status: 'legacy', kind: 'learning', supersededBy: 'project.dubreu' },
      { id: 'project.dubreu', title: 'Dubreu Formation', url: 'https://formation.example.test', repository: 'https://github.com/example/formation', status: 'active', kind: 'learning' },
    ],
    appRecipes: [{
      id: 'recipe.dubreu', name: 'dubreu-formation', packageName: '@datapass/dubreu-formation', title: 'Dubreu Formation',
      preset: 'learning', routes: ['/', '/courses'], locales: ['en'], includeEditor: true, projectId: 'project.dubreu',
    }],
    vocabularyEntries: [{ id: 'vocabulary.where', lemma: 'WHERE', language: 'en', topicIds: ['topic.sql'], sourceIds: ['source.course'] }],
    vocabularyTopics: [{ id: 'topic.sql', title: 'SQL clauses', vocabularyIds: ['vocabulary.where'], figureIds: ['figure.filter'], articleLessonIds: ['article.where'], assessmentIds: ['assessment.sql'] }],
    articleLessons: [{ id: 'article.where', title: 'Filtering article', sourceIds: ['source.course'], summary: 'A short original summary.', vocabularyTopicIds: ['topic.sql'], figureIds: ['figure.filter'], assessmentIds: ['assessment.sql'] }],
  };
}

describe('@datapass/content contracts', () => {
  it('validates a connected V2 content catalog and all seven question types', () => {
    const value = catalog();
    expect(validateContentCatalog(value)).toEqual({ valid: true, issues: [] });
    for (const question of value.questions ?? []) expect(validateQuestionSpec(question).valid).toBe(true);
  });

  it('requires Figure fallback text and a serializable renderer spec', () => {
    const validation = validateFigureSpec({ id: 'figure.bad', kind: 'concept', rendererId: 'table.transform', title: 'Bad', spec: 1n });
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((candidate) => candidate.code)).toEqual(expect.arrayContaining([
      'content.localized-text.invalid',
      'content.json.invalid',
    ]));
  });

  it('reports duplicate IDs, broken references, unsafe URLs and required attribution', () => {
    const value = catalog() as unknown as Record<string, unknown>;
    const sources = value.sources as Record<string, unknown>[];
    sources[0] = { ...sources[0], attribution: undefined, url: 'javascript:alert(1)' };
    value.figures = [...(value.figures as unknown[]), { ...(value.figures as Record<string, unknown>[])[0] }];
    const courses = value.courses as Record<string, unknown>[];
    const modules = courses[0]?.modules as Record<string, unknown>[];
    const lessons = modules[0]?.lessons as Record<string, unknown>[];
    lessons[0] = { ...lessons[0], notebookId: 'missing.notebook' };
    const validation = validateContentCatalog(value);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((candidate) => candidate.code)).toEqual(expect.arrayContaining([
      'content.id.duplicate',
      'content.license.attribution.required',
      'content.reference.notebook.unknown',
      'content.url.unsafe',
    ]));
  });

  it('rejects unsafe runtime and scaffold paths while preserving explicit execution truth', () => {
    expect(validateRuntimeTarget({ id: 'runtime.bad', kind: 'colab', label: 'Open', url: 'data:text/html,bad', executesExternally: true }).issues[0]?.code).toBe('content.url.unsafe');
    expect(validateRuntimeTarget({ id: 'runtime.download', kind: 'download', label: 'Download', downloadPath: '../secret.ipynb', executesExternally: false }).valid).toBe(false);
    expect(validateAppRecipe({ id: 'recipe.bad', name: 'Bad Name', packageName: 'bad package', title: 'Bad', preset: 'learning', routes: ['https://evil.test'] }).valid).toBe(false);
  });

  it('validates notebook cell unions and catches broken reference outputs without throwing', () => {
    const notebook: NotebookSpec = {
      id: 'notebook.bad',
      provenance: { sourceFile: 'bad.ipynb', sourceSha256: hash, importerVersion: '2.0.0', notebookFormat: 4 },
      cells: [{ id: 'cell.code', type: 'code', language: 'python', source: 'print(1)', execution: 'none', referenceOutputIds: ['missing.output'] }],
    };
    expect(validateNotebookSpec(notebook).issues.some((candidate) => candidate.code === 'content.reference.notebook-output.unknown')).toBe(true);
    expect(() => validateNotebookSpec({ cells: [null, { type: 'future-cell' }], provenance: null })).not.toThrow();
  });

  it('serializes deterministically and validates parsed catalogs', () => {
    const value = catalog();
    const serialized = serializeContentCatalog(value);
    expect(serialized).toBe(serializeContentCatalog(value));
    expect(serialized.indexOf('"appRecipes"')).toBeLessThan(serialized.indexOf('"version"'));
    expect(parseContentCatalog(serialized)).toEqual(value);
    expect(serializeDeterministic({ z: 1, a: { y: 2, b: 3 } }, 0)).toBe('{"a":{"b":3,"y":2},"z":1}');
  });
});
