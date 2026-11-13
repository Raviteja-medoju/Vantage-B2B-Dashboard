import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Globe2 } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';

const meta = {
  title: 'Primitives/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { children: 'EMEA', prefix: 'Region', tone: 'default', size: 'md' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'accent'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { onRemove: () => undefined } };

export const AppliedFilters: Story = {
  render: () => {
    const [chips, setChips] = useState([
      { prefix: 'Region', value: 'EMEA' },
      { prefix: 'Region', value: 'APAC' },
      { prefix: 'Segment', value: 'Enterprise' },
      { prefix: 'Plan', value: 'Premier' },
    ]);
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {chips.map((c) => (
          <Chip key={`${c.prefix}-${c.value}`} prefix={c.prefix} onRemove={() => setChips((prev) => prev.filter((x) => x !== c))}>
            {c.value}
          </Chip>
        ))}
        <Chip tone="accent" icon={<Globe2 />}>
          All regions
        </Chip>
      </div>
    );
  },
};
