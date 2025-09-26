import { setLocale, getLocale } from '../i18n';
import { applyTranslations } from '../i18n';
import { renderDashboard } from '../../features/dashboard/core/dashboard';

let initialized = false;
export function initLocaleSwitcher(){
  if (initialized) return; initialized = true;
  const sel = document.getElementById('localeSelect') as HTMLSelectElement | null;
  if (sel){
    sel.value = getLocale();
    sel.addEventListener('change', () => {
      const v = sel.value;
      setLocale(v);
      applyTranslations();
      // Re-render dashboard labels that are dynamic
      renderDashboard();
    });
  }
  window.addEventListener('i18n:changed', () => { applyTranslations(); });
}
