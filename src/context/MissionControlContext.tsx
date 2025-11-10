import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export type MissionView = 'upcoming' | 'month' | 'financials';
export interface MissionLayers { heat: boolean; status: boolean; route: boolean; }
export interface MissionFocus { id?: string; lng: number; lat: number }

interface MissionControlState {
  view: MissionView;
  setView: (v: MissionView) => void;
  layers: MissionLayers;
  toggleLayer: (k: keyof MissionLayers) => void;
  focus: MissionFocus | null;
  setFocus: (f: MissionFocus | null) => void;
}

const MissionControlContext = createContext<MissionControlState | undefined>(undefined);

const LS_KEY = 'mission-control-state-v1';
interface PersistShape { view: MissionView; layers: MissionLayers; }

export const MissionControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const booted = useRef(false);
  const [view, setView] = useState<MissionView>('upcoming');
  const [layers, setLayers] = useState<MissionLayers>({ heat: false, status: true, route: true });
  const [focus, setFocus] = useState<MissionFocus | null>(null);

  // hydrate from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed: PersistShape = JSON.parse(raw);
        if (parsed.view) {
          const allowed: MissionView[] = ['upcoming','month','financials'];
          setView(allowed.includes(parsed.view as MissionView) ? (parsed.view as MissionView) : 'upcoming');
        }
        if (parsed.layers) setLayers(parsed.layers);
      }
    } catch {}
    booted.current = true;
  }, []);

  // persist whenever changes occur (after boot)
  useEffect(() => {
    if (!booted.current) return;
    const data: PersistShape = { view, layers };
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
  }, [view, layers]);

  const toggleLayer = useCallback((k: keyof MissionLayers) => {
    setLayers(l => ({ ...l, [k]: !l[k] }));
  }, []);

  return (
  <MissionControlContext.Provider value={{ view, setView, layers, toggleLayer, focus, setFocus }}>
      {children}
    </MissionControlContext.Provider>
  );
};

export const useMissionControl = () => {
  const ctx = useContext(MissionControlContext);
  if (!ctx) throw new Error('useMissionControl must be used within MissionControlProvider');
  return ctx;
};
