import { useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '@/lib/cx';
import { useEscape, useFocusTrap, useScrollLock } from '@/lib/hooks';
import { Portal } from './Portal';
import { IconButton } from './IconButton';
import s from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  /** Legacy look used by the A/B "variant A" filter dialog */
  legacy?: boolean;
}

export function Modal({ open, onClose, title, description, children, footer, width = 520, legacy = false }: ModalProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEscape(onClose, open);
  useFocusTrap(panelRef, open);
  useScrollLock(open);

  if (!open) return null;

  return (
    <Portal>
      <div className={cx(s.root, legacy && s.legacy)} data-component="Modal">
        <div className={s.overlay} onClick={onClose} aria-hidden />
        <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-desc` : undefined} className={s.panel} style={{ width }} tabIndex={-1}>
          <header className={s.header}>
            <div className={s.titles}>
              <h2 id={`${id}-title`} className={s.title}>
                {title}
              </h2>
              {description && (
                <p id={`${id}-desc`} className={s.description}>
                  {description}
                </p>
              )}
            </div>
            <IconButton label="Close" onClick={onClose} tooltip={false} size="sm">
              <X />
            </IconButton>
          </header>
          <div className={s.body}>{children}</div>
          {footer && <footer className={s.footer}>{footer}</footer>}
        </div>
      </div>
    </Portal>
  );
}
