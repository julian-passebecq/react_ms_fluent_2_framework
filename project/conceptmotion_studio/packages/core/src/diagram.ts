import { isFlowKind, type FlowKind } from './flow';
import { isLocalizedText, type LocalizedText } from './localization';
import {
  createValidationResult,
  validationError,
  type ValidationIssue,
  type ValidationResult
} from './validation';

export type DiagramDirection = 'lr' | 'rl' | 'tb' | 'bt';
export type DiagramDensity = 'compact' | 'comfortable';

export interface DiagramLayoutSpec {
  readonly direction?: DiagramDirection;
  readonly density?: DiagramDensity;
  readonly preferredRanks?: Readonly<Record<string, number>>;
  readonly align?: readonly (readonly string[])[];
}

export interface DiagramPort {
  readonly id: string;
  readonly label?: LocalizedText;
  readonly side?: 'left' | 'right' | 'top' | 'bottom';
  readonly role?: string;
}

export interface DiagramNode {
  readonly id: string;
  readonly label: LocalizedText;
  readonly kind?: string;
  readonly groupId?: string;
  readonly iconId?: string;
  readonly ports?: readonly DiagramPort[];
  readonly preferredRank?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface DiagramGroup {
  readonly id: string;
  readonly label: LocalizedText;
  readonly kind?: string;
  readonly parentId?: string;
  readonly childNodeIds?: readonly string[];
  readonly childGroupIds?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface DiagramEndpoint {
  readonly nodeId: string;
  readonly portId?: string;
}

export interface DiagramEdge {
  readonly id: string;
  readonly from: DiagramEndpoint;
  readonly to: DiagramEndpoint;
  readonly label?: LocalizedText;
  readonly flowKind?: FlowKind;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface DiagramSpec {
  readonly kind: 'diagram';
  readonly version: string;
  readonly id: string;
  readonly title: LocalizedText;
  readonly description?: LocalizedText;
  readonly layout?: DiagramLayoutSpec;
  readonly groups?: readonly DiagramGroup[];
  readonly nodes: readonly DiagramNode[];
  readonly edges: readonly DiagramEdge[];
}

export interface DiagramLayoutNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface DiagramRoutePoint {
  readonly x: number;
  readonly y: number;
}

export interface DiagramLayoutResult {
  readonly version: string;
  readonly width: number;
  readonly height: number;
  readonly nodes: readonly DiagramLayoutNode[];
  readonly edgeRoutes: Readonly<Record<string, readonly DiagramRoutePoint[]>>;
}

export interface DiagramLayoutContract {
  readonly id: string;
  readonly version: string;
  readonly deterministic: true;
  layout(spec: DiagramSpec): DiagramLayoutResult;
}

interface IndexedRecord {
  readonly value: Record<string, unknown>;
  readonly index: number;
}

const DIAGRAM_DIRECTIONS: readonly DiagramDirection[] = ['lr', 'rl', 'tb', 'bt'];
const DIAGRAM_DENSITIES: readonly DiagramDensity[] = ['compact', 'comfortable'];
const PORT_SIDES: readonly NonNullable<DiagramPort['side']>[] = ['left', 'right', 'top', 'bottom'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function collectRecords(items: readonly unknown[], path: string, noun: string, issues: ValidationIssue[]): IndexedRecord[] {
  const records: IndexedRecord[] = [];
  items.forEach((value, index) => {
    if (!isRecord(value)) {
      issues.push(validationError(`diagram.${noun}.object.invalid`, `${path}[${index}]`, `${noun} must be an object.`));
      return;
    }
    records.push({ value, index });
  });
  return records;
}

function duplicateIssues(items: readonly IndexedRecord[], path: string, noun: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  items.forEach(({ value, index }) => {
    const id = value.id;
    if (typeof id !== 'string' || !id.trim()) issues.push(validationError(`${noun}.id.required`, `${path}[${index}].id`, `${noun} id is required.`));
    else if (seen.has(id)) issues.push(validationError(`${noun}.id.duplicate`, `${path}[${index}].id`, `Duplicate ${noun} id "${id}".`));
    else seen.add(id);
  });
  return issues;
}

function optionalArray(value: unknown, path: string, code: string, message: string, issues: ValidationIssue[]): readonly unknown[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    issues.push(validationError(code, path, message));
    return [];
  }
  return value;
}

function optionalStringArray(value: unknown, path: string, code: string, issues: ValidationIssue[]): readonly string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    issues.push(validationError(code, path, 'Expected an array of non-empty strings.'));
    return [];
  }
  return value;
}

function hasGroupCycle(groupIds: readonly string[], arcs: readonly (readonly [string, string])[]): boolean {
  const children = new Map(groupIds.map((id) => [id, [] as string[]]));
  arcs.forEach(([parent, child]) => children.get(parent)?.push(child));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const child of children.get(id) ?? []) if (visit(child)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return groupIds.some(visit);
}

export function validateDiagramSpec(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return createValidationResult([validationError('diagram.object.required', '$', 'DiagramSpec must be an object.')]);
  }
  const spec = input;
  if (spec.kind !== 'diagram') issues.push(validationError('diagram.kind', 'kind', 'Diagram kind must be "diagram".'));
  if (typeof spec.version !== 'string' || !spec.version.trim()) issues.push(validationError('diagram.version.required', 'version', 'Diagram version is required.'));
  if (typeof spec.id !== 'string' || !spec.id.trim()) issues.push(validationError('diagram.id.required', 'id', 'Diagram id is required.'));
  if (!isLocalizedText(spec.title)) issues.push(validationError('diagram.title.invalid', 'title', 'Diagram title must be localized text.'));
  if (spec.description !== undefined && !isLocalizedText(spec.description)) {
    issues.push(validationError('diagram.description.invalid', 'description', 'Diagram description must be localized text.'));
  }
  if (!Array.isArray(spec.nodes)) issues.push(validationError('diagram.nodes.required', 'nodes', 'Diagram nodes must be an array.'));
  if (!Array.isArray(spec.edges)) issues.push(validationError('diagram.edges.required', 'edges', 'Diagram edges must be an array.'));
  if (spec.groups !== undefined && !Array.isArray(spec.groups)) {
    issues.push(validationError('diagram.groups.invalid', 'groups', 'Diagram groups must be an array.'));
  }

