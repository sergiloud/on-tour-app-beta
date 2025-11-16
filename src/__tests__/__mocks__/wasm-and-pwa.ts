import { vi } from 'vitest';

// Mock WebAssembly Financial Engine
export const mockWasmFinancialEngine = {
  isInitialized: vi.fn().mockReturnValue(true),
  initialize: vi.fn().mockResolvedValue(undefined),
  calculateMetrics: vi.fn().mockResolvedValue({
    totalRevenue: 100000,
    totalExpenses: 30000,
    netProfit: 70000,
    profitMargin: 0.7,
    averageTicketPrice: 25,
    capacityUtilization: 0.85,
    monthlyTrend: [45000, 52000, 48000],
    yearlyProjection: 1200000,
    breakEvenShows: 12,
    demandElasticity: -1.2,
    roiScenarios: {
      conservative: { roi: 0.15, profit: 75000 },
      optimistic: { roi: 0.25, profit: 125000 }
    }
  }),
  calculateDemandElasticity: vi.fn().mockReturnValue(-1.2),
  calculateBreakEven: vi.fn().mockReturnValue({ shows: 12, revenue: 480000 }),
  calculateRoiScenario: vi.fn().mockReturnValue({ roi: 0.15, profit: 75000 }),
  free: vi.fn(),
  memory: {
    buffer: new ArrayBuffer(1024)
  }
};

// Mock WebAssembly module loader
export const mockWasmModule = {
  memory: { buffer: new ArrayBuffer(1024) },
  calculate_monthly_revenue: vi.fn().mockReturnValue(50000),
  calculate_yearly_forecast: vi.fn().mockReturnValue([45000, 52000, 48000]),
  calculate_demand_elasticity: vi.fn().mockReturnValue(-1.2),
  calculate_break_even: vi.fn().mockReturnValue({ shows: 12, revenue: 480000 }),
  calculate_roi_scenario: vi.fn().mockReturnValue({ roi: 0.15, profit: 75000 }),
  free: vi.fn()
};

// Mock Service Worker registration
export const mockServiceWorkerRegistration = {
  installing: null,
  waiting: null,
  active: {
    scriptURL: '/sw.js',
    state: 'activated',
    postMessage: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  },
  scope: '/',
  update: vi.fn().mockResolvedValue(undefined),
  unregister: vi.fn().mockResolvedValue(true),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Mock advanced PWA features
export const mockAdvancedPWA = {
  backgroundSync: {
    register: vi.fn().mockResolvedValue(undefined),
    getTags: vi.fn().mockResolvedValue([])
  },
  notificationManager: {
    showNotification: vi.fn().mockResolvedValue(undefined),
    getNotifications: vi.fn().mockResolvedValue([])
  },
  cacheManager: {
    put: vi.fn().mockResolvedValue(undefined),
    match: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(true),
    keys: vi.fn().mockResolvedValue([])
  }
};

// Auto-mock WebAssembly modules
vi.mock('/wasm-financial-engine/pkg/wasm_financial_engine.js', () => ({
  default: vi.fn().mockResolvedValue(mockWasmModule),
  __wbg_set_wasm: vi.fn(),
  initSync: vi.fn(),
  __wbindgen_add_to_stack_pointer: vi.fn(),
  __wbindgen_malloc: vi.fn().mockReturnValue(0),
  __wbindgen_free: vi.fn(),
}));

vi.mock('../lib/wasmFinancialEngine', () => ({
  wasmFinancialEngine: mockWasmFinancialEngine,
  createFinancialEngine: vi.fn().mockResolvedValue(mockWasmFinancialEngine)
}));

vi.mock('../lib/advancedPWA', () => ({
  advancedPWA: mockAdvancedPWA,
  registerServiceWorker: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
  enableBackgroundSync: vi.fn().mockResolvedValue(undefined),
  setupOfflineQueue: vi.fn().mockResolvedValue(undefined)
}));