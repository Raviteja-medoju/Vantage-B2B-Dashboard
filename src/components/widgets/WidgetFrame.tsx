import { useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, EyeOff, GripVertical, Info, MoreHorizontal, Table2 } from 'lucide-react';
import { cx } from '@/lib/cx';
import { IconButton } from '@/components/ui/IconButton';
import { Menu, type MenuItem } from '@/components/ui/Menu';
import { Tooltip } from '@/components/ui/Tooltip';
import { SIZE_LABEL, type WidgetId, type WidgetSize } from '@/state/LayoutContext';
import s from './WidgetFrame.module.css';

export interface WidgetFrameProps {
  id: WidgetId;
  title: string;
  subtitle?: ReactNode;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  hasTableView?: boolean;
  tableView?: boolean;
  onToggleTableView?: () => void;
  size: WidgetSize;
  allowedSizes: WidgetSize[];
  onSizeChange?: (size: WidgetSize) => void;
  onHide?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement> & Record<string, unknown>;
  dragging?: boolean;
  over?: boolean;
  padding?: 'none' | 'md';
  className?: string;
}

export function WidgetFrame({
  id,
  title,
  subtitle,
  description,
  children,
  actions,
  hasTableView = false,
  tableView = false,
  onToggleTableView,
  size,
  allowedSizes,
  onSizeChange,
  onHide,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
  dragging = false,
  over = false,
  padding = 'md',
  className,
}: WidgetFrameProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement | null>(null);

  const items: MenuItem[] = [
    { type: 'label', key: 'size', label: 'Size' },
    ...allowedSizes.map<MenuItem>((sz) => ({ key: `size-${sz}`, label: SIZE_LABEL[sz], checked: sz === size, onSelect: () => onSizeChange?.(sz) })),
    { type: 'separator', key: 'sep-1' },
    { key: 'up', label: 'Move up', icon: <ArrowUp />, onSelect: onMoveUp, disabled: !onMoveUp },
    { key: 'down', label: 'Move down', icon: <ArrowDown />, onSelect: onMoveDown, disabled: !onMoveDown },
    { type: 'separator', key: 'sep-2' },
    { key: 'hide', label: 'Hide widget', icon: <EyeOff />, onSelect: onHide, description: 'Restore it from Customize' },
  ];

  return (
    <section className={cx(s.frame, dragging && s.dragging, over && s.over, className)} aria-labelledby={`widget-${id}-title`} data-component="WidgetFrame" data-heat={`widget-${id}`}>
      <header className={s.header}>
        {dragHandleProps && (
          <button type="button" className={s.handle} aria-label={`Drag to reorder ${title}`} {...dragHandleProps}>
            <GripVertical size={16} aria-hidden />
          </button>
        )}
        <div className={s.titles}>
          <div className={s.titleRow}>
            <h3 id={`widget-${id}-title`} className={s.title}>
              {title}
            </h3>
            {description && (
              <Tooltip content={description} placement="top">
                <span className={s.info} tabIndex={0} aria-label={`About ${title}`}>
                  <Info size={13} aria-hidden />
                </span>
              </Tooltip>
            )}
          </div>
          {subtitle && <p className={s.subtitle}>{subtitle}</p>}
        </div>
        <div className={s.actions}>
          {actions}
          {hasTableView && (
            <IconButton label={tableView ? 'Show chart' : 'Show as table'} size="sm" active={tableView} onClick={onToggleTableView}>
              <Table2 />
            </IconButton>
          )}
          <IconButton label="Widget options" size="sm" ref={menuBtn} onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
            <MoreHorizontal />
          </IconButton>
          <Menu open={menuOpen} onClose={() => setMenuOpen(false)} anchorRef={menuBtn} items={items} ariaLabel={`${title} options`} />
        </div>
      </header>
      <div className={cx(s.body, padding === 'none' && s.bodyFlush)}>{children}</div>
    </section>
  );
}
