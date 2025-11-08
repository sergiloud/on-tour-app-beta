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
        <div className="px-4 sm:px-6 flex flex-col gap-4 lg:gap-5 pb-8">

            {/* Header Section - Dashboard Style */}
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5">
                <div className="relative px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight text-white">
                                    {t('nav.overview') || 'Resumen'}
                                </h1>
                                <div className="flex items-center gap-2 text-xs mt-0.5">
                                    <span className="text-white/60">{org?.name || profile?.name || 'Tu Organización'}</span>
                                    <span className="text-white/20">·</span>
                                    <span className="text-white/60 capitalize">{businessType}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick action in header - Desktop */}
                        <motion.button
                            onClick={openAdd}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Show
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Key Metrics - Professional & Balanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                {/* Shows Totales */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5 transition-all duration-300 p-5"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-500/3 to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center group-hover:bg-accent-500/15 transition-all duration-300">
                            <Calendar className="w-4 h-4 text-accent-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">{statistics.totalShows}</div>
                            <div className="text-xs font-medium text-white/70">Shows Totales</div>
                            <div className="text-[11px] text-white/50 mt-0.5">En tu carrera</div>
                        </div>
                    </div>
                </motion.div>

                {/* Ingresos Este Mes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md hover:shadow-green-500/5 transition-all duration-300 p-5"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 to-emerald-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/15 transition-all duration-300">
                            <DollarSign className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">{fmtMoney(statistics.thisMonthRevenue)}</div>
                            <div className="text-xs font-medium text-white/70">Este Mes</div>
                            <div className="text-[11px] text-white/50 mt-0.5">Ingresos totales</div>
                        </div>
                    </div>
                </motion.div>

                {/* Próximos Shows */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 p-5"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 to-pink-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/15 transition-all duration-300">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">{statistics.upcomingShows}</div>
                            <div className="text-xs font-medium text-white/70">Próximos 30 días</div>
                            <div className="text-[11px] text-white/50 mt-0.5">Shows programados</div>
                        </div>
                    </div>
                </motion.div>

                {/* Total Ingresos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 p-5"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-cyan-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/15 transition-all duration-300">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">{fmtMoney(statistics.totalRevenue)}</div>
                            <div className="text-xs font-medium text-white/70">Total Ingresos</div>
                            <div className="text-[11px] text-white/50 mt-0.5">Carrera completa</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-5">

                {/* Left Column - Activity & Shows */}
                <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-5">

                    {/* Activity Timeline - Enhanced */}
                    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5 transition-all duration-300">
                        <div className="px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-accent-500/10 flex items-center justify-center">
                                        <Clock className="w-3.5 h-3.5 text-accent-500" />
                                    </div>
                                    <h2 className="text-sm font-semibold tracking-tight text-white">Actividad Reciente</h2>
                                </div>
                                <Link to="/dashboard/shows" className="text-xs text-accent-500 hover:text-accent-400 transition-colors font-medium">
                                    Ver todo →
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            {statistics.totalShows === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mx-auto mb-3">
                                        <Clock className="w-5 h-5 text-white/20" />
                                    </div>
                                    <p className="text-xs text-white/70 mb-0.5 font-medium">
                                        Sin actividad reciente
                                    </p>
                                    <p className="text-[11px] text-white/40 mb-4">
                                        Tu actividad aparecerá aquí cuando empieces
                                    </p>
                                    <motion.button
                                        onClick={openAdd}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="text-xs px-3.5 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 transition-all font-medium inline-flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Crear Primer Show
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-accent-500/20 transition-all"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-white font-medium mb-0.5">Últimos shows creados</p>
                                            <p className="text-[11px] text-white/50">{statistics.totalShows} shows activos en total</p>
                                        </div>
                                        <span className="text-[10px] text-white/40 flex-shrink-0 font-medium">Activo</span>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Shows - Enhanced */}
                    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300">
                        <div className="px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                                    </div>
                                    <h2 className="text-sm font-semibold tracking-tight text-white">Próximos Shows</h2>
                                </div>
                                <Link to="/dashboard/calendar" className="text-xs text-accent-500 hover:text-accent-400 transition-colors font-medium">
                                    Ver calendario →
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            {statistics.upcomingShows === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mx-auto mb-3">
                                        <Calendar className="w-5 h-5 text-white/20" />
                                    </div>
                                    <p className="text-xs text-white/70 mb-0.5 font-medium">
                                        No hay shows programados
                                    </p>
                                    <p className="text-[11px] text-white/40 mb-4">
                                        Comienza a planificar tu tour
                                    </p>
                                    <motion.button
                                        onClick={openAdd}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="text-xs px-3.5 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 transition-all font-medium inline-flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Programar un Show
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {shows.filter(s => {
                                        const showDate = new Date(s.date);
                                        const today = new Date();
                                        const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                                        return showDate >= today && showDate <= next30Days && s.status !== 'canceled';
                                    }).slice(0, 5).map((show, idx) => {
                                        const showDate = new Date(show.date);
                                        const monthShort = showDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
                                        const day = showDate.getDate();

                                        return (
                                            <motion.div
                                                key={show.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <Link to={`/dashboard/shows/${show.id}`}>
                                                    <div className="group flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-purple-500/30 transition-all cursor-pointer">
                                                        <div className="flex flex-col items-center justify-center w-9 h-9 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/15 flex-shrink-0 transition-all">
                                                            <span className="text-[9px] text-white/50 font-medium">{monthShort}</span>
                                                            <span className="text-xs font-bold text-white">{day}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-white mb-0.5 truncate">{show.venue || 'Venue TBD'}</p>
                                                            <p className="text-[10px] text-white/50 truncate">{show.city || 'Location TBD'}</p>
                                                        </div>
                                                        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Quick Actions */}
                                {/* Right Column - Quick Actions */}
                <div className="flex flex-col gap-4 lg:gap-5">
                    {/* Create Show CTA */}
                    <motion.div
                        onClick={openAdd}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="group relative overflow-hidden rounded-lg border border-accent-500/25 bg-gradient-to-br from-accent-500/8 via-transparent to-transparent backdrop-blur-sm hover:border-accent-500/40 hover:shadow-md hover:shadow-accent-500/10 transition-all cursor-pointer p-5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10 flex flex-col gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center group-hover:bg-accent-500/25 transition-all">
                                <Plus className="w-4 h-4 text-accent-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-1">{t('shows.create')}</h3>
                                <p className="text-xs text-white/60 leading-relaxed">{t('org.addShowToCalendar')}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-sm hover:border-white/20 hover:shadow-lg hover:shadow-accent-500/10 transition-all duration-300">
                        <div className="px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                            <h2 className="text-sm font-semibold tracking-wider text-white uppercase">Acciones Rápidas</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            {actions.slice(0, 5).map((action, idx) => (
                                <Link key={action.title} to={action.to}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ x: 6 }}
                                        className="group flex items-center gap-4 p-3.5 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-accent-500/40 transition-all cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-500/15 transition-colors">
                                            <action.icon className="w-4 h-4 text-white/60 group-hover:text-accent-400 transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-white/90 group-hover:text-white truncate transition-colors">{action.title}</h3>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-accent-400 transition-colors flex-shrink-0" />
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    {statistics.totalRevenue > 0 && (
                        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md hover:shadow-green-500/5 transition-all duration-300">
                            <div className="px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                                <h2 className="text-sm font-semibold tracking-tight text-white">Resumen Financiero</h2>
                            </div>

                            <div className="p-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/70">Total Ingresos</span>
                                    <span className="text-xs font-semibold text-green-500">{fmtMoney(statistics.totalRevenue)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/70">Este Mes</span>
                                    <span className="text-xs font-semibold text-green-400">{fmtMoney(statistics.thisMonthRevenue)}</span>
                                </div>
                                <div className="pt-2 border-t border-white/10">
                                    <Link to="/dashboard/finance" className="text-xs text-accent-500 hover:text-accent-400 transition-colors flex items-center gap-1 font-medium">
                                        Ver finanzas completas <ArrowRight className="w-2.5 h-2.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help Card */}
                    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5">
                        <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Info className="w-3.5 h-3.5 text-white/60" />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-white mb-0.5">¿Necesitas ayuda?</h3>
                                <p className="text-[11px] text-white/50 mb-2 leading-relaxed">
                                    Consulta nuestra documentación
                                </p>
                                <button className="text-xs text-accent-500 hover:text-accent-400 font-medium transition-colors">
                                    Abrir Guía →
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
