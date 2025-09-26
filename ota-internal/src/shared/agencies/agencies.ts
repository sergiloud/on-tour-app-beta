// Agencies management module
// Data model: { id, name, type: 'mgmt' | 'booking', percent, base: 'gross' | 'net', default?: boolean }

export interface Agency { id: string; name: string; type: 'mgmt' | 'booking'; percent: number; base: 'gross' | 'net'; default?: boolean; }
const KEY = 'ota:agencies:v1';
const ORDER_KEY = 'ota:agencies:order:v1';

function loadAll(): Agency[] {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch {}
  return [];
}
function saveAll(list: Agency[]){ try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} }

export function listAgencies(): Agency[] { return loadAll(); }
export function addAgency(name: string, type: 'mgmt' | 'booking', percent: number, base: 'gross' | 'net', makeDefault?: boolean){
  const list = loadAll();
  const agency: Agency = { id: 'ag-' + Math.random().toString(36).slice(2,9), name, type, percent, base, default: !!makeDefault };
  if (makeDefault){ list.forEach(a => { if (a.type === type) a.default = false; }); }
  list.push(agency); saveAll(list); return agency;
}
export function updateAgency(id: string, patch: Partial<Agency>){
  const list = loadAll();
  const a = list.find(x => x.id === id); if (!a) return;
  Object.assign(a, patch);
  if (patch.default){ list.forEach(o => { if (o.id !== id && o.type === a.type) o.default = false; }); }
  saveAll(list);
}
export function deleteAgency(id: string){ const list = loadAll().filter(a => a.id !== id); saveAll(list); }
export function setDefaultAgency(id: string){
  const list = loadAll();
  const target = list.find(a => a.id === id); if (!target) return;
  list.forEach(a => { if (a.type === target.type) a.default = (a.id === id); });
  saveAll(list);
}
export function getDefaultAgency(type: 'mgmt' | 'booking'): Agency | undefined {
  return listAgencies().find(a => a.type === type && a.default);
}

function loadOrder(): string[] { try { const raw = localStorage.getItem(ORDER_KEY); if (raw) return JSON.parse(raw); } catch {} return []; }
function saveOrder(ids: string[]){ try { localStorage.setItem(ORDER_KEY, JSON.stringify(ids)); } catch {} }
export function listAgenciesOrdered(): Agency[] {
  const list = listAgencies();
  const order = loadOrder();
  if (!order.length) return list;
  const map: Record<string, Agency> = {}; list.forEach(a => map[a.id] = a);
  const ordered: Agency[] = [];
  order.forEach(id => { if (map[id]) { ordered.push(map[id]); delete map[id]; } });
  // append any new ones not yet in order list
  Object.keys(map).forEach(id => ordered.push(map[id]));
  return ordered;
}

export interface AppliedCommissions { mgmt: number; booking: number; total: number; breakdown: { mgmt?: Agency; booking?: Agency }; }

export function computeAgencyCommissions(grossFee: number, costs: number, wht: number, mgmtAgencyId?: string, bookingAgencyId?: string): AppliedCommissions {
  const list = listAgencies();
  const mgmtAg = (mgmtAgencyId && list.find(a => a.id === mgmtAgencyId)) || getDefaultAgency('mgmt');
  const bookingAg = (bookingAgencyId && list.find(a => a.id === bookingAgencyId)) || getDefaultAgency('booking');
  function baseAmount(ag?: Agency){
    if (!ag) return 0;
    if (ag.base === 'gross') return grossFee - wht; // after WHT but before costs
    return grossFee - wht - costs; // net-after-costs base
  }
  const mgmt = mgmtAg ? baseAmount(mgmtAg) * (mgmtAg.percent/100) : 0;
  const booking = bookingAg ? baseAmount(bookingAg) * (bookingAg.percent/100) : 0;
  return { mgmt, booking, total: mgmt + booking, breakdown: { mgmt: mgmtAg, booking: bookingAg } };
}

// --- UI Binding (Settings Panel) -------------------------------------------------
import { showConfirmModal } from '../modals';
import { animateButtonSave } from '../utils';

