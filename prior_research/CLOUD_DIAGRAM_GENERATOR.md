# Cloud diagram generator brief

This pass adds a new high-priority objective: ConceptMotion should become able to generate **clean, standardized cloud diagrams** and **animated cloud/data-flow diagrams** without relying on Mermaid alone.

The user repeatedly struggles to ask for good cloud diagrams ad hoc. The product should therefore provide a reusable generator rather than one-off handcrafted scenes.

## Product goal

A prompt or structured spec should be able to produce diagrams such as:

- Azure / Microsoft Fabric reference architectures;
- app/service topologies (user -> gateway -> app -> data -> monitoring);
- networking diagrams (router, firewall, spine/leaf, subnets, east-west and north-south traffic);
- medallion / lakehouse and analytics flow diagrams;
- orchestration diagrams (Airflow / Data Factory / Fabric pipelines / jobs / triggers);
- secure private-network deployment views;
- simple cloud landing zone diagrams;
- server-to-server / application-to-application flow animations.

The target is **not** a full draw.io replacement in v1. The target is a **standardized renderer grammar** that makes good diagrams easy.

## Scope for v1

Build a small set of diagram primitives first:

### 1. Containers / groups

Examples:

- region
- virtual network / VPC
- subnet
- workspace
- lakehouse zone
- fabric area (Ingest / Process / Enrich / Serve)
- trust boundary / highlighted bounded area

Properties:

- id
- label
- type
- optional subtitle
- style tone (`neutral`, `azure`, `fabric`, `warning`, `security`, `success`)
- layout direction (`horizontal`, `vertical`, `free`)
- children ids

### 2. Nodes

Examples:

- user
- app service
- gateway
- firewall
- router
- event hub
- lakehouse / warehouse
- power bi / semantic model
- notebook / job / airflow / fabric pipeline
- sql database
- key vault
- storage account
- VM / server / container / API
- generic table / dataset / feature store / vector store

Properties:

- id
- label
- type
- icon key
- provider (`generic`, `azure`, `fabric`, `airflow`, `powerbi`)
- container id
- metadata chips
- optional footnote / caption

### 3. Edges / flows

Must support both static and animated styles.

Properties:

- `from`, `to`
- direction (`one-way`, `two-way`)
- line style (`solid`, `dashed`, `dotted`)
- thickness (`thin`, `normal`, `heavy`)
- tone / color token
- label
- channel (`control`, `data`, `security`, `admin`, `north-south`, `east-west`)
- optional animation

Animation options:

- packet dots moving along path;
- dashed-line marching animation;
- pulse at destination;
- bandwidth/thickness emphasis;
- intermittent/periodic schedule effect;
- rotating orchestrator / spinning sync icon for jobs.

### 4. Layer annotations

Required for readability.

Examples:

- left vertical arrow showing north-south traffic;
- bottom horizontal arrow showing east-west traffic;
- legend explaining color/line meaning;
- bracket over stages like Ingest / Process / Serve;
- callout bubble for security / SLA / hot path / cold path.

## Canonical spec shape

A future JSON or YAML scene could look like:

```yaml
kind: cloud-diagram
layout: layered
providerTheme: azure-fabric
containers:
  - id: vnet
    type: vnet
    label: Virtual Network
    children: [gatewaySubnet, privateSubnet, integrationSubnet]
  - id: gatewaySubnet
    type: subnet
    label: Application Gateway subnet
nodes:
  - id: user
    type: user
    label: User
  - id: appgw
    type: application-gateway
    label: Azure Application Gateway
    container: gatewaySubnet
  - id: app
    type: app-service
    label: App Service
  - id: sql
    type: sql-database
    label: Azure SQL Database
edges:
  - from: user
    to: appgw
    label: HTTPS
    style: solid
    tone: neutral
  - from: appgw
    to: app
    label: Internal traffic
    style: solid
    tone: azure
  - from: app
    to: sql
    label: Private endpoint
    style: dashed
    tone: security
    animation:
      type: packets
      speed: medium
legend:
  - tone: user
    label: User to application
  - tone: admin
    label: Admin to application
```

## Renderer families to add

Implement high-value reusable families instead of many one-off scenes.

1. `cloudTopologyRenderer`
   - generic cloud services, regions, subnets, containers, edges.
2. `networkFabricRenderer`
   - spine/leaf, border leaf, firewall, servers, traffic channels.
3. `dataPlatformArchitectureRenderer`
   - ingest/process/enrich/serve stacked architecture.
4. `medallionRenderer`
   - bronze/silver/gold/lakehouse/warehouse/semantic-model view.
5. `orchestrationRenderer`
   - DAG-ish flow focused on jobs, schedules, triggers, retries, failures.

## Visual requirements

- Light-theme-first.
- Clean Microsoft-modern feel.
- Simple but expressive color semantics.
- Rounded containers when useful.
- Provider icons if available/allowed, but diagrams must also work with generic fallback glyphs.
- The diagram must still be readable if icons fail.
- Animation should teach flow, not become decorative noise.

## Animation guidance

Use animation only when it explains something:

- packet or dotted movement for data flow;
- pulsing control plane or orchestrator icon for scheduled jobs;
- route emphasis when tracing a request path;
- replay or step mode for layer-by-layer explanation;
- ability to freeze to a clean static export.

## Non-goals for v1

- full drag-and-drop editor;
- perfect import of arbitrary draw.io or Mermaid files;
- every cloud provider's full icon catalog;
- deep topology auto-layout magic.

Instead, build a good structured authoring path that AI can target reliably.

## Nice imports later

Longer term, consider import adapters from:

- Mermaid flowchart / architecture blocks;
- draw.io XML (partial import only);
- Python `diagrams` library object definitions;
- Fabric / Azure metadata and templates.
