import {
  computeFreshnessState,
  resolveChangeImpact,
  type ChangeEvent,
  type FeatureRef,
  type KnowledgeDataset,
  type KnowledgeEntry,
  type SourceRef,
} from '@datapass/knowledge';

export const knowledgeSources: SourceRef[] = [
  {
    id: 'mslearn.fabric.runtime',
    title: { en: 'Apache Spark runtime in Fabric', no: 'Apache Spark-kjøretid i Fabric' },
    url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/runtime',
    authority: 'official',
    vendor: 'Microsoft',
    productIds: ['microsoft-fabric'],
    locale: 'en-US',
    lastVerifiedAt: '2026-07-15T09:00:00Z',
  },
  {
    id: 'mslearn.fabric.medallion',
    title: { en: 'Implement medallion lakehouse architecture in Fabric', no: 'Implementer medaljongarkitektur i Fabric' },
    url: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture',
    authority: 'official',
    vendor: 'Microsoft',
    productIds: ['microsoft-fabric'],
    locale: 'en-US',
    lastVerifiedAt: '2026-07-15T09:00:00Z',
  },
];

export const knowledgeFeatures: FeatureRef[] = [
  {
    id: 'fabric.runtime',
    label: { en: 'Fabric Spark runtime', no: 'Fabric Spark-kjøretid' },
    productId: 'microsoft-fabric',
    status: 'ga',
    version: '1.3 / 2.0',
    sourceIds: ['mslearn.fabric.runtime'],
  },
  {
    id: 'fabric.medallion',
    label: { en: 'OneLake medallion architecture', no: 'OneLake-medaljongarkitektur' },
    productId: 'microsoft-fabric',
    status: 'ga',
    version: 'Foundation guidance',
    sourceIds: ['mslearn.fabric.medallion'],
  },
  {
    id: 'sql.window',
    label: 'SQL window functions',
    productId: 'sql',
    status: 'unknown',
    version: 'Local learning fixture',
    sourceIds: [],
  },
];

export const runtimeKnowledgeEntry: KnowledgeEntry = {
  id: 'knowledge.fabric.runtime-boundaries',
  slug: 'fabric-runtime-boundaries',
  title: { en: 'Treat the runtime as a versioned dependency', no: 'Behandle kjøretiden som en versjonert avhengighet' },
  summary: {
    en: 'Separate durable lakehouse data from the runtime that transforms it, then verify compatibility before changing a workspace default.',
    no: 'Skill varige lakehouse-data fra kjøretiden som transformerer dem, og kontroller kompatibilitet før standarden endres.',
  },
  sectionIds: ['overview', 'mental-model', 'workflow', 'trade-offs', 'sources'],
  tags: ['Fabric', 'Spark', 'runtime', 'lakehouse'],
  productIds: ['microsoft-fabric'],
  featureIds: ['fabric.runtime', 'fabric.medallion'],
  sourceIds: ['mslearn.fabric.runtime', 'mslearn.fabric.medallion'],
  figureIds: ['figure.fabric.runtime-medallion'],
  challengeIds: ['challenge.runtime-upgrade-review'],
  status: 'ga',
  appliesTo: ['Fabric Runtime 1.3', 'Fabric Runtime 2.0 review path'],
  verifiedAt: '2026-07-15T09:00:00Z',
};

export const unaffectedKnowledgeEntry: KnowledgeEntry = {
  id: 'knowledge.sql.window-basics',
  slug: 'sql-window-basics',
  title: 'SQL window basics',
  summary: 'Window functions retain row grain while adding calculations.',
  featureIds: ['sql.window'],
  sourceIds: [],
  figureIds: ['figure.sql.window'],
  status: 'unknown',
  verifiedAt: '2026-08-30T09:00:00Z',
};

export const runtimeChangeEvent: ChangeEvent = {
  id: 'change.fabric.runtime-2-doc-refresh',
  sourceId: 'mslearn.fabric.runtime',
  detectedAt: '2026-08-20T10:30:00Z',
  publishedAt: '2026-08-18T08:00:00Z',
  title: { en: 'Runtime documentation lists revised component guidance', no: 'Kjøretidsdokumentasjonen har revidert komponentveiledning' },
  url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/runtime-2-0',
  kind: 'version',
  severity: 'review',
  featureIds: ['fabric.runtime'],
  evidence: {
    en: 'Local demonstration event: runtime-version guidance changed after this article was verified.',
    no: 'Lokal demonstrasjon: veiledning for kjøretidsversjon ble endret etter at artikkelen ble verifisert.',
  },
};

export const knowledgeEntries = [runtimeKnowledgeEntry, unaffectedKnowledgeEntry];
export const runtimeImpact = resolveChangeImpact(runtimeChangeEvent, knowledgeEntries);
export const runtimeFreshness = computeFreshnessState(runtimeKnowledgeEntry, [runtimeChangeEvent], {
  now: '2026-09-04T12:00:00Z',
  staleAfterDays: 180,
});

export const knowledgeDataset: KnowledgeDataset = {
  sources: knowledgeSources,
  features: knowledgeFeatures,
  entries: knowledgeEntries,
  changes: [runtimeChangeEvent],
  impacts: [runtimeImpact],
};
