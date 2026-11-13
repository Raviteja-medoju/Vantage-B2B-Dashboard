import { useMemo } from 'react';
import { computeKpis, type Kpi } from '@/data/queries';
import { fmtCompact, fmtNumber, fmtPct, fmtSignedPct } from '@/lib/format';
import { useFilters } from '@/state/FiltersContext';
import { useLayout } from '@/state/LayoutContext';
import { StatTile, type StatDelta } from './StatTile';
import s from './KpiRow.module.css';

export function formatKpiValue(k: Kpi): string {
  if (k.format === 'currency') return fmtCompact(k.value, { currency: true });
  if (k.format === 'pct') return Number.isFinite(k.value) ? fmtPct(k.value, 1) : '—';
  return fmtNumber(k.value);
}

export function kpiDelta(k: Kpi, compare: boolean): StatDelta | null {
  if (!compare || k.delta == null || !Number.isFinite(k.delta)) return null;
  const dir: StatDelta['direction'] = Math.abs(k.delta) < 0.0005 ? 'flat' : k.delta > 0 ? 'up' : 'down';
  const good = dir === 'flat' ? null : dir === 'up' ? k.upIsGood : !k.upIsGood;
  const text = k.deltaKind === 'pp' ? `${k.delta > 0 ? '+' : k.delta < 0 ? '−' : ''}${(Math.abs(k.delta) * 100).toFixed(1)} pts` : fmtSignedPct(k.delta);
  return { text, direction: dir, good };
}

export function KpiRow() {
  const { filters, resolved } = useFilters();
  const { kpiKeys } = useLayout();
  const kpis = useMemo(() => computeKpis(filters), [filters]);
  const caption = `vs previous ${resolved.days} days`;

  return (
    <div className={s.row} data-heat="kpis" data-component="KpiRow">
      {kpiKeys.map((key, i) => {
        const k = kpis[key];
        return <StatTile key={key} label={k.label} value={formatKpiValue(k)} delta={kpiDelta(k, filters.compare)} deltaCaption={caption} trend={k.spark} footnote={k.footnote} hero={i === 0} />;
      })}
    </div>
  );
}
