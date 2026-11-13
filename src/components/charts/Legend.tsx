import { cx } from '@/lib/cx';
import s from './charts.module.css';

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  shape?: 'line' | 'rect' | 'dot';
}

/** Legend mirrors the mark: line for lines, rect for bars/areas, dot for points. Text wears ink, never the series colour. */
export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={cx(s.legend, className)} aria-label="Legend">
      {items.map((it) => (
        <li key={it.key} className={s.legendItem}>
          <span className={it.shape === 'rect' ? s.legendRect : it.shape === 'dot' ? s.legendDot : s.legendLine} style={{ background: it.color }} aria-hidden />
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
