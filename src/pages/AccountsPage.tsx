import { useWorkspace } from '@/state/WorkspaceContext';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { db } from '@/data/generate';
import workflow from '@/components/widgets/Workflow.module.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Columns3, Download, Rows3, Search, UserPlus, X } from 'lucide-react';
import { accountRows, type AccountRow } from '@/data/queries';
import { fmtCompact, fmtCurrency, fmtNumber, fmtPct, fmtSignedPct } from '@/lib/format';
import { fmtShortDate, isoDay } from '@/lib/dates';
import { useFilters } from '@/state/FiltersContext';
import { useLab } from '@/state/LabContext';
import { usePreferences } from '@/state/PreferencesContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/filters/FilterBar';
import { LegacyFilterBar } from '@/components/filters/LegacyFilterBar';
import { DataTable, type Column, type SortState } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Menu, type MenuItem } from '@/components/ui/Menu';
import { HealthBadge, Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sparkline } from '@/components/charts/Sparkline';
import { SegmentedBar } from '@/components/charts/SegmentedBar';
import { useToast } from '@/components/ui/Toast';
import s from './AccountsPage.module.css';

type StatusTab = 'all' | 'active' | 'at-risk' | 'churned';
const PAGE_SIZE = 25;

const ALL_COLUMNS = ['health', 'arr', 'change90', 'trend', 'utilization', 'region', 'segment', 'plan', 'owner', 'renewal', 'status'] as const;
type ColKey = (typeof ALL_COLUMNS)[number];
const COL_LABEL: Record<ColKey, string> = {
  health: 'Health',
  arr: 'ARR',
  change90: '90-day change',
  trend: '12-month trend',
  utilization: 'Seat utilization',
  region: 'Region',
  segment: 'Segment',
  plan: 'Plan',
  owner: 'Owner',
  renewal: 'Renewal',
  status: 'Status',
};

function toCsv(rows: AccountRow[]): string {
  const head = ['Account', 'Industry', 'Region', 'Segment', 'Plan', 'Owner', 'CSM', 'ARR', '90d change', 'Health', 'Health score', 'Seats', 'Active seats', 'Renewal', 'Status'];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.name, r.industry, r.region, r.segment, r.plan, r.owner, r.csm, r.arr, r.change90 == null ? '' : (r.change90 * 100).toFixed(1) + '%', r.health, r.healthScore, r.seats, r.activeSeats, r.renewalDate ? isoDay(r.renewalDate) : '', r.status].map(esc).join(','),
  );
  return [head.map(esc).join(','), ...lines].join('\n');
}

