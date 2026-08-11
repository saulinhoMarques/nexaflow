document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const email = document.getElementById('email').value.trim();
    const remember = document.getElementById('remember').checked;
    if (remember) localStorage.setItem('nexaflow-demo-email', email);
    else localStorage.removeItem('nexaflow-demo-email');
    window.location.href = 'dashboard.html';
  });

  const remembered = localStorage.getItem('nexaflow-demo-email');
  if (remembered) {
    document.getElementById('email').value = remembered;
    document.getElementById('remember').checked = true;
  }
});
