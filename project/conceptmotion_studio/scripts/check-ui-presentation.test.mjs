// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { datapassSurfaceTokens } from '../packages/ui/src/theme';

describe('shared semantic token source parity', () => {
  it('keeps CSS tokens and the Fluent/renderer token adapter in parity', () => {
    const css = readFileSync(new URL('../packages/ui/src/styles.css', import.meta.url), 'utf8');
    for (const [name, value] of Object.entries(datapassSurfaceTokens)) {
      const cssName = name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      expect(css, name).toContain(`--dp-${cssName}: ${value};`);
    }
  });
});