export function AccountsPage() {
  const { filters, reset } = useFilters();
  const { owners, assignOwner, rememberDirectory } = useWorkspace();
  const { filterVariant } = useLab();
  const { density, setDensity } = usePreferences();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const status = params.get('status');
  const tab: StatusTab = status === 'active' || status === 'at-risk' || status === 'churned' ? status : 'all';
  const sortKey = params.get('sort') ?? 'arr';
  const sort: SortState = { key: ['name', ...ALL_COLUMNS].includes(sortKey) ? sortKey : 'arr', dir: params.get('dir') === 'asc' ? 'asc' : 'desc' };
  const updateParams = (values: Record<string, string>, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (resetPage) next.delete('page');
    setParams(next, { replace: true });
    setSelected(new Set());
  };
  const setTab = (status: StatusTab) => updateParams({ status });
  const setSort = (value: SortState | null) => updateParams({ sort: value?.key ?? 'arr', dir: value?.dir ?? 'desc' });
  const setPage = (value: number) => updateParams({ page: String(value + 1) }, false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [owner, setOwner] = useState(db.owners[0].name);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<ColKey>>(new Set());
  const [colsOpen, setColsOpen] = useState(false);
  const colsBtn = useRef<HTMLButtonElement | null>(null);

  useEffect(() => { rememberDirectory('/accounts' + (params.size ? '?' + params.toString() : '')); }, [params, rememberDirectory]);
  useEffect(() => { setSelected(new Set()); }, [filters]);

  const all = useMemo(() => accountRows(filters, true).map(a => ({ ...a, owner: owners[a.id] ?? a.owner })), [filters, owners]);
  const counts = useMemo(
    () => ({
      all: all.length,
      active: all.filter((r) => r.status === 'Active').length,
      'at-risk': all.filter((r) => r.status === 'Active' && r.health !== 'healthy').length,
      churned: all.filter((r) => r.status === 'Churned').length,
    }),
    [all],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((r) => {
      if (tab === 'active' && r.status !== 'Active') return false;
      if (tab === 'churned' && r.status !== 'Churned') return false;
      if (tab === 'at-risk' && (r.status !== 'Active' || r.health === 'healthy')) return false;
      if (q && !`${r.name} ${r.industry} ${r.owner} ${r.region}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, tab, query]);



  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const requestedPage = Number(params.get('page') ?? 1);
  const page = Math.max(0, Math.min(pageCount - 1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) - 1 : 0));
  const totalArr = rows.reduce((sum, r) => sum + r.arr, 0);

  const columns: Column<AccountRow>[] = [
    {
      key: 'name',
      header: 'Account',
      sticky: true,
      minWidth: 220,
      sortValue: (r) => r.name,
      render: (r) => (
        <span className={s.accountCell}>
          <Link className={s.accountName} to={`/accounts/${r.id}`} state={{ returnTo: `/accounts?${params}`, returnLabel: 'Back to accounts' }}>{r.name} ↗</Link>
          <span className={s.accountMeta}>{r.industry}</span>
        </span>
      ),
    },
    { key: 'health', header: 'Health', sortValue: (r) => r.healthScore, numeric: true, render: (r) => (r.status === 'Churned' ? <Badge tone="neutral">Churned</Badge> : <HealthBadge health={r.health} size="sm" />) },
    { key: 'arr', header: 'ARR', align: 'right', numeric: true, sortValue: (r) => r.arr, render: (r) => fmtCurrency(r.arr) },
    {
      key: 'change90',
      header: '90d',
      headerText: '90-day change',
      align: 'right',
      numeric: true,
      sortValue: (r) => r.change90 ?? -Infinity,
      render: (r) => (r.change90 == null ? <span className={s.muted}>—</span> : <span className={r.change90 > 0 ? s.good : r.change90 < 0 ? s.bad : undefined}>{fmtSignedPct(r.change90, 1)}</span>),
    },
    { key: 'trend', header: 'Trend', headerText: '12-month trend', hideBelow: 900, render: (r) => <Sparkline data={r.trend} width={80} height={22} ariaLabel={`12-month ARR trend for ${r.name}`} /> },
    {
      key: 'utilization',
      header: 'Seats',
      headerText: 'Seat utilization',
      minWidth: 150,
      sortValue: (r) => r.utilization,
      numeric: true,
      hideBelow: 1200,
      render: (r) => (
        <span className={s.utilCell}>
          <SegmentedBar
            variant="thin"
            dense
            parts={[
              { key: 'active', label: 'Active seats', value: r.activeSeats, color: 'var(--series-1)' },
              { key: 'idle', label: 'Unused seats', value: Math.max(0, r.seats - r.activeSeats), color: 'var(--seq-150)' },
            ]}
            valueFormat={fmtNumber}
            ariaLabel={`Seat utilization for ${r.name}`}
            showLegend={false}
          />
          <span className={s.utilText}>
            {fmtPct(r.utilization, 0)} · {fmtNumber(r.activeSeats)}/{fmtNumber(r.seats)}
          </span>
        </span>
      ),
    },
    { key: 'region', header: 'Region', sortValue: (r) => r.region, hideBelow: 640, render: (r) => r.region },
    { key: 'segment', header: 'Segment', sortValue: (r) => r.segment, hideBelow: 900, render: (r) => r.segment },
    { key: 'plan', header: 'Plan', sortValue: (r) => r.plan, hideBelow: 1200, render: (r) => r.plan },
    { key: 'owner', header: 'Owner', sortValue: (r) => r.owner, hideBelow: 1200, render: (r) => r.owner },
    { key: 'renewal', header: 'Renewal', sortValue: (r) => r.renewalDate?.getTime() ?? Infinity, numeric: true, hideBelow: 900, render: (r) => (r.renewalDate ? fmtShortDate(r.renewalDate) : <span className={s.muted}>—</span>) },
    { key: 'status', header: 'Status', sortValue: (r) => r.status, hideBelow: 1200, render: (r) => r.status },
  ];
  const visibleColumns = columns.filter(c => c.key === 'name' || !hidden.has(c.key as ColKey));

  const sortedRows = [...rows].sort((a, b) => {
    const column = columns.find(c => c.key === sort?.key);
    if (!sort || !column?.sortValue) return 0;
    const left = column.sortValue(a);
    const right = column.sortValue(b);
    if (left == null) return right == null ? 0 : 1;
    if (right == null) return -1;
    return (typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))) * (sort.dir === 'asc' ? 1 : -1);
  });
  const colItems: MenuItem[] = [
    { type: 'label', key: 'lbl', label: 'Columns' },
    ...ALL_COLUMNS.map<MenuItem>((k) => ({
      key: k,
      label: COL_LABEL[k],
      checked: !hidden.has(k),
      onSelect: () =>
        setHidden((h) => {
          const next = new Set(h);
          if (next.has(k)) next.delete(k);
          else next.add(k);
          return next;
        }),
    })),
    { type: 'separator', key: 'sep' },
    { key: 'reset', label: 'Show all columns', onSelect: () => setHidden(new Set()), disabled: hidden.size === 0 },
  ];

  const exportCsv = (subset?: AccountRow[]) => {
    const data = subset ?? sortedRows;
    const blob = new Blob([toCsv(data)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vantage-accounts-${isoDay(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${data.length} accounts to CSV`);
  };

  return (
    <div className={s.page}>
      <PageHeader
        title="Accounts"
        description="Every account in the selected slice, with health, trend and seat utilization inline — no export required."
        actions={
          <>
            <Button variant="secondary" iconLeft={<Columns3 />} ref={colsBtn} onClick={() => setColsOpen((o) => !o)} aria-haspopup="menu" aria-expanded={colsOpen}>
              Columns{hidden.size > 0 && ` (${ALL_COLUMNS.length - hidden.size})`}
            </Button>
            <Menu open={colsOpen} onClose={() => setColsOpen(false)} anchorRef={colsBtn} items={colItems} ariaLabel="Column visibility" />
            <Button variant="primary" iconLeft={<Download />} onClick={() => exportCsv()}>
              Export CSV
            </Button>
          </>
        }
      />
      {filterVariant === 'B' ? <FilterBar /> : <LegacyFilterBar />}

      <div className={s.overviewStats}><article><span>Matching accounts ARR</span><strong>{fmtCurrency(totalArr)}</strong></article><article><span>Active relationships</span><strong>{counts.active}</strong></article><article><span>Needs attention</span><strong>{counts["at-risk"]}</strong></article><article><span>Explore an account</span><p>Select any account name to view its revenue, adoption and contract journey.</p></article></div><div className={s.toolbar}>
        <Tabs<StatusTab>
          ariaLabel="Account status"
          active={tab}
          onChange={setTab}
          tabs={[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'active', label: 'Active', count: counts.active },
            { id: 'at-risk', label: 'Needs attention', count: counts['at-risk'] },
            { id: 'churned', label: 'Churned', count: counts.churned },
          ]}
        />
        <div className={s.toolbarRight}>
          <label className={s.search}>
            <Search size={14} aria-hidden />
            <input
              className={s.searchInput}
              value={query}
              onChange={(e) => {
                updateParams({ q: e.target.value });
              }}
              placeholder="Search name, industry, owner…"
              aria-label="Search accounts"
            />
            {query && (
              <button type="button" className={s.clear} aria-label="Clear search" onClick={() => updateParams({ q: '' })}>
                <X size={12} />
              </button>
            )}
          </label>
          <SegmentedControl
            ariaLabel="Row density"
            size="sm"
            value={density}
            onChange={setDensity}
            options={[
              { value: 'comfortable', label: 'Comfortable', icon: <Rows3 />, iconOnly: true },
              { value: 'compact', label: 'Compact', icon: <Columns3 style={{ transform: 'rotate(90deg)' }} />, iconOnly: true },
            ]}
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className={s.bulk} role="region" aria-label="Bulk actions">
          <strong>{selected.size} selected</strong>
          <Button size="sm" variant="secondary" iconLeft={<UserPlus />} onClick={() => setAssignOpen(true)}>
            Assign owner
          </Button>
          <Button size="sm" variant="secondary" iconLeft={<Download />} onClick={() => exportCsv(all.filter((r) => selected.has(r.id)))}>
            Export selected
          </Button>
          <Button size="sm" variant="ghost" iconLeft={<X />} onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title={`Assign ${selected.size} accounts`} description="Update the owner in your local workspace. No notification is sent.">
        <form className={workflow.form} onSubmit={e => { e.preventDefault(); if (!selected.size) return; assignOwner([...selected], owner); toast(`Assigned ${selected.size} accounts to ${owner}`); setAssignOpen(false); setSelected(new Set()); }}>
          <label>Account owner<select data-autofocus value={owner} onChange={e => setOwner(e.target.value)}>{db.owners.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}</select></label>
          <div className={workflow.formActions}><Button onClick={() => setAssignOpen(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={!selected.size}>Assign owner</Button></div>
        </form>
      </Modal>
      <div className={s.tableCard}>
        <DataTable
          columns={visibleColumns}
          rows={sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
          rowKey={(r) => r.id}
          caption="Accounts"
          sort={sort}
          onSortChange={setSort}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          density={density}
          maxHeight="640px"
          emptyState={<EmptyState icon={<Search />} title="No accounts match this view" description="Try another search or reset your filters to see the full portfolio." action={<Button onClick={() => { reset(); setParams({}); }}>Reset account view</Button>} />}
        />
        <div className={s.pagination}>
          <span className={s.summary}>
            {rows.length === 0 ? 'No accounts' : `${page * PAGE_SIZE + 1}–${Math.min(rows.length, (page + 1) * PAGE_SIZE)} of ${fmtNumber(rows.length)} accounts`} · {fmtCompact(totalArr, { currency: true })} ARR
          </span>
          <div className={s.pager}>
            <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className={s.pageNo}>
              Page {page + 1} of {pageCount}
            </span>
            <Button size="sm" variant="ghost" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


