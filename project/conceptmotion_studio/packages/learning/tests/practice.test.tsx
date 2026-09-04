import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { createEmptyProgressState, setChallengeDraft } from '@datapass/progress';
import type { ChallengeDefinition } from '@datapass/content';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.mock('@datapass/code', () => ({ CodeEditor: ({ ariaLabel, value }: { ariaLabel: string; value: string }) => <textarea aria-label={ariaLabel} value={value} readOnly />, CodeDiff: ({ original, modified }: { original: string; modified: string }) => <div data-diff>{original} | {modified}</div> }));
vi.mock('@datapass/figure', async importOriginal => ({ ...await importOriginal<typeof import('@datapass/figure')>(), FigureView: ({ frameIndex }: { frameIndex: number }) => <div data-figure data-frame-index={frameIndex} /> }));
import { ChallengeWorkbench } from '../src/challenge-workbench';
import { parsePracticeWorkspace, serializePracticeWorkspace, usePracticeWorkspace } from '../src/practice-state';
const challenge: ChallengeDefinition = { id: 'shared', title: 'Shared practice', domain: 'SQL', difficulty: 'Easy', tags: [], summary: 'Keep active rows.', schema: '', input: '', example: '', expectedOutput: '', hints: ['Use WHERE'], variants: [{ id: 'sql', language: 'sql', label: 'SQL', monacoLanguage: 'sql', starter: 'SELECT', solution: 'SELECT * FROM t WHERE active;' }] };
let root: Root | undefined;
let host: HTMLDivElement | undefined;
afterEach(async () => { if (root) await act(() => root!.unmount()); host?.remove(); });
describe('shared practice workbench and backup', () => {
  it('shows progressive hints, explicit figure fallback and a reference comparison', async () => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    await act(() => root!.render(<FluentProvider theme={webLightTheme}><ChallengeWorkbench challenge={challenge} progress={createEmptyProgressState()} onProgressChange={() => {}} /></FluentProvider>));
    const click = async (name: string) => { const button = [...host!.querySelectorAll<HTMLElement>('button,[role="tab"]')].find(b => b.textContent?.includes(name)); expect(button).toBeTruthy(); await act(() => button!.click()); };
    expect(host.textContent).toContain('no execution');
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
    const figure = { id: 'two-frames', kind: 'concept' as const, rendererId: 'concept.table', title: 'Two frames', fallbackText: 'Two states', spec: { frames: [{}, {}] } };
    await act(() => root!.render(<FluentProvider theme={webLightTheme}><ChallengeWorkbench challenge={challenge} figure={figure} progress={createEmptyProgressState()} onProgressChange={() => {}} /></FluentProvider>));
    const button = (name: string) => [...host!.querySelectorAll<HTMLButtonElement>('button,[role="tab"]')].find(b => b.textContent?.includes(name))!;
    await act(() => button('Visualize').click());
    expect(button('Previous visual step').disabled).toBe(true);
    await act(() => button('Next visual step').click());
    expect(host.querySelector('[data-figure]')?.getAttribute('data-frame-index')).toBe('1');
    expect(button('Next visual step').disabled).toBe(true);
    for (let i = 0; i < 5; i++) await act(() => button('Next visual step').click());
    await act(() => button('Previous visual step').click());
    expect(host.querySelector('[data-figure]')?.getAttribute('data-frame-index')).toBe('0');
    expect(button('Next visual step').disabled).toBe(false);
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
