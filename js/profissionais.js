document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'nexaflow-profissionais';
  const defaults = [
    { id: 1, nome: 'Carlos Mendes', especialidade: 'Barbeiro', telefone: '(11) 98888-1200', email: 'carlos@nexaflow.demo', servicos: ['Corte masculino', 'Barba'], inicio: '08:00', fim: '18:00', ativo: true, atendimentos: 5 },
    { id: 2, nome: 'Ana Souza', especialidade: 'Manicure', telefone: '(11) 97777-2200', email: 'ana@nexaflow.demo', servicos: ['Manicure'], inicio: '09:00', fim: '18:00', ativo: true, atendimentos: 3 },
    { id: 3, nome: 'Marina Lima', especialidade: 'Cabeleireira', telefone: '(11) 96666-3300', email: 'marina@nexaflow.demo', servicos: ['Escova'], inicio: '10:00', fim: '19:00', ativo: true, atendimentos: 3 },
    { id: 4, nome: 'Rafael Alves', especialidade: 'Barbeiro', telefone: '(11) 95555-4400', email: 'rafael@nexaflow.demo', servicos: ['Corte masculino'], inicio: '08:00', fim: '17:00', ativo: false, atendimentos: 0 }
  ];
  const safeParse = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; } };
  const stored = safeParse(localStorage.getItem(STORAGE_KEY), null);
  const profissionais = Array.isArray(stored) ? stored : structuredClone(defaults);
  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(profissionais));
  persist();

  const grid = document.getElementById('profissionaisGrid');
  const empty = document.getElementById('profissionaisEmpty');
  const busca = document.getElementById('profissionalBusca');
  const filtro = document.getElementById('profissionalFiltro');
  const form = document.getElementById('profissionalForm');
  const modalElement = document.getElementById('profissionalModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  const campoId = document.getElementById('profissionalId');
  const campoNome = document.getElementById('profissionalNome');
  const campoEspecialidade = document.getElementById('profissionalEspecialidade');
  const campoTelefone = document.getElementById('profissionalTelefone');
  const campoEmail = document.getElementById('profissionalEmail');
  const campoInicio = document.getElementById('profissionalInicio');
  const campoFim = document.getElementById('profissionalFim');
  const campoAtivo = document.getElementById('profissionalAtivo');
  const servicosGrid = document.querySelector('.servicos-check-grid');
  const servicosCadastrados = safeParse(localStorage.getItem('nexaflow-servicos'), []).filter(item => item.ativo !== false);
  if (servicosGrid && servicosCadastrados.length) {
    servicosGrid.innerHTML = servicosCadastrados.map(servico => `<label class="form-check"><input class="form-check-input profissional-servico" type="checkbox" value="${servico.nome}"><span class="form-check-label">${servico.nome}</span></label>`).join('');
  }
  const checkServicos = Array.from(document.querySelectorAll('.profissional-servico'));
  const modalTitle = document.getElementById('profissionalModalLabel');
  const normalizar = valor => String(valor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const iniciais = nome => nome.split(' ').filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();

  function atualizarResumo() {
    document.getElementById('totalProfissionais').textContent = profissionais.length;
    document.getElementById('profissionaisAtivos').textContent = profissionais.filter(p => p.ativo).length;
    document.getElementById('atendimentosHoje').textContent = profissionais.reduce((total, p) => total + Number(p.atendimentos || 0), 0);
  }

  function renderizar() {
    const termo = normalizar(busca.value);
    const status = filtro.value;
    const filtrados = profissionais.filter(p => {
      const texto = normalizar([p.nome, p.especialidade, p.telefone, p.email, ...(p.servicos || [])].join(' '));
      return (!termo || texto.includes(termo)) && (status === 'todos' || (status === 'ativo' && p.ativo) || (status === 'inativo' && !p.ativo));
    });

    grid.innerHTML = filtrados.map(p => `
      <article class="profissional-card">
        <div class="profissional-header"><div class="profissional-identity"><div class="profissional-avatar">${iniciais(p.nome)}</div><div><h3>${p.nome}</h3><p class="especialidade">${p.especialidade}</p></div></div><span class="profissional-status ${p.ativo ? 'ativo' : 'inativo'}">${p.ativo ? 'Ativo' : 'Inativo'}</span></div>
        <div class="profissional-contact"><span>${p.telefone || 'Telefone não informado'}</span><span>${p.email || 'E-mail não informado'}</span></div>
        <div class="profissional-services">${(p.servicos || []).length ? p.servicos.map(servico => `<span class="profissional-service-tag">${servico}</span>`).join('') : '<span class="profissional-service-tag">Sem serviços vinculados</span>'}</div>
        <div class="profissional-meta"><div><span>Expediente</span><strong>${p.inicio} — ${p.fim}</strong></div><div><span>Atendimentos hoje</span><strong>${p.atendimentos || 0}</strong></div></div>
        <div class="profissional-actions"><button class="btn btn-outline-custom btn-sm" data-action="editar" data-id="${p.id}">Editar</button><button class="btn btn-outline-custom btn-sm" data-action="status" data-id="${p.id}">${p.ativo ? 'Inativar' : 'Ativar'}</button><button class="btn btn-outline-danger btn-sm" data-action="excluir" data-id="${p.id}">Excluir</button></div>
      </article>
    `).join('');
    empty.classList.toggle('d-none', filtrados.length > 0);
    atualizarResumo();
  }

  function limparFormulario() {
    form.reset();
    campoId.value = '';
    campoInicio.value = '08:00';
    campoFim.value = '18:00';
    campoAtivo.checked = true;
    checkServicos.forEach(check => { check.checked = false; });
    modalTitle.textContent = 'Novo profissional';
    form.classList.remove('was-validated');
  }

  function editarProfissional(id) {
    const profissional = profissionais.find(p => Number(p.id) === id);
    if (!profissional) return;
    campoId.value = profissional.id;
    campoNome.value = profissional.nome;
    campoEspecialidade.value = profissional.especialidade;
    campoTelefone.value = profissional.telefone || '';
    campoEmail.value = profissional.email || '';
    campoInicio.value = profissional.inicio || '08:00';
    campoFim.value = profissional.fim || '18:00';
    campoAtivo.checked = profissional.ativo;
    checkServicos.forEach(check => { check.checked = (profissional.servicos || []).includes(check.value); });
    modalTitle.textContent = 'Editar profissional';
    modal.show();
  }

  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const index = profissionais.findIndex(p => Number(p.id) === id);
    if (index < 0) return;
    if (button.dataset.action === 'editar') editarProfissional(id);
    if (button.dataset.action === 'status') { profissionais[index].ativo = !profissionais[index].ativo; persist(); renderizar(); }
    if (button.dataset.action === 'excluir' && window.confirm(`Excluir ${profissionais[index].nome}?`)) { profissionais.splice(index, 1); persist(); renderizar(); }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const servicosSelecionados = checkServicos.filter(check => check.checked).map(check => check.value);
    const id = Number(campoId.value);
    const dados = { nome: campoNome.value.trim(), especialidade: campoEspecialidade.value.trim(), telefone: campoTelefone.value.trim(), email: campoEmail.value.trim(), servicos: servicosSelecionados, inicio: campoInicio.value || '08:00', fim: campoFim.value || '18:00', ativo: campoAtivo.checked };
    if (id) {
      const index = profissionais.findIndex(p => Number(p.id) === id);
      if (index >= 0) profissionais[index] = { ...profissionais[index], ...dados };
    } else profissionais.push({ id: Date.now(), ...dados, atendimentos: 0 });
    persist();
    modal.hide();
    limparFormulario();
    renderizar();
  });

  modalElement.addEventListener('hidden.bs.modal', limparFormulario);
  busca.addEventListener('input', renderizar);
  filtro.addEventListener('change', renderizar);
  renderizar();
});
