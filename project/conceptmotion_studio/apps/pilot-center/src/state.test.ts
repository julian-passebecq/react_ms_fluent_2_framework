import { describe, expect, it } from 'vitest';
import { createMemoryProgressStorage } from '@datapass/progress';
import { projectRegistry } from '../../../content/projects';
import { emptyPilotState, loadPilotState, orderedNotes, parsePilotBackup, parsePrivateOverlay, PILOT_STORAGE_KEY, safeLink, serializePilotBackup, validatePilotState, type IdeaNote } from './state';

const ids = new Set(projectRegistry.map((project) => project.id));
const note = (id = 'idea.first'): IdeaNote => ({ id, title: 'Review SQL reasoning', domain: 'sql', context: 'project', priority: 'next', status: 'todo', tags: ['sql'], pinned: false, projectId: 'project.formation', createdAt: '2026-09-04T00:00:00Z', updatedAt: '2026-09-04T00:00:00Z' });

describe('Pilot local data contracts', () => {
  it('round-trips all note/overlay fields with stable ID/tag ordering and no clock dependency', () => {
    const state = { ...emptyPilotState(), notes: [{ ...note('idea.z'), body: 'Reason first', url: 'https://example.test/note', tags: ['z', 'sql', 'sql'] }, note('idea.a')], overlays: [{ projectId: 'project.formation', nextAction: 'Review module', annotation: 'Local only', status: 'building' as const, privateRepository: 'https://example.test/local-reference' }] };
    const serialized = serializePilotBackup(state, ids);
    expect(serialized).toBe(serializePilotBackup({ ...state, notes: [...state.notes].reverse() }, ids));
    expect(serializePilotBackup(parsePilotBackup(serialized, ids), ids)).toBe(serialized);
    expect(parsePilotBackup(serialized, ids).notes[1].tags).toEqual(['sql', 'z']);
  });

  it('rejects incompatible schemas, duplicate IDs, unsafe links, invalid enums and dangling projects', () => {
    const valid = { ...emptyPilotState(), notes: [note()] };
    for (const value of [null, { ...valid, schemaVersion: 2 }, { ...valid, unknown: true }, { ...valid, notes: [note(), note()] },
      { ...valid, notes: [{ ...note(), url: 'javascript:alert(1)' }] }, { ...valid, notes: [{ ...note(), domain: 'unknown' }] },
      { ...valid, notes: [{ ...note(), projectId: 'missing' }] }, { ...valid, notes: [{ ...note(), pinned: 'yes' }] },
      { ...valid, notes: [{ ...note(), updatedAt: '2020-01-01T00:00:00Z' }] }, { ...valid, notes: [{ ...note(), createdAt: 'yesterday' }] },
    ]) expect(() => validatePilotState(value, ids)).toThrow();
    expect(() => parsePilotBackup('{', ids)).toThrow(/Invalid JSON/);
    expect(() => parsePilotBackup(' '.repeat(1_000_001), ids)).toThrow(/1 MB/);
    expect(() => safeLink('https://user:secret@example.test')).toThrow(/credentials/);
    expect(safeLink('http://127.0.0.1:4173/#/workbench')).toBe('http://127.0.0.1:4173/#/workbench');
  });

  it('imports only explicitly supplied runtime overlays for known projects', () => {
    const originalRegistry = JSON.stringify(projectRegistry);
    const overlays = parsePrivateOverlay('{"schemaVersion":1,"overlays":[{"projectId":"project.formation","nextAction":"Review","privateRepository":"https://example.test/local-only"}]}', ids);
    expect(overlays[0]).toMatchObject({ projectId: 'project.formation', nextAction: 'Review' });
    expect(JSON.stringify(projectRegistry)).toBe(originalRegistry);
    expect(() => parsePrivateOverlay('{"schemaVersion":1,"overlays":[],"notes":[]}', ids)).toThrow(/not supported/);
    expect(() => parsePrivateOverlay('{"schemaVersion":1,"overlays":[{"projectId":"unknown"}]}', ids)).toThrow(/unknown public project/);
  });

  it('protects corrupt stored data and keeps the storage adapter replaceable', () => {
    const storage = createMemoryProgressStorage({ [PILOT_STORAGE_KEY]: '{corrupt' });
    const loaded = loadPilotState(storage, ids);
    expect(loaded.protectedRaw).toBe('{corrupt');
    expect(loaded.warning).toContain('kept untouched');
    expect(storage.read(PILOT_STORAGE_KEY)).toBe('{corrupt');
    const memory = createMemoryProgressStorage();
    expect(loadPilotState(memory, ids).state).toEqual(emptyPilotState());
    memory.write(PILOT_STORAGE_KEY, serializePilotBackup({ ...emptyPilotState(), notes: [note()] }, ids));
    expect(loadPilotState(memory, ids).state.notes).toHaveLength(1);
  });

  it('sorts pin/priority without mutating input or requiring drag coordinates', () => {
    const notes = [{ ...note('later'), priority: 'later' as const, pinned: true }, { ...note('urgent'), priority: 'urgent' as const }, note('next')];
    expect(orderedNotes(notes).map((value) => value.id)).toEqual(['later', 'urgent', 'next']);
    expect(notes.map((value) => value.id)).toEqual(['later', 'urgent', 'next']);
  });
});
