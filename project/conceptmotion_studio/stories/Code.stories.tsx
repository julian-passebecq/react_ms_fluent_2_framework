import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeDiff, CodeEditor, JsonSpecEditor } from '../packages/code/src/index';
import { CodeDiagnostics, PageHeader } from '../packages/ui/src/index';

const meta = {
  title: 'Foundation/Code',
  component: CodeEditor,
  parameters: { docs: { description: { component: 'Approved editor boundary: consumers use @datapass/code; Monaco remains lazy and centralized. These examples display/edit/compare code without execution.' } }, datapass: { guide: 'docs/AUTHORING_DX.md', sourceFiles: ['packages/code/src/index.ts'] } },
} satisfies Meta<typeof CodeEditor>;

export default meta;
type Story = StoryObj;

const starterSql = `WITH customer_totals AS (
  -- Keep customers without an order.
  SELECT c.customer_id, c.customer_name,
         COALESCE(SUM(o.amount), 0) AS order_total
  FROM customers AS c
  LEFT JOIN orders AS o
    ON o.customer_id = c.customer_id
  GROUP BY c.customer_id, c.customer_name
)
SELECT * FROM customer_totals;`;

const solutionSql = `WITH customer_totals AS (
  SELECT c.customer_id, c.customer_name,
         COALESCE(SUM(o.amount), 0) AS order_total
  FROM customers AS c
  LEFT JOIN orders AS o
    ON o.customer_id = c.customer_id
  GROUP BY c.customer_id, c.customer_name
)
SELECT *,
       DENSE_RANK() OVER (ORDER BY order_total DESC) AS value_rank
FROM customer_totals
ORDER BY value_rank, customer_id;`;

export const ReadOnlyPythonReference: Story = {
  render: () => (
    <div className="gallery-stack">
      <PageHeader
        eyebrow="Reference code"
        title="Display-only PySpark"
        description="The shared editor provides syntax display and explanation. It does not execute Spark or launch a kernel."
      />
      <div className="gallery-code-frame">
        <CodeEditor
          ariaLabel="Display-only PySpark reference"
          language="pyspark"
          value={'from pyspark.sql import functions as F\n\norders.groupBy("customer_id").agg(\n    F.sum("amount").alias("order_total")\n)'}
          path="gallery/display-only-pyspark.py"
          readOnly
          height="100%"
        />
      </div>
    </div>
  ),
};

export const SolutionDiff: Story = {
  render: () => (
    <div className="gallery-stack">
      <PageHeader
        eyebrow="Compare"
        title="Starter and revealed solution"
        description="Monaco is shared and lazy-loaded only when an editor or diff surface is requested."
      />
      <div className="gallery-code-frame">
        <CodeDiff
          ariaLabel="SQL starter and solution comparison"
          language="sql"
          original={starterSql}
          modified={solutionSql}
          originalPath="gallery/customer-rank.starter.sql"
          modifiedPath="gallery/customer-rank.solution.sql"
          readOnly
          height="100%"
        />
      </div>
    </div>
  ),
};

export const JsonValidationError: Story = {
  render: () => (
    <div className="gallery-stack">
      <PageHeader
        eyebrow="Contract diagnostics"
        title="Invalid figure specification"
        description="Local schema hooks and explicit diagnostics surface errors without a network call."
      />
      <div className="gallery-code-frame" data-compact="true">
        <JsonSpecEditor
          ariaLabel="Figure JSON specification with validation error"
          value={'{\n  "id": "figure.missing-renderer",\n  "kind": "concept"\n}'}
          path="gallery/invalid-figure.json"
          height="100%"
          diagnostics={[
            {
              severity: 'error',
              message: 'rendererId is required.',
              startLineNumber: 3,
              startColumn: 21,
              endLineNumber: 3,
              endColumn: 21,
              code: 'figure.renderer.required',
            },
          ]}
          schema={{
            uri: 'datapass://schemas/figure.gallery.json',
            schema: {
              type: 'object',
              required: ['id', 'kind', 'rendererId', 'fallbackText'],
              properties: {
                id: { type: 'string' },
                kind: { enum: ['concept', 'diagram', 'workflow', 'lineage', 'chart', 'geo', 'static'] },
                rendererId: { type: 'string', minLength: 1 },
                fallbackText: { type: 'string', minLength: 1 },
              },
            },
          }}
        />
      </div>
      <CodeDiagnostics
        diagnostics={[
          {
            id: 'renderer-required',
            severity: 'error',
            message: 'rendererId is required.',
            code: 'figure.renderer.required',
            source: '@datapass/content',
            line: 3,
            column: 21,
          },
        ]}
      />
    </div>
  ),
};

export const LazyLoadingContract: Story = {
  render: () => (
    <div className="gallery-stack">
      <PageHeader
        eyebrow="Lazy boundary"
        title="Editor loading fallback"
        description="On a cold route, this accessible status remains visible until the shared Monaco chunk resolves."
      />
      <div className="gallery-code-frame" data-compact="true">
        <CodeEditor
          ariaLabel="SQL editor loading boundary"
          language="sql"
          value="SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id;"
          path="gallery/lazy-boundary.sql"
          height="100%"
          readOnly
          loading={<div className="gallery-panel" role="status" aria-live="polite">Loading the shared code editor…</div>}
        />
      </div>
    </div>
  ),
};
