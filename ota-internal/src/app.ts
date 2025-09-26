// Minimal entry shim (legacy monolith removed)
import './core-app';

if (import.meta && (import.meta as any).hot) {
  (import.meta as any).hot.accept();
}
