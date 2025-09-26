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
  const safe = values.length ? values : [0];
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const norm = (v: number) => max===min ? 0.5 : (v - min) / (max - min);
  const pts = safe.map((v, i) => `${(i/(safe.length-1))*(width-2)+1},${(1-norm(v))*(height-4)+2}`).join(' ');
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
