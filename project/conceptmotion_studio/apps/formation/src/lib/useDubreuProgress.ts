import { useCallback, useMemo, useState } from 'react';
import {
  ProgressStore,
  createEmptyProgressState,
  createGuardedStorageAdapter,
  serializeProgressState,
  type ProgressStateV2,
} from '@datapass/progress';

export function useDubreuProgress() {
  const store = useMemo(
    () => new ProgressStore(createGuardedStorageAdapter(typeof window === 'undefined' ? undefined : window.localStorage)),
    [],
  );
  const initial = useMemo(() => store.load(), [store]);
  const [state, setState] = useState<ProgressStateV2>(initial.state);
  const [persisted, setPersisted] = useState(initial.persisted);

  const update = useCallback((operation: (current: ProgressStateV2) => ProgressStateV2) => {
    setState((current) => {
      const next = operation(current);
      setPersisted(store.save(next));
      return next;
    });
  }, [store]);

  const importJson = useCallback((source: string) => {
    const result = store.importJson(source);
    setState(result.state);
    setPersisted(result.persisted);
  }, [store]);

  const reset = useCallback(() => {
    const empty = createEmptyProgressState();
    setPersisted(store.save(empty));
    setState(empty);
  }, [store]);

  return {
    state,
    update,
    persisted,
    loadSource: initial.source,
    warnings: initial.warnings,
    exportJson: () => serializeProgressState(state, 2),
    importJson,
    reset,
  };
}
