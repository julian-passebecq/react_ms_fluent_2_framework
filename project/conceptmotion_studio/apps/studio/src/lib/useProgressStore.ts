import { useCallback, useMemo, useState } from 'react';
import {
  ProgressStore,
  createGuardedStorageAdapter,
  type ProgressStateV2,
} from '@datapass/progress';

export function useProgressStore() {
  const store = useMemo(
    () => new ProgressStore(createGuardedStorageAdapter(typeof window === 'undefined' ? undefined : window.localStorage)),
    [],
  );
  const [state, setState] = useState<ProgressStateV2>(() => store.load().state);
  const update = useCallback((operation: (current: ProgressStateV2) => ProgressStateV2) => {
    setState((current) => {
      const next = operation(current);
      store.save(next);
      return next;
    });
  }, [store]);
  return { state, update, exportJson: () => store.exportJson() };
}
