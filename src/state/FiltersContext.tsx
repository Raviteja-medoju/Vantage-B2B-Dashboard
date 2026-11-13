import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/lib/hooks';
import { DEFAULT_FILTERS, resolveRange, type Filters, type ResolvedRange } from '@/data/queries';

export interface SavedView {
  id: string;
  name: string;
  filters: Filters;
  createdAt: string;
}

interface FiltersValue {
  filters: Filters;
  resolved: ResolvedRange;
  setFilters: (f: Filters) => void;
  patch: (p: Partial<Filters>) => void;
  reset: () => void;
  savedViews: SavedView[];
  saveView: (name: string) => void;
  applyView: (id: string) => void;
  deleteView: (id: string) => void;
}

const Ctx = createContext<FiltersValue | null>(null);

const BUILT_IN_VIEWS: SavedView[] = [
  {
    id: 'view-emea-risk',
    name: 'EMEA renewal risk',
    filters: { ...DEFAULT_FILTERS, range: '90d', regions: ['EMEA'], segments: ['Enterprise', 'Mid-market'] },
    createdAt: '2026-10-02',
  },
  {
    id: 'view-smb-growth',
    name: 'SMB growth · 12 months',
    filters: { ...DEFAULT_FILTERS, range: '12m', segments: ['SMB'] },
    createdAt: '2026-09-18',
  },
];

export function FiltersProvider({ children, initial }: { children: ReactNode; initial?: Filters }) {
  const [filters, setFiltersState] = useLocalStorage<Filters>('vantage.filters.v1', initial ?? DEFAULT_FILTERS);
  const [savedViews, setSavedViews] = useLocalStorage<SavedView[]>('vantage.views.v1', BUILT_IN_VIEWS);

  const setFilters = useCallback((f: Filters) => setFiltersState(f), [setFiltersState]);
  const patch = useCallback((p: Partial<Filters>) => setFiltersState((prev) => ({ ...prev, ...p })), [setFiltersState]);
  const reset = useCallback(() => setFiltersState(DEFAULT_FILTERS), [setFiltersState]);

  const saveView = useCallback(
    (name: string) => {
      setSavedViews((prev) => [
        { id: `view-${Date.now()}`, name, filters, createdAt: new Date().toISOString().slice(0, 10) },
        ...prev,
      ]);
    },
    [filters, setSavedViews],
  );
  const applyView = useCallback(
    (id: string) => {
      const v = savedViews.find((s) => s.id === id);
      if (v) setFiltersState(v.filters);
    },
    [savedViews, setFiltersState],
  );
  const deleteView = useCallback((id: string) => setSavedViews((prev) => prev.filter((v) => v.id !== id)), [setSavedViews]);

  const resolved = useMemo(() => resolveRange(filters), [filters]);

  const value = useMemo<FiltersValue>(
    () => ({ filters, resolved, setFilters, patch, reset, savedViews, saveView, applyView, deleteView }),
    [filters, resolved, setFilters, patch, reset, savedViews, saveView, applyView, deleteView],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilters(): FiltersValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFilters must be used within FiltersProvider');
  return v;
}
