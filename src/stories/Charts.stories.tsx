import type { Meta, StoryObj } from '@storybook/react-vite';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { HBarChart } from '@/components/charts/HBarChart';
import { Heatmap } from '@/components/charts/Heatmap';
import { SegmentedBar } from '@/components/charts/SegmentedBar';
import { Meter } from '@/components/charts/Meter';
import { Sparkline } from '@/components/charts/Sparkline';
import { Dumbbell } from '@/components/charts/Dumbbell';
import { ChartTable } from '@/components/charts/ChartTable';
import { DEFAULT_FILTERS, pipelineByStage, revenueTrend, usageHeatmap, WEEKDAYS, arrBy } from '@/data/queries';
import { TASK_TIMINGS, ADOPTION_AB } from '@/data/caseStudy';
import { axisTick, fmtCompact, fmtCurrency, fmtNumber, fmtPct, fmtSeconds, fmtSignedCompact } from '@/lib/format';
import { withSurface } from './decorators';

const meta = {
  title: 'Charts/Primitives',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withSurface(680)],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const trend = revenueTrend({ ...DEFAULT_FILTERS, range: '12m' });
const maxArr = Math.max(...trend.current.map((p) => p.arr), ...trend.previous.map((p) => p.arr));

/** Single series: area wash at 10%, zoomed baseline with headroom, end marker with a surface ring, value at the line end. */
export const LineSingle: Story = {
  render: () => <LineChart data={trend.current.map((p) => ({ label: p.label, arr: p.arr }))} series={[{ key: 'arr', label: 'ARR', color: 'var(--series-1)' }]} area yFormat={axisTick(maxArr, true)} valueFormat={(v) => fmtCompact(v, { currency: true, digits: 2 })} ariaLabel="ARR trend, last 12 months" />,
};

/** Two series: the previous period is de-emphasised context (muted grey), the legend appears automatically, crosshair reads both. */
export const LineWithComparison: Story = {
  render: () => (
    <LineChart
      data={trend.current.map((p, i) => ({ label: p.label, arr: p.arr, prev: trend.previous[i]?.arr ?? null }))}
      series={[
        { key: 'arr', label: 'ARR', color: 'var(--series-1)' },
        { key: 'prev', label: 'Previous period', color: 'var(--series-muted)', muted: true },
      ]}
      yFormat={axisTick(maxArr, true)}
      valueFormat={(v) => fmtCompact(v, { currency: true, digits: 2 })}
      ariaLabel="ARR trend with previous period"
    />
  ),
};

/** Categorical series in fixed slot order: identity is the subject, so colour is categorical and a legend is always present. */
export const LineCategorical: Story = {
  render: () => (
    <LineChart
      data={ADOPTION_AB.map((d) => ({ label: `Day ${d.day}`, A: d.A, B: d.B }))}
      series={[
        { key: 'B', label: 'Variant B · inline panel', color: 'var(--series-1)' },
        { key: 'A', label: 'Variant A · legacy modal', color: 'var(--series-2)' },
      ]}
      yFormat={(v) => `${Math.round(v * 100)}%`}
      valueFormat={(v) => fmtPct(v, 1)}
      ariaLabel="Daily filter adoption by variant"
      xTickCount={7}
    />
  ),
};

const movement = trend.current.map((p) => ({ label: p.label, new: p.new, expansion: p.expansion, contraction: p.contraction, churn: p.churn }));
const maxAbs = Math.max(...trend.current.map((p) => Math.max(p.new + p.expansion, -(p.contraction + p.churn))));

/** Diverging stack: gains above the baseline in blue, losses below in red; 2px surface gaps between segments; rounded data ends only. */
export const BarDivergingStack: Story = {
  render: () => (
    <BarChart
      data={movement}
      series={[
        { key: 'new', label: 'New', color: 'var(--div-pos)' },
        { key: 'expansion', label: 'Expansion', color: 'var(--div-pos-soft)' },
        { key: 'contraction', label: 'Contraction', color: 'var(--div-neg-soft)' },
        { key: 'churn', label: 'Churn', color: 'var(--div-neg)' },
      ]}
      yFormat={axisTick(maxAbs, true)}
      valueFormat={(v) => fmtSignedCompact(v, true)}
      labelLast
      ariaLabel="Net ARR movement by month"
    />
  ),
};

/** Grouped bars, before → after in one hue, two shades. */
export const BarGrouped: Story = {
  render: () => (
    <BarChart
      data={[14, 11, 16, 12, 13, 15, 10, 13].map((v, i) => ({ label: `S${i + 1}`, before: v, after: [11, 10, 9, 10, 9, 8, 10, 11][i] }))}
      series={[
        { key: 'before', label: 'Before Storybook', color: 'var(--seq-250)' },
        { key: 'after', label: 'After Storybook', color: 'var(--seq-550)' },
      ]}
      mode="grouped"
      height={220}
      ariaLabel="QA tickets per sprint"
    />
  ),
};

