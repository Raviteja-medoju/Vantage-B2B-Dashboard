import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable, type Column, type SortState } from '@/components/ui/DataTable';
import { HealthBadge } from '@/components/ui/Badge';
import { Sparkline } from '@/components/charts/Sparkline';
import { accountRows, DEFAULT_FILTERS, type AccountRow } from '@/data/queries';
import { fmtCurrency, fmtSignedPct } from '@/lib/format';

const rows = accountRows(DEFAULT_FILTERS, false).slice(0, 12);

const columns: Column<AccountRow>[] = [
  { key: 'name', header: 'Account', sticky: true, minWidth: 200, sortValue: (r) => r.name, render: (r) => <strong style={{ fontWeight: 500 }}>{r.name}</strong> },
  { key: 'health', header: 'Health', sortValue: (r) => r.healthScore, render: (r) => <HealthBadge health={r.health} size="sm" /> },
  { key: 'arr', header: 'ARR', align: 'right', numeric: true, sortValue: (r) => r.arr, render: (r) => fmtCurrency(r.arr) },
  { key: 'change', header: '90d', align: 'right', numeric: true, sortValue: (r) => r.change90 ?? -1, render: (r) => (r.change90 == null ? '—' : fmtSignedPct(r.change90)) },
  { key: 'trend', header: 'Trend', render: (r) => <Sparkline data={r.trend} width={72} height={20} /> },
  { key: 'region', header: 'Region', sortValue: (r) => r.region, render: (r) => r.region },
  { key: 'owner', header: 'Owner', sortValue: (r) => r.owner, render: (r) => r.owner },
];

const meta = {
  title: 'Data display/DataTable',
  component: DataTable<AccountRow>,
  tags: ['autodocs'],
  args: { columns, rows, rowKey: (row: AccountRow) => row.id },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable<AccountRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sortable headers with aria-sort, sticky first column, row selection with an indeterminate "select all", density switch. */
export const Interactive: Story = {
  render: () => {
    const [sort, setSort] = useState<SortState | null>({ key: 'arr', dir: 'desc' });
    const [selected, setSelected] = useState<Set<string>>(new Set());
    return (
      <div style={{ width: 860, maxWidth: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption="Accounts" sort={sort} onSortChange={setSort} selectable selected={selected} onSelectedChange={setSelected} maxHeight={360} />
      </div>
    );
  },
};

export const Compact: Story = {
  render: () => (
    <div style={{ width: 860, maxWidth: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption="Accounts" density="compact" zebra />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 860, maxWidth: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
      <DataTable columns={columns} rows={[]} rowKey={(r) => r.id} caption="Accounts" />
    </div>
  ),
};

