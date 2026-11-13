import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage, useMediaQuery } from '@/lib/hooks';

export type ThemePref = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';

interface PreferencesValue {
  theme: ThemePref;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: ThemePref) => void;
  density: Density;
  setDensity: (d: Density) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

const Ctx = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useLocalStorage<ThemePref>('vantage.theme.pref', 'system');
  const [density, setDensity] = useLocalStorage<Density>('vantage.density', 'comfortable');
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>('vantage.sidebar.collapsed', false);
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  // Stamp the resolved theme on <html>; the index.html bootstrap reads the same key.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    try {
      if (theme === 'system') localStorage.removeItem('vantage.theme');
      else localStorage.setItem('vantage.theme', theme);
    } catch {
      /* ignore */
    }
  }, [resolvedTheme, theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  const setTheme = useCallback((t: ThemePref) => setThemeState(t), [setThemeState]);

  const value = useMemo<PreferencesValue>(
    () => ({ theme, resolvedTheme, setTheme, density, setDensity, sidebarCollapsed, setSidebarCollapsed }),
    [theme, resolvedTheme, setTheme, density, setDensity, sidebarCollapsed, setSidebarCollapsed],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePreferences(): PreferencesValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePreferences must be used within PreferencesProvider');
  return v;
}
