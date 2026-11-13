import { useCallback, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { autoUpdate, flip, offset, shift, size as sizeMw, useFloating, type Placement } from '@floating-ui/react-dom';
import { cx } from '@/lib/cx';
import { useClickOutside, useEscape } from '@/lib/hooks';
import { Portal } from './Portal';
import s from './Popover.module.css';

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  placement?: Placement;
  className?: string;
  /** Make the panel at least as wide as the anchor */
  matchWidth?: boolean;
  /** Move focus into the panel on open (default true) */
  autoFocus?: boolean;
  role?: 'dialog' | 'menu' | 'listbox' | 'presentation';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  /** Padding preset for the panel */
  padding?: 'none' | 'sm' | 'md';
}

export function Popover({
  open,
  onClose,
  anchorRef,
  children,
  placement = 'bottom-start',
  className,
  matchWidth = false,
  autoFocus = true,
  role = 'dialog',
  ariaLabel,
  ariaLabelledBy,
  padding = 'none',
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { refs, floatingStyles } = useFloating({
    placement,
    open,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      sizeMw({
        padding: 8,
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(160, availableHeight)}px`,
            ...(matchWidth ? { minWidth: `${rects.reference.width}px` } : {}),
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useLayoutEffect(() => {
    if (open) refs.setReference(anchorRef.current);
  }, [open, anchorRef, refs]);

  const setFloating = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      refs.setFloating(node);
    },
    [refs],
  );

  useLayoutEffect(() => {
    if (!open || !autoFocus) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(
      '[data-autofocus], button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (first ?? panel).focus({ preventScroll: true });
  }, [open, autoFocus]);

  const close = useCallback(() => onClose(), [onClose]);
  const closeAndRestore = useCallback(() => {
    onClose();
    anchorRef.current?.focus({ preventScroll: true });
  }, [onClose, anchorRef]);

  useClickOutside([panelRef, anchorRef], close, open);
  useEscape(closeAndRestore, open);

  if (!open) return null;

  return (
    <Portal>
      <div
        ref={setFloating}
        style={floatingStyles}
        className={cx(s.panel, s[`pad_${padding}`], className)}
        role={role === 'presentation' ? undefined : role}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-modal={role === 'dialog' ? false : undefined}
        tabIndex={-1}
        data-component="Popover"
      >
        {children}
      </div>
    </Portal>
  );
}
