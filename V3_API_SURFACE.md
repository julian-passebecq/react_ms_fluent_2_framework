# V3 API surface

V3 is an additive workspace release, not an npm publication. Existing V1.1/V2 exports and stable content IDs remain available. Paths below are relative to `project/conceptmotion_studio`.

## Pure semantic additions

| Boundary | Additions | Contract |
| --- | --- | --- |
| `@conceptmotion/core` | `DiagramLayoutSpec.provider`, `hubId`; `radialDiagramLayout`, `layeredDiagramLayout`, `layoutDiagram` | Pure deterministic node/group bounds and edge routes. No React, DOM, Fluent or browser measurement. Omitted provider preserves old geometry. |
| `@datapass/content` | `ChallengeDefinition`, `ChallengeVariant`, `ChallengeLanguage`, `PracticeItem`, `PracticeCatalog`, `PracticeTrack`, `PracticeSource`, `PracticeCheatSheet` | Serializable practice data; source IDs/commit/collection and original pedagogy metadata retained. `execution: 'none'` is explicit. |
| `@datapass/content` | `validateChallenge`, `assertValidChallenge`, `importTrainerSnapshot`, `createPublicPracticeCatalog` | Structural validation, deterministic normalization and a public projection with opaque source IDs; no UI, filesystem, network, clocks or code execution. |
| `@datapass/content` | Project status `building` and `planned` | Additive values; old active/experimental/legacy/archived values remain accepted. |
| `@datapass/progress` | No schema rewrite | Existing V2 operations remain the shared progress semantics. Each app uses a separate persistence key. |
| `@datapass/scaffold` | Title escaping fix | User-provided quoted/brace titles emit a JSX string expression safely. Existing four presets remain deterministic. |

Example:

```tsx
import { radialDiagramLayout, type DiagramSpec } from '@conceptmotion/core';
const spec: DiagramSpec = {
  kind: 'diagram', version: '3', id: 'hub', title: 'Project dependencies',
  layout: { provider: 'radial', hubId: 'platform' },
  nodes: [{ id: 'platform', label: 'Platform' }, { id: 'formation', label: 'Formation' }],
  edges: [{ id: 'uses', from: { nodeId: 'formation' }, to: { nodeId: 'platform' }, flowKind: 'dependency' }],
};
const geometry = radialDiagramLayout.layout(spec);
```

Coordinates belong to the layout result, not the authored semantic spec. The new layouts are intentionally bounded deterministic layouts, not a general orthogonal router or force engine.

## Shared presentation

`@datapass/figure` exports `FigurePlayer`, `FigurePlayerProps` and `figureStepCount`. FigurePlayer extends the existing FigureView contract with captions, optional explicit step count, selection inspector and frame-change callback. It shares TimelineControls, respects reduced motion, preserves semantic selection IDs, and exports the actual current SVG. Unknown adapters retain FigureView's textual fallback; they do not advertise an export that cannot succeed. SVG filenames are sanitized.

`@datapass/learning` exports `ChallengeWorkbench`/`ChallengeWorkbenchProps`, composing the existing ChallengeShell with shared CodeEditor/CodeDiff and Figure. Its code/solution/compare tabs compare text only. Hints, variants, notes, flags and self-assessed progress do not imply execution or automated grading.

`usePracticeWorkspace`, `parsePracticeWorkspace`, `serializePracticeWorkspace` and `PracticeWorkspaceState` wrap the existing ProgressStateV2 in a schema-1 notes/backup envelope. Invalid stored bytes are protected; storage failures are visible. Formation's existing progress format and keys are not replaced.

```tsx
import { FigurePlayer } from '@datapass/figure';
import { visualById } from '../../content/visuals';
const lesson = visualById('sql-left-join')!;
<FigurePlayer figure={lesson.figure} captions={lesson.captions} reducedMotion />;
```

The content path is consumer-owned; it is deliberately not exported from a reusable package.

## Consumer content and local APIs

- `content/visuals`: `migratedVisuals`, `migratedFigures`, `visualById`, `figureForPracticeId`, `visualSources`, `VisualMigration`. Thirty shared artifacts with stable IDs and opaque dated attribution; full private-source pins remain in the nonbundled migration report.
- `content/practice/catalog.public.json`: deterministic publication artifact imported by consumers. Raw source records and repository names remain in the separate audit corpus, not the public module graph; the full 323 IDs and 500 variants are retained.
- `content/projects.ts`: canonical validated public registry and entry notes, backed by `projects.registry.json`. Studio's old data module re-exports compatibility names.
- Pilot's `state.ts`: schema-1 structured notes/overlays; bounded strict backup/overlay parsers, deterministic export, safe HTTP(S) links and protected recovery. These are consumer policy, not a new framework package.
- Studio's `parseSandboxFigure`: bounded JSON and production renderer validation, including semantic references. Invalid input retains the last valid preview; unsupported adapters intentionally exercise fallback.
- Architecture content preserves eight stage IDs across sixteen workload/provider translations. Provider names describe pinned references, not current availability verification.

## Compatibility

The former Studio challenge contract is re-exported from the shared content package. Existing fixtures and tests remain. Formation moves from `apps/dubreu-formation` to `apps/formation`; its lesson IDs, source downloads and progress keys remain stable. See [migration log](V3_MIGRATION_LOG.md) for this intentional filesystem change. No execution API, backend API, parser service or credential API was introduced.
