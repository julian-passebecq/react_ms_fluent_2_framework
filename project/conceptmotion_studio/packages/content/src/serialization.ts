import type { ContentCatalog } from './contracts';
import { parseJson, serializeDeterministic } from './json';
import { assertValidContentCatalog } from './validation';

export function serializeContentCatalog(catalog: ContentCatalog, space = 2): string {
  assertValidContentCatalog(catalog);
  return serializeDeterministic(catalog, space);
}

export function parseContentCatalog(source: string): ContentCatalog {
  return assertValidContentCatalog(parseJson(source));
}
