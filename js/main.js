document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const targetId = link.getAttribute('href');
      if (!targetId) return;

      if (targetId === '#') {
        const label = link.textContent.trim().toLowerCase();
        if (label.includes('privacidade')) {
          event.preventDefault();
          window.location.href = 'pages/privacidade.html';
        } else if (label.includes('termos')) {
          event.preventDefault();
          window.location.href = 'pages/termos.html';
        }
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});