  const nodeRecords = collectRecords(Array.isArray(spec.nodes) ? spec.nodes : [], 'nodes', 'node', issues);
  const groupRecords = collectRecords(Array.isArray(spec.groups) ? spec.groups : [], 'groups', 'group', issues);
  const edgeRecords = collectRecords(Array.isArray(spec.edges) ? spec.edges : [], 'edges', 'edge', issues);
  issues.push(...duplicateIssues(nodeRecords, 'nodes', 'node'));
  issues.push(...duplicateIssues(groupRecords, 'groups', 'group'));
  issues.push(...duplicateIssues(edgeRecords, 'edges', 'edge'));
  const nodeById = new Map(nodeRecords.flatMap(({ value }) =>
    typeof value.id === 'string' && value.id.trim() ? [[value.id, value] as const] : []
  ));
  const groupById = new Map(groupRecords.flatMap(({ value }) =>
    typeof value.id === 'string' && value.id.trim() ? [[value.id, value] as const] : []
  ));
  const portsByNode = new Map<string, Set<string>>();

  for (const groupId of groupById.keys()) {
    if (nodeById.has(groupId)) {
      issues.push(validationError('diagram.target.id.duplicate', 'groups', `Node and group ids must be distinct; "${groupId}" is used by both.`));
    }
  }

