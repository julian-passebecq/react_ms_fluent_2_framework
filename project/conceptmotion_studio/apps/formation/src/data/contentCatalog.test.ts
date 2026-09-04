import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { serializeContentCatalog, validateContentCatalog } from '@datapass/content';
import {
  advancedSqlNotebook,
  dubreuContentCatalog,
  pythonNotebook,
  pysparkNotebook,
  runtimeTargets,
  sqlFilterFigure,
  sqlNotebook,
} from './contentCatalog';

describe('Dubreu Formation V2 reference content', () => {
  it('is a connected canonical content catalog with deterministic interchange', () => {
    expect(validateContentCatalog(dubreuContentCatalog)).toMatchObject({ valid: true, issues: [] });
    expect(serializeContentCatalog(dubreuContentCatalog)).toBe(serializeContentCatalog(dubreuContentCatalog));
  });

  it('uses conservative imported SQL/PySpark languages and never enables execution', () => {
    const sqlExercise = sqlNotebook.cells.find((cell) => cell.sourceCellId === 'where-exercise');
    expect(sqlExercise).toMatchObject({ type: 'code', language: 'sql', execution: 'none' });

    const pysparkCode = pysparkNotebook.cells.find((cell) => cell.type === 'code');
    expect(pysparkCode).toMatchObject({ language: 'pyspark', editable: false, execution: 'none' });
    expect(pysparkNotebook.cells.filter((cell) => 'execution' in cell).every((cell) => cell.execution === 'none')).toBe(true);
  });

  it('keeps the SQL Figure semantic and runtime destinations explicit', () => {
    expect(sqlFilterFigure).toMatchObject({ rendererId: 'table.transform', staticState: 1 });
    expect(sqlNotebook.cells).toContainEqual(expect.objectContaining({ type: 'figure', figureId: sqlFilterFigure.id }));
    expect(sqlNotebook.runtimeTargetIds).toEqual(['runtime.dubreu.download-sql']);
    expect(pysparkNotebook.runtimeTargetIds).toEqual(['runtime.dubreu.download-pyspark']);
    expect(runtimeTargets.every((target) => target.kind === 'download' || target.url?.startsWith('https://'))).toBe(true);
    expect(runtimeTargets.filter((target) => target.kind === 'download').every((target) => target.executesExternally === false)).toBe(true);
  });

  it('ties hand-authored reference provenance to the exact checked-in artifacts', () => {
    for (const notebook of [pythonNotebook, advancedSqlNotebook]) {
      const source = readFileSync(resolve(notebook.provenance.sourceFile));
      expect(createHash('sha256').update(source).digest('hex')).toBe(notebook.provenance.sourceSha256);
    }
  });
});
