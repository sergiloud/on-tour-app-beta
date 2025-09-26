// Component system (Phase 2 extraction)
// Minimal contract so panels can be incrementally migrated.
// Each component manages a specific dashboard panel DOM subtree.
// Contract goals: simple, no framework, supports perf tagging + future disposal.

export interface DashComponentCtx {
  now: Date;
}

export interface DashComponent {
  id: string;                 // stable id (matches panel or section id)
  mount(el: HTMLElement): void; // initial bind, event listeners
  update(ctx: DashComponentCtx): void; // render/update DOM based on state
  unmount?(): void;           // optional cleanup
}

const registry = new Map<string, DashComponent>();
// Optional metrics (dev aid); imported lazily to avoid circular issues
let metricsMod: any = null;
function record(id: string){
  if (!metricsMod){
    try { metricsMod = require('../metrics'); } catch {}
  }
  try { metricsMod?.recordComponentUpdate?.(id); } catch {}
}

export function registerComponent(c: DashComponent){
  if (registry.has(c.id)) return; // idempotent safeguard
  registry.set(c.id, c);
}

export function mountComponent(id: string, ctx: DashComponentCtx){
  const comp = registry.get(id); if (!comp) return;
  const el = document.getElementById(id); if (!el) return;
  if ((el as any)._mounted) return;
  try { comp.mount(el); (el as any)._mounted = true; comp.update(ctx); } catch (e){ console.warn('[component mount failed]', id, e); }
}

export function updateComponent(id: string, ctx: DashComponentCtx){
  const comp = registry.get(id); if (!comp) return;
  try { comp.update(ctx); record(id); } catch (e){ console.warn('[component update failed]', id, e); }
}

export function updateAll(ctx: DashComponentCtx){
  registry.forEach((_, id) => updateComponent(id, ctx));
}
