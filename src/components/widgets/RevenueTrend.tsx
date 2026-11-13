import { useMemo } from 'react';
import { revenueTrend } from '@/data/queries';
import { axisTick, fmtCompact, fmtCurrency } from '@/lib/format';
import { useFilters } from '@/state/FiltersContext';
import { LineChart, type LinePoint, type LineSeries } from '@/components/charts/LineChart';
import { ChartTable } from '@/components/charts/ChartTable';
import type { WidgetProps } from './registry';

export function RevenueTrend({ tableView, size }: WidgetProps) {
  const { filters, resolved } = useFilters();
  const { current, previous } = useMemo(() => revenueTrend(filters), [filters]);
  const max = Math.max(...current.map((p) => p.arr), ...previous.map((p) => p.arr), 1);

  const data: LinePoint[] = current.map((p, i) => ({ label: p.label, arr: p.arr, prev: filters.compare ? (previous[i]?.arr ?? null) : null }));
  const series: LineSeries[] = [
    { key: 'arr', label: 'ARR', color: 'var(--series-1)' },
    ...(filters.compare ? [{ key: 'prev', label: 'Previous period', color: 'var(--series-muted)', muted: true }] : []),
  ];

  if (tableView) {
    return (
      <ChartTable
        caption={`ARR by ${resolved.granularity}`}
        columns={['Period', 'ARR', ...(filters.compare ? ['Previous period'] : [])]}
        rows={current.map((p, i) => [p.label, fmtCurrency(p.arr), ...(filters.compare ? [fmtCurrency(previous[i]?.arr ?? 0)] : [])])}
      />
    );
  }

  return <LineChart data={data} series={series} height={size === 'xl' ? 300 : 240} yFormat={axisTick(max, true)} valueFormat={(v) => fmtCompact(v, { currency: true, digits: 2 })} area={!filters.compare} ariaLabel={`ARR trend, ${resolved.label}`} />;
}
