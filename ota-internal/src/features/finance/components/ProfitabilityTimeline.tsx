import React, { useMemo } from 'react';
import { useFinanceCore } from '../core/finance-core';
import { selectProfitabilityTimeline } from '../core/finance-selectors';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const ProfitabilityTimeline: React.FC<{ height?: number }>= ({ height = 220 }) => {
  const { snapshot } = useFinanceCore();
  const data = useMemo(() => snapshot ? selectProfitabilityTimeline(snapshot) : [], [snapshot]);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top:10, right:20, left:0, bottom:0 }} className="fin-chart fin-profit-timeline">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--color-text-muted)' }} />
        <YAxis tick={{ fontSize:11, fill:'var(--color-text-muted)' }} tickFormatter={(v)=> v+'%'} />
        <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
          <div className="chart-tooltip">
            <div className="chart-tooltip-title">{label}</div>
            <div className="chart-tooltip-value">Margin {payload[0].payload.marginPct}%</div>
          </div>
        ) : null} />
        <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="marginPct" stroke="var(--finance-positive)" strokeWidth={3} dot={{ r:3 }} name="Margin %" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProfitabilityTimeline;