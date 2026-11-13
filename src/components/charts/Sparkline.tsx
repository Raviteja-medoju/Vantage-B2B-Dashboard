import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3line } from 'd3-shape';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** Colour of the current (last) segment and end dot */
  accent?: string;
  className?: string;
  ariaLabel?: string;
}

/** 12-point trend in the de-emphasis hue; the current period in the accent. */
export function Sparkline({ data, width = 96, height = 28, accent = 'var(--color-accent)', className, ariaLabel }: SparklineProps) {
  const { path, lastPath, end } = useMemo(() => {
    if (data.length < 2) return { path: '', lastPath: '', end: null as null | [number, number] };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const pad = 3;
    const x = scaleLinear().domain([0, data.length - 1]).range([pad, width - pad]);
    const y = scaleLinear()
      .domain([min === max ? min - 1 : min, min === max ? max + 1 : max])
      .range([height - pad, pad]);
    const gen = d3line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d));
    const path = gen(data) ?? '';
    const lastPath = gen(data.slice(-2).map((v) => v)) ? `M${x(data.length - 2)},${y(data[data.length - 2])}L${x(data.length - 1)},${y(data[data.length - 1])}` : '';
    return { path, lastPath, end: [x(data.length - 1), y(data[data.length - 1])] as [number, number] };
  }, [data, width, height]);

  if (!path) return null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel} aria-hidden={ariaLabel ? undefined : true} style={{ overflow: 'visible' }}>
      <path d={path} fill="none" stroke="var(--series-muted)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <path d={lastPath} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      {end && (
        <>
          <circle cx={end[0]} cy={end[1]} r={4} fill="var(--color-surface)" />
          <circle cx={end[0]} cy={end[1]} r={2.5} fill={accent} />
        </>
      )}
    </svg>
  );
}
