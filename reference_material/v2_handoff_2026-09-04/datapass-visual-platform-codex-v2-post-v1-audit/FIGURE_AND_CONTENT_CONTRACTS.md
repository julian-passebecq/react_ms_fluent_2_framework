# Figure and content contracts

## Why this is needed

V1.1 has a strong `FigureFrame` UI component and renderer registries, but no serializable application-level Figure object that can be referenced from Knowledge, Notebook, Course and Assessment content.

V2 should add a pure content contract without moving renderer algorithms into one package.

## Recommended pure package

Prefer a small pure TypeScript package such as `@datapass/content` (name may be adjusted to the existing repository conventions).

It must not depend on React, Fluent, Monaco, browser DOM, D3, Jupyter, Streamlit or provider APIs.

Do not refactor the stable v1.1 packages merely to share one alias. Structural compatibility of localized text is acceptable if a shared base package would create unnecessary churn.

## FigureSpec

Conceptual contract:

```ts
export type FigureKind =
  | 'concept'
  | 'diagram'
  | 'workflow'
  | 'lineage'
  | 'chart'
  | 'geo'
  | 'static';

export interface FigureSpec {
  id: string;
  kind: FigureKind;
  rendererId: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  takeaway?: LocalizedText;
  spec: JsonValue;
  sourceIds?: string[];
  conceptIds?: string[];
  featureIds?: string[];
  verifiedAt?: string;
  status?: string;
  fallbackText: LocalizedText;
  reducedMotionState?: string | number;
  staticState?: string | number;
  profile?: 'professional' | 'editorial' | 'sketch';
}
```

The exact JSON types may follow the existing deterministic serialization helpers.

## Figure renderer registry

Do not create one universal geometry engine.

The application-facing registry should map a Figure's `rendererId` to a React-capable adapter.

Conceptually:

```ts
interface FigureRendererAdapter<TSpec = unknown> {
  id: string;
  validate?(spec: unknown): ValidationResult;
  render(props: FigureRenderProps<TSpec>): ReactNode;
  exportStatic?(...): Promise<string | Blob> | string | Blob;
}
```

The existing ConceptMotion registry remains the SVG renderer registry. Add a thin bridge registration for its families rather than replacing it.

## Course and lesson contracts

```ts
interface CourseSpec {
  id: string;
  title: LocalizedText;
  summary?: LocalizedText;
  modules: CourseModule[];
  sourceIds?: string[];
  tags?: string[];
  runtimeTargets?: RuntimeTargetId[];
}

interface CourseModule {
  id: string;
  title: LocalizedText;
  lessons: LessonSpec[];
}

interface LessonSpec {
  id: string;
  title: LocalizedText;
  summary?: LocalizedText;
  objectives?: LocalizedText[];
  conceptIds?: string[];
  notebookId?: string;
  figureIds?: string[];
  challengeIds?: string[];
  assessmentIds?: string[];
  vocabularyTopicIds?: string[];
  sourceIds?: string[];
}
```

## NotebookSpec

Required cell families:

```ts
type NotebookCell =
  | MarkdownCell
  | CodeCell
  | TextOutputCell
  | TableOutputCell
  | ImageOutputCell
  | FigureCell
  | CalloutCell
  | ExerciseCell;
```

Recommended base fields:

```ts
interface NotebookCellBase {
  id: string;
  sourceCellId?: string;
  tags?: string[];
  sourceHash?: string;
}
```

Code cells:

```ts
interface CodeCell extends NotebookCellBase {
  type: 'code';
  language: string;
  source: string;
  editable?: boolean;
  execution: 'none' | 'external' | 'browser';
  referenceOutputIds?: string[];
}
```

V2 must not imply that an imported output is newly executed. Label saved outputs as source/reference output when needed.

## IDs and provenance

Imported content must have deterministic IDs derived from stable source identifiers, not array indexes alone.

Keep:

- source file name;
- source SHA-256;
- source cell ID if present;
- original cell index for debugging only;
- import timestamp/version;
- license/attribution metadata where known.

## Validation

Add structured validation for:

- duplicate IDs;
- broken figure/notebook/challenge/assessment references;
- missing required fallback text for figures;
- unknown cell types;
- invalid runtime target references;
- unsafe external URLs;
- missing source attribution when required by the imported source license.
