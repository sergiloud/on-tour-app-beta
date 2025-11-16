import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { slideUp } from '../../lib/animations';

export type ColorScheme = 'accent' | 'amber' | 'blue' | 'purple';

export interface KPICardProps {
  /** Título de la KPI (ej: "Ingresos Totales") */
  title: string;

  /** Valor principal formateado (ej: "€120,450") */
  value: string;

  /** Descripción adicional opcional */
  description?: string;

  /** Icono de Lucide */
  icon: LucideIcon;

  /** Esquema de color semántico */
  colorScheme?: ColorScheme;

  /** Mostrar indicador de progreso opcional */
  progress?: {
    current: number;
    target: number;
    label?: string;
  };

  /** Datos de comparación opcional (para Period Comparison) */
  comparison?: {
    value: number; // Valor del período de comparación
    delta: number; // Diferencia absoluta (puede ser negativa)
    deltaPercent: number; // Diferencia porcentual
    mode: 'previous' | 'yearAgo'; // Tipo de comparación
  };

  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente reutilizable para tarjetas KPI siguiendo el Design System v2.0
 *
 * Características:
 * - Diseño consistente con header v2.0 (w-10 h-10 rounded-xl icon)
 * - Soporte para múltiples esquemas de color semánticos
 * - Opcional: barra de progreso
 * - Animación de entrada con framer-motion
 */
export const KPICard = React.memo(function KPICard({
  title,
  value,
  description,
  icon: Icon,
  colorScheme = 'accent',
  progress,
  comparison,
  className = '',
}: KPICardProps) {
  // Mapeo de esquemas de color a clases Tailwind
  const colorSchemes = {
    accent: {
      gradient: 'from-accent-500/20 to-accent-600/10',
      icon: 'text-accent-400',
      value: 'text-accent-400',
      border: 'hover:border-accent-500/30',
    },
    amber: {
      gradient: 'from-amber-500/20 to-amber-600/10',
      icon: 'text-amber-400',
      value: 'text-amber-400',
      border: 'hover:border-amber-500/30',
    },
    blue: {
      gradient: 'from-blue-500/20 to-blue-600/10',
      icon: 'text-blue-400',
      value: 'text-blue-400',
      border: 'hover:border-blue-500/30',
    },
    purple: {
      gradient: 'from-purple-500/20 to-purple-600/10',
      icon: 'text-purple-400',
      value: 'text-purple-400',
      border: 'hover:border-purple-500/30',
    },
  };

  const colors = colorSchemes[colorScheme];

  // Determine comparison trend
  const getTrendIcon = () => {
    if (!comparison) return null;
    if (comparison.delta > 0) return TrendingUp;
    if (comparison.delta < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!comparison) return '';
    if (comparison.delta > 0) return 'text-green-400';
    if (comparison.delta < 0) return 'text-red-400';
    return 'text-white/40';
  };

  const getComparisonLabel = () => {
    if (!comparison) return '';
    return comparison.mode === 'previous' ? 'vs. anterior' : 'vs. año pasado';
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      variants={slideUp}
      className={`glass rounded-xl border border-slate-200 dark:border-white/10 p-6 ${colors.border} transition-all ${className}`}
    >
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1.5">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-sm border border-white/5`}
          >
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        </div>
        {description && (
          <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">{description}</p>
        )}
      </div>

      <div className="mb-2">
        <p className={`text-3xl font-bold ${colors.value} tabular-nums`}>{value}</p>

        {/* Comparison Delta */}
        {comparison && TrendIcon && (
          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-semibold tabular-nums">
                {comparison.deltaPercent > 0 ? '+' : ''}
                {comparison.deltaPercent.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-slate-300 dark:text-white/40">{getComparisonLabel()}</span>
          </div>
        )}
      </div>

      {progress && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-300 dark:text-white/50">
              {progress.label || 'Progreso'}
            </span>
            <span className="text-xs text-slate-400 dark:text-white/40 tabular-nums">
              {((progress.current / progress.target) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colors.gradient.replace('/20', '/60').replace('/10', '/40')} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min((progress.current / progress.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
});
