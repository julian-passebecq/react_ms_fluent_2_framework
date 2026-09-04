import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { toCanonicalJsonValue } from '../packages/core/src/index';
import type {
  AssessmentSpec,
  FigureSpec,
  NotebookSpec,
  QuestionSpec,
} from '../packages/content/src/index';
import { CodeDiff, CodeEditor } from '../packages/code/src/index';
import { FigureView } from '../packages/figure/src/index';
import { AssessmentRunner, NotebookLesson, ProgressSummary } from '../packages/learning/src/index';
import type { ProgressStateV2 } from '../packages/progress/src/index';
import {
  ChallengeShell,
  ChangeImpactPanel,
  DocsNavigation,
  FeatureStatusBadge,
  FreshnessBadge,
  KnowledgeHeader,
  KnowledgeShell,
  OnThisPage,
  PageHeader,
  RelatedKnowledge,
  SourceList,
  VersionBadge,
  WorkflowWorkbenchShell,
  resolveLocalizedText,
} from '../packages/ui/src/index';
import { challengeCatalog } from '../apps/studio/src/data/challengeFixtures';
import {
  knowledgeSources,
  runtimeChangeEvent,
  runtimeFreshness,
  runtimeKnowledgeEntry,
} from '../apps/studio/src/data/knowledgeFixtures';
import { workflowFixture } from '../apps/studio/src/data/diagramFixtures';
import { tableSceneSpec } from '../apps/studio/src/data/semanticFixtures';

