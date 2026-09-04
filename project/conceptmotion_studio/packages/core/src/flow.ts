export type FlowKind =
  | 'data'
  | 'data-batch'
  | 'data-stream'
  | 'cdc'
  | 'control'
  | 'dependency'
  | 'lineage'
  | 'success'
  | 'failure'
  | 'completion'
  | 'skip';

export type LegacyFlowKind = 'batch' | 'stream' | 'error';
export type FlowChannel = 'data' | 'control' | 'dependency' | 'lineage' | 'outcome';
export type FlowLinePattern = 'solid' | 'dashed' | 'dotted' | 'double';
export type FlowMarker = 'arrow' | 'batch' | 'event' | 'change' | 'control' | 'success' | 'failure' | 'completion' | 'skip';
export type FlowMotion = 'none' | 'packet' | 'continuous-events' | 'change-events' | 'pulse';

export interface FlowKindSemantics {
  readonly kind: FlowKind;
  readonly channel: FlowChannel;
  readonly linePattern: FlowLinePattern;
  readonly marker: FlowMarker;
  readonly motion: FlowMotion;
  readonly defaultLabel: string;
  readonly requiresNonColorCue: true;
}

export const FLOW_KIND_SEMANTICS: Readonly<Record<FlowKind, FlowKindSemantics>> = {
  data: { kind: 'data', channel: 'data', linePattern: 'solid', marker: 'arrow', motion: 'packet', defaultLabel: 'Data', requiresNonColorCue: true },
  'data-batch': { kind: 'data-batch', channel: 'data', linePattern: 'solid', marker: 'batch', motion: 'packet', defaultLabel: 'Batch', requiresNonColorCue: true },
  'data-stream': { kind: 'data-stream', channel: 'data', linePattern: 'dashed', marker: 'event', motion: 'continuous-events', defaultLabel: 'Stream', requiresNonColorCue: true },
  cdc: { kind: 'cdc', channel: 'data', linePattern: 'dotted', marker: 'change', motion: 'change-events', defaultLabel: 'CDC', requiresNonColorCue: true },
  control: { kind: 'control', channel: 'control', linePattern: 'dashed', marker: 'control', motion: 'pulse', defaultLabel: 'Control', requiresNonColorCue: true },
  dependency: { kind: 'dependency', channel: 'dependency', linePattern: 'solid', marker: 'arrow', motion: 'none', defaultLabel: 'Dependency', requiresNonColorCue: true },
  lineage: { kind: 'lineage', channel: 'lineage', linePattern: 'solid', marker: 'arrow', motion: 'none', defaultLabel: 'Lineage', requiresNonColorCue: true },
  success: { kind: 'success', channel: 'outcome', linePattern: 'solid', marker: 'success', motion: 'pulse', defaultLabel: 'On success', requiresNonColorCue: true },
  failure: { kind: 'failure', channel: 'outcome', linePattern: 'dashed', marker: 'failure', motion: 'pulse', defaultLabel: 'On failure', requiresNonColorCue: true },
  completion: { kind: 'completion', channel: 'outcome', linePattern: 'double', marker: 'completion', motion: 'pulse', defaultLabel: 'On completion', requiresNonColorCue: true },
  skip: { kind: 'skip', channel: 'outcome', linePattern: 'dotted', marker: 'skip', motion: 'none', defaultLabel: 'On skip', requiresNonColorCue: true }
};

export function normalizeFlowKind(kind: FlowKind | LegacyFlowKind): FlowKind {
  if (kind === 'batch') return 'data-batch';
  if (kind === 'stream') return 'data-stream';
  if (kind === 'error') return 'failure';
  return kind;
}

export function isFlowKind(value: unknown): value is FlowKind {
  return typeof value === 'string' && value in FLOW_KIND_SEMANTICS;
}

export function getFlowKindSemantics(kind: FlowKind | LegacyFlowKind): FlowKindSemantics {
  return FLOW_KIND_SEMANTICS[normalizeFlowKind(kind)];
}
