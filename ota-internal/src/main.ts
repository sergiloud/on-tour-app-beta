// Fresh entrypoint for OTA Internal landing
// - No data loaded
// - Minimal progressive enhancement

function updateCtaIfAuthenticated() {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      document.querySelectorAll('.cta .primary')?.forEach((el) => {
        if (el instanceof HTMLAnchorElement) {
          el.href = '/app.html';
        }
      });
    }
  } catch {
    // ignore
  }
}

function smoothAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href') || '';
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function initMain() {
  updateCtaIfAuthenticated();
  smoothAnchorScroll();
}

document.addEventListener('DOMContentLoaded', initMain);
