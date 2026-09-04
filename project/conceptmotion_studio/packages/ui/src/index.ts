import './styles.css';

export {
  datapassBrandVariants,
  datapassLightTheme,
} from './theme';

export {
  commonUiStrings,
  DEFAULT_LOCALE_STORAGE_KEY,
  isLocale,
  normalizeLocale,
  readStoredLocale,
  resolveLocalizedText,
  supportedLocales,
  writeStoredLocale,
} from './locale-helpers';
export type {
  CommonUiStringKey,
  Locale,
  LocaleStorage,
  LocalizedText,
} from './locale-helpers';

export {
  LanguageToggle,
  LocaleProvider,
  useLocale,
  useLocalizedText,
} from './locale';
export type {
  LanguageToggleProps,
  LocaleContextValue,
  LocaleProviderProps,
} from './locale';

export { AppShell, PageHeader, SideNav, TopBar } from './shell';
export type { AppShellProps, PageHeaderProps, SideNavProps, TopBarProps } from './shell';

export { CatalogShell, SearchFilterBar } from './catalog';
export type { CatalogShellProps, SearchFilterBarProps } from './catalog';

export { ExplainerShell } from './explainer';
export type { ExplainerShellProps } from './explainer';

export { InspectorPanel, SplitPane, Workbench } from './workbench';
export type { InspectorPanelProps, SplitPaneProps, WorkbenchProps } from './workbench';

export { FigureFrame, SourceNote, VisualizationSurface } from './figure';
export type {
  AccessibleFallbackMode,
  FigureFrameProps,
  SourceNoteProps,
  VisualizationSurfaceProps,
} from './figure';

export { TimelineControls } from './timeline';
export type { TimelineControlLabels, TimelineControlsProps } from './timeline';

export { ChallengeShell } from './challenge';
export type { ChallengeShellProps } from './challenge';

export { WorkflowWorkbenchShell } from './workflow';
export type { WorkflowWorkbenchShellProps } from './workflow';

export {
  ChangeImpactPanel,
  FeatureStatusBadge,
  FreshnessBadge,
  StatusBadge,
  VersionBadge,
} from './status';
export type {
  ChangeImpactPanelProps,
  FeatureStatusBadgeProps,
  FreshnessBadgeProps,
  FreshnessState,
  ProductStatus,
  StatusBadgeProps,
  StatusTone,
  VersionBadgeProps,
} from './status';

export { CodeDiagnostics } from './diagnostics';
export type {
  CodeDiagnostic,
  CodeDiagnosticsProps,
  DiagnosticSeverity,
} from './diagnostics';

export {
  DocsNavigation,
  KnowledgeHeader,
  KnowledgeShell,
  OfficialLink,
  OnThisPage,
  RelatedKnowledge,
  SourceList,
} from './knowledge';
export type {
  DocsNavigationProps,
  KnowledgeHeaderProps,
  KnowledgeShellProps,
  OfficialLinkProps,
  OnThisPageProps,
  RelatedKnowledgeProps,
  SourceListItem,
  SourceListProps,
} from './knowledge';
