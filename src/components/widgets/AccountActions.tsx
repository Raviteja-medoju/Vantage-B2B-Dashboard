import { useState } from 'react';
import { Bookmark, Check, Plus, StickyNote } from 'lucide-react';
import { useWorkspace } from '@/state/WorkspaceContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import s from './Workflow.module.css';

export function AccountActions({ accountId }: { accountId: string }) {
  const { favorites, toggleFavorite, addTask, tasks, toggleTask, notes, addNote, storageError } = useWorkspace();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [note, setNote] = useState('');
  const favorite = favorites.includes(accountId);
  const accountTasks = tasks.filter(t => t.accountId === accountId);

  return <section id="account-action-plan" tabIndex={-1} className={s.actionsPanel} aria-label="Account action plan">
    <div className={s.sectionHead}>
      <div><span className={s.eyebrow}>FROM INSIGHT TO ACTION</span><h2>Account action plan</h2><p>Keep the next step and the context together.</p></div>
      <Button variant={favorite ? 'subtle' : 'secondary'} iconLeft={<Bookmark fill={favorite ? 'currentColor' : 'none'} />} aria-pressed={favorite} onClick={() => toggleFavorite(accountId)}>{favorite ? 'Following' : 'Follow account'}</Button>
    </div>
    <div className={s.actionColumns}>
      <div>
        <div className={s.rowHead}><h3>Follow-ups <span>{accountTasks.filter(t => !t.done).length}</span></h3><Button size="sm" variant="ghost" iconLeft={<Plus />} onClick={() => setOpen(true)}>Add follow-up</Button></div>
        {accountTasks.length === 0 && <div className={s.quietEmpty}><Check size={22} /><strong>A clear next step starts here</strong><p>Add a renewal check-in, adoption review or customer call.</p></div>}
        <div className={s.taskList}>{accountTasks.map(task => <label className={s.task} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} /><span><strong className={task.done ? s.completed : undefined}>{task.title}</strong><small>Due {new Date(task.due + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</small></span></label>)}</div>
      </div>
      <div>
        <h3 className={s.notesHeading}><StickyNote size={16} /> Account notes</h3>
        <form onSubmit={e => { e.preventDefault(); if (!note.trim()) return; addNote(accountId, note); setNote(''); toast('Note added to your workspace'); }}>
          <label className="sr-only" htmlFor="account-note">New account note</label>
          <textarea id="account-note" value={note} onChange={e => setNote(e.target.value)} maxLength={2000} rows={3} placeholder="Capture context for your next conversation…" />
          <div className={s.noteFooter}><span>Private to this browser</span><Button size="sm" type="submit" disabled={!note.trim()}>Save note</Button></div>
        </form>
        <div className={s.notes}>{(notes[accountId] ?? []).map(n => <article key={n.id}><p>{n.text}</p><time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time></article>)}</div>
      </div>
    </div>
    {storageError && <p role="alert" className={s.storageError}>Browser storage is unavailable. Changes will last only for this session.</p>}
    <Modal open={open} onClose={() => setOpen(false)} title="Plan the next step" description="Create a follow-up in your local workspace. No email or calendar invite is sent.">
      <form className={s.form} onSubmit={e => { e.preventDefault(); if (!title.trim() || !due) return; addTask(accountId, title, due); setTitle(''); setDue(''); setOpen(false); toast('Follow-up added to your work queue'); }}>
        <label>What needs to happen?<input data-autofocus required maxLength={160} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Review renewal with the customer" /></label>
        <label>Due date<input required type="date" value={due} onChange={e => setDue(e.target.value)} /></label>
        <div className={s.formActions}><Button onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={!title.trim() || !due}>Create follow-up</Button></div>
      </form>
    </Modal>
  </section>;
}
