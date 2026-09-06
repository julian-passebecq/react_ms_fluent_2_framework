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

export function registerDefaultRendererFamilies(registry: RendererRegistry): RendererRegistry {
  registerCollectionRenderers(registry);
  registerTableRenderers(registry);
  registerTableTraceRenderers(registry);
  registerJoinRenderers(registry);
  registerLoopRenderers(registry);
  registerRegressionRenderers(registry);
  registerDiagramRenderers(registry);
  registerLineageRenderers(registry);
  registerWorkflowRenderers(registry);
  return registry;
}

export function createDefaultRendererRegistry(): RendererRegistry {
  return registerDefaultRendererFamilies(createRendererRegistry());
}
