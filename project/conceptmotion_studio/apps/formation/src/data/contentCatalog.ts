import {
  compileTableFilter,
  compileTableState,
  type TableData,
} from '@conceptmotion/core';
import {
  assertValidContentCatalog,
  toCanonicalJsonValue,
  type AssessmentSpec,
  type ContentCatalog,
  type CourseSpec,
  type FigureSpec,
  type NotebookSpec,
  type QuestionSpec,
  type RuntimeTarget,
} from '@datapass/content';

import { reasoningCourseModule, reasoningModules, reasoningSources } from './reasoning';
import { migratedFigures, visualSources } from '../../../../content/visuals';

import pysparkNotebookJson from '../generated/pyspark-partitions.notebook.json';
import sqlNotebookJson from '../generated/sql-where.notebook.json';

const importedSqlNotebook = sqlNotebookJson as NotebookSpec;
export const pysparkNotebook = pysparkNotebookJson as NotebookSpec;

export const pythonNotebook: NotebookSpec = {
  id: 'notebook.dubreu.python-lists',
  title: 'Transform a list without losing intent',
  language: 'python',
  sourceIds: ['source.dubreu.original-fixtures'],
  runtimeTargetIds: ['runtime.dubreu.download-python', 'runtime.dubreu.colab-python'],
  provenance: {
    sourceFile: 'examples/notebooks/dubreu_python_lists_reference.py',
    sourceSha256: '4c1bff45c417901f89d63444b7642f2526b0b4dd5c983fafe48ee6f876d4a3d6',
    importerVersion: '2.0.0',
    notebookFormat: 4,
    notebookFormatMinor: 5,
    sourceId: 'source.dubreu.original-fixtures',
    license: { id: 'CC0-1.0', name: 'Original V2 representative fixture' },
  },
  cells: [
    {
      id: 'notebook.dubreu.python-lists.cell.objective',
      type: 'markdown',
      markdown: '# Keep the useful values\nA list comprehension expresses the filter and transformation in one readable statement.',
      sourceCellId: 'objective',
      sourceIndex: 0,
    },
    {
      id: 'notebook.dubreu.python-lists.cell.example',
      type: 'code',
      language: 'python',
      source: 'amounts = [14, 0, 28, -3, 45]\npositive_doubled = [amount * 2 for amount in amounts if amount > 0]',
      editable: false,
      execution: 'none',
      sourceCellId: 'example',
      sourceIndex: 1,
      referenceOutputIds: ['notebook.dubreu.python-lists.cell.example.output'],
    },
    {
      id: 'notebook.dubreu.python-lists.cell.example.output',
      type: 'text-output',
      text: '[28, 56, 90]',
      format: 'plain',
      source: 'reference',
      sourceCellId: 'example',
      sourceIndex: 1,
    },
    {
      id: 'notebook.dubreu.python-lists.cell.exercise',
      type: 'exercise',
      language: 'python',
      starter: 'names = [" Ada ", "", " Grace "]\nclean_names = # strip non-empty names',
      hints: ['Filter with `if name.strip()` after the expression.'],
      solution: 'names = [" Ada ", "", " Grace "]\nclean_names = [name.strip() for name in names if name.strip()]',
      explanation: 'The same normalized value can drive both the emitted value and the predicate.',
      execution: 'none',
      sourceCellId: 'exercise',
      sourceIndex: 2,
    },
  ],
};

const products: TableData = {
  id: 'dubreu-products',
  columns: [
    { id: 'product_id', label: 'Product ID', role: 'key' },
    { id: 'active', label: 'Active' },
    { id: 'price', label: 'Price', dataType: 'number' },
  ],
  rows: [
    { id: 'product-101', values: { product_id: 101, active: true, price: 42 } },
    { id: 'product-102', values: { product_id: 102, active: false, price: 18 } },
    { id: 'product-103', values: { product_id: 103, active: true, price: 67 } },
    { id: 'product-104', values: { product_id: 104, active: true, price: 31 } },
  ],
};

const productSourceState = compileTableState(products, 'dubreu-products:source');
const productFilterState = compileTableFilter(products, {
  operator: 'and',
  predicates: [
    { columnId: 'active', operator: 'eq', value: true },
    { columnId: 'price', operator: 'lt', value: 50 },
  ],
}, 'dubreu-products:active-under-50');

