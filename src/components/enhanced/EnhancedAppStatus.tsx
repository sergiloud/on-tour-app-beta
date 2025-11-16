import React from 'react';
import { useEnhancedApp } from '../../hooks/useEnhancedApp';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ProgressBar } from '../../ui/ProgressBar';
import { 
  Zap, 
  Wifi, 
  WifiOff, 
  Download, 
  Bell, 
  BellOff, 
  Smartphone, 
  Monitor,
  Database,
  Trash2,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Cpu
} from 'lucide-react';

// Simplified Card components
const CardHeader: React.FC<{children: React.ReactNode; className?: string}> = ({children, className}) => (
  <div className={`pb-2 ${className || ''}`}>{children}</div>
);

const CardTitle: React.FC<{children: React.ReactNode; className?: string}> = ({children, className}) => (
  <h3 className={`font-semibold ${className || ''}`}>{children}</h3>
);

const CardContent: React.FC<{children: React.ReactNode; className?: string}> = ({children, className}) => (
  <div className={className || ''}>{children}</div>
);

export function EnhancedAppStatus() {
  const {
    capabilities,
    isInitializing,
    installPWA,
    enableNotifications,
    clearAppCache,
    getStorageUsage,
    benchmarkEngine,
    isWasmReady,
    isPWAInstallable,
    isOffline,
    isStandalone,
  } = useEnhancedApp();

  const [storageUsage, setStorageUsage] = React.useState<{used: number; quota: number} | null>(null);

  React.useEffect(() => {
    getStorageUsage().then(setStorageUsage);
  }, [getStorageUsage]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A';
    return `${ms.toFixed(2)}ms`;
  };

  const getPerformanceGain = () => {
    const { jsCalculationTime, wasmCalculationTime } = capabilities.performance;
    if (!jsCalculationTime || !wasmCalculationTime) return null;
    return ((jsCalculationTime - wasmCalculationTime) / jsCalculationTime * 100).toFixed(1);
  };

  const getBadgeVariant = (condition: boolean) => condition ? 'success' : 'neutral';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* WebAssembly Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cpu className="h-4 w-4" />
            WebAssembly Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={getBadgeVariant(isWasmReady)} className="flex items-center gap-1">
              {isWasmReady ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {isWasmReady ? 'Active' : capabilities.wasm.fallbackMode ? 'Fallback' : 'Loading'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Supported</span>
            <Badge variant={capabilities.wasm.isSupported ? 'success' : 'danger'}>
              {capabilities.wasm.isSupported ? 'Yes' : 'No'}
            </Badge>
          </div>

          {capabilities.performance.wasmInitTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Init Time</span>
              <span className="text-sm font-medium">
                {formatTime(capabilities.performance.wasmInitTime)}
              </span>
            </div>
          )}

          {getPerformanceGain() && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Performance Gain</span>
              <Badge variant="success">
                +{getPerformanceGain()}%
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PWA Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Smartphone className="h-4 w-4" />
            Progressive Web App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Connection</span>
            <Badge variant={isOffline ? "danger" : "success"} className="flex items-center gap-1">
              {isOffline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {isOffline ? 'Offline' : 'Online'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mode</span>
            <Badge variant={getBadgeVariant(isStandalone)} className="flex items-center gap-1">
              {isStandalone ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
              {isStandalone ? 'App Mode' : 'Browser'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Notifications</span>
            <Badge variant={getBadgeVariant(capabilities.pwa.hasNotifications)}>
              {capabilities.pwa.hasNotifications ? 'Supported' : 'Unsupported'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Background Sync</span>
            <Badge variant={getBadgeVariant(capabilities.pwa.hasBackgroundSync)}>
              {capabilities.pwa.hasBackgroundSync ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Storage & Cache */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Storage & Cache
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {storageUsage && (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-medium">{formatBytes(storageUsage.used)}</span>
                </div>
                <ProgressBar 
                  value={(storageUsage.used / storageUsage.quota)} 
                  height="sm"
                  tone="accent"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formatBytes(storageUsage.quota)} total
                </div>
              </div>
            </>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAppCache}
            className="w-full flex items-center gap-2"
          >
            <Trash2 className="h-3 w-3" />
            Clear Cache
          </Button>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {(capabilities.performance.wasmCalculationTime || capabilities.performance.jsCalculationTime) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {capabilities.performance.wasmCalculationTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">WASM Calc Time</span>
                <span className="text-sm font-medium text-green-600">
                  {formatTime(capabilities.performance.wasmCalculationTime)}
                </span>
              </div>
            )}
            
            {capabilities.performance.jsCalculationTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">JS Calc Time</span>
                <span className="text-sm font-medium text-amber-600">
                  {formatTime(capabilities.performance.jsCalculationTime)}
                </span>
              </div>
            )}

            {getPerformanceGain() && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  🚀 {getPerformanceGain()}% faster with WASM
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isPWAInstallable && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={installPWA}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-3 w-3" />
              Install App
            </Button>
          )}

          {capabilities.pwa.hasNotifications && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={enableNotifications}
              className="w-full flex items-center gap-2"
            >
              <Bell className="h-3 w-3" />
              Enable Notifications
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => benchmarkEngine([])}
            disabled={!isWasmReady}
            className="w-full flex items-center gap-2"
          >
            <Clock className="h-3 w-3" />
            Benchmark Engine
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isInitializing && (
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">
                Initializing enhanced capabilities...
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}