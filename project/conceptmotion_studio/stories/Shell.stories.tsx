import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AppShell,
  FeatureStatusBadge,
  LanguageToggle,
  MetricStrip,
  PageHeader,
  SideNav,
  TopBar,
  useLocale,
} from '../packages/ui/src/index';

const meta = {
  title: 'Foundation/Shell',
  component: AppShell,
  parameters: {
    docs: { description: { component: 'Fluent application shell, navigation and locale compositions. Consumers own routes; shared UI owns accessible landmarks and restrained chrome.' } },
    datapass: { guide: 'docs/AUTHORING_DX.md', sourceFiles: ['packages/ui/src/index.ts'] },
    galleryBare: true,
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj;

function ShellNavigation({ current = 'Catalog' }: { current?: string }) {
  return (
    <ul className="gallery-nav-list">
      {['Catalog', 'Workbench', 'Challenges', 'Knowledge'].map((label) => (
        <li key={label}>
          <a href={`#${label.toLowerCase()}`} aria-current={label === current ? 'page' : undefined}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function CanonicalShell({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale();
  const copy = locale === 'no'
    ? {
        subtitle: 'Visuell læringsplattform',
        nav: 'Arbeidsområder',
        title: 'Utforsk semantiske visualiseringer',
        description: 'Gjenbrukbare kontrakter holder læring, kildebevissthet og produktflater samstemte.',
        eyebrow: 'Katalog',
        action: 'Nytt prosjekt',
      }
    : {
        subtitle: 'Visual learning platform',
        nav: 'Workspaces',
        title: 'Explore semantic visualizations',
        description: 'Reusable contracts keep learning, source awareness, and product surfaces aligned.',
        eyebrow: 'Catalog',
        action: 'New project',
      };

  return (
    <AppShell
      mainId={compact ? 'gallery-mobile-main' : 'gallery-shell-main'}
      skipLinkLabel={locale === 'no' ? 'Hopp til innhold' : 'Skip to content'}
      mainLabel={locale === 'no' ? 'Hovedinnhold' : 'Main content'}
      topBar={(
        <TopBar
          brand="Datapass"
          subtitle={copy.subtitle}
          navigation={<a href="#catalog">{locale === 'no' ? 'Katalog' : 'Catalog'}</a>}
          actions={<button className="gallery-toolbar-button" type="button">{copy.action}</button>}
          localeControl={<LanguageToggle />}
        />
      )}
      sideNav={compact ? undefined : (
        <SideNav title={copy.nav} footer={<FeatureStatusBadge status="preview" />}>
          <ShellNavigation />
        </SideNav>
      )}
    >
      <div className={compact ? 'gallery-stack gallery-mobile-frame' : 'gallery-stack'}>
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          metadata={<FeatureStatusBadge status="ga" />}
        />
        <MetricStrip
          metrics={[
            { id: 'figures', label: locale === 'no' ? 'Figurer' : 'Figures', value: '8', detail: locale === 'no' ? 'registrerte adaptere' : 'registered adapters' },
            { id: 'sources', label: locale === 'no' ? 'Kilder' : 'Sources', value: '2', detail: locale === 'no' ? 'lokale referanser' : 'local references', tone: 'success' },
            { id: 'reviews', label: locale === 'no' ? 'Til gjennomgang' : 'Needs review', value: '1', tone: 'warning' },
          ]}
        />
        <section className="gallery-panel" aria-labelledby="shell-overview-heading">
          <h2 id="shell-overview-heading">{locale === 'no' ? 'Oversikt' : 'Overview'}</h2>
          <p>{locale === 'no' ? 'Rolig standardkrom gir innhold og visualiseringer hovedrollen.' : 'Restrained application chrome keeps the content and visualizations in the foreground.'}</p>
        </section>
      </div>
    </AppShell>
  );
}

export const DesktopApplicationShell: Story = {
  render: () => <CanonicalShell />,
};

export const NorwegianApplicationShell: Story = {
  globals: { locale: 'no' },
  render: () => <CanonicalShell />,
};

export const NavigationWithStatus: Story = {
  render: () => (
    <AppShell
      mainId="gallery-navigation-main"
      topBar={<TopBar brand="Datapass" subtitle="Project registry" localeControl={<LanguageToggle showLabel />} />}
      sideNav={(
        <SideNav title="Registry" footer={<span>Last indexed 4 Sep 2026</span>}>
          <ShellNavigation current="Workbench" />
        </SideNav>
      )}
    >
      <PageHeader
        eyebrow="Project hub"
        title="Semantic systems"
        description="Stable project records power cards, tables, and details without duplicating content."
      />
    </AppShell>
  ),
};

export const PhoneApplicationShell: Story = {
  parameters: {
    viewport: { defaultViewport: 'phone' },
  },
  render: () => <div className="gallery-device-frame"><CanonicalShell compact /></div>,
};
