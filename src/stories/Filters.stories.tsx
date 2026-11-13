import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterBar } from '@/components/filters/FilterBar';
import { LegacyFilterBar } from '@/components/filters/LegacyFilterBar';
import { withProviders } from './decorators';

const meta = {
  title: 'Filters/Filter panel',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    withProviders,
    (Story) => (
      <div style={{ padding: '0 24px 160px', ['--content-pad' as string]: '24px', ['--topbar-h' as string]: '0px' } as React.CSSProperties}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Variant B — the redesign: one row, date range first, multi-select, instant apply, chips, saved views. +22% daily adoption. */
export const VariantB_InlinePanel: Story = { name: 'Variant B · inline panel', render: () => <FilterBar /> };

/** Variant A — the legacy flow kept for the A/B comparison: a button, a modal of single selects, and an Apply step. */
export const VariantA_LegacyModal: Story = { name: 'Variant A · legacy modal', render: () => <LegacyFilterBar /> };
