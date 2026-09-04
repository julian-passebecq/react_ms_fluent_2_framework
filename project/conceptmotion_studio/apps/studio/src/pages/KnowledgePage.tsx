import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Text } from '@fluentui/react-components';
import { ArrowReset20Regular, CheckmarkCircle20Regular, Open20Regular } from '@fluentui/react-icons';
import { ConceptScene } from '@conceptmotion/react';
import { computeFreshnessState, resolveLocalizedText as resolveKnowledgeText } from '@datapass/knowledge';
import {
  ChangeImpactPanel,
  DocsNavigation,
  FeatureStatusBadge,
  FigureFrame,
  FreshnessBadge,
  KnowledgeHeader,
  KnowledgeShell,
  OfficialLink,
  OnThisPage,
  SourceList,
  VersionBadge,
  useLocale,
} from '@datapass/ui';
import { SvgExportButton } from '../components/SvgExportButton';
import { createPipelineDiagram, pipelineFlowKinds } from '../data/diagramFixtures';
import {
  knowledgeSources,
  runtimeChangeEvent,
  runtimeImpact,
  runtimeKnowledgeEntry,
} from '../data/knowledgeFixtures';
import { figureLabels } from '../lib/localizedChrome';
import { usePersistentState } from '../lib/usePersistentState';
import { useReducedMotion } from '../lib/useTimeline';

