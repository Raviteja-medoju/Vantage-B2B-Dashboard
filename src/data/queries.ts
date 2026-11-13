/**
 * Query layer: every widget derives its numbers from the same filtered slice,
 * so the dashboard always agrees with itself ("filters scope everything").
 */
import { AS_OF, db } from './generate';
import {
  STAGES,
  STAGE_PROBABILITY,
  type Account,
  type Health,
  type Plan,
  type Region,
  type Segment,
  type Stage,
} from './types';
import {
  addDays,
  addMonths,
  diffDays,
  endOfMonth,
  fmtMonth,
  fmtRange,
  fmtShortDate,
  parseIsoDay,
  startOfDay,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from '@/lib/dates';

/* --------------------------------------------------------------------------
   Filters & ranges
   -------------------------------------------------------------------------- */
export type RangeKey = '30d' | '90d' | '6m' | '12m' | 'qtd' | 'ytd' | 'custom';
export type Granularity = 'day' | 'week' | 'month';

export interface Filters {
  range: RangeKey;
  /** ISO day strings, used when range === 'custom' */
  start?: string;
  end?: string;
  /** Empty array = no restriction */
  regions: Region[];
  segments: Segment[];
  plans: Plan[];
  /** Show deltas vs the previous period of equal length */
  compare: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  range: '90d',
  regions: [],
  segments: [],
  plans: [],
  compare: true,
};

export const RANGE_PRESETS: Array<{ key: Exclude<RangeKey, 'custom'>; label: string }> = [
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: '6m', label: 'Last 6 months' },
  { key: '12m', label: 'Last 12 months' },
  { key: 'qtd', label: 'Quarter to date' },
  { key: 'ytd', label: 'Year to date' },
];

export interface ResolvedRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  days: number;
  granularity: Granularity;
  label: string;
}

export function resolveRange(f: Filters, asOf: Date = AS_OF): ResolvedRange {
  const end = f.range === 'custom' && f.end ? parseIsoDay(f.end) : startOfDay(asOf);
  let start: Date;
  switch (f.range) {
    case '30d':
      start = addDays(end, -29);
      break;
    case '90d':
      start = addDays(end, -89);
      break;
    case '6m':
      start = addDays(addMonths(end, -6), 1);
      break;
    case '12m':
      start = addDays(addMonths(end, -12), 1);
      break;
    case 'qtd':
      start = startOfQuarter(end);
      break;
    case 'ytd':
      start = startOfYear(end);
      break;
    case 'custom':
    default:
      start = f.start ? parseIsoDay(f.start) : addDays(end, -29);
  }
  if (start > end) start = end;
  const days = diffDays(start, end) + 1;
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(days - 1));
  const granularity: Granularity = days <= 45 ? 'day' : days <= 200 ? 'week' : 'month';
  const preset = RANGE_PRESETS.find((p) => p.key === f.range);
  return {
    start,
    end,
    prevStart,
    prevEnd,
    days,
    granularity,
    label: preset ? preset.label : fmtRange(start, end),
  };
}

export function countActiveFilters(f: Filters): number {
  return f.regions.length + f.segments.length + f.plans.length + (f.range !== DEFAULT_FILTERS.range ? 1 : 0);
}

/* --------------------------------------------------------------------------
   Buckets
   -------------------------------------------------------------------------- */
export interface Bucket {
  start: Date;
  end: Date;
  label: string;
}

const minDate = (a: Date, b: Date) => (a < b ? a : b);

export function makeBuckets(start: Date, end: Date, g: Granularity): Bucket[] {
  const out: Bucket[] = [];
  if (g === 'day') {
    for (let d = start; d <= end; d = addDays(d, 1)) out.push({ start: d, end: d, label: fmtShortDate(d) });
  } else if (g === 'week') {
    let s = start;
    while (s <= end) {
      const e = minDate(addDays(startOfWeek(s), 6), end);
      out.push({ start: s, end: e, label: fmtShortDate(s) });
      s = addDays(e, 1);
    }
  } else {
    let s = start;
    while (s <= end) {
      const e = minDate(endOfMonth(s), end);
      out.push({ start: s, end: e, label: fmtMonth(s, s.getMonth() === 0 || out.length === 0) });
      s = addDays(e, 1);
    }
  }
  return out;
}

