// Minimal HTML entity encoder to prevent injection in innerHTML templates
const map: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function escapeHtml(input: unknown): string {
  const s = String(input ?? '');
  return s.replace(/[&<>"']/g, (ch) => map[ch as keyof typeof map] ?? ch);
}
