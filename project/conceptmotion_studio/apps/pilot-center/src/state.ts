import { serializeDeterministic } from '@datapass/content';
import type { ProjectStatus } from '@datapass/content';
import type { ProgressStorageAdapter } from '@datapass/progress';

export const PILOT_STORAGE_KEY = 'datapass:pilot-center:v1';
export const DOMAINS = ['bi', 'cloud', 'sql', 'analytics', 'data-engineering', 'ml', 'other'] as const;
export const CONTEXTS = ['pro', 'personal', 'project', 'side-business'] as const;
export const PRIORITIES = ['urgent', 'next', 'later'] as const;
export const NOTE_STATUSES = ['idea', 'todo', 'doing', 'waiting', 'done'] as const;
export const PROJECT_STATUSES: readonly ProjectStatus[] = ['active', 'building', 'planned', 'experimental', 'legacy', 'archived'];
export interface IdeaNote {
  id: string; title: string; body?: string; url?: string;
  domain: typeof DOMAINS[number]; context: typeof CONTEXTS[number];
  priority: typeof PRIORITIES[number]; status: typeof NOTE_STATUSES[number];
  projectId?: string; tags: string[]; pinned: boolean; createdAt: string; updatedAt: string;
}
export interface LocalProjectMetadata {
  projectId: string; nextAction?: string; annotation?: string; privateRepository?: string; status?: ProjectStatus;
}
export interface PilotState { schemaVersion: 1; notes: IdeaNote[]; overlays: LocalProjectMetadata[] }
export const emptyPilotState = (): PilotState => ({ schemaVersion: 1, notes: [], overlays: [] });

