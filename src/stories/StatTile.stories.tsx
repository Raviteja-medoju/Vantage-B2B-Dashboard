import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatTile } from '@/components/widgets/StatTile';

const meta = {
  title: 'Data display/StatTile',
  component: StatTile,
  tags: ['autodocs'],
  args: {
    label: 'Annual recurring revenue',
    value: '$14.2M',
    delta: { text: '+6.4%', direction: 'up', good: true },
    deltaCaption: 'vs previous 90 days',
    trend: [11.2, 11.4, 11.9, 12.1, 12.0, 12.6, 12.9, 13.1, 13.4, 13.8, 14.0, 14.2],
    hero: false,
  },
  argTypes: { hero: { control: 'boolean' } },
  decorators: [
    (Story) => (
      <div style={{ width: 280, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The contract: label · value (proportional figures) · signed delta vs a named period · 12-point sparkline. */
export const KpiRow: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--color-border)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', width: 900 }}>
      {[
        <StatTile key="a" hero label="Annual recurring revenue" value="$14.2M" delta={{ text: '+6.4%', direction: 'up', good: true }} deltaCaption="vs previous 90 days" trend={[11.2, 11.4, 11.9, 12.1, 12.0, 12.6, 12.9, 13.1, 13.4, 13.8, 14.0, 14.2]} />,
        <StatTile key="b" label="Net new ARR" value="$812K" delta={{ text: '−12.1%', direction: 'down', good: false }} deltaCaption="vs previous 90 days" trend={[3, 5, 4, 6, 7, 5, 4, 6, 5, 4, 3, 4]} />,
        <StatTile key="c" label="Net revenue retention" value="104.8%" delta={{ text: '+1.2 pts', direction: 'up', good: true }} deltaCaption="vs previous 90 days" />,
        <StatTile key="d" label="Gross ARR churn" value="2.1%" delta={{ text: '−0.4 pts', direction: 'down', good: true }} deltaCaption="vs previous 90 days" />,
      ].map((tile, i) => (
        <div key={i} style={{ background: 'var(--color-surface)' }}>
          {tile}
        </div>
      ))}
    </div>
  ),
};
