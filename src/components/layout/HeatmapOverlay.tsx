import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { HEAT_SPOTS } from '@/data/caseStudy';
import { useLab } from '@/state/LabContext';
import { IconButton } from '@/components/ui/IconButton';
import s from './HeatmapOverlay.module.css';

/** Semantic heat ramp (cool -> hot). Multi-hue is allowed here because it is a heat scale with a legend. */
const STOPS: Array<[number, [number, number, number]]> = [
  [0.0, [42, 120, 214]],
  [0.35, [27, 175, 122]],
  [0.6, [237, 161, 0]],
  [0.8, [235, 104, 52]],
  [1.0, [227, 73, 72]],
];

function buildPalette(): Uint8ClampedArray {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 1;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  for (const [stop, [r, gg, b]] of STOPS) g.addColorStop(stop, `rgb(${r},${gg},${b})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
}

const JITTER: Array<[number, number, number]> = [
  [0, 0, 1],
  [0.35, -0.2, 0.55],
  [-0.3, 0.25, 0.5],
  [0.15, 0.4, 0.4],
  [-0.45, -0.3, 0.35],
  [0.5, 0.1, 0.3],
];

export function HeatmapOverlay() {
  const { heatmap, setHeatmap, filterVariant } = useLab();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!heatmap) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const palette = buildPalette();
    const SCALE = 0.5;
    let raf = 0;

    const draw = () => {
      const w = Math.floor(window.innerWidth * SCALE);
      const h = Math.floor(window.innerHeight * SCALE);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // 1) accumulate intensity as alpha
      ctx.globalCompositeOperation = 'source-over';
      for (const spot of HEAT_SPOTS[filterVariant]) {
        const el = document.querySelector<HTMLElement>(`[data-heat="${spot.target}"]`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.bottom < 0 || r.top > window.innerHeight) continue;
        const cx = (r.left + r.width * spot.x) * SCALE;
        const cy = (r.top + r.height * spot.y) * SCALE;
        for (const [jx, jy, jw] of JITTER) {
          const radius = spot.r * SCALE * (0.55 + jw * 0.45);
          const x = cx + jx * spot.r * SCALE;
          const y = cy + jy * spot.r * SCALE * 0.7;
          const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
          const a = Math.min(1, spot.weight * jw * 0.5);
          g.addColorStop(0, `rgba(0,0,0,${a})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2) colourise by alpha
      const img = ctx.getImageData(0, 0, w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3];
        if (a === 0) continue;
        const idx = Math.min(255, a) * 4;
        d[i] = palette[idx];
        d[i + 1] = palette[idx + 1];
        d[i + 2] = palette[idx + 2];
        d[i + 3] = Math.min(200, a * 1.1 + 20);
      }
      ctx.putImageData(img, 0, 0);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    schedule();
    const late = window.setTimeout(schedule, 400);
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, [heatmap, filterVariant, location.pathname]);

  if (!heatmap) return null;

  return (
    <>
      <canvas ref={canvasRef} className={s.canvas} aria-hidden />
      <div className={s.legend} role="status" data-component="HeatmapLegend">
        <div className={s.legendHead}>
          <span className={s.legendTitle}>Click density</span>
          <IconButton label="Hide heat map" size="sm" onClick={() => setHeatmap(false)} tooltip={false}>
            <X />
          </IconButton>
        </div>
        <div className={s.legendMeta}>
          Variant {filterVariant} · {filterVariant === 'A' ? 'legacy modal' : 'inline panel'} · 11,200 sessions
        </div>
        <div className={s.scale}>
          <span>Low</span>
          <span className={s.ramp} aria-hidden />
          <span>High</span>
        </div>
      </div>
    </>
  );
}
