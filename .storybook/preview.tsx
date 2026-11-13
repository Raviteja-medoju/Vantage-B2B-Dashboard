import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '@fontsource-variable/inter';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    a11y: {
      // Fail the a11y panel on violations so regressions are visible in review.
      test: 'error',
    },
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Introduction', 'Design tokens', 'Chart guidelines'],
          'Primitives',
          'Inputs',
          'Overlays',
          'Data display',
          'Charts',
          'Widgets',
          'Filters',
          'Patterns',
        ],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { Light: 'light', Dark: 'dark' },
      defaultTheme: 'Light',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
