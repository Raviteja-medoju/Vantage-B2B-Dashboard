import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2, Globe2 } from 'lucide-react';
import { MultiSelect, Select } from '@/components/ui/Select';
import { REGIONS, SEGMENTS, type Region, type Segment } from '@/data/types';

const meta = {
  title: 'Inputs/Select',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => {
    const [v, setV] = useState<'sm' | 'md' | 'lg'>('md');
    return (
      <Select
        label="Size"
        value={v}
        onChange={setV}
        options={[
          { value: 'sm', label: 'Small', description: '4 of 12 columns' },
          { value: 'md', label: 'Medium', description: '6 of 12 columns' },
          { value: 'lg', label: 'Large', description: '8 of 12 columns' },
        ]}
      />
    );
  },
};

/** Multi-select with counts, "Clear" and "Done" in the footer, and instant apply — the core of the variant B filter row. */
export const Multi: Story = {
  render: () => {
    const [regions, setRegions] = useState<Region[]>(['EMEA']);
    const [segments, setSegments] = useState<Segment[]>([]);
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <MultiSelect<Region> label="Region" icon={<Globe2 />} options={REGIONS.map((r) => ({ value: r, label: r }))} value={regions} onChange={setRegions} />
        <MultiSelect<Segment> label="Segment" icon={<Building2 />} options={SEGMENTS.map((r) => ({ value: r, label: r }))} value={segments} onChange={setSegments} />
      </div>
    );
  },
};
