import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/languages/definitions/csharp/register';
import 'monaco-editor/languages/definitions/powershell/register';
import 'monaco-editor/languages/definitions/python/register';
import 'monaco-editor/languages/definitions/shell/register';
import 'monaco-editor/languages/definitions/sql/register';
import { jsonDefaults } from 'monaco-editor/languages/features/json/register';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/language/json/json.worker?worker';
import { createDatapassMonacoTheme, DATAPASS_MONACO_LIGHT_THEME } from './options';

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker(moduleId: string, label: string): Worker;
    };
  }
}

let configured = false;

export function ensureMonacoConfigured() {
  if (configured) return monaco;

  globalThis.MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      if (label === 'json') return new JsonWorker();
      return new EditorWorker();
    },
  };

  loader.config({ monaco });
  monaco.editor.defineTheme(DATAPASS_MONACO_LIGHT_THEME, createDatapassMonacoTheme());
  configured = true;
  return monaco;
}

export { jsonDefaults };
