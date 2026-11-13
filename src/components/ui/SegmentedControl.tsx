import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import s from './SegmentedControl.module.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  /** Icon-only: label becomes the accessible name */
  iconOnly?: boolean;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel, size = 'md', fullWidth = false, className }: SegmentedControlProps<T>) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabled = options.filter((o) => !o.disabled);
    const idx = enabled.findIndex((o) => o.value === value);
    if (idx < 0) return;
    let next = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % enabled.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + enabled.length) % enabled.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = enabled.length - 1;
    else return;
    e.preventDefault();
    const v = enabled[next].value;
    onChange(v);
    ref.current?.querySelector<HTMLElement>(`[data-value="${v}"]`)?.focus();
  };

  return (
    <div ref={ref} role="radiogroup" aria-label={ariaLabel} className={cx(s.group, s[size], fullWidth && s.fullWidth, className)} onKeyDown={onKeyDown} data-component="SegmentedControl">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={o.iconOnly && typeof o.label === 'string' ? o.label : undefined}
            title={o.iconOnly && typeof o.label === 'string' ? o.label : undefined}
            tabIndex={selected ? 0 : -1}
            disabled={o.disabled}
            data-value={o.value}
            className={cx(s.segment, selected && s.selected)}
            onClick={() => onChange(o.value)}
          >
            {o.icon && (
              <span className={s.icon} aria-hidden>
                {o.icon}
              </span>
            )}
            {!o.iconOnly && <span>{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
