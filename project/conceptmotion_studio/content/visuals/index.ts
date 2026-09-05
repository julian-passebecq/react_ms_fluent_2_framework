import type { ContentSource, FigureSpec } from '@datapass/content';
import { algorithmVisuals } from './algorithms';
import { sqlVisuals } from './sql';
import { systemsVisuals } from './systems';
import { refineVisual } from './refinements';
export { refinedVisualIds } from './refinements';
export type { VisualMigration } from './model';

/** Shared content, not a renderer package or consumer-specific state store. */
export const migratedVisuals = [...sqlVisuals, ...algorithmVisuals, ...systemsVisuals].map(refineVisual);
export const migratedFigures = migratedVisuals.map(entry => entry.figure);
export const visualById = (id: string) => migratedVisuals.find(entry => entry.id === id);
export const figureForPracticeId = (sourceId: string): FigureSpec | undefined => migratedVisuals.find(entry => entry.practiceIds.includes(sourceId))?.figure;
export const visualSources: ContentSource[] = [...new Map(migratedVisuals.map(entry => [entry.source.id, { id: entry.source.id, title: entry.source.label, attribution: 'Julian Passebecq. Semantic adaptation with newly authored illustrative data; no source UI copied. Private source locations remain in audit reports.' }])).values()];
