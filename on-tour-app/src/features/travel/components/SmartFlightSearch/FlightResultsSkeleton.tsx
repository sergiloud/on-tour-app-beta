import React from 'react';

export const FlightResultsSkeleton: React.FC = () => {
  return (
    <div role="list" className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="glass rounded-lg p-3 flex flex-col sm:flex-row gap-3 animate-pulse"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Airline and carrier info skeleton */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 bg-white/10 rounded w-32"></div>
              <div className="h-3 bg-white/5 rounded w-16"></div>
            </div>

            {/* Flight times skeleton */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="h-3 bg-white/5 rounded w-4"></div>
                <div className="h-4 bg-white/10 rounded w-20"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 bg-white/5 rounded w-4"></div>
                <div className="h-3 bg-white/5 rounded w-16"></div>
              </div>
            </div>

            {/* Progress bar skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-2 bg-white/10 rounded-full flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Price and actions skeleton */}
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 bg-white/10 rounded w-16"></div>
            <div className="h-8 bg-white/5 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightResultsSkeleton;