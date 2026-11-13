import { WorkspaceProvider } from '@/state/WorkspaceContext';
import type { Decorator } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { PreferencesProvider } from '@/state/PreferencesContext';
import { LabProvider } from '@/state/LabContext';
import { FiltersProvider } from '@/state/FiltersContext';
import { LayoutProvider } from '@/state/LayoutContext';
import { ToastProvider } from '@/components/ui/Toast';
import { DEFAULT_FILTERS } from '@/data/queries';

/** Wraps stories that read app state (filters, layout, lab toggles, router links). */
export const withProviders: Decorator = (Story) => (
  <MemoryRouter>
    <PreferencesProvider>
      <LabProvider>
        <FiltersProvider initial={DEFAULT_FILTERS}>
          <LayoutProvider>
            <ToastProvider>
              <WorkspaceProvider><Story /></WorkspaceProvider>
            </ToastProvider>
          </LayoutProvider>
        </FiltersProvider>
      </LabProvider>
    </PreferencesProvider>
  </MemoryRouter>
);

/** A card-like surface so widgets and charts preview on the real chart surface. */
export const withSurface =
  (width = 640): Decorator =>
  (Story) => (
    <div style={{ width, maxWidth: '100%', padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
      <Story />
    </div>
  );
