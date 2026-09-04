# Semantic icon registry contract

## Goal

Future technical documentation, cloud diagrams, workflow views and Data Forge outputs should reference semantic icon IDs rather than hard-coded asset paths.

Do not build a giant vendor icon-sync product in Foundation v1.1.

## Semantic references

Specs should be able to use values such as:

```text
fabric.lakehouse
fabric.warehouse
fabric.pipeline
powerbi.semantic-model
azure.sql-database
azure.event-hubs
generic.database
generic.api
generic.user
generic.cloud
```

The exact naming convention may be refined, but it must be deterministic and documented.

## Suggested contract

```ts
interface IconRef {
  id: string;
  label: string;
  provider?: string;
  asset?: string;
  sourceUrl?: string;
  official?: boolean;
  fallbackId?: string;
}

interface IconResolver {
  resolve(id: string): IconRef | undefined;
}
```

Semantic specs store `iconId`, not file paths.

## V1.1 implementation

- establish the resolver/registry boundary;
- preserve generic fallbacks;
- allow local SVG assets where already available;
- document provenance/source URL where an official product icon is included;
- use the same icon ID in diagrams and Knowledge Atlas where practical.

Do NOT:

- scrape vendor websites;
- hotlink unstable icon URLs;
- recolor/distort official vendor marks;
- make the renderer fail when an icon is missing.

## Future

A later source-sync script may refresh approved official Microsoft/Azure/Fabric icon assets while keeping semantic IDs stable.
