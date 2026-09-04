import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROGRESS_STORAGE_KEY,
  LEGACY_CHALLENGE_DRAFTS_KEY,
  LEGACY_CHALLENGE_PROGRESS_KEY,
  ProgressStore,
  appendAssessmentAttempt,
  assertValidProgressState,
  computeProgressBreakdown,
  createAssessmentScore,
  createEmptyProgressState,
  createGuardedStorageAdapter,
  createMemoryProgressStorage,
  migrateV11ChallengeJson,
  migrateV11ChallengeState,
  parseProgressState,
  serializeProgressState,
  setChallengeDraft,
  updateChallengeProgress,
  updateLessonProgress,
  validateProgressState,
  type AssessmentAttempt,
  type ProgressStorageLike
} from '../src/index';

describe('versioned progress state', () => {
  it('creates a valid empty v2 state', () => {
    const state = createEmptyProgressState();
    expect(state.schemaVersion).toBe(2);
    expect(validateProgressState(state)).toEqual({ valid: true, issues: [] });
  });

  it('updates challenge drafts and flags immutably with stable keys', () => {
    const empty = createEmptyProgressState();
    const withZ = setChallengeDraft(empty, 'challenge-z', 'sql', 'SELECT 1');
    const withA = setChallengeDraft(withZ, 'challenge-a', 'python', 'print(1)');
    const mastered = updateChallengeProgress(withA, 'challenge-a', { mastered: true, review: true, flagged: true });
    expect(empty.challenges).toEqual({});
    expect(Object.keys(mastered.challenges)).toEqual(['challenge-a', 'challenge-z']);
    expect(mastered.challenges['challenge-a']).toMatchObject({
      status: 'completed', mastered: true, review: true, flagged: true,
      drafts: { python: 'print(1)' }
    });
  });

  it('tracks lesson completion and recent position consistently', () => {
    let state = updateLessonProgress(createEmptyProgressState(), 'lesson.sql.where', {
      courseId: 'course.sql',
      status: 'in-progress',
      recentPosition: { cellId: 'cell-4', step: 2, offset: 120 },
      lastVisitedAt: '2026-09-04T10:00:00Z'
    });
    state = updateLessonProgress(state, 'lesson.sql.where', {
      status: 'completed',
      completedAt: '2026-09-04T10:10:00Z'
    });
    expect(state.lessons['lesson.sql.where']).toMatchObject({ status: 'completed', completed: true });
    expect(validateProgressState(state).valid).toBe(true);
  });

  it('rejects inconsistent completion and returns structured paths', () => {
    const invalid = {
      ...createEmptyProgressState(),
      lessons: { bad: { id: 'bad', status: 'completed', completed: false } }
    };
    const validation = validateProgressState(invalid);
    expect(validation.valid).toBe(false);
    expect(validation.issues[0]).toMatchObject({ code: 'progress.lesson.completion.mismatch', path: 'lessons.bad' });
    expect(() => assertValidProgressState(invalid)).toThrow(/Invalid progress state/);
  });
});

describe('assessment attempts and breakdown', () => {
  const attempt: AssessmentAttempt = {
    id: 'attempt-1',
    assessmentId: 'assessment.sql',
    status: 'submitted',
    startedAt: '2026-09-04T11:00:00Z',
    submittedAt: '2026-09-04T11:05:00Z',
    answers: {
      'q-join': {
        questionId: 'q-join', value: 'left', correct: true,
        domainIds: ['sql'], conceptIds: ['join', 'join']
      },
      'q-window': {
        questionId: 'q-window', value: false, correct: false,
        domainIds: ['sql'], conceptIds: ['window']
      }
    },
    score: createAssessmentScore(1, 2, 70)
  };

  it('records stable attempts and computes domain/concept breakdown', () => {
    const state = appendAssessmentAttempt(createEmptyProgressState(), 'assessment.sql', attempt);
    expect(state.assessments['assessment.sql'].attempts).toHaveLength(1);
    expect(computeProgressBreakdown(state)).toEqual({
      domains: [{ id: 'sql', answers: 2, correct: 1, earned: 1, possible: 2, percent: 50 }],
      concepts: [
        { id: 'join', answers: 1, correct: 1, earned: 1, possible: 1, percent: 100 },
        { id: 'window', answers: 1, correct: 0, earned: 0, possible: 1, percent: 0 }
      ]
    });
    expect(validateProgressState(state).valid).toBe(true);
  });

  it('prevents duplicate attempt IDs and invalid score ranges', () => {
    const state = appendAssessmentAttempt(createEmptyProgressState(), 'assessment.sql', attempt);
    expect(() => appendAssessmentAttempt(state, 'assessment.sql', attempt)).toThrow(/already exists/);
    expect(() => createAssessmentScore(3, 2)).toThrow(/earned/);
  });
});

