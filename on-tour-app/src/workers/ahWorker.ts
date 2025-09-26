/// <reference lib="webworker" />
import { computeActions } from '../components/dashboard/computeActions';

type Msg = {
  shows: Array<{id:string; date:string; city:string; fee:number; status:string; country?: string}>;
  travel: Array<{id:string; date:string; title?:string}>;
};

// eslint-disable-next-line no-restricted-globals
self.onmessage = (e: MessageEvent<Msg>) => {
  try {
    const { shows, travel } = e.data || { shows: [], travel: [] };
    const t0 = performance.now();
    const actions = computeActions(new Date(), shows, travel);
    const ms = performance.now() - t0;
    // eslint-disable-next-line no-restricted-globals
    (self as any).postMessage({ ok: true, actions, ms });
  } catch (err: any) {
    // eslint-disable-next-line no-restricted-globals
    (self as any).postMessage({ ok: false, error: String(err?.message || err) });
  }
};