export function bindAgenciesUI(){
  if ((window as any)._agenciesUIBound) return; (window as any)._agenciesUIBound = true;
  const listHost = document.getElementById('agencyList');
  const form = document.getElementById('addAgencyForm') as HTMLFormElement | null;
  const addBtn = document.getElementById('addAgencyBtn') as HTMLButtonElement | null;
  if (form && addBtn){
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      animateButtonSave(addBtn, async () => {
        const name = (document.getElementById('newAgencyName') as HTMLInputElement | null)?.value.trim();
        const comm = parseFloat((document.getElementById('newAgencyComm') as HTMLInputElement | null)?.value || '0') || 0;
        const type = (document.getElementById('newAgencyType') as HTMLSelectElement | null)?.value as any || 'booking';
        const base = (document.getElementById('newAgencyBase') as HTMLSelectElement | null)?.value as any || 'gross';
        const makeDefault = (document.getElementById('newAgencyDefault') as HTMLInputElement | null)?.checked || false;
        if (!name) return;
        addAgency(name, type, comm, base, makeDefault);
        try { form.reset(); } catch {}
        renderAgencyList();
        await new Promise(r => setTimeout(r,10));
      }, { savingLabel:'Añadiendo…', successLabel:'Agregado', icon:'loader-2', successIcon:'check', restoreDelay: 800 });
    });
  }
  renderAgencyList();
  enableDrag(listHost);
  if (listHost && !(listHost as any)._agListBound){
    (listHost as any)._agListBound = true;
    listHost.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button[data-action]') as HTMLButtonElement | null; if (!btn) return;
      const row = btn.closest('.cost-item') as HTMLElement | null; if (!row) return;
      const agId = row.getAttribute('data-id'); if (!agId) return;
      const action = btn.getAttribute('data-action');
      if (action === 'agency-delete'){
        const agencySnapshot = listAgencies().find(a => a.id === agId);
        if (!agencySnapshot) return;
        deleteAgency(agId); renderAgencyList();
        showAgencyUndoToast(agencySnapshot);
      } else if (action === 'agency-default'){
        setDefaultAgency(agId); renderAgencyList();
      } else if (action === 'agency-edit'){
        toggleEdit(row, true);
      } else if (action === 'agency-cancel'){
        toggleEdit(row, false);
      } else if (action === 'agency-save'){
        const nameEl = row.querySelector('[data-edit="name"]') as HTMLInputElement | null;
        const commEl = row.querySelector('[data-edit="comm"]') as HTMLInputElement | null;
        const typeEl = row.querySelector('[data-edit="type"]') as HTMLSelectElement | null;
        const baseEl = row.querySelector('[data-edit="base"]') as HTMLSelectElement | null;
        const saveBtn = btn; // reuse clicked button
        animateButtonSave(saveBtn, async () => {
          updateAgency(agId, {
            name: nameEl?.value || undefined,
            percent: parseFloat(commEl?.value || '0') || 0,
            type: (typeEl?.value as any) || undefined,
            base: (baseEl?.value as any) || undefined
          });
          toggleEdit(row, false); renderAgencyList();
          await new Promise(r => setTimeout(r, 10));
  }, { savingLabel:'Saving…', successLabel:'Updated', icon:'loader-2', successIcon:'check', restoreDelay: 700 });
      }
    });
  }
}

function toggleEdit(row: HTMLElement, on: boolean){
  const editRow = row.querySelector('.agency-edit-row') as HTMLElement | null;
  if (!editRow) return;
  editRow.style.display = on ? 'grid' : 'none';
}

