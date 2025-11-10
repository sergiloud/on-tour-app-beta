// Command Palette - Global search & navigation (CMD+K / CMD+P)
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useShows } from '../hooks/useShows';
import { t } from '../lib/i18n';
import { trackEvent } from '../lib/telemetry';
import { DemoShow } from '../lib/shows';

type CommandItem = {
    id: string;
    type: 'show' | 'navigation' | 'action';
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    keywords: string[];
    action: () => void;
    priority?: number;
};

export const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { shows } = useShows();

    // Keyboard shortcut: CMD+K or CMD+P
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'p')) {
                e.preventDefault();
                setIsOpen(prev => !prev);
                trackEvent('commandPalette.toggle', { method: 'keyboard' });
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                setQuery('');
                setSelectedIndex(0);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Build command items
    const allCommands = useMemo<CommandItem[]>(() => {
        const commands: CommandItem[] = [];

        // Navigation commands
        const navItems = [
            { path: '/dashboard', label: 'Dashboard', icon: '🏠', keywords: ['home', 'inicio', 'dashboard'] },
            { path: '/dashboard/shows', label: 'Shows', icon: '🎤', keywords: ['shows', 'concerts', 'conciertos', 'gigs'] },
            { path: '/dashboard/calendar', label: 'Calendar', icon: '📅', keywords: ['calendar', 'calendario', 'schedule'] },
            { path: '/dashboard/finance', label: 'Finance', icon: '💰', keywords: ['finance', 'finanzas', 'money', 'revenue'] },
            { path: '/dashboard/travel', label: 'Travel', icon: '✈️', keywords: ['travel', 'viajes', 'flights', 'vuelos'] },
            { path: '/dashboard/settings', label: 'Settings', icon: '⚙️', keywords: ['settings', 'ajustes', 'config'] },
        ];

        navItems.forEach(item => {
            commands.push({
                id: `nav-${item.path}`,
                type: 'navigation',
                title: item.label,
                subtitle: `Go to ${item.label}`,
                icon: <span className="text-2xl">{item.icon}</span>,
                keywords: [item.label.toLowerCase(), ...item.keywords],
                action: () => {
                    navigate(item.path);
                    setIsOpen(false);
                    setQuery('');
                    trackEvent('commandPalette.navigate', { to: item.path });
                },
                priority: 5,
            });
        });

        // Show commands (dynamic)
        shows.forEach(show => {
            const showDate = new Date(show.date);
            const isUpcoming = showDate > new Date();
            const keywords = [
                show.name?.toLowerCase() || '',
                show.city.toLowerCase(),
                show.country.toLowerCase(),
                (show as any).venue?.toLowerCase() || '',
                show.status.toLowerCase(),
                show.date,
            ].filter(Boolean);

            commands.push({
                id: `show-${show.id}`,
                type: 'show',
                title: show.name || (show as any).venue || show.city,
                subtitle: `${show.city}, ${show.country} • ${new Date(show.date).toLocaleDateString()} • ${show.status}`,
                icon: (
                    <div className={`w-3 h-3 rounded-full ${show.status === 'confirmed' ? 'bg-green-500' :
                            show.status === 'pending' ? 'bg-amber-500' :
                                show.status === 'offer' ? 'bg-blue-500' :
                                    'bg-gray-500'
                        }`} />
                ),
                keywords,
                action: () => {
                    navigate(`/dashboard/shows?edit=${show.id}`);
                    setIsOpen(false);
                    setQuery('');
                    trackEvent('commandPalette.openShow', { showId: show.id });
                },
                priority: isUpcoming ? 10 : 3,
            });
        });

        // Quick actions
        const actions: CommandItem[] = [
            {
                id: 'action-add-show',
                type: 'action',
                title: 'Add New Show',
                subtitle: 'Create a new show quickly',
                icon: <span className="text-2xl">➕</span>,
                keywords: ['add', 'new', 'create', 'añadir', 'nuevo', 'show'],
                action: () => {
                    navigate('/dashboard/shows?add=1');
                    setIsOpen(false);
                    setQuery('');
                    trackEvent('commandPalette.action', { action: 'addShow' });
                },
                priority: 7,
            },
            {
                id: 'action-export-csv',
                type: 'action',
                title: 'Export Shows to CSV',
                subtitle: 'Download all shows as spreadsheet',
                icon: <span className="text-2xl">📥</span>,
                keywords: ['export', 'download', 'csv', 'excel', 'exportar'],
                action: () => {
                    // Trigger export
                    window.dispatchEvent(new CustomEvent('export:csv'));
                    setIsOpen(false);
                    setQuery('');
                    trackEvent('commandPalette.action', { action: 'exportCsv' });
                },
                priority: 4,
            },
        ];

        return [...commands, ...actions];
    }, [shows, navigate]);

    // Filter and sort commands based on query
    const filteredCommands = useMemo(() => {
        if (!query.trim()) {
            // No query: show recent/frequent items + navigation
            return allCommands
                .filter(cmd => cmd.type === 'navigation' || cmd.priority && cmd.priority >= 7)
                .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                .slice(0, 8);
        }

        const lowerQuery = query.toLowerCase().trim();
        const tokens = lowerQuery.split(/\s+/);

        // Smart matching: match all tokens in any keyword
        const matches = allCommands
            .map(cmd => {
                const matchScore = tokens.reduce((score, token) => {
                    const titleMatch = cmd.title.toLowerCase().includes(token);
                    const subtitleMatch = cmd.subtitle?.toLowerCase().includes(token);
                    const keywordMatch = cmd.keywords.some(kw => kw.includes(token));

                    if (titleMatch) return score + 10;
                    if (subtitleMatch) return score + 5;
                    if (keywordMatch) return score + 3;
                    return score;
                }, 0);

                return { cmd, matchScore };
            })
            .filter(({ matchScore }) => matchScore > 0)
            .sort((a, b) => {
                // Sort by match score, then priority
                if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
                return (b.cmd.priority || 0) - (a.cmd.priority || 0);
            })
            .slice(0, 10)
            .map(({ cmd }) => cmd);

        return matches;
    }, [query, allCommands]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
            e.preventDefault();
            filteredCommands[selectedIndex].action();
        }
    };

    // Reset selected index when filtered commands change
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredCommands]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                    }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Command Palette */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-2xl mx-4"
                >
                    <div className="glass rounded-2xl border border-slate-300 dark:border-white/20 shadow-2xl overflow-hidden">
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                            <svg className="w-5 h-5 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search shows, navigate, or type a command..."
                                className="flex-1 bg-transparent text-white placeholder-slate-400 dark:placeholder-slate-400 dark:placeholder-white/40 outline-none text-base"
                            />
                            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-xs text-slate-400 dark:text-white/60 font-mono">ESC</kbd>
                        </div>

                        {/* Results */}
                        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
                            {filteredCommands.length === 0 ? (
                                <div className="px-4 py-8 text-center text-slate-300 dark:text-white/50">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-200 dark:text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm">No results found</p>
                                    <p className="text-xs mt-1">Try searching for a show, city, or page name</p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {filteredCommands.map((cmd, index) => (
                                        <button
                                            key={cmd.id}
                                            onClick={() => cmd.action()}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${index === selectedIndex
                                                    ? 'bg-accent-500/20 border-l-2 border-accent-500'
                                                    : 'hover:bg-slate-100 dark:hover:bg-white/5 border-l-2 border-transparent'
                                                }`}
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                                {cmd.icon}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="text-sm font-medium text-white truncate">
                                                    {cmd.title}
                                                </div>
                                                {cmd.subtitle && (
                                                    <div className="text-xs text-slate-400 dark:text-white/60 truncate">
                                                        {cmd.subtitle}
                                                    </div>
                                                )}
                                            </div>
                                            {index === selectedIndex && (
                                                <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-xs text-slate-400 dark:text-white/60 font-mono flex-shrink-0">
                                                    ↵
                                                </kbd>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="px-4 py-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-300 dark:text-white/50">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 font-mono">↑</kbd>
                                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 font-mono">↓</kbd>
                                    navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 font-mono">↵</kbd>
                                    select
                                </span>
                            </div>
                            <span className="text-slate-400 dark:text-slate-300 dark:text-white/40">
                                {filteredCommands.length} result{filteredCommands.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
