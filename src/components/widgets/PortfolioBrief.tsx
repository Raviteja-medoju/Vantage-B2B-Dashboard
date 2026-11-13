import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, CalendarClock, Activity } from 'lucide-react';
import { accountRows, AS_OF } from '@/data/queries';
import { useFilters } from '@/state/FiltersContext';
import { fmtCurrency } from '@/lib/format';
import s from './PortfolioBrief.module.css';
export function PortfolioBrief(){
 const {filters}=useFilters();
 const rows=accountRows(filters,true);
 const risk=rows.filter(a=>a.status==='Active'&&a.health!=='healthy').sort((a,b)=>b.arr-a.arr);
 const renewals=rows.filter(a=>a.renewalDate && a.renewalDate.getTime()>=AS_OF.getTime() && a.renewalDate.getTime()-AS_OF.getTime()<=90*86400000);
 const focus=risk[0];
 return <section className={s.brief} aria-label="Portfolio briefing"><div className={s.intro}><span className={s.kicker}><Activity size={13}/> PORTFOLIO BRIEFING</span><h2>Know where to focus.<br/>Make your next move.</h2><p>Your customer signals, connected to the actions that matter.</p><Link to="/work">Open your work queue <ArrowUpRight size={16}/></Link></div><div className={s.signal}><ShieldCheck size={22}/><span>Retention watch</span><strong>{risk.length}<small> accounts</small></strong><p>{fmtCurrency(risk.reduce((n,a)=>n+a.arr,0))} ARR in accounts needing attention</p>{focus && <Link to={`/accounts/${focus.id}`}>Review {focus.name} <ArrowUpRight size={15}/></Link>}</div><div className={s.signal}><CalendarClock size={22}/><span>Next 90 days</span><strong>{renewals.length}<small> renewals</small></strong><p>{fmtCurrency(renewals.reduce((n,a)=>n+a.arr,0))} ARR approaching renewal</p><Link to="/work?view=renewals">Plan upcoming renewals <ArrowUpRight size={15}/></Link></div></section>
}

