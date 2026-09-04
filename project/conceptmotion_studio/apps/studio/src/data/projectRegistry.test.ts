import { describe, expect, it } from 'vitest';
import { validateProjectRecord } from '@datapass/content';
import {
  PROJECT_REGISTRY_VERSION,
  projectRegistry,
  projectRegistryEntryNotes,
  projectRegistryValidationIssues,
} from './projectRegistry';

describe('Studio Project Registry fixture', () => {
  it('uses unique stable IDs and canonical V2 records', () => {
    expect(PROJECT_REGISTRY_VERSION).toBe('2');
    expect(new Set(projectRegistry.map((project) => project.id)).size).toBe(projectRegistry.length);
    expect(projectRegistry.map((project) => project.id)).toEqual([
      'project.portfolio',
      'project.d3-visual-studio',
      'project.datapass-visual-platform',
    ]);
    expect(projectRegistry.find((project) => project.id === 'project.portfolio')?.url).toBe('https://datapassj.com/');
    expect(projectRegistry.find((project) => project.id === 'project.d3-visual-studio')?.url).toBe('https://d3ecosite.netlify.app/sandbox/');
  });

  it('passes the canonical content contract and renders only safe destinations', () => {
    expect(projectRegistryValidationIssues).toEqual([]);
    projectRegistry.forEach((project) => {
      expect(validateProjectRecord(project).valid).toBe(true);
      expect(new URL(project.url).protocol).toBe('https:');
      if (project.repository) expect(new URL(project.repository).protocol).toBe('https:');
      expect(projectRegistryEntryNotes[project.id]).toBeDefined();
    });
  });

  it('describes local status without implying live monitoring', () => {
    expect(projectRegistryEntryNotes['project.portfolio'].statusMeaning).toContain('not monitored');
    expect(projectRegistryEntryNotes['project.datapass-visual-platform']).toMatchObject({
      destination: 'source',
      provenance: 'workspace-baseline',
    });
  });
});
