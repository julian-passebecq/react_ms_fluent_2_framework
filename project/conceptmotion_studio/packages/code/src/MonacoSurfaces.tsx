import Editor, { DiffEditor, type Monaco, type OnMount } from '@monaco-editor/react';
import { useEffect, useId, useRef } from 'react';
import type { editor } from 'monaco-editor';
import { resolveMonacoLanguage } from './languages';
import { ensureMonacoConfigured, jsonDefaults } from './monacoLoader';
import {
  mergeCodeDiffOptions,
  mergeCodeEditorOptions,
  resolveCodeTheme,
} from './options';
import type {
  CodeDiagnostic,
  CodeDiffProps,
  CodeEditorProps,
  CodeMarker,
  JsonSchemaHook,
  JsonSpecEditorProps,
} from './types';

ensureMonacoConfigured();

type MonacoSurfaceProps =
  | { readonly kind: 'editor'; readonly editorProps: CodeEditorProps }
  | { readonly kind: 'diff'; readonly diffProps: CodeDiffProps }
  | { readonly kind: 'json'; readonly jsonProps: JsonSpecEditorProps };

function markerSeverity(monaco: Monaco, severity: CodeDiagnostic['severity']) {
  if (severity === 'warning') return monaco.MarkerSeverity.Warning;
  if (severity === 'info') return monaco.MarkerSeverity.Info;
  if (severity === 'hint') return monaco.MarkerSeverity.Hint;
  return monaco.MarkerSeverity.Error;
}

function normalizeMarker(marker: CodeDiagnostic, monaco: Monaco): editor.IMarkerData {
  return {
    severity: markerSeverity(monaco, marker.severity),
    message: marker.message,
    startLineNumber: marker.startLineNumber ?? 1,
    startColumn: marker.startColumn ?? 1,
    endLineNumber: marker.endLineNumber ?? marker.startLineNumber ?? 1,
    endColumn: marker.endColumn ?? Math.max(2, (marker.startColumn ?? 1) + 1),
    code: marker.code,
    source: marker.source ?? '@datapass/code',
  };
}

function normalizeMonacoMarker(marker: editor.IMarker): CodeMarker {
  const severity = marker.severity === 8
    ? 'error'
    : marker.severity === 4
      ? 'warning'
      : marker.severity === 2
        ? 'info'
        : 'hint';
  return {
    severity,
    message: marker.message,
    startLineNumber: marker.startLineNumber,
    startColumn: marker.startColumn,
    endLineNumber: marker.endLineNumber,
    endColumn: marker.endColumn,
    code: typeof marker.code === 'string' ? marker.code : marker.code?.value,
    source: marker.source,
  };
}

const schemas = new Map<string, JsonSchemaHook & { readonly modelPath: string }>();

function applyJsonSchemas() {
  jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    schemas: [...schemas.values()].map(({ uri, schema, fileMatch, modelPath }) => ({
      uri,
      schema,
      fileMatch: fileMatch ? [...fileMatch] : [modelPath],
    })),
  });
}

function CodeEditorImplementation(props: CodeEditorProps) {
  return (
    <Editor
      height={props.height ?? '100%'}
      path={props.path}
      language={resolveMonacoLanguage(props.language)}
      value={props.value}
      onChange={(value) => props.onChange?.(value ?? '')}
      onValidate={(markers) => props.onValidate?.(markers.map(normalizeMonacoMarker))}
      theme={resolveCodeTheme(props.theme)}
      options={mergeCodeEditorOptions(props.ariaLabel, props.options, props.readOnly)}
      loading={props.loading}
    />
  );
}

