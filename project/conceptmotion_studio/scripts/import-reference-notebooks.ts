import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { serializeDeterministic } from '../packages/content/src/index.js';
import { importIpynb } from '../packages/notebook-import/src/index.js';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputRoot = path.join(workspaceRoot, 'examples', 'notebooks');
const outputRoot = path.join(workspaceRoot, 'apps', 'dubreu-formation', 'src', 'generated');
const publicNotebookRoot = path.join(workspaceRoot, 'apps', 'dubreu-formation', 'public', 'notebooks');

const jobs = [
  {
    sourceFile: 'dubreu_sql_where_reference.ipynb',
    outputFile: 'sql-where.notebook.json',
    id: 'notebook.dubreu.sql-where',
    title: 'Filter rows with WHERE',
    sourceId: 'source.dubreu.synthetic-sql',
    codeEditable: true,
    runtimeTargetIds: ['runtime.dubreu.download-sql'],
  },
  {
    sourceFile: 'dubreu_pyspark_partition_reference.ipynb',
    outputFile: 'pyspark-partitions.notebook.json',
    id: 'notebook.dubreu.pyspark-partitions',
    title: 'Understand partition movement',
    sourceId: 'source.dubreu.synthetic-pyspark',
    codeEditable: false,
    runtimeTargetIds: ['runtime.dubreu.download-pyspark'],
  },
] as const;

await mkdir(outputRoot, { recursive: true });
await mkdir(publicNotebookRoot, { recursive: true });
const manifest: Array<Record<string, unknown>> = [];

for (const job of jobs) {
  const sourcePath = path.join(inputRoot, job.sourceFile);
  const source = await readFile(sourcePath, 'utf8');
  const imported = importIpynb(source, {
    sourceFile: job.sourceFile,
    id: job.id,
    title: job.title,
    sourceId: job.sourceId,
    license: { id: 'CC0-1.0', name: 'Original V2 representative fixture' },
    codeEditable: job.codeEditable,
    codeExecution: 'none',
    runtimeTargetIds: job.runtimeTargetIds,
    mediaBasePath: 'assets/notebooks',
  });
  if (!imported.ok || !imported.notebook) {
    throw new Error(`Failed to import ${job.sourceFile}:\n${imported.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n')}`);
  }
  await writeIfChanged(path.join(outputRoot, job.outputFile), `${serializeDeterministic(imported.notebook, 2)}\n`);
  await writeIfChanged(path.join(publicNotebookRoot, job.sourceFile), source);
  manifest.push({
    id: imported.notebook.id,
    outputFile: job.outputFile,
    sourceFile: job.sourceFile,
    sourceSha256: imported.notebook.provenance.sourceSha256,
    importerVersion: imported.notebook.provenance.importerVersion,
    cellCount: imported.notebook.cells.length,
    mediaCount: imported.media.length,
    issues: imported.issues,
  });
}

const pythonReference = await readFile(path.join(inputRoot, 'dubreu_python_lists_reference.py'), 'utf8');
await writeIfChanged(path.join(publicNotebookRoot, 'dubreu_python_lists_reference.py'), pythonReference);
const advancedSqlReference = await readFile(path.join(inputRoot, 'dubreu_sql_window_reference.sql'), 'utf8');
await writeIfChanged(path.join(publicNotebookRoot, 'dubreu_sql_window_reference.sql'), advancedSqlReference);

await writeIfChanged(path.join(outputRoot, 'import-manifest.json'), `${serializeDeterministic(manifest, 2)}\n`);
console.log(`reference notebook import: ${jobs.length} notebooks · deterministic JSON · no execution`);

async function writeIfChanged(destination: string, content: string): Promise<void> {
  let current: string | undefined;
  try {
    current = await readFile(destination, 'utf8');
  } catch {
    current = undefined;
  }
  if (current !== content) await writeFile(destination, content, 'utf8');
}
