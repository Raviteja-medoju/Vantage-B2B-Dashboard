import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/lib/hooks';

/**
 * "UX Lab" — research & QA toggles used during the redesign:
 *  - filterVariant: A (legacy modal) vs B (inline panel) from the A/B test
 *  - heatmap: click-density overlay reconstructed from session data
 *  - inspect: 8pt grid + component outlines used in design QA with engineering
 */
export type FilterVariant = 'A' | 'B';

interface LabValue {
  filterVariant: FilterVariant;
  setFilterVariant: (v: FilterVariant) => void;
  heatmap: boolean;
  setHeatmap: (v: boolean) => void;
  inspect: boolean;
  setInspect: (v: boolean) => void;
}

const Ctx = createContext<LabValue | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const [filterVariant, setFilterVariant] = useLocalStorage<FilterVariant>('vantage.lab.variant', 'B');
  const [heatmap, setHeatmap] = useLocalStorage<boolean>('vantage.lab.heatmap', false);
  const [inspect, setInspect] = useLocalStorage<boolean>('vantage.lab.inspect', false);

  useEffect(() => {
    document.documentElement.setAttribute('data-inspect', inspect ? 'true' : 'false');
  }, [inspect]);

  const value = useMemo<LabValue>(
    () => ({ filterVariant, setFilterVariant, heatmap, setHeatmap, inspect, setInspect }),
    [filterVariant, setFilterVariant, heatmap, setHeatmap, inspect, setInspect],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLab(): LabValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLab must be used within LabProvider');
  return v;
}
