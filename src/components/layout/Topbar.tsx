import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Database, Menu as MenuIcon, Moon, Sun } from 'lucide-react';
import { AS_OF } from '@/data/queries';
import { fmtLongDate } from '@/lib/dates';
import { usePreferences } from '@/state/PreferencesContext';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { QuickSearch } from './QuickSearch';
import { Modal } from '@/components/ui/Modal';
import { accountRows, DEFAULT_FILTERS } from '@/data/queries';
import { UxLabMenu } from './UxLabMenu';
import s from './Topbar.module.css';

const TITLES: Record<string, string> = {
  '/': 'Overview',
  '/accounts': 'Accounts',
  '/work': 'My work',
  '/legacy': 'Legacy view',
  '/case-study': 'Case study',
};

export function Topbar({ onMenu, showMenu }: { onMenu: () => void; showMenu: boolean }) {
  const { pathname } = useLocation();

  const { resolvedTheme, setTheme } = usePreferences();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alerts = accountRows(DEFAULT_FILTERS).filter(a => a.status === 'Active' && a.health !== 'healthy').sort((a,b) => b.arr-a.arr).slice(0,5);
  const title = TITLES[pathname] ?? (pathname.startsWith('/accounts/') ? 'Account workspace' : 'Vantage');

  return (
    <header className={s.topbar} data-component="Topbar">
      {showMenu && (
        <IconButton label="Open menu" onClick={onMenu} tooltip={false}>
          <MenuIcon />
        </IconButton>
      )}
      <nav className={s.crumbs} aria-label="Breadcrumb" data-heat="page-title">
        <span className={s.crumbRoot}>Vantage</span>
        <span className={s.crumbSep} aria-hidden>
          /
        </span>
        <span className={s.crumbCurrent} aria-current="page">
          {title}
        </span>
      </nav>

      <QuickSearch />

      <div className={s.right}>
        <Badge tone="neutral" icon={<Database size={12} />} className={s.asOf}>
          Data as of {fmtLongDate(AS_OF)}
        </Badge>
        <span className={s.lab}><UxLabMenu /></span>
        <IconButton label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
          {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
        </IconButton>
        <IconButton label="Account alerts" onClick={() => setAlertsOpen(true)}>
          <Bell />
        </IconButton>
      </div>
      <Modal open={alertsOpen} onClose={() => setAlertsOpen(false)} title="Accounts to keep an eye on" description="The five largest active accounts needing attention in the illustrative dataset."><div className={s.alerts}>{alerts.map(a => <Link key={a.id} to={`/accounts/${a.id}`} onClick={() => setAlertsOpen(false)}><strong>{a.name}</strong><span>Health {a.healthScore}/100 · Review account →</span></Link>)}{alerts.length === 0 && <p>No accounts need attention.</p>}</div></Modal></header>
  );
}



