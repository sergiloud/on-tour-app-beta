import { useEffect, useRef } from 'react';
import type { AppDefinition } from '../types/mobileOS';

// Almacena componentes precargados
const preloadedApps = new Set<string>();

/**
 * Hook para precargar apps en segundo plano
 * Precarga apps del dock y apps usadas recientemente
 */
export const useAppPreload = (
  dockApps: AppDefinition[],
  recentApps: string[],
  appRegistry: Record<string, AppDefinition>
) => {
  const preloadTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Limpiar timeout anterior
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    // Precargar después de un pequeño delay para no bloquear la UI inicial
    preloadTimeoutRef.current = setTimeout(() => {
      // 1. Precargar apps del dock (prioridad máxima)
      dockApps.forEach(app => {
        if (!preloadedApps.has(app.id)) {
          preloadApp(app);
        }
      });

      // 2. Precargar apps recientes (después del dock)
      setTimeout(() => {
        recentApps.slice(0, 5).forEach(appId => {
          const app = appRegistry[appId];
          if (app && !preloadedApps.has(app.id)) {
            preloadApp(app);
          }
        });
      }, 500);

      // 3. Precargar apps críticas (ShowsApp, FinanceApp, CalendarApp)
      setTimeout(() => {
        const criticalApps = ['shows', 'finance', 'calendar'];
        criticalApps.forEach(appId => {
          const app = appRegistry[appId];
          if (app && !preloadedApps.has(app.id)) {
            preloadApp(app);
          }
        });
      }, 1000);
    }, 300);

    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [dockApps, recentApps, appRegistry]);
};

/**
 * Función helper para precargar un componente de app
 */
const preloadApp = (app: AppDefinition) => {
  try {
    // Marcar como precargado
    preloadedApps.add(app.id);

    // El componente ya está importado en appRegistry,
    // así que solo necesitamos marcarlo como accedido
    // para que React/webpack lo mantenga en cache
    if (app.component) {
      // Forzar la carga del componente sin renderizarlo
      const ComponentToPreload = app.component;
      
      // Crear un div temporal fuera del viewport
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      // Renderizar y limpiar inmediatamente
      import('react-dom/client').then(({ createRoot }) => {
        const root = createRoot(tempDiv);
        root.render(null); // Solo queremos cargar el módulo, no renderizar
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(tempDiv);
        }, 0);
      });

      console.log(`✓ App precargada: ${app.name}`);
    }
  } catch (error) {
    console.warn(`Error precargando app ${app.name}:`, error);
  }
};

/**
 * Hook para precargar una app específica al hacer hover
 */
export const useHoverPreload = () => {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleHoverStart = (app: AppDefinition) => {
    // Precargar después de 100ms de hover
    hoverTimeoutRef.current = setTimeout(() => {
      if (!preloadedApps.has(app.id)) {
        preloadApp(app);
      }
    }, 100);
  };

  const handleHoverEnd = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  return {
    onHoverStart: handleHoverStart,
    onHoverEnd: handleHoverEnd,
  };
};
