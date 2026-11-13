import { useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { Check } from 'lucide-react';
import type { Placement } from '@floating-ui/react-dom';
import { cx } from '@/lib/cx';
import { Popover } from './Popover';
import s from './Menu.module.css';

export type MenuItem =
  | {
      type?: 'item';
      key: string;
      label: ReactNode;
      icon?: ReactNode;
      onSelect?: () => void;
      disabled?: boolean;
      danger?: boolean;
      /** Renders as menuitemcheckbox/radio with a check mark */
      checked?: boolean;
      shortcut?: string;
      description?: string;
    }
  | { type: 'separator'; key: string }
  | { type: 'label'; key: string; label: string };

export interface MenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  items: MenuItem[];
  placement?: Placement;
  ariaLabel?: string;
  minWidth?: number;
}

export function Menu({ open, onClose, anchorRef, items, placement = 'bottom-end', ariaLabel, minWidth = 200 }: MenuProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const first = listRef.current?.querySelector<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])');
    first?.focus({ preventScroll: true });
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? []);
    if (nodes.length === 0) return;
    const idx = nodes.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => nodes[(i + nodes.length) % nodes.length]?.focus();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusAt(idx + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusAt(idx - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusAt(0);
        break;
      case 'End':
        e.preventDefault();
        focusAt(nodes.length - 1);
        break;
      case 'Tab':
        onClose();
        break;
    }
  };

  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} placement={placement} role="menu" ariaLabel={ariaLabel} autoFocus={false} padding="sm">
      <div ref={listRef} className={s.list} onKeyDown={onKeyDown} style={{ minWidth }}>
        {items.map((item) => {
          if (item.type === 'separator') return <div key={item.key} role="separator" className={s.separator} />;
          if (item.type === 'label')
            return (
              <div key={item.key} className={s.groupLabel}>
                {item.label}
              </div>
            );
          const hasCheck = item.checked !== undefined;
          return (
            <button
              key={item.key}
              type="button"
              role={hasCheck ? 'menuitemcheckbox' : 'menuitem'}
              aria-checked={hasCheck ? item.checked : undefined}
              aria-disabled={item.disabled || undefined}
              tabIndex={-1}
              className={cx(s.item, item.danger && s.danger, item.disabled && s.disabled)}
              onClick={() => {
                if (item.disabled) return;
                item.onSelect?.();
                onClose();
                anchorRef.current?.focus({ preventScroll: true });
              }}
            >
              {hasCheck ? (
                <span className={s.check} aria-hidden>
                  {item.checked && <Check size={16} strokeWidth={2.5} />}
                </span>
              ) : item.icon ? (
                <span className={s.icon} aria-hidden>
                  {item.icon}
                </span>
              ) : null}
              <span className={s.body}>
                <span className={s.label}>{item.label}</span>
                {item.description && <span className={s.description}>{item.description}</span>}
              </span>
              {item.shortcut && <kbd className={s.shortcut}>{item.shortcut}</kbd>}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
