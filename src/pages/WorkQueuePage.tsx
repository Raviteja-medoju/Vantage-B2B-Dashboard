import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Bookmark, CalendarClock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useWorkspace } from '@/state/WorkspaceContext';
import { AS_OF } from '@/data/queries';
import { fmtCurrency } from '@/lib/format';
import { fmtShortDate } from '@/lib/dates';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { HealthBadge } from '@/components/ui/Badge';
import s from './WorkQueuePage.module.css';

type QueueView = 'attention' | 'renewals' | 'following' | 'tasks';
export function WorkQueuePage() {
  const { accounts, favorites, toggleFavorite, tasks, toggleTask, storageError } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const value = params.get('view');
  const view: QueueView = value === 'renewals' || value === 'following' || value === 'tasks' ? value : 'attention';
  const completed = params.get('completed') === 'true';
  const attention = accounts.filter(a => a.status === 'Active' && a.health !== 'healthy').sort((a, b) => a.healthScore - b.healthScore || b.arr - a.arr);
  const renewals = accounts.filter(a => a.renewalDate && a.renewalDate >= AS_OF && a.renewalDate.getTime() - AS_OF.getTime() <= 90 * 86400000).sort((a,b) => a.renewalDate!.getTime() - b.renewalDate!.getTime());
  const following = accounts.filter(a => favorites.includes(a.id));
  const activeTasks = tasks.filter(t => !t.done);
  const rows = view === 'attention' ? attention : view === 'renewals' ? renewals : following;
  const displayedTasks = tasks.filter(t => t.done === completed).sort((a,b) => a.due.localeCompare(b.due));

  return <div className={s.page}>
    <PageHeader title="Your work, in focus" description="Start with the accounts that matter. Leave every conversation with a next step." />
    <div className={s.summary}>
      <button onClick={() => setParams({ view: 'attention' })}><ShieldCheck /><span>Needs attention<strong>{attention.length}<small> accounts</small></strong></span><ArrowUpRight /></button>
      <button onClick={() => setParams({ view: 'renewals' })}><CalendarClock /><span>Renewing in 90 days<strong>{renewals.length}<small> accounts</small></strong></span><ArrowUpRight /></button>
      <button onClick={() => setParams({ view: 'tasks' })}><CheckCircle2 /><span>Your next steps<strong>{activeTasks.length}<small> open follow-ups</small></strong></span><ArrowUpRight /></button>
    </div>
    <div className={s.queue}>
      <div className={s.queueHead}><Tabs<QueueView> ariaLabel="Work queue views" active={view} onChange={v => setParams({ view: v })} tabs={[
        { id: 'attention', label: 'Needs attention', count: attention.length },
        { id: 'renewals', label: 'Renewals', count: renewals.length },
        { id: 'following', label: 'Following', count: following.length },
        { id: 'tasks', label: 'Follow-ups', count: activeTasks.length },
      ]} /></div>
      <div className={s.context}><span>{view === 'attention' ? 'Lowest health first · Review the relationship, then plan your next step.' : view === 'renewals' ? 'Soonest renewal first · Prepare before the conversation.' : view === 'following' ? 'Your personal watchlist · Follow an account to keep it close.' : 'Your personal follow-ups · Check off a step when it is done.'}</span>{view === 'tasks' && <label><input type="checkbox" checked={completed} onChange={e => setParams({ view: 'tasks', completed: String(e.target.checked) })} /> Show completed</label>}</div>
      {view !== 'tasks' ? rows.length ? <div className={s.rows}>{rows.map(a => <article className={s.account} key={a.id}>
        <button className={s.bookmark} aria-label={`${favorites.includes(a.id) ? 'Unfollow' : 'Follow'} ${a.name}`} aria-pressed={favorites.includes(a.id)} onClick={() => toggleFavorite(a.id)}><Bookmark size={17} fill={favorites.includes(a.id) ? 'currentColor' : 'none'} /></button>
        <Link className={s.company} to={`/accounts/${a.id}`} state={{ returnTo: `/work?${params}`, returnLabel: 'Back to work queue' }}><span className={s.monogram}>{a.name.slice(0,2).toUpperCase()}</span><span><strong>{a.name}</strong><small>{a.industry} · {a.owner}</small></span></Link>
        <div className={s.health}>{a.status === 'Churned' ? 'Churned' : <HealthBadge health={a.health} size="sm" />}</div>
        <div className={s.metric}><strong>{fmtCurrency(a.arr)}</strong><small>Annual revenue</small></div>
        <div className={s.reason}>{view === 'renewals' ? <><strong>{fmtShortDate(a.renewalDate!)}</strong><small>Renewal date</small></> : <><strong>{a.healthScore}/100</strong><small>Health score</small></>}</div>
        <Link className={s.review} to={`/accounts/${a.id}`} state={{ returnTo: `/work?${params}`, returnLabel: 'Back to work queue' }}>Review <ArrowUpRight size={15} /></Link>
      </article>)}</div> : <EmptyState icon={<Bookmark />} title={view === 'following' ? 'Keep your key accounts close' : 'You’re all caught up'} description={view === 'following' ? 'Follow accounts from their workspace or use the bookmark beside any account in this queue.' : 'No accounts currently match this view.'} action={<Link to="/accounts">Explore accounts →</Link>} /> : displayedTasks.length ? <div className={s.rows}>{displayedTasks.map(task => {
        const account = accounts.find(a => a.id === task.accountId);
        return <article className={s.task} key={task.id}><input type="checkbox" checked={task.done} aria-label={`${task.done ? 'Reopen' : 'Complete'} ${task.title}`} onChange={() => toggleTask(task.id)} /><div><strong className={task.done ? s.done : undefined}>{task.title}</strong><Link to={`/accounts/${task.accountId}`} state={{ returnTo: '/work?view=tasks', returnLabel: 'Back to follow-ups' }}>{account?.name ?? 'View account'} →</Link></div><time dateTime={task.due}>Due {new Date(task.due + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time></article>;
      })}</div> : <EmptyState icon={<CheckCircle2 />} title={completed ? 'No completed follow-ups yet' : 'Space for your next move'} description={completed ? 'Completed steps will appear here. You can reopen them at any time.' : 'Open an account and add a follow-up to build your personal work queue.'} action={<Link to="/accounts">Find an account →</Link>} />}
    </div>
    <p className={s.footnote}>{storageError ? 'Browser storage is unavailable. Your changes last only for this session.' : 'Following, notes and follow-ups are saved in this browser.'} Account signals reflect the illustrative November 12, 2026 snapshot across all accounts.</p>
  </div>;
}
