import { useWorkspace } from '@/state/WorkspaceContext';
import { AccountActions } from '@/components/widgets/AccountActions';
import { useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Building2, X } from 'lucide-react';
import { AS_OF } from '@/data/queries';
import { db } from '@/data/generate';
import { fmtCurrency, fmtPct } from '@/lib/format';
import { fmtShortDate, fmtLongDate } from '@/lib/dates';
import { HealthBadge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { LineChart } from '@/components/charts/LineChart';
import { Meter } from '@/components/charts/Meter';
import s from './AccountDetailPage.module.css';


type View = 'overview' | 'adoption' | 'activity';
export function AccountDetailPage() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { accounts, recent, visit, closeRecent, directoryUrl } = useWorkspace();
  const location = useLocation();
  const returnTo = typeof location.state?.returnTo === 'string' && /^\/($|accounts(?:\?|$)|work(?:\?|$))/.test(location.state.returnTo) ? location.state.returnTo : directoryUrl;
  const returnLabel = location.state?.returnLabel ?? 'Back to accounts';
  const [params, setParams] = useSearchParams();
  const rawView = params.get('view');
  const view: View = rawView === 'adoption' || rawView === 'activity' ? rawView : 'overview';
  const setView = (value: View) => { const next = new URLSearchParams(params); next.set('view', value); setParams(next, { replace: true }); };
  const rawMonths = Number(params.get('months') ?? 12);
  const months = [3, 6, 12].includes(rawMonths) ? rawMonths : 12;
  const setMonths = (value: number) => { const next = new URLSearchParams(params); next.set('months', String(value)); setParams(next, { replace: true }); };
  useEffect(() => { if (accountId && accounts.some(a => a.id === accountId)) visit(accountId); }, [accountId, visit]);
  const openAccounts = [...new Set([...(accountId ? [accountId] : []), ...recent])].map(id => accounts.find(a => a.id === id)).filter((a): a is typeof accounts[number] => !!a);
  const tabsRef = useRef<HTMLElement | null>(null);
  useEffect(() => { const tab = tabsRef.current?.querySelector<HTMLElement>('[aria-current=page]'); if (tab && tabsRef.current) tabsRef.current.scrollLeft = Math.max(0, tab.offsetLeft - tabsRef.current.offsetLeft - 32); }, [accountId]);
  const account = accounts.find(a => a.id === accountId);
  if (!account) return <div className={s.page}><h1>Account not found</h1><Link to="/accounts">Return to accounts</Link></div>;
  const source = db.accounts.find(a => a.id === account.id)!;
  const trend = account.trend.map((value, i) => ({ label: new Date(AS_OF.getFullYear(), AS_OF.getMonth() - 11 + i, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), arr: value })).slice(-months);
  return <div className={s.page}>
    <div className={s.breadcrumb}><Link to={returnTo}><ArrowLeft size={15}/> {returnLabel}</Link><span>/</span><span>{account.name}</span></div>
    <nav ref={tabsRef} className={s.accountTabs} aria-label="Open account workspaces"><span className={s.openLabel}>RECENT</span>{openAccounts.map(a => <span className={s.openTab} key={a.id} data-active={a.id === account.id}><Link to={`/accounts/${a.id}`} state={{ returnTo, returnLabel }} aria-current={a.id === account.id ? 'page' : undefined}>{a.name}</Link><button type="button" aria-label={`Close ${a.name} tab`} onClick={() => { closeRecent(a.id); if (a.id === account.id) { const next = openAccounts.find(other => other.id !== a.id); navigate(next ? `/accounts/${next.id}` : returnTo, { state: { returnTo, returnLabel } }); } }}><X size={12} /></button></span>)}</nav><header className={s.hero}>
      <div className={s.identity}><div className={s.logo}><Building2 size={28}/></div><div><p className={s.eyebrow}>ACCOUNT WORKSPACE</p><h1>{account.name}</h1><p>{account.industry} · {account.region} · {account.segment}</p></div></div>
      <label className={s.switcher}>Switch account<select aria-label="Switch account" value={account.id} onChange={e => { navigate(`/accounts/${e.target.value}`, { state: { returnTo, returnLabel } }); }}>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
      <a className={s.nextStep} href="#account-action-plan" onClick={e => { e.preventDefault(); document.getElementById('account-action-plan')?.focus(); }}>Plan next step <ArrowUpRight size={15} /></a><div className={s.heroBottom}><span>{account.status === 'Active' ? <HealthBadge health={account.health}/> : 'Churned'} · {account.plan} plan</span><span>Customer since {fmtLongDate(account.startDate)} · Snapshot {fmtShortDate(AS_OF)}</span></div>
    </header>
    <div className={s.stats}>{[
      ['Annual recurring revenue', fmtCurrency(account.arr), 'Current contract value'],
      ['Account health', `${account.healthScore}/100`, account.status === 'Churned' ? 'Account closed' : account.health === 'healthy' ? 'Relationship is on track' : 'Prioritize a customer check-in'],
      ['Seat adoption', fmtPct(account.utilization, 0), `${account.activeSeats} of ${account.seats} seats active`],
      ['Next renewal', account.renewalDate ? fmtLongDate(account.renewalDate) : 'No renewal', account.owner + ' · Account owner'],
    ].map(([label,value,note]) => <article className={s.stat} key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div>
    <Tabs<View> ariaLabel="Account insights" active={view} onChange={setView} tabs={[{id:'overview',label:'Overview'},{id:'adoption',label:'Product adoption'},{id:'activity',label:'Contract activity'}]}/>
    <section role="tabpanel" aria-label={`${view} insights`} className={s.grid}>
      {view === 'overview' && <><article className={s.card}><div className={s.cardHead}><div><p className={s.eyebrow}>REVENUE PERFORMANCE</p><h2>Growth over time</h2></div><select aria-label="Revenue time range" value={months} onChange={e => setMonths(Number(e.target.value))}><option value={12}>Last 12 months</option><option value={6}>Last 6 months</option><option value={3}>Last 3 months</option></select></div><LineChart data={trend} series={[{key:'arr',label:'ARR',color:'var(--series-1)'}]} area baseline="zero" height={280} yFormat={fmtCurrency} ariaLabel={`${account.name} monthly annual recurring revenue`}/><p className={s.note}>Monthly contract snapshots · Hover or use arrow keys to explore.</p></article><aside className={s.card}><p className={s.eyebrow}>RELATIONSHIP</p><h2>Your account at a glance</h2><dl className={s.facts}>{[['Account owner',account.owner],['Customer success',account.csm],['Region',account.region],['Plan',account.plan],['Status',account.status]].map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><div className={s.insight}><ArrowUpRight size={20}/><p>{account.status === 'Churned' ? 'Review the contract history to understand this account’s journey.' : account.utilization < .6 ? 'There is room to grow adoption. Connect with your customer success manager to activate unused seats.' : 'Build on engagement. Review the upcoming renewal with your account team.'}</p></div></aside></>}
      {view === 'adoption' && <><article className={s.card}><p className={s.eyebrow}>PRODUCT ENGAGEMENT</p><h2>Make every seat count</h2><div className={s.adoption}><strong>{fmtPct(account.utilization,0)}</strong><p>of purchased seats are active</p></div><Meter value={account.utilization} label="Active seat utilization"/><div className={s.stats}><div className={s.stat}><span>Active seats</span><strong>{account.activeSeats}</strong></div><div className={s.stat}><span>Unused seats</span><strong>{Math.max(0,account.seats-account.activeSeats)}</strong></div></div></article><aside className={s.card}><p className={s.eyebrow}>CUSTOMER HEALTH</p><h2>Relationship strength</h2><div className={s.adoption}><strong>{account.healthScore}<small>/100</small></strong></div><Meter value={account.healthScore/100} label="Account health score"/><p className={s.note}>Current account snapshot. Historical product usage is not available in this dataset.</p></aside></>}
      {view === 'activity' && <article className={s.card}><p className={s.eyebrow}>CONTRACT JOURNEY</p><h2>Every milestone, in one place</h2><ol className={s.timeline}>{[...source.events].sort((a,b)=>b.date.getTime()-a.date.getTime()).map((event,i)=><li key={i}><span className={s.dot}/><div><strong>{event.type.charAt(0).toUpperCase()+event.type.slice(1)}</strong><p>{fmtShortDate(event.date)}</p></div><strong>{event.delta > 0 ? '+' : ''}{fmtCurrency(event.delta)}</strong></li>)}</ol></article>}
    </section><AccountActions key={account.id} accountId={account.id} /><p className={s.note}>Illustrative account data · Vantage customer intelligence</p>
  </div>;
}


