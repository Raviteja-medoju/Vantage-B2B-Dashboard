import { useRef } from 'react';
import { useEscape, useFocusTrap, useScrollLock } from '@/lib/hooks';
import { NavLink } from 'react-router-dom';
import { ListTodo, BookOpen, Building2, ChevronsLeft, ChevronsRight, ExternalLink, History, LayoutDashboard, X } from 'lucide-react';
import { cx } from '@/lib/cx';
import { usePreferences } from '@/state/PreferencesContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import s from './Sidebar.module.css';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/work', label: 'My work', icon: ListTodo },
  { to: '/accounts', label: 'Accounts', icon: Building2 },
  { to: '/legacy', label: 'Legacy view', icon: History, tag: '2023' },
  { to: '/case-study', label: 'Case study', icon: BookOpen, tag: 'UX' },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={s.logo} aria-label="Vantage">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
        <path d="M8 10 L16 23 L24 10" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="9" r="2.2" fill="#fff" />
      </svg>
      {!compact && (
        <span className={s.wordmark}>
          <span className={s.brand}>Vantage</span>
          <span className={s.tagline}>Revenue Intelligence</span>
        </span>
      )}
    </span>
  );
}

export function Sidebar({ mobile, open, onClose }: { mobile: boolean; open: boolean; onClose: () => void }) {
  const { sidebarCollapsed, setSidebarCollapsed } = usePreferences();
  const collapsed = sidebarCollapsed && !mobile;
  const panelRef = useRef<HTMLElement | null>(null);
  useEscape(onClose, mobile && open);
  useFocusTrap(panelRef, mobile && open);
  useScrollLock(mobile && open);

  const nav = (
    <nav className={s.nav} aria-label="Primary">
      <ul className={s.list}>
        {NAV.map((item) => {
          const link = (
            <NavLink aria-label={item.label} to={item.to} end={item.end} className={({ isActive }) => cx(s.link, isActive && s.active)}>
              <item.icon size={18} className={s.icon} aria-hidden />
              {!collapsed && <span className={s.label}>{item.label}</span>}
              {!collapsed && item.tag && <span className={s.tag}>{item.tag}</span>}
            </NavLink>
          );
          return (
            <li key={item.to}>
              {collapsed ? (
                <Tooltip content={item.label} placement="right">
                  {link}
                </Tooltip>
              ) : (
                link
              )}
            </li>
          );
        })}
      </ul>
      <div className={s.sectionLabel} aria-hidden={collapsed}>{!collapsed && 'Design system'}</div>
      <ul className={s.list}>
        <li>
          {collapsed ? (
            <Tooltip content="Storybook (localhost:6006)" placement="right">
              <a aria-label="Storybook (opens in a new tab)" className={s.link} href="http://localhost:6006" target="_blank" rel="noreferrer">
                <ExternalLink size={18} className={s.icon} aria-hidden />
              </a>
            </Tooltip>
          ) : (
            <a aria-label="Storybook (opens in a new tab)" className={s.link} href="http://localhost:6006" target="_blank" rel="noreferrer">
              <ExternalLink size={18} className={s.icon} aria-hidden />
              <span className={s.label}>Storybook</span>
              <span className={s.tagMuted}>:6006</span>
            </a>
          )}
        </li>
      </ul>
    </nav>
  );

  const footer = (
    <div className={s.footer}>
      <div className={s.user}>
        <Avatar name="Ravi Teja" size="sm" />
        {!collapsed && (
          <span className={s.userText}>
            <span className={s.userName}>Ravi Teja</span>
            <span className={s.userRole}>RevOps · Admin</span>
          </span>
        )}
      </div>
      {!mobile && (
        <Tooltip content={collapsed ? 'Expand navigation' : 'Focus mode · collapse navigation'} placement="right">
          <button type="button" className={s.toggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} onClick={() => setSidebarCollapsed(!collapsed)}>
            {!collapsed && <span>Focus mode</span>}
            {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </button>
        </Tooltip>
      )}
    </div>
  );

  if (mobile) {
    if (!open) return null;
    return (
      <div className={s.mobileRoot}>
        <div className={s.overlay} onClick={onClose} aria-hidden />
        <aside ref={panelRef} role="dialog" aria-modal="true" className={s.mobilePanel} aria-label="Sidebar" data-component="Sidebar">
          <div className={s.mobileHeader}>
            <Logo />
            <IconButton label="Close menu" onClick={onClose} tooltip={false}>
              <X />
            </IconButton>
          </div>
          {nav}
          {footer}
        </aside>
      </div>
    );
  }

  return (
    <aside className={cx(s.sidebar, collapsed && s.collapsed)} aria-label="Sidebar" data-component="Sidebar">
      <div className={s.header}>
        <Logo compact={collapsed} />
      </div>
      {nav}
      {footer}
    </aside>
  );
}



