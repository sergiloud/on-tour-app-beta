import React from 'react';
import { LucideIcon } from 'lucide-react';

export type ShortcutColorScheme = 'accent' | 'amber';

export interface ShortcutButtonProps {
  /** Texto del botón (ej: "Añadir Ingreso") */
  label: string;

  /** Icono de Lucide */
  icon: LucideIcon;

  /** Esquema de color semántico */
  colorScheme?: ShortcutColorScheme;

  /** Callback al hacer clic */
  onClick: () => void;

  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente reutilizable para botones de acceso directo
 * Siguiendo el Design System v2.0
 *
 * Características:
 * - Diseño consistente con gradientes semánticos
 * - Hover states con escalado suave
 * - Iconos y texto alineados profesionalmente
 */
export function ShortcutButton({
  label,
  icon: Icon,
  colorScheme = 'accent',
  onClick,
  className = '',
}: ShortcutButtonProps) {
  const colorSchemes = {
    accent: {
      bg: 'bg-gradient-to-r from-accent-500 to-accent-600',
      hover: 'hover:from-accent-600 hover:to-accent-700',
      shadow: 'shadow-accent-500/25',
    },
    amber: {
      bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
      hover: 'hover:from-amber-600 hover:to-amber-700',
      shadow: 'shadow-amber-500/25',
    },
  };

  const colors = colorSchemes[colorScheme];

  return (
    <button
      onClick={onClick}
      className={`
        ${colors.bg} ${colors.hover}
        text-white px-5 py-3 rounded-lg
        flex items-center gap-2
        transition-all duration-200
        hover:scale-105
        shadow-lg ${colors.shadow}
        font-medium text-sm
        ${className}
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
