import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';
import { KPI_DEFS } from '@/data/queries';
import { useLayout, SIZE_LABEL, type WidgetSize } from '@/state/LayoutContext';
import { Drawer } from '@/components/ui/Drawer';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useToast } from '@/components/ui/Toast';
import { WIDGET_BY_ID, type WidgetCategory } from './registry';
import s from './CustomizeDrawer.module.css';

const CATEGORIES: WidgetCategory[] = ['Revenue', 'Customers', 'Pipeline', 'Product'];

export function CustomizeDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, kpiKeys, setVisible, setSize, setKpiKeys, move, reset, isDefault } = useLayout();
  const { toast } = useToast();

  const toggleKpi = (key: (typeof KPI_DEFS)[number]['key'], checked: boolean) => {
    if (checked) setKpiKeys([...KPI_DEFS.map((d) => d.key).filter((k) => k === key || kpiKeys.includes(k))]);
    else if (kpiKeys.length > 1) setKpiKeys(kpiKeys.filter((k) => k !== key));
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Customize dashboard"
      description="Show, hide, resize and reorder widgets. Your layout is saved on this device."
      width={420}
      footer={
        <>
          <Button
            variant="ghost"
            iconLeft={<RotateCcw />}
            disabled={isDefault}
            onClick={() => {
              reset();
              toast('Layout reset to default');
            }}
          >
            Reset to default
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <section className={s.section} aria-labelledby="cust-order">
        <h3 id="cust-order" className={s.heading}>
          Widgets
        </h3>
        <p className={s.hint}>Order here matches the dashboard. Drag the handle on a widget, or use the arrows.</p>
        <ul className={s.list}>
          {items.map((item, i) => {
            const def = WIDGET_BY_ID[item.id];
            return (
              <li key={item.id} className={s.row} data-hidden={!item.visible || undefined}>
                <Switch checked={item.visible} onChange={(v) => setVisible(item.id, v)} label={def.title} description={def.category} size="sm" />
                <div className={s.rowControls}>
                  {def.allowedSizes.length > 1 && (
                    <Select<WidgetSize>
                      label="Size"
                      hideLabel
                      size="sm"
                      value={item.size}
                      onChange={(sz) => setSize(item.id, sz)}
                      options={def.allowedSizes.map((sz) => ({ value: sz, label: SIZE_LABEL[sz] }))}
                      disabled={!item.visible}
                    />
                  )}
                  <IconButton label={`Move ${def.title} up`} size="sm" disabled={i === 0} onClick={() => move(item.id, items[i - 1].id)}>
                    <ArrowUp />
                  </IconButton>
                  <IconButton label={`Move ${def.title} down`} size="sm" disabled={i === items.length - 1} onClick={() => move(item.id, items[i + 1].id)}>
                    <ArrowDown />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={s.section} aria-labelledby="cust-kpis">
        <h3 id="cust-kpis" className={s.heading}>
          Key metrics
        </h3>
        <p className={s.hint}>Choose which figures lead the dashboard. The first one renders as the hero number.</p>
        <ul className={s.kpiList}>
          {KPI_DEFS.map((d) => (
            <li key={d.key}>
              <Checkbox checked={kpiKeys.includes(d.key)} onChange={(c) => toggleKpi(d.key, c)} label={d.label} description={d.description} disabled={kpiKeys.length === 1 && kpiKeys.includes(d.key)} />
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section} aria-labelledby="cust-cats">
        <h3 id="cust-cats" className={s.heading}>
          Categories
        </h3>
        <div className={s.cats}>
          {CATEGORIES.map((c) => {
            const count = items.filter((i) => WIDGET_BY_ID[i.id].category === c && i.visible).length;
            const total = items.filter((i) => WIDGET_BY_ID[i.id].category === c).length;
            return (
              <span key={c} className={s.cat}>
                {c} <strong>{count}</strong>/{total}
              </span>
            );
          })}
        </div>
      </section>
    </Drawer>
  );
}
