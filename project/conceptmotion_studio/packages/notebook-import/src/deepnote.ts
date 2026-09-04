import type { DeepnoteSqlExtraction } from './contracts';

interface ParsedString {
  readonly value: string;
  readonly end: number;
}

function skipWhitespaceAndComments(source: string, start: number): number {
  let index = start;
  while (index < source.length) {
    if (/\s/.test(source[index] ?? '')) {
      index += 1;
      continue;
    }
    if (source[index] === '#') {
      const newline = source.indexOf('\n', index + 1);
      return newline < 0 ? source.length : skipWhitespaceAndComments(source, newline + 1);
    }
    break;
  }
  return index;
}

function decodeEscape(source: string, index: number): { value: string; consumed: number } {
  const marker = source[index + 1];
  if (marker === undefined) return { value: '\\', consumed: 1 };
  const simple: Record<string, string> = {
    n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', a: '\u0007',
    '\\': '\\', "'": "'", '"': '"', '\n': '',
  };
  if (Object.prototype.hasOwnProperty.call(simple, marker)) return { value: simple[marker] ?? '', consumed: 2 };

  if (marker === 'x') {
    const hex = source.slice(index + 2, index + 4);
    if (/^[a-f0-9]{2}$/i.test(hex)) return { value: String.fromCodePoint(Number.parseInt(hex, 16)), consumed: 4 };
  }
  if (marker === 'u') {
    const hex = source.slice(index + 2, index + 6);
    if (/^[a-f0-9]{4}$/i.test(hex)) return { value: String.fromCodePoint(Number.parseInt(hex, 16)), consumed: 6 };
  }
  return { value: `\\${marker}`, consumed: 2 };
}

function parsePythonString(source: string, start: number): ParsedString | undefined {
  let index = start;
  let prefix = '';
  while (index < source.length && /[rRuUbBfF]/.test(source[index] ?? '') && prefix.length < 2) {
    prefix += source[index];
    index += 1;
  }
  if (/[fF]/.test(prefix)) return undefined;
  const quote = source[index];
  if (quote !== "'" && quote !== '"') return undefined;
  const triple = source.slice(index, index + 3) === quote.repeat(3);
  const delimiterLength = triple ? 3 : 1;
  index += delimiterLength;
  let value = '';
  const raw = /[rR]/.test(prefix);

  while (index < source.length) {
    if (source.slice(index, index + delimiterLength) === quote.repeat(delimiterLength)) {
      return { value, end: index + delimiterLength };
    }
    const character = source[index] ?? '';
    if (!triple && (character === '\n' || character === '\r')) return undefined;
    if (character === '\\' && !raw) {
      const escaped = decodeEscape(source, index);
      value += escaped.value;
      index += escaped.consumed;
      continue;
    }
    if (character === '\\' && raw && source[index + 1] === quote) {
      value += `\\${quote}`;
      index += 2;
      continue;
    }
    value += character;
    index += 1;
  }
  return undefined;
}

function trailingWrapperIsBalanced(source: string, start: number): boolean {
  const expectedClosers: string[] = [')'];
  let index = start;
  while (index < source.length) {
    const character = source[index] ?? '';
    if (character === '#') {
      const newline = source.indexOf('\n', index + 1);
      index = newline < 0 ? source.length : newline + 1;
      continue;
    }
    const parsed = parsePythonString(source, index);
    if (parsed) {
      index = parsed.end;
      continue;
    }
    if (character === '(') expectedClosers.push(')');
    else if (character === '[') expectedClosers.push(']');
    else if (character === '{') expectedClosers.push('}');
    else if (character === ')' || character === ']' || character === '}') {
      if (expectedClosers.at(-1) !== character) return false;
      expectedClosers.pop();
      if (expectedClosers.length === 0) return skipWhitespaceAndComments(source, index + 1) === source.length;
    }
    index += 1;
  }
  return false;
}

function referencedCsvPaths(source: string): readonly string[] {
  const paths = new Set<string>();
  let index = 0;
  while (index < source.length) {
    const parsed = parsePythonString(source, index);
    if (!parsed) {
      index += 1;
      continue;
    }
    const decoded = parsed.value.replaceAll('\\', '/');
    const candidates = decoded.match(/[a-z0-9_.\/-]+\.csv(?:[?#][a-z0-9_.=&%/-]*)?/gi) ?? [];
    for (const rawCandidate of candidates) {
      const candidate = rawCandidate.replace(/^\.\//, '');
      if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate) && !/(^|\/)\.\.(\/|$)/.test(candidate)) paths.add(candidate);
    }
    index = parsed.end;
  }
  return [...paths].sort();
}

/**
 * Extracts only the first literal argument of one complete `_dntk.execute_sql(...)`
 * expression. Concatenation, formatted strings, assignments and incomplete wrappers
 * intentionally fall back to their original code.
 */
export function extractDeepnoteSql(source: string): DeepnoteSqlExtraction {
  const originalSource = source;
  const paths = referencedCsvPaths(source);
  let index = skipWhitespaceAndComments(source, 0);
  const callee = '_dntk.execute_sql';
  if (!source.startsWith(callee, index)) {
    return { status: 'not-wrapper', originalSource, referencedPaths: paths };
  }
  index += callee.length;
  index = skipWhitespaceAndComments(source, index);
  if (source[index] !== '(') {
    return { status: 'ambiguous', originalSource, referencedPaths: paths, reason: 'The wrapper call has no opening parenthesis.' };
  }
  index = skipWhitespaceAndComments(source, index + 1);
  const literal = parsePythonString(source, index);
  if (!literal) {
    return { status: 'ambiguous', originalSource, referencedPaths: paths, reason: 'The SQL argument is not one unambiguous Python string literal.' };
  }
  index = skipWhitespaceAndComments(source, literal.end);
  if (source[index] !== ',') {
    return { status: 'ambiguous', originalSource, referencedPaths: paths, reason: 'The SQL literal is not followed by another wrapper argument.' };
  }
  if (!trailingWrapperIsBalanced(source, index + 1)) {
    return { status: 'ambiguous', originalSource, referencedPaths: paths, reason: 'The wrapper call is incomplete or contains unbalanced delimiters.' };
  }
  if (!literal.value.trim()) {
    return { status: 'ambiguous', originalSource, referencedPaths: paths, reason: 'The SQL literal is empty.' };
  }
  return { status: 'extracted', originalSource, sql: literal.value, referencedPaths: paths };
}
