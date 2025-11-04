/**
 * Hooks Barrel Export
 * Centralizado para importaciones fáciles de custom hooks
 */

export {
  useShows,
  useShow,
  useShowStats,
  useSearchShows,
  useRelatedShows,
  useCreateShow,
  useUpdateShow,
  useDeleteShow,
  showsQueryKeys
} from './useShows';

export {
  useFinanceRecords,
  useFinanceReport,
  useCreateFinanceRecord,
  useApproveFinanceRecord,
  useCreateSettlement,
  financeQueryKeys
} from './useFinance';

export {
  useWebSocket,
  useFlightUpdates,
  useNotifications,
  useDocumentCollaboration
} from './useWebSocket';

export {
  AuthProvider,
  useAuth,
  useIsAuthenticated,
  useCurrentUser
} from './useAuth';
