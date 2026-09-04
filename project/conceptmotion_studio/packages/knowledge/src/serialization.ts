import type { KnowledgeDataset } from './contracts';
import { assertValidKnowledgeDataset } from './validation';

function canonicalize(value: unknown, seen: WeakSet<object>, inArray: boolean): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol') return inArray ? null : undefined;
  if (typeof value === 'bigint') throw new TypeError('BigInt values cannot be serialized as JSON.');
  if (typeof value !== 'object') return undefined;
  if (seen.has(value)) throw new TypeError('Cannot serialize a cyclic value.');
  seen.add(value);
  try {
    if (Array.isArray(value)) return value.map((item) => canonicalize(item, seen, true) ?? null);
    const result: Record<string, unknown> = {};
    const source = value as Record<string, unknown>;
    for (const key of Object.keys(source).sort()) {
      const child = canonicalize(source[key], seen, false);
      if (child !== undefined) result[key] = child;
    }
    return result;
  } finally {
    seen.delete(value);
  }
}

export function serializeKnowledgeDataset(dataset: KnowledgeDataset, space = 2): string {
  assertValidKnowledgeDataset(dataset);
  return JSON.stringify(canonicalize(dataset, new WeakSet<object>(), false), null, space);
}

export function parseKnowledgeDataset(source: string): KnowledgeDataset {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new SyntaxError(`Invalid knowledge JSON: ${message}`);
  }
  return assertValidKnowledgeDataset(parsed);
}
