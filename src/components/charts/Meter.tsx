import { cx } from '@/lib/cx';
import s from './charts.module.css';

export interface MeterProps {
  /** Ratio against the limit; may exceed 1 */
  value: number;
  label: string;
  valueText?: string;
  /** Severity thresholds on the ratio */
  thresholds?: { warning: number; good: number };
  className?: string;
}

/**
 * The fill carries severity (accent -> warning -> critical) and the unfilled track
 * is a lighter step of the same ramp so the state reads across the whole bar.
 */
export function Meter({ value, label, valueText, thresholds = { warning: 0.6, good: 0.9 }, className }: MeterProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const tone = value >= thresholds.good ? 'good' : value >= thresholds.warning ? 'warning' : 'critical';
  const fill = tone === 'good' ? 'var(--color-accent)' : tone === 'warning' ? 'var(--color-warning)' : 'var(--color-critical)';
  const track = tone === 'good' ? 'var(--color-accent-soft-2)' : tone === 'warning' ? 'var(--color-warning-soft)' : 'var(--color-critical-soft)';
  const text = valueText ?? `${Math.round(value * 100)}%`;
  return (
    <div className={cx(s.meter, className)} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-valuetext={text} aria-label={label}>
      <div className={s.meterTrack} style={{ background: track }}>
        <div className={s.meterFill} style={{ width: `${pct}%`, background: fill }} />
      </div>
      <span className={s.meterValue}>{text}</span>
    </div>
  );
}
