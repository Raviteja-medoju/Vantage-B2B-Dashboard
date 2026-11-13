export type Region = 'North America' | 'EMEA' | 'APAC' | 'LATAM';
export type Segment = 'Enterprise' | 'Mid-market' | 'SMB';
export type Plan = 'Core' | 'Professional' | 'Premier';
export type Industry =
  | 'Software'
  | 'Financial services'
  | 'Healthcare'
  | 'Manufacturing'
  | 'Retail'
  | 'Logistics'
  | 'Energy'
  | 'Media';
export type Health = 'healthy' | 'at-risk' | 'critical';
export type MovementType = 'new' | 'expansion' | 'contraction' | 'churn';
export type Stage = 'Qualified' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Commit';
export type OppStatus = 'open' | 'won' | 'lost';

export const REGIONS: Region[] = ['North America', 'EMEA', 'APAC', 'LATAM'];
export const SEGMENTS: Segment[] = ['Enterprise', 'Mid-market', 'SMB'];
export const PLANS: Plan[] = ['Core', 'Professional', 'Premier'];
export const STAGES: Stage[] = ['Qualified', 'Discovery', 'Proposal', 'Negotiation', 'Commit'];
export const STAGE_PROBABILITY: Record<Stage, number> = {
  Qualified: 0.1,
  Discovery: 0.2,
  Proposal: 0.4,
  Negotiation: 0.6,
  Commit: 0.85,
};

export interface ArrEvent {
  date: Date;
  type: MovementType;
  delta: number;
}

export interface Owner {
  id: string;
  name: string;
  /** Quarterly new-business quota in $ */
  quota: number;
}

export interface Account {
  id: string;
  name: string;
  region: Region;
  segment: Segment;
  plan: Plan;
  industry: Industry;
  ownerId: string;
  csm: string;
  startDate: Date;
  events: ArrEvent[];
  /** Current ARR (0 if churned) */
  arr: number;
  churnedAt: Date | null;
  seats: number;
  activeSeats: number;
  healthScore: number;
  health: Health;
  renewalDate: Date | null;
}

export interface Opportunity {
  id: string;
  name: string;
  accountName: string;
  region: Region;
  segment: Segment;
  plan: Plan;
  ownerId: string;
  stage: Stage;
  amount: number;
  createdAt: Date;
  closeDate: Date;
  status: OppStatus;
}

export interface Dataset {
  asOf: Date;
  owners: Owner[];
  accounts: Account[];
  opportunities: Opportunity[];
  /** 7 x 24 noise matrix used to texture the usage heatmap */
  usageNoise: number[][];
}
