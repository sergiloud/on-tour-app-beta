import React from 'react';

export type TripSummaryBadgeProps = {
  path: string[]; // e.g., ["MAD","BCN","LIS"]
  className?: string;
};

const TripSummaryBadge: React.FC<TripSummaryBadgeProps> = ({ path, className }) => {
  if (!path || path.length === 0) return null;
  return (
    <div className={"inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-white/5 " + (className||'')} aria-label={path.join(' → ')}>
      {path.map((p, i) => (
        <React.Fragment key={p + i}>
          <span className="opacity-90">{p}</span>
          {i < path.length - 1 && <span className="opacity-50">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TripSummaryBadge;
