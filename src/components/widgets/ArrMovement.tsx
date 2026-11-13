import { useMemo } from 'react';
import { revenueTrend } from '@/data/queries';
import { axisTick, fmtCurrency, fmtSignedCompact } from '@/lib/format';
import { useFilters } from '@/state/FiltersContext';
import { BarChart, type BarDatum, type BarSeries } from '@/components/charts/BarChart';
import { ChartTable } from '@/components/charts/ChartTable';
import type { WidgetProps } from './registry';

/** Diverging stack: gains above the baseline (blue), losses below (red). */
const SERIES: BarSeries[] = [
  { key: 'new', label: 'New', color: 'var(--div-pos)' },
  { key: 'expansion', label: 'Expansion', color: 'var(--div-pos-soft)' },
  { key: 'contraction', label: 'Contraction', color: 'var(--div-neg-soft)' },
  { key: 'churn', label: 'Churn', color: 'var(--div-neg)' },
];

export function ArrMovement({ tableView }: WidgetProps) {
  const { filters, resolved } = useFilters();
  const { current } = useMemo(() => revenueTrend(filters), [filters]);
  const data: BarDatum[] = current.map((p) => ({ label: p.label, new: p.new, expansion: p.expansion, contraction: p.contraction, churn: p.churn }));
  const maxAbs = Math.max(1, ...current.map((p) => Math.max(p.new + p.expansion, -(p.contraction + p.churn))));

  if (tableView) {
    return (
      <ChartTable
        caption={`ARR movement by ${resolved.granularity}`}
        columns={['Period', 'New', 'Expansion', 'Contraction', 'Churn', 'Net']}
        rows={current.map((p) => [p.label, fmtCurrency(p.new), fmtCurrency(p.expansion), fmtCurrency(p.contraction), fmtCurrency(p.churn), fmtCurrency(p.new + p.expansion + p.contraction + p.churn)])}
      />
    );
  }

  return <BarChart data={data} series={SERIES} mode="stacked" height={240} yFormat={axisTick(maxAbs, true)} valueFormat={(v) => fmtSignedCompact(v, true)} labelLast ariaLabel={`Net ARR movement, ${resolved.label}`} />;
}
