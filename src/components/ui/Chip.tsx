import type { ComponentProps, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '@/lib/cx';
import s from './Chip.module.css';

export interface ChipProps extends Omit<ComponentProps<'span'>, 'children'> {
  children: ReactNode;
  /** Dimension prefix rendered in muted ink, e.g. "Region" */
  prefix?: string;
  icon?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  tone?: 'default' | 'accent';
  size?: 'sm' | 'md';
}

export function Chip({ children, prefix, icon, onRemove, removeLabel, tone = 'default', size = 'md', className, ...rest }: ChipProps) {
  return (
    <span className={cx(s.chip, s[tone], s[size], className)} data-component="Chip" {...rest}>
      {icon && (
        <span className={s.icon} aria-hidden>
          {icon}
        </span>
      )}
      {prefix && <span className={s.prefix}>{prefix}</span>}
      <span className={s.label}>{children}</span>
      {onRemove && (
        <button type="button" className={s.remove} onClick={onRemove} aria-label={removeLabel ?? `Remove ${prefix ? `${prefix} ` : ''}${typeof children === 'string' ? children : 'filter'}`}>
          <X size={12} strokeWidth={2.5} aria-hidden />
        </button>
      )}
    </span>
  );
}
