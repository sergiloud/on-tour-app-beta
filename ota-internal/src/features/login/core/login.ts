function onSubmit(e: SubmitEvent) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const data = new FormData(form);
  const email = String(data.get('email') || '').trim();
  const password = String(data.get('password') || '').trim();

  // Minimal validation (no backend)
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }

  // Demo token (no data persisted except token)
  try {
    localStorage.setItem('authToken', `demo.${btoa(email)}.${Date.now()}`);
  } catch {}

  // Navigate to app shell
  window.location.href = '/app.html';
}

function initLogin() {
  const form = document.getElementById('login-form') as HTMLFormElement | null;
  form?.addEventListener('submit', onSubmit);
}

document.addEventListener('DOMContentLoaded', initLogin);
