/**
 * Retry Service - Handles retrying failed operations
 * Useful for network failures, timeouts, etc.
 */

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry an async operation with configurable strategy
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = 'exponential',
    onRetry
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        // Last attempt failed, throw error
        throw lastError;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Calculate delay based on backoff strategy
      const delay = backoff === 'exponential' 
        ? delayMs * Math.pow(2, attempt - 1)
        : delayMs * attempt;

      console.warn(
        `⚠️ Operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`,
        lastError.message
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Operation failed');
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
    return true;
  }

  // Rate limit errors
  if (error.code === 'resource-exhausted') {
    return true;
  }

  // Timeout errors
  if (error.message?.includes('timeout')) {
    return true;
  }

  // Network failures
  if (error.message?.includes('network') || error.message?.includes('offline')) {
    return true;
  }

  return false;
}

/**
 * Retry wrapper specifically for Firestore operations
 */
export async function retryFirestoreOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'Firestore operation'
): Promise<T> {
  return retryOperation(operation, {
    maxAttempts: 3,
    delayMs: 500,
    backoff: 'exponential',
    onRetry: (attempt, error) => {
      if (isRetryableError(error)) {
        console.log(`🔄 Retrying ${operationName} (attempt ${attempt})...`);
      } else {
        console.error(`❌ Non-retryable error in ${operationName}:`, error);
        throw error; // Don't retry non-retryable errors
      }
    }
  });
}
