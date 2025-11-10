import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure RTL cleans up the DOM between tests to avoid duplicate nodes
afterEach(() => {
	cleanup();
});

// Provide Jest API alias for tests that use jest.* helpers
// @ts-ignore
(globalThis as any).jest = vi;

// Provide matchMedia mock for theme detection in tests
if (!window.matchMedia) {
	// @ts-ignore
	window.matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {}, // deprecated
		removeListener: () => {}, // deprecated
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false
	});
}

// Polyfill URL.createObjectURL for libraries (e.g., maplibre) that expect it in browser
if (typeof window.URL !== 'undefined' && typeof window.URL.createObjectURL !== 'function') {
	// @ts-ignore
	window.URL.createObjectURL = () => 'blob:mock-url';
}
if (typeof window.URL !== 'undefined' && typeof window.URL.revokeObjectURL !== 'function') {
	// @ts-ignore
	window.URL.revokeObjectURL = () => {};
}

// Minimal ResizeObserver stub for JSDOM environment
if (typeof (global as any).ResizeObserver === 'undefined') {
	class ResizeObserverStub {
		private callback: ResizeObserverCallback;
		constructor(cb: ResizeObserverCallback) { this.callback = cb; }
		observe() {/* no-op */}
		unobserve() {/* no-op */}
		disconnect() {/* no-op */}
	}
	// @ts-ignore
	(global as any).ResizeObserver = ResizeObserverStub;
}

// Minimal IntersectionObserver stub for JSDOM environment
if (typeof (globalThis as any).IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(
      _callback: (entries: any[], observer: any) => void,
      _options?: any
    ) {}
    observe() {/* no-op */}
    unobserve() {/* no-op */}
    disconnect() {/* no-op */}
    takeRecords() { return []; }
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
  }
  // @ts-ignore
  ;(globalThis as any).IntersectionObserver = IntersectionObserverStub;
  // @ts-ignore ensure window also has it when present
  if (typeof window !== 'undefined') {
    // @ts-ignore
    (window as any).IntersectionObserver = IntersectionObserverStub;
  }
}

// PerformanceObserver stub (Vitest/jsdom lacks some perf entries)
if (typeof (globalThis as any).PerformanceObserver === 'undefined') {
	class PerformanceObserverStub {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		constructor(_cb: any) {}
		observe() {/* no-op */}
		disconnect() {/* no-op */}
		takeRecords() { return []; }
	}
	// @ts-ignore
	;(globalThis as any).PerformanceObserver = PerformanceObserverStub;
}

// navigator.clipboard mock to avoid permissions errors
if (typeof navigator !== 'undefined' && !(navigator as any).clipboard) {
	(navigator as any).clipboard = {
		writeText: async () => true,
		readText: async () => ''
	} as any;
}

// Worker stub to prevent spawning real workers in tests (force-disable)
{
	class WorkerStub {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		constructor(_url: string | URL, _options?: any) {}
		onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
		postMessage(_msg: any) { /* swallow */ }
		terminate() {/* no-op */}
		addEventListener() {/* no-op */}
		removeEventListener() {/* no-op */}
		dispatchEvent() { return false; }
	}
	// @ts-ignore override any existing implementation
	(globalThis as any).Worker = WorkerStub as any;
	// Inform app code that we're in a test environment
	// @ts-ignore
	;(globalThis as any).__TEST__ = true;
}

// MapLibre heavy CSS/GL assumptions: provide minimal stubs to avoid runtime errors when components import it.
try {
	// Some builds gate on presence; we just ensure global exists
	// @ts-ignore
	(globalThis as any).maplibregl = (globalThis as any).maplibregl || {};
} catch {}