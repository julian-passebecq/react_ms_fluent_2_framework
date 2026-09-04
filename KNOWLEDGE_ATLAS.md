# Knowledge Atlas - reusable documentation/reference archetype

## Product purpose

Knowledge Atlas is the fifth shared application archetype.

It exists for sites such as:

- Microsoft Fabric / Azure / Databricks guides;
- data modeling reference;
- Airflow/dbt/orchestration documentation;
- analytics/statistics/ML reference;
- future bilingual technical learning guides;
- product-update-aware books/reference sites.

It is NOT a generic blog theme and not a CMS.

## Information architecture

Use the organizational clarity of FabricStack and the user's portfolio rather than the old card-heavy Product Watch UI.

Recommended desktop structure:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Product / Docs     Search                         EN | NO             │
├───────────────────┬──────────────────────────────────┬───────────────┤
│ Guide navigation  │ Article                          │ On this page  │
│                   │                                  │               │
│ Foundations       │ Title                            │ Overview      │
│ Data Factory      │ concise takeaway                 │ Architecture  │
│ Engineering       │                                  │ Example       │
│ Warehouse         │ [interactive figure]             │ Sources       │
│ BI                │                                  │               │
│                   │ explanation / code / table       │ Verified      │
│                   │                                  │ Status        │
│                   │ What changed / needs review      │ Version       │
└───────────────────┴──────────────────────────────────┴───────────────┘
```

On smaller screens:

- navigation becomes a drawer;
- On-this-page collapses into a compact button/drawer;
- content stays primary;
- figures remain scroll-safe and responsive.

## Required shared components

Prefer Fluent primitives directly where possible. Add only recurring composites:

- `KnowledgeShell`
- `DocsNavigation`
- `OnThisPage`
- `KnowledgeHeader`
- `SourceList`
- `OfficialLink`
- `FeatureStatusBadge`
- `FreshnessBadge`
- `VersionBadge`
- `ChangeImpactPanel`
- `RelatedKnowledge`

These must compose with existing:

- `AppShell`
- `TopBar`
- `PageHeader`
- `FigureFrame`
- `SourceNote`
- `LanguageToggle`

## Content philosophy

A technical article should normally answer in this order:

1. What is it?
2. Why/when does it matter?
3. Visual mental model.
4. How it works.
5. Example/code/model.
6. Trade-offs / common mistake.
7. Current product/version/status notes.
8. Official sources.

Keep pages concise and progressively disclose deeper detail.

## Interactive visual usage

ConceptMotion is appropriate for:

- pipeline execution;
- Direct Lake/Import/DirectQuery explanations;
- medallion transformations;
- data lineage;
- schema/model propagation;
- batch vs stream vs CDC;
- state machines;
- algorithms/loops.

Future `@datapass/charts` is appropriate for analytical charts/maps.

The documentation shell must not care which renderer is mounted inside `FigureFrame`.

## Status and freshness

Distinguish these concepts:

- **product status**: GA / Preview / Deprecated / Retired / neutral;
- **verification state**: current / needs-review / stale / unknown;
- **content version**: the version/range the text applies to;
- **source authority**: official / expert / community / internal.

Do not imply that a page is current merely because its build timestamp is new.

## Sources

Every technical feature page should support one or more `SourceRef`s.

Prefer official vendor documentation for lifecycle/version claims. Expert/community sources can explain practice but must not silently replace official lifecycle evidence.

Source presentation should be compact:

```text
Sources
Microsoft Learn · Fabric runtime 2.0 ↗
Microsoft Learn · Release channels ↗
Verified: 2026-09-04
```

## Multilingual behavior

Use the existing `LocalizedText` resolver.

A page may localize:

- title;
- summary;
- prose;
- annotations;
- glossary definitions.

Do not translate:

- code;
- API names;
- product identifiers;
- DAX/SQL/Python keywords;
- official product names.

If a page is English-only, hide the language switch or fall back cleanly.

## Explicit v1.1 limit

The Knowledge Atlas demo reads local fixtures/source-controlled data only.

The source-monitor/update engine belongs to a later track.