/** Ranked horizontal bars: one hue, one baseline, value at the tip. */
export const HBarRanked: Story = {
  render: () => <HBarChart data={arrBy(DEFAULT_FILTERS, 'region').map((r) => ({ key: r.key, label: r.key, value: r.arr, sublabel: `${r.accounts} accounts · ${fmtPct(r.share, 0)}` }))} valueFormat={(v) => fmtCompact(v, { currency: true })} ariaLabel="ARR by region" />,
};

/** Ordered stages use the validated ordinal ramp — never a rainbow. */
export const HBarOrdinal: Story = {
  render: () => <HBarChart data={pipelineByStage(DEFAULT_FILTERS).map((r) => ({ key: r.stage, label: r.stage, value: r.amount, sublabel: `${r.count} deals` }))} colorMode="ordinal" valueFormat={(v) => fmtCompact(v, { currency: true })} ariaLabel="Pipeline by stage" />,
};

const HOURS = Array.from({ length: 24 }, (_, h) => (h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`));

/** Sequential, one hue, seven bins, zero recedes to the surface; each cell is its own hover target with a scale legend. */
export const HeatmapStory: Story = {
  name: 'Heatmap',
  render: () => <Heatmap rows={WEEKDAYS} cols={HOURS} values={usageHeatmap(DEFAULT_FILTERS)} valueFormat={fmtNumber} unit="active seats" ariaLabel="Active seats by weekday and hour" />,
};

/** Tall: 28px blocks, 4px corners, share printed inside where it fits, legend of names only. Thin: 8px, no text. */
export const SegmentedBars: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SegmentedBar
        parts={[
          { key: 'healthy', label: 'Healthy', value: 71, color: 'var(--color-good)' },
          { key: 'risk', label: 'At risk', value: 24, color: 'var(--color-warning)', ink: '#0b0b0b' },
          { key: 'critical', label: 'Critical', value: 11, color: 'var(--color-critical)' },
        ]}
        valueFormat={(v) => `${v} accounts`}
        ariaLabel="Account health"
      />
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px', gap: 12, alignItems: 'center', fontSize: 13 }}>
        <span>Seat utilization</span>
        <SegmentedBar
          variant="thin"
          parts={[
            { key: 'active', label: 'Active seats', value: 1840, color: 'var(--series-1)' },
            { key: 'idle', label: 'Unused seats', value: 760, color: 'var(--seq-150)' },
          ]}
          valueFormat={fmtNumber}
          ariaLabel="Seat utilization"
          showLegend={false}
        />
        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>71% · 1,840/2,600</span>
      </div>
    </div>
  ),
};

/** The fill carries severity; the unfilled track is a lighter step of the same ramp. */
export const Meters: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Meter value={1.12} label="Priya Raman quota attainment" />
      <Meter value={0.93} label="Diego Álvarez quota attainment" />
      <Meter value={0.71} label="Hannah Osei quota attainment" />
      <Meter value={0.38} label="Tomasz Nowak quota attainment" />
    </div>
  ),
};

/** De-emphasis hue for history, the current period in the accent, end dot with a surface ring. */
export const Sparklines: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Sparkline data={[11.2, 11.4, 11.9, 12.1, 12.0, 12.6, 12.9, 13.1, 13.4, 13.8, 14.0, 14.2]} ariaLabel="ARR trend" />
      <Sparkline data={[3, 5, 4, 6, 7, 5, 4, 6, 5, 4, 3, 4]} ariaLabel="Net new ARR trend" />
      <Sparkline data={[40, 38, 36, 35, 33, 31, 30, 29, 29, 28, 27, 26]} ariaLabel="Churn trend" />
    </div>
  ),
};

/** Before → after per item, one hue two shades; the connector shows how far each task moved. */
export const DumbbellStory: Story = {
  name: 'Dumbbell',
  render: () => <Dumbbell data={TASK_TIMINGS.map((t) => ({ key: t.task, label: t.task, before: t.before, after: t.after }))} valueFormat={fmtSeconds} beforeLabel="Legacy report" afterLabel="Redesign" ariaLabel="Task time before and after" />,
};

/** Every chart's WCAG-clean twin. */
export const TableTwin: Story = {
  render: () => <ChartTable caption="Pipeline by stage" columns={['Stage', 'Deals', 'Amount', 'Weighted']} rows={pipelineByStage(DEFAULT_FILTERS).map((r) => [r.stage, r.count, fmtCurrency(r.amount), fmtCurrency(Math.round(r.weighted))])} />,
};
