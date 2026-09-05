import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { createEmptyProgressState, setChallengeDraft } from '@datapass/progress';
import type { ChallengeDefinition, PracticeItem } from '@datapass/content';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.mock('@datapass/code', () => ({ CodeEditor: ({ ariaLabel, value }: { ariaLabel: string; value: string }) => <textarea aria-label={ariaLabel} value={value} readOnly />, CodeDiff: ({ original, modified }: { original: string; modified: string }) => <div data-diff>{original} | {modified}</div> }));
import { ChallengeWorkbench } from '../src/challenge-workbench';
import { parsePracticeWorkspace, serializePracticeWorkspace, usePracticeWorkspace } from '../src/practice-state';
const challenge: ChallengeDefinition = { id: 'shared', title: 'Shared practice', domain: 'SQL', difficulty: 'Easy', tags: [], summary: 'Keep active rows.', schema: '', input: '', example: '', expectedOutput: '', hints: ['Use WHERE'], variants: [{ id: 'sql', language: 'sql', label: 'SQL', monacoLanguage: 'sql', starter: 'SELECT', solution: 'SELECT * FROM t WHERE active;' }] };
let root: Root | undefined;
let host: HTMLDivElement | undefined;
afterEach(async () => { if (root) await act(() => root!.unmount()); host?.remove(); });
describe('shared practice workbench and backup', () => {
  it('keeps source attribution visible and raw provenance inside closed consumer details', async () => {
    const sourced: PracticeItem = { ...challenge, trackId: 'sql', concept: 'Predicate', why: 'Keep useful rows', pitfall: 'Check nulls', execution: 'none', sourceRecord: {}, source: { repository: 'source.internal-corpus', revision: 'a'.repeat(40), itemId: 'stable-source-item', collection: 'questions', sourcePack: 'Original teaching material · author attribution retained' } };
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    const surface = (metadataMode?: 'consumer' | 'developer') => <FluentProvider theme={webLightTheme}><ChallengeWorkbench challenge={sourced} metadataMode={metadataMode} progress={createEmptyProgressState()} onProgressChange={() => {}} /></FluentProvider>;
    await act(() => root!.render(surface()));
    expect(host.querySelector('.dp-practice-attribution')?.textContent).toContain('author attribution retained');
    expect(host.querySelector('details')?.open).toBe(false);
    expect(host.querySelector('details')?.textContent).toContain('stable-source-item');
    expect(host.querySelector('details')?.textContent).toContain('a'.repeat(40));
    expect(host.querySelector('a[href*="github.com"]')).toBeNull();
    await act(() => root!.render(surface('developer')));
    expect(host.querySelector('details')?.open).toBe(true);
  });
  it('shows progressive hints, explicit figure fallback and a reference comparison', async () => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    await act(() => root!.render(<FluentProvider theme={webLightTheme}><ChallengeWorkbench challenge={challenge} progress={createEmptyProgressState()} onProgressChange={() => {}} /></FluentProvider>));
    const click = async (name: string) => { const button = [...host!.querySelectorAll<HTMLElement>('button,[role="tab"]')].find(b => b.textContent?.includes(name)); expect(button).toBeTruthy(); await act(() => button!.click()); };
    expect(host.textContent).toContain('Reference practice');
    expect([...host.querySelectorAll('button')].some(control => /^(run|execute)$/i.test(control.textContent ?? ''))).toBe(false);
    await click('Hints'); expect(host.textContent).not.toContain('Use WHERE');
    await click('Reveal next hint'); expect(host.textContent).toContain('Use WHERE');
    await click('Visualize'); expect(host.textContent).toContain('No semantic figure is attached');
    await click('Compare'); expect(host.querySelector('[data-diff]')?.textContent).toContain('WHERE active');
    await click('Notes'); expect(host.textContent).toContain('Your reasoning notes');
  });
  it('roundtrips notes plus independently keyed drafts without changing V2 schema', () => {
    const state = { schemaVersion: 1 as const, progress: setChallengeDraft(createEmptyProgressState(), 'shared', 'sql', 'draft'), notes: { shared: 'My reasoning' } };
    expect(parsePracticeWorkspace(serializePracticeWorkspace(state))).toEqual(state);
    expect(parsePracticeWorkspace(serializePracticeWorkspace(state)).progress.schemaVersion).toBe(2);
  });
  it('bounds visual navigation and immediately returns from the last frame', async () => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    const figure = { id: 'two-frames', kind: 'diagram' as const, rendererId: 'diagram.flow', title: 'Two frames', fallbackText: 'A flows to B.', spec: { kind: 'diagram', version: '3', id: 'two-frames', title: 'Two frames', nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], edges: [{ id: 'ab', from: { nodeId: 'a' }, to: { nodeId: 'b' } }], frames: [{ id: 'one', activeNodeIds: ['a'] }, { id: 'two', activeNodeIds: ['b'] }] } };
    await act(() => root!.render(<FluentProvider theme={webLightTheme}><ChallengeWorkbench challenge={challenge} figure={figure} figureCaptions={['First state', 'Second state']} reducedMotion progress={createEmptyProgressState()} onProgressChange={() => {}} /></FluentProvider>));
    const button = (name: string) => [...host!.querySelectorAll<HTMLButtonElement>('button,[role="tab"]')].find(b => b.getAttribute('aria-label') === name || b.textContent?.trim() === name)!;
    expect(button('Visualize this challenge')).toBeTruthy();
    await act(() => button('Visualize this challenge').click());
    expect(button('Previous').disabled).toBe(true);
    await act(() => button('Next').click());
    expect(host.querySelector('.dp-figure-player')?.getAttribute('data-frame-index')).toBe('1');
    expect(host.querySelector('.dp-figure-player__caption')?.textContent).toBe('Second state');
    expect(button('Next').disabled).toBe(true);
    for (let i = 0; i < 5; i++) await act(() => button('Next').click());
    await act(() => button('Previous').click());
    expect(host.querySelector('.dp-figure-player')?.getAttribute('data-frame-index')).toBe('0');
    expect(button('Next').disabled).toBe(false);
    expect(host.querySelector('button[aria-label^="Play unavailable"]')?.hasAttribute('disabled')).toBe(true);
  });
  it('rejects malformed backups before replacing state', () => {
    for (const invalid of ['{}', 'null', '{', JSON.stringify({ schemaVersion: 1, progress: {}, notes: {} }), JSON.stringify({ schemaVersion: 1, progress: createEmptyProgressState(), notes: { item: 123 } })]) expect(() => parsePracticeWorkspace(invalid)).toThrow();
  });
  it('protects malformed saved data until an explicit validated import', async () => {
    const key = 'practice-test-invalid'; window.localStorage.setItem(key, 'broken backup');
    let workspace: ReturnType<typeof usePracticeWorkspace> | undefined;
    function Harness() { workspace = usePracticeWorkspace(key); return <p>{workspace.warning}</p>; }
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    await act(() => root!.render(<Harness />));
    expect(host.textContent).toContain('remains untouched');
    await act(() => workspace!.setNote('item', 'Unsaved reasoning'));
    expect(window.localStorage.getItem(key)).toBe('broken backup');
    expect(workspace!.state.notes.item).toBe('Unsaved reasoning');
    await act(() => workspace!.importJson(workspace!.exportJson()));
    expect(parsePracticeWorkspace(window.localStorage.getItem(key)!).notes.item).toBe('Unsaved reasoning');
    window.localStorage.removeItem(key);
  });
});
