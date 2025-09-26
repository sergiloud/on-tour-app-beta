// Simple pub/sub event bus for reactive dashboard
export type EventCallback<T=any> = (data: T) => void;
interface SubMap { [evt: string]: EventCallback[] }
const subs: SubMap = {};

export const events = {
  on(event: string, cb: EventCallback){
    if (!subs[event]) subs[event] = [];
    subs[event].push(cb);
  },
  off(event: string, cb: EventCallback){
    const arr = subs[event]; if (!arr) return;
    const i = arr.indexOf(cb); if (i>=0) arr.splice(i,1);
  },
  emit<T=any>(event: string, data: T){
    const arr = subs[event]; if (!arr) return;
    // copy to avoid mutation issues
    [...arr].forEach(fn => { try { fn(data); } catch(err){ console.error('[events] handler error', err); } });
  }
};

// Expose for debugging
;(window as any).__events = events;
