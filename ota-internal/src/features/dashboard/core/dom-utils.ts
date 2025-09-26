// Shared lightweight DOM helpers for dashboard components

export function patchList(list: HTMLElement, frag: HTMLElement){
  const oldChildren = Array.from(list.children) as HTMLElement[];
  const newChildren = Array.from(frag.children) as HTMLElement[];
  const key = (n: HTMLElement) => n.getAttribute('data-key') || n.getAttribute('data-show-id') || n.getAttribute('data-id') || ''+oldChildren.indexOf(n);
  const pool = new Map<string, HTMLElement>(); oldChildren.forEach(c => pool.set(key(c), c));
  let cursor: HTMLElement | null = null;
  newChildren.forEach(ch => {
    const k = key(ch);
    const ex = pool.get(k);
    if (ex){
      if (ex.innerHTML !== ch.innerHTML) ex.innerHTML = ch.innerHTML;
      if (cursor){ if (cursor.nextSibling !== ex) list.insertBefore(ex, cursor.nextSibling); }
      else if (list.firstChild !== ex) list.insertBefore(ex, list.firstChild);
      pool.delete(k); cursor = ex;
    } else {
      if (cursor) list.insertBefore(ch, cursor.nextSibling); else list.insertBefore(ch, list.firstChild); cursor = ch;
    }
  });
  pool.forEach(n => n.remove());
}
