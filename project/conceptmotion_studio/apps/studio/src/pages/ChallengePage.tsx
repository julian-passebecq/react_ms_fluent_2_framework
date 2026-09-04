import { useMemo, useRef, useState } from 'react';
import { CodeDiff, CodeEditor } from '@datapass/code';
import { setChallengeDraft, updateChallengeProgress } from '@datapass/progress';
import {
  Badge,
  Button,
  Dropdown,
  Input,
  Label,
  Option,
  Tab,
  TabList,
  Text,
  Tooltip,
} from '@fluentui/react-components';
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  Bookmark20Filled,
  Bookmark20Regular,
  CheckmarkCircle20Filled,
  CheckmarkCircle20Regular,
  Code20Regular,
  Eye20Regular,
  Lightbulb20Regular,
  Search20Regular,
} from '@fluentui/react-icons';
import { ConceptScene } from '@conceptmotion/react';
import {
  ChallengeShell,
  CodeDiagnostics,
  FigureFrame,
  PageHeader,
  TimelineControls,
  useLocale,
} from '@datapass/ui';
import {
  challengeCatalog,
  type ChallengeDefinition,
  type ChallengeDifficulty,
} from '../data/challengeFixtures';
import { joinLessonFrames, joinSceneSpec } from '../data/semanticFixtures';
import { analyzeDraft } from '../lib/challengeDiagnostics';
import { figureLabels, timelineLabels } from '../lib/localizedChrome';
import { useProgressStore } from '../lib/useProgressStore';
import { useTimeline } from '../lib/useTimeline';

type LeftMode = 'description' | 'visualize' | 'hints';
type RightMode = 'code' | 'solution' | 'compare';

const difficultyColor = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
} as const;

