// @vitest-environment node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';
import { authoringSchemas, serializeAuthoringSchema } from './authoring-schemas';
import { validateAuthoredSpec } from './validate-specs';
import { findDirectMonacoImports } from './app-import-boundary.mjs';
import { APP_PRESETS, createAppRecipe, validateAppName } from '../packages/scaffold/src/index';
import { validateFigureSpec, validateChallenge, validateAppRecipe } from '../packages/content/src/index';
import { migratedFigures } from '../content/visuals';
import * as approvedStories from '../stories/V4Patterns.stories';
import { checkStorybookIndex, REQUIRED_STORIES } from './check-storybook.mjs';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const repo = path.resolve(workspace, '../..');
const readJson = (filename) => JSON.parse(readFileSync(filename, 'utf8'));
const snippets = readJson(path.join(repo, '.vscode/datapass.code-snippets'));
const snippetKinds = { 'dp-figure': 'figure', 'dp-diagram': 'diagram', 'dp-app-recipe': 'app-recipe', 'dp-challenge': 'challenge' };
const renderSnippet = (snippet) => JSON.parse(snippet.body.join('\n').replace(/\$\{\d+:([^}]+)\}/g, '$1'));
const examples = Object.fromEntries(Object.values(snippets).map((snippet) => [snippetKinds[snippet.prefix], renderSnippet(snippet)]));

describe('repository DX configuration', () => {
  it('parses settings/extensions/snippets and resolves narrow, local schema associations', () => {
    const settings = readJson(path.join(repo, '.vscode/settings.json'));
    const extensions = readJson(path.join(repo, '.vscode/extensions.json'));
    expect(extensions.recommendations).toContain('ms-playwright.playwright');
    expect(settings['json.schemas']).toHaveLength(4);
    for (const association of settings['json.schemas']) {
      expect(association.fileMatch).toHaveLength(1);
      expect(association.fileMatch[0]).toMatch(/^\*\*\/\*\.(figure|diagram|app-recipe|challenge)\.json$/);
      expect(existsSync(path.resolve(repo, association.url))).toBe(true);
    }
    expect(Object.keys(snippets)).toHaveLength(4);
  });

  it('tasks call real scripts or targeted Vitest, use a correct cwd and sequence consumer builds', () => {
    const tasks = readJson(path.join(repo, '.vscode/tasks.json'));
    const manifest = readJson(path.join(workspace, 'package.json'));
    expect(tasks.options.cwd).toBe('${workspaceFolder}/project/conceptmotion_studio');
    const labels = tasks.tasks.map((task) => task.label);
    expect(new Set(labels).size).toBe(labels.length);
    for (const task of tasks.tasks) {
      if (task.dependsOn) { task.dependsOn.forEach((label) => expect(labels).toContain(label)); continue; }
      expect(task.command).toBe('pnpm');
      if (task.args[0] === 'run') expect(manifest.scripts[task.args[1]], task.label).toBeTruthy();
      else expect(task.args.slice(0, 3)).toEqual(['exec', 'vitest', 'run']);
      for (const input of task.args.join(' ').matchAll(/\$\{input:([^}]+)\}/g)) expect(tasks.inputs.some((candidate) => candidate.id === input[1])).toBe(true);
    }
    expect(tasks.tasks.find((task) => task.label === 'Datapass: Build all consumers')).toMatchObject({ dependsOrder: 'sequence', dependsOn: ['Datapass: Build Formation', 'Datapass: Build other consumers'] });
    for (const id of ['testPath', 'browserPath', 'specPath']) expect(existsSync(path.join(workspace, tasks.inputs.find((input) => input.id === id).default))).toBe(true);
  });

  it.each(Object.values(snippets))('snippet $prefix produces schema/runtime-valid default JSON', (snippet) => {
    expect(validateAuthoredSpec(snippetKinds[snippet.prefix], renderSnippet(snippet))).toMatchObject({ valid: true, schemaValid: true, runtimeValid: true });
  });

  it('detects direct static/lazy/require Monaco imports without banning shared editor use', () => {
    for (const source of ['import * as monaco from "monaco-editor";', 'import "monaco-editor/editor.main";', 'const x=import("monaco-editor");', 'const x=import(`monaco-editor/editor.api`);', 'const x=require("@monaco-editor/react");']) expect(findDirectMonacoImports(source)).toHaveLength(1);
    expect(findDirectMonacoImports('import { JsonSpecEditor } from "@datapass/code"; import "./my-monaco-notes";')).toEqual([]);
  });

  it('publishes eight approved production compositions with descriptions and real source/guide paths', () => {
    const stories = approvedStories;
    expect(stories.default.title).toBe('V4/Approved compositions');
    const names = ['CompactFigure', 'RegularFigure', 'ExpandedFigure', 'SourcesAndDetails', 'LearningReasoning', 'ChallengeWithFigure', 'ArchitectureSemanticNode', 'ProjectGalaxySelection'];
    for (const name of names) {
      expect(typeof stories[name].render).toBe('function');
      expect(stories[name].parameters.docs.description.story.length).toBeGreaterThan(40);
      expect(stories[name].parameters.datapass.status).toBe('approved-composition');
      for (const file of [...stories[name].parameters.datapass.sourceFiles, stories[name].parameters.datapass.guide]) expect(existsSync(path.join(workspace, file)), file).toBe(true);
    }
  });

  it('preserves the built V3/V4 story IDs and fails when a required composition disappears', () => {
    const index = { entries: Object.fromEntries(REQUIRED_STORIES.map((id) => [id, { id, type: 'story' }])) };
    expect(checkStorybookIndex(index)).toEqual({ storyCount: 60, preservedV3: 38, approvedV4: 8, visualExplanations: 14 });
    delete index.entries['foundation-figures--table-transform'];
    expect(() => checkStorybookIndex(index)).toThrow('foundation-figures--table-transform');
  });
});

