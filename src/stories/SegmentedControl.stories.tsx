import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rows3, Table2 } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

const meta = {
  title: 'Inputs/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: { options: [], value: '', onChange: () => undefined, ariaLabel: 'Options' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dimensions: Story = {
  render: () => {
    const [v, setV] = useState('region');
    return (
      <SegmentedControl
        ariaLabel="Break ARR down by"
        value={v}
        onChange={setV}
        options={[
          { value: 'region', label: 'Region' },
          { value: 'segment', label: 'Segment' },
          { value: 'industry', label: 'Industry' },
        ]}
      />
    );
  },
};

export const Variants: Story = {
  render: () => {
    const [v, setV] = useState('B');
    return (
      <div style={{ width: 320 }}>
        <SegmentedControl
          ariaLabel="Filter panel variant"
          fullWidth
          value={v}
          onChange={setV}
          options={[
            { value: 'A', label: 'A · Legacy modal' },
            { value: 'B', label: 'B · Inline panel' },
          ]}
        />
      </div>
    );
  },
};

export const IconOnly: Story = {
  render: () => {
    const [v, setV] = useState('comfortable');
    return (
      <SegmentedControl
        ariaLabel="Row density"
        size="sm"
        value={v}
        onChange={setV}
        options={[
          { value: 'comfortable', label: 'Comfortable', icon: <Rows3 />, iconOnly: true },
          { value: 'compact', label: 'Compact', icon: <Table2 />, iconOnly: true },
        ]}
      />
    );
  },
};

