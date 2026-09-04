import { describe, expect, it } from 'vitest';
import { serializeSvg } from './SvgExportButton';

describe('serializeSvg', () => {
  it('freezes an SVG with a namespace and strips runtime-only nodes', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const title = document.createElementNS(svg.namespaceURI, 'title');
    title.textContent = 'Stable export';
    const runtime = document.createElementNS(svg.namespaceURI, 'g');
    runtime.setAttribute('data-runtime-only', 'true');
    svg.append(title, runtime);
    const frozen = serializeSvg(svg);
    expect(frozen).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(frozen).toContain('Stable export');
    expect(frozen).not.toContain('data-runtime-only');
  });
});
