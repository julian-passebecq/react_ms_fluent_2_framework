import type { LocalizedText } from './localization';

export interface IconRef {
  readonly id: string;
  readonly label: LocalizedText;
  readonly provider?: string;
  /** Registry-owned local asset reference. Semantic specs store only iconId. */
  readonly asset?: string;
  readonly glyph?: string;
  readonly sourceUrl?: string;
  readonly official?: boolean;
  readonly fallbackId?: string;
}

export interface ResolvedIconRef extends IconRef {
  readonly requestedId: string;
  readonly resolvedId: string;
  readonly usedFallback: boolean;
  readonly fallbackPath: readonly string[];
}

export interface IconResolver {
  resolve(id: string): ResolvedIconRef;
}

const BUILTIN_UNKNOWN_ICON: IconRef = {
  id: 'generic.unknown',
  label: 'Unknown',
  provider: 'generic',
  glyph: '?',
  official: false
};

export const DEFAULT_ICON_REFS: readonly IconRef[] = [
  BUILTIN_UNKNOWN_ICON,
  { id: 'data.source', label: 'Source', provider: 'generic', glyph: '◉', official: false },
  { id: 'data.move', label: 'Move', provider: 'generic', glyph: '→', official: false },
  { id: 'data.store', label: 'Store', provider: 'generic', glyph: '▤', official: false },
  { id: 'data.table', label: 'Table', provider: 'generic', fallbackId: 'generic.table', official: false },
  { id: 'data.process', label: 'Process', provider: 'generic', glyph: 'ƒ', official: false },
  { id: 'data.model', label: 'Model', provider: 'generic', glyph: '◇', official: false },
  { id: 'data.serve', label: 'Serve', provider: 'generic', glyph: '▥', official: false },
  { id: 'data.operate', label: 'Operate', provider: 'generic', glyph: '↻', official: false },
  { id: 'data.govern', label: 'Govern', provider: 'generic', glyph: '✓', official: false },
  { id: 'project.framework', label: 'Framework', provider: 'generic', fallbackId: 'generic.code', official: false },
  { id: 'project.visualization', label: 'Visualization', provider: 'generic', fallbackId: 'generic.chart', official: false },
  { id: 'project.portfolio', label: 'Portfolio', provider: 'generic', fallbackId: 'generic.user', official: false },
  { id: 'generic.database', label: 'Database', provider: 'generic', glyph: 'DB', official: false },
  { id: 'generic.table', label: 'Table', provider: 'generic', glyph: '▦', official: false },
  { id: 'generic.api', label: 'API', provider: 'generic', glyph: '{}', official: false },
  { id: 'generic.user', label: 'User', provider: 'generic', glyph: '●', official: false },
  { id: 'generic.cloud', label: 'Cloud', provider: 'generic', glyph: '☁', official: false },
  { id: 'generic.task', label: 'Task', provider: 'generic', glyph: '◇', official: false },
  { id: 'generic.node', label: 'Node', provider: 'generic', fallbackId: 'generic.task', official: false },
  { id: 'generic.chart', label: 'Chart', provider: 'generic', glyph: '▥', official: false },
  { id: 'generic.warning', label: 'Warning', provider: 'generic', glyph: '!', official: false },
  { id: 'generic.notebook', label: 'Notebook', provider: 'generic', glyph: '▤', official: false },
  { id: 'generic.code', label: 'Code', provider: 'generic', glyph: '</>', official: false },
  { id: 'fabric.lakehouse', label: 'Fabric Lakehouse', provider: 'Microsoft Fabric', fallbackId: 'generic.database', official: false },
  { id: 'fabric.warehouse', label: 'Fabric Warehouse', provider: 'Microsoft Fabric', fallbackId: 'generic.table', official: false },
  { id: 'fabric.pipeline', label: 'Fabric pipeline', provider: 'Microsoft Fabric', fallbackId: 'generic.task', official: false },
  { id: 'powerbi.semantic-model', label: 'Power BI semantic model', provider: 'Microsoft Power BI', fallbackId: 'generic.table', official: false },
  { id: 'azure.sql-database', label: 'Azure SQL Database', provider: 'Microsoft Azure', fallbackId: 'generic.database', official: false },
  { id: 'azure.event-hubs', label: 'Azure Event Hubs', provider: 'Microsoft Azure', fallbackId: 'generic.cloud', official: false }
];

export interface IconRegistryOptions {
  readonly fallbackId?: string;
}

function resolved(requestedId: string, icon: IconRef, fallbackPath: readonly string[]): ResolvedIconRef {
  return {
    ...icon,
    requestedId,
    resolvedId: icon.id,
    usedFallback: requestedId !== icon.id,
    fallbackPath
  };
}

export class SemanticIconRegistry implements IconResolver {
  readonly #entries = new Map<string, IconRef>();
  readonly #fallbackId: string;

  constructor(entries: readonly IconRef[] = [], options: IconRegistryOptions = {}) {
    this.#fallbackId = options.fallbackId ?? BUILTIN_UNKNOWN_ICON.id;
    for (const entry of DEFAULT_ICON_REFS) this.register(entry);
    for (const entry of entries) this.register(entry);
  }

  register(icon: IconRef): this {
    if (!icon.id.trim()) throw new Error('Icon id must be non-empty.');
    if (this.#entries.has(icon.id) && !DEFAULT_ICON_REFS.some((entry) => entry.id === icon.id)) {
      throw new Error(`Icon id "${icon.id}" is already registered.`);
    }
    this.#entries.set(icon.id, { ...icon });
    return this;
  }

  has(id: string): boolean {
    return this.#entries.has(id);
  }

  list(): readonly IconRef[] {
    return [...this.#entries.values()].sort((left, right) => left.id.localeCompare(right.id));
  }

  resolve(id: string): ResolvedIconRef {
    const requestedId = id;
    const visited = new Set<string>();
    const path: string[] = [];
    let currentId = id;

    while (currentId) {
      if (visited.has(currentId)) return this.#safeUnknown(requestedId, [...path, currentId]);
      visited.add(currentId);
      path.push(currentId);
      const icon = this.#entries.get(currentId);
      if (!icon) {
        if (currentId === this.#fallbackId) return this.#safeUnknown(requestedId, path);
        currentId = this.#fallbackId;
        continue;
      }
      const hasRenderableValue = Boolean(icon.asset || icon.glyph);
      if (hasRenderableValue || !icon.fallbackId) return resolved(requestedId, icon, path);
      currentId = icon.fallbackId;
    }
    return this.#safeUnknown(requestedId, path);
  }

  #safeUnknown(requestedId: string, path: readonly string[]): ResolvedIconRef {
    const fallbackPath = path.at(-1) === BUILTIN_UNKNOWN_ICON.id ? path : [...path, BUILTIN_UNKNOWN_ICON.id];
    return resolved(requestedId, BUILTIN_UNKNOWN_ICON, fallbackPath);
  }
}

export function createIconRegistry(entries: readonly IconRef[] = [], options?: IconRegistryOptions): SemanticIconRegistry {
  return new SemanticIconRegistry(entries, options);
}

export function resolveIcon(id: string, resolver: IconResolver = createIconRegistry()): ResolvedIconRef {
  return resolver.resolve(id);
}