  nodeRecords.forEach(({ value: node, index: nodeIndex }) => {
    if (!isLocalizedText(node.label)) issues.push(validationError('diagram.node.label.invalid', `nodes[${nodeIndex}].label`, 'Node label must be localized text.'));
    if (node.groupId !== undefined && (typeof node.groupId !== 'string' || !node.groupId.trim())) {
      issues.push(validationError('diagram.node.group.invalid', `nodes[${nodeIndex}].groupId`, 'Node group id must be a non-empty string.'));
    } else if (typeof node.groupId === 'string' && !groupById.has(node.groupId)) {
      issues.push(validationError('diagram.node.group.unknown', `nodes[${nodeIndex}].groupId`, `Unknown group "${node.groupId}".`));
    }
    if (node.preferredRank !== undefined && (!Number.isInteger(node.preferredRank) || (node.preferredRank as number) < 0)) {
      issues.push(validationError('diagram.node.preferredRank.invalid', `nodes[${nodeIndex}].preferredRank`, 'Preferred rank must be a non-negative integer.'));
    }
    const rawPorts = optionalArray(node.ports, `nodes[${nodeIndex}].ports`, 'diagram.node.ports.invalid', 'Node ports must be an array.', issues);
    const portRecords = collectRecords(rawPorts, `nodes[${nodeIndex}].ports`, 'port', issues);
    issues.push(...duplicateIssues(portRecords, `nodes[${nodeIndex}].ports`, 'port'));
    const portIds = new Set<string>();
    portRecords.forEach(({ value: port, index: portIndex }) => {
      if (typeof port.id === 'string' && port.id.trim()) portIds.add(port.id);
      if (port.label !== undefined && !isLocalizedText(port.label)) {
        issues.push(validationError('diagram.port.label.invalid', `nodes[${nodeIndex}].ports[${portIndex}].label`, 'Port label must be localized text.'));
      }
      if (port.side !== undefined && !PORT_SIDES.includes(port.side as NonNullable<DiagramPort['side']>)) {
        issues.push(validationError('diagram.port.side.invalid', `nodes[${nodeIndex}].ports[${portIndex}].side`, `Unknown port side "${String(port.side)}".`));
      }
    });
    if (typeof node.id === 'string' && node.id.trim()) portsByNode.set(node.id, portIds);
  });

  const childOwner = new Map<string, string>();
  const groupArcs: Array<readonly [string, string]> = [];
  groupRecords.forEach(({ value: group, index: groupIndex }) => {
    if (!isLocalizedText(group.label)) issues.push(validationError('diagram.group.label.invalid', `groups[${groupIndex}].label`, 'Group label must be localized text.'));
    if (group.parentId !== undefined && (typeof group.parentId !== 'string' || !group.parentId.trim())) {
      issues.push(validationError('diagram.group.parent.invalid', `groups[${groupIndex}].parentId`, 'Parent group id must be a non-empty string.'));
    } else if (typeof group.parentId === 'string' && !groupById.has(group.parentId)) {
      issues.push(validationError('diagram.group.parent.unknown', `groups[${groupIndex}].parentId`, `Unknown parent group "${group.parentId}".`));
    }
    const groupId = typeof group.id === 'string' ? group.id : '';
    if (typeof group.parentId === 'string' && groupById.has(group.parentId) && groupId) groupArcs.push([group.parentId, groupId]);
    const childNodeIds = optionalStringArray(group.childNodeIds, `groups[${groupIndex}].childNodeIds`, 'diagram.group.childNodeIds.invalid', issues);
    for (const childId of childNodeIds) {
      if (!nodeById.has(childId)) {
        issues.push(validationError('diagram.group.node.unknown', `groups[${groupIndex}].childNodeIds`, `Unknown child node "${childId}".`));
      } else if (childOwner.has(childId) && childOwner.get(childId) !== groupId) {
        issues.push(validationError('diagram.group.node.multiple', `groups[${groupIndex}].childNodeIds`, `Node "${childId}" belongs to multiple groups.`));
      } else if (groupId) childOwner.set(childId, groupId);
    }
    const childGroupIds = optionalStringArray(group.childGroupIds, `groups[${groupIndex}].childGroupIds`, 'diagram.group.childGroupIds.invalid', issues);
    for (const childGroupId of childGroupIds) {
      if (!groupById.has(childGroupId)) {
        issues.push(validationError('diagram.group.child.unknown', `groups[${groupIndex}].childGroupIds`, `Unknown child group "${childGroupId}".`));
      } else if (groupId) groupArcs.push([groupId, childGroupId]);
    }
  });
  nodeRecords.forEach(({ value: node, index: nodeIndex }) => {
    if (typeof node.id !== 'string') return;
    const declaredOwner = childOwner.get(node.id);
    if (declaredOwner && typeof node.groupId === 'string' && declaredOwner !== node.groupId) {
      issues.push(validationError('diagram.node.group.conflict', `nodes[${nodeIndex}].groupId`, `Node "${node.id}" has conflicting group ownership.`));
    }
  });
  if (hasGroupCycle([...groupById.keys()], groupArcs)) {
    issues.push(validationError('diagram.group.cycle', 'groups', 'Diagram groups must not contain a parent/child cycle.'));
  }

