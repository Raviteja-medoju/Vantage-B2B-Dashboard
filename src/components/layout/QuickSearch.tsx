import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, Clock3 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useWorkspace } from '@/state/WorkspaceContext';
import { fmtCurrency } from '@/lib/format';
import s from './QuickSearch.module.css';

export function QuickSearch() {
  const { accounts, recent } = useWorkspace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const queryText = query.trim().toLowerCase();
  const matches = accounts.filter(a => `${a.name} ${a.industry} ${a.owner} ${a.region}`.toLowerCase().includes(queryText));
  const results = (queryText ? matches : [...accounts].sort((a,b) => {
    const ai = recent.indexOf(a.id), bi = recent.indexOf(b.id);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  })).slice(0, 8);
  const selected = Math.min(active, Math.max(0, results.length - 1));
  const close = () => { setOpen(false); setQuery(''); setActive(0); };
  const choose = (id: string) => { navigate(`/accounts/${id}`); close(); };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen(value => !value); setQuery(''); setActive(0);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  useEffect(() => { resultsRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [selected]);

  return <>
    <button className={s.trigger} onClick={() => setOpen(true)} aria-label="Quick search accounts"><Search size={15} /><span>Find an account...</span><kbd>⌘ / Ctrl K</kbd></button>
    <Modal open={open} onClose={close} title="Go to an account" description="Search by company, industry, region or owner." width={600}>
      <input data-autofocus className={s.input} role="combobox" aria-expanded={open} aria-controls="account-search-results" aria-autocomplete="list" aria-activedescendant={results.length ? `account-result-${results[selected].id}` : undefined} aria-label="Find an account" placeholder="Start typing an account name…" value={query} onChange={e => { setQuery(e.target.value); setActive(0); }} onKeyDown={e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(results.length - 1, selected + 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, selected - 1)); }
        if (e.key === 'Enter' && results[selected]) { e.preventDefault(); choose(results[selected].id); }
      }} />
      <p className={s.caption}>{queryText ? `${matches.length} matching accounts` : recent.length ? 'Recently opened, then all accounts' : 'Explore accounts'}</p>
      <div ref={resultsRef} className={s.results} id="account-search-results" role="listbox" aria-label="Account results">
        {results.map((a, index) => <div role="option" aria-selected={index === selected} id={`account-result-${a.id}`} key={a.id} className={s.result} onMouseDown={e => e.preventDefault()} onClick={() => choose(a.id)}>
          <span className={s.avatar}>{a.name.slice(0,2).toUpperCase()}</span><span><strong>{a.name}</strong><small>{a.industry} · {a.owner}</small></span><span className={s.value}>{fmtCurrency(a.arr)}</span>{recent.includes(a.id) ? <Clock3 size={16} /> : <ArrowUpRight size={16} />}
        </div>)}
      </div>
      {!results.length && <p role="status" className={s.empty}>No accounts match “{query}”. Try a company, industry or owner.</p>}
      <div className={s.searchFooter}><span>↑ ↓ navigate · Enter open · Esc close</span><Link to={`/accounts?q=${encodeURIComponent(query)}`} onClick={close}>All results →</Link></div>
    </Modal>
  </>;
}
