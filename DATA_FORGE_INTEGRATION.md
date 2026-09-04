# Data Forge integration contract

Data Forge is the first intended real consumer after the foundation is stable. ConceptMotion must not import or depend on Forge.

## Data Forge likely stack

- React + TypeScript frontend
- Fluent UI v9
- C# / ASP.NET Core backend
- Monaco for code/editing surfaces
- ConceptMotion for explanatory visuals

## Example consumption

```tsx
import { Workbench, InspectorPanel } from '@datapass/ui';
import { ConceptScene } from '@conceptmotion/react';

export function ModelPreview({ scene }) {
  return (
    <Workbench>
      <ConceptScene spec={scene} />
      <InspectorPanel />
    </Workbench>
  );
}
```

## Forge scenarios that should work without new renderer architecture

- generated data filtering/dedup/CDC explanation;
- source -> bronze -> silver -> gold architecture;
- generated star schema;
- column/table lineage;
- data-quality failure and retry;
- generated scenario walkthrough.

If Forge needs a new domain primitive, add it through a stable ConceptMotion extension point rather than coding a Forge-only SVG renderer inside the app.
