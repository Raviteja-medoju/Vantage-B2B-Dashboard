import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cx } from '@/lib/cx';
import { Popover } from './Popover';
import { Checkbox } from './Checkbox';
import s from './Select.module.css';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface BaseProps<T extends string> {
  /** Visible label prefix inside the control, e.g. "Region" */
  label: string;
  options: SelectOption<T>[];
  size?: 'sm' | 'md';
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  /** Hide the label prefix (still used as the accessible name) */
  hideLabel?: boolean;
  'data-heat'?: string;
}

export interface SelectProps<T extends string> extends BaseProps<T> {
  value: T;
  onChange: (value: T) => void;
}

export interface MultiSelectProps<T extends string> extends BaseProps<T> {
  value: T[];
  onChange: (value: T[]) => void;
  /** Text shown when nothing is selected (default "All") */
  allLabel?: string;
}

function useListNav(ref: React.RefObject<HTMLDivElement | null>) {
  return (e: KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    if (!nodes.length) return;
    const idx = nodes.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => nodes[(i + nodes.length) % nodes.length]?.focus();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      go(idx + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      go(idx - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(nodes.length - 1);
    }
  };
}

export function Select<T extends string>({ label, options, value, onChange, size = 'md', icon, disabled, className, hideLabel, ...rest }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement | null>(null);
  const list = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const current = options.find((o) => o.value === value);
  const onKeyDown = useListNav(list);

  return (
    <>
      <button
        ref={anchor}
        type="button"
        className={cx(s.trigger, s[size], open && s.open, className)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={hideLabel ? `${label}: ${current?.label ?? ''}` : undefined}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        data-component="Select"
        data-heat={rest['data-heat']}
      >
        {icon && (
          <span className={s.icon} aria-hidden>
            {icon}
          </span>
        )}
        {!hideLabel && <span className={s.label}>{label}</span>}
        <span className={s.value}>{current?.label ?? '—'}</span>
        <ChevronDown className={s.chevron} size={14} aria-hidden />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchor} role="listbox" ariaLabel={label} matchWidth padding="sm">
        <div ref={list} id={id} className={s.list} onKeyDown={onKeyDown}>
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={cx(s.option, selected && s.selected)}
                data-autofocus={selected || undefined}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  anchor.current?.focus({ preventScroll: true });
                }}
              >
                <span className={s.check} aria-hidden>
                  {selected && <Check size={16} strokeWidth={2.5} />}
                </span>
                {o.icon && (
                  <span className={s.optIcon} aria-hidden>
                    {o.icon}
                  </span>
                )}
                <span className={s.optBody}>
                  <span>{o.label}</span>
                  {o.description && <span className={s.optDesc}>{o.description}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Popover>
    </>
  );
}

export function MultiSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  size = 'md',
  icon,
  disabled,
  className,
  hideLabel,
  allLabel = 'All',
  ...rest
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement | null>(null);
  const list = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const onKeyDown = useListNav(list);

  const summary =
    value.length === 0
      ? allLabel
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? value[0])
        : value.length === options.length
          ? allLabel
          : `${value.length} selected`;

  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <>
      <button
        ref={anchor}
        type="button"
        className={cx(s.trigger, s[size], open && s.open, value.length > 0 && s.active, className)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={hideLabel ? `${label}: ${summary}` : undefined}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        data-component="MultiSelect"
        data-heat={rest['data-heat']}
      >
        {icon && (
          <span className={s.icon} aria-hidden>
            {icon}
          </span>
        )}
        {!hideLabel && <span className={s.label}>{label}</span>}
        <span className={s.value}>{summary}</span>
        {value.length > 0 && value.length < options.length && <span className={s.count}>{value.length}</span>}
        <ChevronDown className={s.chevron} size={14} aria-hidden />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchor} role="listbox" ariaLabel={label} matchWidth padding="sm">
        <div ref={list} id={id} className={s.list} onKeyDown={onKeyDown} aria-multiselectable>
          {options.map((o, i) => {
            const selected = value.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={cx(s.option, selected && s.selected)}
                data-autofocus={i === 0 || undefined}
                onClick={() => toggle(o.value)}
              >
                <span className={s.checkbox} aria-hidden>
                  <Checkbox checked={selected} onChange={() => undefined} tabIndex={-1} />
                </span>
                <span className={s.optBody}>
                  <span>{o.label}</span>
                  {o.description && <span className={s.optDesc}>{o.description}</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className={s.footer}>
          <button type="button" className={s.footerBtn} onClick={() => onChange([])} disabled={value.length === 0}>
            Clear
          </button>
          <button
            type="button"
            className={s.footerBtn}
            onClick={() => {
              setOpen(false);
              anchor.current?.focus({ preventScroll: true });
            }}
          >
            Done
          </button>
        </div>
      </Popover>
    </>
  );
}
