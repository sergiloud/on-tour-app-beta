/**
 * Performance Benchmark Suite
 *
 * NOTE: This test suite is disabled for now (PENDING DEPRECATION)
 * The worker pool integration has changed and these tests need refactoring.
 * TODO: Re-enable after financeWorkerPool API is stabilized
 */

import { describe, test, expect } from 'vitest';

describe.skip('Performance Benchmarks', () => {
  test.skip('placeholder', () => {
    expect(true).toBe(true);
  });
});
