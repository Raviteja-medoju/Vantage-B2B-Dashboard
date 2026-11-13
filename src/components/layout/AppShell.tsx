import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cx } from '@/lib/cx';
import { useMediaQuery } from '@/lib/hooks';
import { usePreferences } from '@/state/PreferencesContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HeatmapOverlay } from './HeatmapOverlay';
import { useWorkspace } from '@/state/WorkspaceContext';
import s from './AppShell.module.css';

export function AppShell() {
  const { sidebarCollapsed } = usePreferences();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { storageError } = useWorkspace();

  // Close the off-canvas nav on navigation and reset scroll between pages.
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className={cx(s.shell, sidebarCollapsed && !isMobile && s.collapsed)} data-component="AppShell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar mobile={isMobile} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={s.main}>
        <Topbar onMenu={() => setMobileOpen(true)} showMenu={isMobile} />
        <main id="main" className={s.content} tabIndex={-1}>
          {storageError && <p role="alert" className={s.storageWarning}>Browser storage is unavailable. Your workspace changes will last only for this session.</p>}
          <Outlet />
        </main>
      </div>
      <HeatmapOverlay />
    </div>
  );
}
