import { useMemo } from 'react';
import { usageHeatmap, WEEKDAYS } from '@/data/queries';
import { fmtNumber } from '@/lib/format';
import { useFilters } from '@/state/FiltersContext';
import { Heatmap } from '@/components/charts/Heatmap';
import { ChartTable } from '@/components/charts/ChartTable';
import type { WidgetProps } from './registry';

const HOURS = Array.from({ length: 24 }, (_, h) => (h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`));

export function UsageHeatmap({ tableView, size }: WidgetProps) {
  const { filters } = useFilters();
  const values = useMemo(() => usageHeatmap(filters), [filters]);

  if (tableView) {
    return <ChartTable caption="Average active seats by weekday and hour" columns={['Day', ...HOURS]} rows={values.map((row, i) => [WEEKDAYS[i], ...row.map((v) => fmtNumber(v))])} />;
  }

  return <Heatmap rows={WEEKDAYS} cols={HOURS} values={values} valueFormat={fmtNumber} unit="active seats" ariaLabel="Average active seats by weekday and hour of day" cellHeight={size === 'xl' ? 26 : 22} colLabelEvery={size === 'md' || size === 'sm' ? 6 : 3} />;
}
