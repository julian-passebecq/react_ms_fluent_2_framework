import type { CodeLanguageId, CodeLanguageMetadata } from './types';

export const codeLanguages: Readonly<Record<CodeLanguageId, CodeLanguageMetadata>> = {
  bash: { id: 'bash', label: 'Bash', monacoLanguage: 'shell', executable: false },
  bigquery: { id: 'bigquery', label: 'BigQuery SQL', monacoLanguage: 'sql', executable: false },
  csharp: { id: 'csharp', label: 'C#', monacoLanguage: 'csharp', executable: false },
  dax: { id: 'dax', label: 'DAX', monacoLanguage: 'plaintext', executable: false },
  json: { id: 'json', label: 'JSON', monacoLanguage: 'json', executable: false },
  pandas: { id: 'pandas', label: 'pandas', monacoLanguage: 'python', executable: false },
  plaintext: { id: 'plaintext', label: 'Plain text', monacoLanguage: 'plaintext', executable: false },
  powershell: { id: 'powershell', label: 'PowerShell', monacoLanguage: 'powershell', executable: false },
  pyspark: { id: 'pyspark', label: 'PySpark', monacoLanguage: 'python', executable: false },
  python: { id: 'python', label: 'Python', monacoLanguage: 'python', executable: false },
  shell: { id: 'shell', label: 'Shell', monacoLanguage: 'shell', executable: false },
  sql: { id: 'sql', label: 'SQL', monacoLanguage: 'sql', executable: false },
  tsql: { id: 'tsql', label: 'T-SQL', monacoLanguage: 'sql', executable: false },
};

export function resolveMonacoLanguage(language: CodeLanguageId | string): string {
  return codeLanguages[language as CodeLanguageId]?.monacoLanguage ?? language;
}