  if (spec.layout !== undefined) {
    if (!isRecord(spec.layout)) {
      issues.push(validationError('diagram.layout.invalid', 'layout', 'Diagram layout must be an object.'));
    } else {
      if (spec.layout.direction !== undefined && !DIAGRAM_DIRECTIONS.includes(spec.layout.direction as DiagramDirection)) {
        issues.push(validationError('diagram.layout.direction.invalid', 'layout.direction', `Unknown layout direction "${String(spec.layout.direction)}".`));
      }
      if (spec.layout.density !== undefined && !DIAGRAM_DENSITIES.includes(spec.layout.density as DiagramDensity)) {
        issues.push(validationError('diagram.layout.density.invalid', 'layout.density', `Unknown layout density "${String(spec.layout.density)}".`));
      }
      if (spec.layout.preferredRanks !== undefined) {
        if (!isRecord(spec.layout.preferredRanks)) {
          issues.push(validationError('diagram.layout.preferredRanks.invalid', 'layout.preferredRanks', 'Preferred ranks must be an object keyed by node id.'));
        } else {
          Object.entries(spec.layout.preferredRanks).forEach(([nodeId, rank]) => {
            if (!nodeById.has(nodeId)) issues.push(validationError('diagram.layout.node.unknown', `layout.preferredRanks.${nodeId}`, `Unknown layout node "${nodeId}".`));
            if (!Number.isInteger(rank) || (rank as number) < 0) issues.push(validationError('diagram.layout.rank.invalid', `layout.preferredRanks.${nodeId}`, 'Preferred rank must be a non-negative integer.'));
          });
        }
      }
      if (spec.layout.align !== undefined) {
        if (!Array.isArray(spec.layout.align) || spec.layout.align.some((rank) => !Array.isArray(rank))) {
          issues.push(validationError('diagram.layout.align.invalid', 'layout.align', 'Layout alignment must be an array of node-id arrays.'));
        } else {
          spec.layout.align.forEach((rank, rankIndex) => {
            if (!Array.isArray(rank)) return;
            rank.forEach((nodeId, nodeIndex) => {
              const path = `layout.align[${rankIndex}][${nodeIndex}]`;
              if (typeof nodeId !== 'string' || !nodeId.trim()) issues.push(validationError('diagram.layout.align.node.invalid', path, 'Aligned node id must be a non-empty string.'));
              else if (!nodeById.has(nodeId)) issues.push(validationError('diagram.layout.node.unknown', path, `Unknown layout node "${nodeId}".`));
            });
          });
        }
      }
    }
  }

  const checkEndpoint = (endpoint: unknown, path: string): void => {
    if (!isRecord(endpoint)) {
      issues.push(validationError('diagram.edge.endpoint.invalid', path, 'Edge endpoint must be an object.'));
      return;
    }
    if (typeof endpoint.nodeId !== 'string' || !endpoint.nodeId.trim()) {
      issues.push(validationError('diagram.edge.node.required', `${path}.nodeId`, 'Endpoint node id is required.'));
      return;
    }
    const node = nodeById.get(endpoint.nodeId);
    if (!node) {
      issues.push(validationError('diagram.edge.node.unknown', `${path}.nodeId`, `Unknown endpoint node "${endpoint.nodeId}".`));
      return;
    }
    if (endpoint.portId !== undefined && (typeof endpoint.portId !== 'string' || !endpoint.portId.trim())) {
      issues.push(validationError('diagram.edge.port.invalid', `${path}.portId`, 'Endpoint port id must be a non-empty string.'));
    } else if (typeof endpoint.portId === 'string' && !portsByNode.get(endpoint.nodeId)?.has(endpoint.portId)) {
      issues.push(validationError('diagram.edge.port.unknown', `${path}.portId`, `Unknown port "${endpoint.portId}" on node "${node.id}".`));
    }
  };
  edgeRecords.forEach(({ value: edge, index: edgeIndex }) => {
    checkEndpoint(edge.from, `edges[${edgeIndex}].from`);
    checkEndpoint(edge.to, `edges[${edgeIndex}].to`);
    if (edge.label !== undefined && !isLocalizedText(edge.label)) {
      issues.push(validationError('diagram.edge.label.invalid', `edges[${edgeIndex}].label`, 'Edge label must be localized text.'));
    }
    if (edge.flowKind !== undefined && !isFlowKind(edge.flowKind)) {
      issues.push(validationError('diagram.edge.flowKind.invalid', `edges[${edgeIndex}].flowKind`, `Unknown flow kind "${edge.flowKind}".`));
    }
  });

  return createValidationResult(issues);
}
