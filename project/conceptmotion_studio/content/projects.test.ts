import { describe, expect, it } from 'vitest';
import { validateContentCatalog } from '@datapass/content';
import { projectRegistry } from './projects';

describe('canonical public registry', () => {
  it('retains V2 IDs and validates additive V3 statuses', () => {
    expect(projectRegistry).toHaveLength(10);
    expect(validateContentCatalog({ version: '2', projects: projectRegistry }).valid).toBe(true);
    expect(projectRegistry.filter((record) => record.status === 'building')).toHaveLength(6);
  });
  it('contains only declared public destinations, never private metadata or placeholders', () => {
    const text = JSON.stringify(projectRegistry);
    expect(text).not.toMatch(/example\.invalid|private\.local|nextAction|localPath|token|password/i);
    for (const record of projectRegistry) expect(record.url).toMatch(/^https:\/\/(datapassj\.com|d3ecosite\.netlify\.app|mldatasc\.netlify\.app|github\.com\/julian-passebecq\/react_ms_fluent_2_framework)(\/|$)/);
  });
});
