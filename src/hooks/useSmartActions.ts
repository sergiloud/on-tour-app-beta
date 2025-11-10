import { useMemo, useState } from 'react';
import { useFilteredShows } from '../features/shows/selectors';
import { useSettings } from '../context/SettingsContext';

type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
type ActionCategory = 'urgent' | 'financial' | 'logistics' | 'opportunity';

export interface SmartAction {
    id: string;
    priority: ActionPriority;
    category: ActionCategory;
    title: string;
    description: string;
    city?: string;
    date?: string;
    amount?: number;
    daysUntil?: number;
    showId?: string;
    actionText: string;
    coords?: { lng: number; lat: number };
    completed?: boolean;
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Hook que genera acciones inteligentes REALES basadas en shows
 * - Critical: Contratos pendientes <7 días
 * - High: Depósitos faltantes
 * - Medium: Logística de viaje 7-14 días
 * - Low: Oportunidades high-value >$10k
 */
export const useSmartActions = () => {
    const { shows } = useFilteredShows();
    const { fmtMoney } = useSettings();
    const [completedActions, setCompletedActions] = useState<Set<string>>(() => {
        // Cargar del localStorage
        const saved = localStorage.getItem('on-tour-completed-actions');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const actions = useMemo((): SmartAction[] => {
        const now = Date.now();
        const result: SmartAction[] = [];

        shows.forEach(show => {
            const showDate = new Date(show.date).getTime();
            const daysUntil = Math.ceil((showDate - now) / DAY);

            // Critical: Pending contracts <7 days
            if (show.status === 'pending' && daysUntil <= 7 && daysUntil > 0) {
                const actionId = `pending-${show.id}`;
                result.push({
                    id: actionId,
                    priority: 'critical',
                    category: 'urgent',
                    title: 'Contract Pending',
                    description: `${show.city} show needs immediate signature`,
                    city: show.city,
                    date: show.date,
                    daysUntil,
                    showId: show.id,
                    actionText: 'Sign Contract',
                    coords: { lng: show.lng, lat: show.lat },
                    completed: completedActions.has(actionId)
                });
            }

            // High: Missing deposits (confirmed shows)
            if (show.status === 'confirmed' && daysUntil <= 30) {
                // Asumimos que si no hay campo depositReceived, falta el depósito
                const actionId = `deposit-${show.id}`;
                if (!completedActions.has(actionId)) {
                    result.push({
                        id: actionId,
                        priority: 'high',
                        category: 'financial',
                        title: 'Deposit Outstanding',
                        description: `Request 50% deposit for ${show.city}`,
                        city: show.city,
                        date: show.date,
                        amount: show.fee * 0.5,
                        daysUntil,
                        showId: show.id,
                        actionText: 'Request Deposit',
                        coords: { lng: show.lng, lat: show.lat },
                        completed: false
                    });
                }
            }

            // Medium: Travel logistics 7-14 days before
            if (show.status === 'confirmed' && daysUntil <= 14 && daysUntil > 7) {
                const actionId = `travel-${show.id}`;
                result.push({
                    id: actionId,
                    priority: 'medium',
                    category: 'logistics',
                    title: 'Travel Arrangements',
                    description: `Book travel for ${show.city} (${daysUntil} days away)`,
                    city: show.city,
                    date: show.date,
                    daysUntil,
                    showId: show.id,
                    actionText: 'Book Travel',
                    coords: { lng: show.lng, lat: show.lat },
                    completed: completedActions.has(actionId)
                });
            }

            // Low: High-value opportunities >$10k
            if (show.status === 'offer' && show.fee > 10000) {
                const actionId = `opportunity-${show.id}`;
                result.push({
                    id: actionId,
                    priority: 'low',
                    category: 'opportunity',
                    title: 'High-Value Opportunity',
                    description: `${show.city} offer worth ${fmtMoney(show.fee)}`,
                    city: show.city,
                    date: show.date,
                    amount: show.fee,
                    daysUntil,
                    showId: show.id,
                    actionText: 'Review Offer',
                    coords: { lng: show.lng, lat: show.lat },
                    completed: completedActions.has(actionId)
                });
            }
        });

        // Sort by priority then days until
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return result.sort((a, b) => {
            const prioDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (prioDiff !== 0) return prioDiff;
            return (a.daysUntil ?? 999) - (b.daysUntil ?? 999);
        });
    }, [shows, fmtMoney, completedActions]);

    const markCompleted = (actionId: string) => {
        const newSet = new Set(completedActions);
        newSet.add(actionId);
        setCompletedActions(newSet);
        localStorage.setItem('on-tour-completed-actions', JSON.stringify([...newSet]));
    };

    const unmarkCompleted = (actionId: string) => {
        const newSet = new Set(completedActions);
        newSet.delete(actionId);
        setCompletedActions(newSet);
        localStorage.setItem('on-tour-completed-actions', JSON.stringify([...newSet]));
    };

    const clearCompleted = () => {
        setCompletedActions(new Set());
        localStorage.removeItem('on-tour-completed-actions');
    };

    return {
        actions,
        completedCount: completedActions.size,
        markCompleted,
        unmarkCompleted,
        clearCompleted
    };
};
