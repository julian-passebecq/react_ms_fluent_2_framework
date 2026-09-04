# Diagram style system proposal

The cloud/data-model/lineage generators should share a small visual grammar instead of each inventing styling.

## Core semantic tones

| Token | Meaning | Typical use |
| --- | --- | --- |
| `neutral` | structure | generic nodes / labels |
| `data` | data movement | source -> storage -> model |
| `process` | transformation | notebook / SQL / job |
| `control` | orchestration/control plane | scheduler / trigger / admin |
| `security` | protected path / boundary | firewall / private endpoint |
| `serve` | consumption | semantic model / BI / app |
| `warning` | bottleneck / risk | skew / failure / capacity |
| `success` | completed / healthy | passed gate / published asset |

Do not hard-code brand colors into semantics. Provider themes may map these tokens differently.

## Line grammar

- solid: normal dependency / connection;
- dashed: logical/private/control relationship or intermittent flow;
- dotted: weak/reference/linkage relationship;
- heavy: emphasized hot path / selected route;
- animated march: moving flow when movement itself is the lesson;
- packet dots: discrete records/events/requests;
- pulse: destination activity / orchestration heartbeat.

## Container grammar

Containers should communicate topology levels:

- stage / lifecycle area;
- region;
- network/VNet/VPC;
- subnet;
- platform/workspace;
- trust boundary;
- data layer (bronze/silver/gold/semantic/report).

The same nesting model should be reusable across Azure, Fabric, generic cloud, and pipeline diagrams.

## Data-model grammar

Entity type should be distinguishable without relying only on color:

- fact: stronger title weight + measure stripe/badge;
- dimension: standard card;
- bridge: dual-link marker;
- semantic/calculated: dashed or secondary header treatment;
- inactive relationship: dashed connector;
- bidirectional filter: distinct double-arrow marker.

## Animation rule

If a static screenshot loses no information, animation was probably decorative. Only animate route, ordering, state change, propagation, scheduling, or volume emphasis.
