document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'nexaflow-clientes';
  const defaults = [
    { id: 1, nome: 'João Silva', telefone: '(11) 98765-1200', email: 'joao@email.com', ultimo: 'Hoje, 14:30', agendamentos: 12, status: 'ativo', historico: ['Corte masculino — Hoje, 14:30', 'Barba — 03/08, 10:00'] },
    { id: 2, nome: 'Pedro Santos', telefone: '(11) 97654-3321', email: 'pedro@email.com', ultimo: '09/08, 15:00', agendamentos: 8, status: 'ativo', historico: ['Manicure — 09/08, 15:00', 'Pedicure — 22/07, 11:00'] },
    { id: 3, nome: 'Marcos Oliveira', telefone: '(11) 96543-8890', email: 'marcos@email.com', ultimo: '08/08, 16:30', agendamentos: 5, status: 'ativo', historico: ['Escova — 08/08, 16:30'] },
    { id: 4, nome: 'Ana Costa', telefone: '(11) 95432-7712', email: 'ana@email.com', ultimo: '05/08, 09:00', agendamentos: 3, status: 'ativo', historico: ['Design de sobrancelha — 05/08, 09:00'] },
    { id: 5, nome: 'Rafael Lima', telefone: '(11) 94321-6622', email: 'rafael@email.com', ultimo: '20/07, 17:00', agendamentos: 2, status: 'inativo', historico: ['Corte masculino — 20/07, 17:00'] }
  ];

  const safeParse = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; } };
  const stored = safeParse(localStorage.getItem(STORAGE_KEY), null);
  const clientes = Array.isArray(stored) ? stored : structuredClone(defaults);
  const slugify = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const config = safeParse(localStorage.getItem('nexaflow-config'), {});
  const companySlug = slugify(config?.empresa?.nome) || 'barbearia-imperial';

  const publicBookings = safeParse(localStorage.getItem('nexaflow-public-bookings'), []);
  publicBookings.filter(booking => booking.companySlug === companySlug).forEach(booking => {
    if (!booking.cliente) return;
    const existing = clientes.find(c => c.nome.toLowerCase() === booking.cliente.toLowerCase());
    const historyEntry = `${booking.servico || 'Atendimento'} — ${booking.data || ''}, ${booking.hora || ''}`;
    if (existing) {
      if (booking.telefone && !existing.telefone) existing.telefone = booking.telefone;
      if (booking.email && !existing.email) existing.email = booking.email;
      if (!existing.historico.includes(historyEntry)) existing.historico.unshift(historyEntry);
    } else {
      clientes.unshift({
        id: booking.id || Date.now(), nome: booking.cliente, telefone: booking.telefone || '', email: booking.email || '',
        ultimo: booking.data ? `${booking.data}, ${booking.hora || ''}` : 'Agendamento online',
        agendamentos: 1, status: 'ativo', historico: [historyEntry]
      });
    }
  });

  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
  persist();

  const tableBody = document.querySelector('#clientesTableBody');
  const busca = document.querySelector('#clienteBusca');
  const filtro = document.querySelector('#clienteFiltro');
  const empty = document.querySelector('#clientesEmpty');
  const form = document.querySelector('#clienteForm');
  const total = document.querySelector('#totalClientes');
  const ativos = document.querySelector('#clientesAtivos');
  const detalhesModal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#clienteDetalhesModal'));
  const cadastroModalElement = document.querySelector('#clienteModal');

  const getInitials = nome => nome.split(' ').filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
  const normalizar = valor => String(valor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const updateSummary = () => {
    total.textContent = clientes.length;
    ativos.textContent = clientes.filter(cliente => cliente.status === 'ativo').length;
  };

  const render = () => {
    const termo = normalizar(busca.value.trim());
    const status = filtro.value;
    const filtrados = clientes.filter(cliente => {
      const correspondeBusca = [cliente.nome, cliente.telefone, cliente.email].some(valor => normalizar(valor).includes(termo));
      return correspondeBusca && (status === 'todos' || cliente.status === status);
    });

    tableBody.innerHTML = filtrados.map(cliente => `
      <tr>
        <td><div class="cliente-name"><span class="cliente-avatar">${getInitials(cliente.nome)}</span><div><strong>${cliente.nome}</strong><small>#${String(cliente.id).padStart(4, '0')}</small></div></div></td>
        <td class="cliente-contact"><strong>${cliente.telefone || 'Sem telefone'}</strong><small>${cliente.email || 'Sem e-mail'}</small></td>
        <td>${cliente.ultimo || 'Sem atendimentos'}</td>
        <td>${cliente.agendamentos || 0}</td>
        <td><span class="status-badge ${cliente.status}">${cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
        <td><div class="clientes-actions"><button class="action-view" data-action="view" data-id="${cliente.id}">Ver</button><button class="action-toggle" data-action="toggle" data-id="${cliente.id}">${cliente.status === 'ativo' ? 'Inativar' : 'Ativar'}</button><button class="action-delete" data-action="delete" data-id="${cliente.id}">Excluir</button></div></td>
      </tr>
    `).join('');

    empty.classList.toggle('d-none', filtrados.length > 0);
    updateSummary();
  };

  busca.addEventListener('input', render);
  filtro.addEventListener('change', render);

  tableBody.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const cliente = clientes.find(item => Number(item.id) === id);
    if (!cliente) return;

    if (button.dataset.action === 'view') {
      document.querySelector('#detalheNome').textContent = cliente.nome;
      document.querySelector('#detalheTelefone').textContent = cliente.telefone || 'Não informado';
      document.querySelector('#detalheEmail').textContent = cliente.email || 'Não informado';
      document.querySelector('#detalheStatus').textContent = cliente.status === 'ativo' ? 'Ativo' : 'Inativo';
      document.querySelector('#detalheAgendamentos').textContent = cliente.agendamentos || 0;
      document.querySelector('#detalheHistorico').innerHTML = (cliente.historico || []).map(item => {
        const [servico, data] = item.split(' — ');
        return `<div class="history-row"><strong>${servico}</strong><small>${data || ''}</small></div>`;
      }).join('') || '<p>Sem histórico.</p>';
      detalhesModal.show();
    }

    if (button.dataset.action === 'toggle') {
      cliente.status = cliente.status === 'ativo' ? 'inativo' : 'ativo';
      persist();
      render();
    }

    if (button.dataset.action === 'delete' && window.confirm(`Excluir ${cliente.nome}?`)) {
      clientes.splice(clientes.findIndex(item => Number(item.id) === id), 1);
      persist();
      render();
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const nome = document.querySelector('#clienteNome').value.trim();
    const telefone = document.querySelector('#clienteTelefone').value.trim();
    const email = document.querySelector('#clienteEmail').value.trim();
    const observacoes = document.querySelector('#clienteObservacoes').value.trim();

    clientes.unshift({ id: Date.now(), nome, telefone, email, ultimo: 'Sem atendimentos', agendamentos: 0, status: 'ativo', historico: observacoes ? [`Observação — ${observacoes}`] : [] });
    persist();
    form.reset();
    form.classList.remove('was-validated');
    bootstrap.Modal.getInstance(cadastroModalElement)?.hide();
    render();
  });

  render();
});
