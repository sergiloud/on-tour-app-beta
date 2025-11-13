/**
 * Centralized Logging Service
 * Reemplaza console.log directo con logging estructurado
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    component?: string;
    action?: string;
    userId?: string;
    [key: string]: any;
}

class Logger {
    private isDevelopment = import.meta.env.DEV;
    private isProduction = import.meta.env.PROD;

    /**
     * Log debug messages (solo en desarrollo)
     */
    debug(message: string, context?: LogContext) {
        if (this.isDevelopment) {
            console.log(`[DEBUG] ${message}`, context || '');
        }
    }

    /**
     * Log info messages
     */
    info(message: string, context?: LogContext) {
        if (this.isDevelopment) {
            console.log(`[INFO] ${message}`, context || '');
        }
        // En producción, enviar a servicio de logging (Sentry, LogRocket, etc)
        if (this.isProduction) {
            this.sendToLoggingService('info', message, context);
        }
    }

    /**
     * Log warning messages
     */
    warn(message: string, context?: LogContext) {
        console.warn(`[WARN] ${message}`, context || '');
        if (this.isProduction) {
            this.sendToLoggingService('warn', message, context);
        }
    }

    /**
     * Log error messages
     */
    error(message: string, error?: Error, context?: LogContext) {
        console.error(`[ERROR] ${message}`, error || '', context || '');
        if (this.isProduction) {
            this.sendToLoggingService('error', message, { ...context, error: error?.message, stack: error?.stack });
        }
    }

    /**
     * Log performance metrics
     */
    performance(metric: string, duration: number, context?: LogContext) {
        if (this.isDevelopment) {
            console.log(`[PERF] ${metric}: ${duration}ms`, context || '');
        }
        if (this.isProduction && duration > 1000) {
            // Solo log de operaciones lentas en producción
            this.sendToLoggingService('info', `Performance: ${metric}`, { ...context, duration });
        }
    }

    /**
     * Enviar logs a servicio externo (implementar según necesidad)
     */
    private sendToLoggingService(level: LogLevel, message: string, context?: any) {
        // Sentry integration for production error tracking
        if (this.isProduction && typeof window !== 'undefined') {
            try {
                // Check if Sentry is available (loaded via CDN or npm)
                const Sentry = (window as any).Sentry;
                
                if (Sentry) {
                    // Send to Sentry based on log level
                    if (level === 'error') {
                        Sentry.captureException(new Error(message), {
                            level: 'error',
                            extra: context,
                            tags: {
                                component: context?.component || 'unknown',
                                userId: context?.userId || 'anonymous'
                            }
                        });
                    } else if (level === 'warn') {
                        Sentry.captureMessage(message, {
                            level: 'warning',
                            extra: context,
                            tags: {
                                component: context?.component || 'unknown'
                            }
                        });
                    } else if (level === 'info') {
                        // Only send critical info events to Sentry (avoid noise)
                        if (context?.critical) {
                            Sentry.captureMessage(message, {
                                level: 'info',
                                extra: context
                            });
                        }
                    }
                }
            } catch (sentryError) {
                // Silently fail if Sentry is not available or fails
                console.warn('[Logger] Sentry integration failed:', sentryError);
            }
        }

        // Store logs in localStorage for debugging (dev + production)
        if (typeof window !== 'undefined') {
            try {
                const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
                logs.push({
                    timestamp: new Date().toISOString(),
                    level,
                    message,
                    context
                });
                // Mantener solo los últimos 100 logs
                if (logs.length > 100) logs.shift();
                localStorage.setItem('app_logs', JSON.stringify(logs));
            } catch {
                // Si falla localStorage, no hacer nada
            }
        }
    }

    /**
     * Obtener logs almacenados (útil para debugging)
     */
    getLogs(): Array<{ timestamp: string; level: LogLevel; message: string; context?: any }> {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem('app_logs') || '[]');
        } catch {
            return [];
        }
    }

    /**
     * Limpiar logs almacenados
     */
    clearLogs() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('app_logs');
        }
    }
}

// Exportar instancia singleton
export const logger = new Logger();

// Exportar tipos
export type { LogLevel, LogContext };
