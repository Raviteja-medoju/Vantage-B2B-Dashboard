/** Number formatting used by stat tiles, axes, tooltips and tables. */

const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

export function fmtNumber(n: number): string {
  return nf0.format(n);
}

/** Auto-compact: 1,284 / 12.9K / 4.2M (with optional $ prefix) */
export function fmtCompact(n: number, opts: { currency?: boolean; digits?: number } = {}): string {
  const { currency = false, digits } = opts;
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  const prefix = currency ? '$' : '';
  let body: string;
  if (abs >= 1_000_000_000) body = `${trim(abs / 1_000_000_000, digits ?? 1)}B`;
  else if (abs >= 1_000_000) body = `${trim(abs / 1_000_000, digits ?? 1)}M`;
  else if (abs >= 10_000) body = `${trim(abs / 1_000, digits ?? 1)}K`;
  else body = nf0.format(abs);
  return `${sign}${prefix}${body}`;
}

function trim(n: number, digits: number): string {
  const s = n.toFixed(digits);
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

export function fmtCurrency(n: number): string {
  const sign = n < 0 ? '−' : '';
  return `${sign}$${nf0.format(Math.abs(n))}`;
}

/** 0.2243 -> 22.4% */
export function fmtPct(ratio: number, digits = 1): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

/** 0.0612 -> +6.1%, -0.02 -> −2.0% */
export function fmtSignedPct(ratio: number, digits = 1): string {
  if (!Number.isFinite(ratio)) return '—';
  const sign = ratio > 0 ? '+' : ratio < 0 ? '−' : '';
  return `${sign}${(Math.abs(ratio) * 100).toFixed(digits)}%`;
}

export function fmtSignedCompact(n: number, currency = false): string {
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}${fmtCompact(Math.abs(n), { currency })}`;
}

export function fmtDecimal(n: number): string {
  return nf1.format(n);
}

/** Axis tick formatter: full under 10,000, compact above. */
export function axisTick(max: number, currency = false): (v: number) => string {
  if (max < 10_000) return (v) => `${currency ? '$' : ''}${nf0.format(v)}`;
  return (v) => fmtCompact(v, { currency });
}

export function fmtSeconds(s: number): string {
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return r ? `${m}m ${r}s` : `${m}m`;
}
