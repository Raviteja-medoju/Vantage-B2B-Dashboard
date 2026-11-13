import { useMemo } from 'react';
import { quotaAttainment } from '@/data/queries';
import { fmtCompact, fmtCurrency, fmtPct } from '@/lib/format';
import { useFilters } from '@/state/FiltersContext';
import { Avatar } from '@/components/ui/Avatar';
import { Meter } from '@/components/charts/Meter';
import { ChartTable } from '@/components/charts/ChartTable';
import type { WidgetProps } from './registry';
import s from './widgets.module.css';

export function QuotaAttainment({ tableView }: WidgetProps) {
  const { filters, resolved } = useFilters();
  const rows = useMemo(() => quotaAttainment(filters), [filters]);

  if (tableView) {
    return <ChartTable caption="Quota attainment by account executive" columns={['Rep', 'Closed won', 'Quota (prorated)', 'Attainment', 'Deals']} rows={rows.map((r) => [r.owner, fmtCurrency(r.won), fmtCurrency(r.quota), fmtPct(r.attainment, 0), r.deals])} />;
  }

  return (
    <ul className={s.quotaList} aria-label={`Quota attainment, ${resolved.label}`}>
      {rows.map((r) => (
        <li key={r.ownerId} className={s.quotaRow}>
          <Avatar name={r.owner} size="sm" />
          <span className={s.quotaName}>
            <span className={s.accountName}>{r.owner}</span>
            <span className={s.accountMeta}>
              {fmtCompact(r.won, { currency: true })} of {fmtCompact(r.quota, { currency: true })} · {r.deals} won
            </span>
          </span>
          <Meter value={r.attainment} label={`${r.owner} quota attainment`} className={s.quotaMeter} />
        </li>
      ))}
    </ul>
  );
}
