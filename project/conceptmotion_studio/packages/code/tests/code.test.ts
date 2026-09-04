import { describe, expect, it } from 'vitest';
import {
  CodeDiff,
  CodeEditor,
  JsonSpecEditor,
  codeLanguages,
  commonCodeEditorOptions,
  createDatapassMonacoTheme,
  DATAPASS_MONACO_LIGHT_THEME,
  mergeCodeDiffOptions,
  mergeCodeEditorOptions,
  resolveCodeTheme,
  resolveMonacoLanguage,
} from '../src';

describe('@datapass/code metadata', () => {
  it('keeps the public component entry light until a code surface renders', () => {
    expect(typeof CodeEditor).toBe('function');
    expect(typeof CodeDiff).toBe('function');
    expect(typeof JsonSpecEditor).toBe('function');
    expect('MonacoEnvironment' in globalThis).toBe(false);
  });

  it('maps modeled dialects onto the smallest supported Monaco language set', () => {
    expect(resolveMonacoLanguage('tsql')).toBe('sql');
    expect(resolveMonacoLanguage('bigquery')).toBe('sql');
    expect(resolveMonacoLanguage('pyspark')).toBe('python');
    expect(resolveMonacoLanguage('dax')).toBe('plaintext');
    expect(resolveMonacoLanguage('custom-language')).toBe('custom-language');
    expect(Object.values(codeLanguages).every((language) => language.executable === false)).toBe(true);
  });

  it('uses shared accessible editor and diff options', () => {
    expect(commonCodeEditorOptions.minimap).toEqual({ enabled: false });
    expect(mergeCodeEditorOptions('SQL exercise', { fontSize: 15 }, false)).toMatchObject({
      ariaLabel: 'SQL exercise',
      automaticLayout: true,
      fontSize: 15,
      readOnly: false,
    });
    expect(mergeCodeDiffOptions('Learner comparison', undefined, true)).toMatchObject({
      ariaLabel: 'Learner comparison',
      originalAriaLabel: 'Learner comparison: original',
      modifiedAriaLabel: 'Learner comparison: modified',
      originalEditable: false,
      readOnly: true,
    });
  });

  it('maps Fluent light tokens to a deterministic Monaco theme', () => {
    const theme = createDatapassMonacoTheme();
    expect(resolveCodeTheme('light')).toBe(DATAPASS_MONACO_LIGHT_THEME);
    expect(resolveCodeTheme('dark')).toBe('vs-dark');
    expect(theme.base).toBe('vs');
    expect(theme.colors['editor.background']).toBe('#ffffff');
    expect(theme.colors['editorWidget.border']).toBe('#e0e0e0');
    expect(theme.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ token: 'keyword.sql', foreground: '0f6cbd' }),
        expect.objectContaining({ token: 'string.sql', foreground: '107c10' }),
      ]),
    );
  });
});