describe('v1.1 challenge migration', () => {
  it('preserves drafts and status flags with deterministic challenge/variant IDs', () => {
    const state = migrateV11ChallengeState(
      {
        'challenge:advanced:sql': 'SELECT advanced',
        'challenge-basic:python': 'print("ok")',
        'draft-only:default': 'draft'
      },
      {
        'challenge-basic': { mastered: true, review: true },
        'challenge:advanced': { flagged: true }
      }
    );
    expect(Object.keys(state.challenges)).toEqual(['challenge-basic', 'challenge:advanced', 'draft-only']);
    expect(state.challenges['challenge:advanced']).toMatchObject({
      status: 'in-progress', flagged: true, drafts: { sql: 'SELECT advanced' }
    });
    expect(state.challenges['challenge-basic']).toMatchObject({
      status: 'completed', mastered: true, review: true, drafts: { python: 'print("ok")' }
    });
  });

  it('produces identical JSON regardless of legacy object insertion order', () => {
    const first = migrateV11ChallengeState({ 'b:v': 'b', 'a:v': 'a' }, { b: { flagged: true }, a: {} });
    const second = migrateV11ChallengeState({ 'a:v': 'a', 'b:v': 'b' }, { a: {}, b: { flagged: true } });
    expect(serializeProgressState(first, 0)).toBe(serializeProgressState(second, 0));
    expect(migrateV11ChallengeJson('{', '{')).toEqual(createEmptyProgressState());
  });
});

describe('guarded storage and import/export', () => {
  it('loads and persists deterministic v1.1 migration without deleting legacy data', () => {
    const storage = createMemoryProgressStorage({
      [LEGACY_CHALLENGE_DRAFTS_KEY]: JSON.stringify({ 'cross-join:sql': 'SELECT *' }),
      [LEGACY_CHALLENGE_PROGRESS_KEY]: JSON.stringify({ 'cross-join': { mastered: true, flagged: true } })
    });
    const loaded = new ProgressStore(storage).load();
    expect(loaded).toMatchObject({ source: 'migrated-v1.1', persisted: true, warnings: [] });
    expect(loaded.state.challenges['cross-join']).toMatchObject({ mastered: true, flagged: true });
    expect(storage.snapshot()[DEFAULT_PROGRESS_STORAGE_KEY]).toBe(serializeProgressState(loaded.state, 0));
    expect(storage.snapshot()[LEGACY_CHALLENGE_DRAFTS_KEY]).toBeDefined();
    expect(new ProgressStore(storage).load().source).toBe('current');
  });

  it('does not overwrite malformed legacy values during migration', () => {
    const storage = createMemoryProgressStorage({
      [LEGACY_CHALLENGE_DRAFTS_KEY]: '{',
      [LEGACY_CHALLENGE_PROGRESS_KEY]: JSON.stringify({ valid: { flagged: true } })
    });
    const loaded = new ProgressStore(storage).load();
    expect(loaded).toMatchObject({ source: 'migrated-v1.1', persisted: false });
    expect(loaded.warnings).toEqual([
      `Skipped invalid legacy progress value at ${LEGACY_CHALLENGE_DRAFTS_KEY}.`
    ]);
    expect(loaded.state.challenges.valid).toMatchObject({ flagged: true });
    expect(storage.snapshot()[DEFAULT_PROGRESS_STORAGE_KEY]).toBeUndefined();
    expect(storage.snapshot()[LEGACY_CHALLENGE_DRAFTS_KEY]).toBe('{');
  });

  it('round-trips validated deterministic JSON', () => {
    const storage = createMemoryProgressStorage();
    const store = new ProgressStore(storage);
    const state = setChallengeDraft(createEmptyProgressState(), 'b', 'default', 'draft');
    expect(store.save(state)).toBe(true);
    const exported = store.exportJson(0);
    expect(parseProgressState(exported)).toEqual(state);
    const destination = new ProgressStore(createMemoryProgressStorage());
    expect(destination.importJson(exported)).toMatchObject({ state, persisted: true });
    expect(() => destination.importJson('{"schemaVersion":1}')).toThrow(/progress state/);
  });

  it('never throws when host storage is unavailable', () => {
    const blocked: ProgressStorageLike = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); }
    };
    const storage = createGuardedStorageAdapter(blocked);
    const store = new ProgressStore(storage);
    expect(store.load()).toMatchObject({ source: 'empty', persisted: false });
    expect(store.save(createEmptyProgressState())).toBe(false);
    expect(storage.remove(DEFAULT_PROGRESS_STORAGE_KEY)).toBe(false);
  });
});
