document.addEventListener('DOMContentLoaded', () => {
  const servicos = [
    { id: 1, nome: 'Corte masculino', preco: 35, duracao: 30, descricao: 'Corte personalizado com acabamento.', ativo: true },
    { id: 2, nome: 'Barba', preco: 25, duracao: 20, descricao: 'Modelagem e acabamento de barba.', ativo: true },
    { id: 3, nome: 'Corte + Barba', preco: 55, duracao: 50, descricao: 'Pacote completo de corte e barba.', ativo: true },
    { id: 4, nome: 'Sobrancelha', preco: 15, duracao: 15, descricao: 'Design e acabamento de sobrancelha.', ativo: true },
  ];

  const grid = document.querySelector('#servicosGrid');
  const empty = document.querySelector('#servicosEmpty');
  const busca = document.querySelector('#servicoBusca');
  const filtro = document.querySelector('#servicoFiltro');
  const form = document.querySelector('#servicoForm');
  const modalElement = document.querySelector('#servicoModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  const modalLabel = document.querySelector('#servicoModalLabel');
  const total = document.querySelector('#totalServicos');
  const ativos = document.querySelector('#servicosAtivos');
  const ticket = document.querySelector('#ticketMedio');

  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  function atualizarResumo() {
    total.textContent = servicos.length;
    ativos.textContent = servicos.filter((item) => item.ativo).length;
    const media = servicos.length ? servicos.reduce((acc, item) => acc + Number(item.preco), 0) / servicos.length : 0;
    ticket.textContent = moeda.format(media);
  }

  function render() {
    const termo = busca.value.trim().toLowerCase();
    const status = filtro.value;
    const filtrados = servicos.filter((item) => {
      const bateBusca = item.nome.toLowerCase().includes(termo) || item.descricao.toLowerCase().includes(termo);
      const bateStatus = status === 'todos' || (status === 'ativo' && item.ativo) || (status === 'inativo' && !item.ativo);
      return bateBusca && bateStatus;
    });

    grid.innerHTML = filtrados.map((item) => `
      <article class="servico-card">
        <div class="servico-card-top">
          <div>
            <h3>${item.nome}</h3>
            <p>${item.descricao || 'Sem descrição cadastrada.'}</p>
          </div>
          <span class="servico-status ${item.ativo ? 'ativo' : 'inativo'}">${item.ativo ? 'Ativo' : 'Inativo'}</span>
        </div>
        <div class="servico-meta">
          <span>${moeda.format(item.preco)}</span>
          <span>${item.duracao} min</span>
        </div>
        <div class="servico-actions">
          <button class="edit" data-action="editar" data-id="${item.id}">Editar</button>
          <button class="toggle" data-action="alternar" data-id="${item.id}">${item.ativo ? 'Inativar' : 'Ativar'}</button>
          <button class="delete" data-action="excluir" data-id="${item.id}">Excluir</button>
        </div>
      </article>
    `).join('');

    empty.classList.toggle('d-none', filtrados.length > 0);
    atualizarResumo();
  }

  function limparFormulario() {
    form.reset();
    document.querySelector('#servicoId').value = '';
    document.querySelector('#servicoAtivo').checked = true;
    modalLabel.textContent = 'Novo serviço';
  }

  modalElement.addEventListener('hidden.bs.modal', limparFormulario);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = Number(document.querySelector('#servicoId').value);
    const dados = {
      nome: document.querySelector('#servicoNome').value.trim(),
      preco: Number(document.querySelector('#servicoPreco').value),
      duracao: Number(document.querySelector('#servicoDuracao').value),
      descricao: document.querySelector('#servicoDescricao').value.trim(),
      ativo: document.querySelector('#servicoAtivo').checked,
    };

    if (id) {
      const index = servicos.findIndex((item) => item.id === id);
      if (index >= 0) servicos[index] = { ...servicos[index], ...dados };
    } else {
      servicos.unshift({ id: Date.now(), ...dados });
    }

    modal.hide();
    render();
  });

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const item = servicos.find((servico) => servico.id === id);
    if (!item) return;

    if (button.dataset.action === 'editar') {
      document.querySelector('#servicoId').value = item.id;
      document.querySelector('#servicoNome').value = item.nome;
      document.querySelector('#servicoPreco').value = item.preco;
      document.querySelector('#servicoDuracao').value = item.duracao;
      document.querySelector('#servicoDescricao').value = item.descricao;
      document.querySelector('#servicoAtivo').checked = item.ativo;
      modalLabel.textContent = 'Editar serviço';
      modal.show();
    }

    if (button.dataset.action === 'alternar') {
      item.ativo = !item.ativo;
      render();
    }

    if (button.dataset.action === 'excluir' && confirm(`Excluir o serviço "${item.nome}"?`)) {
      const index = servicos.findIndex((servico) => servico.id === id);
      servicos.splice(index, 1);
      render();
    }
  });

  busca.addEventListener('input', render);
  filtro.addEventListener('change', render);
  render();
});
