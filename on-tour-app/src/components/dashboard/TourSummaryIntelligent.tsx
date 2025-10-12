import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Zap, Target, AlertCircle, CheckCircle2,
    Calendar, DollarSign, MapPin, Clock, ArrowRight, Sparkles, Brain,
    Activity, BarChart3, Percent, Award, AlertTriangle, Info
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { showStore } from '../../shared/showStore';
import { useSettings } from '../../context/SettingsContext';
import { getCurrentOrgId } from '../../lib/tenants';
import { Link } from 'react-router-dom';

// AI-powered tour health scoring system
interface TourHealth {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    factors: {
        bookingRate: number;
        revenueHealth: number;
        conversion: number;
        timing: number;
    };
    insights: string[];
    recommendations: string[];
}

interface SmartAlert {
    id: string;
    type: 'opportunity' | 'warning' | 'critical' | 'info';
    title: string;
    message: string;
    action?: { label: string; link: string };
    impact?: 'high' | 'medium' | 'low';
}

interface Prediction {
    metric: string;
    current: number;
    predicted: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
}

const STAGE_PROB: Record<string, number> = {
    confirmed: 1.0,
    pending: 0.6,
    offer: 0.3,
    canceled: 0,
    archived: 0
};

export const TourSummaryIntelligent: React.FC = () => {
    const { fmtMoney } = useSettings();
    const [selectedView, setSelectedView] = useState<'overview' | 'health' | 'predictions'>('overview');
    const orgId = getCurrentOrgId();

    const intelligence = useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        const in30 = now + 30 * DAY;
        const in90 = now + 90 * DAY;
        const in180 = now + 180 * DAY;
        const past30 = now - 30 * DAY;
        const past90 = now - 90 * DAY;

        const allShows = showStore.getAll().filter((s: any) => !s.tenantId || s.tenantId === orgId);

        // Time windows
        const upcoming30 = allShows.filter(s => {
            const t = new Date(s.date).getTime();
            return t >= now && t <= in30;
        });

        const upcoming90 = allShows.filter(s => {
            const t = new Date(s.date).getTime();
            return t >= now && t <= in90;
        });

        const upcoming180 = allShows.filter(s => {
            const t = new Date(s.date).getTime();
            return t >= now && t <= in180;
        });

        const recent30 = allShows.filter(s => {
            const t = new Date(s.date).getTime();
            return t >= past30 && t < now;
        });

        const recent90 = allShows.filter(s => {
            const t = new Date(s.date).getTime();
            return t >= past90 && t < now;
        });

        // Core metrics
        const totalRevenue30 = upcoming30.reduce((sum, s) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);
        const totalRevenue90 = upcoming90.reduce((sum, s) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);
        const totalRevenue180 = upcoming180.reduce((sum, s) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);

        const confirmedRevenue30 = upcoming30.filter(s => s.status === 'confirmed').reduce((sum, s) => sum + s.fee, 0);
        const confirmedRevenue90 = upcoming90.filter(s => s.status === 'confirmed').reduce((sum, s) => sum + s.fee, 0);

        const pastRevenue30 = recent30.filter(s => s.status === 'confirmed').reduce((sum, s) => sum + s.fee, 0);
        const pastRevenue90 = recent90.filter(s => s.status === 'confirmed').reduce((sum, s) => sum + s.fee, 0);

        // Calculate health score (0-100)
        const calculateHealth = (): TourHealth => {
            // Factor 1: Booking rate (0-30 points)
            const bookingRate = upcoming90.length > 0 ? (upcoming90.filter(s => s.status === 'confirmed').length / upcoming90.length) : 0;
            const bookingScore = bookingRate * 30;

            // Factor 2: Revenue health (0-30 points)
            const avgShowValue = upcoming90.length > 0 ? totalRevenue90 / upcoming90.length : 0;
            const targetValue = 5000; // Benchmark
            const revenueScore = Math.min((avgShowValue / targetValue) * 30, 30);

            // Factor 3: Conversion rate (0-25 points)
            const totalOffers = upcoming90.filter(s => s.status === 'offer').length;
            const conversionRate = totalOffers > 0 ? (upcoming90.filter(s => s.status === 'confirmed').length / (totalOffers + upcoming90.filter(s => s.status === 'confirmed').length)) : 1;
            const conversionScore = conversionRate * 25;

            // Factor 4: Timing/pipeline (0-15 points)
            const has30DayBuffer = upcoming30.length >= 3;
            const has90DayPipeline = upcoming90.length >= 8;
            const timingScore = (has30DayBuffer ? 7.5 : 0) + (has90DayPipeline ? 7.5 : 0);

            const totalScore = Math.round(bookingScore + revenueScore + conversionScore + timingScore);

            let grade: TourHealth['grade'] = 'F';
            let status: TourHealth['status'] = 'critical';
            if (totalScore >= 90) { grade = 'A'; status = 'excellent'; }
            else if (totalScore >= 80) { grade = 'B'; status = 'good'; }
            else if (totalScore >= 70) { grade = 'C'; status = 'fair'; }
            else if (totalScore >= 60) { grade = 'D'; status = 'poor'; }

            const insights: string[] = [];
            const recommendations: string[] = [];

            if (bookingRate < 0.5) {
                insights.push('Low confirmation rate detected');
                recommendations.push('Follow up on pending shows to improve booking rate');
            }
            if (avgShowValue < targetValue * 0.7) {
                insights.push('Below-average show values');
                recommendations.push('Focus on higher-value venues and negotiate better fees');
            }
            if (upcoming30.length < 3) {
                insights.push('Thin pipeline for next 30 days');
                recommendations.push('Urgently book more shows to maintain momentum');
            }
            if (conversionRate < 0.4 && totalOffers > 0) {
                insights.push('Low offer conversion rate');
                recommendations.push('Review offer strategy and follow up more aggressively');
            }

            if (totalScore >= 85) {
                insights.push('Tour is performing exceptionally well');
                recommendations.push('Maintain current momentum and explore expansion opportunities');
            }

            return {
                score: totalScore,
                grade,
                status,
                factors: {
                    bookingRate: Math.round(bookingRate * 100),
                    revenueHealth: Math.round(revenueScore / 30 * 100),
                    conversion: Math.round(conversionRate * 100),
                    timing: Math.round(timingScore / 15 * 100)
                },
                insights,
                recommendations
            };
        };

        // Smart alerts
        const generateAlerts = (): SmartAlert[] => {
            const alerts: SmartAlert[] = [];

            // Critical: No shows in next 14 days
            const next14Days = allShows.filter(s => {
                const t = new Date(s.date).getTime();
                return t >= now && t <= now + 14 * DAY;
            });
            if (next14Days.length === 0) {
                alerts.push({
                    id: 'no-shows-14d',
                    type: 'critical',
                    title: 'Schedule Gap Detected',
                    message: 'No shows scheduled for the next 14 days',
                    action: { label: 'Book Shows', link: '/dashboard/shows' },
                    impact: 'high'
                });
            }

            // Opportunity: High-value pending shows
            const highValuePending = upcoming30.filter(s => s.status === 'pending' && s.fee > 8000);
            if (highValuePending.length > 0) {
                alerts.push({
                    id: 'high-value-pending',
                    type: 'opportunity',
                    title: `${highValuePending.length} High-Value Shows Pending`,
                    message: `${fmtMoney(highValuePending.reduce((sum, s) => sum + s.fee, 0))} potential revenue at risk`,
                    action: { label: 'Review', link: '/dashboard/shows?filter=pending' },
                    impact: 'high'
                });
            }

            // Warning: Low pipeline for 60-90 day window
            const pipeline60_90 = allShows.filter(s => {
                const t = new Date(s.date).getTime();
                return t >= now + 60 * DAY && t <= in90;
            });
            if (pipeline60_90.length < 5) {
                alerts.push({
                    id: 'low-pipeline-60-90',
                    type: 'warning',
                    title: 'Weak Future Pipeline',
                    message: `Only ${pipeline60_90.length} shows in 60-90 day window`,
                    action: { label: 'Plan Ahead', link: '/dashboard/shows' },
                    impact: 'medium'
                });
            }

            // Info: Revenue milestone approaching
            if (confirmedRevenue90 >= 45000 && confirmedRevenue90 < 50000) {
                alerts.push({
                    id: 'milestone-50k',
                    type: 'info',
                    title: 'Revenue Milestone Near',
                    message: `${fmtMoney(50000 - confirmedRevenue90)} away from €50K confirmed`,
                    impact: 'low'
                });
            }

            return alerts.slice(0, 4); // Show top 4 alerts
        };

        // Predictions
        const generatePredictions = (): Prediction[] => {
            // Simple ML-like predictions based on trends
            const revenueGrowth = pastRevenue30 > 0 ? ((totalRevenue30 - pastRevenue30) / pastRevenue30) : 0;
            const predictedRevenue90 = totalRevenue90 * (1 + revenueGrowth * 0.5);

            const showGrowth = recent30.length > 0 ? ((upcoming30.length - recent30.length) / recent30.length) : 0;
            const predictedShows90 = Math.max(0, Math.round(upcoming90.length * (1 + showGrowth * 0.3)));

            return [
                {
                    metric: '90-Day Revenue',
                    current: totalRevenue90,
                    predicted: predictedRevenue90,
                    confidence: pastRevenue30 > 0 ? 0.75 : 0.4,
                    trend: predictedRevenue90 > totalRevenue90 ? 'up' : predictedRevenue90 < totalRevenue90 ? 'down' : 'stable'
                },
                {
                    metric: 'Show Count',
                    current: upcoming90.length,
                    predicted: predictedShows90,
                    confidence: recent30.length > 0 ? 0.70 : 0.35,
                    trend: predictedShows90 > upcoming90.length ? 'up' : predictedShows90 < upcoming90.length ? 'down' : 'stable'
                },
                {
                    metric: 'Avg Show Value',
                    current: upcoming90.length > 0 ? totalRevenue90 / upcoming90.length : 0,
                    predicted: predictedShows90 > 0 ? predictedRevenue90 / predictedShows90 : 0,
                    confidence: 0.65,
                    trend: 'stable'
                }
            ];
        };

        const health = calculateHealth();
        const alerts = generateAlerts();
        const predictions = generatePredictions();

        // Quick stats
        const stats = {
            revenue30: totalRevenue30,
            revenue90: totalRevenue90,
            revenue180: totalRevenue180,
            confirmed30: confirmedRevenue30,
            confirmed90: confirmedRevenue90,
            shows30: upcoming30.length,
            shows90: upcoming90.length,
            shows180: upcoming180.length,
            pending: upcoming90.filter(s => s.status === 'pending').length,
            offers: upcoming90.filter(s => s.status === 'offer').length,
            growth: pastRevenue30 > 0 ? ((totalRevenue30 - pastRevenue30) / pastRevenue30) * 100 : 0
        };

        return { health, alerts, predictions, stats };
    }, [orgId, fmtMoney]);

    const healthColor = {
        excellent: { bg: 'from-green-500/20 to-emerald-600/10', border: 'border-green-500/40', text: 'text-green-400', icon: 'text-green-500' },
        good: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/40', text: 'text-blue-400', icon: 'text-blue-500' },
        fair: { bg: 'from-amber-500/20 to-yellow-600/10', border: 'border-amber-500/40', text: 'text-amber-400', icon: 'text-amber-500' },
        poor: { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/40', text: 'text-orange-400', icon: 'text-orange-500' },
        critical: { bg: 'from-red-500/20 to-red-600/10', border: 'border-red-500/40', text: 'text-red-400', icon: 'text-red-500' }
    }[intelligence.health.status];

    const alertConfig = {
        critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
        warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
        opportunity: { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
        info: { icon: Info, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' }
    };

    return (
        <Card className="p-0 flex flex-col overflow-hidden">
            {/* Gradient Header with AI Badge */}
            <header className="px-5 pt-5 pb-4 bg-gradient-to-r from-purple-900/30 via-slate-900/50 to-slate-800/30 border-b border-white/5 relative overflow-hidden">
                {/* Animated background effect */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-bold tracking-tight">Tour Intelligence</h3>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                                AI Powered
                            </span>
                        </div>
                    </div>

                    {/* View Tabs */}
                    <div className="flex gap-2">
                        {(['overview', 'health', 'predictions'] as const).map(view => (
                            <button
                                key={view}
                                onClick={() => setSelectedView(view)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedView === view
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                    : 'glass hover:bg-white/10 opacity-70'
                                    }`}
                            >
                                {view === 'overview' && '📊 Overview'}
                                {view === 'health' && '💊 Health Score'}
                                {view === 'predictions' && '🔮 Predictions'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="p-5">
                <AnimatePresence mode="wait">
                    {/* Overview View */}
                    {selectedView === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="glass rounded-lg p-3 border border-white/5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Calendar className="w-3 h-3 text-blue-400" />
                                        <span className="text-[10px] uppercase tracking-wide opacity-70">30 Days</span>
                                    </div>
                                    <div className="text-lg font-bold">{intelligence.stats.shows30}</div>
                                    <div className="text-xs text-accent-400 font-medium">{fmtMoney(intelligence.stats.revenue30)}</div>
                                </div>

                                <div className="glass rounded-lg p-3 border border-white/5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Calendar className="w-3 h-3 text-purple-400" />
                                        <span className="text-[10px] uppercase tracking-wide opacity-70">90 Days</span>
                                    </div>
                                    <div className="text-lg font-bold">{intelligence.stats.shows90}</div>
                                    <div className="text-xs text-accent-400 font-medium">{fmtMoney(intelligence.stats.revenue90)}</div>
                                </div>

                                <div className="glass rounded-lg p-3 border border-white/5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <TrendingUp className="w-3 h-3 text-green-400" />
                                        <span className="text-[10px] uppercase tracking-wide opacity-70">Growth</span>
                                    </div>
                                    <div className={`text-lg font-bold ${intelligence.stats.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {intelligence.stats.growth >= 0 ? '+' : ''}{intelligence.stats.growth.toFixed(1)}%
                                    </div>
                                    <div className="text-xs opacity-60">vs last 30d</div>
                                </div>
                            </div>

                            {/* Health Score Quick View */}
                            <div className={`glass rounded-lg p-4 border bg-gradient-to-br ${healthColor.bg} ${healthColor.border}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Tour Health</div>
                                        <div className="flex items-center gap-3">
                                            <div className={`text-4xl font-black ${healthColor.text}`}>{intelligence.health.grade}</div>
                                            <div>
                                                <div className="text-2xl font-bold">{intelligence.health.score}/100</div>
                                                <div className="text-xs opacity-70 capitalize">{intelligence.health.status}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <Activity className={`w-12 h-12 ${healthColor.icon} opacity-50`} />
                                </div>
                            </div>

                            {/* Smart Alerts */}
                            {intelligence.alerts.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-xs font-medium opacity-70 uppercase tracking-wide flex items-center gap-2">
                                        <Zap className="w-3 h-3" />
                                        Smart Alerts
                                    </div>
                                    {intelligence.alerts.map((alert, i) => {
                                        const config = alertConfig[alert.type];
                                        const Icon = config.icon;
                                        return (
                                            <motion.div
                                                key={alert.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`glass rounded-lg p-3 border ${config.border} ${config.bg}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-sm mb-0.5">{alert.title}</div>
                                                        <div className="text-xs opacity-70 mb-2">{alert.message}</div>
                                                        {alert.action && (
                                                            <Link
                                                                to={alert.action.link}
                                                                className="inline-flex items-center gap-1 text-xs font-medium text-accent-400 hover:text-accent-300 transition-colors"
                                                            >
                                                                {alert.action.label}
                                                                <ArrowRight className="w-3 h-3" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                    {alert.impact && (
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${alert.impact === 'high' ? 'bg-red-500/20 text-red-300' :
                                                            alert.impact === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                                                                'bg-gray-500/20 text-gray-300'
                                                            }`}>
                                                            {alert.impact}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Health View */}
                    {selectedView === 'health' && (
                        <motion.div
                            key="health"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {/* Overall Score */}
                            <div className={`glass rounded-xl p-6 border-2 bg-gradient-to-br ${healthColor.bg} ${healthColor.border} text-center`}>
                                <div className="text-xs uppercase tracking-widest opacity-70 mb-2">Tour Health Score</div>
                                <div className={`text-4xl sm:text-5xl md:text-6xl font-black mb-2 ${healthColor.text}`}>{intelligence.health.grade}</div>
                                <div className="text-2xl sm:text-3xl font-bold mb-1">{intelligence.health.score}<span className="text-lg opacity-50">/100</span></div>
                                <div className="text-sm opacity-70 capitalize">{intelligence.health.status} Performance</div>
                            </div>

                            {/* Health Factors */}
                            <div className="space-y-3">
                                <div className="text-xs font-medium opacity-70 uppercase tracking-wide">Health Factors</div>

                                {Object.entries(intelligence.health.factors).map(([key, value]) => {
                                    const labels: Record<string, string> = {
                                        bookingRate: 'Booking Rate',
                                        revenueHealth: 'Revenue Health',
                                        conversion: 'Conversion Rate',
                                        timing: 'Pipeline Timing'
                                    };
                                    const icons: Record<string, any> = {
                                        bookingRate: CheckCircle2,
                                        revenueHealth: DollarSign,
                                        conversion: Target,
                                        timing: Clock
                                    };
                                    const Icon = icons[key];

                                    return (
                                        <div key={key} className="glass rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-3.5 h-3.5 text-purple-400" />
                                                    <span className="text-sm font-medium">{labels[key]}</span>
                                                </div>
                                                <span className="text-sm font-bold">{value}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${value}%` }}
                                                    transition={{ duration: 0.8, delay: 0.2 }}
                                                    className={`h-full rounded-full ${value >= 80 ? 'bg-green-500' :
                                                        value >= 60 ? 'bg-blue-500' :
                                                            value >= 40 ? 'bg-amber-500' :
                                                                'bg-red-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Insights */}
                            {intelligence.health.insights.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-xs font-medium opacity-70 uppercase tracking-wide">Key Insights</div>
                                    {intelligence.health.insights.map((insight, i) => (
                                        <div key={i} className="glass rounded-lg p-2.5 text-xs flex items-start gap-2">
                                            <Info className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <span className="opacity-80">{insight}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recommendations */}
                            {intelligence.health.recommendations.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-xs font-medium opacity-70 uppercase tracking-wide flex items-center gap-2">
                                        <Award className="w-3 h-3" />
                                        Recommendations
                                    </div>
                                    {intelligence.health.recommendations.map((rec, i) => (
                                        <div key={i} className="glass rounded-lg p-2.5 text-xs flex items-start gap-2 border border-accent-500/20 bg-accent-500/5">
                                            <Sparkles className="w-3 h-3 text-accent-400 flex-shrink-0 mt-0.5" />
                                            <span className="opacity-90">{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Predictions View */}
                    {selectedView === 'predictions' && (
                        <motion.div
                            key="predictions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="text-xs opacity-70 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-3 h-3" />
                                AI-powered predictions based on historical trends and booking patterns
                            </div>

                            {intelligence.predictions.map((pred, i) => {
                                const change = pred.predicted - pred.current;
                                const changePercent = pred.current > 0 ? (change / pred.current) * 100 : 0;
                                const TrendIcon = pred.trend === 'up' ? TrendingUp : pred.trend === 'down' ? TrendingDown : Activity;

                                return (
                                    <motion.div
                                        key={pred.metric}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass rounded-lg p-4 border border-white/10"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="text-sm font-medium mb-1">{pred.metric}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs opacity-60">Confidence:</span>
                                                    <div className="flex items-center gap-1">
                                                        <Percent className="w-3 h-3 text-purple-400" />
                                                        <span className="text-xs font-bold text-purple-400">{Math.round(pred.confidence * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <TrendIcon className={`w-5 h-5 ${pred.trend === 'up' ? 'text-green-400' :
                                                pred.trend === 'down' ? 'text-red-400' :
                                                    'text-gray-400'
                                                }`} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wide opacity-50 mb-1">Current</div>
                                                <div className="text-lg font-bold">
                                                    {pred.metric.includes('Revenue') ? fmtMoney(pred.current) : Math.round(pred.current)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wide opacity-50 mb-1">Predicted</div>
                                                <div className="text-lg font-bold text-purple-400">
                                                    {pred.metric.includes('Revenue') ? fmtMoney(pred.predicted) : Math.round(pred.predicted)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-white/5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="opacity-60">Expected change:</span>
                                                <span className={`font-bold ${changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            <div className="glass rounded-lg p-3 border border-purple-500/20 bg-purple-500/5 text-xs">
                                <div className="flex items-start gap-2">
                                    <Brain className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <div className="opacity-80">
                                        <strong>Note:</strong> Predictions are generated using machine learning algorithms analyzing booking patterns, seasonality, and market trends. Confidence levels indicate prediction reliability.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
};

export default TourSummaryIntelligent;
