import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import s from './PageHeader.module.css';

export interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cx(s.header, className)} data-component="PageHeader">
      <div className={s.text}>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className={s.title}>{title}</h1>
        {description && <p className={s.description}>{description}</p>}
      </div>
      {actions && <div className={s.actions}>{actions}</div>}
    </div>
  );
}
