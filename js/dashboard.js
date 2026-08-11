document.addEventListener('DOMContentLoaded', () => {
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const metricCards = document.getElementById('metricCards');
  const panelBody = document.getElementById('panelBody');

  const safeParse = (value, fallback) => {
    try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; }
  };

  const config = safeParse(localStorage.getItem('nexaflow-config'), {});
  const clientes = safeParse(localStorage.getItem('nexaflow-clientes'), []);
  const servicos = safeParse(localStorage.getItem('nexaflow-servicos'), []);
  const agendaInterna = safeParse(localStorage.getItem('nexaflow-agendamentos'), []);
  const agendaPublica = safeParse(localStorage.getItem('nexaflow-public-bookings'), []);

  const slugify = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const companySlug = slugify(config?.empresa?.nome) || 'barbearia-imperial';
  const nomeConta = config?.conta?.nome || sessionStorage.getItem('nexaflow-signup-name') || 'João';
  const primeiroNome = String(nomeConta).trim().split(/\s+/)[0] || 'João';
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  if (pageTitle) pageTitle.textContent = `${saudacao}, ${primeiroNome} 👋`;
  if (pageSubtitle) {
    const empresa = config?.empresa?.nome;
    pageSubtitle.textContent = empresa ? `Veja como está a ${empresa} hoje.` : 'Veja como está seu negócio hoje.';
  }

  const hoje = new Date();
  const isoHoje = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const publicasEmpresa = agendaPublica.filter(item => item.companySlug === companySlug);
  const agendaCompleta = [...agendaInterna, ...publicasEmpresa.filter(p => !agendaInterna.some(i => i.id === p.id))];
  const agendamentosHoje = agendaCompleta.filter(item => item.data === isoHoje && item.status !== 'cancelado');

  const totalClientes = clientes.length || 148;
  const totalServicos = servicos.length || 8;
  const totalAgenda = agendamentosHoje.length || 12;

  if (metricCards) {
    metricCards.innerHTML = [
      { label: 'Agendamentos hoje', value: totalAgenda },
      { label: 'Clientes', value: totalClientes },
      { label: 'Serviços', value: totalServicos }
    ].map(card => `
      <article class="dashboard-card">
        <strong>${card.value}</strong>
        <p>${card.label}</p>
      </article>
    `).join('');
  }

  document.querySelectorAll('.topbar-actions button').forEach(button => {
    button.addEventListener('click', () => {
      const label = button.textContent.trim().toLowerCase();
      if (label.includes('notifica')) window.location.href = 'configuracoes.html?tab=notificacoes';
      else if (label.includes('perfil')) window.location.href = 'configuracoes.html?tab=conta';
    });
  });

  if (panelBody && agendaCompleta.length) {
    const proximos = agendaCompleta
      .filter(item => item.status !== 'cancelado')
      .sort((a, b) => `${a.data || ''} ${a.hora || ''}`.localeCompare(`${b.data || ''} ${b.hora || ''}`))
      .slice(0, 5);

    if (proximos.length) {
      panelBody.innerHTML = proximos.map(item => `
        <div class="appointment-row">
          <span>${item.cliente || 'Cliente'}</span>
          <span>${item.servico || 'Serviço'}</span>
          <span>${item.hora || '--:--'}</span>
          <span>${String(item.status || 'pendente').replace(/^./, c => c.toUpperCase())}</span>
        </div>
      `).join('');
    }
  }
});
