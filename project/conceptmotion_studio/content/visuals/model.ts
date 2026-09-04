import type { FigureSpec, JsonValue } from '@datapass/content';

export interface VisualMigration {
  readonly id: string;
  readonly domain: 'SQL' | 'Algorithms' | 'Data engineering' | 'ML / statistics';
  readonly classification: 'A' | 'B';
  readonly sourceFamily: string;
  readonly source: { readonly id: string; readonly label: string; readonly snapshot: string };
  readonly practiceIds: readonly string[];
  readonly invariant: string;
  readonly captions: readonly string[];
  readonly figure: FigureSpec;
}

// Full private source provenance lives only in non-bundled audit reports.
export const practiceSource = { id: 'source:visual-practice-v3', label: 'Author-provided coding-practice reference', snapshot: '2026-09-04' };
export const mlSource = { id: 'source:visual-ml-v3', label: 'Author-provided ML visual reference', snapshot: '2026-09-04' };

export function visual(id: string, title: string, domain: VisualMigration['domain'], rendererId: string, spec: unknown, captions: readonly string[], invariant: string, sourceFamily: string, practiceIds: readonly string[] = [], source = practiceSource): VisualMigration {
  return { id, domain, classification: 'A', sourceFamily, source, practiceIds, captions, invariant, figure: { id, kind: rendererId.startsWith('diagram') ? 'diagram' : rendererId.startsWith('workflow') ? 'workflow' : 'concept', title, rendererId, spec: JSON.parse(JSON.stringify(spec)) as JsonValue, takeaway: invariant, fallbackText: captions.join(' '), sourceIds: [source.id], conceptIds: [id], verifiedAt: source.snapshot, status: 'Pinned source migration; illustrative fixture', staticState: 0, reducedMotionState: 0, profile: 'professional' } };
}
