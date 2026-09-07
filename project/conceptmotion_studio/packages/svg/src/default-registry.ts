import { createRendererRegistry, type RendererRegistry } from './registry.js';
import { registerCollectionRenderers } from './renderers/collection.js';
import { registerDiagramRenderers } from './renderers/diagram.js';
import { registerJoinRenderers } from './renderers/join.js';
import { registerLineageRenderers } from './renderers/lineage.js';
import { registerLoopRenderers } from './renderers/loop.js';
import { registerRegressionRenderers } from './renderers/regression.js';
import { registerTableRenderers } from './renderers/table.js';
import { registerTableTraceRenderers } from './renderers/trace.js';
import { registerWorkflowRenderers } from './renderers/workflow.js';

export type RendererFamilyRegistrar = (registry: RendererRegistry) => void;

/**
 * Stable built-in renderer-family composition.
 *
 * Experimental or consumer-owned families should be supplied through the extension
 * argument instead of editing this list merely to exercise a renderer registry.
 * A new built-in semantic scene kind still requires an explicit reviewed addition.
 */
export const defaultRendererFamilyRegistrars: readonly RendererFamilyRegistrar[] = [
  registerCollectionRenderers,
  registerTableRenderers,
  registerTableTraceRenderers,
  registerJoinRenderers,
  registerLoopRenderers,
  registerRegressionRenderers,
  registerDiagramRenderers,
  registerLineageRenderers,
  registerWorkflowRenderers,
];

export function registerRendererFamilies(
  registry: RendererRegistry,
  registrars: readonly RendererFamilyRegistrar[],
): RendererRegistry {
  registrars.forEach((register) => register(registry));
  return registry;
}

export function registerDefaultRendererFamilies(
  registry: RendererRegistry,
  extensions: readonly RendererFamilyRegistrar[] = [],
): RendererRegistry {
  registerRendererFamilies(registry, defaultRendererFamilyRegistrars);
  return registerRendererFamilies(registry, extensions);
}

export function createDefaultRendererRegistry(
  extensions: readonly RendererFamilyRegistrar[] = [],
): RendererRegistry {
  return registerDefaultRendererFamilies(createRendererRegistry(), extensions);
}
