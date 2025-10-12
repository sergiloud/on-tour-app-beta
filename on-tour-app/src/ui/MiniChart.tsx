import React from 'react';

export type MiniChartProps = {
  values: number[];
  tone?: 'emerald'|'rose'|'accent';
  width?: number;
  height?: number;
  title?: string;
  ariaLabel?: string;
  mask?: boolean;
};

const toneStroke: Record<string,string> = {
  emerald: 'var(--tw-emerald-500, currentColor)',
  rose: 'var(--tw-rose-500, currentColor)',
  accent: 'var(--tw-accent-500, currentColor)'
};

export const MiniChart: React.FC<MiniChartProps> = React.memo(({ values, tone='accent', width=80, height=24, title, ariaLabel, mask }) => {
  // Guard against empty or single-point arrays to avoid division by zero (safe.length-1)
  const safe = Array.isArray(values) && values.length > 0 ? values : [0, 0];
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const norm = (v: number) => (max === min) ? 0.5 : (v - min) / (max - min);
  const denom = Math.max(1, safe.length - 1);
  const innerW = Math.max(2, width - 2);
  const innerH = Math.max(4, height - 4);
  const pts = safe.map((v, i) => {
    const x = (i / denom) * innerW + 1;
    const y = (1 - norm(v)) * innerH + 2;
    // Ensure finite numbers
    const xf = Number.isFinite(x) ? x : 1;
    const yf = Number.isFinite(y) ? y : height / 2;
    return `${xf},${yf}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label={ariaLabel} role="img">
      {title && <title>{title}</title>}
      <desc>{mask ? 'values hidden' : 'sparkline of recent values'}</desc>
      <polyline
        fill="none"
        stroke={toneStroke[tone]}
        strokeWidth={2}
        points={pts}
      />
    </svg>
  );
});

export default MiniChart;
