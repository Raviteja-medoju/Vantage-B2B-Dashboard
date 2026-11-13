import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WidgetFrame } from '@/components/widgets/WidgetFrame';
import { WIDGETS, type WidgetDef } from '@/components/widgets/registry';
import type { WidgetSize } from '@/state/LayoutContext';
import { withProviders } from './decorators';

const WIDTH: Record<WidgetSize, number> = { sm: 380, md: 560, lg: 760, xl: 1120 };

function Preview({ def, initialSize }: { def: WidgetDef; initialSize?: WidgetSize }) {
  const [size, setSize] = useState<WidgetSize>(initialSize ?? def.allowedSizes[Math.min(1, def.allowedSizes.length - 1)]);
  const [table, setTable] = useState(false);
  const Component = def.component;
  return (
    <div style={{ width: WIDTH[size], maxWidth: '100%' }}>
      <WidgetFrame id={def.id} title={def.title} subtitle={def.subtitle?.replace('{range}', 'Last 90 days')} description={def.description} size={size} allowedSizes={def.allowedSizes} onSizeChange={setSize} hasTableView={def.hasTableView} tableView={table} onToggleTableView={() => setTable((t) => !t)} dragHandleProps={{}} padding={def.flush ? 'none' : 'md'}>
        <Component size={size} tableView={table} />
      </WidgetFrame>
    </div>
  );
}

const meta = {
  title: 'Widgets/Dashboard widgets',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withProviders],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const byId = (id: WidgetDef['id']) => WIDGETS.find((w) => w.id === id)!;

export const KeyMetrics: Story = { render: () => <Preview def={byId('kpis')} initialSize="xl" /> };
export const ArrTrend: Story = { render: () => <Preview def={byId('revenueTrend')} initialSize="lg" /> };
export const NetArrMovement: Story = { render: () => <Preview def={byId('arrMovement')} /> };
export const PipelineByStage: Story = { render: () => <Preview def={byId('pipeline')} /> };
export const ArrBreakdown: Story = { render: () => <Preview def={byId('arrByRegion')} initialSize="sm" /> };
export const AccountHealth: Story = { render: () => <Preview def={byId('health')} initialSize="sm" /> };
export const ProductUsage: Story = { render: () => <Preview def={byId('usage')} initialSize="lg" /> };
export const TopAccounts: Story = { render: () => <Preview def={byId('topAccounts')} initialSize="lg" /> };
export const UpcomingRenewals: Story = { render: () => <Preview def={byId('renewals')} initialSize="sm" /> };
export const QuotaAttainment: Story = { render: () => <Preview def={byId('quota')} /> };
