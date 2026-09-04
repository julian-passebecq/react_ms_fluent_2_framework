import { FluentProvider, Toolbar } from '@fluentui/react-components';
import type { Theme } from '@fluentui/react-components';
import type { HTMLAttributes, ReactNode } from 'react';
import { datapassLightTheme } from './theme';
import { mergeClassNames } from './internal';

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  topBar?: ReactNode;
  sideNav?: ReactNode;
  mainId?: string;
  mainLabel?: string;
  skipLinkLabel?: string;
  theme?: Theme;
}

export function AppShell({
  children,
  topBar,
  sideNav,
  mainId = 'datapass-main-content',
  mainLabel,
  skipLinkLabel = 'Skip to content',
  theme = datapassLightTheme,
  className,
  ...rest
}: AppShellProps) {
  return (
    <FluentProvider theme={theme}>
      <div className={mergeClassNames('dp-app-shell', className)} {...rest}>
        <a className="dp-skip-link" href={`#${mainId}`}>
          {skipLinkLabel}
        </a>
        {topBar}
        <div className="dp-app-shell__body" data-has-side-nav={sideNav ? 'true' : 'false'}>
          {sideNav ? <div className="dp-app-shell__side">{sideNav}</div> : null}
          <main id={mainId} className="dp-app-shell__main" aria-label={mainLabel} tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </FluentProvider>
  );
}

export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  brand: ReactNode;
  subtitle?: ReactNode;
  navigation?: ReactNode;
  navigationLabel?: string;
  search?: ReactNode;
  actions?: ReactNode;
  actionsLabel?: string;
  localeControl?: ReactNode;
}

export function TopBar({
  brand,
  subtitle,
  navigation,
  navigationLabel = 'Primary navigation',
  search,
  actions,
  actionsLabel = 'Application actions',
  localeControl,
  className,
  ...rest
}: TopBarProps) {
  return (
    <header className={mergeClassNames('dp-top-bar', className)} {...rest}>
      <div className="dp-top-bar__identity">
        <div className="dp-top-bar__brand">{brand}</div>
        {subtitle ? <div className="dp-top-bar__subtitle">{subtitle}</div> : null}
      </div>
      {navigation ? (
        <nav className="dp-top-bar__navigation" aria-label={navigationLabel}>
          {navigation}
        </nav>
      ) : null}
      {search ? <div className="dp-top-bar__search">{search}</div> : null}
      {actions || localeControl ? (
        <Toolbar className="dp-top-bar__actions" aria-label={actionsLabel}>
          {actions}
          {localeControl}
        </Toolbar>
      ) : null}
    </header>
  );
}

export interface SideNavProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  label?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function SideNav({
  title,
  label = 'Section navigation',
  children,
  footer,
  className,
  ...rest
}: SideNavProps) {
  return (
    <nav className={mergeClassNames('dp-side-nav', className)} aria-label={label} {...rest}>
      {title ? <div className="dp-side-nav__title">{title}</div> : null}
      <div className="dp-side-nav__content">{children}</div>
      {footer ? <div className="dp-side-nav__footer">{footer}</div> : null}
    </nav>
  );
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  metadata,
  actions,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <header className={mergeClassNames('dp-page-header', className)} {...rest}>
      {breadcrumbs ? <div className="dp-page-header__breadcrumbs">{breadcrumbs}</div> : null}
      <div className="dp-page-header__row">
        <div className="dp-page-header__copy">
          {eyebrow ? <div className="dp-page-header__eyebrow">{eyebrow}</div> : null}
          <h1 className="dp-page-header__title">{title}</h1>
          {description ? <div className="dp-page-header__description">{description}</div> : null}
          {metadata ? <div className="dp-page-header__metadata">{metadata}</div> : null}
        </div>
        {actions ? <div className="dp-page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
