import {
  resolveLocalizedText,
  validateDiagramSpec,
  layoutDiagram,
  type DiagramSpec,
  type EntityId,
  type FlowKind,
  type LocalizedText,
} from '@conceptmotion/core';

import { BaseSvgRenderer } from '../base-renderer.js';
import { ensureChild, setAccessibleText } from '../dom.js';
import type { RendererRegistration } from '../types.js';
import { renderGraph, type GraphRenderModel } from './graph.js';
import { localText, renderHeading } from './shared.js';

export interface DiagramRendererInput {
  spec: DiagramSpec;
  title?: LocalizedText;
  description?: LocalizedText;
  activeNodeIds?: readonly EntityId[];
  activeEdgeIds?: readonly EntityId[];
  failedNodeIds?: readonly EntityId[];
  focusedGroupId?: EntityId;
}

export class DiagramRenderer extends BaseSvgRenderer<DiagramRendererInput> {
  constructor() {
    super('diagram');
  }

  protected render(input: DiagramRendererInput): void {
    const validation = validateDiagramSpec(input.spec);
    if (!validation.valid) {
      throw new Error(`Invalid diagram "${input.spec.id}": ${validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')}`);
    }
    const surface = this.surface!;
    const options = this.options;
    const title = localText(input.title ?? input.spec.title, options) || input.spec.id;
    const description = localText(input.description ?? input.spec.description, options) || `${input.spec.nodes.length} nodes and ${input.spec.edges.length} semantic flows.`;
    renderHeading(surface, title, description, options);
    setAccessibleText(surface, title, description);
    const layer = ensureChild(surface.root, 'g[data-role="diagram"]', 'g', { 'data-role': 'diagram' });
    const activeNodes = new Set(input.activeNodeIds ?? []);
    const activeEdges = new Set(input.activeEdgeIds ?? []);
    const failedNodes = new Set(input.failedNodeIds ?? []);
    const model: GraphRenderModel = {
      id: input.spec.id,
      layoutResult: input.spec.layout?.provider ? layoutDiagram(input.spec) : undefined,
      semanticOnly: Boolean(input.spec.layout?.provider),
      semanticNodes: Boolean(input.spec.layout?.provider) && input.spec.layout?.density === 'comfortable',
      direction: input.spec.layout?.direction,
      focusedGroupId: input.focusedGroupId,
      nodes: input.spec.nodes.map((node) => ({
        id: node.id,
        label: resolveLocalizedText(node.label, options.locale ?? 'en'),
        kind: node.kind,
        groupId: node.groupId,
        iconId: node.iconId,
        ports: node.ports?.map((port) => ({
          id: port.id,
          label: resolveLocalizedText(port.label, options.locale ?? 'en'),
          side: port.side,
          role: port.role,
        })),
        preferredRank: node.preferredRank ?? input.spec.layout?.preferredRanks?.[node.id],
        status: failedNodes.has(node.id) ? 'failed' : activeNodes.has(node.id) ? 'running' : 'pending',
        metadata: node.metadata,
      })),
      edges: input.spec.edges.map((edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        label: resolveLocalizedText(edge.label, options.locale ?? 'en'),
        flowKind: (edge.flowKind ?? 'data') as FlowKind,
        active: activeEdges.has(edge.id),
      })),
      groups: input.spec.groups?.map((group) => ({
        id: group.id,
        label: resolveLocalizedText(group.label, options.locale ?? 'en'),
        kind: group.kind,
        childNodeIds: group.childNodeIds ?? input.spec.nodes.filter((node) => node.groupId === group.id).map((node) => node.id),
      })),
    };
    renderGraph(surface, layer, model, options, this.reducedMotion, this.durationMs);
  }
}

export const diagramRendererRegistration: RendererRegistration<DiagramRendererInput> = {
  id: 'diagram.flow',
  family: 'diagram',
  description: 'Reusable nodes, ports, routed edges, groups, and semantic data/control flow overlays.',
  create: () => new DiagramRenderer(),
};

export function registerDiagramRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void {
  registry.register(diagramRendererRegistration);
}