const meta = {
  title: 'Foundation/Product surfaces',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const challenge = challengeCatalog[0];
const sqlVariant = challenge.variants[0];

type ChallengeMode = 'code' | 'solution' | 'compare';

function ChallengeSurface({ showHint = false, mode = 'code' }: { showHint?: boolean; mode?: ChallengeMode }) {
  const [value, setValue] = useState(sqlVariant.starter);
  const modeLabel = mode === 'code' ? sqlVariant.label : mode === 'solution' ? 'Reference solution' : 'Learner / reference diff';
  return (
    <ChallengeShell
      header={(
        <PageHeader
          eyebrow={`${challenge.domain} · ${challenge.difficulty}`}
          title={challenge.title}
          description={challenge.summary}
          metadata={<FeatureStatusBadge status="preview" />}
        />
      )}
      catalog={(
        <ul className="gallery-doc-list">
          <li><a href="#customer-rank" aria-current="page">Customer rank</a></li>
          <li><a href="#even-values">Even values</a></li>
          <li><a href="#late-records">Late records</a></li>
        </ul>
      )}
      leftTabs={<span>Problem</span>}
      leftPane={(
        <div className="gallery-stack">
          <section>
            <h2>Schema</h2>
            <pre>{challenge.schema}</pre>
          </section>
          <section>
            <h2>Expected output</h2>
            <p>{challenge.expectedOutput}</p>
          </section>
          {showHint ? (
            <section className="gallery-panel" aria-labelledby="challenge-hint-heading">
              <h2 id="challenge-hint-heading">Hint 1 of {challenge.hints.length}</h2>
              <p>{challenge.hints[0]}</p>
            </section>
          ) : null}
        </div>
      )}
      rightTabs={<span>{modeLabel}</span>}
      rightPane={(
        <div className="gallery-code-frame">
          {mode === 'compare' ? (
            <CodeDiff
              ariaLabel="SQL learner draft and reference solution comparison"
              language={sqlVariant.monacoLanguage}
              original={value}
              modified={sqlVariant.solution}
              originalPath="gallery/challenge-customer-rank.draft.sql"
              modifiedPath="gallery/challenge-customer-rank.reference.sql"
              readOnly
              height="100%"
            />
          ) : (
            <CodeEditor
              ariaLabel={mode === 'solution' ? 'SQL reference solution' : 'SQL challenge workspace'}
              language={sqlVariant.monacoLanguage}
              value={mode === 'solution' ? sqlVariant.solution : value}
              onChange={mode === 'code' ? setValue : undefined}
              path={mode === 'solution'
                ? 'gallery/challenge-customer-rank.reference.sql'
                : 'gallery/challenge-customer-rank.sql'}
              readOnly={mode === 'solution'}
              height="100%"
            />
          )}
        </div>
      )}
      bottomPanel={<p>Static guidance only. This workspace does not execute SQL.</p>}
    />
  );
}

const workflowFigure: FigureSpec = {
  id: 'figure.gallery.workflow-workbench',
  kind: 'workflow',
  rendererId: 'workflow.run',
  title: 'Sales medallion refresh',
  subtitle: 'The same semantic model supports Airflow, Fabric/ADF, and Lakeflow presentations.',
  spec: toCanonicalJsonValue(workflowFixture),
  sourceIds: ['source.gallery.local-fixtures'],
  featureIds: ['feature.workflow.semantic-model'],
  verifiedAt: '2026-09-04T10:00:00Z',
  fallbackText: 'A provider-neutral workflow from order extraction through quality checks, silver transformation, gold publication, and owner notification.',
  staticState: 5,
};

const notebookFigure: FigureSpec = {
  id: 'figure.gallery.sql-stable-row-context',
  kind: 'concept',
  rendererId: 'table.transform',
  title: 'Track the same rows through a transformation',
  subtitle: 'Stable row identities make changes in grain and order inspectable.',
  takeaway: 'Read the row grain before interpreting a derived value.',
  spec: toCanonicalJsonValue(tableSceneSpec),
  sourceIds: ['source.gallery.local-notebook'],
  conceptIds: ['concept.sql.row-grain'],
  verifiedAt: '2026-09-04T10:00:00Z',
  fallbackText: 'A deterministic table transformation keeps surviving row identities stable while rows are filtered and sorted.',
  staticState: 2,
  reducedMotionState: 2,
};

const notebookLesson: NotebookSpec = {
  id: 'notebook.gallery.sql-window-basics',
  title: { en: 'SQL window functions retain row grain', no: 'SQL-vindusfunksjoner beholder radnivået' },
  language: 'sql',
  provenance: {
    sourceFile: 'examples/notebooks/sql-window-basics.ipynb',
    sourceSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    importerVersion: '2.0.0',
    notebookFormat: 4,
    notebookFormatMinor: 5,
    sourceId: 'source.gallery.local-notebook',
  },
  sourceIds: ['source.gallery.local-notebook'],
  cells: [
    {
      id: 'cell.window-introduction',
      type: 'markdown',
      markdown: '## Add context without collapsing rows\n\nA window aggregate calculates across related rows while preserving every order.',
      sourceIndex: 0,
    },
    {
      id: 'cell.window-query',
      type: 'code',
      language: 'sql',
      source: 'SELECT\n  order_id,\n  customer_id,\n  amount,\n  SUM(amount) OVER (PARTITION BY customer_id) AS customer_total\nFROM orders;',
      execution: 'none',
      editable: false,
      referenceOutputIds: ['cell.window-output'],
      sourceIndex: 1,
    },
    {
      id: 'cell.window-figure',
      type: 'figure',
      figureId: notebookFigure.id,
      sourceIndex: 1,
    },
    {
      id: 'cell.window-output',
      type: 'table-output',
      columns: ['order_id', 'customer_id', 'amount', 'customer_total'],
      rows: [
        ['O11', 'C1', 125, 335],
        ['O12', 'C1', 210, 335],
        ['O13', 'C3', 90, 90],
      ],
      source: 'reference',
      sourceIndex: 1,
    },
    {
      id: 'cell.window-takeaway',
      type: 'callout',
      tone: 'tip',
      title: 'Read the grain first',
      content: 'The result still has one row per order; the customer total is contextual information.',
      sourceIndex: 2,
    },
  ],
};

const assessment: AssessmentSpec = {
  id: 'assessment.gallery.sql-window-check',
  title: 'Window function check',
  mode: 'practice',
  questionIds: ['question.window-grain', 'question.partition'],
  passingScore: 50,
  conceptIds: ['concept.sql.window'],
  sourceIds: ['source.gallery.local-notebook'],
};

const assessmentQuestions: readonly QuestionSpec[] = [
  {
    id: 'question.window-grain',
    type: 'single-choice',
    prompt: 'What happens to row grain when an aggregate is used as a window function?',
    options: [
      { id: 'option.preserved', label: 'The original row grain is preserved.' },
      { id: 'option.collapsed', label: 'Rows collapse to one per partition.' },
      { id: 'option.duplicated', label: 'Every row is duplicated.' },
    ],
    correctOptionId: 'option.preserved',
    explanation: 'A window calculation adds context to each row without grouping the result set.',
    domain: 'SQL analytics',
    conceptIds: ['concept.sql.window'],
  },
  {
    id: 'question.partition',
    type: 'true-false',
    prompt: 'PARTITION BY restarts the window calculation for each partition.',
    correct: true,
    explanation: 'Each customer partition receives its own aggregate in this lesson.',
    domain: 'SQL analytics',
    conceptIds: ['concept.sql.partition'],
  },
];

const progressSnapshot: ProgressStateV2 = {
  schemaVersion: 2,
  lessons: {
    'lesson.sql.window-basics': {
      id: 'lesson.sql.window-basics',
      courseId: 'course.sql',
      status: 'completed',
      completed: true,
      completedAt: '2026-09-04T10:00:00Z',
    },
    'lesson.sql.ranking': {
      id: 'lesson.sql.ranking',
      courseId: 'course.sql',
      status: 'in-progress',
      completed: false,
      recentPosition: { sectionId: 'dense-rank' },
    },
  },
  challenges: {
    'challenge.customer-rank': {
      id: 'challenge.customer-rank',
      status: 'completed',
      drafts: { sql: sqlVariant.solution },
      mastered: true,
      review: false,
      flagged: false,
    },
    'challenge.window-frame': {
      id: 'challenge.window-frame',
      status: 'in-progress',
      drafts: {},
      mastered: false,
      review: true,
      flagged: false,
    },
  },
  assessments: {
    'assessment.gallery.sql-window-check': {
      id: 'assessment.gallery.sql-window-check',
      attempts: [
        {
          id: 'attempt.gallery.sql-window-check.1',
          assessmentId: 'assessment.gallery.sql-window-check',
          status: 'submitted',
          submittedAt: '2026-09-04T10:00:00Z',
          answers: {
            'question.window-grain': {
              questionId: 'question.window-grain',
              value: 'option.preserved',
              correct: true,
              pointsEarned: 1,
              pointsPossible: 1,
              domainIds: ['SQL analytics'],
              conceptIds: ['concept.sql.window'],
            },
            'question.partition': {
              questionId: 'question.partition',
              value: false,
              correct: false,
              pointsEarned: 0,
              pointsPossible: 1,
              domainIds: ['SQL analytics'],
              conceptIds: ['concept.sql.partition'],
            },
          },
          score: { earned: 1, possible: 2, percent: 50, passed: true },
        },
      ],
    },
  },
};

function KnowledgeArticle({ changed = false }: { changed?: boolean }) {
  const sourceItems = knowledgeSources.map((source) => ({
    id: source.id,
    title: resolveLocalizedText(source.title, 'en'),
    href: source.url ?? '#source-unavailable',
    publisher: source.vendor,
    authority: source.authority,
    detail: `Verified ${source.lastVerifiedAt?.slice(0, 10)}`,
  }));

  return (
    <KnowledgeShell
      header={(
        <KnowledgeHeader
          eyebrow="Knowledge Atlas"
          title={resolveLocalizedText(runtimeKnowledgeEntry.title, 'en')}
          description={resolveLocalizedText(runtimeKnowledgeEntry.summary, 'en')}
          status={<FeatureStatusBadge status={runtimeKnowledgeEntry.status ?? 'unknown'} />}
          version={<VersionBadge version="1.3 / 2.0" />}
          freshness={<FreshnessBadge state={changed ? runtimeFreshness : 'current'} />}
          verifiedAt={runtimeKnowledgeEntry.verifiedAt?.slice(0, 10) ?? 'Unknown'}
        />
      )}
      navigation={(
        <DocsNavigation title="Fabric foundations">
          <ul className="gallery-doc-list">
            <li><a href="#runtime" aria-current="page">Runtime boundaries</a></li>
            <li><a href="#medallion">Medallion architecture</a></li>
            <li><a href="#compatibility">Compatibility review</a></li>
          </ul>
        </DocsNavigation>
      )}
      article={(
        <div className="gallery-article">
          <section id="overview">
            <h2>Overview</h2>
            <p>Durable lakehouse data and the runtime that transforms it have different lifecycles. Treat runtime changes as reviewed dependency changes.</p>
          </section>
          <section id="mental-model">
            <h2>Mental model</h2>
            <p>Record an explicit runtime version, verify workload compatibility, and keep rollback choices visible before changing a workspace default.</p>
          </section>
          <SourceList sources={sourceItems} />
          <RelatedKnowledge>
            <a href="#medallion">OneLake medallion architecture</a>
          </RelatedKnowledge>
        </div>
      )}
      onThisPage={(
        <OnThisPage metadata={<FreshnessBadge state={changed ? runtimeFreshness : 'current'} />}>
          <ul className="gallery-doc-list">
            <li><a href="#overview">Overview</a></li>
            <li><a href="#mental-model">Mental model</a></li>
            <li><a href="#sources">Sources</a></li>
          </ul>
        </OnThisPage>
      )}
      changePanel={changed ? (
        <ChangeImpactPanel
          summary={resolveLocalizedText(runtimeChangeEvent.evidence, 'en')}
          impactedItems={[
            'knowledge.fabric.runtime-boundaries',
            'feature.fabric.runtime',
          ]}
          action={<a href={runtimeChangeEvent.url}>Review source</a>}
        />
      ) : undefined}
    />
  );
}

export const ChallengeDefault: Story = {
  render: () => <ChallengeSurface />,
};

export const ChallengeHints: Story = {
  render: () => <ChallengeSurface showHint />,
};

export const ChallengeSolution: Story = {
  render: () => <ChallengeSurface mode="solution" />,
};

export const ChallengeDiff: Story = {
  render: () => <ChallengeSurface mode="compare" />,
};

export const WorkflowRunState: Story = {
  render: () => (
    <WorkflowWorkbenchShell
      header={(
        <PageHeader
          eyebrow="Workflow semantics"
          title="Sales refresh run"
          description="Dependency, data, success, and failure channels remain semantically distinct."
        />
      )}
      modeTabs={<span>Run view · frame 5</span>}
      toolbar={<button className="gallery-toolbar-button" type="button">Fit workflow</button>}
      breadcrumb={<span>Sales refresh / Quality checks</span>}
      canvas={<FigureView figure={workflowFigure} frameIndex={5} reducedMotion minimumHeight="29rem" />}
      inspector={(
        <div className="gallery-panel gallery-inspector">
          <h2>Build silver</h2>
          <dl>
            <dt>Status</dt><dd>Success</dd>
            <dt>Type</dt><dd>PySpark notebook</dd>
            <dt>Attempts</dt><dd>1</dd>
          </dl>
        </div>
      )}
      bottomPanel={<p>Run state is a deterministic local fixture; no pipeline executes from this surface.</p>}
    />
  ),
};

export const KnowledgeCurrent: Story = {
  render: () => <KnowledgeArticle />,
};

export const KnowledgeNeedsReview: Story = {
  render: () => <KnowledgeArticle changed />,
};

export const ImportedNotebookLesson: Story = {
  render: () => (
    <NotebookLesson
      notebook={notebookLesson}
      figures={[notebookFigure]}
      reducedMotion
      codeHeight="14rem"
      beforeCells={<FeatureStatusBadge status="preview" />}
    />
  ),
};

export const AssessmentAndLocalProgress: Story = {
  render: () => (
    <div className="gallery-stack">
      <ProgressSummary
        state={progressSnapshot}
        lessonIds={['lesson.sql.window-basics', 'lesson.sql.ranking']}
        challengeIds={['challenge.customer-rank', 'challenge.window-frame']}
        assessmentIds={[assessment.id]}
      />
      <AssessmentRunner
        assessment={assessment}
        questions={assessmentQuestions}
        initialAnswers={{
          'question.window-grain': 'option.preserved',
          'question.partition': false,
        }}
        attemptId="attempt.gallery.sql-window-check.new"
        reducedMotion
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Submit assessment' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('1 / 2');
    await expect(canvas.getByText('50%')).toBeVisible();
  },
};
