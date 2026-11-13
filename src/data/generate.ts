import { Rng, clamp } from '@/lib/random';
import { addDays, addMonths } from '@/lib/dates';
import {
  type Account,
  type Dataset,
  type Health,
  type Industry,
  type Opportunity,
  type Owner,
  type Plan,
  type Region,
  type Segment,
  type Stage,
} from './types';

/** The demo is frozen at this date so every number is reproducible. */
export const AS_OF = new Date(2026, 10, 12);

const FIRST = [
  'Halvorsen', 'Brightline', 'Corvid', 'Meridian', 'Ostara', 'Kestrel', 'Pinecrest', 'Lumen',
  'Arcadia', 'Tessellate', 'Boreal', 'Sable', 'Veridian', 'Harbor', 'Saffron', 'Granite Peak',
  'Orbital', 'Cobalt', 'Juniper', 'Northgate', 'Silverline', 'Ironwood', 'Cascade', 'Vireo',
  'Marrow', 'Quillon', 'Alder', 'Helix', 'Stratus', 'Fathom', 'Ember', 'Tidewater',
  'Redwood', 'Oakhaven', 'Beacon', 'Larkspur', 'Summit', 'Westbrook', 'Nimbus', 'Atlas Ridge',
];
const SUFFIX: Array<[string, Industry]> = [
  ['Systems', 'Software'],
  ['Labs', 'Software'],
  ['Capital', 'Financial services'],
  ['Trust', 'Financial services'],
  ['Health', 'Healthcare'],
  ['Clinics', 'Healthcare'],
  ['Manufacturing', 'Manufacturing'],
  ['Fabrication', 'Manufacturing'],
  ['Retail Group', 'Retail'],
  ['Markets', 'Retail'],
  ['Logistics', 'Logistics'],
  ['Freight', 'Logistics'],
  ['Energy', 'Energy'],
  ['Media', 'Media'],
];

const OWNER_NAMES = [
  'Priya Raman',
  'Diego Álvarez',
  'Hannah Osei',
  'Tomasz Nowak',
  'Mei Lin',
  'Jordan Blake',
  'Amara Nwosu',
  'Lucas Moreau',
];
const CSM_NAMES = ['Sofia Petrov', 'Ethan Cole', 'Nadia Haddad', 'Ravi Menon', 'Ines Duarte'];

function healthFromScore(score: number): Health {
  if (score >= 65) return 'healthy';
  if (score >= 40) return 'at-risk';
  return 'critical';
}

