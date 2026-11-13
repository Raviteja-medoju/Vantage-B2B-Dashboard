import { useRef, useState } from 'react';
import { Bookmark, BookmarkPlus, Building2, Globe2, Layers, Trash2, X } from 'lucide-react';
import { PLANS, REGIONS, SEGMENTS, type Plan, type Region, type Segment } from '@/data/types';
import { DEFAULT_FILTERS } from '@/data/queries';
import { useFilters } from '@/state/FiltersContext';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { MultiSelect } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Menu, type MenuItem } from '@/components/ui/Menu';
import { Popover } from '@/components/ui/Popover';
import { useToast } from '@/components/ui/Toast';
import s from './FilterBar.module.css';

/**
 * Variant B — the redesigned filter panel.
 * One left-aligned row above everything it scopes: date range first, dimension
 * filters as multi-select comboboxes, applied filters echoed as removable chips,
 * saved views one click away. No Apply button: every change is immediate.
 */
export function FilterBar() {
  const { filters, patch, reset, savedViews, saveView, applyView, deleteView } = useFilters();
  const { toast } = useToast();
  const [viewsOpen, setViewsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const viewsBtn = useRef<HTMLButtonElement | null>(null);
  const saveBtn = useRef<HTMLButtonElement | null>(null);

  const dimsActive = filters.regions.length + filters.segments.length + filters.plans.length > 0;
  const anyActive = dimsActive || filters.range !== DEFAULT_FILTERS.range;

  const viewItems: MenuItem[] = [
    { type: 'label', key: 'lbl', label: 'Saved views' },
    ...(savedViews.length === 0 ? [{ key: 'none', label: 'No saved views yet', disabled: true } as MenuItem] : []),
    ...savedViews.map<MenuItem>((v) => ({
      key: v.id,
      label: v.name,
      icon: <Bookmark />,
      description: `${v.filters.regions.length + v.filters.segments.length + v.filters.plans.length} filters · saved ${v.createdAt}`,
      onSelect: () => {
        applyView(v.id);
        toast(`Applied “${v.name}”`, 'info');
      },
    })),
    { type: 'separator', key: 'sep' },
    ...savedViews.map<MenuItem>((v) => ({ key: `del-${v.id}`, label: `Delete “${v.name}”`, icon: <Trash2 />, danger: true, onSelect: () => deleteView(v.id) })),
  ];

  return (
    <div className={s.bar} data-component="FilterBar" role="region" aria-label="Filters">
      <div className={s.row}>
        <DateRangePicker value={{ range: filters.range, start: filters.start, end: filters.end }} onChange={(v) => patch({ range: v.range, start: v.start, end: v.end })} data-heat="filter-date" />
        <MultiSelect<Region> label="Region" icon={<Globe2 />} options={REGIONS.map((r) => ({ value: r, label: r }))} value={filters.regions} onChange={(regions) => patch({ regions })} data-heat="filter-region" />
        <MultiSelect<Segment> label="Segment" icon={<Building2 />} options={SEGMENTS.map((r) => ({ value: r, label: r }))} value={filters.segments} onChange={(segments) => patch({ segments })} data-heat="filter-segment" />
        <MultiSelect<Plan> label="Plan" icon={<Layers />} options={PLANS.map((r) => ({ value: r, label: r }))} value={filters.plans} onChange={(plans) => patch({ plans })} data-heat="filter-plan" />
        <div className={s.compare}>
          <Switch size="sm" checked={filters.compare} onChange={(compare) => patch({ compare })} label="Compare to previous period" />
        </div>
        <div className={s.spacer} />
        <div className={s.views} data-heat="filter-save">
          <Button variant="ghost" size="sm" iconLeft={<Bookmark />} ref={viewsBtn} onClick={() => setViewsOpen((o) => !o)} aria-haspopup="menu" aria-expanded={viewsOpen}>
            Views
            {savedViews.length > 0 && <span className={s.badge}>{savedViews.length}</span>}
          </Button>
          <Menu open={viewsOpen} onClose={() => setViewsOpen(false)} anchorRef={viewsBtn} items={viewItems} ariaLabel="Saved views" minWidth={260} />
          <Button variant="ghost" size="sm" iconLeft={<BookmarkPlus />} ref={saveBtn} onClick={() => setSaveOpen((o) => !o)} aria-haspopup="dialog" aria-expanded={saveOpen} disabled={!anyActive}>
            Save view
          </Button>
          <Popover open={saveOpen} onClose={() => setSaveOpen(false)} anchorRef={saveBtn} placement="bottom-end" padding="md" ariaLabel="Save current view">
            <form
              className={s.saveForm}
              onSubmit={(e) => {
                e.preventDefault();
                const name = viewName.trim();
                if (!name) return;
                saveView(name);
                setViewName('');
                setSaveOpen(false);
                toast(`Saved view “${name}”`);
              }}
            >
              <label className={s.saveLabel} htmlFor="save-view-name">
                View name
              </label>
              <input id="save-view-name" className={s.saveInput} value={viewName} onChange={(e) => setViewName(e.target.value)} placeholder="e.g. EMEA renewals" data-autofocus maxLength={40} />
              <div className={s.saveActions}>
                <Button size="sm" variant="ghost" onClick={() => setSaveOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" disabled={!viewName.trim()}>
                  Save
                </Button>
              </div>
            </form>
          </Popover>
        </div>
      </div>

      {dimsActive && (
        <div className={s.chips} data-heat="filter-chips" aria-label="Applied filters">
          {filters.regions.map((r) => (
            <Chip key={r} prefix="Region" onRemove={() => patch({ regions: filters.regions.filter((x) => x !== r) })}>
              {r}
            </Chip>
          ))}
          {filters.segments.map((r) => (
            <Chip key={r} prefix="Segment" onRemove={() => patch({ segments: filters.segments.filter((x) => x !== r) })}>
              {r}
            </Chip>
          ))}
          {filters.plans.map((r) => (
            <Chip key={r} prefix="Plan" onRemove={() => patch({ plans: filters.plans.filter((x) => x !== r) })}>
              {r}
            </Chip>
          ))}
          <Button variant="ghost" size="sm" iconLeft={<X />} onClick={reset}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
