import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3line, area as d3area } from 'd3-shape';
import { useMeasure } from '@/lib/hooks';
import { cx } from '@/lib/cx';
import { ChartTooltip, type TooltipRow } from './ChartTooltip';
import { Legend } from './Legend';
import { CHART_FONT, estimateTextWidth, pickIndices } from './svg';
import s from './charts.module.css';

export interface LineSeries {
  key: string;
  label: string;
  color: string;
  /** De-emphasised context series (previous period, benchmark) */
  muted?: boolean;
}

export type LinePoint = { label: string } & Record<string, number | string | null | undefined>;

export interface LineChartProps {
  data: LinePoint[];
  series: LineSeries[];
  height?: number;
  /** Axis tick formatter */
  yFormat?: (v: number) => string;
  /** Tooltip & direct-label formatter */
  valueFormat?: (v: number) => string;
  /** Single-series area wash */
  area?: boolean;
  /** 'zero' forces a zero baseline; 'auto' zooms to the data with headroom */
  baseline?: 'zero' | 'auto';
  ariaLabel: string;
  /** Direct value labels at the line end (default on for <= 4 series) */
  endLabels?: boolean;
  xTickCount?: number;
  className?: string;
}

const M = { top: 12, right: 64, bottom: 26, left: 8 };

export function LineChart({ data, series, height = 240, yFormat = (v) => String(v), valueFormat = yFormat, area = false, baseline = 'auto', ariaLabel, endLabels, xTickCount = 6, className }: LineChartProps) {
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const id = useId();

  const values = useMemo(() => series.map((sr) => data.map((d) => (typeof d[sr.key] === 'number' ? (d[sr.key] as number) : null))), [data, series]);
  const flat = values.flat().filter((v): v is number => v != null);
  const dataMin = flat.length ? Math.min(...flat) : 0;
  const dataMax = flat.length ? Math.max(...flat) : 1;

  const yDomain = useMemo<[number, number]>(() => {
    if (baseline === 'zero') return [Math.min(0, dataMin), dataMax === 0 ? 1 : dataMax];
    const span = dataMax - dataMin || Math.abs(dataMax) || 1;
    const lo = dataMin >= 0 ? Math.max(0, dataMin - span * 0.35) : dataMin - span * 0.15;
    return [lo, dataMax + span * 0.15];
  }, [baseline, dataMin, dataMax]);

  const yTicks = useMemo(() => scaleLinear().domain(yDomain).nice(4).ticks(4), [yDomain]);
  const niceDomain = useMemo(() => scaleLinear().domain(yDomain).nice(4).domain() as [number, number], [yDomain]);
  const leftPad = Math.max(...yTicks.map((t) => estimateTextWidth(yFormat(t), CHART_FONT)), 20) + 10;
  const innerW = Math.max(0, width - M.left - leftPad - M.right);
  const innerH = Math.max(0, height - M.top - M.bottom);

  const x = useMemo(() => scaleLinear().domain([0, Math.max(1, data.length - 1)]).range([0, innerW]), [data.length, innerW]);
  const y = useMemo(() => scaleLinear().domain(niceDomain).range([innerH, 0]), [niceDomain, innerH]);

  const paths = useMemo(() => {
    const gen = d3line<[number, number | null]>()
      .defined((d) => d[1] != null)
      .x((d) => x(d[0]))
      .y((d) => y(d[1] as number));
    return values.map((vals) => gen(vals.map((v, i) => [i, v] as [number, number | null])) ?? '');
  }, [values, x, y]);

  const areaPath = useMemo(() => {
    if (!area || series.length !== 1) return '';
    const gen = d3area<[number, number | null]>()
      .defined((d) => d[1] != null)
      .x((d) => x(d[0]))
      .y0(innerH)
      .y1((d) => y(d[1] as number));
    return gen(values[0].map((v, i) => [i, v] as [number, number | null])) ?? '';
  }, [area, series.length, values, x, y, innerH]);

  const xIdx = pickIndices(data.length, Math.max(2, Math.min(xTickCount, Math.floor(innerW / 64) || 2)));

  // End labels: value at the line end, dropped when two would collide (legend + tooltip carry them).
  const showEnd = endLabels ?? series.filter((sr) => !sr.muted).length <= 4;
  const endLabelItems = useMemo(() => {
    if (!showEnd) return [];
    const items = series
      .map((sr, si) => {
        if (sr.muted) return null;
        const vals = values[si];
        let last = vals.length - 1;
        while (last >= 0 && vals[last] == null) last--;
        if (last < 0) return null;
        return { key: sr.key, y: y(vals[last] as number), text: valueFormat(vals[last] as number) };
      })
      .filter((v): v is { key: string; y: number; text: string } => !!v)
      .sort((a, b) => a.y - b.y);
    const keep: typeof items = [];
    for (const it of items) {
      const prev = keep[keep.length - 1];
      if (prev && Math.abs(prev.y - it.y) < 13) {
        keep.pop();
        continue;
      }
      keep.push(it);
    }
    return keep;
  }, [showEnd, series, values, y, valueFormat]);

  const setFromPointer = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const idx = Math.round(x.invert(Math.max(0, Math.min(innerW, px))));
    setActive(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (data.length === 0) return;
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
      : series.map((sr, si) => ({
          key: sr.key,
          label: sr.label,
          value: values[si][active] == null ? '—' : valueFormat(values[si][active] as number),
          color: sr.color,
          shape: 'line' as const,
          muted: sr.muted,
        }));
  const activeTopY = active == null ? 0 : Math.min(...values.map((v) => (v[active] == null ? Infinity : y(v[active] as number))).filter((v) => Number.isFinite(v)), innerH);

  const legendItems = series.length >= 2 ? series.map((sr) => ({ key: sr.key, label: sr.label, color: sr.color, shape: 'line' as const })) : [];

  return (
    <div ref={ref} className={cx(s.wrap, className)}>
      <svg
        className={s.svg}
        width={width || undefined}
        height={height}
        viewBox={`0 0 ${Math.max(width, 1)} ${height}`}
        role="group"
        aria-label={ariaLabel}
        aria-describedby={`${id}-live`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        <g transform={`translate(${M.left + leftPad},${M.top})`}>
          {yTicks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line x1={0} x2={innerW} className={s.grid} />
              <text x={-8} dy="0.32em" textAnchor="end" className={s.tick}>
                {yFormat(t)}
              </text>
            </g>
          ))}
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} className={s.axis} />
          {xIdx.map((i, k) => (
            <text key={i} x={x(i)} y={innerH + 18} textAnchor={k === 0 ? 'start' : k === xIdx.length - 1 ? 'end' : 'middle'} className={s.tick}>
              {data[i]?.label}
            </text>
          ))}

          {areaPath && <path d={areaPath} className={s.area} style={{ fill: series[0].color }} />}

          {series.map((sr, si) => (
            <path key={sr.key} d={paths[si]} className={s.line} style={{ stroke: sr.color, opacity: sr.muted ? 0.9 : 1 }} />
          ))}

          {/* End markers with a 2px surface ring */}
          {series.map((sr, si) => {
            const vals = values[si];
            let last = vals.length - 1;
            while (last >= 0 && vals[last] == null) last--;
            if (last < 0 || sr.muted) return null;
            return (
              <g key={`${sr.key}-end`} transform={`translate(${x(last)},${y(vals[last] as number)})`}>
                <circle r={6} className={s.ring} />
                <circle r={4} style={{ fill: sr.color }} />
              </g>
            );
          })}
          {endLabelItems.map((it) => (
            <text key={it.key} x={innerW + 10} y={it.y} dy="0.32em" className={s.endLabel}>
              {it.text}
            </text>
          ))}

          {/* Crosshair & markers */}
          {active != null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={0} y2={innerH} className={s.crosshair} />
              {series.map((sr, si) => {
                const v = values[si][active];
                if (v == null) return null;
                return (
                  <g key={`${sr.key}-active`} transform={`translate(${x(active)},${y(v)})`}>
                    <circle r={6} className={s.ring} />
                    <circle r={4} style={{ fill: sr.color }} />
                  </g>
                );
              })}
            </g>
          )}

          <rect x={0} y={0} width={innerW} height={innerH} className={s.hit} onPointerMove={setFromPointer} onPointerDown={setFromPointer} onPointerLeave={() => setActive(null)} />
        </g>
      </svg>
      <span id={`${id}-live`} className="sr-only" aria-live="polite">
        {active != null && data[active] ? `${data[active].label}: ${tooltipRows.map((r) => `${r.label} ${r.value}`).join(', ')}` : 'Use left and right arrow keys to read values.'}
      </span>
      {active != null && data[active] && width > 0 && (
        <ChartTooltip x={M.left + leftPad + x(active)} y={M.top + activeTopY} width={width} height={height} title={data[active].label} rows={tooltipRows} />
      )}
      <Legend items={legendItems} />
    </div>
  );
}
