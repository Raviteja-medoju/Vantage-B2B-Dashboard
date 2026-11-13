import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '@/components/ui/Switch';

const meta = {
  title: 'Inputs/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { onChange: () => undefined, checked: true, label: 'Compare to previous period', description: 'Show deltas against the previous period of equal length.', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] }, disabled: { control: 'boolean' } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Switch checked onChange={() => undefined} label="Click heat map" description="Density overlay reconstructed from 11,200 sessions." />
      <Switch checked={false} onChange={() => undefined} label="Inspect mode" size="sm" />
      <Switch checked disabled onChange={() => undefined} label="Disabled" size="sm" />
    </div>
  ),
};

