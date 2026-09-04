export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

function canonicalize(value: unknown, seen: WeakSet<object>, inArray: boolean): JsonValue | undefined {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol') {
    return inArray ? null : undefined;
  }
  if (typeof value === 'bigint') throw new TypeError('BigInt values cannot be serialized as JSON.');
  if (typeof value !== 'object') return undefined;
  if (seen.has(value)) throw new TypeError('Cannot serialize a cyclic value.');

  seen.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item) => canonicalize(item, seen, true) ?? null);
    }

    const source = value as Record<string, unknown>;
    const output: Record<string, JsonValue> = {};
    for (const key of Object.keys(source).sort()) {
      const child = canonicalize(source[key], seen, false);
      if (child !== undefined) output[key] = child;
    }
    return output;
  } finally {
    seen.delete(value);
  }
}

export function toCanonicalJsonValue(value: unknown): JsonValue {
  const result = canonicalize(value, new WeakSet<object>(), false);
  if (result === undefined) throw new TypeError('The root value cannot be represented as JSON.');
  return result;
}

export function serializeDeterministic(value: unknown, space = 2): string {
  return JSON.stringify(toCanonicalJsonValue(value), null, space);
}

export function parseJson(source: string): unknown {
  try {
    return JSON.parse(source) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new SyntaxError(`Invalid JSON: ${message}`);
  }
}