export const sqlFilterFigure: FigureSpec = {
  id: 'figure.dubreu.sql-filter-stable-rows',
  kind: 'concept',
  rendererId: 'table.transform',
  title: 'A filter changes membership, not identity',
  subtitle: 'Stable row IDs survive the WHERE predicate',
  takeaway: 'Rows 101 and 104 remain the same semantic objects after filtering.',
  spec: toCanonicalJsonValue({
    kind: 'table',
    version: '2',
    id: 'scene.dubreu.sql-filter',
    title: 'Products before and after WHERE',
    description: 'A two-frame semantic table transform.',
    frames: [productSourceState, productFilterState],
  }),
  sourceIds: ['source.dubreu.original-fixtures'],
  conceptIds: ['concept.sql.where', 'concept.identity.stable'],
  featureIds: ['feature.course.sql-filter'],
  verifiedAt: '2026-09-04',
  status: 'local-reference',
  fallbackText: 'Four products are shown initially. Filtering to active products below 50 keeps products 101 and 104 with their original stable row identities.',
  reducedMotionState: 1,
  staticState: 1,
  profile: 'professional',
};

export const sqlNotebook: NotebookSpec = {
  ...importedSqlNotebook,
  cells: [
    ...importedSqlNotebook.cells.slice(0, 1).map(cell => cell.id === 'notebook.dubreu.sql-where.cell.where-objective' && cell.type === 'markdown'
      ? { ...cell, markdown: '# Filter rows with `WHERE`\nUse a predicate to retain only the rows that answer the question.' }
      : cell),
    {
      id: 'notebook.dubreu.sql-where.cell.figure-introduction',
      type: 'markdown',
      markdown: '## See what the predicate changes\nThe semantic figure keeps row identity visible before and after the filter.',
      tags: ['editorial', 'conceptmotion'],
    },
    {
      id: 'notebook.dubreu.sql-where.cell.figure',
      type: 'figure',
      figureId: sqlFilterFigure.id,
      tags: ['editorial', 'conceptmotion'],
    },
    ...importedSqlNotebook.cells.slice(1),
  ],
  metadata: toCanonicalJsonValue({
    importedSourceSha256: importedSqlNotebook.provenance.sourceSha256,
    editorialOverrides: [{ cellId: 'notebook.dubreu.sql-where.cell.where-objective', reason: 'Public introduction uses Formation-neutral wording; the imported source is preserved unchanged.' }],
    editorialEnhancements: ['notebook.dubreu.sql-where.cell.figure-introduction', 'notebook.dubreu.sql-where.cell.figure'],
  }),
};

export const advancedSqlNotebook: NotebookSpec = {
  id: 'notebook.dubreu.sql-window',
  title: 'Rank orders within each customer',
  language: 'sql',
  sourceIds: ['source.dubreu.original-fixtures'],
  runtimeTargetIds: ['runtime.dubreu.download-sql-window'],
  provenance: {
    sourceFile: 'examples/notebooks/dubreu_sql_window_reference.sql',
    sourceSha256: '3989edf99e7996ce9bce7862c43973be064f6df24d558b66199c0d599c3504d8',
    importerVersion: '2.0.0-editorial',
    notebookFormat: 1,
    sourceId: 'source.dubreu.original-fixtures',
    license: { id: 'CC0-1.0', name: 'Original V2 representative fixture' },
  },
  cells: [
    {
      id: 'notebook.dubreu.sql-window.cell.context',
      type: 'markdown',
      markdown: '## Keep detail rows while adding rank\nKeep every detail row, then assign a deterministic row number inside each customer partition.',
      sourceIndex: 0,
    },
    {
      id: 'challenge.dubreu.sql-window',
      type: 'exercise',
      language: 'sql',
      starter: 'SELECT\n  order_id,\n  customer_id,\n  amount,\n  -- add the window expression as amount_rank\nFROM orders;',
      hints: [
        'Start with `ROW_NUMBER() OVER (...)` so detail rows remain visible.',
        'Partition by `customer_id`, then order each partition by `amount DESC`.',
      ],
      solution: 'SELECT\n  order_id,\n  customer_id,\n  amount,\n  ROW_NUMBER() OVER (\n    PARTITION BY customer_id\n    ORDER BY amount DESC\n  ) AS amount_rank\nFROM orders;',
      explanation: 'A window adds a per-customer rank without the row collapse caused by GROUP BY. The reference is compared as text; it is not executed.',
      execution: 'none',
      sourceIndex: 1,
    },
  ],
};

