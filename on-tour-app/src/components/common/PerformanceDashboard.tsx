/**
 * Performance Monitoring Dashboard
 *
 * Real-time performance metrics visualization:
 * - Web Vitals (LCP, CLS, INP, FCP, TTFB)
 * - Cache statistics (Service Worker)
 * - Worker Pool stats (Finance calculations)
 * - Network status
 * - FPS monitoring
 */

import React, { useEffect, useState } from 'react';
import { useServiceWorker, useOnlineStatus } from '../../lib/serviceWorkerManager';
import { getFinanceWorkerPool } from '../../lib/financeWorkerPool';
import { Card } from '../../ui/Card';

interface WebVitalsMetrics {
    lcp?: number;
    cls?: number;
    inp?: number;
    fcp?: number;
    ttfb?: number;
}

interface FPSStats {
    current: number;
    average: number;
    min: number;
    max: number;
}

export function PerformanceDashboard() {
    const { cacheStats, isUpdateAvailable } = useServiceWorker();
    const { isOnline, hasPendingSync } = useOnlineStatus();

    const [workerStats, setWorkerStats] = useState({ poolSize: 0, busyWorkers: 0, queueSize: 0, totalTasks: 0 });
    const [webVitals, setWebVitals] = useState<WebVitalsMetrics>({});
    const [fps, setFps] = useState<FPSStats>({ current: 60, average: 60, min: 60, max: 60 });
    const [isVisible, setIsVisible] = useState(false);

    // Update worker stats every 2 seconds
    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            try {
                const pool = getFinanceWorkerPool();
                const stats = pool.getStats();
                setWorkerStats(stats);
            } catch (error) {
                console.error('[PerformanceDashboard] Failed to get worker stats:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isVisible]);

    // FPS monitoring
    useEffect(() => {
        if (!isVisible) return;

        let frameCount = 0;
        let lastTime = performance.now();
        let fpsValues: number[] = [];
        let rafId: number;

        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            const delta = currentTime - lastTime;

            if (delta >= 1000) {
                const currentFps = Math.round((frameCount * 1000) / delta);
                fpsValues.push(currentFps);

                // Keep last 10 samples
                if (fpsValues.length > 10) fpsValues.shift();

                const average = Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length);
                const min = Math.min(...fpsValues);
                const max = Math.max(...fpsValues);

                setFps({ current: currentFps, average, min, max });

                frameCount = 0;
                lastTime = currentTime;
            }

            rafId = requestAnimationFrame(measureFPS);
        };

        rafId = requestAnimationFrame(measureFPS);

        return () => cancelAnimationFrame(rafId);
    }, [isVisible]);

    // Load Web Vitals from localStorage (set by webVitals.ts)
    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            try {
                const vitals = localStorage.getItem('web-vitals-latest');
                if (vitals) {
                    setWebVitals(JSON.parse(vitals));
                }
            } catch (error) {
                console.error('[PerformanceDashboard] Failed to load web vitals:', error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow-lg transition-colors"
                title="Show Performance Dashboard"
            >
                📊 Performance
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-[400px] max-h-[600px] overflow-y-auto">
            <Card className="bg-ink-900/95 backdrop-blur-sm border border-white/10 shadow-2xl">
                <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            📊 Performance Monitor
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        </h3>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-white/60 hover:text-white text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* FPS */}
                    <Section title="FPS" icon="🎮">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <Metric label="Current" value={fps.current} unit="fps" good={fps.current >= 55} />
                            <Metric label="Average" value={fps.average} unit="fps" good={fps.average >= 55} />
                            <Metric label="Min" value={fps.min} unit="fps" good={fps.min >= 50} />
                            <Metric label="Max" value={fps.max} unit="fps" />
                        </div>
                        <ProgressBar value={fps.current} max={60} color={fps.current >= 55 ? 'green' : fps.current >= 30 ? 'yellow' : 'red'} />
                    </Section>

                    {/* Service Worker Cache */}
                    {cacheStats && (
                        <Section title="Cache" icon="💾">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <Metric label="Hits" value={cacheStats.hits} />
                                <Metric label="Misses" value={cacheStats.misses} />
                                <Metric label="Hit Rate" value={cacheStats.hitRate} good={parseFloat(cacheStats.hitRate) >= 80} />
                            </div>
                            <ProgressBar
                                value={parseFloat(cacheStats.hitRate)}
                                max={100}
                                color={parseFloat(cacheStats.hitRate) >= 80 ? 'green' : parseFloat(cacheStats.hitRate) >= 60 ? 'yellow' : 'red'}
                            />
                        </Section>
                    )}

                    {/* Worker Pool */}
                    <Section title="Worker Pool" icon="⚙️">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <Metric label="Workers" value={`${workerStats.busyWorkers}/${workerStats.poolSize}`} good={workerStats.busyWorkers < workerStats.poolSize} />
                            <Metric label="Queue" value={workerStats.queueSize} good={workerStats.queueSize === 0} />
                            <Metric label="Total Tasks" value={workerStats.totalTasks} colSpan={2} />
                        </div>
                    </Section>

                    {/* Web Vitals */}
                    {Object.keys(webVitals).length > 0 && (
                        <Section title="Web Vitals" icon="📈">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {webVitals.lcp && <Metric label="LCP" value={Math.round(webVitals.lcp)} unit="ms" good={webVitals.lcp < 2500} />}
                                {webVitals.fcp && <Metric label="FCP" value={Math.round(webVitals.fcp)} unit="ms" good={webVitals.fcp < 1800} />}
                                {webVitals.cls && <Metric label="CLS" value={webVitals.cls.toFixed(3)} good={webVitals.cls < 0.1} />}
                                {webVitals.inp && <Metric label="INP" value={Math.round(webVitals.inp)} unit="ms" good={webVitals.inp < 200} />}
                                {webVitals.ttfb && <Metric label="TTFB" value={Math.round(webVitals.ttfb)} unit="ms" good={webVitals.ttfb < 800} />}
                            </div>
                        </Section>
                    )}

                    {/* Status Indicators */}
                    <Section title="Status" icon="🔔">
                        <div className="space-y-2 text-xs">
                            <StatusItem label="Online" active={isOnline} />
                            <StatusItem label="SW Update" active={isUpdateAvailable} />
                            <StatusItem label="Pending Sync" active={hasPendingSync} />
                        </div>
                    </Section>
                </div>
            </Card>
        </div>
    );
}

