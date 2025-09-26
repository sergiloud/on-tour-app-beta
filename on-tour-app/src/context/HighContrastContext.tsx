import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type HCContext = { highContrast: boolean; toggleHC: () => void };
const Ctx = createContext<HCContext | null>(null);

export const HighContrastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHC] = useState<boolean>(()=> localStorage.getItem('high-contrast') === '1');
  useEffect(()=>{ localStorage.setItem('high-contrast', highContrast ? '1' : '0');
    document.body.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);
  const value = useMemo(()=>({ highContrast, toggleHC: ()=> setHC(c=>!c) }), [highContrast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useHighContrast(){
  const ctx = useContext(Ctx);
  if(!ctx) throw new Error('useHighContrast must be used within HighContrastProvider');
  return ctx;
}
