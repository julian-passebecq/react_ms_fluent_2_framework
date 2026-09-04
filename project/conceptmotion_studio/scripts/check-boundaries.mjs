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
};

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [target] : [];
  });
}

function importSpecifiers(source) {
  const matches = [
    ...source.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g),
    ...source.matchAll(/\bimport\s*['"]([^'"]+)['"]/g),
    ...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
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

for (const packageName of ['core', 'knowledge']) {
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
  console.log(`boundary check: ${scanned} source files · 5 package boundaries clean`);
}