/* --------------------------------------------------------------------------
   Dimension filtering & ARR math
   -------------------------------------------------------------------------- */
export function matchesDims(x: { region: Region; segment: Segment; plan: Plan }, f: Filters): boolean {
  return (
    (f.regions.length === 0 || f.regions.includes(x.region)) &&
    (f.segments.length === 0 || f.segments.includes(x.segment)) &&
    (f.plans.length === 0 || f.plans.includes(x.plan))
  );
}

export function filteredAccounts(f: Filters): Account[] {
  return db.accounts.filter((a) => matchesDims(a, f));
}

export function arrAt(a: Account, date: Date): number {
  let s = 0;
  for (const e of a.events) if (e.date <= date) s += e.delta;
  return s;
}

export function totalArrAt(accs: Account[], date: Date): number {
  let s = 0;
  for (const a of accs) s += arrAt(a, date);
  return s;
}

/* --------------------------------------------------------------------------
   Time series
   -------------------------------------------------------------------------- */
export interface SeriesPoint {
  date: Date;
  label: string;
  arr: number;
  new: number;
  expansion: number;
  /** negative */
  contraction: number;
  /** negative */
  churn: number;
  active: number;
}

export function arrSeries(accs: Account[], start: Date, end: Date, g: Granularity): SeriesPoint[] {
  return makeBuckets(start, end, g).map((b) => {
    let arr = 0;
    let nw = 0;
    let ex = 0;
    let co = 0;
    let ch = 0;
    let active = 0;
    for (const a of accs) {
      let s = 0;
      for (const e of a.events) {
        if (e.date > b.end) continue;
        s += e.delta;
        if (e.date >= b.start) {
          if (e.type === 'new') nw += e.delta;
          else if (e.type === 'expansion') ex += e.delta;
          else if (e.type === 'contraction') co += e.delta;
          else ch += e.delta;
        }
      }
      arr += s;
      if (s > 0) active++;
    }
    return { date: b.end, label: b.label, arr, new: nw, expansion: ex, contraction: co, churn: ch, active };
  });
}

export function downsample(values: number[], n = 12): number[] {
  if (values.length <= n) return values;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.round((i * (values.length - 1)) / (n - 1));
    out.push(values[idx]);
  }
  return out;
}

/* --------------------------------------------------------------------------
   KPIs
   -------------------------------------------------------------------------- */
export type KpiKey = 'arr' | 'netNew' | 'nrr' | 'activeAccounts' | 'pipeline' | 'winRate' | 'churnRate';

export interface KpiDef {
  key: KpiKey;
  label: string;
  format: 'currency' | 'number' | 'pct';
  upIsGood: boolean;
  description: string;
}

export const KPI_DEFS: KpiDef[] = [
  { key: 'arr', label: 'Annual recurring revenue', format: 'currency', upIsGood: true, description: 'Sum of active contract value at the end of the period.' },
  { key: 'netNew', label: 'Net new ARR', format: 'currency', upIsGood: true, description: 'New + expansion − contraction − churn within the period.' },
  { key: 'nrr', label: 'Net revenue retention', format: 'pct', upIsGood: true, description: 'End ARR of accounts active at period start ÷ their starting ARR.' },
  { key: 'activeAccounts', label: 'Active accounts', format: 'number', upIsGood: true, description: 'Accounts with ARR > 0 at the end of the period.' },
  { key: 'pipeline', label: 'Open pipeline', format: 'currency', upIsGood: true, description: 'Open opportunity value (snapshot as of today).' },
  { key: 'winRate', label: 'Win rate', format: 'pct', upIsGood: true, description: 'Won ÷ (won + lost) for deals closed in the period.' },
  { key: 'churnRate', label: 'Gross ARR churn', format: 'pct', upIsGood: false, description: 'Churned ARR ÷ ARR at period start.' },
];

