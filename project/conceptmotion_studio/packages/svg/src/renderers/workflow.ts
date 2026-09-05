import {
  compileWorkflowRunFrame,
  getWorkflowEdgeId,
  layeredDiagramLayout,
  resolveLocalizedText,
  validateWorkflowSpec,
  type CompiledWorkflowRunFrame,
  type FlowKind,
  type LocalizedText,
  type WorkflowDependencyCondition,
  type WorkflowPreset,
  type WorkflowSpec,
} from '@conceptmotion/core';

import { BaseSvgRenderer } from '../base-renderer.js';
import { explanationPanelHeight, renderExplanationPanel, resolveSceneExplanation } from '../explanation.js';
import { ensureChild, setAccessibleText, setAttributes, setText } from '../dom.js';
import type { RendererRegistration } from '../types.js';
import { renderGraph, type GraphEdgeModel, type GraphRenderModel } from './graph.js';
import { localText, renderHeading } from './shared.js';

export type WorkflowRenderMode = 'topology' | 'run';

/** Adapt task topology to the existing deterministic layout; run state stays in WorkflowSpec. */
export function workflowGeometry(spec: WorkflowSpec, focusedGroupId?: string) {
  const focus = spec.groups?.find(group => group.id === focusedGroupId);
  const ids = new Set(focus ? focus.childNodeIds ?? spec.nodes.filter(node => node.groupId === focus.id).map(node => node.id) : spec.nodes.map(node => node.id));
  const layout = layeredDiagramLayout.layout({
    kind: 'diagram', version: spec.version, id: spec.id, title: spec.title,
    layout: { direction: spec.layout?.direction ?? 'lr', density: spec.layout?.density },
    nodes: spec.nodes.filter(node => ids.has(node.id)).map(node => ({ id: node.id, label: node.label, groupId: node.groupId })),
    edges: spec.edges.flatMap((edge, index) => ids.has(edge.from) && ids.has(edge.to) ? [{ id: getWorkflowEdgeId(edge, index), from: { nodeId: edge.from }, to: { nodeId: edge.to } }] : []),
    groups: spec.groups?.map(group => ({ id: group.id, label: group.label, childNodeIds: (group.childNodeIds ?? []).filter(id => ids.has(id)) })),
  });
  // Retain the graph renderer's port-aware orthogonal dependency routes.
  return { ...layout, edgeRoutes: {} };
}

export interface WorkflowRendererInput {
  spec: WorkflowSpec;
  frame?: CompiledWorkflowRunFrame;
  mode?: WorkflowRenderMode;
  focusedGroupId?: string;
  preset?: WorkflowPreset;
  title?: LocalizedText;
  description?: LocalizedText;
}

export interface ResolveWorkflowRendererInputOptions {
  frameIndex?: number;
  runId?: string;
  mode?: WorkflowRenderMode;
  focusedGroupId?: string;
  preset?: WorkflowPreset;
}

/** Selects and compiles a declared run frame through the core workflow engine. */
export function resolveWorkflowRendererInput(
  spec: WorkflowSpec,
  options: ResolveWorkflowRendererInputOptions = {},
): WorkflowRendererInput {
  const mode = options.mode ?? 'topology';
  const selectedRunId = options.runId ?? spec.runs?.[0]?.id;
  let frame: CompiledWorkflowRunFrame | undefined;
  if (mode === 'run' && selectedRunId) {
    const run = spec.runs?.find((candidate) => candidate.id === selectedRunId);
    if (!run) throw new Error(`Unknown workflow run "${selectedRunId}" in workflow "${spec.id}".`);
    if (run.frames.length > 0) {
      const requested = Number.isFinite(options.frameIndex) ? Math.trunc(options.frameIndex ?? 0) : 0;
      const index = Math.max(0, Math.min(run.frames.length - 1, requested));
      frame = compileWorkflowRunFrame(spec, selectedRunId, index);
    }
  }
  return {
    spec,
    frame,
    mode,
    focusedGroupId: options.focusedGroupId,
    preset: options.preset,
  };
}

function conditionFlowKind(condition: WorkflowDependencyCondition | undefined): FlowKind {
  if (condition === 'success') return 'success';
  if (condition === 'failure') return 'failure';
  if (condition === 'completion') return 'completion';
  if (condition === 'skip') return 'skip';
  if (condition === 'true' || condition === 'false') return 'control';
  return 'dependency';
}

function activeDependency(sourceStatus: string, targetStatus: string): boolean {
  return (
    sourceStatus === 'running' ||
    sourceStatus === 'success' ||
    sourceStatus === 'failed' ||
    targetStatus === 'queued' ||
    targetStatus === 'running'
  );
}

function presetLabel(preset: WorkflowPreset): string {
  if (preset === 'fabric-data-factory') return 'FABRIC';
  if (preset === 'azure-data-factory') return 'ADF';
  if (preset === 'databricks-lakeflow') return 'LAKEFLOW';
  return preset.toUpperCase();
}

export class WorkflowRenderer extends BaseSvgRenderer<WorkflowRendererInput> {
  constructor() {
    super('workflow');
  }

