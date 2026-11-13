import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { PLANS, REGIONS, SEGMENTS, type Plan, type Region, type Segment } from '@/data/types';
import { RANGE_PRESETS, countActiveFilters, type Filters, type RangeKey } from '@/data/queries';
import { useFilters } from '@/state/FiltersContext';
import { Modal } from '@/components/ui/Modal';
import s from './LegacyFilterBar.module.css';

/**
 * Variant A — the legacy filter flow, kept for the A/B comparison.
 * Filters hide behind a button; a modal of single-select dropdowns only takes
 * effect after "Apply". Heat maps showed 61% of sessions abandoned this dialog.
 */
export function LegacyFilterBar() {
  const { filters, setFilters, resolved } = useFilters();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const count = countActiveFilters(filters);

  const openDialog = () => {
    setDraft(filters);
    setOpen(true);
  };

  const apply = () => {
    setFilters(draft);
    setOpen(false);
  };

  return (
    <div className={s.bar} data-component="LegacyFilterBar" role="region" aria-label="Filters (legacy)">
      <button type="button" className={s.filtersBtn} onClick={openDialog} data-heat="filters-button" aria-haspopup="dialog" aria-expanded={open}>
        <SlidersHorizontal size={14} aria-hidden />
        Filters…
        {count > 0 && <span className={s.count}>({count})</span>}
      </button>
      <span className={s.status}>
        Showing: <strong>{resolved.label}</strong>
        {filters.regions.length ? ` · ${filters.regions.join(', ')}` : ' · All regions'}
        {filters.segments.length ? ` · ${filters.segments.join(', ')}` : ''}
        {filters.plans.length ? ` · ${filters.plans.join(', ')}` : ''}
      </span>
      <span className={s.variantTag}>Variant A · legacy flow</span>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Report filters"
        description="Changes take effect when you click Apply."
        legacy
        width={440}
        footer={
          <>
            <button type="button" className={s.legacyBtn} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className={s.legacyBtn} onClick={() => setDraft({ ...draft, regions: [], segments: [], plans: [] })}>
              Reset
            </button>
            <button type="button" className={`${s.legacyBtn} ${s.legacyPrimary}`} onClick={apply}>
              Apply
            </button>
          </>
        }
      >
        <table className={s.form}>
          <tbody>
            <tr>
              <th scope="row">
                <label htmlFor="lg-range">Date range:</label>
              </th>
              <td>
                <select id="lg-range" className={s.select} value={draft.range === 'custom' ? '90d' : draft.range} onChange={(e) => setDraft({ ...draft, range: e.target.value as RangeKey })}>
                  {RANGE_PRESETS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <label htmlFor="lg-region">Region:</label>
              </th>
              <td>
                <select id="lg-region" className={s.select} value={draft.regions[0] ?? ''} onChange={(e) => setDraft({ ...draft, regions: e.target.value ? [e.target.value as Region] : [] })}>
                  <option value="">-- All --</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <label htmlFor="lg-segment">Segment:</label>
              </th>
              <td>
                <select id="lg-segment" className={s.select} value={draft.segments[0] ?? ''} onChange={(e) => setDraft({ ...draft, segments: e.target.value ? [e.target.value as Segment] : [] })}>
                  <option value="">-- All --</option>
                  {SEGMENTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <label htmlFor="lg-plan">Plan type:</label>
              </th>
              <td>
                <select id="lg-plan" className={s.select} value={draft.plans[0] ?? ''} onChange={(e) => setDraft({ ...draft, plans: e.target.value ? [e.target.value as Plan] : [] })}>
                  <option value="">-- All --</option>
                  {PLANS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <th scope="row">Options:</th>
              <td>
                <label className={s.check}>
                  <input type="checkbox" checked={draft.compare} onChange={(e) => setDraft({ ...draft, compare: e.target.checked })} /> Include prior period comparison
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        <p className={s.note}>Note: only one value per field can be selected. To compare regions, run the report twice.</p>
      </Modal>
    </div>
  );
}
