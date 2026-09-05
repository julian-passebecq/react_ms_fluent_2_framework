/** Static app imports, including lazy/require literals, must use @datapass/code. */
export function findDirectMonacoImports(source) {
  const specifiers = [...source.matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)['"`]([^'"`]+)['"`]/g)].map((match) => match[1]);
  return specifiers.filter((specifier) => /^(?:monaco-editor(?:\/|$)|@monaco-editor\/)/.test(specifier));
}
