import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { cx } from '@/lib/cx';
import { Portal } from './Portal';
import s from './Toast.module.css';

interface ToastItem {
  id: number;
  message: string;
  tone: 'info' | 'success';
}

interface ToastValue {
  toast: (message: string, tone?: ToastItem['tone']) => void;
}

const Ctx = createContext<ToastValue>({ toast: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, tone: ToastItem['tone'] = 'success') => {
    const id = ++counter.current;
    setItems((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Portal>
        <div className={s.region} role="status" aria-live="polite" aria-atomic="false">
          {items.map((t) => (
            <div key={t.id} className={cx(s.toast, s[t.tone])}>
              {t.tone === 'success' ? <CheckCircle2 size={16} aria-hidden /> : <Info size={16} aria-hidden />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </Portal>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
