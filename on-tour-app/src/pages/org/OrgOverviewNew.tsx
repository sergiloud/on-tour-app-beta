import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Calendar,
    DollarSign,
    Users,
    TrendingUp,
    Plus,
    ArrowRight,
    MapPin,
    BarChart3,
    Clock,
    Info,
    Music,
    Sparkles,
    Target,
    Zap,
    TrendingDown,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { useShowModal } from '../../context/ShowModalContext';
import { useShows } from '../../hooks/useShows';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';

export default function OrgOverview() {
    const { profile } = useAuth();
    const { org } = useOrg();
    const { openAdd } = useShowModal();
    const { shows } = useShows();
    const { fmtMoney } = useSettings();
    const [hoveredStat, setHoveredStat] = useState<string | null>(null);

    const businessType = localStorage.getItem('user:businessType') || 'artist';

    // Calcular estadísticas reales
    const statistics = useMemo(() => {
        const today = new Date();
        const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Filtrar shows confirmados y no cancelados
        const activeShows = shows.filter(s =>
            s.status !== 'canceled' && s.status !== 'archived'
        );

        // Shows en los próximos 30 días
        const upcomingShows = activeShows.filter(s => {
            const showDate = new Date(s.date);
            return showDate >= today && showDate <= next30Days;
        });

        // Calcular ingresos totales
        const totalRevenue = activeShows.reduce((sum, show) => sum + (show.fee || 0), 0);

        // Ingresos este mes
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const thisMonthRevenue = activeShows
            .filter(s => {
                const showDate = new Date(s.date);
                return showDate.getMonth() === currentMonth && showDate.getFullYear() === currentYear;
            })
            .reduce((sum, show) => sum + (show.fee || 0), 0);

        return {
            totalShows: activeShows.length,
            thisMonthRevenue,
            upcomingShows: upcomingShows.length,
            totalRevenue
        };
    }, [shows]);

    // Stats con datos reales
    const stats = [
        {
            label: 'Shows Totales',
            value: statistics.totalShows.toString(),
            icon: Calendar,
            sublabel: 'Shows realizados',
            change: undefined as string | undefined
        },
        {
            label: 'Ingresos',
            value: fmtMoney(statistics.thisMonthRevenue),
            icon: DollarSign,
            sublabel: 'Este mes',
            change: undefined as string | undefined
        },
        {
            label: 'Próximos 30 días',
            value: statistics.upcomingShows.toString(),
            icon: TrendingUp,
            sublabel: 'Shows programados',
            change: undefined as string | undefined
        },
        {
            label: 'Miembros',
            value: '1',
            icon: Users,
            sublabel: 'En tu equipo',
            change: undefined as string | undefined
        }
    ];

    // Actions organized by category
    const actions = [
        {
            title: t('shows.create'),
            description: t('org.addNewShow'),
            to: '/dashboard/shows',
            icon: Plus,
            category: 'Primeros Pasos'
        },
        {
            title: 'Ver Calendario',
            description: 'Revisa tu agenda completa',
            to: '/dashboard/calendar',
            icon: Calendar,
            category: 'Gestión'
        },
        {
            title: 'Gestionar Equipo',
            description: 'Invita colaboradores',
            to: '/dashboard/org/members',
            icon: Users,
            category: 'Gestión'
        },
        {
            title: 'Finanzas',
            description: 'Ingresos y gastos',
            to: '/dashboard/finance',
            icon: DollarSign,
            category: 'Análisis'
        },
        {
            title: 'Planificar Viajes',
            description: 'Logística de tu tour',
            to: '/dashboard/travel',
            icon: MapPin,
            category: 'Gestión'
        },
        {
            title: 'Ver Reportes',
            description: 'Analytics detallados',
            to: '/dashboard/org/reports',
            icon: BarChart3,
            category: 'Análisis'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">

            {/* Header Section - Professional & Clean */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                        {t('nav.overview') || 'Resumen'}
                    </h1>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-white/60">{org?.name || profile?.name || 'Tu Organización'}</span>
                        <span className="text-white/20">·</span>
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            <span className="text-white/60 text-xs capitalize">{businessType}</span>
                        </div>
                    </div>
                </div>

                {/* Quick action in header - Desktop */}
                <motion.button
                    onClick={openAdd}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Show
                </motion.button>
            </div>

            {/* Key Metrics - Clean & Professional */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="glass p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white/60" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold text-white mb-1">{statistics.totalShows}</div>
                    <div className="text-xs font-medium text-white/50">Shows Totales</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white/60" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold text-white mb-1">{fmtMoney(statistics.thisMonthRevenue)}</div>
                    <div className="text-xs font-medium text-white/50">Este Mes</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white/60" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold text-white mb-1">{statistics.upcomingShows}</div>
                    <div className="text-xs font-medium text-white/50">Próximos 30 días</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white/60" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold text-white mb-1">{fmtMoney(statistics.totalRevenue)}</div>
                    <div className="text-xs font-medium text-white/50">Total Ingresos</div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-5">

                {/* Left Column - Activity & Shows */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Activity Timeline */}
                    <div className="glass p-6 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-white/60" />
                                </div>
                                <h2 className="text-base font-medium text-white">Actividad Reciente</h2>
                            </div>
                            <Link to="/dashboard/shows" className="text-xs text-accent-500 hover:text-accent-400 transition-colors">
                                Ver todo
                            </Link>
                        </div>

                        {statistics.totalShows === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-white/30" />
                                </div>
                                <p className="text-sm text-white/60 mb-1 font-medium">
                                    Sin actividad reciente
                                </p>
                                <p className="text-xs text-white/40 mb-5">
                                    Tu actividad aparecerá aquí cuando empieces
                                </p>
                                <motion.button
                                    onClick={openAdd}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="text-sm px-5 py-2.5 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 transition-all font-medium"
                                >
                                    {t('shows.createFirst')}
                                </motion.button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Timeline items would go here when there's activity */}
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-white/60" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium mb-0.5">Show creado</p>
                                        <p className="text-xs text-white/50">Actividad reciente</p>
                                    </div>
                                    <span className="text-xs text-white/40">Reciente</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Shows */}
                    <div className="glass p-6 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white/60" />
                                </div>
                                <h2 className="text-base font-medium text-white">Próximos Shows</h2>
                            </div>
                            <Link to="/dashboard/calendar" className="text-xs text-accent-500 hover:text-accent-400 transition-colors">
                                Ver calendario
                            </Link>
                        </div>

                        {statistics.upcomingShows === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="w-6 h-6 text-white/30" />
                                </div>
                                <p className="text-sm text-white/60 mb-1 font-medium">
                                    No hay shows programados
                                </p>
                                <p className="text-xs text-white/40 mb-5">
                                    {t('org.startPlanning')}
                                </p>
                                <motion.button
                                    onClick={openAdd}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="text-sm px-5 py-2.5 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 transition-all font-medium"
                                >
                                    Programar un show
                                </motion.button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Show items would render here from real data */}
                                {shows.filter(s => {
                                    const showDate = new Date(s.date);
                                    const today = new Date();
                                    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                                    return showDate >= today && showDate <= next30Days && s.status !== 'canceled';
                                }).slice(0, 5).map((show) => {
                                    const showDate = new Date(show.date);
                                    const monthShort = showDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
                                    const day = showDate.getDate();

                                    return (
                                        <Link key={show.id} to="/dashboard/shows">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-accent-500/30 transition-all cursor-pointer">
                                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-white/5 flex-shrink-0">
                                                    <span className="text-[10px] text-white/50 font-medium">{monthShort}</span>
                                                    <span className="text-base font-semibold text-white">{day}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white mb-0.5 truncate">{show.venue || 'Venue TBD'}</p>
                                                    <p className="text-xs text-white/50 truncate">{show.city || 'Location TBD'}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Quick Actions */}
                <div className="space-y-5">
                    {/* Quick CTA */}
                    <motion.div
                        onClick={openAdd}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="glass p-5 rounded-xl border border-accent-500/20 hover:border-accent-500/40 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
                                <Plus className="w-5 h-5 text-accent-500" />
                            </div>
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">{t('shows.create')}</h3>
                        <p className="text-sm text-white/60 leading-relaxed">{t('org.addShowToCalendar')}</p>
                    </motion.div>

                    {/* Quick Actions */}
                    <div className="glass p-5 rounded-xl border border-white/10">
                        <h2 className="text-sm font-medium text-white mb-4">Acciones Rápidas</h2>

                        <div className="space-y-2">
                            {actions.slice(0, 5).map((action, idx) => (
                                <Link key={action.title} to={action.to}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-accent-500/30 transition-all group cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-500/10 transition-colors">
                                            <action.icon className="w-4 h-4 text-white/50 group-hover:text-accent-500 transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-white truncate">{action.title}</h3>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-accent-500 transition-colors flex-shrink-0" />
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    {statistics.totalRevenue > 0 && (
                        <div className="glass p-5 rounded-xl border border-white/10">
                            <h2 className="text-sm font-medium text-white mb-4">Resumen Financiero</h2>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/60">Total Ingresos</span>
                                    <span className="text-sm font-semibold text-white">{fmtMoney(statistics.totalRevenue)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/60">Este Mes</span>
                                    <span className="text-sm font-semibold text-white">{fmtMoney(statistics.thisMonthRevenue)}</span>
                                </div>
                                <div className="pt-3 border-t border-white/10">
                                    <Link to="/dashboard/finance" className="text-xs text-accent-500 hover:text-accent-400 transition-colors flex items-center gap-1">
                                        Ver finanzas completas <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help */}
                    <div className="glass p-4 rounded-xl border border-white/10">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Info className="w-4 h-4 text-white/60" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white mb-1">¿Necesitas ayuda?</h3>
                                <p className="text-xs text-white/50 mb-2 leading-relaxed">
                                    Consulta la documentación
                                </p>
                                <button className="text-xs text-accent-500 hover:text-accent-400 font-medium transition-colors">
                                    Ver guía →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Quick Action Button */}
            <div className="md:hidden fixed bottom-20 right-4 z-40">
                <motion.button
                    onClick={openAdd}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full bg-accent-500 shadow-lg flex items-center justify-center"
                >
                    <Plus className="w-6 h-6 text-black" />
                </motion.button>
            </div>

        </div>
    );
}
