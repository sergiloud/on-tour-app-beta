// Placeholder API layer to integrate a real backend later.
// Exposes typed endpoints and streaming hooks contracts.

import type { FinanceShow, FinanceSnapshot } from '../features/finance/types';
import { buildFinanceSnapshotFromShows, buildFinanceSnapshot } from '../features/finance/snapshot';
import { getCurrentOrgId } from '../lib/tenants';
import { secureStorage } from '../lib/secureStorage';
import { showStore } from '../shared/showStore';

export type FinanceTargetsDTO = {
  yearNet: number;
  pending: number;
  incomeMonth: number;
  costsMonth: number;
  expensesMonth: number;
  netMonth: number;
};

// Fetch current shows (server canonical)
export async function fetchShows(): Promise<FinanceShow[]> {
  // TODO: wire to backend
  // For now, mirror local store content as a placeholder
  const org = getCurrentOrgId();
  return (showStore.getAll() as unknown as FinanceShow[]).filter((s: any) => !s.tenantId || s.tenantId === org);
}

// Fetch computed snapshot from server (authoritative), fallback to client build
export async function fetchFinanceSnapshot(now = new Date()): Promise<FinanceSnapshot> {
  // TODO: call /api/finance/snapshot?asOf=...
  return buildFinanceSnapshot(now);
}

// Targets CRUD
const TARGETS_LS_KEY = 'finance-targets-v1';
const DEFAULT_TARGETS: FinanceTargetsDTO = {
  yearNet: 250_000,
  pending: 50_000,
  expensesMonth: 42_000,
  netMonth: 60_000,
  incomeMonth: 120_000,
  costsMonth: 60_000,
};
export async function fetchTargets(): Promise<FinanceTargetsDTO> {
  // TODO: GET /api/finance/targets
  try {
    const stored = secureStorage.getItem<FinanceTargetsDTO>(TARGETS_LS_KEY);
    if (stored) return { ...DEFAULT_TARGETS, ...stored };
  } catch { }
  return DEFAULT_TARGETS;
}

export async function updateTargetsApi(patch: Partial<FinanceTargetsDTO>): Promise<FinanceTargetsDTO> {
  // TODO: PATCH /api/finance/targets
  const current = await fetchTargets();
  const next = { ...current, ...patch } as FinanceTargetsDTO;
  try { secureStorage.setItem(TARGETS_LS_KEY, next); } catch { }
  return next;
}

// Forecasts
export type ForecastPoint = { month: string; net: number; p50: number; p90: number };
export async function fetchForecast(): Promise<ForecastPoint[]> {
  // TODO: GET /api/finance/forecast
  return [];
}

// Streaming (SSE/WebSocket) contract placeholder
export type SnapshotEvent = { type: 'snapshot.updated'; payload: FinanceSnapshot };
export function subscribeSnapshot(onEvent: (e: SnapshotEvent) => void): () => void {
  // TODO: connect to SSE/ws and emit onEvent(e). Return unsubscribe.
  // For now, proxy local showStore updates as server-driven snapshot events
  const unsub = showStore.subscribe((shows: FinanceShow[]) => {
    const org = getCurrentOrgId();
    const scoped = (shows as any[]).filter(s => !s.tenantId || s.tenantId === org);
    const snap = buildFinanceSnapshotFromShows(scoped as FinanceShow[], new Date());
    onEvent({ type: 'snapshot.updated', payload: snap });
  });
  return () => { try { unsub && unsub(); } catch { } };
}
