import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Customize', variant: 'secondary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'subtle', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" iconLeft={<Plus />}>
        New view
      </Button>
      <Button variant="secondary" iconLeft={<SlidersHorizontal />}>
        Customize
      </Button>
      <Button variant="subtle">Apply filters</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete view</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button size="sm" variant="primary">
        Small
      </Button>
      <Button size="md" variant="primary">
        Medium
      </Button>
      <Button size="lg" variant="primary">
        Large
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button variant="primary" loading>
        Exporting
      </Button>
      <Button variant="primary" disabled>
        Disabled
      </Button>
      <Button variant="secondary" iconRight={<Download />}>
        Export CSV
      </Button>
      <IconButton label="Widget options" variant="secondary">
        <SlidersHorizontal />
      </IconButton>
    </div>
  ),
};
