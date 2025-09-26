// Modals module (scaffold)
let activeModal: HTMLElement | null = null;
let lastFocused: HTMLElement | null = null;
let modalKeyHandler: ((e: KeyboardEvent) => void) | null = null;

function focusablesWithin(root: HTMLElement): HTMLElement[] {
  const sel = [
    'a[href]','area[href]','input:not([disabled])','select:not([disabled])','textarea:not([disabled])',
    'button:not([disabled])','iframe','object','embed','[contenteditable]','[tabindex]:not([tabindex="-1"])'
  ].join(',');
  return Array.from(root.querySelectorAll<HTMLElement>(sel)).filter(el => el.offsetParent !== null);
}

function trapFocus(e: KeyboardEvent) {
  if (!activeModal || e.key !== 'Tab') return;
  const f = focusablesWithin(activeModal);
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  const current = document.activeElement as HTMLElement | null;
  if (e.shiftKey) {
    if (current === first || !current) { last.focus(); e.preventDefault(); }
  } else {
    if (current === last) { first.focus(); e.preventDefault(); }
  }
}

export function openModal(id: string) {
  const modal = document.getElementById(id) as HTMLElement | null;
  if (!modal) return;
  if (activeModal) closeModal(activeModal);
  lastFocused = document.activeElement as HTMLElement | null;
  modal.hidden = false;
  activeModal = modal;
  document.body.style.overflow = 'hidden';
  const focusTarget = modal.querySelector<HTMLElement>('[autofocus], .modal-content, .close-modal, button');
  (focusTarget || modal).focus();
  document.addEventListener('keydown', trapFocus, true);
  // Keyboard shortcuts for productivity
  if (modalKeyHandler) document.removeEventListener('keydown', modalKeyHandler, true);
  modalKeyHandler = (e: KeyboardEvent) => {
    if (!activeModal) return;
    const meta = e.metaKey || e.ctrlKey;
    // Save (Ctrl/Cmd+S)
    if (meta && (e.key.toLowerCase() === 's')){
      const saveBtn = activeModal.querySelector('#saveShowBtn, .modal-footer .primary') as HTMLButtonElement | null;
      if (saveBtn){ e.preventDefault(); saveBtn.click(); return; }
    }
    // Tabs switching (Ctrl/Cmd+1..9) only in showModal
    if (meta && /[1-9]/.test(e.key) && activeModal.id === 'showModal'){
      const idx = parseInt(e.key,10)-1;
      const tabs = Array.from(activeModal.querySelectorAll('.show-editor-tabs .tab')) as HTMLButtonElement[];
      if (tabs[idx]){ e.preventDefault(); tabs[idx].click(); }
    }
  };
  document.addEventListener('keydown', modalKeyHandler, true);
}

export function closeModal(modal: HTMLElement) {
  modal.hidden = true;
  if (activeModal === modal) {
    activeModal = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapFocus, true);
  if (modalKeyHandler){ document.removeEventListener('keydown', modalKeyHandler, true); modalKeyHandler = null; }
    try { lastFocused?.focus(); } catch {}
    // Clear show hash if closing showModal
    if (modal.id === 'showModal' && location.hash.startsWith('#/show/')){
      history.replaceState(null, '', '#');
    }
  }
}

export function bindModalChrome() {
  if ((window as any)._modalChromeBound) return; (window as any)._modalChromeBound = true;
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement | null;
    if (!t) return;
    if (t.classList.contains('close-modal') || t.closest('.close-modal')) {
      const modal = t.closest('.modal') as HTMLElement | null; if (modal) closeModal(modal);
    } else if (t.classList.contains('modal-backdrop')) {
      const modal = t.closest('.modal') as HTMLElement | null; if (modal) closeModal(modal);
    }
  }, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) { e.preventDefault(); closeModal(activeModal); }
  });
}

// Generic confirmation modal ---------------------------------------------------
export function showConfirmModal(message: string, onConfirm: () => void, options?: { confirmLabel?: string; cancelLabel?: string; title?: string; }){
  let host = document.getElementById('confirmModal') as HTMLElement | null;
  if (!host){
    host = document.createElement('div');
    host.id = 'confirmModal';
    host.className = 'modal modal--xs';
    host.setAttribute('role','dialog');
    host.setAttribute('aria-modal','true');
    host.hidden = true;
    host.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-dialog glass">
        <div class="modal-content">
          <header class="modal-header">
            <h2 class="modal-title" id="confirmModalTitle"></h2>
            <button class="ghost close-modal" aria-label="Close"><i data-lucide="x"></i></button>
          </header>
          <div class="modal-body">
            <p id="confirmModalMessage" role="alert" style="margin:0 0 8px;font-size:14px;line-height:1.4;"></p>
          </div>
          <footer class="modal-footer">
            <button class="ghost close-modal" id="confirmCancelBtn">Cancel</button>
            <button class="primary" id="confirmOkBtn">Confirm</button>
          </footer>
        </div>
      </div>`;
    document.body.appendChild(host);
  }
  const title = options?.title || 'Confirmación';
  const confirmLabel = options?.confirmLabel || 'Confirm';
  const cancelLabel = options?.cancelLabel || 'Cancel';
  const titleEl = host.querySelector('#confirmModalTitle'); if (titleEl) titleEl.textContent = title;
  const msgEl = host.querySelector('#confirmModalMessage'); if (msgEl) msgEl.textContent = message;
  const okBtn = host.querySelector('#confirmOkBtn') as HTMLButtonElement | null; if (okBtn) okBtn.textContent = confirmLabel;
  const cancelBtn = host.querySelector('#confirmCancelBtn') as HTMLButtonElement | null; if (cancelBtn) cancelBtn.textContent = cancelLabel;
  // Replace previous listeners safely
  const newOk = (e: Event) => { e.preventDefault(); try { onConfirm(); } catch {}; closeModal(host!); cleanup(); };
  const newCancel = (e: Event) => { e.preventDefault(); closeModal(host!); cleanup(); };
  function cleanup(){ okBtn?.removeEventListener('click', newOk); cancelBtn?.removeEventListener('click', newCancel); }
  okBtn?.addEventListener('click', newOk);
  cancelBtn?.addEventListener('click', newCancel);
  openModal('confirmModal');
}
