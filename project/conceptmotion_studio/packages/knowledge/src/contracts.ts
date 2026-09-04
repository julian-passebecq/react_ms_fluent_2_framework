import type { LocalizedText } from './localization';

export type Authority = 'official' | 'expert' | 'community' | 'internal';
export type ProductStatus = 'ga' | 'preview' | 'deprecated' | 'retired' | 'unknown';
export type FreshnessState = 'current' | 'needs-review' | 'stale' | 'unknown';
export type ChangeKind = 'feature' | 'version' | 'deprecation' | 'retirement' | 'docs' | 'api' | 'pricing' | 'security' | 'unknown';
export type ChangeSeverity = 'info' | 'review' | 'breaking';
export type ImpactState = 'unreviewed' | 'reviewed' | 'no-change-needed' | 'updated';

export interface SourceRef {
  readonly id: string;
  readonly title: LocalizedText;
  readonly url: string;
  readonly authority: Authority;
  readonly vendor?: string;
  readonly productIds?: readonly string[];
  readonly locale?: string;
  readonly lastVerifiedAt?: string;
}

export interface FeatureRef {
  readonly id: string;
  readonly label: LocalizedText;
  readonly productId: string;
  readonly status?: ProductStatus;
  readonly version?: string;
  readonly sourceIds?: readonly string[];
}

export interface KnowledgeEntry {
  readonly id: string;
  readonly slug: string;
  readonly title: LocalizedText;
  readonly summary?: LocalizedText;
  readonly sectionIds?: readonly string[];
  readonly tags?: readonly string[];
  readonly productIds?: readonly string[];
  readonly featureIds?: readonly string[];
  readonly sourceIds?: readonly string[];
  readonly figureIds?: readonly string[];
  readonly challengeIds?: readonly string[];
  readonly status?: ProductStatus;
  readonly appliesTo?: readonly string[];
  readonly verifiedAt?: string;
}

export interface ChangeEvent {
  readonly id: string;
  readonly sourceId: string;
  readonly detectedAt: string;
  readonly publishedAt?: string;
  readonly title: LocalizedText;
  readonly url?: string;
  readonly kind: ChangeKind;
  readonly severity: ChangeSeverity;
  readonly featureIds: readonly string[];
  readonly evidence?: LocalizedText;
}

export interface ImpactRef {
  readonly changeEventId: string;
  readonly knowledgeEntryIds: readonly string[];
  readonly figureIds: readonly string[];
  readonly challengeIds: readonly string[];
  readonly state: ImpactState;
}

export interface KnowledgeDataset {
  readonly sources: readonly SourceRef[];
  readonly features: readonly FeatureRef[];
  readonly entries: readonly KnowledgeEntry[];
  readonly changes?: readonly ChangeEvent[];
  readonly impacts?: readonly ImpactRef[];
}
