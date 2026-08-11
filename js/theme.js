(() => {
  const STORAGE_KEY = 'nexaflow-theme';
  const root = document.documentElement;
  const script = document.currentScript;
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = stored === 'dark' || stored === 'light' ? stored : (prefersDark ? 'dark' : 'light');

  root.dataset.theme = initialTheme;

  if (script?.src && !document.querySelector('link[data-nf-theme]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../css/theme.css', script.src).href;
    link.dataset.nfTheme = 'true';
    document.head.appendChild(link);
  }

  function updateButton(button) {
    const dark = root.dataset.theme === 'dark';
    button.textContent = dark ? '☀️' : '🌙';
    button.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
    button.setAttribute('title', dark ? 'Modo claro' : 'Modo escuro');
    button.setAttribute('aria-pressed', String(dark));
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    document.querySelectorAll('.nf-theme-toggle').forEach(updateButton);
    window.dispatchEvent(new CustomEvent('nexaflow:themechange', { detail: { theme } }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.nf-theme-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nf-theme-toggle';
    button.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
    updateButton(button);
    document.body.appendChild(button);
  });

  window.NexaFlowTheme = {
    get: () => root.dataset.theme,
    set: setTheme,
    toggle: () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark')
  };
})();
