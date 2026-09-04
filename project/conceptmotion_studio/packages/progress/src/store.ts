import { migrateV11ChallengeJson, parseLegacyProgressJson } from './migration';
import { parseProgressState, serializeProgressState } from './serialization';
import type { ProgressStorageAdapter } from './storage';
import {
  DEFAULT_PROGRESS_STORAGE_KEY,
  LEGACY_CHALLENGE_DRAFTS_KEY,
  LEGACY_CHALLENGE_PROGRESS_KEY,
  createEmptyProgressState,
  type ProgressStateV2
} from './types';
import { assertValidProgressState } from './validation';

export type ProgressLoadSource = 'current' | 'migrated-v1.1' | 'empty';

export interface ProgressLoadResult {
  readonly state: ProgressStateV2;
  readonly source: ProgressLoadSource;
  readonly persisted: boolean;
  readonly warnings: readonly string[];
}

export interface ProgressStoreOptions {
  readonly key?: string;
  readonly migrateLegacy?: boolean;
  readonly persistMigration?: boolean;
}

export interface ProgressImportResult {
  readonly state: ProgressStateV2;
  readonly persisted: boolean;
}

export class ProgressStore {
  readonly #storage: ProgressStorageAdapter;
  readonly #key: string;
  readonly #migrateLegacy: boolean;
  readonly #persistMigration: boolean;

  constructor(storage: ProgressStorageAdapter, options: ProgressStoreOptions = {}) {
    this.#storage = storage;
    this.#key = options.key ?? DEFAULT_PROGRESS_STORAGE_KEY;
    this.#migrateLegacy = options.migrateLegacy ?? true;
    this.#persistMigration = options.persistMigration ?? true;
  }

  load(): ProgressLoadResult {
    const warnings: string[] = [];
    const current = this.#storage.read(this.#key);
    if (current !== null) {
      try {
        return { state: parseProgressState(current), source: 'current', persisted: true, warnings };
      } catch (cause) {
        warnings.push(cause instanceof Error ? cause.message : String(cause));
      }
    }

    if (this.#migrateLegacy) {
      const legacyDrafts = this.#storage.read(LEGACY_CHALLENGE_DRAFTS_KEY);
      const legacyProgress = this.#storage.read(LEGACY_CHALLENGE_PROGRESS_KEY);
      if (legacyDrafts !== null || legacyProgress !== null) {
        const invalidLegacyKeys = [
          [LEGACY_CHALLENGE_DRAFTS_KEY, legacyDrafts],
          [LEGACY_CHALLENGE_PROGRESS_KEY, legacyProgress]
        ].flatMap(([key, value]) => {
          if (value === null) return [];
          const parsed = parseLegacyProgressJson(value);
          return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
            ? []
            : [key];
        });
        invalidLegacyKeys.forEach((key) => warnings.push(`Skipped invalid legacy progress value at ${key}.`));
        const state = migrateV11ChallengeJson(legacyDrafts, legacyProgress);
        const persisted = current === null && invalidLegacyKeys.length === 0 && this.#persistMigration
          ? this.save(state)
          : false;
        return { state, source: 'migrated-v1.1', persisted, warnings };
      }
    }
    return { state: createEmptyProgressState(), source: 'empty', persisted: false, warnings };
  }

  save(state: ProgressStateV2): boolean {
    return this.#storage.write(this.#key, serializeProgressState(assertValidProgressState(state), 0));
  }

  update(update: (current: ProgressStateV2) => ProgressStateV2): ProgressImportResult {
    const next = assertValidProgressState(update(this.load().state));
    return { state: next, persisted: this.save(next) };
  }

  exportJson(space = 2): string {
    return serializeProgressState(this.load().state, space);
  }

  importJson(source: string): ProgressImportResult {
    const state = parseProgressState(source);
    return { state, persisted: this.save(state) };
  }
}
