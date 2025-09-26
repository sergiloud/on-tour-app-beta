// Shared text normalization helpers for travel features
export function norm(s: string){
  return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
}
