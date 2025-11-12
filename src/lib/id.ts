/**
 * Generate a unique ID using crypto.randomUUID() with fallback
 */
export function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}
