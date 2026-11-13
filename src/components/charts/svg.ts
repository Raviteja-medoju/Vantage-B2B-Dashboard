/** Shared helpers for the SVG chart primitives. */

export const seriesColor = (slot: number) => `var(--series-${Math.min(8, Math.max(1, slot))})`;

/** Approximate rendered text width for layout decisions (collision, fit tests). */
export function estimateTextWidth(text: string, fontSize = 11): number {
  return text.length * fontSize * 0.58;
}

/**
 * A rectangle path with independently rounded top/bottom corners.
 * Used so bars are rounded at the data end and square at the baseline.
 */
export function roundedRectPath(x: number, y: number, w: number, h: number, rTop: number, rBottom: number): string {
  const rt = Math.min(rTop, w / 2, h);
  const rb = Math.min(rBottom, w / 2, h);
  if (w <= 0 || h <= 0) return '';
  return [
    `M${x + rt},${y}`,
    `H${x + w - rt}`,
    rt ? `A${rt},${rt} 0 0 1 ${x + w},${y + rt}` : '',
    `V${y + h - rb}`,
    rb ? `A${rb},${rb} 0 0 1 ${x + w - rb},${y + h}` : '',
    `H${x + rb}`,
    rb ? `A${rb},${rb} 0 0 1 ${x},${y + h - rb}` : '',
    `V${y + rt}`,
    rt ? `A${rt},${rt} 0 0 1 ${x + rt},${y}` : '',
    'Z',
  ].join(' ');
}

/** Horizontal bar: rounded at the right (data end), square at the left baseline. */
export function roundedBarRightPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, h / 2, w);
  if (w <= 0 || h <= 0) return '';
  return [`M${x},${y}`, `H${x + w - rr}`, rr ? `A${rr},${rr} 0 0 1 ${x + w},${y + rr}` : '', `V${y + h - rr}`, rr ? `A${rr},${rr} 0 0 1 ${x + w - rr},${y + h}` : '', `H${x}`, 'Z'].join(' ');
}

/** Pick ~n evenly spaced indices from 0..len-1, always including first and last. */
export function pickIndices(len: number, n: number): number[] {
  if (len <= n) return Array.from({ length: len }, (_, i) => i);
  const out = new Set<number>();
  for (let i = 0; i < n; i++) out.add(Math.round((i * (len - 1)) / (n - 1)));
  return Array.from(out).sort((a, b) => a - b);
}

export const CHART_FONT = 11;