export function generateDataset(seed = 20260512): Dataset {
  const rng = new Rng(seed);

  const owners: Owner[] = OWNER_NAMES.map((name, i) => ({
    id: `own-${i + 1}`,
    name,
    quota: Math.round(rng.range(450_000, 900_000) / 10_000) * 10_000,
  }));

  // Unique company names
  const combos: Array<{ name: string; industry: Industry }> = [];
  for (const f of FIRST) for (const [s, ind] of SUFFIX) combos.push({ name: `${f} ${s}`, industry: ind });
  const names = rng.shuffle(combos).slice(0, 120);

  const accounts: Account[] = names.map((n, i) => {
    const segment = rng.weighted<Segment>([
      ['Enterprise', 25],
      ['Mid-market', 40],
      ['SMB', 35],
    ]);
    const region = rng.weighted<Region>([
      ['North America', 42],
      ['EMEA', 30],
      ['APAC', 18],
      ['LATAM', 10],
    ]);
    const plan: Plan =
      segment === 'Enterprise'
        ? rng.weighted<Plan>([
            ['Premier', 70],
            ['Professional', 30],
          ])
        : segment === 'Mid-market'
          ? rng.weighted<Plan>([
              ['Professional', 60],
              ['Core', 25],
              ['Premier', 15],
            ])
          : rng.weighted<Plan>([
              ['Core', 70],
              ['Professional', 30],
            ]);

    const monthsAgo = rng.int(1, 30);
    const startDate = addDays(addMonths(AS_OF, -monthsAgo), -rng.int(0, 27));

    const base =
      segment === 'Enterprise'
        ? rng.logUniform(120_000, 900_000)
        : segment === 'Mid-market'
          ? rng.logUniform(30_000, 150_000)
          : rng.logUniform(6_000, 36_000);

    const events: Account['events'] = [{ date: startDate, type: 'new', delta: Math.round(base) }];
    let cur = Math.round(base);
    let churnedAt: Date | null = null;
    let cursor = addDays(addMonths(startDate, 3), rng.int(-15, 15));
    const churnHazard = segment === 'SMB' ? 0.05 : segment === 'Mid-market' ? 0.03 : 0.015;

    while (cursor < AS_OF) {
      const r = rng.next();
      if (r < churnHazard) {
        events.push({ date: cursor, type: 'churn', delta: -cur });
        churnedAt = cursor;
        cur = 0;
        break;
      } else if (r < churnHazard + 0.3) {
        const exp = Math.round(cur * rng.range(0.05, 0.25));
        events.push({ date: cursor, type: 'expansion', delta: exp });
        cur += exp;
      } else if (r < churnHazard + 0.3 + 0.12) {
        const con = Math.round(cur * rng.range(0.05, 0.2));
        events.push({ date: cursor, type: 'contraction', delta: -con });
        cur -= con;
      }
      cursor = addDays(addMonths(cursor, 3), rng.int(-20, 20));
    }

    // Health: baseline, nudged by recent movements
    let score = 72 + rng.gauss(0, 14);
    const recent = events.filter((e) => e.date > addMonths(AS_OF, -6));
    if (recent.some((e) => e.type === 'contraction')) score -= 18;
    if (recent.some((e) => e.type === 'expansion')) score += 8;
    score = clamp(Math.round(score), 5, 99);

    const seats =
      segment === 'Enterprise' ? rng.int(200, 3000) : segment === 'Mid-market' ? rng.int(40, 300) : rng.int(5, 40);
    const utilization = clamp(0.25 + (score / 100) * 0.7 + rng.gauss(0, 0.08), 0.1, 0.98);
    const activeSeats = Math.round(seats * utilization);

    let renewalDate: Date | null = null;
    if (!churnedAt) {
      let r = new Date(startDate);
      while (r <= AS_OF) r = addMonths(r, 12);
      renewalDate = r;
    }

    return {
      id: `acc-${String(i + 1).padStart(3, '0')}`,
      name: n.name,
      industry: n.industry,
      region,
      segment,
      plan,
      ownerId: rng.pick(owners).id,
      csm: rng.pick(CSM_NAMES),
      startDate,
      events,
      arr: cur,
      churnedAt,
      seats,
      activeSeats,
      healthScore: score,
      health: healthFromScore(score),
      renewalDate,
    };
  });

  // Opportunities
  const opportunities: Opportunity[] = [];
  const oppNames = ['Platform rollout', 'Analytics add-on', 'Seat expansion', 'Renewal uplift', 'Data warehouse sync', 'Regional expansion', 'Premier upgrade', 'Pilot conversion'];
  for (let i = 0; i < 150; i++) {
    const acct = rng.pick(accounts);
    const segment = acct.segment;
    const amount =
      segment === 'Enterprise'
        ? rng.logUniform(80_000, 600_000)
        : segment === 'Mid-market'
          ? rng.logUniform(20_000, 120_000)
          : rng.logUniform(5_000, 30_000);
    const createdAt = addDays(AS_OF, -rng.int(5, 240));
    const status = rng.weighted<Opportunity['status']>([
      ['open', 58],
      ['won', 26],
      ['lost', 16],
    ]);
    let stage: Stage;
    let closeDate: Date;
    if (status === 'open') {
      stage = rng.weighted<Stage>([
        ['Qualified', 30],
        ['Discovery', 25],
        ['Proposal', 20],
        ['Negotiation', 15],
        ['Commit', 10],
      ]);
      closeDate = addDays(AS_OF, rng.int(3, 120));
    } else {
      stage = 'Commit';
      closeDate = addDays(createdAt, rng.int(20, 110));
      if (closeDate > AS_OF) closeDate = addDays(AS_OF, -rng.int(0, 10));
    }
    opportunities.push({
      id: `opp-${String(i + 1).padStart(3, '0')}`,
      name: `${acct.name} — ${rng.pick(oppNames)}`,
      accountName: acct.name,
      region: acct.region,
      segment,
      plan: acct.plan,
      ownerId: rng.pick(owners).id,
      stage,
      amount: Math.round(amount / 500) * 500,
      createdAt,
      closeDate,
      status,
    });
  }

  const usageNoise = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 1 + rng.gauss(0, 0.09)));

  return { asOf: AS_OF, owners, accounts, opportunities, usageNoise };
}

/** Module-level singleton: generated once, shared by every widget. */
export const db: Dataset = generateDataset();
