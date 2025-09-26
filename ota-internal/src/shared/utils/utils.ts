// Generic small utilities
export function debounce<F extends (...args:any[])=>any>(fn: F, wait: number){
  let t: number|undefined;
  return function(this: any, ...args: Parameters<F>){
    if (t) window.clearTimeout(t);
    t = window.setTimeout(()=> { fn.apply(this, args); }, wait);
  } as F;
}

// Future: list diff / animation helpers will live here.
export function animateListUpdate(list: HTMLElement, render: () => void){
  if (!list) return render();
  const prev = Array.from(list.children) as HTMLElement[];
  const keyOf = (el: HTMLElement) => el.getAttribute('data-id') || el.getAttribute('data-show-id') || el.getAttribute('data-travel-id') || el.textContent || '';
  const prevMap = new Map<string, HTMLElement>();
  prev.forEach(ch => prevMap.set(keyOf(ch), ch));
  // Snapshot heights for FLIP
  const firstRects = new Map<HTMLElement, DOMRect>();
  prev.forEach(ch => firstRects.set(ch, ch.getBoundingClientRect()));
  render();
  const next = Array.from(list.children) as HTMLElement[];
  const nextMap = new Map<string, HTMLElement>();
  next.forEach(ch => nextMap.set(keyOf(ch), ch));
  // Enter items
  next.forEach(ch => {
    const k = keyOf(ch);
    if (!prevMap.has(k)){
      ch.style.opacity='0';
      ch.style.transform='translateY(6px)';
    }
  });
  // Compute FLIP for persisted items
  next.forEach(ch => {
    const k = keyOf(ch);
    const old = prevMap.get(k);
    if (old && firstRects.has(old)){
      const lastRect = ch.getBoundingClientRect();
      const firstRect = firstRects.get(old)!;
      const dx = firstRect.left - lastRect.left;
      const dy = firstRect.top - lastRect.top;
      if (dx || dy){
        ch.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    }
  });
  // Force reflow
  void list.offsetWidth;
  // Play transitions
  next.forEach(ch => {
    ch.style.transition='opacity .28s ease, transform .32s cubic-bezier(.35,.3,.2,1)';
    ch.style.opacity='1';
    ch.style.transform='translate(0,0)';
  });
  // Exit items
  prev.forEach(ch => {
    const k = keyOf(ch);
    if (!nextMap.has(k)){
      ch.style.position='absolute';
      ch.style.pointerEvents='none';
      ch.style.width = (ch.getBoundingClientRect().width)+'px';
      ch.style.transition='opacity .22s ease, transform .22s ease';
      ch.style.opacity='0';
      ch.style.transform='translateY(-6px)';
      setTimeout(()=> ch.remove(), 240);
    }
  });
}

// Reusable save feedback animation for primary action buttons
// Contract:
//  - Pass a button element and a promise-returning action function.
//  - Button enters 'loading' state, then 'success' flash, then restores label.
//  - Accepts optional custom labels.
export async function animateButtonSave(btn: HTMLButtonElement, action: () => Promise<any>, opts?: {savingLabel?: string; successLabel?: string; restoreDelay?: number; icon?: string; successIcon?: string;}){
  if (!btn) return action();
  const origHtml = btn.innerHTML;
  const savingLabel = opts?.savingLabel || 'Saving...';
  const successLabel = opts?.successLabel || 'Saved!';
  const restoreDelay = opts?.restoreDelay ?? 1400;
  const icon = opts?.icon || 'loader-2';
  const successIcon = opts?.successIcon || 'check';
  try {
    btn.disabled = true;
    btn.classList.add('is-saving');
    btn.innerHTML = `<i data-lucide="${icon}" class="spin"></i> ${savingLabel}`;
    try { (window as any).lucide?.createIcons(); } catch {}
    await action();
    btn.classList.remove('is-saving');
    btn.classList.add('is-saved');
    btn.innerHTML = `<i data-lucide="${successIcon}"></i> ${successLabel}`;
    try { (window as any).lucide?.createIcons(); } catch {}
    setTimeout(()=> {
      btn.classList.remove('is-saved');
      btn.disabled = false;
      btn.innerHTML = origHtml;
      try { (window as any).lucide?.createIcons(); } catch {}
    }, restoreDelay);
  } catch (e){
    btn.disabled = false;
    btn.classList.remove('is-saving');
    btn.innerHTML = origHtml;
    console.warn('animateButtonSave failed', e);
  }
}
