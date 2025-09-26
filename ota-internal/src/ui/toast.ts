// Central toast utility
let toastEl: HTMLElement | null = null;
function ensureEl(){
  if (toastEl && document.body.contains(toastEl)) return toastEl;
  toastEl = document.getElementById('toast');
  if (!toastEl){
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#222;padding:10px 14px;border-radius:6px;color:#fff;font:500 13px system-ui, sans-serif;opacity:0;pointer-events:none;transition:opacity .25s;z-index:9999;';
    document.body.appendChild(toastEl);
  }
  return toastEl;
}
let hideTimer: number | null = null;
export function showToast(msg: string, ms = 2000){
  const el = ensureEl();
  el.textContent = msg;
  el.style.opacity = '1';
  if (hideTimer) window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(()=>{ el.style.opacity='0'; }, ms);
}