export interface Kpi {
  key: KpiKey;
  label: string;
  format: KpiDef['format'];
  upIsGood: boolean;
  value: number;
  /** ratio change vs previous period (format 'currency'|'number') or percentage-point change (format 'pct'); null when not comparable */
  delta: number | null;
  deltaKind: 'ratio' | 'pp';
  spark: number[];
  footnote?: string;
}

function ratioDelta(cur: number, prev: number): number | null {
  if (!Number.isFinite(prev) || prev === 0) return null;
  return (cur - prev) / Math.abs(prev);
}

export function computeKpis(f: Filters): Record<KpiKey, Kpi> {
  const accs = filteredAccounts(f);
  const r = resolveRange(f);
  const series = arrSeries(accs, r.start, r.end, r.granularity);
  const dayBefore = (d: Date) => addDays(d, -1);

  const arrEnd = totalArrAt(accs, r.end);
  const arrStart = totalArrAt(accs, dayBefore(r.start));
  const prevArrEnd = totalArrAt(accs, r.prevEnd);
  const prevArrStart = totalArrAt(accs, dayBefore(r.prevStart));

  const nrrFor = (s: Date, e: Date) => {
    const cohort = accs.filter((a) => arrAt(a, dayBefore(s)) > 0);
    const startArr = cohort.reduce((sum, a) => sum + arrAt(a, dayBefore(s)), 0);
    const endArr = cohort.reduce((sum, a) => sum + arrAt(a, e), 0);
    return startArr > 0 ? endArr / startArr : NaN;
  };
  const nrr = nrrFor(r.start, r.end);
  const prevNrr = nrrFor(r.prevStart, r.prevEnd);

  const activeEnd = accs.filter((a) => arrAt(a, r.end) > 0).length;
  const prevActiveEnd = accs.filter((a) => arrAt(a, r.prevEnd) > 0).length;

  const opps = db.opportunities.filter((o) => matchesDims(o, f));
  const open = opps.filter((o) => o.status === 'open');
  const pipeline = open.reduce((s, o) => s + o.amount, 0);
  const weighted = open.reduce((s, o) => s + o.amount * STAGE_PROBABILITY[o.stage], 0);

  const winRateFor = (s: Date, e: Date) => {
    const closed = opps.filter((o) => o.status !== 'open' && o.closeDate >= s && o.closeDate <= e);
    const won = closed.filter((o) => o.status === 'won').length;
    return closed.length ? won / closed.length : NaN;
  };
  const winRate = winRateFor(r.start, r.end);
  const prevWinRate = winRateFor(r.prevStart, r.prevEnd);

  const churnFor = (s: Date, e: Date, base: number) => {
    let churned = 0;
    for (const a of accs) for (const ev of a.events) if (ev.type === 'churn' && ev.date >= s && ev.date <= e) churned += -ev.delta;
    return base > 0 ? churned / base : NaN;
  };
  const churnRate = churnFor(r.start, r.end, arrStart);
  const prevChurnRate = churnFor(r.prevStart, r.prevEnd, prevArrStart);

  const def = (k: KpiKey) => KPI_DEFS.find((d) => d.key === k)!;
  const mk = (k: KpiKey, value: number, delta: number | null, deltaKind: Kpi['deltaKind'], spark: number[], footnote?: string): Kpi => ({
    key: k,
    label: def(k).label,
    format: def(k).format,
    upIsGood: def(k).upIsGood,
    value,
    delta,
    deltaKind,
    spark,
    footnote,
  });

  const netNew = arrEnd - arrStart;
  const prevNetNew = prevArrEnd - prevArrStart;

  return {
    arr: mk('arr', arrEnd, ratioDelta(arrEnd, prevArrEnd), 'ratio', downsample(series.map((p) => p.arr))),
    netNew: mk('netNew', netNew, ratioDelta(netNew, prevNetNew), 'ratio', downsample(series.map((p) => p.new + p.expansion + p.contraction + p.churn))),
    nrr: mk('nrr', nrr, Number.isFinite(nrr) && Number.isFinite(prevNrr) ? nrr - prevNrr : null, 'pp', []),
    activeAccounts: mk('activeAccounts', activeEnd, ratioDelta(activeEnd, prevActiveEnd), 'ratio', downsample(series.map((p) => p.active))),
    pipeline: mk('pipeline', pipeline, null, 'ratio', [], `${open.length} open deals · weighted ${compactMoney(weighted)}`),
    winRate: mk('winRate', winRate, Number.isFinite(winRate) && Number.isFinite(prevWinRate) ? winRate - prevWinRate : null, 'pp', []),
    churnRate: mk('churnRate', churnRate, Number.isFinite(churnRate) && Number.isFinite(prevChurnRate) ? churnRate - prevChurnRate : null, 'pp', []),
  };
}

function compactMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

/* --------------------------------------------------------------------------
   Widget queries
   -------------------------------------------------------------------------- */
export function revenueTrend(f: Filters) {
  const accs = filteredAccounts(f);
  const r = resolveRange(f);
  const current = arrSeries(accs, r.start, r.end, r.granularity);
  const previous = arrSeries(accs, r.prevStart, r.prevEnd, r.granularity);
  return { current, previous, range: r };
}

export interface StageRow {
  stage: Stage;
  count: number;
  amount: number;
  weighted: number;
}

export function pipelineByStage(f: Filters): StageRow[] {
  const open = db.opportunities.filter((o) => o.status === 'open' && matchesDims(o, f));
  return STAGES.map((stage) => {
    const rows = open.filter((o) => o.stage === stage);
    const amount = rows.reduce((s, o) => s + o.amount, 0);
    return { stage, count: rows.length, amount, weighted: amount * STAGE_PROBABILITY[stage] };
  });
}

export interface RegionRow {
  key: string;
  arr: number;
  accounts: number;
  share: number;
}

export function arrBy(f: Filters, dim: 'region' | 'segment' | 'industry'): RegionRow[] {
  const accs = filteredAccounts(f);
  const r = resolveRange(f);
  const map = new Map<string, { arr: number; accounts: number }>();
  for (const a of accs) {
    const v = arrAt(a, r.end);
    if (v <= 0) continue;
    const key = a[dim];
    const cur = map.get(key) ?? { arr: 0, accounts: 0 };
    cur.arr += v;
    cur.accounts += 1;
    map.set(key, cur);
  }
  const total = Array.from(map.values()).reduce((s, v) => s + v.arr, 0);
  return Array.from(map.entries())
    .map(([key, v]) => ({ key, arr: v.arr, accounts: v.accounts, share: total ? v.arr / total : 0 }))
    .sort((a, b) => b.arr - a.arr);
}

export interface HealthRow {
  health: Health;
  label: string;
  count: number;
  arr: number;
  share: number;
}

export const HEALTH_LABEL: Record<Health, string> = {
  healthy: 'Healthy',
  'at-risk': 'At risk',
  critical: 'Critical',
};

export function healthBreakdown(f: Filters): HealthRow[] {
  const accs = filteredAccounts(f).filter((a) => a.arr > 0);
  const total = accs.length || 1;
  return (['healthy', 'at-risk', 'critical'] as Health[]).map((h) => {
    const rows = accs.filter((a) => a.health === h);
    return {
      health: h,
      label: HEALTH_LABEL[h],
      count: rows.length,
      arr: rows.reduce((s, a) => s + a.arr, 0),
      share: rows.length / total,
    };
  });
}

