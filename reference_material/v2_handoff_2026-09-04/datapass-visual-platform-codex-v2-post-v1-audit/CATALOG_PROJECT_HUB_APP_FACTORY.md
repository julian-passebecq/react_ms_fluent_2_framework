# Catalog, Project Hub and App Factory

## Why V2 needs this

The framework should make a new small Fluent site cheap to create. The user already has many independent sites and a working project-directory concept. V2 should provide a canonical project registry and a deterministic scaffold path, not another website builder.

## Project registry

```ts
interface ProjectRecord {
  id: string;
  title: string;
  summary?: string;
  url: string;
  repository?: string;
  status: 'active' | 'experimental' | 'legacy' | 'archived';
  kind: string;
  iconId?: string;
  features?: string[];
  technologies?: string[];
  locales?: string[];
  featured?: boolean;
  order?: number;
  verifiedAt?: string;
  supersededBy?: string;
}
```

The registry is the canonical source for a future Project Hub. Do not maintain canonical URLs in multiple ad hoc files.

## Explorer components

Extend the current Catalog shell with generic reusable components:

- `CatalogView`;
- `EntityCard`;
- `Metric` / `MetricStrip`;
- `FacetFilter`;
- `SortControl`;
- `ViewToggle`;
- `TagList`;
- thin Fluent DataGrid/table wrapper;
- `DetailDrawer` or existing Inspector composition;
- `FreshnessStamp`;
- URL-backed search/filter/sort state.

Keep components generic. `GitHubRepoCard` should not be a core primitive when `EntityCard` suffices.

## AppRecipe / scaffold

Provide a tiny deterministic scaffold mechanism, e.g.:

```bash
pnpm scaffold:app --name norwegian-atlas --preset knowledge
pnpm scaffold:app --name dubreu-formation --preset learning
pnpm scaffold:app --name project-hub --preset catalog
```

Approved presets:

- `knowledge`;
- `learning`;
- `catalog`;
- `portfolio-hub`.

Generated apps should:

- use React/TypeScript/Vite;
- use Fluent v9 and shared Datapass theme/shell;
- import workspace packages rather than copy source;
- include baseline accessibility/layout tests;
- include route/title/metadata placeholders;
- include EN/NO infrastructure only when the recipe enables it;
- keep heavy editor dependencies lazy.

## Not a CMS

Do not add drag/drop page building, plugin marketplaces, hosted content databases or runtime component downloads.
