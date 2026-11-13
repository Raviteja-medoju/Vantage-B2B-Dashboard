import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { topAccounts, type AccountRow } from '@/data/queries';
import { fmtCompact, fmtSignedPct } from '@/lib/format';
import { useFilters } from '@/state/FiltersContext';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { HealthBadge } from '@/components/ui/Badge';
import { Sparkline } from '@/components/charts/Sparkline';
import type { WidgetProps } from './registry';
import s from './widgets.module.css';

export function TopAccounts({ size }: WidgetProps) {
  const { filters } = useFilters();
  const rows = useMemo(() => topAccounts(filters, size === 'xl' ? 10 : 8), [filters, size]);

  const columns: Column<AccountRow>[] = [
    {
      key: 'name',
      header: 'Account',
      render: (r) => (
        <span className={s.accountCell}>
          <Link className={s.accountName} to={`/accounts/${r.id}`} state={{ returnTo: '/', returnLabel: 'Back to overview' }}>{r.name}</Link>
          <span className={s.accountMeta}>
            {r.segment} · {r.region}
          </span>
        </span>
      ),
    },
    { key: 'arr', header: 'ARR', align: 'right', numeric: true, render: (r) => fmtCompact(r.arr, { currency: true }) },
    {
      key: 'change',
      header: '90d',
      headerText: '90-day change',
      align: 'right',
      numeric: true,
      hideBelow: 640,
      render: (r) => (r.change90 == null ? <span className={s.muted}>new</span> : <span className={r.change90 > 0 ? s.deltaGood : r.change90 < 0 ? s.deltaBad : undefined}>{fmtSignedPct(r.change90, 0)}</span>),
    },
    { key: 'trend', header: 'Trend', headerText: '12-month ARR trend', hideBelow: 900, render: (r) => <Sparkline data={r.trend} width={80} height={24} ariaLabel={`12-month ARR trend for ${r.name}`} /> },
    { key: 'health', header: 'Health', render: (r) => <HealthBadge health={r.health} size="sm" /> },
  ];

  return (
    <div className={s.tableWidget}>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption="Top accounts by ARR" density="compact" stickyHeader={false} />
      <div className={s.tableFooter}>
        <Link to="/accounts" className={s.footerLink}>
          View all accounts →
        </Link>
      </div>
    </div>
  );
}
