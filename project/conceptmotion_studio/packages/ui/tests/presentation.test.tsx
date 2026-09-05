import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContentDetails, FigureFrame } from '../src';

describe('shared consumer presentation', () => {
  it('keeps metadata behind a native, closed, keyboard-accessible disclosure', () => {
    const host = document.createElement('div');
    host.innerHTML = renderToStaticMarkup(<ContentDetails id="source-details"><p>source.internal</p></ContentDetails>);
    expect(host.querySelector('details')?.open).toBe(false);
    expect(host.querySelector('details > summary')?.textContent).toBe('Details & sources');
    expect(host.querySelector('details')?.id).toBe('source-details');
    expect(host.querySelector('.dp-content-details__body')?.textContent).toBe('source.internal');
  });
  it('supports explicit authoring disclosures without inventing a controlled state layer', () => {
    const html = renderToStaticMarkup(<ContentDetails open summary="Authoring details" className="custom">Revision 4</ContentDetails>);
    expect(html).toContain('open=""');
    expect(html).toContain('dp-content-details custom');
    expect(html).toContain('<summary>Authoring details</summary>');
  });
  it('keeps required attribution outside optional audit details', () => {
    const host = document.createElement('div');
    host.innerHTML = renderToStaticMarkup(<FigureFrame title="Example" source="Required credit" details={<ContentDetails>Internal ID</ContentDetails>}><span>Renderer-neutral content</span></FigureFrame>);
    expect(host.querySelector('figcaption')?.textContent).toContain('Required credit');
    expect(host.querySelector('figcaption')?.closest('details')).toBeNull();
    expect(host.querySelector('details')?.textContent).toContain('Internal ID');
  });
});
