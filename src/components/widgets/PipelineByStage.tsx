import { useMemo } from 'react';
import { pipelineByStage } from '@/data/queries';
import { fmtCompact, fmtCurrency } from '@/lib/format';
import { useFilters } from '@/state/FiltersContext';
import { HBarChart } from '@/components/charts/HBarChart';
import { ChartTable } from '@/components/charts/ChartTable';
import type { WidgetProps } from './registry';
import s from './widgets.module.css';

export function PipelineByStage({ tableView }: WidgetProps) {
  const { filters } = useFilters();
  const rows = useMemo(() => pipelineByStage(filters), [filters]);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const weighted = rows.reduce((sum, r) => sum + r.weighted, 0);
  const deals = rows.reduce((sum, r) => sum + r.count, 0);

  if (tableView) {
    return <ChartTable caption="Open pipeline by stage" columns={['Stage', 'Deals', 'Amount', 'Weighted']} rows={rows.map((r) => [r.stage, r.count, fmtCurrency(r.amount), fmtCurrency(Math.round(r.weighted))])} />;
  }

  return (
    <div className={s.stack}>
      <HBarChart
        data={rows.map((r) => ({ key: r.stage, label: r.stage, value: r.amount, sublabel: `${r.count} ${r.count === 1 ? 'deal' : 'deals'}` }))}
        colorMode="ordinal"
        valueFormat={(v) => fmtCompact(v, { currency: true })}
        ariaLabel="Open pipeline by stage"
        rowLabel={(d) => `${d.label}: ${fmtCurrency(d.value)}, ${d.sublabel}`}
      />
      <dl className={s.summary}>
        <div>
          <dt>Total open</dt>
          <dd>{fmtCompact(total, { currency: true })}</dd>
        </div>
        <div>
          <dt>Weighted</dt>
          <dd>{fmtCompact(weighted, { currency: true })}</dd>
        </div>
        <div>
          <dt>Deals</dt>
          <dd>{deals}</dd>
        </div>
      </dl>
    </div>
  );
}
