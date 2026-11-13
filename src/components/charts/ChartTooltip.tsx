import { cx } from '@/lib/cx';
import s from './charts.module.css';

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  color?: string;
  /** 'line' draws a short stroke key, 'rect' a small swatch */
  shape?: 'line' | 'rect';
  muted?: boolean;
}

export interface ChartTooltipProps {
  /** Pointer / anchor position inside the chart wrapper */
  x: number;
  y: number;
  /** Wrapper size, used to flip the tooltip */
  width: number;
  height: number;
  title?: string;
  rows: TooltipRow[];
}

/**
 * One tooltip, every series. Values lead (strong), labels follow (secondary),
 * series keyed with a short stroke of the series colour rather than a box.
 */
export function ChartTooltip({ x, y, width, height, title, rows }: ChartTooltipProps) {
  const flipX = x > width * 0.55;
  const clampedY = Math.min(Math.max(y, 24), Math.max(24, height - 24));
  const style: React.CSSProperties = flipX
    ? { left: x - 12, top: clampedY, transform: 'translate(-100%, -50%)' }
    : { left: x + 12, top: clampedY, transform: 'translateY(-50%)' };
  return (
    <div className={s.tooltip} style={style} role="presentation">
      {title && <div className={s.tooltipTitle}>{title}</div>}
      <div className={s.tooltipRows}>
        {rows.map((r) => (
          <div key={r.key} className={cx(s.tooltipRow, r.muted && s.tooltipMuted)}>
            <span className={r.shape === 'rect' ? s.tooltipKeyRect : s.tooltipKey} style={{ background: r.color ?? 'transparent' }} aria-hidden />
            <span className={s.tooltipLabel}>{r.label}</span>
            <span className={s.tooltipValue}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
