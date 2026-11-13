import { useMemo, useState } from 'react';
import { arrBy } from '@/data/queries';
import { fmtCompact, fmtCurrency, fmtPct } from '@/lib/format';
import { useFilters } from '@/state/FiltersContext';
import { HBarChart } from '@/components/charts/HBarChart';
import { ChartTable } from '@/components/charts/ChartTable';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { WidgetProps } from './registry';
import s from './widgets.module.css';

type Dim = 'region' | 'segment' | 'industry';

export function ArrByRegion({ tableView }: WidgetProps) {
  const { filters } = useFilters();
  const [dim, setDim] = useState<Dim>('region');
  const rows = useMemo(() => arrBy(filters, dim), [filters, dim]);

  return (
    <div className={s.stack}>
      <SegmentedControl<Dim>
        ariaLabel="Break ARR down by"
        size="sm"
        value={dim}
        onChange={setDim}
        options={[
          { value: 'region', label: 'Region' },
          { value: 'segment', label: 'Segment' },
          { value: 'industry', label: 'Industry' },
        ]}
      />
      {tableView ? (
        <ChartTable caption={`ARR by ${dim}`} columns={[dim[0].toUpperCase() + dim.slice(1), 'Accounts', 'ARR', 'Share']} rows={rows.map((r) => [r.key, r.accounts, fmtCurrency(r.arr), fmtPct(r.share, 1)])} />
      ) : (
        <HBarChart
          data={rows.map((r) => ({ key: r.key, label: r.key, value: r.arr, sublabel: `${r.accounts} accounts · ${fmtPct(r.share, 0)}` }))}
          valueFormat={(v) => fmtCompact(v, { currency: true })}
          ariaLabel={`ARR by ${dim}, ranked`}
          labelWidth={dim === 'industry' ? 128 : 112}
        />
      )}
    </div>
  );
}
