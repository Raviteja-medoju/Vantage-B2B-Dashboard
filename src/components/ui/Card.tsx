import type { ComponentProps, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import s from './Card.module.css';

export interface CardProps extends Omit<ComponentProps<'section'>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Removes border/shadow for nested use */
  flat?: boolean;
  headingLevel?: 2 | 3 | 4;
}

export function Card({ title, subtitle, actions, footer, padding = 'md', flat = false, headingLevel = 3, className, children, ...rest }: CardProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <section className={cx(s.card, flat && s.flat, className)} data-component="Card" {...rest}>
      {(title || actions) && (
        <header className={s.header}>
          <div className={s.titles}>
            {title && <Heading className={s.title}>{title}</Heading>}
            {subtitle && <p className={s.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={s.actions}>{actions}</div>}
        </header>
      )}
      <div className={cx(s.body, s[`pad_${padding}`])}>{children}</div>
      {footer && <footer className={s.footer}>{footer}</footer>}
    </section>
  );
}
