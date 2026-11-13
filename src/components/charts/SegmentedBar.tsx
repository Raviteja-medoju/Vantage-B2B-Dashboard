import { useState } from 'react';
import { useMeasure } from '@/lib/hooks';
import { cx } from '@/lib/cx';
import { estimateTextWidth } from './svg';
import { ChartTooltip } from './ChartTooltip';
import { Legend } from './Legend';
import s from './charts.module.css';

export interface SegmentPart {
  key: string;
  label: string;
  value: number;
  color: string;
  /** Text colour for the in-block label (tall variant). Defaults to white. */
  ink?: string;
}

export interface SegmentedBarProps {
  parts: SegmentPart[];
  variant?: 'tall' | 'thin';
  dense?: boolean;
  valueFormat: (v: number) => string;
  /** Print share (46%) instead of amount inside tall blocks */
  printShare?: boolean;
  showLegend?: boolean;
  ariaLabel: string;
  className?: string;
}

/**
 * One whole split into <= 6 parts. Tall: 28px blocks with the share printed at the
 * leading edge where it fits; thin: 8px, no text (the figures live beside it).
 */
export function SegmentedBar({ parts, variant = 'tall', dense = false, valueFormat, printShare = true, showLegend, ariaLabel, className }: SegmentedBarProps) {
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const total = parts.reduce((s_, p) => s_ + Math.max(0, p.value), 0) || 1;
  const visible = parts.filter((p) => p.value > 0);
  const gapTotal = (visible.length - 1) * 2;

  return (
    <div ref={ref} className={cx(s.wrap, className)}>
      <div className={cx(variant === 'tall' ? s.segTall : s.segThin, dense && s.dense)} role="img" aria-label={`${ariaLabel}: ${visible.map((p) => `${p.label} ${valueFormat(p.value)} (${Math.round((p.value / total) * 100)}%)`).join(', ')}`}>
        {visible.map((p, i) => {
          const share = p.value / total;
          const px = Math.max(0, (width - gapTotal) * share);
          const text = printShare ? `${Math.round(share * 100)}%` : valueFormat(p.value);
          const fits = variant === 'tall' && px >= estimateTextWidth(text, 11) + 16;
          return (
            <div
              key={p.key}
              className={s.segPart}
              style={{ flex: `0 0 ${share * 100}%`, maxWidth: `calc(${share * 100}% - ${i < visible.length - 1 ? 2 : 0}px)`, background: p.color, color: p.ink ?? '#fff' }}
              tabIndex={0}
              aria-label={`${p.label}: ${valueFormat(p.value)}, ${Math.round(share * 100)}%`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              {fits && (
                <span className={s.segText} aria-hidden>
                  {text}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {hover != null && visible[hover] && width > 0 && (
        <ChartTooltip
          x={Math.min(width, (visible.slice(0, hover).reduce((s_, p) => s_ + p.value / total, 0) + visible[hover].value / total / 2) * width)}
          y={variant === 'tall' ? 14 : 4}
          width={width}
          height={variant === 'tall' ? 28 : 8}
          rows={[
            { key: 'amount', label: visible[hover].label, value: valueFormat(visible[hover].value), color: visible[hover].color, shape: 'rect' },
            { key: 'share', label: 'Share', value: `${Math.round((visible[hover].value / total) * 100)}%` },
          ]}
        />
      )}
      {(showLegend ?? variant === 'tall') && <Legend items={parts.map((p) => ({ key: p.key, label: p.label, color: p.color, shape: 'rect' as const }))} />}
    </div>
  );
}
