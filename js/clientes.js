document.addEventListener('DOMContentLoaded', () => {
  const clientes = [
    { id: 1, nome: 'João Silva', telefone: '(11) 98765-1200', email: 'joao@email.com', ultimo: 'Hoje, 14:30', agendamentos: 12, status: 'ativo', historico: ['Corte masculino — Hoje, 14:30', 'Barba — 03/08, 10:00'] },
    { id: 2, nome: 'Pedro Santos', telefone: '(11) 97654-3321', email: 'pedro@email.com', ultimo: '09/08, 15:00', agendamentos: 8, status: 'ativo', historico: ['Manicure — 09/08, 15:00', 'Pedicure — 22/07, 11:00'] },
    { id: 3, nome: 'Marcos Oliveira', telefone: '(11) 96543-8890', email: 'marcos@email.com', ultimo: '08/08, 16:30', agendamentos: 5, status: 'ativo', historico: ['Escova — 08/08, 16:30'] },
    { id: 4, nome: 'Ana Costa', telefone: '(11) 95432-7712', email: 'ana@email.com', ultimo: '05/08, 09:00', agendamentos: 3, status: 'ativo', historico: ['Design de sobrancelha — 05/08, 09:00'] },
    { id: 5, nome: 'Rafael Lima', telefone: '(11) 94321-6622', email: 'rafael@email.com', ultimo: '20/07, 17:00', agendamentos: 2, status: 'inativo', historico: ['Corte masculino — 20/07, 17:00'] }
  ];

  const tableBody = document.querySelector('#clientesTableBody');
  const busca = document.querySelector('#clienteBusca');
  const filtro = document.querySelector('#clienteFiltro');
  const empty = document.querySelector('#clientesEmpty');
  const form = document.querySelector('#clienteForm');
  const total = document.querySelector('#totalClientes');
  const ativos = document.querySelector('#clientesAtivos');

  const detalhesModal = new bootstrap.Modal(document.querySelector('#clienteDetalhesModal'));
  const cadastroModalElement = document.querySelector('#clienteModal');

  const getInitials = (nome) => nome.split(' ').slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();

  const updateSummary = () => {
    total.textContent = clientes.length;
    ativos.textContent = clientes.filter((cliente) => cliente.status === 'ativo').length;
  };

  const render = () => {
    const termo = busca.value.trim().toLowerCase();
    const status = filtro.value;
    const filtrados = clientes.filter((cliente) => {
      const correspondeBusca = [cliente.nome, cliente.telefone, cliente.email].some((valor) => valor.toLowerCase().includes(termo));
      const correspondeStatus = status === 'todos' || cliente.status === status;
      return correspondeBusca && correspondeStatus;
    });

    tableBody.innerHTML = filtrados.map((cliente) => `
      <tr>
        <td>
          <div class="cliente-name">
            <span class="cliente-avatar">${getInitials(cliente.nome)}</span>
            <div><strong>${cliente.nome}</strong><small>#${String(cliente.id).padStart(4, '0')}</small></div>
          </div>
        </td>
        <td class="cliente-contact"><strong>${cliente.telefone}</strong><small>${cliente.email || 'Sem e-mail'}</small></td>
        <td>${cliente.ultimo}</td>
        <td>${cliente.agendamentos}</td>
        <td><span class="status-badge ${cliente.status}">${cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
        <td>
          <div class="clientes-actions">
            <button class="action-view" data-action="view" data-id="${cliente.id}">Ver</button>
            <button class="action-toggle" data-action="toggle" data-id="${cliente.id}">${cliente.status === 'ativo' ? 'Inativar' : 'Ativar'}</button>
            <button class="action-delete" data-action="delete" data-id="${cliente.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join('');

    empty.classList.toggle('d-none', filtrados.length > 0);
    updateSummary();
  };

  busca.addEventListener('input', render);
  filtro.addEventListener('change', render);

  tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const cliente = clientes.find((item) => item.id === id);
    if (!cliente) return;

    if (button.dataset.action === 'view') {
      document.querySelector('#detalheNome').textContent = cliente.nome;
      document.querySelector('#detalheTelefone').textContent = cliente.telefone;
      document.querySelector('#detalheEmail').textContent = cliente.email || 'Não informado';
      document.querySelector('#detalheStatus').textContent = cliente.status === 'ativo' ? 'Ativo' : 'Inativo';
      document.querySelector('#detalheAgendamentos').textContent = cliente.agendamentos;
      document.querySelector('#detalheHistorico').innerHTML = cliente.historico.map((item) => {
        const [servico, data] = item.split(' — ');
        return `<div class="history-row"><strong>${servico}</strong><small>${data || ''}</small></div>`;
      }).join('') || '<p>Sem histórico.</p>';
      detalhesModal.show();
    }

    if (button.dataset.action === 'toggle') {
      cliente.status = cliente.status === 'ativo' ? 'inativo' : 'ativo';
      render();
    }

    if (button.dataset.action === 'delete') {
      const confirmar = window.confirm(`Excluir ${cliente.nome}?`);
      if (!confirmar) return;
      const index = clientes.findIndex((item) => item.id === id);
      clientes.splice(index, 1);
      render();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nome = document.querySelector('#clienteNome').value.trim();
    const telefone = document.querySelector('#clienteTelefone').value.trim();
    const email = document.querySelector('#clienteEmail').value.trim();
    if (!nome || !telefone) return;

    clientes.unshift({
      id: Date.now(),
      nome,
      telefone,
      email,
      ultimo: 'Sem atendimentos',
      agendamentos: 0,
      status: 'ativo',
      historico: []
    });

    form.reset();
    bootstrap.Modal.getInstance(cadastroModalElement)?.hide();
    render();
  });

  render();
});
