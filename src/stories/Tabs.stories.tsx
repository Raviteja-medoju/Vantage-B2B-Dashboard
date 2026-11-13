import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from '@/components/ui/Tabs';

const meta = {
  title: 'Inputs/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { tabs: [], active: '', onChange: () => undefined, ariaLabel: 'Tabs' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCounts: Story = {
  render: () => {
    const [active, setActive] = useState('all');
    return (
      <div style={{ width: 520 }}>
        <Tabs
          ariaLabel="Account status"
          active={active}
          onChange={setActive}
          tabs={[
            { id: 'all', label: 'All', count: 120 },
            { id: 'active', label: 'Active', count: 106 },
            { id: 'at-risk', label: 'Needs attention', count: 31 },
            { id: 'churned', label: 'Churned', count: 14 },
          ]}
        />
      </div>
    );
  },
};

