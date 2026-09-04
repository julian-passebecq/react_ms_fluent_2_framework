import { describe, expect, it } from 'vitest';
import { challengeCatalog, modeledChallengeLanguages } from './challengeFixtures';

describe('challenge fixtures', () => {
  it('uses stable unique problem and variant IDs', () => {
    expect(new Set(challengeCatalog.map((challenge) => challenge.id)).size).toBe(challengeCatalog.length);
    for (const challenge of challengeCatalog) {
      expect(new Set(challenge.variants.map((variant) => variant.id)).size).toBe(challenge.variants.length);
    }
  });

  it('models every required language family', () => {
    const languages = new Set(challengeCatalog.flatMap((challenge) => challenge.variants.map((variant) => variant.language)));
    expect([...modeledChallengeLanguages].every((language) => languages.has(language))).toBe(true);
  });
});
