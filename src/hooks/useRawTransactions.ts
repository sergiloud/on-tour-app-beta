import { useMemo, useEffect, useState } from 'react';
import { buildFinanceSnapshot } from '../features/finance/snapshot';
import { showToTransactionV3 } from '../lib/profitabilityHelpers';
import type { TransactionV3 } from '../types/financeV3';
import { getCurrentOrgId } from '../lib/tenants';
import { FirestoreFinanceService, type FinanceTransaction } from '../services/firestoreFinanceService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook para la capa de adquisición de datos
 *
 * RESPONSABILIDAD ÚNICA:
 * Obtener y transformar los datos crudos en TransactionV3[]
 *
 * ABSTRACCIÓN DE LA FUENTE:
 * El resto de la aplicación NO conoce de dónde vienen las transacciones:
 * - Shows: buildFinanceSnapshot() (datos locales)
 * - Manual: FirestoreFinanceService (transacciones manuales)
 * - Futuro: API REST, GraphQL, IndexedDB, etc.
 *
 * Solo modificando ESTE hook se puede cambiar toda la fuente de datos
 * sin afectar a useFinanceData, FinanceV2.tsx, ni ningún componente.
 *
 * BENEFICIOS:
 * - Separación de incumbencias: Adquisición vs Procesamiento
 * - Testeable: Mock fácil de la fuente de datos
 * - Portable: Reutilizable en otros módulos que necesiten transacciones
 * - Escalable: Fácil migrar a API real cuando llegue el momento
 *
 * @returns TransactionV3[] - Transacciones ordenadas por fecha descendente
 */
export function useRawTransactions(): TransactionV3[] {
  const { userId } = useAuth();
  
  // Track orgId changes to invalidate snapshot cache
  const [orgId, setOrgId] = useState(() => getCurrentOrgId());
  
  // State for manual transactions from Firestore
  const [manualTransactions, setManualTransactions] = useState<FinanceTransaction[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    const handleOrgChange = (e: any) => {
      const newOrgId = e?.detail?.id;
      if (newOrgId) setOrgId(newOrgId);
    };
    window.addEventListener('tenant:changed' as any, handleOrgChange);
    return () => window.removeEventListener('tenant:changed' as any, handleOrgChange);
  }, []);
  
  // Listen for transaction updates
  useEffect(() => {
    const handleTransactionUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('finance:transaction:created', handleTransactionUpdate);
    window.addEventListener('finance:transaction:updated', handleTransactionUpdate);
    window.addEventListener('finance:transaction:deleted', handleTransactionUpdate);
    return () => {
      window.removeEventListener('finance:transaction:created', handleTransactionUpdate);
      window.removeEventListener('finance:transaction:updated', handleTransactionUpdate);
      window.removeEventListener('finance:transaction:deleted', handleTransactionUpdate);
    };
  }, []);
  
  // Load manual transactions from Firestore
  useEffect(() => {
    if (!userId) return;
    
    const loadManualTransactions = async () => {
      try {
        const transactions = await FirestoreFinanceService.getUserTransactions(userId, orgId);
        setManualTransactions(transactions);
      } catch (error) {
        console.error('Failed to load manual transactions:', error);
        setManualTransactions([]);
      }
    };
    
    loadManualTransactions();
  }, [userId, orgId, refreshTrigger]);
  
  // Obtener snapshot de datos - recalculate when orgId changes
  const snapshot = useMemo(() => buildFinanceSnapshot(), [orgId]);

  // Transformar shows a transacciones V3
  const transactionsV3 = useMemo<TransactionV3[]>(() => {
    const transactions: TransactionV3[] = [];

    // 1. Add transactions from shows
    snapshot.shows.forEach((show) => {
      // Incluir solo shows confirmados, pendientes, postponed
      // Excluir: offers, cancelados, archivados
      if (show.status !== 'offer' && show.status !== 'canceled' && show.status !== 'archived') {
        const showTransactions = showToTransactionV3(show);
        transactions.push(...showTransactions);
      }
    });

    // 2. Add manual transactions from Firestore
    manualTransactions.forEach((manualTx) => {
      const txV3: TransactionV3 = {
        id: manualTx.id,
        showId: manualTx.showId || `manual-${manualTx.id}`,
        tripTitle: manualTx.description,
        type: manualTx.type,
        category: manualTx.category,
        amount: manualTx.amount,
        status: 'paid',
        date: manualTx.date,
        description: manualTx.description,
      };
      transactions.push(txV3);
    });

    // Ordenar por fecha descendente (más reciente primero)
    return transactions.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [snapshot.shows, manualTransactions, orgId]);

  return transactionsV3;
}

/**
 * EJEMPLO DE MIGRACIÓN FUTURA A API:
 *
 * export function useRawTransactions(): TransactionV3[] {
 *   const { data, isLoading, error } = useQuery(
 *     ['transactions'],
 *     () => fetch('/api/transactions').then(res => res.json())
 *   );
 *
 *   if (isLoading) return [];
 *   if (error) throw error;
 *
 *   return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 * }
 *
 * ✅ El resto de la app sigue funcionando sin cambios!
 */