function CodeDiffImplementation(props: CodeDiffProps) {
  const originalAriaLabel = `${props.ariaLabel}: original`;
  const modifiedAriaLabel = `${props.ariaLabel}: modified`;
  const ariaObserverCleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => () => ariaObserverCleanupRef.current(), []);

  function keepEditorTextboxLabelled(editorInstance: editor.ICodeEditor, ariaLabel: string) {
    const root = editorInstance.getDomNode();
    if (!root) return () => undefined;
    const applyLabel = () => {
      root.querySelectorAll<HTMLElement>('[role="textbox"]').forEach((textbox) => {
        if (!textbox.getAttribute('aria-label')) textbox.setAttribute('aria-label', ariaLabel);
      });
    };
    const observer = new MutationObserver(applyLabel);
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-label'],
    });
    applyLabel();
    return () => observer.disconnect();
  }

  return (
    <DiffEditor
      height={props.height ?? '100%'}
      original={props.original}
      modified={props.modified}
      language={resolveMonacoLanguage(props.language)}
      originalModelPath={props.originalPath ?? (props.path ? `${props.path}.original` : undefined)}
      modifiedModelPath={props.modifiedPath ?? (props.path ? `${props.path}.modified` : undefined)}
      theme={resolveCodeTheme(props.theme)}
      options={mergeCodeDiffOptions(props.ariaLabel, props.options, props.readOnly)}
      onMount={(diffEditor) => {
        // Monaco 0.55 can leave the native edit contexts unnamed even when
        // construction-level diff labels are supplied. Apply labels to both
        // child editors as well so the actual textbox nodes stay accessible.
        diffEditor.getOriginalEditor().updateOptions({ ariaLabel: originalAriaLabel });
        diffEditor.getModifiedEditor().updateOptions({ ariaLabel: modifiedAriaLabel });
        ariaObserverCleanupRef.current();
        const disposeOriginalObserver = keepEditorTextboxLabelled(diffEditor.getOriginalEditor(), originalAriaLabel);
        const disposeModifiedObserver = keepEditorTextboxLabelled(diffEditor.getModifiedEditor(), modifiedAriaLabel);
        ariaObserverCleanupRef.current = () => {
          disposeOriginalObserver();
          disposeModifiedObserver();
        };
      }}
      loading={props.loading}
    />
  );
}

function JsonSpecEditorImplementation(props: JsonSpecEditorProps) {
  const instanceId = useId();
  const modelRef = useRef<editor.ITextModel | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const modelPath = props.path ?? `inmemory://datapass/spec-${instanceId}.json`;

  const handleMount: OnMount = (editorInstance, monaco) => {
    modelRef.current = editorInstance.getModel();
    monacoRef.current = monaco;
    monaco.editor.setModelMarkers(
      modelRef.current,
      '@datapass/code:json-spec',
      (props.diagnostics ?? []).map((diagnostic) => normalizeMarker(diagnostic, monaco)),
    );
  };

  useEffect(() => {
    const model = modelRef.current;
    const monaco = monacoRef.current;
    if (!model || !monaco) return;
    monaco.editor.setModelMarkers(
      model,
      '@datapass/code:json-spec',
      (props.diagnostics ?? []).map((diagnostic) => normalizeMarker(diagnostic, monaco)),
    );
  }, [props.diagnostics]);

  useEffect(() => {
    if (props.schema) schemas.set(instanceId, { ...props.schema, modelPath });
    else schemas.delete(instanceId);
    applyJsonSchemas();
    return () => {
      schemas.delete(instanceId);
      applyJsonSchemas();
    };
  }, [instanceId, modelPath, props.schema]);

  return (
    <Editor
      height={props.height ?? '100%'}
      path={modelPath}
      language="json"
      value={props.value}
      onChange={(value) => props.onChange?.(value ?? '')}
      onMount={handleMount}
      onValidate={(markers) => props.onValidate?.(markers.map(normalizeMonacoMarker))}
      theme={resolveCodeTheme(props.theme)}
      options={mergeCodeEditorOptions(props.ariaLabel, props.options, props.readOnly)}
      loading={props.loading}
    />
  );
}

export default function MonacoSurface(props: MonacoSurfaceProps) {
  if (props.kind === 'editor') return <CodeEditorImplementation {...props.editorProps} />;
  if (props.kind === 'diff') return <CodeDiffImplementation {...props.diffProps} />;
  return <JsonSpecEditorImplementation {...props.jsonProps} />;
}
