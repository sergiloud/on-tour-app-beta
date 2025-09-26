import React, { createContext, useContext, useMemo } from 'react';

// Variants describe ordering of primary identity/financial fields.
// Default ("A"): name -> status -> city -> country -> date -> fee -> wht
// Variant ("B"): date -> city -> country -> fee -> name -> status -> wht (example emphasis on scheduling first)
export type FieldOrderVariant = 'A' | 'B';

interface FieldOrderContextValue {
  variant: FieldOrderVariant;
  order: string[]; // array of canonical field keys in render order
}

const FieldOrderContext = createContext<FieldOrderContextValue | null>(null);

export interface FieldOrderProviderProps { variant?: FieldOrderVariant; children: React.ReactNode }

export const FieldOrderProvider: React.FC<FieldOrderProviderProps> = ({ variant = 'A', children }) => {
  const order = useMemo(()=> {
    if(variant === 'B') return ['date','city','country','fee','name','status','whtPct'];
    return ['name','status','city','country','date','fee','whtPct'];
  }, [variant]);
  return <FieldOrderContext.Provider value={{ variant, order }}>{children}</FieldOrderContext.Provider>;
};

export function useFieldOrder(){
  const ctx = useContext(FieldOrderContext);
  if(!ctx) return { variant: 'A' as FieldOrderVariant, order: ['name','status','city','country','date','fee','whtPct'] };
  return ctx;
}

// Utility to sort an array of field configs by current order
export function sortByFieldOrder<T extends { key: string }>(items: T[], order: string[]): T[] {
  const index: Record<string, number> = {};
  order.forEach((k,i)=> { index[k] = i; });
  return [...items].sort((a,b)=> (index[a.key] ?? 999) - (index[b.key] ?? 999));
}
