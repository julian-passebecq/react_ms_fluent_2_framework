import { CodeDiff, CodeEditor } from '@datapass/code';
import { Button, Card, Text } from '@fluentui/react-components';
import type { LocalizedText } from '@datapass/content';
import { useId, useMemo, useState } from 'react';
import { resolveLearningText, type LearningLocale } from './localization';

export type GuidedExerciseStep = 'try' | 'hint' | 'reveal' | 'compare';

export interface GuidedExerciseProps {
  readonly id: string;
  readonly language: string;
  readonly starter: string;
  readonly hints?: readonly LocalizedText[];
  readonly solution?: string;
  readonly explanation?: LocalizedText;
  readonly initialDraft?: string;
  readonly locale?: LearningLocale;
  readonly codeHeight?: string | number;
  readonly onDraftChange?: (value: string) => void;
  readonly className?: string;
}

export function GuidedExercise({
  id,
  language,
  starter,
  hints = [],
  solution,
  explanation,
  initialDraft,
  locale = 'en',
  codeHeight = '18rem',
  onDraftChange,
  className,
}: GuidedExerciseProps) {
  const solutionTitleId = useId();
  const comparisonTitleId = useId();
  const [draft, setDraft] = useState(initialDraft ?? starter);
  const [visibleHints, setVisibleHints] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [comparing, setComparing] = useState(false);
  const step: GuidedExerciseStep = comparing ? 'compare' : revealed ? 'reveal' : visibleHints > 0 ? 'hint' : 'try';
  const isPySpark = /(?:py)?spark/i.test(language);
  const visibleHintText = useMemo(
    () => hints.slice(0, visibleHints).map((hint) => resolveLearningText(hint, locale)),
    [hints, locale, visibleHints],
  );

  function changeDraft(value: string) {
    setDraft(value);
    onDraftChange?.(value);
  }

  return (
    <Card
      className={className ? `dp-guided-exercise ${className}` : 'dp-guided-exercise'}
      data-exercise-id={id}
      data-guided-step={step}
      data-execution="none"
    >
      <header className="dp-guided-exercise__header">
        <div>
          <p className="dp-learning-eyebrow">GUIDED PRACTICE · {step.toUpperCase()}</p>
          <h2>Try, inspect, and compare</h2>
        </div>
        <Text size={200}>Compare your draft with a reference solution</Text>
      </header>

      <p role="note">{isPySpark ? 'PySpark reference practice · Spark runs externally.' : 'Text practice · drafts are not executed.'}</p>

      <div className="dp-guided-exercise__editor" aria-label="Try">
        <CodeEditor
          ariaLabel={`${language} exercise draft`}
          language={language}
          value={draft}
          onChange={changeDraft}
          path={`inmemory://datapass/exercise/${encodeURIComponent(id)}`}
          height={codeHeight}
        />
      </div>

      <div className="dp-guided-exercise__controls" aria-label="Exercise guidance">
        <Button
          appearance="secondary"
          disabled={visibleHints >= hints.length || hints.length === 0 || comparing}
          onClick={() => setVisibleHints((count) => Math.min(hints.length, count + 1))}
        >
          {visibleHints === 0 ? 'Show hint' : 'Show next hint'}
        </Button>
        <Button
          appearance="secondary"
          disabled={!solution || comparing}
          onClick={() => {
            setRevealed(true);
            setComparing(false);
          }}
        >
          Reveal solution
        </Button>
        <Button
          appearance="primary"
          disabled={!solution || !revealed}
          onClick={() => setComparing(true)}
        >
          Compare
        </Button>
      </div>

      {visibleHintText.length ? (
        <aside className="dp-guided-exercise__hints" aria-live="polite" aria-label="Hints">
          <h3>{visibleHintText.length === 1 ? 'Hint' : 'Hints'}</h3>
          <ol>{visibleHintText.map((hint, index) => <li key={`${index}-${hint}`}>{hint}</li>)}</ol>
        </aside>
      ) : null}

      {revealed && solution && !comparing ? (
        <section className="dp-guided-exercise__solution" aria-labelledby={solutionTitleId}>
          <h3 id={solutionTitleId}>Reference solution</h3>
          <pre tabIndex={0} aria-label={`${language} reference solution`}><code>{solution}</code></pre>
          {explanation ? <p>{resolveLearningText(explanation, locale)}</p> : null}
        </section>
      ) : null}

      {comparing && solution ? (
        <section className="dp-guided-exercise__comparison" aria-labelledby={comparisonTitleId}>
          <h3 id={comparisonTitleId}>Reference solution compared with your draft</h3>
          <CodeDiff
            ariaLabel={`${language} reference and learner comparison`}
            language={language}
            original={solution}
            modified={draft}
            originalPath={`inmemory://datapass/exercise/${encodeURIComponent(id)}.reference`}
            modifiedPath={`inmemory://datapass/exercise/${encodeURIComponent(id)}.draft`}
            height={codeHeight}
            readOnly
          />
          {explanation ? <p>{resolveLearningText(explanation, locale)}</p> : null}
        </section>
      ) : null}
    </Card>
  );
}
