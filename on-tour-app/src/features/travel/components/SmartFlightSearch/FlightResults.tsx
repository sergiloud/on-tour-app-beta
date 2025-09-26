import React from 'react';
import type { FlightResult } from '../../../travel/providers/types';
import FlightResultCard from './FlightResultCard';

export const FlightResults: React.FC<{ results: FlightResult[]; onAdd: (r: FlightResult)=>void; onPin?: (r: FlightResult)=>void; pinnedIds?: Set<string> }>=({ results, onAdd, onPin, pinnedIds })=>{
  if (!results.length) return null;
  const onDragStart = (e: React.DragEvent, r: FlightResult) => {
    try {
      // Provide both a custom and a plain payload for compatibility
      const payload = JSON.stringify({ type: 'flight', payload: r });
      e.dataTransfer.setData('application/json', payload);
      e.dataTransfer.setData('text/plain', payload);
      e.dataTransfer.effectAllowed = 'copyMove';
    } catch {}
  };
  return (
    <div role="list" className="space-y-2">
      {results.map(r=> (
        <div key={r.id} draggable onDragStart={(e)=> onDragStart(e, r)} aria-grabbed={false}>
          <FlightResultCard r={r} onAdd={onAdd} onPin={onPin} pinned={pinnedIds?.has(r.id)} />
        </div>
      ))}
    </div>
  );
};

export default FlightResults;
