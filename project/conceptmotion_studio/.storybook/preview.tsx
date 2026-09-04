import type { Preview } from '@storybook/react-vite';
import { AppShell, LocaleProvider } from '../packages/ui/src/index';
import '../packages/learning/src/styles.css';
import '../packages/ui/src/styles.css';
import '../stories/gallery.css';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale === 'no' ? 'no' : 'en';
      const content = (
        <LocaleProvider initialLocale={locale} storage={null}>
          <Story />
        </LocaleProvider>
      );

      return context.parameters.galleryBare
        ? content
        : <AppShell mainId={`gallery-${context.id}`}>{content}</AppShell>;
    },
  ],
  globalTypes: {
    locale: {
      description: 'Application locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'no', title: 'Norsk' },
        ],
      },
    },
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    a11y: {
      test: 'error',
    },
    controls: {
      expanded: true,
      sort: 'requiredFirst',
    },
    layout: 'fullscreen',
    options: {
      storySort: {
        order: ['Foundation', ['Shell', 'Explorer', 'Figures', 'Code', 'Product surfaces']],
      },
    },
    viewport: {
      options: {
        phone: {
          name: 'Phone · 390 × 844',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet · 768 × 1024',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
      },
    },
  },
};

export default preview;
