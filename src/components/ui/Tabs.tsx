import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import s from './Tabs.module.css';

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
  count?: number;
  icon?: ReactNode;
}

export interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
}

export function Tabs<T extends string>({ tabs, active, onChange, ariaLabel, className }: TabsProps<T>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((t) => t.id === active);
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[next].id);
    ref.current?.querySelector<HTMLElement>(`[data-id="${tabs[next].id}"]`)?.focus();
  };
  return (
    <div ref={ref} role="tablist" aria-label={ariaLabel} className={cx(s.tabs, className)} onKeyDown={onKeyDown} data-component="Tabs">
      {tabs.map((t) => {
        const selected = t.id === active;
        return (
          <button key={t.id} type="button" role="tab" aria-selected={selected} tabIndex={selected ? 0 : -1} data-id={t.id} className={cx(s.tab, selected && s.selected)} onClick={() => onChange(t.id)}>
            {t.icon && (
              <span className={s.icon} aria-hidden>
                {t.icon}
              </span>
            )}
            <span>{t.label}</span>
            {t.count !== undefined && <span className={s.count}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