function record(value: unknown, allowed: readonly string[], path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path} must be an object.`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${path}.${key} is not supported.`);
  return value as Record<string, unknown>;
}
function text(value: unknown, path: string, max = 6000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error(`${path} must be non-empty text (up to ${max} characters).`);
  return value.trim();
}
function optionalText(value: unknown, path: string, max = 6000): string | undefined { return value === undefined ? undefined : text(value, path, max); }
function choice<T extends string>(value: unknown, choices: readonly T[], path: string): T {
  if (typeof value !== 'string' || !choices.includes(value as T)) throw new Error(`${path} has an unsupported value.`);
  return value as T;
}
function date(value: unknown, path: string): string {
  const result = text(value, path, 40);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(result) || !Number.isFinite(Date.parse(result))) throw new Error(`${path} must be an ISO timestamp.`);
  return new Date(result).toISOString();
}
export function safeLink(value: unknown, path = 'URL'): string | undefined {
  if (value === undefined) return undefined;
  const input = text(value, path, 2048);
  let url: URL;
  try { url = new URL(input); } catch { throw new Error(`${path} must be an absolute HTTP(S) URL.`); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || /\s/.test(input)) throw new Error(`${path} must be HTTP(S), without embedded credentials.`);
  return input;
}
function projectId(value: unknown, ids: ReadonlySet<string>, path: string): string {
  const id = text(value, path, 180);
  if (!ids.has(id)) throw new Error(`${path} references an unknown public project.`);
  return id;
}
function unique<T>(items: T[], id: (item: T) => string, label: string): T[] {
  if (new Set(items.map(id)).size !== items.length) throw new Error(`${label} contains duplicate IDs.`);
  return [...items].sort((a, b) => id(a) < id(b) ? -1 : id(a) > id(b) ? 1 : 0);
}
function array(value: unknown, path: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) throw new Error(`${path} must be an array with at most ${max} items.`);
  return value;
}
function readOverlay(value: unknown, ids: ReadonlySet<string>, index: number): LocalProjectMetadata {
  const path = `overlays[${index}]`;
  const item = record(value, ['projectId', 'nextAction', 'annotation', 'privateRepository', 'status'], path);
  return {
    projectId: projectId(item.projectId, ids, `${path}.projectId`),
    nextAction: optionalText(item.nextAction, `${path}.nextAction`, 400),
    annotation: optionalText(item.annotation, `${path}.annotation`),
    privateRepository: safeLink(item.privateRepository, `${path}.privateRepository`),
    status: item.status === undefined ? undefined : choice(item.status, PROJECT_STATUSES, `${path}.status`),
  };
}
export function validatePilotState(value: unknown, ids: ReadonlySet<string>): PilotState {
  const root = record(value, ['schemaVersion', 'notes', 'overlays'], 'backup');
  if (root.schemaVersion !== 1) throw new Error('Unsupported Pilot Center backup version.');
  const notes = array(root.notes, 'notes', 2000).map((value, index): IdeaNote => {
    const path = `notes[${index}]`;
    const note = record(value, ['id', 'title', 'body', 'url', 'domain', 'context', 'priority', 'status', 'projectId', 'tags', 'pinned', 'createdAt', 'updatedAt'], path);
    if (typeof note.pinned !== 'boolean') throw new Error(`${path}.pinned must be boolean.`);
    const createdAt = date(note.createdAt, `${path}.createdAt`);
    const updatedAt = date(note.updatedAt, `${path}.updatedAt`);
    if (updatedAt < createdAt) throw new Error(`${path}.updatedAt cannot precede createdAt.`);
    return {
      id: text(note.id, `${path}.id`, 180), title: text(note.title, `${path}.title`, 140),
      body: optionalText(note.body, `${path}.body`), url: safeLink(note.url, `${path}.url`),
      domain: choice(note.domain, DOMAINS, `${path}.domain`), context: choice(note.context, CONTEXTS, `${path}.context`),
      priority: choice(note.priority, PRIORITIES, `${path}.priority`), status: choice(note.status, NOTE_STATUSES, `${path}.status`),
      projectId: note.projectId === undefined ? undefined : projectId(note.projectId, ids, `${path}.projectId`),
      tags: [...new Set(array(note.tags, `${path}.tags`, 30).map((tag) => text(tag, `${path}.tags`, 60)))].sort(),
      pinned: note.pinned, createdAt, updatedAt,
    };
  });
  const overlays = array(root.overlays, 'overlays', ids.size).map((value, index) => readOverlay(value, ids, index));
  return { schemaVersion: 1, notes: unique(notes, (note) => note.id, 'notes'), overlays: unique(overlays, (overlay) => overlay.projectId, 'overlays') };
}
export function parsePilotBackup(source: string, ids: ReadonlySet<string>): PilotState {
  if (source.length > 1_000_000 || new TextEncoder().encode(source).byteLength > 1_000_000) throw new Error('Backup exceeds the 1 MB limit.');
  let parsed: unknown;
  try { parsed = JSON.parse(source); } catch { throw new Error('Invalid JSON; existing local data was not changed.'); }
  return validatePilotState(parsed, ids);
}
export const serializePilotBackup = (state: PilotState, ids: ReadonlySet<string>): string => `${serializeDeterministic(validatePilotState(state, ids), 2)}\n`;
/** Runtime-only overlay import. No local file is imported by the build. */
export function parsePrivateOverlay(source: string, ids: ReadonlySet<string>): LocalProjectMetadata[] {
  if (source.length > 1_000_000 || new TextEncoder().encode(source).byteLength > 1_000_000) throw new Error('Overlay exceeds the 1 MB limit.');
  let parsed: unknown;
  try { parsed = JSON.parse(source); } catch { throw new Error('Invalid overlay JSON.'); }
  const root = record(parsed, ['schemaVersion', 'overlays'], 'overlay');
  return validatePilotState({ ...root, notes: [] }, ids).overlays;
}
export function loadPilotState(storage: ProgressStorageAdapter, ids: ReadonlySet<string>) {
  const raw = storage.read(PILOT_STORAGE_KEY);
  if (raw === null) return { state: emptyPilotState(), protectedRaw: null, warning: '' };
  try { return { state: parsePilotBackup(raw, ids), protectedRaw: null, warning: '' }; }
  catch { return { state: emptyPilotState(), protectedRaw: raw, warning: 'Stored data could not be read and has been kept untouched. Edits remain in memory until you restore a validated backup.' }; }
}
export function orderedNotes(notes: readonly IdeaNote[]): IdeaNote[] {
  return [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}
