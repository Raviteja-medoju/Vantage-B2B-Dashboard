import type { ComponentType } from 'react';
import type { WidgetId, WidgetSize } from '@/state/LayoutContext';
import { KpiRow } from './KpiRow';
import { RevenueTrend } from './RevenueTrend';
import { ArrMovement } from './ArrMovement';
import { PipelineByStage } from './PipelineByStage';
import { ArrByRegion } from './ArrByRegion';
import { AccountHealth } from './AccountHealth';
import { UsageHeatmap } from './UsageHeatmap';
import { TopAccounts } from './TopAccounts';
import { Renewals } from './Renewals';
import { QuotaAttainment } from './QuotaAttainment';

export interface WidgetProps {
  size: WidgetSize;
  tableView: boolean;
}

export type WidgetCategory = 'Revenue' | 'Customers' | 'Pipeline' | 'Product';

export interface WidgetDef {
  id: WidgetId;
  title: string;
  description: string;
  category: WidgetCategory;
  component: ComponentType<WidgetProps>;
  allowedSizes: WidgetSize[];
  hasTableView: boolean;
  /** Body without padding (tables) */
  flush?: boolean;
  /** Subtitle template; `{range}` is replaced by the resolved range label */
  subtitle?: string;
}

export const WIDGETS: WidgetDef[] = [
  { id: 'kpis', title: 'Key metrics', description: 'Headline figures with change versus the previous period of equal length.', category: 'Revenue', component: KpiRow, allowedSizes: ['xl'], hasTableView: false, flush: true, subtitle: '{range}' },
  { id: 'revenueTrend', title: 'ARR trend', description: 'Annual recurring revenue at the end of each period; previous period shown in grey when comparison is on.', category: 'Revenue', component: RevenueTrend, allowedSizes: ['md', 'lg', 'xl'], hasTableView: true, subtitle: '{range}' },
  { id: 'arrMovement', title: 'Net ARR movement', description: 'New and expansion ARR above the baseline, contraction and churn below. The label is the net of the last period.', category: 'Revenue', component: ArrMovement, allowedSizes: ['md', 'lg', 'xl'], hasTableView: true, subtitle: '{range}' },
  { id: 'pipeline', title: 'Pipeline by stage', description: 'Open opportunity value by sales stage. Snapshot as of today, scoped by region, segment and plan.', category: 'Pipeline', component: PipelineByStage, allowedSizes: ['sm', 'md', 'lg'], hasTableView: true, subtitle: 'Open deals · snapshot' },
  { id: 'arrByRegion', title: 'ARR breakdown', description: 'Ranked share of ARR by region, segment or industry at the end of the period.', category: 'Revenue', component: ArrByRegion, allowedSizes: ['sm', 'md', 'lg'], hasTableView: true, subtitle: 'End of period' },
  { id: 'health', title: 'Account health', description: 'Active accounts by health score band. Status always pairs an icon with its label.', category: 'Customers', component: AccountHealth, allowedSizes: ['sm', 'md'], hasTableView: true, subtitle: 'Active accounts' },
  { id: 'usage', title: 'Product usage', description: 'Average active seats by weekday and hour of day, in account-local time.', category: 'Product', component: UsageHeatmap, allowedSizes: ['md', 'lg', 'xl'], hasTableView: true, subtitle: 'Average active seats · {range}' },
  { id: 'topAccounts', title: 'Top accounts', description: 'Largest active accounts by ARR with 90-day change and 12-month trend.', category: 'Customers', component: TopAccounts, allowedSizes: ['md', 'lg', 'xl'], hasTableView: false, flush: true, subtitle: 'By ARR' },
  { id: 'renewals', title: 'Upcoming renewals', description: 'Active accounts renewing in the next 90 days, soonest first.', category: 'Customers', component: Renewals, allowedSizes: ['sm', 'md'], hasTableView: false, subtitle: 'Next 90 days' },
  { id: 'quota', title: 'Quota attainment', description: 'Closed-won value against each account executive’s quota, prorated to the selected period.', category: 'Pipeline', component: QuotaAttainment, allowedSizes: ['md', 'lg'], hasTableView: true, subtitle: '{range}' },
];

export const WIDGET_BY_ID: Record<WidgetId, WidgetDef> = Object.fromEntries(WIDGETS.map((w) => [w.id, w])) as Record<WidgetId, WidgetDef>;
