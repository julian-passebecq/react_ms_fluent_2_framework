# Why C# + React/D3 is the right split

## C# backend is justified by the problem itself

C# is not being chosen to justify Docker/Kubernetes.

It is justified because:

1. the proven Contoso generator already exists in C#/.NET,
2. it has performance-oriented generation logic,
3. it has deterministic weighted distributions,
4. it already writes Parquet/Delta/CSV,
5. it has a clean writer interface,
6. it can run cross-platform on modern .NET,
7. it is straightforward to expose through ASP.NET Core.

Rewriting the generation core in React/JavaScript would destroy the strongest inherited asset.

## React is for a different job

React is appropriate for:
- modern browser UI
- project builder
- filters/toggles
- architecture diagram
- D3 educational animations
- star schema
- DAG preview
- generated-code tabs
- download UX.

React should not generate millions of rows in the browser.

## D3 benefits

Use D3 for:
- animated row filtering/join/window examples
- star-schema transitions
- distribution histograms
- generation summary
- architecture/DAG highlighting.

Do not make D3 responsible for the generator.

## Result

```text
C# = compute / generation / compilation
React = product UI
D3 = visual explanation
Docker = packaging
Terraform = reproducible cloud infrastructure
Kubernetes = optional future scale tool
```
