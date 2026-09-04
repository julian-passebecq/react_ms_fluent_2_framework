import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { mergeClassNames } from './internal';

export interface WorkbenchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  header?: ReactNode;
  navigation?: ReactNode;
  toolbar?: ReactNode;
  canvas: ReactNode;
  inspector?: ReactNode;
  bottomPanel?: ReactNode;
  navigationLabel?: string;
  canvasLabel?: string;
  inspectorLabel?: string;
}

export function Workbench({
  header,
  navigation,
  toolbar,
  canvas,
  inspector,
  bottomPanel,
  navigationLabel = 'Workbench navigation',
  canvasLabel = 'Visualization canvas',
  inspectorLabel = 'Inspector',
  className,
  ...rest
}: WorkbenchProps) {
  return (
    <div
      className={mergeClassNames('dp-workbench', className)}
      data-has-navigation={navigation ? 'true' : 'false'}
      data-has-inspector={inspector ? 'true' : 'false'}
      {...rest}
    >
      {header ? <div className="dp-workbench__header">{header}</div> : null}
      {navigation ? (
        <aside className="dp-workbench__navigation" aria-label={navigationLabel}>
          {navigation}
        </aside>
      ) : null}
      <section className="dp-workbench__canvas" aria-label={canvasLabel}>
        {toolbar ? <div className="dp-workbench__toolbar">{toolbar}</div> : null}
        <div className="dp-workbench__surface">{canvas}</div>
      </section>
      {inspector ? (
        <aside className="dp-workbench__inspector" aria-label={inspectorLabel}>
          {inspector}
        </aside>
      ) : null}
      {bottomPanel ? <section className="dp-workbench__bottom">{bottomPanel}</section> : null}
    </div>
  );
}

export interface SplitPaneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  primary: ReactNode;
  secondary: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  primarySize?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export function SplitPane({
  primary,
  secondary,
  orientation = 'horizontal',
  primarySize = 'minmax(18rem, 40%)',
  primaryLabel = 'Primary pane',
  secondaryLabel = 'Secondary pane',
  className,
  style,
  ...rest
}: SplitPaneProps) {
  const splitStyle = {
    ...style,
    '--dp-split-primary-size': primarySize,
  } as CSSProperties;
  return (
    <div
      className={mergeClassNames('dp-split-pane', className)}
      data-orientation={orientation}
      style={splitStyle}
      {...rest}
    >
      <section className="dp-split-pane__primary" aria-label={primaryLabel}>
        {primary}
      </section>
      <section className="dp-split-pane__secondary" aria-label={secondaryLabel}>
        {secondary}
      </section>
    </div>
  );
}

export interface InspectorPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function InspectorPanel({
  title,
  description,
  actions,
  children,
  footer,
  className,
  ...rest
}: InspectorPanelProps) {
  const titleId = useId();
  return (
    <section
      className={mergeClassNames('dp-inspector-panel', className)}
      aria-labelledby={titleId}
      {...rest}
    >
      <header className="dp-inspector-panel__header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description ? <div className="dp-inspector-panel__description">{description}</div> : null}
        </div>
        {actions ? <div className="dp-inspector-panel__actions">{actions}</div> : null}
      </header>
      <div className="dp-inspector-panel__content">{children}</div>
      {footer ? <footer className="dp-inspector-panel__footer">{footer}</footer> : null}
    </section>
  );
}