export function renderAgencyList(){
  const host = document.getElementById('agencyList'); if (!host) return;
  const tpl = (document.getElementById('agency-row-template') as HTMLTemplateElement | null);
  const agencies = listAgenciesOrdered();
  host.innerHTML = '';
  if (!agencies.length){ host.innerHTML = '<div class="muted empty">No agencies configured.</div>'; return; }
  agencies.forEach(a => {
    const node = tpl && 'content' in tpl ? (tpl.content.firstElementChild?.cloneNode(true) as HTMLElement) : document.createElement('div');
    node.setAttribute('data-id', a.id);
    node.setAttribute('draggable','true');
    const nameEl = node.querySelector('.agency-name'); if (nameEl) nameEl.textContent = a.name;
    const commEl = node.querySelector('.agency-comm'); if (commEl) commEl.textContent = a.percent + '%';
    const baseChip = node.querySelector('[data-role="base-chip"]') as HTMLElement | null; if (baseChip){ baseChip.textContent = a.base; baseChip.hidden = false; }
    const typeChip = node.querySelector('[data-role="type-chip"]') as HTMLElement | null; if (typeChip){ typeChip.textContent = a.type; typeChip.hidden = false; }
    const defChip = node.querySelector('[data-role="default-chip"]') as HTMLElement | null; if (defChip){ defChip.hidden = !a.default; }
    // Prefill edit row
    const editName = node.querySelector('[data-edit="name"]') as HTMLInputElement | null; if (editName) editName.value = a.name;
    const editComm = node.querySelector('[data-edit="comm"]') as HTMLInputElement | null; if (editComm) editComm.value = String(a.percent);
    const editType = node.querySelector('[data-edit="type"]') as HTMLSelectElement | null; if (editType) editType.value = a.type;
    const editBase = node.querySelector('[data-edit="base"]') as HTMLSelectElement | null; if (editBase) editBase.value = a.base;
    host.appendChild(node);
  });
  (window as any).refreshIcons?.();
}

function enableDrag(host: HTMLElement | null){
  if (!host || (host as any)._dragBound) return; (host as any)._dragBound = true;
  let dragEl: HTMLElement | null = null;
  host.addEventListener('dragstart', (e) => {
    const el = (e.target as HTMLElement).closest('[data-id]') as HTMLElement | null; if (!el) return;
    dragEl = el; el.classList.add('dragging');
    e.dataTransfer?.setData('text/plain', el.getAttribute('data-id')||'');
  });
  host.addEventListener('dragend', () => { if (dragEl){ dragEl.classList.remove('dragging'); dragEl = null; } });
  host.addEventListener('dragover', (e) => {
    e.preventDefault();
    const after = getDragAfter(host, e.clientY);
    if (!dragEl) return;
    if (after == null) host.appendChild(dragEl); else host.insertBefore(dragEl, after);
  });
  host.addEventListener('drop', () => persistCurrentOrder(host));
}

function getDragAfter(container: HTMLElement, y: number){
  const els = [...container.querySelectorAll<HTMLElement>('[data-id]:not(.dragging)')];
  let closest = { offset: Number.NEGATIVE_INFINITY, el: null as HTMLElement | null };
  els.forEach(el => {
    const rect = el.getBoundingClientRect();
    const offset = y - rect.top - rect.height/2;
    if (offset < 0 && offset > closest.offset){ closest = { offset, el }; }
  });
  return closest.el;
}

function persistCurrentOrder(host: HTMLElement){
  const ids = [...host.querySelectorAll('[data-id]')].map(el => (el as HTMLElement).getAttribute('data-id')||'').filter(Boolean);
  saveOrder(ids);
}

// --- Undo Toast for agency deletion (reuses toastHost if present) ----------------
function ensureToastHost(){
  let host = document.getElementById('toastHost');
  if (!host){
    host = document.createElement('div');
    host.id = 'toastHost';
    host.setAttribute('role','status');
    host.setAttribute('aria-live','polite');
    document.body.appendChild(host);
  }
  return host;
}

function showAgencyUndoToast(agency: Agency){
  const host = ensureToastHost();
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<strong>${agency.name}</strong> eliminada. <button class="ghost tiny" data-act="undo-ag">Deshacer</button>`;
  host.appendChild(el);
  requestAnimationFrame(()=> { el.classList.add('show'); });
  let undone = false;
  el.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button[data-act="undo-ag"]');
    if (b && !undone){
      undone = true;
      addAgency(agency.name, agency.type, agency.percent, agency.base, agency.default);
      renderAgencyList();
      el.classList.remove('show');
      setTimeout(()=> el.remove(), 300);
    }
  });
  setTimeout(()=> { if (!undone){ el.classList.remove('show'); setTimeout(()=> el.remove(), 300); } }, 4500);
}
