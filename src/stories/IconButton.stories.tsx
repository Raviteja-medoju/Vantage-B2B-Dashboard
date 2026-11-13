import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Moon, MoreHorizontal, Table2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { label: 'Notifications', size: 'md', variant: 'ghost', children: <Bell /> },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    variant: { control: 'inline-radio', options: ['ghost', 'secondary'] },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <IconButton label="Notifications">
        <Bell />
      </IconButton>
      <IconButton label="Switch to dark theme" variant="secondary">
        <Moon />
      </IconButton>
      <IconButton label="Show as table" active size="sm">
        <Table2 />
      </IconButton>
      <IconButton label="Widget options" size="sm">
        <MoreHorizontal />
      </IconButton>
      <IconButton label="Disabled" disabled>
        <Bell />
      </IconButton>
    </div>
  ),
};
