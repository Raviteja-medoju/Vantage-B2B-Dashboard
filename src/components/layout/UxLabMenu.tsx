import { useRef, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { cx } from '@/lib/cx';
import { useLab, type FilterVariant } from '@/state/LabContext';
import { usePreferences, type Density, type ThemePref } from '@/state/PreferencesContext';
import { Button } from '@/components/ui/Button';
import { Popover } from '@/components/ui/Popover';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import s from './UxLabMenu.module.css';

/**
 * The research & QA toggles used during the redesign, exposed so reviewers can
 * replay them: A/B filter variants, the click heat map, and inspect mode.
 */
export function UxLabMenu() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement | null>(null);
  const { filterVariant, setFilterVariant, heatmap, setHeatmap, inspect, setInspect } = useLab();
  const { theme, setTheme, density, setDensity } = usePreferences();
  const activeCount = (filterVariant === 'A' ? 1 : 0) + (heatmap ? 1 : 0) + (inspect ? 1 : 0);

  return (
    <>
      <Button ref={btn} variant="ghost" iconLeft={<FlaskConical />} onClick={() => setOpen((o) => !o)} aria-haspopup="dialog" aria-expanded={open} className={cx(s.trigger, activeCount > 0 && s.triggerActive)}>
        UX Lab
        {activeCount > 0 && <span className={s.dot} aria-label={`${activeCount} lab settings active`} />}
      </Button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={btn} placement="bottom-end" padding="md" ariaLabel="UX Lab" className={s.panel}>
        <header className={s.header}>
          <h2 className={s.title}>UX Lab</h2>
          <p className={s.lead}>Replay the research tooling behind the redesign.</p>
        </header>

        <section className={s.section}>
          <div className={s.sectionHead}>
            <span className={s.sectionTitle}>Filter panel variant</span>
            <span className={s.sectionMeta}>A/B test · 28 days · 2,340 users</span>
          </div>
          <SegmentedControl<FilterVariant>
            ariaLabel="Filter panel variant"
            fullWidth
            value={filterVariant}
            onChange={setFilterVariant}
            options={[
              { value: 'A', label: 'A · Legacy modal' },
              { value: 'B', label: 'B · Inline panel' },
            ]}
          />
          <p className={s.help}>{filterVariant === 'A' ? 'Filters hide behind a button and only apply after confirmation. 61% of sessions abandoned this dialog.' : 'Always-visible row, multi-select, instant apply, chips and saved views. +22% daily adoption.'}</p>
        </section>

        <section className={s.section}>
          <Switch checked={heatmap} onChange={setHeatmap} label="Click heat map" description="Density overlay reconstructed from 11,200 sessions for the selected variant." />
        </section>

        <section className={s.section}>
          <Switch checked={inspect} onChange={setInspect} label="Inspect mode" description="8pt grid and component outlines — the design QA view shared with engineering." />
        </section>

        <section className={s.section}>
          <div className={s.sectionHead}>
            <span className={s.sectionTitle}>Density</span>
          </div>
          <SegmentedControl<Density>
            ariaLabel="Density"
            fullWidth
            size="sm"
            value={density}
            onChange={setDensity}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
        </section>

        <section className={s.section}>
          <div className={s.sectionHead}>
            <span className={s.sectionTitle}>Theme</span>
          </div>
          <SegmentedControl<ThemePref>
            ariaLabel="Theme"
            fullWidth
            size="sm"
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
        </section>
      </Popover>
    </>
  );
}
