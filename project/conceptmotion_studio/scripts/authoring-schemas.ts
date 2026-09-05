import type { AppPreset, AppRecipe, ChallengeDifficulty, ChallengeLanguage, FigureKind, FigureProfile, FigureSpec } from '../packages/content/src/index';
import { FLOW_KIND_SEMANTICS, type DiagramDirection, type DiagramDensity, type DiagramSpec } from '../packages/core/src/index';

type Schema = Record<string, unknown>;
const text = { type: 'string', pattern: '\\S' };
const strings = { type: 'array', items: text, uniqueItems: true };
const localized = {
  anyOf: [text, {
    type: 'object', properties: { en: { type: 'string' }, no: { type: 'string' } }, additionalProperties: false,
    anyOf: [{ required: ['en'], properties: { en: text } }, { required: ['no'], properties: { no: text } }],
  }],
};
const object = (properties: Record<string, Schema>, required: readonly string[] = []): Schema => ({ type: 'object', properties, required, additionalProperties: true });
const array = (items: Schema): Schema => ({ type: 'array', items });
const enumeration = <T extends string>(values: Record<T, true>): Schema => ({ enum: Object.keys(values) });
const hint = (description: string): Schema => ({ description });
const localizedRef = { $ref: '#/definitions/localizedText' };
const schema = (name: string, title: string, body: Schema): Schema => ({
  $schema: 'http://json-schema.org/draft-07/schema#', $id: `urn:datapass:schema:${name}:1`, title,
  description: 'Editor structural assistance. Run pnpm validate:specs for authoritative runtime/semantic validation. Unknown extension fields remain allowed.',
  ...body, definitions: { localizedText: localized },
});

const figureProperties = {
  id: text,
  kind: enumeration<FigureKind>({ concept: true, diagram: true, workflow: true, lineage: true, chart: true, geo: true, static: true }),
  rendererId: { ...text, description: 'Shared renderer registry ID; no closed list so adapters remain extensible.' },
  title: localizedRef, subtitle: localizedRef, takeaway: localizedRef, fallbackText: localizedRef,
  spec: hint('Renderer-neutral JSON payload. Renderer-specific validation and ExplanationTrack semantics remain in the production renderer/core contracts.'),
  sourceIds: strings, conceptIds: strings, featureIds: strings,
  verifiedAt: { type: 'string', description: 'Runtime validator checks Date.parse-compatible timestamps.' },
  status: hint('Optional status metadata (TypeScript recommends string); this legacy optional field is not checked by the runtime envelope validator.'),
  reducedMotionState: { type: ['string', 'number'] }, staticState: { type: ['string', 'number'] },
  profile: enumeration<FigureProfile>({ professional: true, editorial: true, sketch: true }),
} satisfies Record<keyof FigureSpec, Schema>;

const diagramProperties = {
  kind: { const: 'diagram' }, version: text, id: text, title: localizedRef, description: localizedRef,
  layout: object({
    provider: { enum: ['layered', 'radial'] }, hubId: text,
    direction: enumeration<DiagramDirection>({ lr: true, rl: true, tb: true, bt: true }),
    density: enumeration<DiagramDensity>({ compact: true, comfortable: true }),
    preferredRanks: { type: 'object', additionalProperties: { type: 'integer', minimum: 0 } },
    align: array(array(text)),
  }),
  nodes: array(object({
    id: text, label: localizedRef, groupId: text, preferredRank: { type: 'integer', minimum: 0 },
    kind: hint('Semantic node category; use a string from the production semantic icon/category registry.'),
    iconId: hint('Semantic icon registry ID; never a vendor asset URL.'), metadata: hint('Optional JSON metadata; not a layout-coordinate contract.'),
    ports: array(object({ id: text, label: localizedRef, side: { enum: ['left', 'right', 'top', 'bottom'] }, role: hint('Optional semantic port role.') }, ['id'])),
  }, ['id', 'label'])),
  edges: array(object({
    id: text, from: object({ nodeId: text, portId: text }, ['nodeId']), to: object({ nodeId: text, portId: text }, ['nodeId']),
    label: localizedRef,
    flowKind: { enum: Object.keys(FLOW_KIND_SEMANTICS) },
    metadata: hint('Optional edge metadata.'),
  }, ['id', 'from', 'to'])),
  groups: array(object({ id: text, label: localizedRef, parentId: text, childNodeIds: array(text), childGroupIds: array(text), kind: hint('Optional semantic group category.'), metadata: hint('Optional group metadata.') }, ['id', 'label'])),
} satisfies Record<keyof DiagramSpec, Schema>;

const recipeProperties = {
  id: text, name: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
  packageName: { type: 'string', pattern: '^(?:@[a-z0-9._-]+/)?[a-z0-9][a-z0-9._-]*$' }, title: localizedRef,
  preset: enumeration<AppPreset>({ knowledge: true, learning: true, catalog: true, 'portfolio-hub': true }),
  routes: { type: 'array', minItems: 1, uniqueItems: true, items: { ...text, allOf: [{ pattern: '^/(?!/)' }, { not: { pattern: '\\.\\.|[?#]' } }] } },
  locales: { type: 'array', items: { enum: ['en', 'no'] }, uniqueItems: true }, features: strings,
  includeEditor: { type: 'boolean' }, projectId: text,
} satisfies Record<keyof AppRecipe, Schema>;

const challenge = object({
  id: text, title: text, domain: text, summary: text,
  difficulty: enumeration<ChallengeDifficulty>({ Easy: true, Medium: true, Hard: true }),
  schema: { type: 'string' }, input: { type: 'string' }, example: { type: 'string' }, expectedOutput: { type: 'string' },
  tags: array({ type: 'string' }), hints: array({ type: 'string' }), execution: { const: 'none' },
  variants: { ...array(object({
    id: text, label: text, monacoLanguage: text, starter: text, solution: text,
    language: enumeration<ChallengeLanguage>({ python: true, pandas: true, pyspark: true, sql: true, tsql: true, duckdb: true, bigquery: true, dax: true, csharp: true, powershell: true, bash: true, shell: true, yaml: true, dockerfile: true, plaintext: true }),
    explanation: hint('Optional explanation text; not checked by the existing challenge subset validator.'),
    note: hint('Optional note text; not checked by the existing challenge subset validator.'),
  }, ['id', 'language', 'label', 'monacoLanguage', 'starter', 'solution'])), minItems: 1 },
  figure: hint('Optional FigureSpec: author it as a separate *.figure.json and run Figure validation. Existing challenge validation does not recursively validate this field.'),
}, ['id', 'title', 'domain', 'difficulty', 'summary', 'schema', 'input', 'example', 'expectedOutput', 'tags', 'hints', 'variants']);

export const authoringSchemas = {
  figure: schema('figure', 'Datapass Figure envelope', object(figureProperties, ['id', 'kind', 'rendererId', 'title', 'spec', 'fallbackText'])),
  diagram: schema('diagram', 'Datapass semantic Diagram', object(diagramProperties, ['kind', 'version', 'id', 'title', 'nodes', 'edges'])),
  'app-recipe': schema('app-recipe', 'Datapass AppRecipe metadata (not scaffold CLI options)', object(recipeProperties, ['id', 'name', 'packageName', 'title', 'preset', 'routes'])),
  challenge: schema('challenge', 'Datapass authored challenge subset', challenge),
};
export type AuthoringKind = keyof typeof authoringSchemas;
export const serializeAuthoringSchema = (kind: AuthoringKind) => `${JSON.stringify(authoringSchemas[kind], null, 2)}\n`;
