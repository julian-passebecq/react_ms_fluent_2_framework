import type { HTMLAttributes, ReactNode } from 'react';
import { mergeClassNames } from './internal';

export interface ExplainerShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  header?: ReactNode;
  narrative?: ReactNode;
  figure: ReactNode;
  aside?: ReactNode;
  timeline?: ReactNode;
  footer?: ReactNode;
  narrativeLabel?: string;
  figureLabel?: string;
  asideLabel?: string;
  figureId?: string;
  figureLabelledBy?: string;
}

export function ExplainerShell({
  header,
  narrative,
  figure,
  aside,
  timeline,
  footer,
  narrativeLabel = 'Explanation',
  figureLabel = 'Interactive figure',
  asideLabel = 'Annotations and state',
  figureId,
  figureLabelledBy,
  className,
  ...rest
}: ExplainerShellProps) {
  return (
    <div
      className={mergeClassNames('dp-explainer-shell', className)}
      data-has-narrative={narrative ? 'true' : 'false'}
      data-has-aside={aside ? 'true' : 'false'}
      {...rest}
    >
      {header ? <div className="dp-explainer-shell__header">{header}</div> : null}
      {narrative ? (
        <section className="dp-explainer-shell__narrative" aria-label={narrativeLabel}>
          {narrative}
        </section>
      ) : null}
      <section className="dp-explainer-shell__figure" id={figureId} role="tabpanel" aria-label={figureLabel} aria-labelledby={figureLabelledBy} tabIndex={0}>
        {figure}
        {timeline ? <div className="dp-explainer-shell__timeline">{timeline}</div> : null}
      </section>
      {aside ? (
        <aside className="dp-explainer-shell__aside" aria-label={asideLabel}>
          {aside}
        </aside>
      ) : null}
      {footer ? <footer className="dp-explainer-shell__footer">{footer}</footer> : null}
    </div>
  );
}
