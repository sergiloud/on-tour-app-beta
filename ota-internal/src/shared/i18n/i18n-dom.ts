// DOM translation applicator
import { t } from './i18n';

export function applyTranslations(root: Document | HTMLElement = document){
  const scope: Iterable<Element> = root instanceof Document ? root.querySelectorAll('[data-i18n], [data-i18n-label]') : root.querySelectorAll('[data-i18n], [data-i18n-label]');
  for (const el of scope){
    const key = el.getAttribute('data-i18n');
    if (key){
      const txt = t(key);
      if (txt === key) { continue; } // skip replacement to avoid showing raw key string
      const attrTarget = el.getAttribute('data-i18n-attr');
      if (attrTarget){
        el.setAttribute(attrTarget, txt);
      } else {
        if (el.childNodes.length === 1 && el.firstChild && el.firstChild.nodeType === 3){
          if (el.textContent !== txt) el.textContent = txt;
        } else {
          el.textContent = txt;
        }
      }
    }
    const labelKey = el.getAttribute('data-i18n-label');
    if (labelKey){
      const v = t(labelKey);
      if (el.getAttribute('aria-label') !== v) el.setAttribute('aria-label', v);
    }
  }
}

// Optional observer for late-loaded nodes (could be enabled later)
export function applyTranslationsLater(){
  const obs = new MutationObserver(muts => {
    let needs = false;
    for (const m of muts){
      if (m.type === 'childList' && m.addedNodes.length){ needs = true; break; }
      if (m.type === 'attributes' && (m.target as Element).hasAttribute('data-i18n')){ needs = true; break; }
    }
    if (needs) applyTranslations();
  });
  obs.observe(document.documentElement, { subtree:true, childList:true, attributes:true, attributeFilter:['data-i18n'] });
  return obs;
}
