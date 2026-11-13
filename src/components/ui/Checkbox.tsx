import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import s from './Checkbox.module.css';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'size' | 'onChange'> {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
}

export function Checkbox({ checked, indeterminate = false, onChange, label, description, size = 'md', className, id, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  const input = (
    <span className={cx(s.box, s[size])}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={s.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...rest}
      />
      <span className={s.control} aria-hidden>
        <svg viewBox="0 0 16 16" className={s.mark}>
          {indeterminate && !checked ? (
            <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </span>
    </span>
  );

  if (!label) return <span className={className}>{input}</span>;

  return (
    <label className={cx(s.label, className)} data-component="Checkbox">
      {input}
      <span className={s.text}>
        <span>{label}</span>
        {description && <span className={s.description}>{description}</span>}
      </span>
    </label>
  );
}
