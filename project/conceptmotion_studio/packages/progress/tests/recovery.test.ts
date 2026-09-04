import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROGRESS_STORAGE_KEY, LEGACY_CHALLENGE_DRAFTS_KEY, LEGACY_CHALLENGE_PROGRESS_KEY,
  ProgressStore, appendAssessmentAttempt, computeProgressBreakdown, createAssessmentScore,
  createEmptyProgressState, createGuardedStorageAdapter, createMemoryProgressStorage,
  migrateV11ChallengeState, setChallengeDraft, updateChallengeProgress, updateLessonProgress, validateProgressState,
  type AssessmentAttempt,
} from '../src';

describe('progress recovery without data loss', () => {
  it('does not overwrite a corrupt or future current snapshot when legacy migration is available', () => {
    for (const current of ['{', '{"schemaVersion":99}']) {
      const storage = createMemoryProgressStorage({
        [DEFAULT_PROGRESS_STORAGE_KEY]: current,
        [LEGACY_CHALLENGE_DRAFTS_KEY]: '{"lesson:sql":"SELECT saved"}',
      });
      const loaded = new ProgressStore(storage).load();
      expect(loaded.source).toBe('migrated-v1.1');
      expect(loaded.persisted).toBe(false);
      expect(loaded.warnings).not.toHaveLength(0);
      expect(loaded.state.challenges.lesson.drafts.sql).toBe('SELECT saved');
      expect(storage.read(DEFAULT_PROGRESS_STORAGE_KEY)).toBe(current);
    }
  });

  it('honors opt-out migration, nonpersisted preview and isolated storage keys', () => {
    const storage = createMemoryProgressStorage({ [LEGACY_CHALLENGE_PROGRESS_KEY]: '{"legacy":{"flagged":true}}' });
    expect(new ProgressStore(storage, { migrateLegacy: false }).load().source).toBe('empty');
    expect(new ProgressStore(storage, { persistMigration: false }).load()).toMatchObject({ source: 'migrated-v1.1', persisted: false });
    expect(storage.read(DEFAULT_PROGRESS_STORAGE_KEY)).toBeNull();
    const store = new ProgressStore(storage, { key: 'isolated', migrateLegacy: false });
    expect(store.update((state) => setChallengeDraft(state, 'new', 'sql', 'SELECT 1')).persisted).toBe(true);
    const before = storage.snapshot();
    expect(() => store.importJson('{"schemaVersion":99}')).toThrow();
    expect(storage.snapshot()).toEqual(before);
    expect(storage.read(DEFAULT_PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it('supports an absent host, optional removal and successful guarded storage without browser globals', () => {
    const absent = createGuardedStorageAdapter(undefined);
    expect(absent.read('a')).toBeNull();
    expect(absent.write('a', 'b')).toBe(false);
    expect(absent.remove('a')).toBe(false);
    const memory = createMemoryProgressStorage();
    const guarded = createGuardedStorageAdapter({ getItem: memory.read, setItem: memory.write, removeItem: memory.remove });
    expect(guarded.write('z', 'one')).toBe(true);
    expect(guarded.read('z')).toBe('one');
    expect(guarded.remove('z')).toBe(true);
    expect(guarded.read('z')).toBeNull();
    expect(createGuardedStorageAdapter({ getItem: memory.read, setItem: memory.write }).remove('z')).toBe(false);
  });

  it('migrates ambiguous legacy IDs by longest known prefix while skipping invalid drafts', () => {
    const state = migrateV11ChallengeState({
      'task:advanced:sql': 'advanced', 'task:': 'default', task: 'plain',
      ' ': 'skip', malformed: 42,
    }, { task: { review: true }, 'task:advanced': { flagged: true }, ' ': null });
    expect(state.challenges.task.drafts).toEqual({ default: 'default' });
    expect(state.challenges['task:advanced'].drafts).toEqual({ sql: 'advanced' });
    expect(state.challenges.malformed).toBeUndefined();
    expect(validateProgressState(state).valid).toBe(true);
  });
});

describe('assessment and lesson transitions', () => {
  it('reopens a completed lesson and preserves mastery when editing a completed challenge', () => {
    const completed = updateLessonProgress(createEmptyProgressState(), 'lesson', { completed: true });
    expect(completed.lessons.lesson.status).toBe('completed');
    expect(updateLessonProgress(completed, 'lesson', { completed: false }).lessons.lesson.status).toBe('in-progress');
    const mastered = updateChallengeProgress(completed, 'challenge', { mastered: true });
    expect(setChallengeDraft(mastered, 'challenge', 'sql', 'revised', '2026-09-04').challenges.challenge)
      .toMatchObject({ status: 'completed', mastered: true, updatedAt: '2026-09-04' });
    expect(() => setChallengeDraft(completed, ' ', 'sql', 'draft')).toThrow(/non-empty/);
    expect(() => setChallengeDraft(completed, 'challenge', ' ', 'draft')).toThrow(/non-empty/);
  });

  it('separates active/ungraded attempts from submitted weighted domain results', () => {
    const active: AssessmentAttempt = { id: 'active', assessmentId: 'interview', status: 'in-progress', answers: {} };
    let state = appendAssessmentAttempt(createEmptyProgressState(), 'interview', active);
    expect(state.assessments.interview.activeAttemptId).toBe('active');
    expect(computeProgressBreakdown(state)).toEqual({ concepts: [], domains: [] });
    const submitted: AssessmentAttempt = {
      id: 'submitted', assessmentId: 'interview', status: 'submitted', answers: {
        weighted: { questionId: 'weighted', value: 'answer', pointsEarned: 1, pointsPossible: 2, domainIds: ['sql'], conceptIds: ['join'] },
        ungraded: { questionId: 'ungraded', value: 'pending', domainIds: ['ungraded'] },
        zero: { questionId: 'zero', value: false, correct: false, pointsPossible: 0, domainIds: ['zero'] },
      },
    };
    state = appendAssessmentAttempt(state, 'interview', submitted);
    expect(state.assessments.interview.activeAttemptId).toBeUndefined();
    expect(computeProgressBreakdown(state).domains).toEqual([
      { id: 'sql', answers: 1, correct: 0, earned: 1, possible: 2, percent: 50 },
      { id: 'zero', answers: 1, correct: 0, earned: 0, possible: 0, percent: 0 },
    ]);
    expect(() => appendAssessmentAttempt(state, 'other', active)).toThrow(/assessmentId/);
    expect(createAssessmentScore(0, 0, 70)).toEqual({ earned: 0, possible: 0, percent: 0, passed: false });
    for (const threshold of [-1, 101, NaN]) expect(() => createAssessmentScore(1, 2, threshold)).toThrow(/passingPercent/);
  });
});
