import { lazy, Suspense, type ReactNode } from 'react';
import type { CodeDiffProps, CodeEditorProps, JsonSpecEditorProps } from './types';

const LazyMonacoSurface = lazy(() => import('./MonacoSurfaces'));

function LoadingEditor({ ariaLabel, loading }: { ariaLabel: string; loading?: ReactNode }) {
  if (loading !== undefined) return <>{loading}</>;
  return (
    <div role="status" aria-live="polite" aria-label={ariaLabel}>
      Loading code editor…
    </div>
  );
}

export function CodeEditor(props: CodeEditorProps) {
  return (
    <Suspense fallback={<LoadingEditor ariaLabel={props.ariaLabel} loading={props.loading} />}>
      <LazyMonacoSurface kind="editor" editorProps={props} />
    </Suspense>
  );
}

export function CodeDiff(props: CodeDiffProps) {
  return (
    <Suspense fallback={<LoadingEditor ariaLabel={props.ariaLabel} loading={props.loading} />}>
      <LazyMonacoSurface kind="diff" diffProps={props} />
    </Suspense>
  );
}

export function JsonSpecEditor(props: JsonSpecEditorProps) {
  return (
    <Suspense fallback={<LoadingEditor ariaLabel={props.ariaLabel} loading={props.loading} />}>
      <LazyMonacoSurface kind="json" jsonProps={props} />
    </Suspense>
  );
}