export function ChallengePage() {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'All' | ChallengeDifficulty>('All');
  const [selectedId, setSelectedId] = useState(challengeCatalog[0].id);
  const [variantId, setVariantId] = useState(challengeCatalog[0].variants[0].id);
  const [leftMode, setLeftMode] = useState<LeftMode>('description');
  const [rightMode, setRightMode] = useState<RightMode>('code');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [hintCount, setHintCount] = useState<Record<string, number>>({});
  const { state: learningProgress, update: updateLearningProgress } = useProgressStore();
  const joinTimeline = useTimeline(joinLessonFrames.length, 'challenge-join');

  const challenge = challengeCatalog.find((item) => item.id === selectedId) ?? challengeCatalog[0];
  const variant = challenge.variants.find((item) => item.id === variantId) ?? challenge.variants[0];
  const draftKey = `${challenge.id}:${variant.id}`;
  const draft = learningProgress.challenges[challenge.id]?.drafts[variant.id] ?? variant.starter;
  const currentProgress = learningProgress.challenges[challenge.id] ?? {
    id: challenge.id,
    status: 'not-started' as const,
    drafts: {},
    mastered: false,
    review: false,
    flagged: false,
  };
  const diagnostics = useMemo(() => analyzeDraft(draft), [draft]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return challengeCatalog.filter((item) => {
      const matchesText = !normalized || [item.title, item.domain, ...item.tags]
        .some((value) => value.toLowerCase().includes(normalized));
      return matchesText && (difficulty === 'All' || item.difficulty === difficulty);
    });
  }, [difficulty, query]);

  const chooseChallenge = (next: ChallengeDefinition) => {
    setSelectedId(next.id);
    setVariantId(next.variants[0].id);
    setLeftMode('description');
    setRightMode('code');
  };

  const updateDraft = (value: string) => {
    updateLearningProgress((current) => setChallengeDraft(current, challenge.id, variant.id, value));
  };

  const updateProgress = (field: 'mastered' | 'flagged' | 'review') => {
    updateLearningProgress((current) => updateChallengeProgress(current, challenge.id, {
      [field]: !current.challenges[challenge.id]?.[field],
    }));
  };

  const activeIndex = challengeCatalog.findIndex((item) => item.id === challenge.id);
  const shownHints = hintCount[challenge.id] ?? 0;

  return (
    <ChallengeShell
      data-testid="challenge-page"
      header={(
        <>
          <span className="visually-hidden" role="status" aria-live="polite">
            {locale === 'no' ? 'Valgt oppgave' : 'Selected challenge'}: {challenge.title}
          </span>
          <PageHeader
            eyebrow={locale === 'no' ? 'OPPGAVE · LOKAL LÆRINGSTILSTAND' : 'CHALLENGE · LOCAL LEARNING STATE'}
            title={challenge.title}
            description={challenge.summary}
            metadata={(
              <div className="metadata-row">
                <Badge appearance="tint" color={difficultyColor[challenge.difficulty]}>{challenge.difficulty}</Badge>
                <Badge appearance="outline">{challenge.domain}</Badge>
                {challenge.tags.map((tag) => <Badge key={tag} appearance="outline">{tag}</Badge>)}
              </div>
            )}
            actions={(
              <div className="toolbar-row">
                <Tooltip content="Persist review status on this device" relationship="description">
                  <Button
                    appearance={currentProgress.review ? 'primary' : 'subtle'}
                    aria-pressed={Boolean(currentProgress.review)}
                    onClick={() => updateProgress('review')}
                  >
                    {currentProgress.review
                      ? (locale === 'no' ? 'Til gjennomgang' : 'In review')
                      : (locale === 'no' ? 'Legg til gjennomgang' : 'Add to review')}
                  </Button>
                </Tooltip>
              </div>
            )}
          />
        </>
      )}
      catalog={(
        <div className="challenge-catalog">
          <div>
            <span className="surface-card__eyebrow">{locale === 'no' ? 'OPPGAVEKATALOG' : 'PROBLEM CATALOG'}</span>
            <Text size={200} block>{filtered.length} {locale === 'no' ? 'av' : 'of'} {challengeCatalog.length} {locale === 'no' ? 'oppgaver' : 'challenges'}</Text>
          </div>
          <Input
            type="search"
            value={query}
            onChange={(_, data) => setQuery(data.value)}
            contentBefore={<Search20Regular />}
            placeholder={locale === 'no' ? 'Søk etter tittel eller tagg' : 'Search title or tag'}
            aria-label={locale === 'no' ? 'Søk i oppgaver' : 'Search challenges'}
          />
          <div className="challenge-filter">
            <Label htmlFor="challenge-difficulty">{locale === 'no' ? 'Vanskelighetsgrad' : 'Difficulty'}</Label>
            <Dropdown
              id="challenge-difficulty"
              value={difficulty}
              selectedOptions={[difficulty]}
              onOptionSelect={(_, data) => setDifficulty((data.optionValue ?? 'All') as 'All' | ChallengeDifficulty)}
            >
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((value) => <Option key={value} value={value}>{value}</Option>)}
            </Dropdown>
          </div>
          <div className="challenge-list" role="group" aria-label="Filtered challenges">
            {filtered.map((item) => (
              <Button
                key={item.id}
                className={item.id === challenge.id ? 'challenge-list__item is-active' : 'challenge-list__item'}
                appearance={item.id === challenge.id ? 'subtle' : 'transparent'}
                onClick={() => chooseChallenge(item)}
                aria-pressed={item.id === challenge.id}
              >
                <span><b>{item.title}</b><small>{item.domain} · {item.difficulty}</small></span>
                {learningProgress.challenges[item.id]?.mastered ? <CheckmarkCircle20Filled aria-label="Mastered" /> : null}
              </Button>
            ))}
            {!filtered.length ? <p className="challenge-empty">No challenge matches these filters.</p> : null}
          </div>
        </div>
      )}
      leftTabs={(
        <TabList selectedValue={leftMode} onTabSelect={(_, data) => setLeftMode(data.value as LeftMode)} aria-label={locale === 'no' ? 'Oppgaveinformasjon' : 'Problem information'}>
          <Tab id="challenge-description-tab" aria-controls="challenge-left-panel" value="description">{t('description')}</Tab>
          <Tab id="challenge-visualize-tab" aria-controls="challenge-left-panel" value="visualize" icon={<Eye20Regular />}>{t('visualize')}</Tab>
          <Tab id="challenge-hints-tab" aria-controls="challenge-left-panel" value="hints" icon={<Lightbulb20Regular />}>{t('hints')}</Tab>
        </TabList>
      )}
      leftPane={(
        <div className="challenge-left-pane">
          {leftMode === 'description' ? <Description challenge={challenge} /> : null}
          {leftMode === 'visualize' ? (
            challenge.visualization === 'join'
              ? <JoinVisualization timeline={joinTimeline} />
              : <div className="challenge-placeholder"><Eye20Regular /><h2>{locale === 'no' ? 'Ingen visualisering er tilknyttet' : 'No visual attached'}</h2><p>{locale === 'no' ? 'Denne oppgaven bruker bare tekst- og kodeflatene.' : 'This challenge deliberately uses the text and code surfaces only.'}</p></div>
          ) : null}
          {leftMode === 'hints' ? (
            <div className="hints-panel">
              <h2>{locale === 'no' ? 'Trinnvise hint' : 'Progressive hints'}</h2>
              <p>{locale === 'no' ? 'Vis bare så mye veiledning som du trenger.' : 'Reveal only as much guidance as you need.'}</p>
              {shownHints ? (
                <ol>{challenge.hints.slice(0, shownHints).map((hint, index) => <li key={`${challenge.id}:hint:${index}`}>{hint}</li>)}</ol>
              ) : <p className="challenge-muted">{locale === 'no' ? 'Ingen hint er vist ennå.' : 'No hints revealed yet.'}</p>}
              <Button
                appearance="primary"
                disabled={shownHints >= challenge.hints.length}
                onClick={() => setHintCount((current) => ({ ...current, [challenge.id]: Math.min(challenge.hints.length, shownHints + 1) }))}
              >
                {shownHints >= challenge.hints.length
                  ? (locale === 'no' ? 'Alle hint er vist' : 'All hints revealed')
                  : `${locale === 'no' ? 'Vis hint' : 'Reveal hint'} ${shownHints + 1}`}
              </Button>
            </div>
          ) : null}
        </div>
      )}
      rightTabs={(
        <div className="challenge-code-tabs">
          <TabList selectedValue={rightMode} onTabSelect={(_, data) => setRightMode(data.value as RightMode)} aria-label={locale === 'no' ? 'Modus for kodeflate' : 'Code workspace mode'}>
            <Tab id="challenge-code-tab" aria-controls="challenge-right-panel" value="code" icon={<Code20Regular />}>Code</Tab>
            <Tab id="challenge-solution-tab" aria-controls="challenge-right-panel" value="solution">{t('solution')}</Tab>
            <Tab id="challenge-compare-tab" aria-controls="challenge-right-panel" value="compare">{t('compare')}</Tab>
          </TabList>
          <Dropdown
            aria-label="Language variant"
            value={variant.label}
            selectedOptions={[variant.id]}
            onOptionSelect={(_, data) => {
              const next = challenge.variants.find((item) => item.id === data.optionValue);
              if (next) setVariantId(next.id);
            }}
          >
            {challenge.variants.map((item) => <Option key={item.id} value={item.id}>{item.label}</Option>)}
          </Dropdown>
        </div>
      )}
      rightPane={(
        <div className="challenge-editor-pane">
          {rightMode === 'code' ? (
            <>
              <CodeEditor
                height="100%"
                path={`learner/${draftKey}`}
                language={variant.monacoLanguage}
                value={draft}
                onChange={updateDraft}
                ariaLabel="Learner draft editor"
              />
              <div className="challenge-editor-actions">
                <span>{locale === 'no' ? 'Utkast lagret lokalt · ingen kodekjøring' : 'Draft saved locally · no code execution'}</span>
                <Button size="small" appearance="subtle" onClick={() => updateDraft(variant.starter)}>{locale === 'no' ? 'Tilbakestill startkode' : 'Reset starter'}</Button>
              </div>
            </>
          ) : null}
          {rightMode === 'solution' ? (
            revealed[draftKey] ? (
              <CodeEditor
                height="100%"
                path={`reference/${draftKey}`}
                language={variant.monacoLanguage}
                value={variant.solution}
                ariaLabel="Read-only reference solution"
                readOnly
              />
            ) : <RevealSolution onReveal={() => setRevealed((current) => ({ ...current, [draftKey]: true }))} />
          ) : null}
          {rightMode === 'compare' ? (
            revealed[draftKey] ? (
              <CodeDiff
                height="100%"
                original={variant.solution}
                modified={draft}
                language={variant.monacoLanguage}
                path={`comparison/${draftKey}`}
                ariaLabel="Learner and reference diff"
                readOnly
              />
            ) : <RevealSolution onReveal={() => setRevealed((current) => ({ ...current, [draftKey]: true }))} compare />
          ) : null}
        </div>
      )}
      leftPaneId="challenge-left-panel"
      rightPaneId="challenge-right-panel"
      catalogLabel={locale === 'no' ? 'Oppgavekatalog' : 'Challenge catalog'}
      problemLabel={locale === 'no' ? 'Oppgavebeskrivelse og veiledning' : 'Challenge description and guidance'}
      workspaceLabel={locale === 'no' ? 'Kodeflate' : 'Code workspace'}
      leftPaneLabel={locale === 'no' ? 'Informasjonspanel for oppgaven' : `${leftMode[0].toUpperCase()}${leftMode.slice(1)} challenge panel`}
      rightPaneLabel={locale === 'no' ? 'Kodepanel for oppgaven' : `${rightMode[0].toUpperCase()}${rightMode.slice(1)} code panel`}
      diagnostics={rightMode === 'code' ? <CodeDiagnostics diagnostics={diagnostics} title={locale === 'no' ? 'Valgfri lokal diagnostikk' : 'Optional local diagnostics'} /> : undefined}
      bottomPanel={(
        <div className="challenge-bottom">
          <div className="challenge-progress-actions" aria-label="Local challenge status">
            <Button
              icon={currentProgress.mastered ? <CheckmarkCircle20Filled /> : <CheckmarkCircle20Regular />}
              appearance={currentProgress.mastered ? 'primary' : 'subtle'}
              aria-pressed={Boolean(currentProgress.mastered)}
              onClick={() => updateProgress('mastered')}
            >
              {currentProgress.mastered ? (locale === 'no' ? 'Mestret' : 'Mastered') : (locale === 'no' ? 'Merk som mestret' : 'Mark mastered')}
            </Button>
            <Button
              icon={currentProgress.flagged ? <Bookmark20Filled /> : <Bookmark20Regular />}
              appearance={currentProgress.flagged ? 'primary' : 'subtle'}
              aria-pressed={Boolean(currentProgress.flagged)}
              onClick={() => updateProgress('flagged')}
            >
              {currentProgress.flagged ? (locale === 'no' ? 'Flagget' : 'Flagged') : (locale === 'no' ? 'Flagg' : 'Flag')}
            </Button>
            <Text size={200}>{locale === 'no' ? 'Status lagres bare på denne enheten.' : 'Status is stored only on this device.'}</Text>
          </div>
          <div className="challenge-paging">
            <Button icon={<ArrowLeft20Regular />} disabled={activeIndex === 0} onClick={() => chooseChallenge(challengeCatalog[activeIndex - 1])}>{t('previous')}</Button>
            <span>{activeIndex + 1} / {challengeCatalog.length}</span>
            <Button icon={<ArrowRight20Regular />} iconPosition="after" disabled={activeIndex === challengeCatalog.length - 1} onClick={() => chooseChallenge(challengeCatalog[activeIndex + 1])}>{t('next')}</Button>
          </div>
        </div>
      )}
    />
  );
}

