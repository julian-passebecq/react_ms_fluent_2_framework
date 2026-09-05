import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { mergeClassNames } from './internal';

export type AccessibleFallbackMode = 'visually-hidden' | 'details' | 'visible';

export interface VisualizationSurfaceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  label?: string;
  fallback?: ReactNode;
  fallbackLabel?: string;
  fallbackMode?: AccessibleFallbackMode;
  minimumHeight?: string;
}

export function VisualizationSurface({
  children,
  label,
  fallback,
  fallbackLabel = 'Text alternative',
  fallbackMode = 'visually-hidden',
  minimumHeight = '18rem',
  className,
  style,
  ...rest
}: VisualizationSurfaceProps) {
  const surfaceStyle = {
    ...style,
    '--dp-visualization-min-height': minimumHeight,
  } as CSSProperties;

  return (
    <div
      className={mergeClassNames('dp-visualization-surface', className)}
      role={label ? 'group' : undefined}
      aria-label={label}
      style={surfaceStyle}
      {...rest}
    >
      <div className="dp-visualization-surface__renderer">{children}</div>
      {fallback && fallbackMode === 'details' ? (
        <details className="dp-visualization-surface__fallback-details">
          <summary>{fallbackLabel}</summary>
          <div>{fallback}</div>
        </details>
      ) : null}
      {fallback && fallbackMode !== 'details' ? (
        <div
          className={mergeClassNames(
            'dp-visualization-surface__fallback',
            fallbackMode === 'visually-hidden' && 'dp-visually-hidden',
          )}
        >
          {fallback}
        </div>
      ) : null}
    </div>
  );
}

export interface SourceNoteProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  source?: ReactNode;
  note?: ReactNode;
  sourceLabel?: ReactNode;
  noteLabel?: ReactNode;
}

export function SourceNote({
  source,
  note,
  sourceLabel = 'Source',
  noteLabel = 'Note',
  className,
  ...rest
}: SourceNoteProps) {
  if (!source && !note) return null;
  return (
    <figcaption className={mergeClassNames('dp-source-note', className)} {...rest}>
      {source ? (
        <div>
          <span className="dp-source-note__label">{sourceLabel}</span>
          {source}
        </div>
      ) : null}
      {note ? (
        <div>
          <span className="dp-source-note__label">{noteLabel}</span>
          {note}
        </div>
      ) : null}
    </figcaption>
  );
}

export interface FigureFrameProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  title: ReactNode;
  subtitle?: ReactNode;
  takeaway?: ReactNode;
  metadata?: ReactNode;
  details?: ReactNode;
  toolbar?: ReactNode;
  actions?: ReactNode;
  actionsLabel?: string;
  exportAction?: ReactNode;
  source?: ReactNode;
  note?: ReactNode;
  sourceLabel?: ReactNode;
  noteLabel?: ReactNode;
  fallback?: ReactNode;
  fallbackLabel?: string;
  fallbackMode?: AccessibleFallbackMode;
  minimumHeight?: string;
  children: ReactNode;
}

export function FigureFrame({
  title,
  subtitle,
  takeaway,
  metadata,
  details,
  toolbar,
  actions,
  actionsLabel = 'Figure actions',
  exportAction,
  source,
  note,
  sourceLabel,
  noteLabel,
  fallback,
  fallbackLabel,
  fallbackMode,
  minimumHeight,
  children,
  className,
  ...rest
}: FigureFrameProps) {
  const titleId = useId();
  const descriptionId = useId();
  const hasDescription = Boolean(subtitle || takeaway);

  return (
    <figure
      className={mergeClassNames('dp-figure-frame', className)}
      aria-labelledby={titleId}
      aria-describedby={hasDescription ? descriptionId : undefined}
      {...rest}
    >
      <header className="dp-figure-frame__header">
        <div className="dp-figure-frame__copy">
          <h2 id={titleId} className="dp-figure-frame__title">
            {title}
          </h2>
          {hasDescription ? (
            <div id={descriptionId}>
              {subtitle ? <div className="dp-figure-frame__subtitle">{subtitle}</div> : null}
              {takeaway ? <div className="dp-figure-frame__takeaway">{takeaway}</div> : null}
            </div>
          ) : null}
          {metadata ? <div className="dp-figure-frame__metadata">{metadata}</div> : null}
        </div>
        {actions || exportAction ? (
          <div className="dp-figure-frame__actions" aria-label={actionsLabel}>
            {actions}
            {exportAction}
          </div>
        ) : null}
      </header>
      {toolbar ? <div className="dp-figure-frame__toolbar">{toolbar}</div> : null}
      <VisualizationSurface
        label={typeof title === 'string' ? title : undefined}
        fallback={fallback}
        fallbackLabel={fallbackLabel}
        fallbackMode={fallbackMode}
        minimumHeight={minimumHeight}
      >
        {children}
      </VisualizationSurface>
      <SourceNote source={source} note={note} sourceLabel={sourceLabel} noteLabel={noteLabel} />
      {details}
    </figure>
  );
}