describe('tested structural authoring schemas', () => {
  it.each(Object.keys(authoringSchemas))('%s compiles under Ajv draft-07 and matches the generated JSON', (kind) => {
    const committed = readFileSync(path.join(workspace, `schemas/authoring/${kind}.schema.json`), 'utf8').replaceAll('\r\n', '\n');
    expect(committed).toBe(serializeAuthoringSchema(kind));
    const ajv = new Ajv({ allErrors: true, strict: false });
    expect(ajv.validateSchema(authoringSchemas[kind])).toBe(true);
    expect(ajv.compile(authoringSchemas[kind])(examples[kind])).toBe(true);
  });

  it('accepts every preserved migrated Figure and scaffold preset', () => {
    expect(migratedFigures).toHaveLength(30);
    for (const figure of migratedFigures) expect(validateAuthoredSpec('figure', figure).valid, figure.id).toBe(true);
    for (const preset of APP_PRESETS) expect(validateAuthoredSpec('app-recipe', createAppRecipe(preset)).valid, preset).toBe(true);
  });

  it('pairs every required-field deletion with runtime rejection', () => {
    for (const [kind, schema] of Object.entries(authoringSchemas)) {
      for (const required of schema.required) {
        const candidate = structuredClone(examples[kind]);
        delete candidate[required];
        expect(validateAuthoredSpec(kind, candidate), `${kind}.${required}`).toMatchObject({ schemaValid: false, runtimeValid: false, valid: false });
      }
    }
  });

  it.each([
    ['figure', { id: '', kind: 'invented', profile: 'neon', title: { fr: 'Bonjour' } }],
    ['diagram', { kind: 'cloud-diagram', nodes: {}, edges: null }],
    ['app-recipe', { name: 'Wrong Name', routes: ['//external', '/../escape'], locales: ['fr'] }],
    ['challenge', { difficulty: 'Extreme', variants: [], execution: 'spark' }],
  ])('%s schema and runtime reject representative structural mistakes', (kind, changes) => {
    expect(validateAuthoredSpec(kind, { ...examples[kind], ...changes })).toMatchObject({ valid: false, schemaValid: false, runtimeValid: false });
  });

  it('keeps graph references/duplicate identities and timestamps as runtime checks', () => {
    const diagram = structuredClone(examples.diagram);
    diagram.layout.hubId = 'missing';
    expect(validateAuthoredSpec('diagram', diagram)).toMatchObject({ schemaValid: true, runtimeValid: false, valid: false });
    const duplicate = structuredClone(examples.challenge);
    duplicate.variants.push({ ...duplicate.variants[0], solution: 'another answer' });
    expect(validateAuthoredSpec('challenge', duplicate)).toMatchObject({ schemaValid: true, runtimeValid: false, valid: false });
    expect(validateAuthoredSpec('figure', { ...examples.figure, verifiedAt: 'not-a-date' })).toMatchObject({ schemaValid: true, runtimeValid: false, valid: false });
  });

  it('does not silently tighten existing optional fields, extension payloads or AppRecipe/scaffold distinction', () => {
    const figure = { ...examples.figure, status: 123, spec: { explanation: { futureSemanticExtension: true } }, futureField: true };
    expect(validateFigureSpec(figure).valid).toBe(true);
    expect(validateAuthoredSpec('figure', figure).valid).toBe(true);
    const challenge = { ...examples.challenge, figure: 123 };
    expect(validateChallenge(challenge).valid).toBe(true);
    expect(validateAuthoredSpec('challenge', challenge).valid).toBe(true);
    const recipe = { ...examples['app-recipe'], name: '1demo' };
    expect(validateAppRecipe(recipe).valid).toBe(true);
    expect(validateAuthoredSpec('app-recipe', recipe).valid).toBe(true);
    expect(() => validateAppName(recipe.name)).toThrow();
  });

  it('validates the documented file example and its nested Diagram separately', () => {
    const figure = readJson(path.join(workspace, 'schemas/authoring/examples/source-to-store.figure.json'));
    expect(validateAuthoredSpec('figure', figure).valid).toBe(true);
    expect(validateAuthoredSpec('diagram', figure.spec).valid).toBe(true);
  });
});
