import { WorkQueuePage } from '@/pages/WorkQueuePage';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardPage } from '@/pages/DashboardPage';
import { AccountsPage } from '@/pages/AccountsPage';
import { withProviders } from './decorators';

const meta = {
  title: 'Patterns/Pages',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    withProviders,
    (Story) => (
      <div style={{ padding: '0 24px 48px', ['--topbar-h' as string]: '0px' } as React.CSSProperties}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full overview: filter row, customizable widget grid, drawer. Drag a widget by its handle; open the ⋯ menu to resize or hide. */
export const Overview: Story = { render: () => <DashboardPage /> };

/** Tables, redesigned: sticky column, inline sparklines, health badges, column visibility, density, selection and CSV export. */
export const Accounts: Story = { render: () => <AccountsPage /> };

export const MyWork: Story = { render: () => <WorkQueuePage /> };
