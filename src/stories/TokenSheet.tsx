import { useEffect, useState } from 'react';

const COLOR_GROUPS: Array<{ title: string; note?: string; tokens: string[] }> = [
  { title: 'Surfaces', tokens: ['--color-page', '--color-surface', '--color-surface-2', '--color-surface-3', '--color-surface-raised', '--color-border', '--color-grid', '--color-axis'] },
  { title: 'Ink', tokens: ['--color-ink', '--color-ink-2', '--color-ink-3', '--color-ink-4'] },
  { title: 'Accent', tokens: ['--color-accent', '--color-accent-hover', '--color-accent-active', '--color-accent-text', '--color-accent-soft', '--color-accent-soft-2'] },
  { title: 'Status (reserved — icon + label always)', tokens: ['--color-good', '--color-warning', '--color-serious', '--color-critical'] },
  { title: 'Categorical series (fixed order, CVD-validated)', note: 'Assign in order, never cycle. Past 8, fold into “Other”.', tokens: ['--series-1', '--series-2', '--series-3', '--series-4', '--series-5', '--series-6', '--series-7', '--series-8', '--series-muted'] },
  { title: 'Sequential ramp (one hue, light → dark)', tokens: ['--seq-100', '--seq-150', '--seq-200', '--seq-250', '--seq-300', '--seq-350', '--seq-400', '--seq-450', '--seq-500', '--seq-550', '--seq-600', '--seq-650', '--seq-700'] },
  { title: 'Diverging (blue ↔ red, neutral midpoint)', tokens: ['--div-neg', '--div-neg-soft', '--div-mid', '--div-pos-soft', '--div-pos'] },
  { title: 'Ordinal ramp (stages, tiers)', tokens: ['--ordinal-1', '--ordinal-2', '--ordinal-3', '--ordinal-4', '--ordinal-5'] },
];

const TYPE_SCALE = ['--text-2xs', '--text-xs', '--text-sm', '--text-base', '--text-md', '--text-lg', '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl', '--text-hero'];
const SPACE = ['--space-0-5', '--space-1', '--space-1-5', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-8', '--space-10', '--space-12', '--space-16'];
const RADII = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full'];

function useTokenValues(names: string[]): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setValues(Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()])));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, [names]);
  return values;
}

const ALL_COLORS = COLOR_GROUPS.flatMap((g) => g.tokens);

export function ColorTokens() {
  const values = useTokenValues(ALL_COLORS);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {COLOR_GROUPS.map((g) => (
        <section key={g.title}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>{g.title}</h3>
          {g.note && <p style={{ fontSize: 12, color: 'var(--color-ink-3)', margin: '0 0 8px' }}>{g.note}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {g.tokens.map((t) => (
              <div key={t} style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--color-surface)' }}>
                <div style={{ height: 44, background: `var(${t})` }} />
                <div style={{ padding: '6px 8px', fontSize: 11, lineHeight: 1.3 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>{t}</div>
                  <div style={{ color: 'var(--color-ink-3)' }}>{values[t]}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function TypeTokens() {
  const values = useTokenValues(TYPE_SCALE);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {TYPE_SCALE.map((t) => (
        <div key={t} style={{ display: 'grid', gridTemplateColumns: '120px 60px 1fr', alignItems: 'baseline', gap: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
          <code style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>{t}</code>
          <span style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>{values[t]}</span>
          <span style={{ fontSize: `var(${t})`, fontWeight: t === '--text-hero' || t === '--text-4xl' ? 600 : 500, lineHeight: 1.2, letterSpacing: t.includes('hero') ? '-0.02em' : undefined }}>Revenue intelligence</span>
        </div>
      ))}
    </div>
  );
}

export function SpaceTokens() {
  const values = useTokenValues([...SPACE, ...RADII]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Spacing (8pt grid, 4pt half-steps)</h3>
        {SPACE.map((t) => (
          <div key={t} style={{ display: 'grid', gridTemplateColumns: '110px 40px 1fr', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <code style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>{t}</code>
            <span style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>{values[t]}</span>
            <span style={{ display: 'block', height: 12, width: `var(${t})`, background: 'var(--color-accent)', borderRadius: 2 }} />
          </div>
        ))}
      </div>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Radius</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {RADII.map((t) => (
            <div key={t} style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-ink-3)' }}>
              <div style={{ width: 56, height: 56, borderRadius: `var(${t})`, background: 'var(--color-accent-soft)', border: '1px solid var(--color-accent)', marginBottom: 4 }} />
              <code>{t.replace('--radius-', '')}</code>
              <div>{values[t]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
