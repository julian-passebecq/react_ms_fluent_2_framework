export interface StaticDiagnostic {
  id: string;
  severity: 'info' | 'warning';
  message: string;
  code: string;
  source: string;
  line?: number;
  column?: number;
}

const opening = new Set(['(', '[', '{']);
const expectedOpening: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

export function analyzeDraft(source: string): StaticDiagnostic[] {
  const diagnostics: StaticDiagnostic[] = [];
  const placeholder = /(?:TODO|YOUR CODE|pass\s*(?:#.*)?$)/im.exec(source);

  if (placeholder) {
    const before = source.slice(0, placeholder.index);
    diagnostics.push({
      id: 'starter-placeholder',
      severity: 'info',
      message: 'A starter placeholder remains in the draft.',
      code: 'DP100',
      source: 'Local draft check',
      line: before.split('\n').length,
      column: placeholder.index - before.lastIndexOf('\n'),
    });
  }

  const stack: Array<{ character: string; line: number; column: number }> = [];
  let line = 1;
  let column = 0;
  let quote: string | undefined;
  let escaped = false;

  for (const character of source) {
    if (character === '\n') {
      line += 1;
      column = 0;
      escaped = false;
      continue;
    }
    column += 1;

    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (opening.has(character)) {
      stack.push({ character, line, column });
      continue;
    }
    if (character in expectedOpening) {
      const last = stack.at(-1);
      if (!last || last.character !== expectedOpening[character]) {
        diagnostics.push({
          id: `delimiter-${line}-${column}`,
          severity: 'warning',
          message: `Closing delimiter “${character}” has no matching opener.`,
          code: 'DP201',
          source: 'Local delimiter check',
          line,
          column,
        });
        break;
      }
      stack.pop();
    }
  }

  if (!diagnostics.some((item) => item.code === 'DP201') && stack.length) {
    const last = stack.at(-1)!;
    diagnostics.push({
      id: `delimiter-${last.line}-${last.column}`,
      severity: 'warning',
      message: `Opening delimiter “${last.character}” is not closed.`,
      code: 'DP202',
      source: 'Local delimiter check',
      line: last.line,
      column: last.column,
    });
  }

  return diagnostics;
}
