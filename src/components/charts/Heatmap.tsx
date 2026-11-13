import { useMemo, useState } from 'react';
import { useMeasure } from '@/lib/hooks';
import { cx } from '@/lib/cx';
import { ChartTooltip } from './ChartTooltip';
import s from './charts.module.css';

export interface HeatmapProps {
  rows: string[];
  cols: string[];
  /** values[rowIndex][colIndex] */
  values: number[][];
  valueFormat: (v: number) => string;
  /** Unit label for the tooltip & legend, e.g. "active seats" */
  unit?: string;
  ariaLabel: string;
  cellHeight?: number;
  /** Show every nth column label */
  colLabelEvery?: number;
  className?: string;
}

const BINS = 7;
const LABEL_W = 36;
const TOP = 18;

/** Sequential, one hue, light -> dark, 7 bins. Zero recedes to the surface. */
export function Heatmap({ rows, cols, values, valueFormat, unit = '', ariaLabel, cellHeight = 22, colLabelEvery = 3, className }: HeatmapProps) {
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  const max = useMemo(() => Math.max(1, ...values.flat()), [values]);
  const innerW = Math.max(0, width - LABEL_W);
  const cellW = cols.length ? innerW / cols.length : 0;
  const height = TOP + rows.length * cellHeight;

  const bin = (v: number) => (v <= 0 ? 0 : Math.min(BINS, Math.max(1, Math.ceil((v / max) * BINS))));

  return (
    <div ref={ref} className={cx(s.wrap, className)}>
      <svg className={s.svg} width={width || undefined} height={height} viewBox={`0 0 ${Math.max(width, 1)} ${height}`} role="img" aria-label={ariaLabel}>
        {cols.map((c, ci) =>
          ci % colLabelEvery === 0 ? (
            <text key={c} x={LABEL_W + ci * cellW + 1} y={12} className={s.tick}>
              {c}
            </text>
          ) : null,
        )}
        {rows.map((r, ri) => (
          <g key={r} transform={`translate(0,${TOP + ri * cellHeight})`}>
            <text x={0} y={cellHeight / 2} dy="0.32em" className={s.tick}>
              {r}
            </text>
            {cols.map((c, ci) => {
              const v = values[ri]?.[ci] ?? 0;
              const hovered = hover?.r === ri && hover?.c === ci;
              return (
                <rect
                  key={c}
                  x={LABEL_W + ci * cellW + 1}
                  y={1}
                  width={Math.max(0, cellW - 2)}
                  height={cellHeight - 2}
                  rx={2}
                  className={cx(s.heatCell, hovered && s.heatCellHover)}
                  style={{ fill: `var(--heat-${bin(v)})` }}
                  onPointerEnter={() => setHover({ r: ri, c: ci })}
                  onPointerLeave={() => setHover(null)}
                >
                  <title>{`${r} ${c}: ${valueFormat(v)} ${unit}`.trim()}</title>
                </rect>
              );
            })}
          </g>
        ))}
      </svg>
      {hover && width > 0 && (
        <ChartTooltip
          x={LABEL_W + hover.c * cellW + cellW / 2}
          y={TOP + hover.r * cellHeight + cellHeight / 2}
          width={width}
          height={height}
          title={`${rows[hover.r]} · ${cols[hover.c]}`}
          rows={[{ key: 'v', label: unit || 'Value', value: valueFormat(values[hover.r]?.[hover.c] ?? 0), color: `var(--heat-${bin(values[hover.r]?.[hover.c] ?? 0)})`, shape: 'rect' }]}
        />
      )}
      <div className={s.heatLegend} aria-hidden>
        <span>0</span>
        <span className={s.heatSwatches}>
          {Array.from({ length: BINS }, (_, i) => (
            <span key={i} className={s.heatSwatch} style={{ background: `var(--heat-${i + 1})` }} />
          ))}
        </span>
        <span>{valueFormat(max)}</span>
        {unit && <span>· {unit}</span>}
      </div>
    </div>
  );
}
