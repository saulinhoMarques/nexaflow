const dashboardData = {
  user: 'João',
  business: 'NexaFlow',
  metrics: [
    { label: 'Agendamentos', value: 12 },
    { label: 'Clientes', value: 148 },
    { label: 'Serviços', value: 8 }
  ],
  pages: {
    dashboard: {
      title: 'Bom dia, João 👋',
      subtitle: 'Veja como está seu negócio hoje.',
      panelTitle: 'Próximos agendamentos',
      cards: [
        { label: 'Agendamentos', value: 12 },
        { label: 'Clientes', value: 148 },
        { label: 'Serviços', value: 8 }
      ],
      body: [
        { client: 'João', service: 'Corte', time: '14:30', status: 'Confirmado' },
        { client: 'Pedro', service: 'Manicure', time: '15:00', status: 'Confirmado' },
        { client: 'Marcos', service: 'Escova', time: '16:30', status: 'Confirmado' }
      ]
    },
    agenda: {
      title: 'Agenda',
      subtitle: 'Visão rápida da sua programação do dia.',
      panelTitle: 'Agenda de hoje',
      cards: [
        { label: 'Hoje', value: 12 },
        { label: 'Confirmados', value: 9 },
        { label: 'Pendentes', value: 3 }
      ],
      body: [
        { client: 'Ana', service: 'Corte', time: '09:00', status: 'Confirmado' },
        { client: 'Bruna', service: 'Depilação', time: '10:30', status: 'Pendente' },
        { client: 'Carlos', service: 'Barba', time: '11:45', status: 'Confirmado' }
      ]
    },
    clientes: {
      title: 'Clientes',
      subtitle: 'Acompanhe seus clientes e histórico.',
      panelTitle: 'Últimos clientes',
      cards: [
        { label: 'Total', value: 148 },
        { label: 'Ativos', value: 112 },
        { label: 'Novos', value: 14 }
      ],
      body: [
        { client: 'João Silva', service: 'Corte', time: '14:30', status: 'Fidelizado' },
        { client: 'Pedro Santos', service: 'Manicure', time: '15:00', status: 'Novo' },
        { client: 'Marcos Oliveira', service: 'Escova', time: '16:30', status: 'Fidelizado' }
      ]
    },
    servicos: {
      title: 'Serviços',
      subtitle: 'Gerencie seus serviços mais usados.',
      panelTitle: 'Serviços populares',
      cards: [
        { label: 'Total', value: 8 },
        { label: 'Agendados', value: 23 },
        { label: 'Disponíveis', value: 8 }
      ],
      body: [
        { client: 'Corte', service: 'R$ 80', time: '30 min', status: 'Ativo' },
        { client: 'Escova', service: 'R$ 120', time: '45 min', status: 'Ativo' },
        { client: 'Manicure', service: 'R$ 70', time: '40 min', status: 'Ativo' }
      ]
    },
    profissionais: {
      title: 'Profissionais',
      subtitle: 'Equipe disponível para atendimento.',
      panelTitle: 'Profissionais ativos',
      cards: [
        { label: 'Total', value: 4 },
        { label: 'Disponíveis', value: 3 },
        { label: 'Agendados', value: 5 }
      ],
      body: [
        { client: 'Ana', service: 'Corte', time: '09:00', status: 'Disponível' },
        { client: 'Bruna', service: 'Depilação', time: '10:30', status: 'Em atendimento' },
        { client: 'Carlos', service: 'Barba', time: '11:45', status: 'Disponível' }
      ]
    },
    configuracoes: {
      title: 'Configurações',
      subtitle: 'Ajuste as preferências do seu NexaFlow.',
      panelTitle: 'Configurações rápidas',
      cards: [
        { label: 'Notificações', value: 'Ativas' },
        { label: 'Tema', value: 'Claro' },
        { label: 'Plano', value: 'Profissional' }
      ],
      body: [
        { client: 'Notificações', service: 'Ativas', time: 'Hoje', status: 'Ok' },
        { client: 'Tema', service: 'Claro', time: '-', status: 'Ok' },
        { client: 'Plano', service: 'Profissional', time: '-', status: 'Ok' }
      ]
    }
  }
};

const mountMetricCards = (cardContainer, cards) => {
  cardContainer.innerHTML = cards.map(card => `
    <article class="dashboard-card">
      <strong>${card.value}</strong>
      <p>${card.label}</p>
    </article>
  `).join('');
};

const mountPanelBody = (panelBody, body) => {
  panelBody.innerHTML = body.map(row => `
    <div class="appointment-row">
      <span>${row.client}</span>
      <span>${row.service}</span>
      <span>${row.time}</span>
      <span>${row.status}</span>
    </div>
  `).join('');
};

const setActivePage = (pageKey) => {
  const page = dashboardData.pages[pageKey];
  if (!page) return;

  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const isActive = link.dataset.page === pageKey;
    link.classList.toggle('active', isActive);
  });

  document.getElementById('pageTitle').textContent = page.title;
  document.getElementById('pageSubtitle').textContent = page.subtitle;
  document.getElementById('panelTitle').textContent = page.panelTitle;
  mountMetricCards(document.getElementById('metricCards'), page.cards);
  mountPanelBody(document.getElementById('panelBody'), page.body);
};

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setActivePage(link.dataset.page);
    });
  });

  setActivePage('dashboard');
});