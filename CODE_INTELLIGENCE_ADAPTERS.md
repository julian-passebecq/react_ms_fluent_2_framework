# Future code-intelligence adapters

## Decision

Do not turn Challenge Workbench into a universal runtime or code judge.

However, reserve a small adapter boundary for useful static/external analysis tools.

## Why

Different languages have very different feasible levels of browser/server assistance:

- DAX can use a formatter/parser service;
- T-SQL can be parsed for lineage;
- JavaScript/TypeScript can have rich diagnostics;
- Python/PySpark may have syntax/static analysis without execution;
- PowerShell/Bash can receive lightweight syntax checks;
- SQL dialects differ.

The unified UX should not promise identical capabilities.

## Proposed future contract

```ts
type CodeCapability = 'format' | 'syntax' | 'lint' | 'lineage' | 'explain';

interface CodeDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  source?: string;
}

interface CodeAnalysisResult {
  formattedCode?: string;
  diagnostics?: CodeDiagnostic[];
  lineageSpec?: unknown;
  metadata?: Record<string, unknown>;
}

interface CodeToolAdapter {
  id: string;
  languages: string[];
  capabilities: CodeCapability[];
  analyze(request: { language: string; code: string; capability: CodeCapability }): Promise<CodeAnalysisResult>;
}
```

## V1.1 implementation

Only provide a clean optional display/integration slot if useful:

```text
Code | Solution | Compare | Analysis(optional)
```

or an inspector region that can display `CodeDiagnostic[]`.

Do not add an `Analysis` tab if it makes the base UI cluttered. A compact diagnostics area below Monaco is also acceptable.

The Challenge shell must remain simple when no adapter exists.

## DAX Formatter reference

The uploaded DAX Formatter project demonstrates a useful future adapter: formatting plus syntax diagnostics. Its current MCP/server client still calls the DAX Formatter service, so privacy/network behavior must be explicit before any web integration.

Do not call it from Foundation v1.1.

## SQL lineage reference

The uploaded SQL Query Lineage project demonstrates a useful future adapter shape: parser output can describe statement type, source tables/columns, target columns and derivation relationships.

That output can later compile into ConceptMotion `LineageSpec`.

Do not port its parser into the front-end in v1.1.

## Security/privacy

Any future external service adapter must clearly disclose whether source code leaves the browser/device.
