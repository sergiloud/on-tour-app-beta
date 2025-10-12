import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Map, TrendingUp, DollarSign, Users, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrg } from '../context/OrgContext';
import { useShowModal } from '../context/ShowModalContext';
import { t } from '../lib/i18n';

interface QuickStatProps {
    label: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
}

const QuickStat: React.FC<QuickStatProps> = ({ label, value, subtitle, icon }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-sm opacity-70 mb-1">{label}</div>
            {subtitle && <div className="text-xs opacity-50">{subtitle}</div>}
        </motion.div>
    );
};

interface QuickActionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    to: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, to }) => {
    return (
        <Link to={to}>
            <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="glass p-6 rounded-xl border border-white/10 hover:border-accent-500/30 transition-all group cursor-pointer h-full"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 group-hover:text-accent-500 transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm opacity-70 leading-relaxed">{description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1 flex-shrink-0" />
                </div>
            </motion.div>
        </Link>
    );
};

const EmptyState: React.FC<{ onAddShow: () => void }> = ({ onAddShow }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-12 rounded-2xl border border-white/10 text-center max-w-2xl mx-auto"
        >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-accent-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Welcome to Your Dashboard</h2>
            <p className="text-lg opacity-70 mb-8 max-w-md mx-auto">
                You're all set up! Start by adding your first show to begin managing your tours.
            </p>
            <motion.button
                onClick={onAddShow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent-500 to-blue-500 text-black font-semibold hover:from-accent-600 hover:to-blue-600 transition-all inline-flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add Your First Show
            </motion.button>
        </motion.div>
    );
};

const DashboardNew: React.FC = () => {
    const { profile } = useAuth();
    const { org } = useOrg();
    const { openAdd } = useShowModal();

    // Check if user is new (no demo data)
    const isNewUser = localStorage.getItem('user:isNew') === 'true';
    const hasShows = false; // TODO: Check actual shows data

    // Get first name for greeting
    const firstName = profile.name.split(' ')[0];

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome back, {firstName}
                </h1>
                <p className="text-lg opacity-70">
                    {org?.name || 'Your Organization'} Dashboard
                </p>
            </motion.div>

            {/* Show empty state for new users with no shows */}
            {isNewUser && !hasShows ? (
                <>
                    <EmptyState onAddShow={openAdd} />

                    {/* Quick Actions for new users */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-12"
                    >
                        <h2 className="text-xl font-semibold mb-6">Get Started</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <QuickAction
                                title="Add a Show"
                                description="Schedule your first performance or event"
                                icon={<Calendar className="w-6 h-6 text-accent-500" />}
                                to="/dashboard/shows"
                            />
                            <QuickAction
                                title={t('dashboard.viewCalendar')}
                                description={t('dashboard.viewCalendarDesc')}
                                icon={<Calendar className="w-6 h-6 text-blue-500" />}
                                to="/dashboard/calendar"
                            />
                            <QuickAction
                                title={t('dashboard.setupFinances')}
                                description={t('dashboard.setupFinancesDesc')}
                                icon={<DollarSign className="w-6 h-6 text-green-500" />}
                                to="/dashboard/finance"
                            />
                        </div>
                    </motion.div>
                </>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <QuickStat
                            label={t('dashboard.totalShows')}
                            value={0}
                            subtitle={t('dashboard.thisYear')}
                            icon={<Calendar className="w-5 h-5 text-accent-500" />}
                        />
                        <QuickStat
                            label={t('dashboard.totalRevenue')}
                            value="€0"
                            subtitle={t('dashboard.perConfirmedShow')}
                            icon={<DollarSign className="w-5 h-5 text-green-500" />}
                        />
                        <QuickStat
                            label={t('dashboard.upcoming')}
                            value={0}
                            subtitle={t('dashboard.next30Days')}
                            icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
                        />
                        <QuickStat
                            label={t('dashboard.teamSize')}
                            value={1}
                            subtitle={t('dashboard.activeMembers')}
                            icon={<Users className="w-5 h-5 text-purple-500" />}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Map Preview */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass rounded-xl border border-white/10 overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">{t('dashboard.tourMap')}</h2>
                                        <span className="text-xs opacity-60 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Live
                                        </span>
                                    </div>
                                </div>
                                <div className="h-96 bg-gradient-to-br from-slate-900/50 to-slate-800/30 flex items-center justify-center">
                                    <div className="text-center">
                                        <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-sm opacity-70 mb-4">No shows scheduled yet</p>
                                        <Link to="/dashboard/shows">
                                            <button className="px-4 py-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium transition-all">
                                                Add Your First Show
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Upcoming Shows */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass rounded-xl border border-white/10 overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/10">
                                    <h2 className="text-lg font-semibold">Upcoming Shows</h2>
                                    <p className="text-xs opacity-60 mt-1">Next 30 days</p>
                                </div>
                                <div className="p-6">
                                    <div className="text-center py-12">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm opacity-70 mb-4">No upcoming shows</p>
                                        <Link to="/dashboard/shows">
                                            <button className="px-4 py-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium transition-all">
                                                Schedule a Show
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <QuickAction
                                title="Add a Show"
                                description="Schedule a new performance or event"
                                icon={<Plus className="w-6 h-6 text-accent-500" />}
                                to="/dashboard/shows"
                            />
                            <QuickAction
                                title={t('dashboard.viewCalendar')}
                                description={t('dashboard.viewCalendarDesc')}
                                icon={<Calendar className="w-6 h-6 text-blue-500" />}
                                to="/dashboard/calendar"
                            />
                            <QuickAction
                                title={t('dashboard.financialOverview')}
                                description={t('dashboard.setupFinancesDesc')}
                                icon={<DollarSign className="w-6 h-6 text-green-500" />}
                                to="/dashboard/finance"
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default DashboardNew;
