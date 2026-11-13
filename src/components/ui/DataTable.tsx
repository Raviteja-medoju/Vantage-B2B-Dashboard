import { useMemo, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cx } from '@/lib/cx';
import { Checkbox } from './Checkbox';
import s from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Plain-text header used for aria & tooltips when header is a node */
  headerText?: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  minWidth?: number;
  sortValue?: (row: T) => number | string | null | undefined;
  /** Pin to the left edge while scrolling horizontally */
  sticky?: boolean;
  /** Hide this column below a viewport width (px) */
  hideBelow?: 640 | 900 | 1200;
  numeric?: boolean;
}

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption?: string;
  sort?: SortState | null;
  onSortChange?: (s: SortState | null) => void;
  selectable?: boolean;
  selected?: Set<string>;
  onSelectedChange?: (s: Set<string>) => void;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  emptyState?: ReactNode;
  density?: 'comfortable' | 'compact';
  zebra?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  sort,
  onSortChange,
  selectable = false,
  selected,
  onSelectedChange,
  onRowClick,
  stickyHeader = true,
  maxHeight,
  emptyState,
  density,
  zebra = false,
  className,
}: DataTableProps<T>) {
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [rows, sort, columns]);

  const allKeys = useMemo(() => sorted.map(rowKey), [sorted, rowKey]);
  const selectedCount = selected ? allKeys.filter((k) => selected.has(k)).length : 0;
  const allSelected = selectable && allKeys.length > 0 && selectedCount === allKeys.length;
  const someSelected = selectable && selectedCount > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    if (!onSelectedChange) return;
    const next = new Set(selected);
    allKeys.forEach((k) => (checked ? next.add(k) : next.delete(k)));
    onSelectedChange(next);
  };

  const toggleRow = (key: string, checked: boolean) => {
    if (!onSelectedChange) return;
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    onSelectedChange(next);
  };

  const cycleSort = (col: Column<T>) => {
    if (!col.sortValue || !onSortChange) return;
    if (!sort || sort.key !== col.key) onSortChange({ key: col.key, dir: col.numeric ? 'desc' : 'asc' });
    else if (sort.dir === (col.numeric ? 'desc' : 'asc')) onSortChange({ key: col.key, dir: col.numeric ? 'asc' : 'desc' });
    else onSortChange(null);
  };

  return (
    <div className={cx(s.wrap, className)} style={{ maxHeight }} data-component="DataTable" data-density={density}>
      <table className={cx(s.table, stickyHeader && s.stickyHeader, zebra && s.zebra, density === 'compact' && s.compact)}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className={cx(s.th, s.selectCell, s.stickyCol)}>
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} aria-label="Select all rows" />
              </th>
            )}
            {columns.map((col) => {
              const sortable = !!col.sortValue && !!onSortChange;
              const active = sort?.key === col.key;
              const ariaSort = active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={cx(s.th, col.align === 'right' && s.right, col.align === 'center' && s.center, col.sticky && s.stickyCol, col.hideBelow && s[`hide${col.hideBelow}`])}
                  style={{ width: col.width, minWidth: col.minWidth, left: col.sticky && selectable ? 40 : undefined }}
                >
                  {sortable ? (
                    <button type="button" className={cx(s.sortBtn, active && s.sortActive)} onClick={() => cycleSort(col)} title={`Sort by ${col.headerText ?? String(col.header)}`}>
                      <span>{col.header}</span>
                      <span className={s.sortIcon} aria-hidden>
                        {active ? sort!.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ArrowUpDown size={12} />}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className={s.emptyCell}>
                {emptyState ?? 'No rows match the current filters.'}
              </td>
            </tr>
          ) : (
            sorted.map((row) => {
              const key = rowKey(row);
              const isSelected = !!selected?.has(key);
              return (
                <tr key={key} className={cx(s.tr, isSelected && s.selectedRow, onRowClick && s.clickable)} onClick={onRowClick ? () => onRowClick(row) : undefined} aria-selected={selectable ? isSelected : undefined}>
                  {selectable && (
                    <td className={cx(s.td, s.selectCell, s.stickyCol)} onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onChange={(c) => toggleRow(key, c)} aria-label={`Select row ${key}`} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} style={{ left: col.sticky && selectable ? 40 : undefined }} className={cx(s.td, col.align === 'right' && s.right, col.align === 'center' && s.center, col.numeric && 'tabular', col.sticky && s.stickyCol, col.hideBelow && s[`hide${col.hideBelow}`])}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
