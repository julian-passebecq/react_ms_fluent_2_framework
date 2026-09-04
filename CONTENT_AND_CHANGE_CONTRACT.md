# Content, source and change-impact contract

## Goal

Prepare the platform for source-aware technical documentation and update impact analysis without implementing monitoring in Foundation v1.1.

A future monitor should be able to say:

> Microsoft changed feature X. Which articles, diagrams, challenges and generated book sections depend on X?

The answer must come from stable IDs/metadata, not fuzzy filename searches.

## Recommended TypeScript model

Names may vary if Codex finds a cleaner API, but preserve the semantics.

```ts
export type Authority = 'official' | 'expert' | 'community' | 'internal';
export type ProductStatus = 'ga' | 'preview' | 'deprecated' | 'retired' | 'unknown';
export type FreshnessState = 'current' | 'needs-review' | 'stale' | 'unknown';

export interface SourceRef {
  id: string;
  title: LocalizedText;
  url: string;
  authority: Authority;
  vendor?: string;
  productIds?: string[];
  locale?: string;
  lastVerifiedAt?: string;
}

export interface FeatureRef {
  id: string;                 // e.g. fabric.runtime
  label: LocalizedText;
  productId: string;
  status?: ProductStatus;
  version?: string;
  sourceIds?: string[];
}

export interface KnowledgeEntry {
  id: string;
  slug: string;
  title: LocalizedText;
  summary?: LocalizedText;
  sectionIds?: string[];
  tags?: string[];
  productIds?: string[];
  featureIds?: string[];
  sourceIds?: string[];
  figureIds?: string[];
  challengeIds?: string[];
  status?: ProductStatus;
  appliesTo?: string[];
  verifiedAt?: string;
}

export interface ChangeEvent {
  id: string;
  sourceId: string;
  detectedAt: string;
  publishedAt?: string;
  title: string;
  url?: string;
  kind: 'feature' | 'version' | 'deprecation' | 'retirement' | 'docs' | 'api' | 'pricing' | 'security' | 'unknown';
  severity: 'info' | 'review' | 'breaking';
  featureIds: string[];
  evidence?: string;
}

export interface ImpactRef {
  changeEventId: string;
  knowledgeEntryIds: string[];
  figureIds: string[];
  challengeIds: string[];
  state: 'unreviewed' | 'reviewed' | 'no-change-needed' | 'updated';
}
```

## Deterministic impact resolution in v1.1

Implement a small pure helper using IDs only:

```text
ChangeEvent.featureIds
          ∩
KnowledgeEntry.featureIds
          ↓
ImpactRef / needs-review state
```

This is intentionally simple.

Do not infer affected content from prose in v1.1.

## Future monitor pipeline (NOT v1.1)

```text
Official docs / roadmap / blogs / release notes
                   ↓
        source-specific collectors
                   ↓
         normalized ChangeEvent
                   ↓
      deterministic feature registry
                   ↓
     optional AI impact classification
                   ↓
 articles / figures / challenges / books
                   ↓
        review queue / alert / PR
```

The user's existing Microsoft Product Watch already demonstrates a useful collector pattern: static JSON refreshed by scheduled automation. Reuse its source-registry/history principles later, not its old page layout.

## Book/document impact

Future generated books can identify sections with the same `featureIds` and `sourceIds`.

Do not make Word/PDF files the source of truth. Source-controlled structured content should generate the final publication.

## Auditability

Never auto-update a technical claim invisibly.

Future automation should preserve:

- old value;
- detected change;
- source URL;
- detected/published time;
- impacted IDs;
- review state;
- human/AI update note.
