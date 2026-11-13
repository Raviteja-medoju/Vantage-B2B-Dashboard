import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, History } from 'lucide-react';
import { accountRows, DEFAULT_FILTERS } from '@/data/queries';
import { fmtShortDate } from '@/lib/dates';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import s from './LegacyPage.module.css';

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const ANNOTATIONS = [
  { n: 1, title: '23 columns, one weight', body: 'Every value in the same 11px type. Nothing is a headline, so users scanned the whole grid to find anything.' },
  { n: 2, title: 'Filters run as a batch', body: 'Eight dropdowns and a “Run report” button. Changing one value meant re-running and losing scroll position.' },
  { n: 3, title: 'No trend, no comparison', body: 'Change over time only existed by exporting to a spreadsheet. 71% of analysts did exactly that every week.' },
  { n: 4, title: 'Health hidden in a number', body: 'A 0–100 score with no threshold, icon or colour — “at risk” required knowing the number by heart.' },
];

export function LegacyPage() {
  const [annotate, setAnnotate] = useState(true);
  const navigate = useNavigate();
  const rows = useMemo(() => accountRows(DEFAULT_FILTERS, true).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 25), []);
  const total = rows.reduce((sum, r) => sum + r.arr, 0);

  return (
    <div className={s.page}>
      <PageHeader
        eyebrow="Before · 2023"
        title="Legacy view"
        description="The report users were given before the redesign, kept here for comparison. Toggle the annotations to see what the research flagged."
        actions={
          <>
            <Switch checked={annotate} onChange={setAnnotate} label="Show annotations" size="sm" />
            <Button variant="primary" iconRight={<ArrowRight />} onClick={() => navigate('/')}>
              Open the redesign
            </Button>
          </>
        }
      />

      <div className={s.compareBar}>
        <History size={14} aria-hidden />
        <span>
          Same 120 accounts, same data. See the redesigned <Link to="/">Overview</Link> or read the <Link to="/case-study">case study</Link>.
        </span>
      </div>

      <div className={s.legacyRoot} data-annotate={annotate || undefined}>
        <div className={s.legacyToolbar}>
          <span className={s.legacyTitle}>Report: Account Revenue Detail (ARD-04)</span>
          <span className={s.legacySpacer} />
          <button type="button" className={s.legacyBtn}>
            Export to Excel
          </button>
          <button type="button" className={s.legacyBtn}>
            Print
          </button>
          <button type="button" className={s.legacyBtn}>
            Refresh
          </button>
          {annotate && <Marker n={1} className={s.m1} />}
        </div>

        <div className={s.legacyBody}>
          <aside className={s.legacyFilters} aria-label="Report parameters (legacy)">
            <div className={s.legacyFiltersTitle}>Parameters</div>
            {['Fiscal period', 'Region', 'Sub-region', 'Segment', 'Plan type', 'Account owner', 'Industry', 'Status'].map((f) => (
              <label key={f} className={s.legacyField}>
                <span>{f}:</span>
                <select className={s.legacySelect} defaultValue="all">
                  <option value="all">(All)</option>
                </select>
              </label>
            ))}
            <label className={s.legacyField}>
              <span>Min. ARR:</span>
              <input className={s.legacyInput} defaultValue="0.00" />
            </label>
            <button type="button" className={`${s.legacyBtn} ${s.legacyRun}`}>
              Run report
            </button>
            {annotate && <Marker n={2} className={s.m2} />}
          </aside>

          <div className={s.legacyTableWrap}>
            <table className={s.legacyTable}>
              <thead>
                <tr>
                  {['Acct ID', 'Account Name', 'Industry', 'Region', 'Segment', 'Plan', 'Owner', 'CSM', 'Start Dt', 'Renewal Dt', 'ARR (USD)', 'Prev ARR', 'Var %', 'MRR', 'Seats', 'Active', 'Util %', 'Health Sc.', 'Status', 'Last Login', 'Contract #', 'Terms', 'Notes'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const prev = r.change90 == null ? r.arr : r.arr / (1 + r.change90);
                  return (
                    <tr key={r.id}>
                      <td>{r.id.toUpperCase()}</td>
                      <td className={s.legacyName}>{r.name}</td>
                      <td>{r.industry}</td>
                      <td>{r.region}</td>
                      <td>{r.segment}</td>
                      <td>{r.plan}</td>
                      <td>{r.owner}</td>
                      <td>{r.csm}</td>
                      <td>{r.startDate.toLocaleDateString('en-US')}</td>
                      <td>{r.renewalDate ? r.renewalDate.toLocaleDateString('en-US') : 'N/A'}</td>
                      <td className={s.num}>{money(r.arr)}</td>
                      <td className={s.num}>{money(prev)}</td>
                      <td className={s.num}>{r.change90 == null ? '0.00' : (r.change90 * 100).toFixed(2)}</td>
                      <td className={s.num}>{money(r.arr / 12)}</td>
                      <td className={s.num}>{r.seats}</td>
                      <td className={s.num}>{r.activeSeats}</td>
                      <td className={s.num}>{(r.utilization * 100).toFixed(1)}</td>
                      <td className={s.num}>{r.healthScore}</td>
                      <td>{r.status.toUpperCase()}</td>
                      <td>{fmtShortDate(new Date(2026, 10, 12 - (i % 9)))}</td>
                      <td>CT-{(48210 + i * 37).toString()}</td>
                      <td>Net 30</td>
                      <td />
                    </tr>
                  );
                })}
                <tr className={s.legacyTotal}>
                  <td colSpan={10}>TOTAL (page)</td>
                  <td className={s.num}>{money(total)}</td>
                  <td colSpan={12} />
                </tr>
              </tbody>
            </table>
            {annotate && <Marker n={3} className={s.m3} />}
            {annotate && <Marker n={4} className={s.m4} />}
          </div>
        </div>

        <div className={s.legacyFooter}>
          <span>Page 1 of 5 | Rows per page: 25 | 120 records</span>
          <span>Last refreshed: 11/12/2026 06:14:33 AM | Source: DW_PROD.FACT_ARR_DAILY</span>
        </div>
      </div>

      {annotate && (
        <ol className={s.annotations} aria-label="Research annotations">
          {ANNOTATIONS.map((a) => (
            <li key={a.n} className={s.annotation}>
              <span className={s.annotationNo}>{a.n}</span>
              <div>
                <div className={s.annotationTitle}>{a.title}</div>
                <p className={s.annotationBody}>{a.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Marker({ n, className }: { n: number; className?: string }) {
  return (
    <span className={`${s.marker} ${className ?? ''}`} aria-hidden>
      {n}
    </span>
  );
}
