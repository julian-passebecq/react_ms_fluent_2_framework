import { reasoningModules } from '../data/reasoning';
import { useMemo, useState } from 'react';
import { Button, MessageBar, MessageBarBody, MessageBarTitle, Textarea } from '@fluentui/react-components';
import { ArrowLeft20Regular, ArrowReset20Regular } from '@fluentui/react-icons';
import { ProgressSummary } from '@datapass/learning';
import { computeProgressBreakdown, type ProgressStateV2 } from '@datapass/progress';
import { PageHeader, useLocale } from '@datapass/ui';
import { lessons, sqlPracticeAssessment } from '../data/contentCatalog';

export interface ProgressPageProps {
  progress: ProgressStateV2;
  persisted: boolean;
  loadSource: string;
  warnings: readonly string[];
  exportJson(): string;
  importJson(source: string): void;
  reset(): void;
  onBack(): void;
}

export function ProgressPage({ progress, persisted, loadSource, warnings, exportJson, importJson, reset, onBack }: ProgressPageProps) {
  const { locale } = useLocale();
  const [importDraft, setImportDraft] = useState('');
  const [message, setMessage] = useState<string>();
  const breakdown = useMemo(() => computeProgressBreakdown(progress), [progress]);

  const applyImport = () => {
    try {
      importJson(importDraft);
      setMessage(locale === 'no' ? 'Gyldig progresjons-JSON ble importert lokalt.' : 'Valid progress JSON was imported locally.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="formation-page formation-progress" data-testid="formation-progress-page">
      <Button className="formation-back" appearance="subtle" icon={<ArrowLeft20Regular />} onClick={onBack}>
        {locale === 'no' ? 'Til kurskatalogen' : 'Back to course catalog'}
      </Button>
      <PageHeader
        eyebrow="LOCAL PROGRESS · VERSIONED CONTRACT"
        title={locale === 'no' ? 'Fremdrift og repetisjon' : 'Progress and review'}
        description={locale === 'no'
          ? 'Data lagres bare i denne nettleseren. Ingen konto, skysynkronisering eller overvåking er koblet til.'
          : 'Data is stored only in this browser. No account, cloud sync, or monitoring is connected.'}
      />
      <MessageBar intent={warnings.length ? 'warning' : 'info'}>
        <MessageBarBody>
          <MessageBarTitle>{persisted ? 'Local persistence available' : 'Local persistence not confirmed'}</MessageBarTitle>
          Loaded from <code>{loadSource}</code>. {warnings.length ? warnings.join(' ') : 'The shared store validates schema v2 and safely migrates V1.1 challenge state.'}
        </MessageBarBody>
      </MessageBar>
      <ProgressSummary
        state={progress}
        lessonIds={lessons.map((lesson) => lesson.id)}
        assessmentIds={[sqlPracticeAssessment.id, ...reasoningModules.map(module => module.assessment.id)]}
        locale={locale}
      />
      <section className="formation-breakdown" aria-labelledby="formation-breakdown-title">
        <span className="formation-eyebrow">ASSESSMENT BREAKDOWN</span>
        <h2 id="formation-breakdown-title">{locale === 'no' ? 'Etter emne' : 'By domain'}</h2>
        {breakdown.domains.length ? (
          <dl>{breakdown.domains.map((metric) => <div key={metric.id}><dt>{metric.id}</dt><dd>{metric.correct}/{metric.answers} · {metric.percent}%</dd></div>)}</dl>
        ) : <p>{locale === 'no' ? 'Lever en vurdering for å se en oversikt.' : 'Submit an assessment to see a breakdown.'}</p>}
      </section>
      <section className="formation-progress-json" aria-labelledby="formation-export-title">
        <div>
          <span className="formation-eyebrow">VALIDATED JSON</span>
          <h2 id="formation-export-title">{locale === 'no' ? 'Eksporter' : 'Export'}</h2>
          <Textarea aria-label="Exported progress JSON" readOnly resize="vertical" value={exportJson()} />
        </div>
        <div>
          <span className="formation-eyebrow">VALIDATED JSON</span>
          <h2>{locale === 'no' ? 'Importer' : 'Import'}</h2>
          <Textarea aria-label="Progress JSON to import" resize="vertical" value={importDraft} onChange={(_, data) => setImportDraft(data.value)} />
          <div className="formation-progress-json__actions">
            <Button appearance="primary" disabled={!importDraft.trim()} onClick={applyImport}>{locale === 'no' ? 'Valider og importer' : 'Validate and import'}</Button>
            <Button appearance="secondary" icon={<ArrowReset20Regular />} onClick={() => { reset(); setMessage(locale === 'no' ? 'Lokal progresjon er tilbakestilt.' : 'Local progress was reset.'); }}>{locale === 'no' ? 'Tilbakestill lokalt' : 'Reset local data'}</Button>
          </div>
        </div>
      </section>
      {message ? <p role="status" className="formation-import-status">{message}</p> : null}
    </div>
  );
}
