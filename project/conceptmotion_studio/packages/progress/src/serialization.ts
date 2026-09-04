import type { ProgressStateV2 } from './types';
import { assertValidProgressState } from './validation';

function canonicalize(value: unknown, seen: WeakSet<object>, inArray: boolean): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol') return inArray ? null : undefined;
  if (typeof value === 'bigint') throw new TypeError('BigInt values cannot be serialized as progress JSON.');
  if (typeof value !== 'object') return undefined;
  if (seen.has(value)) throw new TypeError('Cannot serialize cyclic progress state.');
  seen.add(value);
  try {
    if (Array.isArray(value)) return value.map((item) => canonicalize(item, seen, true) ?? null);
    const source = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      const child = canonicalize(source[key], seen, false);
      if (child !== undefined) output[key] = child;
    }
    return output;
  } finally {
    seen.delete(value);
  }
}

export function serializeProgressState(state: ProgressStateV2, space = 2): string {
  assertValidProgressState(state);
  return JSON.stringify(canonicalize(state, new WeakSet<object>(), false), null, space);
}

export function parseProgressState(source: string): ProgressStateV2 {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    throw new SyntaxError(`Invalid progress JSON: ${message}`);
  }
  return assertValidProgressState(value);
}

export const exportProgressJson = serializeProgressState;
export const importProgressJson = parseProgressState;
