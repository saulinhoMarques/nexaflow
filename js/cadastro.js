document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm');
  const alertBox = document.getElementById('cadastroAlert');
  if (!form) return;

  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');

  form.addEventListener('submit', event => {
    event.preventDefault();
    alertBox?.classList.add('d-none');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    if (password.value !== confirmPassword.value) {
      if (alertBox) {
        alertBox.textContent = 'As senhas não coincidem. Confira e tente novamente.';
        alertBox.classList.remove('d-none');
      }
      confirmPassword.focus();
      return;
    }

    sessionStorage.setItem('nexaflow-signup-name', name.value.trim());
    sessionStorage.setItem('nexaflow-signup-email', email.value.trim());
    window.location.href = 'onboarding.html';
  });
});
