import type { HTMLAttributes, ReactNode } from 'react';
import { mergeClassNames } from './internal';

export interface WorkflowWorkbenchShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  header?: ReactNode;
  modeTabs?: ReactNode;
  toolbar?: ReactNode;
  breadcrumb?: ReactNode;
  canvas: ReactNode;
  inspector?: ReactNode;
  bottomPanel?: ReactNode;
  canvasLabel?: string;
  inspectorLabel?: string;
  breadcrumbLabel?: string;
  canvasId?: string;
  canvasLabelledBy?: string;
}

export function WorkflowWorkbenchShell({
  header,
  modeTabs,
  toolbar,
  breadcrumb,
  canvas,
  inspector,
  bottomPanel,
  canvasLabel = 'Workflow canvas',
  inspectorLabel = 'Selected task inspector',
  breadcrumbLabel = 'Focused workflow group',
  canvasId,
  canvasLabelledBy,
  className,
  ...rest
}: WorkflowWorkbenchShellProps) {
  return (
    <div
      className={mergeClassNames('dp-workflow-shell', className)}
      data-has-inspector={inspector ? 'true' : 'false'}
      {...rest}
    >
      {header ? <div className="dp-workflow-shell__header">{header}</div> : null}
      {modeTabs || toolbar ? (
        <div className="dp-workflow-shell__controls">
          <div className="dp-workflow-shell__modes">{modeTabs}</div>
          <div className="dp-workflow-shell__toolbar">{toolbar}</div>
        </div>
      ) : null}
      {breadcrumb ? (
        <nav className="dp-workflow-shell__breadcrumb" aria-label={breadcrumbLabel}>
          {breadcrumb}
        </nav>
      ) : null}
      <section className="dp-workflow-shell__canvas" id={canvasId} role="tabpanel" aria-label={canvasLabel} aria-labelledby={canvasLabelledBy} tabIndex={0}>
        {canvas}
      </section>
      {inspector ? (
        <aside className="dp-workflow-shell__inspector" aria-label={inspectorLabel}>
          {inspector}
        </aside>
      ) : null}
      {bottomPanel ? <section className="dp-workflow-shell__bottom">{bottomPanel}</section> : null}
    </div>
  );
}
