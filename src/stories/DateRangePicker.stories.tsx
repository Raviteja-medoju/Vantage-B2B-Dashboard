import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateRangePicker, type DateRangeValue } from '@/components/ui/DateRangePicker';

const meta = {
  title: 'Inputs/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  args: { value: { range: '90d' }, onChange: () => undefined },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Preset rows first, selection marked by a bold check, hover as a ghost wash, custom range behind a hairline footer. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<DateRangeValue>({ range: '90d' });
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <DateRangePicker value={value} onChange={setValue} />
        <code style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>{JSON.stringify(value)}</code>
      </div>
    );
  },
};

