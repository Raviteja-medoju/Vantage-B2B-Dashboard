import { useMemo } from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { healthBreakdown } from '@/data/queries';
import { fmtCompact, fmtCurrency, fmtNumber, fmtPct } from '@/lib/format';
import { useFilters } from '@/state/FiltersContext';
import { SegmentedBar } from '@/components/charts/SegmentedBar';
import { ChartTable } from '@/components/charts/ChartTable';
import type { WidgetProps } from './registry';
import type { Health } from '@/data/types';
import s from './widgets.module.css';

const META: Record<Health, { color: string; ink: string; Icon: typeof CheckCircle2; text: string }> = {
  healthy: { color: 'var(--color-good)', ink: '#fff', Icon: CheckCircle2, text: 'var(--color-good-text)' },
  'at-risk': { color: 'var(--color-warning)', ink: '#0b0b0b', Icon: AlertTriangle, text: 'var(--color-warning-text)' },
  critical: { color: 'var(--color-critical)', ink: '#fff', Icon: AlertOctagon, text: 'var(--color-critical-text)' },
};

export function AccountHealth({ tableView }: WidgetProps) {
  const { filters } = useFilters();
  const rows = useMemo(() => healthBreakdown(filters), [filters]);
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  if (tableView) {
    return <ChartTable caption="Account health" columns={['Health', 'Accounts', 'Share', 'ARR']} rows={rows.map((r) => [r.label, r.count, fmtPct(r.share, 1), fmtCurrency(r.arr)])} />;
  }

  return (
    <div className={s.stack}>
      <div className={s.heroLine}>
        <span className={s.heroNumber}>{fmtNumber(total)}</span>
        <span className={s.heroCaption}>active accounts</span>
      </div>
      <SegmentedBar parts={rows.map((r) => ({ key: r.health, label: r.label, value: r.count, color: META[r.health].color, ink: META[r.health].ink }))} valueFormat={(v) => `${v} accounts`} ariaLabel="Account health split" showLegend={false} />
      <ul className={s.statusList}>
        {rows.map((r) => {
          const { Icon, text } = META[r.health];
          return (
            <li key={r.health} className={s.statusRow}>
              <span className={s.statusName} style={{ color: text }}>
                <Icon size={14} strokeWidth={2.25} aria-hidden />
                {r.label}
              </span>
              <span className={s.statusCount}>{r.count}</span>
              <span className={s.statusArr}>{fmtCompact(r.arr, { currency: true })} ARR</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