export const runtimeTargets: readonly RuntimeTarget[] = [
  {
    id: 'runtime.dubreu.download-python',
    kind: 'download',
    label: 'Python reference',
    description: 'Downloads an original fixture. It does not execute in this site.',
    downloadPath: '/notebooks/dubreu_python_lists_reference.py',
    executesExternally: false,
  },
  {
    id: 'runtime.dubreu.download-sql',
    kind: 'download',
    label: 'SQL notebook',
    description: 'Downloads the exact original fixture imported for this lesson.',
    downloadPath: '/notebooks/dubreu_sql_where_reference.ipynb',
    executesExternally: false,
  },
  {
    id: 'runtime.dubreu.download-sql-window',
    kind: 'download',
    label: 'Advanced SQL reference',
    description: 'Downloads the original comparison fixture. It is not executed in this site.',
    downloadPath: '/notebooks/dubreu_sql_window_reference.sql',
    executesExternally: false,
  },
  {
    id: 'runtime.dubreu.download-pyspark',
    kind: 'download',
    label: 'PySpark notebook',
    description: 'Downloads source for use in an environment you configure. No Spark runtime is included.',
    downloadPath: '/notebooks/dubreu_pyspark_partition_reference.ipynb',
    executesExternally: false,
  },
  {
    id: 'runtime.dubreu.colab-python',
    kind: 'colab',
    label: 'Colab',
    description: 'Opens Google Colab. You remain responsible for uploading the fixture and running it there.',
    url: 'https://colab.research.google.com/',
    runtimeRequirements: ['Google account may be required', 'External service and runtime'],
    executesExternally: true,
  },
];

const foundationCourses: readonly CourseSpec[] = [
  {
    id: 'course.dubreu.python',
    title: 'Python',
    summary: 'Compact notebook lessons for readable transformations.',
    tags: ['foundations', 'python'],
    sourceIds: ['source.dubreu.original-fixtures'],
    runtimeTargetIds: ['runtime.dubreu.download-python', 'runtime.dubreu.colab-python'],
    modules: [{
      id: 'module.dubreu.python-foundations',
      title: 'Python foundations',
      lessons: [{
        id: 'lesson.dubreu.python-lists',
        title: 'List transformations',
        summary: 'Filter and transform a list in one intentional expression.',
        objectives: ['Recognize the expression, source iterable, and predicate.'],
        conceptIds: ['concept.python.comprehension'],
        notebookId: pythonNotebook.id,
        sourceIds: ['source.dubreu.original-fixtures'],
        runtimeTargetIds: ['runtime.dubreu.download-python', 'runtime.dubreu.colab-python'],
      }],
    }],
  },
  {
    id: 'course.dubreu.sql',
    title: 'SQL Course',
    summary: 'Queries, predicates, grouping, and joins organized as lessons.',
    tags: ['course', 'sql'],
    sourceIds: ['source.dubreu.synthetic-sql'],
    runtimeTargetIds: ['runtime.dubreu.download-sql'],
    modules: [{
      id: 'module.dubreu.sql-querying',
      title: 'Query and filter',
      lessons: [{
        id: 'lesson.dubreu.sql-where',
        title: 'Filter rows with WHERE',
        summary: 'Keep the rows that satisfy two predicates while preserving stable IDs.',
        objectives: ['Combine predicates with AND.', 'Explain which rows remain and why.'],
        conceptIds: ['concept.sql.where', 'concept.identity.stable'],
        notebookId: sqlNotebook.id,
        figureIds: [sqlFilterFigure.id],
        assessmentIds: ['assessment.dubreu.sql-practice'],
        sourceIds: ['source.dubreu.synthetic-sql', 'source.dubreu.original-fixtures'],
        runtimeTargetIds: ['runtime.dubreu.download-sql'],
      }],
    }],
  },
  {
    id: 'course.dubreu.sql-advanced',
    title: 'SQL Advanced',
    summary: 'CTEs, CASE, grouping sets, and window functions with guided compare steps.',
    tags: ['advanced', 'sql'],
    sourceIds: ['source.dubreu.original-fixtures'],
    runtimeTargetIds: ['runtime.dubreu.download-sql-window'],
    modules: [{
      id: 'module.dubreu.sql-analytics',
      title: 'Analytic SQL',
      lessons: [{
        id: 'lesson.dubreu.sql-window',
        title: 'Rank within a group',
        summary: 'Use a window rather than collapsing detail rows.',
        objectives: ['Partition rows before ranking.', 'Compare the draft with a reference solution.'],
        conceptIds: ['concept.sql.window'],
        notebookId: advancedSqlNotebook.id,
        sourceIds: ['source.dubreu.original-fixtures'],
        runtimeTargetIds: ['runtime.dubreu.download-sql-window'],
      }],
    }],
  },
  {
    id: 'course.dubreu.pyspark',
    title: 'PySpark',
    summary: 'Display and explanation of distributed transformations; execution stays external.',
    tags: ['display-only', 'pyspark'],
    sourceIds: ['source.dubreu.synthetic-pyspark'],
    runtimeTargetIds: ['runtime.dubreu.download-pyspark'],
    modules: [{
      id: 'module.dubreu.pyspark-shuffles',
      title: 'Partitions and shuffles',
      lessons: [{
        id: 'lesson.dubreu.pyspark-partitions',
        title: 'Understand partition movement',
        summary: 'Read a groupBy example and distinguish saved output from a fresh run.',
        objectives: ['Explain why a wide transformation can move records.'],
        conceptIds: ['concept.pyspark.partition', 'concept.pyspark.shuffle'],
        notebookId: pysparkNotebook.id,
        sourceIds: ['source.dubreu.synthetic-pyspark'],
        runtimeTargetIds: ['runtime.dubreu.download-pyspark'],
      }],
    }],
  },
];

