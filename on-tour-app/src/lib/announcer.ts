// Lightweight ARIA live announcer utility
// Creates (once) hidden live regions and exposes an announce() helper.

type Politeness = 'polite' | 'assertive';

function ensureRegion(kind: Politeness): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const id = kind === 'polite' ? 'sr-live-polite' : 'sr-live-assertive';
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement('div');
    node.id = id;
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', kind);
    node.setAttribute('aria-atomic', 'true');
    node.className = 'sr-only';
    // Keep it last in DOM for reliable announce in some screen readers
    try { document.body.appendChild(node); } catch {}
  }
  return node;
}

export function announce(message: string, politeness: Politeness = 'polite') {
  const node = ensureRegion(politeness);
  if (!node) return;
  // Clear then set to force announcement across ATs
  node.textContent = '';
  // Small timeout improves reliability in VoiceOver/NVDA
  setTimeout(() => { node.textContent = message; }, 10);
}

export default announce;