const HOUR_PROFILE = [0.02, 0.01, 0.01, 0.01, 0.02, 0.05, 0.12, 0.3, 0.6, 0.85, 1.0, 0.9, 0.7, 0.8, 0.95, 0.9, 0.75, 0.5, 0.3, 0.18, 0.12, 0.08, 0.05, 0.03];
const DAY_WEIGHT = [0.95, 1.0, 1.0, 0.95, 0.8, 0.12, 0.08];
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Average active seats by weekday x hour (7 x 24). */
export function usageHeatmap(f: Filters): number[][] {
  const seats = filteredAccounts(f)
    .filter((a) => a.arr > 0)
    .reduce((s, a) => s + a.activeSeats, 0);
  return DAY_WEIGHT.map((dw, d) => HOUR_PROFILE.map((hp, h) => Math.round(seats * dw * hp * db.usageNoise[d][h] * 0.6)));
}

export interface AccountRow {
  id: string;
  name: string;
  industry: string;
  region: Region;
  segment: Segment;
  plan: Plan;
  owner: string;
  csm: string;
  arr: number;
  change90: number | null;
  health: Health;
  healthScore: number;
  seats: number;
  activeSeats: number;
  utilization: number;
  renewalDate: Date | null;
  startDate: Date;
  status: 'Active' | 'Churned';
  trend: number[];
}

export function ownerName(id: string): string {
  return db.owners.find((o) => o.id === id)?.name ?? '—';
}

export function accountRows(f: Filters, includeChurned = true): AccountRow[] {
  const accs = filteredAccounts(f).filter((a) => includeChurned || a.arr > 0);
  const asOf = AS_OF;
  const ago90 = addDays(asOf, -90);
  return accs.map((a) => {
    const prev = arrAt(a, ago90);
    const trend: number[] = [];
    for (let i = 11; i >= 0; i--) trend.push(arrAt(a, endOfMonth(addMonths(asOf, -i))));
    return {
      id: a.id,
      name: a.name,
      industry: a.industry,
      region: a.region,
      segment: a.segment,
      plan: a.plan,
      owner: ownerName(a.ownerId),
      csm: a.csm,
      arr: a.arr,
      change90: prev > 0 ? (a.arr - prev) / prev : null,
      health: a.health,
      healthScore: a.healthScore,
      seats: a.seats,
      activeSeats: a.activeSeats,
      utilization: a.seats ? a.activeSeats / a.seats : 0,
      renewalDate: a.renewalDate,
      startDate: a.startDate,
      status: a.arr > 0 ? 'Active' : 'Churned',
      trend,
    };
  });
}

export function topAccounts(f: Filters, n = 8): AccountRow[] {
  return accountRows(f, false)
    .sort((a, b) => b.arr - a.arr)
    .slice(0, n);
}

export interface RenewalRow extends AccountRow {
  daysLeft: number;
}

export function upcomingRenewals(f: Filters, withinDays = 90): RenewalRow[] {
  const limit = addDays(AS_OF, withinDays);
  return accountRows(f, false)
    .filter((a) => a.renewalDate && a.renewalDate <= limit)
    .map((a) => ({ ...a, daysLeft: diffDays(AS_OF, a.renewalDate!) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export interface QuotaRow {
  ownerId: string;
  owner: string;
  won: number;
  quota: number;
  attainment: number;
  deals: number;
}

export function quotaAttainment(f: Filters): QuotaRow[] {
  const r = resolveRange(f);
  const prorate = Math.min(1, r.days / 91);
  return db.owners
    .map((o) => {
      const won = db.opportunities.filter(
        (op) => op.ownerId === o.id && op.status === 'won' && matchesDims(op, f) && op.closeDate >= r.start && op.closeDate <= r.end,
      );
      const amount = won.reduce((s, op) => s + op.amount, 0);
      const quota = Math.round(o.quota * prorate);
      return { ownerId: o.id, owner: o.name, won: amount, quota, attainment: quota ? amount / quota : 0, deals: won.length };
    })
    .sort((a, b) => b.attainment - a.attainment);
}

export { AS_OF };
