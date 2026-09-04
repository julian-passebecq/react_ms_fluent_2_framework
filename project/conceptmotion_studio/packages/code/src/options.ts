import type { editor } from 'monaco-editor';
import type {
  CodeDiffOptions,
  CodeEditorOptions,
  CodeTheme,
  DatapassMonacoThemeTokens,
} from './types';

export const DATAPASS_MONACO_LIGHT_THEME = 'datapass-fluent-light';

export const defaultDatapassMonacoThemeTokens: DatapassMonacoThemeTokens = {
  colorNeutralBackground1: '#ffffff',
  colorNeutralBackground3: '#f5f5f5',
  colorNeutralForeground1: '#242424',
  colorNeutralForeground3: '#616161',
  colorNeutralStroke2: '#e0e0e0',
  colorBrandForeground1: '#0f6cbd',
  colorPaletteRedForeground1: '#bc2f32',
  colorPaletteGreenForeground1: '#107c10',
  colorPaletteDarkOrangeForeground1: '#8a3707',
};

export const commonCodeEditorOptions: Readonly<CodeEditorOptions> = {
  automaticLayout: true,
  fontFamily: 'Cascadia Code, Consolas, monospace',
  fontSize: 13,
  lineNumbersMinChars: 3,
  minimap: { enabled: false },
  padding: { top: 12 },
  renderWhitespace: 'selection',
  scrollBeyondLastLine: false,
  tabSize: 2,
  wordWrap: 'on',
};

export const commonCodeDiffOptions: Readonly<CodeDiffOptions> = {
  ...commonCodeEditorOptions,
  originalEditable: false,
  readOnly: true,
  renderSideBySide: true,
};

export function resolveCodeTheme(theme: CodeTheme = 'light'): string {
  if (theme === 'light') return DATAPASS_MONACO_LIGHT_THEME;
  if (theme === 'dark') return 'vs-dark';
  return theme;
}

export function mergeCodeEditorOptions(
  ariaLabel: string,
  options: CodeEditorOptions | undefined,
  readOnly = false,
): CodeEditorOptions {
  return { ...commonCodeEditorOptions, ...options, ariaLabel, readOnly };
}

export function mergeCodeDiffOptions(
  ariaLabel: string,
  options: CodeDiffOptions | undefined,
  readOnly = true,
): CodeDiffOptions {
  return {
    ...commonCodeDiffOptions,
    ...options,
    ariaLabel,
    originalAriaLabel: `${ariaLabel}: original`,
    modifiedAriaLabel: `${ariaLabel}: modified`,
    readOnly,
  };
}

export function createDatapassMonacoTheme(
  tokens: DatapassMonacoThemeTokens = defaultDatapassMonacoThemeTokens,
): editor.IStandaloneThemeData {
  return {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: tokens.colorNeutralForeground3.slice(1), fontStyle: 'italic' },
      { token: 'keyword', foreground: tokens.colorBrandForeground1.slice(1) },
      { token: 'number', foreground: tokens.colorPaletteDarkOrangeForeground1.slice(1) },
      { token: 'string', foreground: tokens.colorPaletteGreenForeground1.slice(1) },
      { token: 'invalid', foreground: tokens.colorPaletteRedForeground1.slice(1) },
      // Monaco's inherited SQL theme declares language-qualified rules. Repeat the
      // semantic colors at that specificity so the accessible Fluent palette wins.
      { token: 'comment.sql', foreground: tokens.colorNeutralForeground3.slice(1), fontStyle: 'italic' },
      { token: 'keyword.sql', foreground: tokens.colorBrandForeground1.slice(1) },
      { token: 'number.sql', foreground: tokens.colorPaletteDarkOrangeForeground1.slice(1) },
      { token: 'string.sql', foreground: tokens.colorPaletteGreenForeground1.slice(1) },
      { token: 'operator.sql', foreground: tokens.colorNeutralForeground1.slice(1) },
    ],
    colors: {
      'editor.background': tokens.colorNeutralBackground1,
      'editor.foreground': tokens.colorNeutralForeground1,
      'editorLineNumber.foreground': tokens.colorNeutralForeground3,
      'editorLineNumber.activeForeground': tokens.colorNeutralForeground1,
      'editor.selectionBackground': '#cfe4fa',
      'editor.inactiveSelectionBackground': '#e5f0fa',
      'editor.lineHighlightBackground': tokens.colorNeutralBackground3,
      'editorWidget.background': tokens.colorNeutralBackground1,
      'editorWidget.border': tokens.colorNeutralStroke2,
      // Keep diff semantics visible without tinting syntax text below WCAG AA.
      // Gutter/overview decorations still communicate whole-line changes.
      'diffEditor.insertedLineBackground': '#00000000',
      'diffEditor.removedLineBackground': '#00000000',
      'diffEditor.insertedTextBackground': '#107c1008',
      'diffEditor.removedTextBackground': '#a4262c08',
    },
  };
}
