import { useId, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import s from './Switch.module.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Visually hide the label (kept for assistive tech) */
  hideLabel?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, label, description, size = 'md', disabled, hideLabel, className }: SwitchProps) {
  const id = useId();
  return (
    <div className={cx(s.row, className)} data-component="Switch">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        className={cx(s.track, s[size], checked && s.on)}
        onClick={() => onChange(!checked)}
      >
        <span className={s.thumb} aria-hidden />
      </button>
      <span className={cx(s.text, hideLabel && 'sr-only')}>
        <label id={`${id}-label`} htmlFor={id} className={s.label}>
          {label}
        </label>
        {description && (
          <span id={`${id}-desc`} className={s.description}>
            {description}
          </span>
        )}
      </span>
    </div>
  );
}
