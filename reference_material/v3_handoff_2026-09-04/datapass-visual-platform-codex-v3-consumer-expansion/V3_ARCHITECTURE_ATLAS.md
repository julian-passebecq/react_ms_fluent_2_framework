# Architecture Atlas — V3

Read-only source/reference repo: `julian-passebecq/architectureweb`.

## Stable conceptual model

Use the existing high-value mental model:

**Source → Move → Store → Process → Model → Serve**

Cross-cutting:

- **Operate** — orchestration, observability, CI/CD
- **Govern** — catalog, lineage, security, quality

## V3 provider views

- Conceptual
- Databricks
- Microsoft Fabric
- Google Cloud

Do not make provider vocabulary the primary information architecture. Teach the stable stage first, then translate the same stage to each provider.

## Workload families

- Lakehouse / medallion
- Streaming / real time
- CDC / replication
- Orchestration / platform architecture

## Required interactions

- stage selection / inspector;
- cross-cloud Stage Lens for the same logical stage;
- highlight active path;
- compare provider translations;
- sources/freshness metadata;
- keyboard selection;
- reduced motion;
- static SVG export where supported.

## Renderer architecture

Rebuild through shared contracts:

```text
architecture content
   ↓
DiagramSpec / WorkflowSpec / LineageSpec
   ↓
layout provider
   ↓
existing SVG/React/Figure stack
```

Do not port the old custom React architecture component as a second semantic/rendering stack.

## Layout work

Implement a deterministic **radial/hub** `DiagramLayoutContract` provider. This must also power the Project Galaxy in Pilot Center.

Keep/extend a deterministic lightweight layered layout for left-to-right architectures. ELK is optional only for complex graphs and must sit behind the same layout contract. It must not become a required dependency for simple figures.

## Icons

Use semantic icon IDs and the existing icon resolver. Vendor marks may be used nominatively according to their guidance; keep text fallbacks and avoid embedding unverified remote asset paths in semantic specs.
