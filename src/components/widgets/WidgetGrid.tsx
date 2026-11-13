import { useCallback, useMemo, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { LayoutGrid } from 'lucide-react';
import { cx } from '@/lib/cx';
import { useLayout, SIZE_SPAN, type LayoutItem, type WidgetId } from '@/state/LayoutContext';
import { useFilters } from '@/state/FiltersContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { WidgetFrame } from './WidgetFrame';
import { WIDGET_BY_ID } from './registry';
import s from './WidgetGrid.module.css';

interface GridItemProps {
  item: LayoutItem;
  index: number;
  count: number;
  tableView: boolean;
  onToggleTableView: () => void;
  activeId: WidgetId | null;
}

function GridItem({ item, index, count, tableView, onToggleTableView, activeId }: GridItemProps) {
  const def = WIDGET_BY_ID[item.id];
  const { setSize, setVisible, move, items } = useLayout();
  const { resolved } = useFilters();
  const { toast } = useToast();
  const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({ id: item.id });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: item.id });
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef],
  );

  const visible = items.filter((i) => i.visible);
  const prev = visible[index - 1];
  const next = visible[index + 1];
  const Component = def.component;
  const subtitle = def.subtitle?.replace('{range}', resolved.label);

  return (
    <div ref={setRef} className={cx(s.item, s[`size_${item.size}`])} style={{ ['--span' as string]: SIZE_SPAN[item.size] }}>
      <WidgetFrame
        id={item.id}
        title={def.title}
        subtitle={subtitle}
        description={def.description}
        size={item.size}
        allowedSizes={def.allowedSizes}
        onSizeChange={(sz) => setSize(item.id, sz)}
        onHide={() => {
          setVisible(item.id, false);
          toast(`${def.title} hidden — restore it from Customize`, 'info');
        }}
        onMoveUp={prev ? () => move(item.id, prev.id) : undefined}
        onMoveDown={next ? () => move(item.id, next.id) : undefined}
        hasTableView={def.hasTableView}
        tableView={tableView}
        onToggleTableView={onToggleTableView}
        dragHandleProps={{ ...listeners, ...attributes }}
        dragging={activeId === item.id}
        over={isOver && activeId !== null && activeId !== item.id}
        padding={def.flush ? 'none' : 'md'}
      >
        <Component size={item.size} tableView={tableView} />
      </WidgetFrame>
      <span className="sr-only">
        Position {index + 1} of {count}
      </span>
    </div>
  );
}

export function WidgetGrid({ onCustomize }: { onCustomize: () => void }) {
  const { items, move } = useLayout();
  const [activeId, setActiveId] = useState<WidgetId | null>(null);
  const [tableViews, setTableViews] = useState<Record<string, boolean>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const visible = useMemo(() => items.filter((i) => i.visible), [items]);

  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as WidgetId);
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (e.over && e.over.id !== e.active.id) move(e.active.id as WidgetId, e.over.id as WidgetId);
  };

  if (visible.length === 0) {
    return <EmptyState icon={<LayoutGrid />} title="No widgets on this dashboard" description="Everything is hidden. Open Customize to add widgets back." action={<Button variant="primary" onClick={onCustomize}>Customize dashboard</Button>} />;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
      <div className={s.grid} data-component="WidgetGrid">
        {visible.map((item, i) => (
          <GridItem key={item.id} item={item} index={i} count={visible.length} tableView={!!tableViews[item.id]} onToggleTableView={() => setTableViews((t) => ({ ...t, [item.id]: !t[item.id] }))} activeId={activeId} />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className={s.ghost}>
            <LayoutGrid size={14} aria-hidden />
            {WIDGET_BY_ID[activeId].title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
