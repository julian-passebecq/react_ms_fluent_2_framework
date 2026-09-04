export interface ProgressStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export interface ProgressStorageAdapter {
  read(key: string): string | null;
  write(key: string, value: string): boolean;
  remove(key: string): boolean;
}

export interface MemoryProgressStorageAdapter extends ProgressStorageAdapter {
  snapshot(): Readonly<Record<string, string>>;
}

export function createGuardedStorageAdapter(storage: ProgressStorageLike | null | undefined): ProgressStorageAdapter {
  return {
    read(key) {
      if (!storage) return null;
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    write(key, value) {
      if (!storage) return false;
      try {
        storage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      if (!storage?.removeItem) return false;
      try {
        storage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };
}

export function createMemoryProgressStorage(initial: Readonly<Record<string, string>> = {}): MemoryProgressStorageAdapter {
  const values = new Map(Object.entries(initial));
  return {
    read: (key) => values.get(key) ?? null,
    write(key, value) {
      values.set(key, value);
      return true;
    },
    remove(key) {
      return values.delete(key);
    },
    snapshot() {
      return Object.fromEntries([...values.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0));
    }
  };
}
