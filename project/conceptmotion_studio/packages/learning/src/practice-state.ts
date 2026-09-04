import { useCallback, useState } from 'react';
import { createEmptyProgressState, createGuardedStorageAdapter, parseProgressState, serializeProgressState, type ProgressStateV2 } from '@datapass/progress';

export interface PracticeWorkspaceState { schemaVersion: 1; progress: ProgressStateV2; notes: Readonly<Record<string, string>> }
export function parsePracticeWorkspace(source: string): PracticeWorkspaceState {
  const value = JSON.parse(source) as Partial<PracticeWorkspaceState>;
  if (!value || value.schemaVersion !== 1 || !value.notes || typeof value.notes !== 'object' || Array.isArray(value.notes)
    || !Object.values(value.notes).every(note => typeof note === 'string')) throw new Error('Invalid practice backup. Existing local data is unchanged.');
  return { schemaVersion: 1, progress: parseProgressState(JSON.stringify(value.progress)), notes: Object.fromEntries(Object.entries(value.notes).sort(([a], [b]) => a.localeCompare(b))) };
}
export function serializePracticeWorkspace(value: PracticeWorkspaceState): string {
  return JSON.stringify({ schemaVersion: 1, progress: JSON.parse(serializeProgressState(value.progress)), notes: Object.fromEntries(Object.entries(value.notes).sort(([a], [b]) => a.localeCompare(b))) }, null, 2);
}
export function usePracticeWorkspace(storageKey: string) {
  const [storage] = useState(() => { try { return createGuardedStorageAdapter(window.localStorage); } catch { return createGuardedStorageAdapter(null); } });
  const [initial] = useState(() => {
    const saved = storage.read(storageKey);
    if (saved) try { return { state: parsePracticeWorkspace(saved), protected: false }; } catch { return { state: { schemaVersion: 1 as const, progress: createEmptyProgressState(), notes: {} }, protected: true }; }
    return { state: { schemaVersion: 1 as const, progress: createEmptyProgressState(), notes: {} }, protected: false };
  });
  const recoveryWarning = 'Saved workspace could not be read and remains untouched. New changes are in memory only. Export them or explicitly import a valid backup to replace the saved value.';
  const [protectSavedValue, setProtectSavedValue] = useState(initial.protected);
  const [warning, setWarning] = useState(initial.protected ? recoveryWarning : '');
  const [state, setState] = useState<PracticeWorkspaceState>(initial.state);
  const update = useCallback((change: (current: PracticeWorkspaceState) => PracticeWorkspaceState, explicitlyReplaceInvalid = false) => {
    setState(current => {
      const next = change(current);
      if (protectSavedValue && !explicitlyReplaceInvalid) { setWarning(recoveryWarning); return next; }
      const saved = storage.write(storageKey, serializePracticeWorkspace(next));
      if (saved && explicitlyReplaceInvalid) setProtectSavedValue(false);
      setWarning(saved ? '' : 'Storage is unavailable. Export a backup before leaving this page.');
      return next;
    });
  }, [storage, storageKey, protectSavedValue]);
  return { state, warning, update,
    updateProgress: (change: (current: ProgressStateV2) => ProgressStateV2) => update(current => ({ ...current, progress: change(current.progress) })),
    setNote: (id: string, note: string) => update(current => ({ ...current, notes: { ...current.notes, [id]: note } })),
    exportJson: () => serializePracticeWorkspace(state),
    importJson: (source: string) => { const next = parsePracticeWorkspace(source); update(() => next, true); },
  };
}
