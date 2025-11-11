/**
 * Finance Targets Context - Configuración centralizada de objetivos financieros
 *
 * BENEFICIOS:
 * - Desacoplamiento total: FinanceV2 no necesita gestionar targets
 * - Configuración centralizada: Un solo lugar para modificar objetivos
 * - Escalabilidad: Fácil añadir página de "Configuración de Objetivos"
 * - Persistencia lista: Fácil integrar localStorage/API
 *
 * FLUJO:
 * 1. Provider envuelve el módulo de finanzas
 * 2. useFinanceData consume targets vía useFinanceTargets()
 * 3. Futura página de configuración actualiza targets aquí
 *
 * A PRUEBA DE FUTURO:
 * - Targets dinámicos por usuario
 * - Sincronización con backend
 * - Configuración multi-periodo
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface FinanceTargets {
  /** Objetivo de beneficio neto anual */
  yearNet: number;

  /** Pendiente objetivo */
  pending: number;

  /** Presupuesto de gastos mensual */
  expensesMonth: number;

  /** Objetivo de beneficio neto mensual */
  netMonth: number;

  /** Objetivo de ingresos mensual */
  incomeMonth: number;

  /** Objetivo de costes mensual */
  costsMonth: number;
}

interface FinanceTargetsContextValue {
  /** Objetivos financieros actuales */
  targets: FinanceTargets;

  /** Actualizar todos los objetivos */
  updateTargets: (newTargets: Partial<FinanceTargets>) => void;

  /** Resetear a valores por defecto */
  resetToDefaults: () => void;
}

// Valores por defecto (pueden moverse a config externa más adelante)
const DEFAULT_TARGETS: FinanceTargets = {
  yearNet: 250000,
  pending: 50000,
  expensesMonth: 42000,
  netMonth: 60000,
  incomeMonth: 120000,
  costsMonth: 60000,
};

const FinanceTargetsContext = createContext<FinanceTargetsContextValue | null>(null);

export interface FinanceTargetsProviderProps {
  children: ReactNode;
  /** Targets iniciales (opcional, para testing o configuración externa) */
  initialTargets?: Partial<FinanceTargets>;
}

/**
 * Provider de objetivos financieros
 *
 * TODO (Features futuras):
 * - Persistir en localStorage
 * - Sincronizar con API de usuario
 * - Soportar múltiples perfiles de objetivos
 */
export function FinanceTargetsProvider({
  children,
  initialTargets
}: FinanceTargetsProviderProps) {
  const [targets, setTargets] = useState<FinanceTargets>(() => ({
    ...DEFAULT_TARGETS,
    ...initialTargets,
  }));

  const updateTargets = useCallback((newTargets: Partial<FinanceTargets>) => {
    setTargets(prev => ({
      ...prev,
      ...newTargets,
    }));

    // TODO: Persistir en localStorage
    // localStorage.setItem('finance_targets', JSON.stringify({ ...targets, ...newTargets }));

    // TODO: Sincronizar con backend
    // api.updateUserTargets({ ...targets, ...newTargets });
  }, []);

  const resetToDefaults = useCallback(() => {
    setTargets(DEFAULT_TARGETS);
  }, []);

  const value = useMemo(() => ({
    targets,
    updateTargets,
    resetToDefaults,
  }), [targets, updateTargets, resetToDefaults]);

  return (
    <FinanceTargetsContext.Provider value={value}>
      {children}
    </FinanceTargetsContext.Provider>
  );
}

/**
 * Hook para acceder a los objetivos financieros
 *
 * Uso:
 * ```tsx
 * const { targets, updateTargets } = useFinanceTargets();
 * ```
 */
export function useFinanceTargets(): FinanceTargetsContextValue {
  const context = useContext(FinanceTargetsContext);

  if (!context) {
    throw new Error('useFinanceTargets must be used within FinanceTargetsProvider');
  }

  return context;
}
