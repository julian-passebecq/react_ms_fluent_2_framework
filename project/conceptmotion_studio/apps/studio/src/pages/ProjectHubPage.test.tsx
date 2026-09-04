import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { LocaleProvider } from '@datapass/ui';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProjectHubPage } from './ProjectHubPage';

describe('ProjectHubPage', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/#/projects');
  });

  it('renders the generic explorer proof and direct canonical HTTPS links', () => {
    const html = renderToStaticMarkup(
      <FluentProvider theme={webLightTheme}>
        <LocaleProvider initialLocale="en" storage={null}>
          <ProjectHubPage />
        </LocaleProvider>
      </FluentProvider>,
    );

    expect(html).toContain('data-testid="project-hub-page"');
    expect(html).toContain('Project Hub');
    expect(html).toContain('href="https://datapassj.com/"');
    expect(html).toContain('href="https://d3ecosite.netlify.app/sandbox/"');
    expect(html).toContain('Registry status only · no live monitoring');
    expect(html).toContain('aria-label="Project view"');
  });
});
