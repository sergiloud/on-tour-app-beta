// Minimal service worker placeholder
self.addEventListener('install', (e)=>{
  self.skipWaiting();
});
self.addEventListener('activate', (e)=>{
  // Claim clients so updates apply immediately
  e.waitUntil(self.clients.claim());
});
// Removed no-op fetch handler to eliminate performance warning