export const courses: readonly CourseSpec[] = foundationCourses.map(course => ({ ...course, modules: [...course.modules, ...reasoningCourseModule(course.id)] }));

export const questions: readonly QuestionSpec[] = [
  {
    id: 'question.dubreu.where-predicate',
    type: 'single-choice',
    prompt: 'Which clause keeps only active products priced below 50?',
    options: [
      { id: 'option.where.correct', label: 'WHERE active = TRUE AND price < 50' },
      { id: 'option.where.or', label: 'WHERE active = TRUE OR price < 50' },
      { id: 'option.where.group', label: 'GROUP BY active, price' },
    ],
    correctOptionId: 'option.where.correct',
    explanation: 'AND requires both predicates to be true for the row to remain.',
    conceptIds: ['concept.sql.where'],
    domain: 'sql',
    difficulty: 'beginner',
    sourceIds: ['source.dubreu.original-fixtures'],
  },
  {
    id: 'question.dubreu.saved-output',
    type: 'true-false',
    prompt: 'The PySpark output shown in this site proves that Spark ran in your browser just now.',
    correct: false,
    explanation: 'The output is saved source evidence. This consumer does not ship a Spark runtime or kernel.',
    conceptIds: ['concept.pyspark.runtime-boundary'],
    domain: 'pyspark',
    difficulty: 'beginner',
    sourceIds: ['source.dubreu.original-fixtures'],
  },
  {
    id: 'question.dubreu.window-choice',
    type: 'code-choice',
    prompt: 'Which expression ranks orders within each customer?',
    language: 'sql',
    options: [
      { id: 'option.window.correct', label: 'Partition then order', code: 'ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC)' },
      { id: 'option.window.group', label: 'Collapse with grouping', code: 'ROW_NUMBER() GROUP BY customer_id, amount' },
    ],
    correctOptionId: 'option.window.correct',
    explanation: 'The OVER clause defines the per-customer window while retaining detail rows.',
    conceptIds: ['concept.sql.window'],
    domain: 'sql-advanced',
    difficulty: 'intermediate',
    sourceIds: ['source.dubreu.original-fixtures'],
  },
];

export const sqlPracticeAssessment: AssessmentSpec = {
  id: 'assessment.dubreu.sql-practice',
  title: 'SQL and runtime-boundary practice',
  mode: 'practice',
  questionIds: questions.map((question) => question.id),
  passingScore: 67,
  tags: ['practice', 'qcm'],
  conceptIds: ['concept.sql.where', 'concept.sql.window', 'concept.pyspark.runtime-boundary'],
  sourceIds: ['source.dubreu.original-fixtures'],
};

export const dubreuContentCatalog: ContentCatalog = assertValidContentCatalog({
  version: '2',
  sources: [
    ...reasoningSources,
    ...visualSources,
    {
      id: 'source.dubreu.original-fixtures',
      title: 'Datapass V2 original representative fixtures',
      attribution: 'Created for the V2 implementation; not extracted from the private Dubreu course corpus.',
      license: { id: 'CC0-1.0', name: 'CC0 1.0' },
    },
    {
      id: 'source.dubreu.synthetic-sql',
      title: 'Original deterministic SQL IPYNB fixture',
      attribution: 'Datapass V2 implementation fixture.',
      license: { id: 'CC0-1.0', name: 'CC0 1.0' },
    },
    {
      id: 'source.dubreu.synthetic-pyspark',
      title: 'Original deterministic PySpark IPYNB fixture',
      attribution: 'Datapass V2 implementation fixture.',
      license: { id: 'CC0-1.0', name: 'CC0 1.0' },
    },
  ],
  figures: [sqlFilterFigure, ...migratedFigures],
  notebooks: [pythonNotebook, sqlNotebook, advancedSqlNotebook, pysparkNotebook],
  courses,
  assessments: [sqlPracticeAssessment, ...reasoningModules.map(module => module.assessment)],
  questions: [...questions, ...reasoningModules.flatMap(module => module.questions)],
  runtimeTargets,
});

export const lessons = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons));

export function courseById(id: string) {
  return courses.find((course) => course.id === id);
}

export function lessonById(id: string) {
  return lessons.find((lesson) => lesson.id === id);
}

export function notebookById(id: string | undefined) {
  return dubreuContentCatalog.notebooks?.find((notebook) => notebook.id === id);
}

export function runtimeTargetsByIds(ids: readonly string[] | undefined) {
  return runtimeTargets.filter((target) => ids?.includes(target.id));
}
