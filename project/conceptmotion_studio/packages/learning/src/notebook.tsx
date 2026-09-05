import { CodeEditor } from '@datapass/code';
import type {
  FigureSpec,
  ImageOutputCell,
  NotebookCell,
  NotebookSpec,
  RuntimeTarget,
} from '@datapass/content';
import { FigureView } from '@datapass/figure';
import { Badge, MessageBar, MessageBarBody, MessageBarTitle, Text } from '@fluentui/react-components';
import { Fragment, useId, useMemo, useState, type ReactNode } from 'react';
import { GuidedExercise } from './exercise';
import { resolveLearningText, resolveOptionalLearningText, type LearningLocale } from './localization';
import { RuntimeLauncher } from './runtime';
import { ContentDetails } from '@datapass/ui';

type FigureCollection = readonly FigureSpec[] | Readonly<Record<string, FigureSpec>>;

function figureRecord(figures: FigureCollection | undefined): Readonly<Record<string, FigureSpec>> {
  if (!figures) return {};
  if (Array.isArray(figures)) return Object.fromEntries(figures.map((figure) => [figure.id, figure]));
  return figures as Readonly<Record<string, FigureSpec>>;
}

export function isSafeNotebookMediaSource(source: string): boolean {
  const value = source.trim();
  if (!value || value.startsWith('//') || value.includes('\\') || value.includes('\0')) return false;
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(value)) return true;
  if (/^https:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      return Boolean(url.hostname) && !url.username && !url.password;
    } catch {
      return false;
    }
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return false;
  try {
    return !decodeURIComponent(value.split(/[?#]/, 1)[0]).split('/').some((segment) => segment === '..');
  } catch {
    return false;
  }
}

interface MarkdownBlock {
  readonly key: string;
  readonly kind: 'paragraph' | 'heading' | 'unordered-list' | 'ordered-list' | 'code';
  readonly level?: number;
  readonly language?: string;
  readonly lines: readonly string[];
}

/** A deliberately small, HTML-free Markdown subset for imported explanatory cells. */
export function parseSafeMarkdown(markdown: string): readonly MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const start = index;
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ key: `code-${start}`, kind: 'code', language, lines: code });
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({
        key: `heading-${index}`,
        kind: 'heading',
        level: heading[1].length,
        lines: [heading[2]],
      });
      index += 1;
      continue;
    }

    const unordered = /^\s*[-*+]\s+(.+)$/.exec(line);
    if (unordered) {
      const start = index;
      const items: string[] = [];
      while (index < lines.length) {
        const item = /^\s*[-*+]\s+(.+)$/.exec(lines[index]);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      blocks.push({ key: `ul-${start}`, kind: 'unordered-list', lines: items });
      continue;
    }

    const ordered = /^\s*\d+[.)]\s+(.+)$/.exec(line);
    if (ordered) {
      const start = index;
      const items: string[] = [];
      while (index < lines.length) {
        const item = /^\s*\d+[.)]\s+(.+)$/.exec(lines[index]);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      blocks.push({ key: `ol-${start}`, kind: 'ordered-list', lines: items });
      continue;
    }

    const start = index;
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim()) {
      if (index > start && (/^(#{1,6})\s+/.test(lines[index]) || lines[index].startsWith('```'))) break;
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ key: `paragraph-${start}`, kind: 'paragraph', lines: paragraph });
  }
  return blocks;
}

