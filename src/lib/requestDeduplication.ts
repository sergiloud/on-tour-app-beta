/**
 * Request Deduplication - Evita queries duplicadas a Firestore
 * Cuando múltiples componentes piden los mismos datos simultáneamente,
 * solo se hace una request y todos comparten el resultado
 */

type PendingRequest<T> = {
  promise: Promise<T>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest<any>>();
const CACHE_DURATION = 100; // ms - ventana para considerar requests como duplicadas

/**
 * Wrapper que deduplica requests basadas en key
 */
export async function deduplicateRequest<T>(
  key: string,
  fn: () => Promise<T>,
  cacheDuration = CACHE_DURATION
): Promise<T> {
  const now = Date.now();
  const pending = pendingRequests.get(key);

  // Si hay una request pendiente reciente, reusar
  if (pending && now - pending.timestamp < cacheDuration) {
    console.log(`[Dedup] Reusing pending request for: ${key}`);
    return pending.promise;
  }

  // Crear nueva request
  console.log(`[Dedup] New request for: ${key}`);
  const promise = fn();
  
  pendingRequests.set(key, {
    promise,
    timestamp: now,
  });

  // Limpiar después de completar
  promise
    .then(() => {
      // Esperar un poco antes de limpiar por si llegan más requests
      setTimeout(() => {
        if (pendingRequests.get(key)?.timestamp === now) {
          pendingRequests.delete(key);
        }
      }, cacheDuration);
    })
    .catch(() => {
      // Limpiar inmediatamente en error
      if (pendingRequests.get(key)?.timestamp === now) {
        pendingRequests.delete(key);
      }
    });

  return promise;
}

/**
 * Limpiar todas las requests pendientes (útil para testing o logout)
 */
export function clearPendingRequests() {
  pendingRequests.clear();
}

/**
 * Helper específico para Firestore queries
 */
export function deduplicateFirestoreQuery<T>(
  collection: string,
  userId: string,
  fn: () => Promise<T>
): Promise<T> {
  const key = `firestore:${collection}:${userId}`;
  return deduplicateRequest(key, fn, 200); // Mayor ventana para Firestore
}
