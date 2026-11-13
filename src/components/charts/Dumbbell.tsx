import { cx } from '@/lib/cx';
import { Legend } from './Legend';
import s from './charts.module.css';

export interface DumbbellDatum {
  key: string;
  label: string;
  before: number;
  after: number;
}

export interface DumbbellProps {
  data: DumbbellDatum[];
  valueFormat: (v: number) => string;
  beforeLabel?: string;
  afterLabel?: string;
  ariaLabel: string;
  labelWidth?: number;
  className?: string;
}

const BEFORE = 'var(--seq-250)';
const AFTER = 'var(--seq-550)';

/** Before -> after per item: one hue, two shades, a connector showing the distance moved. */
export function Dumbbell({ data, valueFormat, beforeLabel = 'Before', afterLabel = 'After', ariaLabel, labelWidth, className }: DumbbellProps) {
  const max = Math.max(1, ...data.flatMap((d) => [d.before, d.after]));
  const pad = 36; // room for value labels
  return (
    <div className={cx(s.dumbbell, className)} role="group" aria-label={ariaLabel}>
      {data.map((d) => {
        const bx = (d.before / max) * 100;
        const ax = (d.after / max) * 100;
        const left = Math.min(bx, ax);
        const right = Math.max(bx, ax);
        const improved = d.after < d.before;
        return (
          <div key={d.key} className={s.dumbbellRow} style={labelWidth ? ({ ['--db-label-w' as string]: `${labelWidth}px` } as React.CSSProperties) : undefined}>
            <span className={s.dumbbellLabel} title={d.label}>
              {d.label}
            </span>
            <div className={s.dumbbellTrack} style={{ marginRight: pad }} aria-label={`${beforeLabel} ${valueFormat(d.before)}, ${afterLabel} ${valueFormat(d.after)}`} role="img">
              <span className={s.dumbbellConnector} style={{ left: `${left}%`, width: `${right - left}%` }} />
              <span className={s.dumbbellDot} style={{ left: `${bx}%`, background: BEFORE }} />
              <span className={s.dumbbellDot} style={{ left: `${ax}%`, background: AFTER }} />
              <span className={s.dumbbellValue} style={{ left: `calc(${right}% + 12px)` }}>
                {valueFormat(d.after)}
                <span style={{ color: 'var(--color-ink-3)', fontWeight: 500 }}> ← {valueFormat(d.before)}</span>
                {improved && <span className="sr-only"> improved</span>}
              </span>
            </div>
          </div>
        );
      })}
      <Legend
        items={[
          { key: 'b', label: beforeLabel, color: BEFORE, shape: 'dot' },
          { key: 'a', label: afterLabel, color: AFTER, shape: 'dot' },
        ]}
      />
    </div>
  );
}
