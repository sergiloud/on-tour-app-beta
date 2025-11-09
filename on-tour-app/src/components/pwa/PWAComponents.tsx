import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '../../lib/logger';

/**
 * PWA Install Prompt Component
 * Shows install banner when PWA is installable
 */
export const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Check if user has dismissed before
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            logger.info('User accepted PWA install prompt', { component: 'PWAInstallPrompt' });
        } else {
            logger.info('User dismissed PWA install prompt', { component: 'PWAInstallPrompt' });
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
            >
                <div className="glass rounded-xl p-4 border border-accent-500/30 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                            <Download className="w-5 h-5 text-accent-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1">Install OnTour App</h3>
                            <p className="text-xs opacity-70 mb-3">
                                Install this app for offline access and a better experience
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 px-3 py-2 rounded-lg bg-accent-500 text-black font-semibold text-xs hover:brightness-95 transition-all"
                                >
                                    Install
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 text-xs transition-all"
                                >
                                    Not now
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-slate-300 dark:text-white/50 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Online/Offline Indicator Component
 * Shows connection status and provides feedback
 */
export const OnlineStatusIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowNotification(true);
            // Keep offline notification visible longer
            setTimeout(() => setShowNotification(false), 5000);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Don't show anything if online and no recent status change
    if (isOnline && !showNotification) return null;

    return (
        <AnimatePresence>
            {(showNotification || !isOnline) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
                >
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-md ${isOnline
                            ? 'bg-green-500/90 text-white'
                            : 'bg-amber-500/90 text-black'
                            }`}
                    >
                        {isOnline ? (
                            <>
                                <Wifi className="w-4 h-4" />
                                <span className="text-sm font-medium">Back online</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Offline mode - Using cached data
                                </span>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/**
 * PWA Update Prompt Component
 * Shows notification when new version is available
 */
export const PWAUpdatePrompt: React.FC = () => {
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Listen for service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
                setRegistration(reg);

                // Check for updates periodically (every 1 hour)
                setInterval(() => {
                    reg.update();
                }, 60 * 60 * 1000);

                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker installed, show update prompt
                            setShowUpdatePrompt(true);
                        }
                    });
                });
            });
        }
    }, []);

    const handleUpdate = () => {
        if (registration && registration.waiting) {
            // Tell the service worker to skip waiting
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });

            // Reload the page to use new service worker
            window.location.reload();
        }
    };

    if (!showUpdatePrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
            >
                <div className="glass rounded-xl p-4 border border-blue-500/30 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Download className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1">Update Available</h3>
                            <p className="text-xs opacity-70 mb-3">
                                A new version of OnTour is ready to install
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 px-3 py-2 rounded-lg bg-blue-500 text-white font-semibold text-xs hover:brightness-95 transition-all"
                                >
                                    Update Now
                                </button>
                                <button
                                    onClick={() => setShowUpdatePrompt(false)}
                                    className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 text-xs transition-all"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowUpdatePrompt(false)}
                            className="text-slate-300 dark:text-white/50 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Combined PWA Components
 * Renders all PWA-related UI elements
 */
export const PWAComponents: React.FC = () => {
    return (
        <>
            <OnlineStatusIndicator />
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
        </>
    );
};
