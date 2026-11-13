/**
 * Research & outcome data behind the case study.
 * Figures are illustrative and align with the project's reported outcomes:
 *   −30% task time · −25% design QA tickets · +22% daily filter adoption.
 */

export interface TaskTiming {
  task: string;
  before: number; // seconds, median
  after: number;
}

/** Median time-on-task (seconds), n = 14 participants per round. */
export const TASK_TIMINGS: TaskTiming[] = [
  { task: 'Find EMEA accounts at risk of churn', before: 94, after: 52 },
  { task: 'Compare this quarter’s ARR with last', before: 71, after: 46 },
  { task: 'Identify the stage where pipeline stalls', before: 58, after: 47 },
  { task: 'Assemble a view for the weekly review', before: 142, after: 98 },
  { task: 'Check a rep’s quota attainment', before: 49, after: 38 },
  { task: 'Export a filtered account list', before: 33, after: 31 },
];

export const taskTimeReduction = (() => {
  const before = TASK_TIMINGS.reduce((s, t) => s + t.before, 0);
  const after = TASK_TIMINGS.reduce((s, t) => s + t.after, 0);
  return 1 - after / before;
})();

/** Design-related QA tickets per two-week sprint, before and after Storybook adoption. */
export const QA_TICKETS = {
  before: [14, 11, 16, 12, 13, 15, 10, 13],
  after: [11, 10, 9, 10, 9, 8, 10, 11],
};

export const qaReduction = (() => {
  const b = QA_TICKETS.before.reduce((s, v) => s + v, 0);
  const a = QA_TICKETS.after.reduce((s, v) => s + v, 0);
  return 1 - a / b;
})();

/** Daily share of active users who applied at least one filter, over the 28-day A/B test. */
export const ADOPTION_AB: Array<{ day: number; A: number; B: number }> = Array.from({ length: 28 }, (_, i) => {
  const day = i + 1;
  const wobble = Math.sin(day * 1.7) * 0.012 + Math.cos(day * 0.9) * 0.008;
  const weekend = day % 7 === 6 || day % 7 === 0 ? -0.02 : 0;
  const rampB = Math.min(1, day / 6);
  return {
    day,
    A: +(0.341 + wobble + weekend).toFixed(3),
    B: +(0.341 + 0.075 * rampB + wobble * 1.1 + weekend).toFixed(3),
  };
});

export const AB_SUMMARY = {
  users: 2340,
  days: 28,
  variantA: 0.341,
  variantB: 0.416,
  lift: 0.416 / 0.341 - 1, // ≈ +22%
  pValue: 0.004,
  clicksToApplyA: 4.2,
  clicksToApplyB: 1.3,
  abandonA: 0.61,
  abandonB: 0.18,
};

export const RESEARCH = {
  interviews: 14,
  baselineSessions: 6,
  heatmapSessions: 11_200,
  personas: [
    {
      name: 'RevOps analyst',
      share: 'Daily',
      goal: 'Reconcile pipeline and ARR before the Monday forecast call.',
      pain: 'Exports 3 tables to a spreadsheet just to see the trend.',
    },
    {
      name: 'Customer success manager',
      share: 'Daily',
      goal: 'Catch accounts drifting toward churn before renewal.',
      pain: 'Health lives in one tab, usage in another, renewals in a third.',
    },
    {
      name: 'VP of Sales',
      share: 'Weekly',
      goal: 'Glanceable answer to “are we on track this quarter?”',
      pain: 'Asks an analyst to build the view instead of opening the product.',
    },
  ],
  quotes: [
    { text: 'I don’t read the dashboard. I export it and build the chart myself.', who: 'RevOps analyst, 6 yrs' },
    { text: 'The filter screen feels like filling in a tax form.', who: 'CSM, mid-market book' },
    { text: 'Every Monday I ask someone to screenshot the numbers for me.', who: 'VP Sales, EMEA' },
  ],
};

/** Heat-map hotspots (normalized to the element with data-heat="<id>"), per filter variant. */
export interface HeatSpot {
  target: string;
  /** 0..1 within the target's box */
  x: number;
  y: number;
  /** relative intensity 0..1 */
  weight: number;
  /** radius in px */
  r: number;
}

export const HEAT_SPOTS: Record<'A' | 'B', HeatSpot[]> = {
  A: [
    { target: 'filters-button', x: 0.5, y: 0.5, weight: 1, r: 48 },
    { target: 'filters-button', x: 0.3, y: 0.6, weight: 0.7, r: 36 },
    { target: 'page-title', x: 0.4, y: 0.5, weight: 0.25, r: 50 },
    { target: 'kpis', x: 0.1, y: 0.5, weight: 0.45, r: 60 },
    { target: 'kpis', x: 0.32, y: 0.5, weight: 0.3, r: 50 },
    { target: 'widget-revenueTrend', x: 0.85, y: 0.15, weight: 0.5, r: 40 },
    { target: 'widget-revenueTrend', x: 0.5, y: 0.6, weight: 0.3, r: 70 },
    { target: 'widget-pipeline', x: 0.2, y: 0.4, weight: 0.3, r: 45 },
    { target: 'topbar-search', x: 0.5, y: 0.5, weight: 0.4, r: 40 },
  ],
  B: [
    { target: 'filter-date', x: 0.5, y: 0.5, weight: 0.8, r: 44 },
    { target: 'filter-region', x: 0.5, y: 0.5, weight: 0.65, r: 40 },
    { target: 'filter-segment', x: 0.5, y: 0.5, weight: 0.5, r: 38 },
    { target: 'filter-chips', x: 0.2, y: 0.5, weight: 0.55, r: 42 },
    { target: 'filter-save', x: 0.5, y: 0.5, weight: 0.35, r: 34 },
    { target: 'kpis', x: 0.1, y: 0.5, weight: 0.5, r: 60 },
    { target: 'kpis', x: 0.52, y: 0.5, weight: 0.35, r: 50 },
    { target: 'widget-revenueTrend', x: 0.6, y: 0.55, weight: 0.45, r: 80 },
    { target: 'widget-health', x: 0.5, y: 0.5, weight: 0.4, r: 50 },
    { target: 'widget-topAccounts', x: 0.3, y: 0.3, weight: 0.3, r: 50 },
  ],
};

export const PROJECT_META = {
  product: 'Vantage — Revenue Intelligence',
  role: 'Lead Product Designer (UI/UX)',
  timeline: 'Jan – Aug 2025 · 8 months',
  team: '1 PM · 4 front-end engineers · 1 data engineer · part-time researcher',
  tools: 'Figma · Storybook · Maze · session heat maps · Looker (baseline)',
};
