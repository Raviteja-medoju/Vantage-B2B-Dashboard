import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { accountRows, DEFAULT_FILTERS } from '@/data/queries';

export interface FollowUp {
  id: string;
  accountId: string;
  title: string;
  due: string;
  done: boolean;
}
export interface AccountNote { id: string; text: string; createdAt: string }
interface Workspace {
  favorites: string[];
  recent: string[];
  tasks: FollowUp[];
  notes: Record<string, AccountNote[]>;
  owners: Record<string, string>;
  directoryUrl: string;
}
const KEY = 'vantage.workspace.v1';
const EMPTY: Workspace = { favorites: [], recent: [], tasks: [], notes: {}, owners: {}, directoryUrl: '/accounts' };
const initialAccounts = accountRows(DEFAULT_FILTERS, true);

function readWorkspace(): Workspace {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (saved && Array.isArray(saved.favorites) && Array.isArray(saved.recent) && Array.isArray(saved.tasks) && saved.notes && saved.owners) {
      return { ...EMPTY, ...saved };
    }
  } catch { /* A new workspace remains usable when browser storage is unavailable. */ }
  return EMPTY;
}

function useWorkspaceState() {
  const [workspace, setWorkspace] = useState(readWorkspace);
  const current = useRef(workspace);
  const [storageError, setStorageError] = useState(false);
  const update = useCallback((change: (previous: Workspace) => Workspace) => {
    const next = change(current.current);
    current.current = next;
    setWorkspace(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setStorageError(false);
    } catch { setStorageError(true); }
  }, []);
  const visit = useCallback((id: string) => update(w => ({ ...w, recent: [id, ...w.recent.filter(x => x !== id)].slice(0, 8) })), [update]);
  const rememberDirectory = useCallback((url: string) => update(w => ({ ...w, directoryUrl: url })), [update]);
  return {
    ...workspace, storageError, visit, rememberDirectory,
    accounts: initialAccounts.map(a => ({ ...a, owner: workspace.owners[a.id] ?? a.owner })),
    toggleFavorite: (id: string) => update(w => ({ ...w, favorites: w.favorites.includes(id) ? w.favorites.filter(x => x !== id) : [...w.favorites, id] })),
    closeRecent: (id: string) => update(w => ({ ...w, recent: w.recent.filter(x => x !== id) })),
    addTask: (accountId: string, title: string, due: string) => update(w => ({ ...w, tasks: [...w.tasks, { id: crypto.randomUUID(), accountId, title: title.trim(), due, done: false }] })),
    toggleTask: (id: string) => update(w => ({ ...w, tasks: w.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })),
    addNote: (accountId: string, text: string) => update(w => ({ ...w, notes: { ...w.notes, [accountId]: [{ id: crypto.randomUUID(), text: text.trim(), createdAt: new Date().toISOString() }, ...(w.notes[accountId] ?? [])] } })),
    assignOwner: (ids: string[], owner: string) => update(w => ({ ...w, owners: { ...w.owners, ...Object.fromEntries(ids.map(id => [id, owner])) } })),
  };
}
const Context = createContext<ReturnType<typeof useWorkspaceState> | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const value = useWorkspaceState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error('WorkspaceProvider is required');
  return value;
}
