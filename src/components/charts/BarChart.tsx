import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import { useMeasure } from '@/lib/hooks';
import { cx } from '@/lib/cx';
import { ChartTooltip, type TooltipRow } from './ChartTooltip';
import { Legend } from './Legend';
import { CHART_FONT, estimateTextWidth, pickIndices, roundedRectPath } from './svg';
import s from './charts.module.css';

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

export type BarDatum = { label: string } & Record<string, number | string>;

export interface BarChartProps {
  data: BarDatum[];
  series: BarSeries[];
  /** Stacked (default) supports negative values below the baseline — diverging stacks. */
  mode?: 'stacked' | 'grouped';
  height?: number;
  yFormat?: (v: number) => string;
  valueFormat?: (v: number) => string;
  ariaLabel: string;
  /** Direct-label the net total of the last column */
  labelLast?: boolean;
  maxBarWidth?: number;
  className?: string;
}

const M = { top: 16, right: 12, bottom: 26, left: 8 };
const GAP = 2; // surface gap between touching marks

export function BarChart({ data, series, mode = 'stacked', height = 240, yFormat = (v) => String(v), valueFormat = yFormat, ariaLabel, labelLast = false, maxBarWidth = 24, className }: BarChartProps) {
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const id = useId();

  const num = (d: BarDatum, k: string) => (typeof d[k] === 'number' ? (d[k] as number) : 0);

  // Y extent
  const [minV, maxV] = useMemo(() => {
    let lo = 0;
    let hi = 0;
    for (const d of data) {
      if (mode === 'stacked') {
        let pos = 0;
        let neg = 0;
        for (const sr of series) {
          const v = num(d, sr.key);
          if (v >= 0) pos += v;
          else neg += v;
        }
        hi = Math.max(hi, pos);
        lo = Math.min(lo, neg);
      } else {
        for (const sr of series) {
          const v = num(d, sr.key);
          hi = Math.max(hi, v);
          lo = Math.min(lo, v);
        }
      }
    }
    return [lo, hi === 0 && lo === 0 ? 1 : hi];
  }, [data, series, mode]);

  const yScaleNice = useMemo(() => scaleLinear().domain([minV, maxV]).nice(4), [minV, maxV]);
  const yTicks = yScaleNice.ticks(4);
  const leftPad = Math.max(...yTicks.map((t) => estimateTextWidth(yFormat(t), CHART_FONT)), 20) + 10;
  const innerW = Math.max(0, width - M.left - leftPad - M.right);
  const innerH = Math.max(0, height - M.top - M.bottom);
  const y = useMemo(() => yScaleNice.copy().range([innerH, 0]), [yScaleNice, innerH]);
  const x = useMemo(
    () =>
      scaleBand<number>()
        .domain(data.map((_, i) => i))
        .range([0, innerW])
        .paddingInner(0.35)
        .paddingOuter(0.15),
    [data, innerW],
  );

  const band = x.bandwidth();
  const groupCount = mode === 'grouped' ? series.length : 1;
  const barW = Math.min(maxBarWidth, mode === 'grouped' ? (band - GAP * (groupCount - 1)) / groupCount : band);
  const groupW = mode === 'grouped' ? barW * groupCount + GAP * (groupCount - 1) : barW;

  const xIdx = pickIndices(data.length, Math.max(2, Math.min(data.length, Math.floor(innerW / 56) || 2)));
  const zeroY = y(0);

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!data.length) return;
    const cur = active ?? data.length - 1;
    if (e.key === 'ArrowRight') setActive(Math.min(data.length - 1, cur + 1));
    else if (e.key === 'ArrowLeft') setActive(Math.max(0, cur - 1));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(data.length - 1);
    else if (e.key === 'Escape') setActive(null);
    else return;
    e.preventDefault();
  };

  const tooltipRows: TooltipRow[] =
    active == null
      ? []
      : [
          ...series.map((sr) => ({ key: sr.key, label: sr.label, value: valueFormat(num(data[active], sr.key)), color: sr.color, shape: 'rect' as const })),
          ...(mode === 'stacked' && series.length > 1
            ? [{ key: '__net', label: 'Net', value: valueFormat(series.reduce((sum, sr) => sum + num(data[active], sr.key), 0)), shape: 'rect' as const }]
            : []),
        ];

  const lastNet = data.length ? series.reduce((sum, sr) => sum + num(data[data.length - 1], sr.key), 0) : 0;
  const legendItems = series.length >= 2 ? series.map((sr) => ({ key: sr.key, label: sr.label, color: sr.color, shape: 'rect' as const })) : [];

  return (
    <div ref={ref} className={cx(s.wrap, className)}>
      <svg className={s.svg} width={width || undefined} height={height} viewBox={`0 0 ${Math.max(width, 1)} ${height}`} role="group" aria-label={ariaLabel} aria-describedby={`${id}-live`} tabIndex={0} onKeyDown={onKeyDown} onBlur={() => setActive(null)}>
        <g transform={`translate(${M.left + leftPad},${M.top})`}>
          {yTicks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line x1={0} x2={innerW} className={s.grid} />
              <text x={-8} dy="0.32em" textAnchor="end" className={s.tick}>
                {yFormat(t)}
              </text>
            </g>
          ))}
          <line x1={0} x2={innerW} y1={zeroY} y2={zeroY} className={s.axis} />

          {data.map((d, i) => {
            const gx = (x(i) ?? 0) + (band - groupW) / 2;
            const hovered = active === i;
            let posCursor = zeroY;
            let negCursor = zeroY;
            return (
              <g key={i}>
                {hovered && <rect x={x(i) ?? 0} y={0} width={band} height={innerH} className={s.bandHover} rx={4} />}
                {series.map((sr, si) => {
                  const v = num(d, sr.key);
                  if (v === 0) return null;
                  const h = Math.abs(y(v) - zeroY);
                  let bx: number;
                  let by: number;
                  let rTop = 0;
                  let rBottom = 0;
                  let hh = h;
                  if (mode === 'grouped') {
                    bx = gx + si * (barW + GAP);
                    by = v >= 0 ? zeroY - h : zeroY;
                    if (v >= 0) rTop = 4;
                    else rBottom = 4;
                  } else {
                    bx = gx;
                    if (v >= 0) {
                      by = posCursor - h;
                      posCursor = by;
                      // gap: shave 2px off the top edge of every segment except where it would cut the baseline
                      hh = Math.max(0, h - GAP);
                      by += GAP;
                      // the top-most positive segment is rounded; re-check after loop via index order
                      const isTop = series.slice(si + 1).every((o) => num(d, o.key) <= 0);
                      if (isTop) rTop = 4;
                    } else {
                      by = negCursor;
                      negCursor = by + h;
                      hh = Math.max(0, h - GAP);
                      const isBottom = series.slice(si + 1).every((o) => num(d, o.key) >= 0);
                      if (isBottom) rBottom = 4;
                    }
                  }
                  return <path key={sr.key} d={roundedRectPath(bx, by, barW, hh, rTop, rBottom)} className={cx(s.bar, hovered && s.barHover)} style={{ fill: sr.color }} />;
                })}
                <rect x={x(i) ?? 0} y={0} width={band + x.step() * 0.35} height={innerH} className={s.hit} onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)} />
              </g>
            );
          })}

          {labelLast && data.length > 0 && (
            <text x={(x(data.length - 1) ?? 0) + band / 2} y={lastNet >= 0 ? y(Math.max(0, series.reduce((m, sr) => m + Math.max(0, num(data[data.length - 1], sr.key)), 0))) - 6 : zeroY - 6} textAnchor="middle" className={s.endLabel}>
              {valueFormat(lastNet)}
            </text>
          )}

          {xIdx.map((i) => (
            <text key={i} x={(x(i) ?? 0) + band / 2} y={innerH + 18} textAnchor="middle" className={s.tick}>
              {data[i]?.label}
            </text>
          ))}
        </g>
      </svg>
      <span id={`${id}-live`} className="sr-only" aria-live="polite">
        {active != null && data[active] ? `${data[active].label}: ${tooltipRows.map((r) => `${r.label} ${r.value}`).join(', ')}` : 'Use left and right arrow keys to read values.'}
      </span>
      {active != null && data[active] && width > 0 && <ChartTooltip x={M.left + leftPad + (x(active) ?? 0) + band / 2} y={M.top + innerH / 2} width={width} height={height} title={data[active].label} rows={tooltipRows} />}
      <Legend items={legendItems} />
    </div>
  );
}