// Helper Components

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <h4 className="text-xs font-medium text-white/80 flex items-center gap-2">
                <span>{icon}</span>
                {title}
            </h4>
            <div className="bg-white/5 rounded-lg p-3">
                {children}
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
    unit,
    good,
    colSpan
}: {
    label: string;
    value: string | number;
    unit?: string;
    good?: boolean;
    colSpan?: number;
}) {
    const colorClass = good === undefined ? 'text-white/90' : good ? 'text-green-400' : 'text-red-400';

    return (
        <div className={colSpan ? `col-span-${colSpan}` : ''}>
            <div className="text-white/60 text-[10px] mb-0.5">{label}</div>
            <div className={`font-mono font-semibold ${colorClass}`}>
                {value}{unit && <span className="text-white/40 ml-0.5">{unit}</span>}
            </div>
        </div>
    );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: 'green' | 'yellow' | 'red' }) {
    const percentage = Math.min((value / max) * 100, 100);
    const colorClasses = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500'
    };

    return (
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
                className={`h-full ${colorClasses[color]} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}

function StatusItem({ label, active }: { label: string; active: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-white/70">{label}</span>
            <span className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-white/20'}`} />
        </div>
    );
}

// Mini version for development
export function PerformanceBadgeMini() {
    const { cacheStats } = useServiceWorker();
    const { isOnline } = useOnlineStatus();
    const [fps, setFps] = useState(60);

    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let rafId: number;

        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            const delta = currentTime - lastTime;

            if (delta >= 1000) {
                setFps(Math.round((frameCount * 1000) / delta));
                frameCount = 0;
                lastTime = currentTime;
            }

            rafId = requestAnimationFrame(measureFPS);
        };

        rafId = requestAnimationFrame(measureFPS);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-ink-900/90 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs font-mono shadow-lg">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-white/60">FPS:</span>
                    <span className={fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>
                        {fps}
                    </span>
                </div>
                {cacheStats && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-white/60">Cache:</span>
                        <span className={parseFloat(cacheStats.hitRate) >= 80 ? 'text-green-400' : 'text-yellow-400'}>
                            {cacheStats.hitRate}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
