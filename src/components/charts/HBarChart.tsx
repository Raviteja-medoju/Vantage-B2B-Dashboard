import { cx } from '@/lib/cx';
import s from './charts.module.css';

export interface HBarDatum {
  key: string;
  label: string;
  value: number;
  sublabel?: string;
  /** Overrides the chart colour for this bar */
  color?: string;
}

export interface HBarChartProps {
  data: HBarDatum[];
  valueFormat: (v: number) => string;
  /** 'single' = one hue for ranked bars; 'ordinal' = the validated ordinal ramp for ordered stages */
  colorMode?: 'single' | 'ordinal';
  color?: string;
  ariaLabel: string;
  /** Accessible description per row: `${label}: ${value}` by default */
  rowLabel?: (d: HBarDatum) => string;
  labelWidth?: number;
  className?: string;
}

/**
 * Ranked horizontal bars: one baseline, values at the tip, square at the baseline
 * and rounded at the data end. Built in HTML so labels never clip.
 */
export function HBarChart({ data, valueFormat, colorMode = 'single', color = 'var(--series-1)', ariaLabel, rowLabel, labelWidth, className }: HBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className={cx(s.hbars, className)} aria-label={ariaLabel} style={labelWidth ? ({ ['--hbar-label-w' as string]: `${labelWidth}px` } as React.CSSProperties) : undefined}>
      {data.map((d, i) => {
        const fill = d.color ?? (colorMode === 'ordinal' ? `var(--ordinal-${Math.min(5, i + 1)})` : color);
        const pct = Math.max(0, Math.min(100, (d.value / max) * 100));
        return (
          <li key={d.key} className={s.hbarRow} tabIndex={0} aria-label={rowLabel ? rowLabel(d) : `${d.label}: ${valueFormat(d.value)}`}>
            <span className={s.hbarLabel} title={d.label}>
              {d.label}
              {d.sublabel && <span className={s.hbarSub}>{d.sublabel}</span>}
            </span>
            <span className={s.hbarTrack} aria-hidden>
              <span className={s.hbarFill} style={{ width: `${pct}%`, background: fill }} />
            </span>
            <span className={s.hbarValue} aria-hidden>
              {valueFormat(d.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