function SafeMarkdown({ markdown }: { readonly markdown: string }) {
  return (
    <div className="dp-notebook-markdown">
      {parseSafeMarkdown(markdown).map((block) => {
        if (block.kind === 'code') {
          return <pre key={block.key} data-language={block.language || undefined} tabIndex={0} aria-label={block.language ? `${block.language} code excerpt` : 'Code excerpt'}><code>{block.lines.join('\n')}</code></pre>;
        }
        if (block.kind === 'unordered-list') {
          return <ul key={block.key}>{block.lines.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ul>;
        }
        if (block.kind === 'ordered-list') {
          return <ol key={block.key}>{block.lines.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ol>;
        }
        if (block.kind === 'heading') {
          const level = Math.min(6, Math.max(2, block.level ?? 2));
          const Heading = `h${level}` as keyof React.JSX.IntrinsicElements;
          return <Heading key={block.key}>{block.lines[0]}</Heading>;
        }
        return <p key={block.key}>{block.lines.join(' ')}</p>;
      })}
    </div>
  );
}

export interface NotebookCellViewProps {
  readonly cell: NotebookCell;
  readonly figures?: FigureCollection;
  readonly locale?: LearningLocale;
  readonly reducedMotion?: boolean;
  readonly draft?: string;
  readonly onDraftChange?: (cellId: string, value: string) => void;
  readonly resolveImageSource?: (cell: ImageOutputCell) => string;
  readonly codeHeight?: string | number;
}

export function NotebookCellView({
  cell,
  figures,
  locale = 'en',
  reducedMotion = false,
  draft,
  onDraftChange,
  resolveImageSource = (imageCell) => imageCell.image.path,
  codeHeight = '16rem',
}: NotebookCellViewProps) {
  const [localDraft, setLocalDraft] = useState(
    cell.type === 'code' ? cell.source : cell.type === 'exercise' ? cell.starter : '',
  );
  const availableFigures = useMemo(() => figureRecord(figures), [figures]);
  const currentDraft = draft ?? localDraft;

  function updateDraft(value: string) {
    if (draft === undefined) setLocalDraft(value);
    onDraftChange?.(cell.id, value);
  }

  let body: ReactNode;
  if (cell.type === 'markdown') {
    body = <SafeMarkdown markdown={cell.markdown} />;
  } else if (cell.type === 'code') {
    const displayOnly = /(?:py)?spark/i.test(cell.language);
    body = (
      <section className="dp-notebook-code" data-code-execution="none">
        <div className="dp-notebook-cell__label">
          <Badge appearance="outline">{cell.language}</Badge>
          <Text size={200}>
            {displayOnly
              ? 'PySpark reference · display and explanation only'
              : 'Reference code'}
          </Text>
        </div>
        <CodeEditor
          ariaLabel={`${cell.language} notebook cell`}
          language={cell.language}
          value={currentDraft}
          onChange={cell.editable ? updateDraft : undefined}
          path={`inmemory://datapass/notebook/${encodeURIComponent(cell.id)}`}
          height={codeHeight}
          readOnly={!cell.editable}
        />
      </section>
    );
  } else if (cell.type === 'text-output') {
    body = (
      <section className="dp-notebook-output" data-reference-output="text">
        <OutputNotice isError={cell.isError} />
        <pre tabIndex={0} aria-label="Saved reference text output"><code>{cell.text}</code></pre>
      </section>
    );
  } else if (cell.type === 'table-output') {
    body = (
      <section className="dp-notebook-output" data-reference-output="table">
        <OutputNotice />
        <div className="dp-notebook-table-wrap" role="region" aria-label="Saved reference table output" tabIndex={0}>
          <table>
            <caption>Saved table output from the source notebook</caption>
            <thead><tr>{cell.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
            <tbody>
              {cell.rows.map((row, rowIndex) => (
                <tr key={`${cell.id}-row-${rowIndex}`}>
                  {row.map((value, columnIndex) => <td key={`${columnIndex}-${String(value)}`}>{value === null ? 'NULL' : String(value)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  } else if (cell.type === 'image-output') {
    const source = resolveImageSource(cell);
    body = (
      <section className="dp-notebook-output" data-reference-output="image">
        <OutputNotice />
        {isSafeNotebookMediaSource(source) ? (
          <img src={source} alt={resolveLearningText(cell.alt, locale)} />
        ) : (
          <div role="alert">Saved image output was not shown because its source is unsafe.</div>
        )}
      </section>
    );
  } else if (cell.type === 'figure') {
    const figure = availableFigures[cell.figureId];
    body = figure ? (
      <FigureView figure={figure} locale={locale} reducedMotion={reducedMotion} presentationSize={figure.rendererId === 'table.join' ? 'regular' : 'compact'} />
    ) : (
      <div role="alert">Figure “{cell.figureId}” is unavailable.</div>
    );
  } else if (cell.type === 'callout') {
    body = (
      <MessageBar intent={cell.tone === 'warning' ? 'warning' : cell.tone === 'important' ? 'error' : 'info'}>
        <MessageBarBody>
          {cell.title ? <MessageBarTitle>{resolveLearningText(cell.title, locale)}</MessageBarTitle> : null}
          {resolveLearningText(cell.content, locale)}
        </MessageBarBody>
      </MessageBar>
    );
  } else {
    body = (
      <GuidedExercise
        id={cell.id}
        language={cell.language}
        starter={cell.starter}
        hints={cell.hints}
        solution={cell.solution}
        explanation={cell.explanation}
        initialDraft={currentDraft}
        locale={locale}
        codeHeight={codeHeight}
        onDraftChange={updateDraft}
      />
    );
  }

  return (
    <article
      className={`dp-notebook-cell dp-notebook-cell--${cell.type}`}
      data-cell-id={cell.id}
      data-cell-type={cell.type}
      data-source-cell-id={cell.sourceCellId}
    >
      {body}
    </article>
  );
}

function OutputNotice({ isError = false }: { readonly isError?: boolean }) {
  return (
    <div className="dp-notebook-output__notice" role="note">
      <Badge appearance="filled" color={isError ? 'danger' : 'informative'}>Saved reference output</Badge>
      <span>{isError ? 'Saved error output' : 'Saved, not a live result.'}</span>
    </div>
  );
}

export interface NotebookLessonProps {
  readonly notebook: NotebookSpec;
  readonly figures?: FigureCollection;
  readonly runtimeTargets?: readonly RuntimeTarget[];
  readonly locale?: LearningLocale;
  readonly reducedMotion?: boolean;
  readonly drafts?: Readonly<Record<string, string>>;
  readonly onDraftChange?: (cellId: string, value: string) => void;
  readonly resolveImageSource?: (cell: ImageOutputCell) => string;
  readonly codeHeight?: string | number;
  readonly beforeCells?: ReactNode;
  readonly afterCells?: ReactNode;
  readonly className?: string;
  readonly metadataMode?: 'consumer' | 'developer';
}

export function NotebookLesson({
  notebook,
  figures,
  runtimeTargets = [],
  locale = 'en',
  reducedMotion = false,
  drafts,
  onDraftChange,
  resolveImageSource,
  codeHeight,
  beforeCells,
  afterCells,
  className,
  metadataMode = 'consumer',
}: NotebookLessonProps) {
  const titleId = useId();
  const configuredTargets = useMemo(() => {
    const ids = new Set(notebook.runtimeTargetIds ?? []);
    return runtimeTargets.filter((target) => ids.has(target.id));
  }, [notebook.runtimeTargetIds, runtimeTargets]);
  const title = resolveOptionalLearningText(notebook.title, locale) ?? 'Notebook lesson';

  return (
    <section
      className={className ? `dp-notebook-lesson ${className}` : 'dp-notebook-lesson'}
      data-notebook-id={notebook.id}
      aria-labelledby={titleId}
    >
      <header className="dp-notebook-lesson__header">
        <div>
          <p className="dp-learning-eyebrow">WORKED EXAMPLE</p>
          <h2 id={titleId}>{title}</h2>
          <p>Read the example, then explain each transformation.</p>
        </div>
        <ContentDetails summary="Notebook details & sources" open={metadataMode === 'developer' ? true : undefined}><dl className="dp-notebook-provenance">
          <div><dt>Source file</dt><dd>{notebook.provenance.sourceFile}</dd></div>
          <div><dt>Source SHA-256</dt><dd><code>{notebook.provenance.sourceSha256}</code></dd></div>
          <div><dt>Importer</dt><dd>{notebook.provenance.importerVersion}</dd></div>
        </dl><p>Code and saved outputs are not executed in this lesson.</p></ContentDetails>
      </header>
      {beforeCells}
      <div className="dp-notebook-lesson__cells">
        {notebook.cells.map((cell) => (
          <Fragment key={cell.id}>
            <NotebookCellView
              cell={cell}
              figures={figures}
              locale={locale}
              reducedMotion={reducedMotion}
              draft={drafts?.[cell.id]}
              onDraftChange={onDraftChange}
              resolveImageSource={resolveImageSource}
              codeHeight={codeHeight}
            />
          </Fragment>
        ))}
      </div>
      {afterCells}
      {notebook.runtimeTargetIds?.length ? (
        <RuntimeLauncher
          targets={configuredTargets}
          locale={locale}
          emptyState="The notebook references a runtime target that is not configured in this application."
        />
      ) : null}
    </section>
  );
}
