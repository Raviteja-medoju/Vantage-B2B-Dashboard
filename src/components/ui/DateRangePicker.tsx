import { useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown } from 'lucide-react';
import { cx } from '@/lib/cx';
import { fmtRange, isoDay, parseIsoDay, addDays } from '@/lib/dates';
import { RANGE_PRESETS, resolveRange, type Filters, type RangeKey } from '@/data/queries';
import { Popover } from './Popover';
import { Button } from './Button';
import s from './DateRangePicker.module.css';

export interface DateRangeValue {
  range: RangeKey;
  start?: string;
  end?: string;
}

export interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  size?: 'sm' | 'md';
  className?: string;
  'data-heat'?: string;
}

/**
 * Preset rows first (the ranges people actually reach for), selection marked by a
 * bold check, hover as a ghost wash, custom range tucked behind a hairline footer.
 */
export function DateRangePicker({ value, onChange, size = 'md', className, ...rest }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement | null>(null);
  const resolved = resolveRange({ ...value, regions: [], segments: [], plans: [], compare: false } as Filters);
  const [customStart, setCustomStart] = useState(value.start ?? isoDay(addDays(resolved.end, -29)));
  const [customEnd, setCustomEnd] = useState(value.end ?? isoDay(resolved.end));

  const label = value.range === 'custom' ? fmtRange(resolved.start, resolved.end) : resolved.label;
  const customValid = customStart && customEnd && parseIsoDay(customStart) <= parseIsoDay(customEnd);

  return (
    <>
      <button
        ref={anchor}
        type="button"
        className={cx(s.trigger, s[size], open && s.open, className)}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        data-component="DateRangePicker"
        data-heat={rest['data-heat']}
      >
        <CalendarDays size={14} className={s.icon} aria-hidden />
        <span className={s.value}>{label}</span>
        <ChevronDown size={14} className={s.chevron} aria-hidden />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchor} ariaLabel="Date range" padding="sm" className={s.panel}>
        <ul className={s.presets} role="listbox" aria-label="Presets">
          {RANGE_PRESETS.map((p) => {
            const selected = value.range === p.key;
            return (
              <li key={p.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  data-autofocus={selected || undefined}
                  className={cx(s.preset, selected && s.selected)}
                  onClick={() => {
                    onChange({ range: p.key });
                    setOpen(false);
                    anchor.current?.focus({ preventScroll: true });
                  }}
                >
                  <span className={s.presetLabel}>{p.label}</span>
                  <span className={s.presetCheck} aria-hidden>
                    {selected && <Check size={16} strokeWidth={2.75} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className={s.footer}>
          <div className={s.footerTitle}>Custom range</div>
          <div className={s.inputs}>
            <label className={s.field}>
              <span className={s.fieldLabel}>From</span>
              <input type="date" className={s.input} value={customStart} max={customEnd} onChange={(e) => setCustomStart(e.target.value)} />
            </label>
            <label className={s.field}>
              <span className={s.fieldLabel}>To</span>
              <input type="date" className={s.input} value={customEnd} min={customStart} onChange={(e) => setCustomEnd(e.target.value)} />
            </label>
          </div>
          <Button
            size="sm"
            variant="primary"
            fullWidth
            disabled={!customValid}
            onClick={() => {
              onChange({ range: 'custom', start: customStart, end: customEnd });
              setOpen(false);
              anchor.current?.focus({ preventScroll: true });
            }}
          >
            Apply range
          </Button>
        </div>
      </Popover>
    </>
  );
}
