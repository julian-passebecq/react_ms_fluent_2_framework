import type { editor } from 'monaco-editor';
import type { ReactNode } from 'react';

export type CodeLanguageId =
  | 'bash'
  | 'bigquery'
  | 'csharp'
  | 'dax'
  | 'json'
  | 'pandas'
  | 'plaintext'
  | 'powershell'
  | 'pyspark'
  | 'python'
  | 'shell'
  | 'sql'
  | 'tsql';

export type CodeTheme = 'light' | 'dark' | string;

export interface CodeLanguageMetadata {
  readonly id: CodeLanguageId;
  readonly label: string;
  readonly monacoLanguage: string;
  readonly executable: false;
}

export type CodeEditorOptions = editor.IStandaloneEditorConstructionOptions;
export type CodeDiffOptions = editor.IStandaloneDiffEditorConstructionOptions;

export interface CodeMarker {
  readonly severity: 'error' | 'warning' | 'info' | 'hint';
  readonly message: string;
  readonly startLineNumber: number;
  readonly startColumn: number;
  readonly endLineNumber: number;
  readonly endColumn: number;
  readonly code?: string;
  readonly source?: string;
}

export interface CodeDiagnostic extends Partial<Omit<CodeMarker, 'severity' | 'message'>> {
  readonly severity: CodeMarker['severity'];
  readonly message: string;
}

export interface JsonSchemaHook {
  /** A stable URI used by Monaco to identify this schema. */
  readonly uri: string;
  /** JSON Schema data. It is passed to Monaco's local JSON worker and is never fetched. */
  readonly schema: Readonly<Record<string, unknown>>;
  /** Optional model patterns. The current editor model is used when omitted. */
  readonly fileMatch?: readonly string[];
}

interface BaseCodeSurfaceProps {
  readonly ariaLabel: string;
  readonly language: CodeLanguageId | string;
  readonly height?: string | number;
  readonly loading?: ReactNode;
  readonly path?: string;
  readonly theme?: CodeTheme;
}

export interface CodeEditorProps extends BaseCodeSurfaceProps {
  readonly value: string;
  readonly onChange?: (value: string) => void;
  readonly onValidate?: (markers: readonly CodeMarker[]) => void;
  readonly options?: CodeEditorOptions;
  readonly readOnly?: boolean;
}

export interface CodeDiffProps extends BaseCodeSurfaceProps {
  readonly original: string;
  readonly modified: string;
  readonly originalPath?: string;
  readonly modifiedPath?: string;
  readonly options?: CodeDiffOptions;
  readonly readOnly?: boolean;
}

export interface JsonSpecEditorProps extends Omit<CodeEditorProps, 'language'> {
  readonly diagnostics?: readonly CodeDiagnostic[];
  readonly schema?: JsonSchemaHook;
}

export interface DatapassMonacoThemeTokens {
  readonly colorNeutralBackground1: string;
  readonly colorNeutralBackground3: string;
  readonly colorNeutralForeground1: string;
  readonly colorNeutralForeground3: string;
  readonly colorNeutralStroke2: string;
  readonly colorBrandForeground1: string;
  readonly colorPaletteRedForeground1: string;
  readonly colorPaletteGreenForeground1: string;
  readonly colorPaletteDarkOrangeForeground1: string;
}