function Description({ challenge }: { challenge: ChallengeDefinition }) {
  return (
    <article className="challenge-description">
      <section><h2>Problem</h2><p>{challenge.summary}</p></section>
      <section><h3>Schema / input shape</h3><pre>{challenge.schema}</pre></section>
      <section><h3>Input</h3><pre>{challenge.input}</pre></section>
      <section><h3>Example</h3><pre>{challenge.example}</pre></section>
      <section><h3>Expected output</h3><p>{challenge.expectedOutput}</p></section>
      <aside className="challenge-boundary"><b>Learning boundary</b><span>This workbench stores drafts and compares text locally. It has no runtime, judge, database, terminal or correctness claim.</span></aside>
    </article>
  );
}

function JoinVisualization({ timeline }: { timeline: ReturnType<typeof useTimeline> }) {
  const { locale } = useLocale();
  const hostRef = useRef<HTMLDivElement>(null);
  const frame = joinLessonFrames[timeline.currentStep];
  const fallback = <p>{frame.caption} Current result rows: {frame.state.rows.length}.</p>;
  return (
    <div ref={hostRef} className="challenge-visualization">
      <FigureFrame
        {...figureLabels(locale)}
        title="Why the join can fan out"
        subtitle="This optional semantic scene explains the join before ranking begins."
        takeaway={frame.caption}
        source="Local deterministic challenge fixture"
        fallback={fallback}
        fallbackMode="details"
        toolbar={<TimelineControls {...timeline.controls} labels={timelineLabels(locale)} />}
        minimumHeight="22rem"
      >
        <div className="visual-host">
          <ConceptScene spec={joinSceneSpec} frameIndex={timeline.currentStep} reducedMotion={timeline.reducedMotion} fallback={fallback} />
        </div>
      </FigureFrame>
    </div>
  );
}

function RevealSolution({ onReveal, compare = false }: { onReveal(): void; compare?: boolean }) {
  const { locale } = useLocale();
  return (
    <div className="challenge-reveal">
      <Eye20Regular />
      <h2>{locale === 'no' ? (compare ? 'Vis før sammenligning' : 'Referanseløsningen er skjult') : (compare ? 'Reveal before comparing' : 'Reference solution is hidden')}</h2>
      <p>{locale === 'no' ? 'Vis løsningen bevisst når du er klar. Dette er en referansetilnærming, ikke et kjørt resultat.' : 'Reveal intentionally when you are ready. This is a reference approach, not an executed verdict.'}</p>
      <Button appearance="primary" onClick={onReveal}>{locale === 'no' ? 'Vis referanseløsning' : 'Reveal reference solution'}</Button>
    </div>
  );
}
