import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { autoUpdate, flip, offset, shift, useFloating, type Placement } from '@floating-ui/react-dom';
import { Portal } from './Portal';
import s from './Tooltip.module.css';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
  delay?: number;
}

export function Tooltip({ content, children, placement = 'top', delay = 250 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef<number | undefined>(undefined);
  const { refs, floatingStyles } = useFloating({
    placement,
    open,
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (content == null || content === '') return <>{children}</>;

  return (
    <>
      <span
        ref={refs.setReference}
        className={s.trigger}
        onPointerEnter={show}
        onPointerLeave={hide}
        onPointerDown={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {open && (
        <Portal>
          <div ref={refs.setFloating} style={floatingStyles} role="tooltip" id={id} className={s.tip}>
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}
