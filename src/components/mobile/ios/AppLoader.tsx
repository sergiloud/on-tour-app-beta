import React, { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { AppDefinition, AppComponentProps } from '../../../types/mobileOS';

interface AppLoaderProps {
  app: AppDefinition;
  onClose?: () => void;
  isActive?: boolean;
}

// Loading skeleton optimizado
const AppLoadingSkeleton: React.FC<{ appName: string; icon: any }> = ({ appName, icon: Icon }) => (
  <div className="h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center gap-4"
    >
      {/* App Icon */}
      <motion.div
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 backdrop-blur-sm border border-accent-500/30 flex items-center justify-center shadow-lg shadow-accent-500/20"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Icon className="w-10 h-10 text-accent-500" strokeWidth={2} />
      </motion.div>

      {/* App Name */}
      <motion.p
        className="text-sm font-medium text-white/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Cargando {appName}...
      </motion.p>

      {/* Loading dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-accent-500/60"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  </div>
);

// Error boundary para apps
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode; appName: string; icon: any },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error loading ${this.props.appName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Icon = this.props.icon;
      return (
        <div className="h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col items-center justify-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-red-400" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Error al cargar {this.props.appName}
          </h3>
          <p className="text-sm text-white/50 text-center mb-4">
            Hubo un problema al cargar esta aplicación
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent-500 text-black rounded-lg font-medium text-sm hover:bg-accent-600 transition-colors"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AppLoader: React.FC<AppLoaderProps> = ({ app, onClose, isActive = true }) => {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const AppComponent = app.component;

  // Marcar como precargado después del primer render
  useEffect(() => {
    setIsPreloaded(true);
  }, []);

  return (
    <AppErrorBoundary appName={app.name} icon={app.icon}>
      <Suspense fallback={<AppLoadingSkeleton appName={app.name} icon={app.icon} />}>
        <div 
          className="h-full"
          style={{ 
            willChange: isPreloaded ? 'auto' : 'transform, opacity',
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
        >
          <AppComponent onClose={onClose} isActive={isActive} />
        </div>
      </Suspense>
    </AppErrorBoundary>
  );
};
