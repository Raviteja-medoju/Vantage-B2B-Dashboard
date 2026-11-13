import type { ComponentProps, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Tooltip } from './Tooltip';
import s from './IconButton.module.css';

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** Accessible name — also rendered as the tooltip */
  label: string;
  children: ReactNode;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'secondary';
  active?: boolean;
  tooltip?: boolean;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export function IconButton({
  label,
  children,
  size = 'md',
  variant = 'ghost',
  active = false,
  tooltip = true,
  tooltipPlacement = 'bottom',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const btn = (
    <button
      type={type}
      aria-label={label}
      aria-pressed={active || undefined}
      className={cx(s.iconButton, s[size], s[variant], active && s.active, className)}
      data-component="IconButton"
      {...rest}
    >
      {children}
    </button>
  );
  return tooltip ? (
    <Tooltip content={label} placement={tooltipPlacement}>
      {btn}
    </Tooltip>
  ) : (
    btn
  );
}
