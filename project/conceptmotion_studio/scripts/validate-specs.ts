import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { validateDiagramSpec } from '../packages/core/src/index';
import { validateAppRecipe, validateChallenge, validateFigureSpec } from '../packages/content/src/index';
import { authoringSchemas, type AuthoringKind } from './authoring-schemas';

const ajv = new Ajv({ allErrors: true, strict: false });
const validators = { figure: validateFigureSpec, diagram: validateDiagramSpec, 'app-recipe': validateAppRecipe, challenge: validateChallenge };
const schemaValidators = Object.fromEntries(Object.entries(authoringSchemas).map(([kind, schema]) => [kind, ajv.compile(schema)]));

export function validateAuthoredSpec(kind: AuthoringKind, value: unknown) {
  const structural = schemaValidators[kind]!;
  const schemaValid = structural(value);
  const runtime = validators[kind](value);
  return { valid: Boolean(schemaValid && runtime.valid), schemaValid: Boolean(schemaValid), runtimeValid: runtime.valid, schemaErrors: structural.errors ?? [], runtimeIssues: runtime.issues };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [kind, ...filenames] = process.argv.slice(2);
  if (!kind || !Object.hasOwn(authoringSchemas, kind) || !filenames.length) throw new Error('Usage: pnpm validate:specs <figure|diagram|app-recipe|challenge> <file.json> [more files]');
  for (const filename of filenames) {
    const result = validateAuthoredSpec(kind as AuthoringKind, JSON.parse(readFileSync(filename, 'utf8')));
    console.log(JSON.stringify({ file: filename, ...result }, null, 2));
    if (!result.valid) process.exitCode = 1;
  }
}
