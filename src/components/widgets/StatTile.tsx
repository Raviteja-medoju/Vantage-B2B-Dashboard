import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cx } from '@/lib/cx';
import { Sparkline } from '@/components/charts/Sparkline';
import s from './StatTile.module.css';

export interface StatDelta {
  text: string;
  direction: 'up' | 'down' | 'flat';
  /** true = favourable, false = unfavourable, null = neutral */
  good: boolean | null;
}

export interface StatTileProps {
  label: string;
  value: string;
  delta?: StatDelta | null;
  deltaCaption?: string;
  trend?: number[];
  footnote?: string;
  /** Hero figure: >= 48px, exactly one per view */
  hero?: boolean;
  className?: string;
}

/**
 * Stat tile contract: label · value (proportional figures) · delta (signed, vs a named period,
 * colour = direction × whether up is good) · trend (12-point sparkline).
 */
export function StatTile({ label, value, delta, deltaCaption, trend, footnote, hero = false, className }: StatTileProps) {
  const Icon = delta?.direction === 'up' ? ArrowUpRight : delta?.direction === 'down' ? ArrowDownRight : Minus;
  return (
    <div className={cx(s.tile, hero && s.hero, className)} data-component="StatTile">
      <div className={s.label}>{label}</div>
      <div className={s.row}>
        <div className={s.value}>{value}</div>
        {trend && trend.length > 1 && <Sparkline data={trend} width={88} height={28} className={s.spark} />}
      </div>
      <div className={s.meta}>
        {delta ? (
          <span className={cx(s.delta, delta.good === true && s.good, delta.good === false && s.bad)}>
            <Icon size={14} strokeWidth={2.5} aria-hidden />
            <span>{delta.text}</span>
            {deltaCaption && <span className={s.caption}>{deltaCaption}</span>}
          </span>
        ) : footnote ? (
          <span className={s.caption}>{footnote}</span>
        ) : (
          <span className={s.caption}>No comparison period</span>
        )}
      </div>
    </div>
  );
}