  protected render(input: WorkflowRendererInput): void {
    const validation = validateWorkflowSpec(input.spec);
    if (!validation.valid) {
      throw new Error(`Invalid workflow "${input.spec.id}": ${validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')}`);
    }
    const surface = this.surface!;
    const options = this.options;
    const explanation = resolveSceneExplanation(input.spec, input.frame?.index ?? 0);
    const mode = input.mode ?? (input.frame ? 'run' : 'topology');
    const preset = input.preset ?? input.spec.preset ?? 'generic';
    const title = localText(input.title ?? input.spec.title, options) || input.spec.id;
    const running = Object.values(input.frame?.states ?? {}).filter((state) => state.status === 'running').length;
    const failed = Object.values(input.frame?.states ?? {}).filter((state) => state.status === 'failed').length;
    const description = explanation ? localText(explanation.step.title, options) :
      localText(input.description ?? input.spec.description, options) ||
      (mode === 'run'
        ? `${presetLabel(preset)} · run ${input.frame?.runId ?? 'not selected'}, frame ${input.frame?.frameId ?? 'topology'} · ${running} running, ${failed} failed.`
        : `${presetLabel(preset)} topology · ${input.spec.nodes.length} tasks and ${input.spec.edges.length} dependencies.`);
    renderHeading(surface, title, description, options);
    setAccessibleText(surface, title, description);
    const layer = ensureChild(surface.root, 'g[data-role="workflow"]', 'g', { 'data-role': 'workflow' });
    setAttributes(layer, { 'data-mode': mode, 'data-preset': preset, 'data-focused-group-id': input.focusedGroupId });

    const focusGroup = input.focusedGroupId
      ? input.spec.groups?.find((group) => group.id === input.focusedGroupId)
      : undefined;
    const visibleNodeIds = focusGroup
      ? new Set(focusGroup.childNodeIds ?? input.spec.nodes.filter((node) => node.groupId === focusGroup.id).map((node) => node.id))
      : new Set(input.spec.nodes.map((node) => node.id));
    const nodes = input.spec.nodes.filter((node) => visibleNodeIds.has(node.id));
    const states = input.frame?.states ?? {};

    const graphEdges: GraphEdgeModel[] = [];
    input.spec.edges.forEach((edge, edgeIndex) => {
      if (!visibleNodeIds.has(edge.from) || !visibleNodeIds.has(edge.to)) return;
      const id = getWorkflowEdgeId(edge, edgeIndex);
      const sourceStatus = states[edge.from]?.status ?? 'pending';
      const targetStatus = states[edge.to]?.status ?? 'pending';
      const active = mode === 'run' && activeDependency(sourceStatus, targetStatus);
      graphEdges.push({
        id,
        from: { nodeId: edge.from, portId: edge.fromPortId },
        to: { nodeId: edge.to, portId: edge.toPortId },
        label: resolveLocalizedText(edge.label, options.locale ?? 'en') || (edge.condition ?? 'dependency').replaceAll('_', ' '),
        flowKind: conditionFlowKind(edge.condition),
        active,
        offset: edge.dataFlowKind ? -5 : 0,
      });
      if (edge.dataFlowKind) {
        graphEdges.push({
          id: `${id}:data`,
          from: { nodeId: edge.from, portId: edge.fromPortId },
          to: { nodeId: edge.to, portId: edge.toPortId },
          label: `data · ${edge.dataFlowKind.replaceAll('data-', '')}`,
          flowKind: edge.dataFlowKind,
          active,
          offset: 6,
        });
      }
    });

    const model: GraphRenderModel = {
      explanationFocusIds: explanation?.step.focus.entityIds,
      layoutResult: explanation ? workflowGeometry(input.spec, input.focusedGroupId) : undefined,
      availableHeight: explanation ? surface.viewport.height - explanationPanelHeight(explanation) - 24 : undefined,
      id: input.spec.id,
      direction: input.spec.layout?.direction ?? 'lr',
      focusedGroupId: input.focusedGroupId,
      nodes: nodes.map((node) => {
        const state = states[node.id] ?? { status: 'pending' as const };
        return {
          id: node.id,
          label: resolveLocalizedText(node.label, options.locale ?? 'en'),
          kind: node.taskType ?? node.providerType ?? 'task',
          groupId: node.groupId,
          iconId: node.iconId,
          ports: node.ports?.map((port) => ({
            id: port.id,
            label: resolveLocalizedText(port.label, options.locale ?? 'en'),
            side: port.side,
            role: port.role,
          })),
          status: mode === 'run' ? state.status : 'pending',
          statusLabel:
            mode === 'run' && state.attempt && state.attempt > 1
              ? `${state.status} · attempt ${state.attempt}`
              : state.status,
          metadata: node.metadata,
        };
      }),
      edges: graphEdges,
      groups: input.spec.groups
        ?.filter((group) => !focusGroup || group.id === focusGroup.id)
        .map((group) => ({
          id: group.id,
          label: resolveLocalizedText(group.label, options.locale ?? 'en'),
          kind: group.kind,
          childNodeIds: (group.childNodeIds ?? input.spec.nodes.filter((node) => node.groupId === group.id).map((node) => node.id)).filter((id) => visibleNodeIds.has(id)),
          status: states[group.id]?.status,
        })),
    };
    renderGraph(surface, layer, model, options, this.reducedMotion, this.durationMs);
    renderExplanationPanel(surface, explanation, surface.viewport.height - explanationPanelHeight(explanation) - 16, options.locale);

    const breadcrumb = ensureChild(surface.root, 'text[data-role="breadcrumb"]', 'text', {
      'data-role': 'breadcrumb',
      x: 20,
      y: 67,
      fill: surface.theme.mutedInk,
      'font-size': 9,
      'font-weight': 650,
    });
    setText(
      breadcrumb,
      focusGroup
        ? `${presetLabel(preset)} / ${resolveLocalizedText(focusGroup.label, options.locale ?? 'en')}`
        : `${presetLabel(preset)} / ALL TASKS`,
    );
  }
}

export const workflowRendererRegistration: RendererRegistration<WorkflowRendererInput> = {
  id: 'workflow.topology',
  family: 'workflow',
  description: 'Provider-neutral workflow topology and deterministic run-state overlays.',
  create: () => new WorkflowRenderer(),
};

export function registerWorkflowRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void {
  registry.register(workflowRendererRegistration);
}
