import type { ComponentProps, ReactNode } from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cx } from '@/lib/cx';
import type { Health } from '@/data/types';
import s from './Badge.module.css';

export type BadgeTone = 'neutral' | 'accent' | 'good' | 'warning' | 'serious' | 'critical';

export interface BadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md';
  /** Leading dot instead of icon */
  dot?: boolean;
}

export function Badge({ tone = 'neutral', icon, children, size = 'md', dot = false, className, ...rest }: BadgeProps) {
  return (
    <span className={cx(s.badge, s[tone], s[size], className)} data-component="Badge" {...rest}>
      {dot && <span className={s.dot} aria-hidden />}
      {icon && (
        <span className={s.icon} aria-hidden>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

const HEALTH_META: Record<Health, { tone: BadgeTone; label: string; Icon: typeof CheckCircle2 }> = {
  healthy: { tone: 'good', label: 'Healthy', Icon: CheckCircle2 },
  'at-risk': { tone: 'warning', label: 'At risk', Icon: AlertTriangle },
  critical: { tone: 'critical', label: 'Critical', Icon: AlertOctagon },
};

/** Status is never color alone: icon + label always travel together. */
export function HealthBadge({ health, size = 'md', showLabel = true }: { health: Health; size?: 'sm' | 'md'; showLabel?: boolean }) {
  const m = HEALTH_META[health];
  return (
    <Badge tone={m.tone} size={size} icon={<m.Icon size={12} strokeWidth={2.25} />} aria-label={showLabel ? undefined : m.label} title={showLabel ? undefined : m.label}>
      {showLabel ? m.label : <span className="sr-only">{m.label}</span>}
    </Badge>
  );
}
