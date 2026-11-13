import type { ComponentProps, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cx } from '@/lib/cx';
import s from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(s.button, s[variant], s[size], fullWidth && s.fullWidth, loading && s.loading, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-component="Button"
      {...rest}
    >
      {loading ? <Loader2 className={cx(s.icon, s.spin)} size={16} aria-hidden /> : iconLeft ? <span className={s.icon}>{iconLeft}</span> : null}
      {children && <span className={s.label}>{children}</span>}
      {iconRight && <span className={s.icon}>{iconRight}</span>}
    </button>
  );
}
