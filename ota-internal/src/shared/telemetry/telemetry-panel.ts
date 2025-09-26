// Lightweight telemetry overlay
import { getPerfRecent } from './telemetry';
import { getLocale } from '../i18n';

let panel: HTMLDivElement | null = null;
let timer: number | null = null;

function toCSV(){
  const recent = getPerfRecent();
  const header = 'name,duration_ms';
  const lines = recent.map(r => `${JSON.stringify(r.name)},${r.dur.toFixed(2)}`);
  return [header, ...lines].join('\n');
}

function downloadCSV(){
  try {
    const blob = new Blob([toCSV()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perf-samples-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
  } catch(err){ console.warn('CSV export failed', err); }
}

function render(){
  if (!panel) return;
  const recent = getPerfRecent();
  const rows = recent.slice(-12).map(r => `<tr><td>${r.name}</td><td>${r.dur.toFixed(1)}</td></tr>`).join('');
  panel.innerHTML = `<div class="tp-head">Perf (${getLocale()}) <button data-export title="Export CSV" aria-label="Export CSV">⇩</button> <button data-close aria-label="Close telemetry">×</button></div><table class="tp-table"><thead><tr><th>Block</th><th>ms</th></tr></thead><tbody>${rows||'<tr><td colspan=2>—</td></tr>'}</tbody></table>`;
}

export function toggleTelemetry(){
  if (panel){
    panel.remove(); panel = null; if (timer) cancelAnimationFrame(timer); return;
  }
  panel = document.createElement('div');
  panel.className = 'telemetry-overlay';
  Object.assign(panel.style, {
    position:'fixed', top:'8px', right:'8px', zIndex:'9999', background:'rgba(20,20,24,0.92)', color:'#eee', font:'12px/1.3 system-ui, sans-serif', border:'1px solid #333', padding:'6px 8px', borderRadius:'6px', width:'260px', boxShadow:'0 2px 6px rgba(0,0,0,0.4)'
  });
  panel.addEventListener('click', (e) => { 
    const target = e.target as HTMLElement;
    if (target.closest('[data-close]')){ toggleTelemetry(); }
    else if (target.closest('[data-export]')) { downloadCSV(); }
  });
  document.body.appendChild(panel);
  const loop = () => { render(); timer = requestAnimationFrame(loop); };
  loop();
  window.addEventListener('i18n:changed', render);
}

// Dev keybinding (Ctrl+Alt+T)
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 't'){
    toggleTelemetry();
  }
});
