import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authoringSchemas, serializeAuthoringSchema, type AuthoringKind } from './authoring-schemas';

const directory = fileURLToPath(new URL('../schemas/authoring/', import.meta.url));
const check = process.argv.includes('--check');
if (!check) mkdirSync(directory, { recursive: true });
for (const kind of Object.keys(authoringSchemas) as AuthoringKind[]) {
  const filename = path.join(directory, `${kind}.schema.json`);
  const expected = serializeAuthoringSchema(kind);
  if (check) {
    if (readFileSync(filename, 'utf8').replaceAll('\r\n', '\n') !== expected) throw new Error(`${kind} editor schema drifted; run pnpm schemas:generate and review the delta.`);
  } else writeFileSync(filename, expected);
}
console.log(`Authoring schemas: ${check ? 'checked' : 'generated'} four local structural schemas.`);
