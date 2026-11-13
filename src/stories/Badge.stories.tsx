import type { Meta, StoryObj } from '@storybook/react-vite';
import { Database } from 'lucide-react';
import { Badge, HealthBadge } from '@/components/ui/Badge';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Enterprise', tone: 'neutral', size: 'md' },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'accent', 'good', 'warning', 'serious', 'critical'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    dot: { control: 'boolean' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="accent">Accent</Badge>
      <Badge tone="good" dot>
        Good
      </Badge>
      <Badge tone="warning" dot>
        Warning
      </Badge>
      <Badge tone="serious" dot>
        Serious
      </Badge>
      <Badge tone="critical" dot>
        Critical
      </Badge>
      <Badge tone="neutral" icon={<Database size={12} />}>
        Data as of Nov 12, 2026
      </Badge>
    </div>
  ),
};

/** Status is never colour alone: the health badge always pairs an icon with its label. */
export const Health: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <HealthBadge health="healthy" />
      <HealthBadge health="at-risk" />
      <HealthBadge health="critical" />
      <HealthBadge health="healthy" size="sm" />
      <HealthBadge health="at-risk" size="sm" showLabel={false} />
    </div>
  ),
};