export function KnowledgePage() {
  const { locale } = useLocale();
  const [flowKind, setFlowKind] = useState(pipelineFlowKinds[0].id);
  const [selectedId, setSelectedId] = useState<string>();
  const [reviewed, setReviewed] = usePersistentState('datapass:knowledge:runtime-change-reviewed', false);
  const [routeSection, setRouteSection] = useState(() => window.location.hash.replace(/^#\/?/, '').split('/')[1] ?? 'overview');
  const visualRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const diagram = useMemo(() => createPipelineDiagram(flowKind), [flowKind]);

  useEffect(() => {
    const scrollToRouteSection = () => {
      const sectionId = window.location.hash.replace(/^#\/?/, '').split('/')[1];
      setRouteSection(sectionId ?? 'overview');
      if (sectionId) window.requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ block: 'start' }));
    };
    scrollToRouteSection();
    window.addEventListener('hashchange', scrollToRouteSection);
    return () => window.removeEventListener('hashchange', scrollToRouteSection);
  }, []);
  const freshness = computeFreshnessState(runtimeKnowledgeEntry, [runtimeChangeEvent], {
    now: '2026-09-04T12:00:00Z',
    reviewedChangeEventIds: reviewed ? [runtimeChangeEvent.id] : [],
  });

  const navigation = (
    <DocsNavigation
      title={locale === 'no' ? 'Fabric-veiledning' : 'Fabric guide'}
      label={locale === 'no' ? 'Dokumentasjonsseksjoner' : 'Documentation sections'}
      footer={<Caption locale={locale} />}
    >
      <a className={`docs-nav-link${routeSection === 'overview' ? ' is-active' : ''}`} href="#/knowledge" aria-current={routeSection === 'overview' ? 'page' : undefined}>Runtime boundaries</a>
      <a className={`docs-nav-link${routeSection === 'mental-model' ? ' is-active' : ''}`} href="#/knowledge/mental-model" aria-current={routeSection === 'mental-model' ? 'page' : undefined}>Medallion mental model</a>
      <a className={`docs-nav-link${routeSection === 'workflow' ? ' is-active' : ''}`} href="#/knowledge/workflow" aria-current={routeSection === 'workflow' ? 'page' : undefined}>Upgrade workflow</a>
      <a className={`docs-nav-link${routeSection === 'trade-offs' ? ' is-active' : ''}`} href="#/knowledge/trade-offs" aria-current={routeSection === 'trade-offs' ? 'page' : undefined}>Trade-offs</a>
      <a className={`docs-nav-link${routeSection === 'sources' ? ' is-active' : ''}`} href="#/knowledge/sources" aria-current={routeSection === 'sources' ? 'page' : undefined}>Official sources</a>
    </DocsNavigation>
  );

  const context = (
    <OnThisPage
      title={locale === 'no' ? 'På denne siden' : 'On this page'}
      label={locale === 'no' ? 'Artikkelseksjoner' : 'Article sections'}
      metadata={(
        <div className="context-metadata">
          <FeatureStatusBadge status={runtimeKnowledgeEntry.status ?? 'unknown'} />
          <FreshnessBadge state={freshness} />
          <VersionBadge version="1.3 / 2.0" />
          <span>Verified 2026-07-15</span>
        </div>
      )}
    >
      <a href="#/knowledge/overview">Overview</a>
      <a href="#/knowledge/mental-model">Mental model</a>
      <a href="#/knowledge/workflow">Upgrade workflow</a>
      <a href="#/knowledge/trade-offs">Trade-offs</a>
      <a href="#/knowledge/sources">Sources</a>
    </OnThisPage>
  );

  const figureFallback = (
    <div>
      <p>Source data enters Bronze, is validated in Silver, curated in Gold, then served through a semantic model to BI.</p>
      <p>The orchestrator uses a control edge. Invalid records follow a separately patterned failure route to quarantine.</p>
    </div>
  );

  const article = (
    <div className="article-prose">
      <section id="overview">
        <p className="article-lead">{locale === 'no'
          ? 'En Fabric-kjøretid er en versjonert beregningsavhengighet, ikke hjemmet til de varige dataene dine.'
          : 'A Fabric runtime is a versioned compute dependency, not the home of your durable data.'}</p>
        <p>{locale === 'no'
          ? 'Hold OneLake-data, transformasjonslogikk og kjøretidsvalg som separate beslutninger. Da kan du gjennomgå bibliotek- og språkkompatibilitet før en endring påvirker hele arbeidsområdet.'
          : 'Keep OneLake data, transformation logic and runtime selection as separate decisions. That lets you review library and language compatibility before a workspace-level change affects every new session.'}</p>
      </section>

      <section id="mental-model">
        <h2>{locale === 'no' ? 'Mental modell' : 'Mental model'}</h2>
        <p>{locale === 'no'
          ? 'Medaljonglagene beskriver datakvalitet og ansvar. Kjøretiden beskriver motoren som flytter data mellom lagene. De bør kunne endres uavhengig.'
          : 'Medallion layers describe data quality and responsibility. The runtime describes the engine that moves data between those layers. They should be able to evolve independently.'}</p>
        <div ref={visualRef} className="knowledge-figure-host">
          <FigureFrame
            {...figureLabels(locale)}
            title={locale === 'no' ? 'Dataflyt og kontroll er forskjellige ting' : 'Data flow and control are different things'}
            subtitle={locale === 'no' ? 'Samme topologi, tre inntakssemantikker.' : 'The same topology supports three ingestion semantics.'}
            takeaway={flowKind === 'data-batch'
              ? 'Batch moves bounded groups on a schedule.'
              : flowKind === 'data-stream'
                ? 'Streaming represents a continuing event channel.'
                : 'CDC carries discrete insert, update and delete changes.'}
            toolbar={(
              <div className="toolbar-row" role="group" aria-label="Ingestion flow kind">
                {pipelineFlowKinds.map((mode) => (
                  <Button key={mode.id} size="small" appearance={flowKind === mode.id ? 'primary' : 'subtle'} onClick={() => setFlowKind(mode.id)}>{mode.label}</Button>
                ))}
              </div>
            )}
            exportAction={<SvgExportButton hostRef={visualRef} filename={`fabric-${flowKind}.svg`} />}
            source="Microsoft Learn source links listed below · diagram text is original"
            note="Control, failure and recovery paths remain visually distinct without color."
            fallback={figureFallback}
            fallbackMode="details"
            minimumHeight="24rem"
          >
            <div className="visual-host" data-testid="knowledge-figure">
              <ConceptScene
                spec={diagram}
                reducedMotion={reducedMotion}
                selectedId={selectedId}
                onSelect={setSelectedId}
                options={{ locale }}
                ariaLabel="Source to Bronze, Silver, Gold, semantic model and BI with separate data, control and failure paths"
                fallback={figureFallback}
              />
            </div>
          </FigureFrame>
        </div>
      </section>

      <section id="workflow">
        <h2>{locale === 'no' ? 'En trygg endringsflyt' : 'A safe change workflow'}</h2>
        <ol className="article-steps">
          <li><b>Inventory.</b> Record notebooks, environment libraries and workloads that inherit the workspace runtime.</li>
          <li><b>Verify.</b> Compare supported component versions and test representative transformations.</li>
          <li><b>Change deliberately.</b> Update the environment or workspace setting through normal governance.</li>
          <li><b>Observe.</b> Re-run quality checks and retain a clear rollback decision.</li>
        </ol>
      </section>

      <section id="trade-offs">
        <h2>{locale === 'no' ? 'Vanlig feil' : 'Common mistake'}</h2>
        <p>{locale === 'no'
          ? 'En ny standardkjøretid betyr ikke automatisk at alle eksisterende biblioteker, økter og arbeidsbelastninger er klare. Versjonsmetadata og kildeverifisering må følge veiledningen.'
          : 'A newer default runtime does not automatically mean every existing library, session and workload is ready. Version metadata and source verification must travel with the guidance.'}</p>
      </section>

      <section id="sources">
        <SourceList
          title={locale === 'no' ? 'Offisielle kilder' : 'Official sources'}
          sources={knowledgeSources.map((source) => ({
            id: source.id,
            title: resolveKnowledgeText(source.title, locale),
            href: source.url,
            publisher: source.vendor,
            authority: source.authority,
            detail: `verified ${source.lastVerifiedAt?.slice(0, 10)}`,
          }))}
        />
      </section>
    </div>
  );

  const changePanel = (
    <ChangeImpactPanel
      title={reviewed ? (locale === 'no' ? 'Endring gjennomgått' : 'Change reviewed') : (locale === 'no' ? 'Krever gjennomgang' : 'Needs review')}
      summary={resolveKnowledgeText(runtimeChangeEvent.evidence ?? runtimeChangeEvent.title, locale)}
      impactedItems={[
        `${runtimeImpact.knowledgeEntryIds.length} knowledge entry`,
        `${runtimeImpact.figureIds.length} figure`,
        `${runtimeImpact.challengeIds.length} challenge`,
        `featureId = ${runtimeChangeEvent.featureIds[0]}`,
      ]}
      tone={reviewed ? 'informative' : 'warning'}
      action={(
        <Button
          appearance={reviewed ? 'subtle' : 'primary'}
          icon={reviewed ? <ArrowReset20Regular /> : <CheckmarkCircle20Regular />}
          onClick={() => setReviewed(!reviewed)}
          data-testid="knowledge-review-toggle"
        >
          {reviewed ? (locale === 'no' ? 'Tilbakestill demo' : 'Reset demo') : (locale === 'no' ? 'Merk gjennomgått' : 'Mark reviewed')}
        </Button>
      )}
    />
  );

  return (
    <KnowledgeShell
      data-testid="knowledge-page"
      navigationLabel={locale === 'no' ? 'Dokumentasjonsnavigasjon' : 'Documentation navigation'}
      articleLabel={locale === 'no' ? 'Kunnskapsartikkel' : 'Knowledge article'}
      contextLabel={locale === 'no' ? 'På denne siden og kildestatus' : 'On this page and source status'}
      header={(
        <KnowledgeHeader
          eyebrow="KNOWLEDGE ATLAS · SOURCE-AWARE"
          title={resolveKnowledgeText(runtimeKnowledgeEntry.title, locale)}
          description={resolveKnowledgeText(runtimeKnowledgeEntry.summary ?? '', locale)}
          status={<FeatureStatusBadge status={runtimeKnowledgeEntry.status ?? 'unknown'} />}
          version={<VersionBadge version="1.3 / 2.0" />}
          freshness={<FreshnessBadge state={freshness} />}
          verifiedAt="2026-07-15"
          verifiedLabel={locale === 'no' ? 'Verifisert' : 'Verified'}
          metadata={<Badge appearance="outline">featureId: fabric.runtime</Badge>}
          actions={runtimeChangeEvent.url
            ? <OfficialLink href={runtimeChangeEvent.url} externalLabel={locale === 'no' ? 'åpnes i en ny fane' : 'opens in a new tab'}><Open20Regular /> {locale === 'no' ? 'Se offisiell oppdatering' : 'Inspect official update'}</OfficialLink>
            : undefined}
        />
      )}
      navigation={navigation}
      article={article}
      onThisPage={context}
      changePanel={changePanel}
    />
  );
}

function Caption({ locale }: { locale: 'en' | 'no' }) {
  return (
    <div className="docs-fixture-caption">
      <Text size={200} weight="semibold">{locale === 'no' ? 'Lokale fixtures' : 'Local fixtures'}</Text>
      <Text size={100}>{locale === 'no' ? 'Ingen nettverksovervåking' : 'No network monitoring'}</Text>
    </div>
  );
}
