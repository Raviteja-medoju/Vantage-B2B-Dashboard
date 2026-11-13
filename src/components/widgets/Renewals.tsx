import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { upcomingRenewals } from '@/data/queries';
import { fmtCompact } from '@/lib/format';
import { fmtShortDate } from '@/lib/dates';
import { useFilters } from '@/state/FiltersContext';
import { HealthBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { WidgetProps } from './registry';
import s from './widgets.module.css';

export function Renewals({ size }: WidgetProps) {
  const { filters } = useFilters();
  const rows = useMemo(() => upcomingRenewals(filters, 90), [filters]);
  const shown = rows.slice(0, size === 'sm' ? 6 : 10);
  const totalArr = rows.reduce((sum, r) => sum + r.arr, 0);

  if (rows.length === 0) {
    return <EmptyState compact icon={<CalendarClock />} title="No renewals in the next 90 days" description="Try widening the region or segment filters." />;
  }

  return (
    <div className={s.stack}>
      <div className={s.heroLine}>
        <span className={s.heroNumber}>{rows.length}</span>
        <span className={s.heroCaption}>renewals · {fmtCompact(totalArr, { currency: true })} ARR in the next 90 days</span>
      </div>
      <ul className={s.renewalList}>
        {shown.map((r) => (
          <li key={r.id} className={s.renewalRow}>
            <span className={s.renewalWhen} data-urgent={r.daysLeft <= 30 || undefined}>
              <span className={s.renewalDays}>{r.daysLeft}d</span>
              <span className={s.renewalDate}>{r.renewalDate ? fmtShortDate(r.renewalDate) : ''}</span>
            </span>
            <span className={s.accountCell}>
              <Link className={s.accountName} to={`/accounts/${r.id}`} state={{ returnTo: '/', returnLabel: 'Back to overview' }}>{r.name}</Link>
              <span className={s.accountMeta}>
                {fmtCompact(r.arr, { currency: true })} · {r.owner}
              </span>
            </span>
            <HealthBadge health={r.health} size="sm" showLabel={false} />
          </li>
        ))}
      </ul>
      {rows.length > shown.length && <Link to="/work?view=renewals">View all upcoming renewals ?</Link>}
    </div>
  );
}
