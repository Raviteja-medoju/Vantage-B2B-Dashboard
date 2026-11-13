import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '@/components/ui/Checkbox';

const meta = {
  title: 'Inputs/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { onChange: () => undefined, checked: true, label: 'Annual recurring revenue', description: 'Sum of active contract value at the end of the period.' },
  argTypes: { indeterminate: { control: 'boolean' }, disabled: { control: 'boolean' }, size: { control: 'inline-radio', options: ['sm', 'md'] } },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <Checkbox {...args} checked={checked} onChange={setChecked} />;
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Checkbox checked={false} onChange={() => undefined} label="Unchecked" />
      <Checkbox checked onChange={() => undefined} label="Checked" />
      <Checkbox checked={false} indeterminate onChange={() => undefined} label="Indeterminate (select all)" />
      <Checkbox checked disabled onChange={() => undefined} label="Disabled" />
    </div>
  ),
};

