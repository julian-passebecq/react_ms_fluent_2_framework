import type { HTMLAttributes, ReactNode } from 'react';
import { mergeClassNames } from './internal';

export interface ChallengeShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  header?: ReactNode;
  catalog?: ReactNode;
  leftTabs?: ReactNode;
  leftPane: ReactNode;
  rightTabs?: ReactNode;
  rightPane: ReactNode;
  bottomPanel?: ReactNode;
  diagnostics?: ReactNode;
  catalogLabel?: string;
  problemLabel?: string;
  workspaceLabel?: string;
  leftPaneId?: string;
  rightPaneId?: string;
  leftPaneLabel?: string;
  rightPaneLabel?: string;
}

export function ChallengeShell({
  header,
  catalog,
  leftTabs,
  leftPane,
  rightTabs,
  rightPane,
  bottomPanel,
  diagnostics,
  catalogLabel = 'Challenge catalog',
  problemLabel = 'Challenge description and guidance',
  workspaceLabel = 'Code workspace',
  leftPaneId,
  rightPaneId,
  leftPaneLabel,
  rightPaneLabel,
  className,
  ...rest
}: ChallengeShellProps) {
  return (
    <div
      className={mergeClassNames('dp-challenge-shell', className)}
      data-has-catalog={catalog ? 'true' : 'false'}
      {...rest}
    >
      {header ? <div className="dp-challenge-shell__header">{header}</div> : null}
      {catalog ? (
        <aside className="dp-challenge-shell__catalog" aria-label={catalogLabel}>
          {catalog}
        </aside>
      ) : null}
      <section className="dp-challenge-shell__problem" aria-label={problemLabel}>
        {leftTabs ? <div className="dp-challenge-shell__tabs">{leftTabs}</div> : null}
        <div className="dp-challenge-shell__pane" id={leftPaneId} role="tabpanel" aria-label={leftPaneLabel} tabIndex={0}>{leftPane}</div>
      </section>
      <section className="dp-challenge-shell__workspace" aria-label={workspaceLabel}>
        {rightTabs ? <div className="dp-challenge-shell__tabs">{rightTabs}</div> : null}
        <div className="dp-challenge-shell__pane" id={rightPaneId} role="tabpanel" aria-label={rightPaneLabel} tabIndex={0}>{rightPane}</div>
        {diagnostics}
      </section>
      {bottomPanel ? <section className="dp-challenge-shell__bottom">{bottomPanel}</section> : null}
    </div>
  );
}
