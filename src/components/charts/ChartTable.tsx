import s from './charts.module.css';

export interface ChartTableProps {
  caption: string;
  columns: string[];
  rows: Array<Array<string | number>>;
  maxHeight?: number;
}

/** The WCAG-clean twin of every chart: same numbers, no colour needed. */
export function ChartTable({ caption, columns, rows, maxHeight = 320 }: ChartTableProps) {
  return (
    <div className={s.tableWrap} style={{ maxHeight }}>
      <table className={s.table}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (j === 0 ? <th key={j} scope="row" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, fontSize: 'var(--text-sm)', color: 'var(--color-ink)', position: 'sticky', left: 0, background: 'var(--color-surface)' }}>{cell}</th> : <td key={j}>{cell}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
