# Code editor and bundle performance

## Current audit finding

Foundation v1.1 uses Monaco appropriately for code/spec surfaces, but the application statically imports Challenge and Workflow routes and both pages import Monaco directly. Vite currently reports an approximately 4.38 MB minified Monaco chunk (~1.12 MB gzip) plus workers.

## V2 requirement: shared code adapter

Create one package or reusable module boundary, preferably `@datapass/code`.

Required exports:

```tsx
<CodeEditor
  language="sql"
  value={value}
  onChange={setValue}
  readOnly={false}
  ariaLabel="SQL exercise"
/>

<CodeDiff
  language="sql"
  original={solution}
  modified={draft}
/>

<JsonSpecEditor
  value={source}
  diagnostics={diagnostics}
/>
```

Required behavior:

- `@datapass/ui` does not import Monaco;
- Monaco loads only when an editor route/surface is opened;
- shared Fluent-token-to-Monaco light theme mapping;
- common editor options;
- no minimap by default in training/spec panes;
- read-only solution mode;
- diff mode;
- JSON schema/diagnostics hook;
- language metadata for SQL, Python, PySpark, JSON and other existing variants;
- accessibility labels passed through explicitly.

## Route lazy loading

Replace static imports of heavy route pages with route-level lazy loading or an equivalent deterministic split.

Minimum proof:

- Catalog route loads without requesting Monaco chunks/workers;
- Knowledge route loads without Monaco;
- opening Challenge loads Monaco;
- opening Workflow spec mode can load Monaco;
- Notebook code cells load Monaco only when the Notebook route/consumer is opened.

Do not introduce a router dependency merely to satisfy this. `React.lazy`/dynamic imports are acceptable if the current hash routing remains stable.

## Worker/language policy

Only bundle workers actually needed by current surfaces. JSON requires the JSON worker. Generic code editing should not automatically bundle every Monaco language worker.

## Bundle gates

Create `V2_BUNDLE_REPORT.md` with actual produced chunks.

Add a deterministic check or documented assertion for:

- initial app JS size;
- Monaco chunk size;
- no Monaco request from the lightest non-code route;
- Notebook/Challenge route lazy behavior.

Do not hide bundle warnings by raising arbitrary chunk thresholds.

## Optional micro-optimization

While touching `RendererHost`, avoid a redundant immediate `update()` after a successful initial `mount()` if doing so is safe and covered by lifecycle tests. This is lower priority than editor lazy loading.
