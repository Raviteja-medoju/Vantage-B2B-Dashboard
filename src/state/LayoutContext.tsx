import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/lib/hooks';
import type { KpiKey } from '@/data/queries';

export type WidgetId =
  | 'kpis'
  | 'revenueTrend'
  | 'arrMovement'
  | 'pipeline'
  | 'arrByRegion'
  | 'health'
  | 'usage'
  | 'topAccounts'
  | 'renewals'
  | 'quota';

/** Column spans on a 12-column grid */
export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl';
export const SIZE_SPAN: Record<WidgetSize, number> = { sm: 4, md: 6, lg: 8, xl: 12 };
export const SIZE_LABEL: Record<WidgetSize, string> = { sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Full width' };

export interface LayoutItem {
  id: WidgetId;
  size: WidgetSize;
  visible: boolean;
}

export const DEFAULT_LAYOUT: LayoutItem[] = [
  { id: 'kpis', size: 'xl', visible: true },
  { id: 'revenueTrend', size: 'lg', visible: true },
  { id: 'health', size: 'sm', visible: true },
  { id: 'arrMovement', size: 'md', visible: true },
  { id: 'pipeline', size: 'md', visible: true },
  { id: 'arrByRegion', size: 'sm', visible: true },
  { id: 'usage', size: 'lg', visible: true },
  { id: 'topAccounts', size: 'lg', visible: true },
  { id: 'renewals', size: 'sm', visible: true },
  { id: 'quota', size: 'md', visible: false },
];

export const DEFAULT_KPIS: KpiKey[] = ['arr', 'netNew', 'nrr', 'activeAccounts', 'pipeline'];

interface LayoutValue {
  items: LayoutItem[];
  kpiKeys: KpiKey[];
  move: (fromId: WidgetId, toId: WidgetId) => void;
  setSize: (id: WidgetId, size: WidgetSize) => void;
  setVisible: (id: WidgetId, visible: boolean) => void;
  setKpiKeys: (keys: KpiKey[]) => void;
  reset: () => void;
  isDefault: boolean;
}

const Ctx = createContext<LayoutValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<LayoutItem[]>('vantage.layout.v1', DEFAULT_LAYOUT);
  const [kpiKeys, setKpiKeys] = useLocalStorage<KpiKey[]>('vantage.kpis.v1', DEFAULT_KPIS);

  const move = useCallback(
    (fromId: WidgetId, toId: WidgetId) => {
      setItems((prev) => {
        const from = prev.findIndex((i) => i.id === fromId);
        const to = prev.findIndex((i) => i.id === toId);
        if (from < 0 || to < 0 || from === to) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    },
    [setItems],
  );

  const setSize = useCallback(
    (id: WidgetId, size: WidgetSize) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, size } : i))),
    [setItems],
  );
  const setVisible = useCallback(
    (id: WidgetId, visible: boolean) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, visible } : i))),
    [setItems],
  );
  const reset = useCallback(() => {
    setItems(DEFAULT_LAYOUT);
    setKpiKeys(DEFAULT_KPIS);
  }, [setItems, setKpiKeys]);

  // Heal layouts saved by older builds (missing widgets get appended, hidden).
  const healed = useMemo(() => {
    const known = new Set(items.map((i) => i.id));
    const missing = DEFAULT_LAYOUT.filter((d) => !known.has(d.id)).map((d) => ({ ...d, visible: false }));
    const valid = items.filter((i) => DEFAULT_LAYOUT.some((d) => d.id === i.id));
    return missing.length || valid.length !== items.length ? [...valid, ...missing] : items;
  }, [items]);

  const isDefault = useMemo(
    () => JSON.stringify(healed) === JSON.stringify(DEFAULT_LAYOUT) && JSON.stringify(kpiKeys) === JSON.stringify(DEFAULT_KPIS),
    [healed, kpiKeys],
  );

  const value = useMemo<LayoutValue>(
    () => ({ items: healed, kpiKeys, move, setSize, setVisible, setKpiKeys, reset, isDefault }),
    [healed, kpiKeys, move, setSize, setVisible, setKpiKeys, reset, isDefault],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLayout(): LayoutValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLayout must be used within LayoutProvider');
  return v;
}
