// Accessible announcer (aria-live queue)
// Provides a centralized polite/assertive messaging system to reduce noise.
// Usage: announce('msg') or announce('critical update', { assertive: true })

interface AnnounceOptions { assertive?: boolean; dedupeWindowMs?: number; }

let muted = false;
try { const saved = localStorage.getItem('a11y:announce:muted'); if (saved === '1') muted = true; } catch {}

export function setAnnouncerMuted(on: boolean){
  muted = !!on;
  try { localStorage.setItem('a11y:announce:muted', on ? '1':'0'); } catch {}
}
export function isAnnouncerMuted(){ return muted; }

let politeEl: HTMLElement | null = null;
let assertiveEl: HTMLElement | null = null;
let queue: { text: string; opts: AnnounceOptions; ts: number }[] = [];
let flushing = false;
const recent: { text: string; ts: number }[] = [];

function ensureRegions(){
  if (!politeEl){
    politeEl = document.createElement('div');
    politeEl.id = 'ariaAnnouncePolite';
    politeEl.className = 'sr-only';
    politeEl.setAttribute('aria-live','polite');
    politeEl.setAttribute('aria-atomic','true');
    document.body.appendChild(politeEl);
  }
  if (!assertiveEl){
    assertiveEl = document.createElement('div');
    assertiveEl.id = 'ariaAnnounceAssertive';
    assertiveEl.className = 'sr-only';
    assertiveEl.setAttribute('aria-live','assertive');
    assertiveEl.setAttribute('aria-atomic','true');
    document.body.appendChild(assertiveEl);
  }
}

function flush(){
  if (flushing) return; flushing = true;
  requestAnimationFrame(() => {
    const now = Date.now();
    const next = queue.shift();
    if (next){
      // de-dup within window (default 4s)
      const win = next.opts.dedupeWindowMs ?? 4000;
      const rIdx = recent.findIndex(r => r.text === next.text && (now - r.ts) < win);
      if (rIdx >= 0){
        // skip duplicate, continue flush
      } else {
        recent.push({ text: next.text, ts: now });
        while (recent.length > 30) recent.shift();
        const target = next.opts.assertive ? assertiveEl : politeEl;
        if (target){
          // Force change even if same string by clearing first
            target.textContent = '';
            // slight delay ensures some screen readers treat as new
            setTimeout(()=>{ target!.textContent = next.text; }, 10);
        }
      }
    }
    flushing = false;
    if (queue.length) flush();
  });
}

export function announce(text: string, opts: AnnounceOptions = {}){
  try {
  if (muted) return;
    ensureRegions();
    queue.push({ text, opts, ts: Date.now() });
    flush();
  } catch {}
}

// Debug exposure (dev only)
try {
  const dev = (import.meta as any)?.env?.DEV;
  if (dev){
    (window as any).announce = announce;
    (window as any).setAnnouncerMuted = setAnnouncerMuted;
    (window as any).isAnnouncerMuted = isAnnouncerMuted;
  }
} catch {}
