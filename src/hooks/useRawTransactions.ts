import { useMemo } from 'react';
import { buildFinanceSnapshot } from '../features/finance/snapshot';
import { showToTransactionV3 } from '../lib/profitabilityHelpers';
import type { TransactionV3 } from '../types/financeV3';

/**
 * Custom hook para la capa de adquisición de datos
 *
 * RESPONSABILIDAD ÚNICA:
 * Obtener y transformar los datos crudos en TransactionV3[]
 *
 * ABSTRACCIÓN DE LA FUENTE:
 * El resto de la aplicación NO conoce de dónde vienen las transacciones:
 * - Actualmente: buildFinanceSnapshot() (datos locales)
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
  // Obtener snapshot de datos (fuente actual: local)
  const snapshot = useMemo(() => buildFinanceSnapshot(), []);

  // Transformar shows a transacciones V3
  const transactionsV3 = useMemo<TransactionV3[]>(() => {
    const transactions: TransactionV3[] = [];

    console.log(`[useRawTransactions] Total shows in snapshot: ${snapshot.shows.length}`);

    // Filtrar shows relevantes y convertir a transacciones
    snapshot.shows.forEach((show) => {
      // Incluir solo shows confirmados, pendientes, postponed
      // Excluir: offers, cancelados, archivados
      if (show.status !== 'offer' && show.status !== 'canceled' && show.status !== 'archived') {
        const showTransactions = showToTransactionV3(show);
        transactions.push(...showTransactions);
      }
    });

    console.log(`[useRawTransactions] Total transactions created: ${transactions.length}`);

    // Ordenar por fecha descendente (más reciente primero)
    return transactions.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [snapshot.shows]);

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
