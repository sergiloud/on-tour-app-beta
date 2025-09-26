import React from 'react';

export const ChartSkeleton: React.FC<{ height?: number }>= ({ height = 240 }) => (
  <div style={{ height, width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
    <div className="skeleton" style={{ height:24, width:'30%' }} />
    <div className="skeleton" style={{ flex:1 }} />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; height?: number }>= ({ rows=8, height=320 }) => (
  <div style={{ height, width:'100%', display:'grid', gap:6 }}>
    <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6}}>
      {Array.from({ length:5 }).map((_,i)=>(<div key={i} className="skeleton" style={{ height:18 }} />))}
    </div>
    <div style={{display:'flex', flexDirection:'column', gap:6, flex:1}}>
      {Array.from({ length: rows }).map((_,i)=>(<div key={i} className="skeleton" style={{ height:18 }} />))}
    </div>
  </div>
);

export const KpiSkeletonRow: React.FC<{ count?: number }>= ({ count=4 }) => (
  <div style={{display:'grid', gap:16, gridTemplateColumns:`repeat(${count}, minmax(120px, 1fr))`}}>
    {Array.from({ length: count }).map((_,i)=>(<div key={i} className="skeleton" style={{ height:64 }} />))}
  </div>
);

export default { ChartSkeleton, TableSkeleton, KpiSkeletonRow };