import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const rules = {
  core: {
    allowed(specifier) { return specifier.startsWith('.'); },
    forbidden: [
      [/\b(?:document|window|HTMLElement|SVGElement|fetch)\b/, 'browser or network global'],
      [/\b(?:React|Monaco|Fluent)\b|@fluentui|monaco-editor|from\s+['"]react/, 'application framework'],
    ],
  },
  knowledge: {
    allowed(specifier) { return specifier.startsWith('.'); },
    forbidden: [
      [/\b(?:document|window|HTMLElement|SVGElement|fetch|crawler)\b/i, 'DOM, fetch or crawler capability'],
      [/\b(?:React|Monaco|Fluent|OpenAI)\b|@fluentui|monaco-editor|from\s+['"]react/, 'UI or AI service capability'],
    ],
  },
  content: {
    allowed(specifier) { return specifier.startsWith('.'); },
    forbidden: [
      [/\b(?:document|window|HTMLElement|SVGElement|fetch|crawler|localStorage)\b/i, 'DOM, network, crawler or storage capability'],
      [/\b(?:React|Monaco|Fluent|OpenAI)\b|@fluentui|monaco-editor|from\s+['"]react/, 'UI, editor or AI service capability'],
    ],
  },
  'notebook-import': {
    allowed(specifier) {
      return specifier.startsWith('.') || specifier === '@datapass/content' || specifier === 'node:crypto';
    },
    forbidden: [
      [/\b(?:document|window|HTMLElement|SVGElement|fetch|localStorage|eval)\b/, 'DOM, network, storage or execution capability'],
      [/@fluentui|monaco-editor|from\s+['"]react/, 'application framework'],
    ],
  },
  svg: {
    allowed(specifier) {
      return specifier.startsWith('.') || specifier === '@conceptmotion/core' || specifier === 'd3';
    },
    forbidden: [[/@fluentui|monaco-editor|from\s+['"]react|@datapass\/ui/, 'application framework']],
  },
  react: {
    allowed(specifier) {
      return specifier.startsWith('.') || specifier === 'react' || specifier === 'react-dom'
        || specifier === '@conceptmotion/core' || specifier === '@conceptmotion/svg';
    },
    forbidden: [[/@fluentui|monaco-editor|@datapass\/ui/, 'Fluent, Monaco or application UI']],
  },
  ui: {
    allowed(specifier) {
      return specifier.startsWith('.') || specifier === 'react' || specifier === 'react-dom'
        || specifier.startsWith('@fluentui/');
    },
    forbidden: [[/@conceptmotion\/(?:core|svg)|@datapass\/knowledge|monaco-editor|from\s+['"]d3/, 'semantic, renderer, knowledge or editor implementation']],
  },
  code: {
    allowed(specifier) {
      return specifier.startsWith('.') || specifier === 'react' || specifier === 'react-dom'
        || specifier === '@monaco-editor/react' || specifier === 'monaco-editor'
        || specifier.startsWith('monaco-editor/');
    },
    forbidden: [[/@conceptmotion\/(?:core|svg)|@datapass\/(?:content|knowledge|ui)|@fluentui/, 'semantic, content or application UI dependency']],
  },
  progress: {
    allowed(specifier) { return specifier.startsWith('.'); },
    forbidden: [
      [/\b(?:document|window|HTMLElement|SVGElement|fetch|localStorage|sessionStorage)\b/, 'browser, network or storage global'],
      [/@fluentui|monaco-editor|from\s+['"]react/, 'application framework'],
    ],
  },
  figure: {
    allowed(specifier) {
      return specifier.startsWith('.') || specifier === 'react'
        || specifier === '@conceptmotion/core' || specifier === '@conceptmotion/react'
        || specifier === '@conceptmotion/svg' || specifier === '@datapass/content'
        || specifier === '@datapass/ui';
    },
    forbidden: [[/@fluentui|monaco-editor|from\s+['"]d3/, 'generic control, editor or renderer implementation dependency']],
  },
  learning: {
    allowed(specifier) {
      return specifier.startsWith('.') || specifier === 'react' || specifier === 'react-dom'
        || specifier.startsWith('@fluentui/') || specifier === '@datapass/code'
        || specifier === '@datapass/content' || specifier === '@datapass/figure'
        || specifier === '@datapass/progress';
    },
    forbidden: [[/@conceptmotion\/(?:core|svg|react)|monaco-editor/, 'renderer semantics or direct editor implementation dependency']],
  },
  scaffold: {
    allowed(specifier) { return specifier.startsWith('.') || specifier === '@datapass/content'; },
    forbidden: [],
  },
};

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [target] : [];
  });
}

function importSpecifiers(source) {
  // Generated app source lives in template literals inside @datapass/scaffold. Remove
  // those literals so their sample imports are not mistaken for scaffold dependencies.
  const withoutTemplates = source.replace(/`(?:\\[\s\S]|[^\\`])*`/g, '');
  const matches = [
    ...withoutTemplates.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g),
    // Side-effect imports are statements. Anchoring avoids treating strings
    // emitted by the scaffold generator (for example, generated CSS imports)
    // as dependencies of the pure generator itself.
    ...withoutTemplates.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm),
    ...withoutTemplates.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
  ];
  return matches.map((match) => match[1]);
}

const failures = [];
let scanned = 0;

for (const [packageName, rule] of Object.entries(rules)) {
  const sourceRoot = path.join(root, 'packages', packageName, 'src');
  for (const file of sourceFiles(sourceRoot)) {
    scanned += 1;
    const source = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file).replaceAll('\\', '/');
    for (const specifier of importSpecifiers(source)) {
      if (!rule.allowed(specifier)) failures.push(`${relative}: dependency “${specifier}” crosses the ${packageName} boundary`);
    }
    for (const [pattern, description] of rule.forbidden) {
      if (pattern.test(source)) failures.push(`${relative}: contains prohibited ${description}`);
    }
  }
}

for (const packageName of ['core', 'knowledge', 'content', 'progress']) {
  const manifestPath = path.join(root, 'packages', packageName, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (Object.keys(manifest.dependencies ?? {}).length) {
    failures.push(`packages/${packageName}/package.json: pure package must not declare runtime dependencies`);
  }
}

if (failures.length) {
  console.error(`boundary check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`boundary check: ${scanned} source files · ${Object.keys(rules).length} package boundaries clean`);
}
