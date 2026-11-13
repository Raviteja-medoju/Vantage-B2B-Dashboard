import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import s from './EmptyState.module.css';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({ icon, title, description, action, compact = false, className }: EmptyStateProps) {
  return (
    <div className={cx(s.root, compact && s.compact, className)} role="status" data-component="EmptyState">
      {icon && (
        <div className={s.icon} aria-hidden>
          {icon}
        </div>
      )}
      <p className={s.title}>{title}</p>
      {description && <p className={s.description}>{description}</p>}
      {action && <div className={s.action}>{action}</div>}
    </div>
  );
}
