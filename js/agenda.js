document.addEventListener('DOMContentLoaded', () => {
  const INTERNAL_KEY = 'nexaflow-agendamentos';
  const PUBLIC_KEY = 'nexaflow-public-bookings';
  const hoje = new Date();
  const iso = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
  const addDays = n => { const d = new Date(hoje); d.setDate(d.getDate() + n); return iso(d); };
  const safeParse = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; } };
  const slugify = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const config = safeParse(localStorage.getItem('nexaflow-config'), {});
  const companySlug = slugify(config?.empresa?.nome) || 'barbearia-imperial';

  const defaultClientes = ['João Silva', 'Pedro Santos', 'Marcos Oliveira', 'Ana Costa', 'Lucas Martins'];
  const defaultServicos = [
    { nome: 'Corte masculino', duracao: 30 },
    { nome: 'Barba', duracao: 20 },
    { nome: 'Manicure', duracao: 45 },
    { nome: 'Escova', duracao: 60 }
  ];
  const defaultProfissionais = ['Carlos Mendes', 'Ana Souza', 'Marina Lima'];
  const defaultAgenda = [
    { id: 1, companySlug, cliente: 'João Silva', servico: 'Corte masculino', profissional: 'Carlos Mendes', data: addDays(0), hora: '09:00', status: 'confirmado', observacoes: '', origem: 'interno' },
    { id: 2, companySlug, cliente: 'Pedro Santos', servico: 'Barba', profissional: 'Carlos Mendes', data: addDays(0), hora: '10:00', status: 'concluido', observacoes: '', origem: 'interno' },
    { id: 3, companySlug, cliente: 'Ana Costa', servico: 'Manicure', profissional: 'Ana Souza', data: addDays(0), hora: '14:00', status: 'confirmado', observacoes: '', origem: 'interno' },
    { id: 4, companySlug, cliente: 'Marcos Oliveira', servico: 'Escova', profissional: 'Marina Lima', data: addDays(0), hora: '16:30', status: 'pendente', observacoes: '', origem: 'interno' },
    { id: 5, companySlug, cliente: 'Lucas Martins', servico: 'Corte masculino', profissional: 'Carlos Mendes', data: addDays(1), hora: '11:00', status: 'confirmado', observacoes: '', origem: 'interno' }
  ];

  const clientesStore = safeParse(localStorage.getItem('nexaflow-clientes'), []);
  const servicosStore = safeParse(localStorage.getItem('nexaflow-servicos'), []);
  const profissionaisStore = safeParse(localStorage.getItem('nexaflow-profissionais'), []);

  const clientes = Array.isArray(clientesStore) && clientesStore.length ? clientesStore.filter(c => c.status !== 'inativo').map(c => c.nome) : [...defaultClientes];
  const servicos = Array.isArray(servicosStore) && servicosStore.length ? servicosStore.filter(s => s.ativo !== false).map(s => ({ nome: s.nome, duracao: Number(s.duracao) || 30 })) : [...defaultServicos];
  const profissionais = Array.isArray(profissionaisStore) && profissionaisStore.length ? profissionaisStore.filter(p => p.ativo !== false).map(p => p.nome) : [...defaultProfissionais];

  let allInternal = safeParse(localStorage.getItem(INTERNAL_KEY), null);
  if (!Array.isArray(allInternal)) allInternal = structuredClone(defaultAgenda);
  const outrosInternos = allInternal.filter(item => item.companySlug && item.companySlug !== companySlug);
  let internos = allInternal.filter(item => !item.companySlug || item.companySlug === companySlug).map(item => ({ ...item, companySlug, origem: item.origem || 'interno' }));
  localStorage.setItem(INTERNAL_KEY, JSON.stringify([...outrosInternos, ...internos]));

  const getPublicBookings = () => safeParse(localStorage.getItem(PUBLIC_KEY), []);
  const publicos = getPublicBookings().filter(item => item.companySlug === companySlug).map(item => ({ ...item, origem: 'publico' }));
  const agendamentos = [...internos, ...publicos.filter(p => !internos.some(i => Number(i.id) === Number(p.id)))];

  publicos.forEach(b => {
    if (b.cliente && !clientes.includes(b.cliente)) clientes.push(b.cliente);
    if (b.profissional && !profissionais.includes(b.profissional)) profissionais.push(b.profissional);
    if (b.servico && !servicos.some(s => s.nome === b.servico)) servicos.push({ nome: b.servico, duracao: Number(b.duracao) || 30 });
  });

  const persistInternal = () => {
    const outros = safeParse(localStorage.getItem(INTERNAL_KEY), []).filter(item => item.companySlug && item.companySlug !== companySlug);
    const atuais = agendamentos.filter(a => a.origem !== 'publico').map(a => ({ ...a, companySlug, origem: 'interno' }));
    localStorage.setItem(INTERNAL_KEY, JSON.stringify([...outros, ...atuais]));
  };

  const persistPublic = () => {
    const outros = getPublicBookings().filter(item => item.companySlug !== companySlug);
    const atuais = agendamentos.filter(a => a.origem === 'publico').map(a => ({ ...a, companySlug, origem: 'publico' }));
    localStorage.setItem(PUBLIC_KEY, JSON.stringify([...outros, ...atuais]));
  };

  const view = document.getElementById('agendaView');
  const empty = document.getElementById('agendaEmpty');
  const busca = document.getElementById('agendaBusca');
  const filtroStatus = document.getElementById('agendaFiltroStatus');
  const filtroProfissional = document.getElementById('agendaFiltroProfissional');
  const tabs = Array.from(document.querySelectorAll('.agenda-tab'));
  const form = document.getElementById('agendamentoForm');
  const modalEl = document.getElementById('agendamentoModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const conflictAlert = document.getElementById('agendaConflictAlert');
  const idField = document.getElementById('agendamentoId');
  const clienteField = document.getElementById('agendamentoCliente');
  const servicoField = document.getElementById('agendamentoServico');
  const profissionalField = document.getElementById('agendamentoProfissional');
  const dataField = document.getElementById('agendamentoData');
  const horaField = document.getElementById('agendamentoHora');
  const statusField = document.getElementById('agendamentoStatus');
  const obsField = document.getElementById('agendamentoObservacoes');
  const modalTitle = document.getElementById('agendamentoModalLabel');
  let currentView = 'dia';

  const normalizar = v => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const formatDate = value => new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(new Date(`${value}T12:00:00`));
  const toMinutes = h => { const [hh, mm] = String(h || '00:00').split(':').map(Number); return hh * 60 + mm; };

  function preencherSelects() {
    clienteField.innerHTML = '<option value="">Selecione</option>' + clientes.map(v => `<option>${v}</option>`).join('');
    servicoField.innerHTML = '<option value="">Selecione</option>' + servicos.map(v => `<option>${v.nome}</option>`).join('');
    profissionalField.innerHTML = '<option value="">Selecione</option>' + profissionais.map(v => `<option>${v}</option>`).join('');
    filtroProfissional.innerHTML = '<option value="todos">Todos os profissionais</option>' + profissionais.map(v => `<option>${v}</option>`).join('');
  }

  function dadosFiltrados() {
    const termo = normalizar(busca.value);
    return agendamentos.filter(a => {
      const texto = normalizar([a.cliente, a.servico, a.profissional, a.observacoes].join(' '));
      return (!termo || texto.includes(termo)) && (filtroStatus.value === 'todos' || a.status === filtroStatus.value) && (filtroProfissional.value === 'todos' || a.profissional === filtroProfissional.value);
    }).sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));
  }

  function atualizarResumo() {
    const hojeIso = iso(new Date());
    const items = agendamentos.filter(a => a.data === hojeIso && a.status !== 'cancelado');
    document.getElementById('agendaHoje').textContent = items.length;
    document.getElementById('agendaConfirmados').textContent = items.filter(a => a.status === 'confirmado').length;
    document.getElementById('agendaConcluidos').textContent = items.filter(a => a.status === 'concluido').length;
  }

  function card(a) {
    const origem = a.origem === 'publico' ? '<span class="status-badge status-pendente">Online</span>' : '';
    return `<article class="agendamento-card"><div class="hora">${a.hora}</div><div><small>Cliente</small><strong>${a.cliente}</strong></div><div><small>Serviço</small><strong>${a.servico}</strong></div><div><small>Profissional</small><strong>${a.profissional}</strong></div><div><span class="status-badge status-${a.status}">${a.status}</span>${origem}</div><div class="agendamento-actions"><button class="btn btn-outline-custom btn-sm" data-action="editar" data-id="${a.id}">Editar</button>${a.status !== 'concluido' && a.status !== 'cancelado' ? `<button class="btn btn-outline-success btn-sm" data-action="concluir" data-id="${a.id}">Concluir</button>` : ''}${a.status !== 'cancelado' ? `<button class="btn btn-outline-danger btn-sm" data-action="cancelar" data-id="${a.id}">Cancelar</button>` : ''}</div></article>`;
  }

  function renderDia(items) {
    const hojeIso = iso(new Date());
    const dia = items.filter(a => a.data === hojeIso);
    view.innerHTML = dia.length ? `<div class="agenda-day-group"><div class="agenda-day-title"><h3>Hoje · ${formatDate(hojeIso)}</h3><span>${dia.length} atendimento(s)</span></div>${dia.map(card).join('')}</div>` : '';
  }

  function renderSemana(items) {
    const dias = Array.from({ length: 7 }, (_, i) => addDays(i));
    view.innerHTML = `<div class="agenda-week-grid">${dias.map(d => { const list = items.filter(a => a.data === d); return `<section class="week-column"><h3>${formatDate(d)}</h3>${list.length ? list.map(a => `<div class="week-item"><strong>${a.hora} · ${a.cliente}</strong><small>${a.servico}</small><small>${a.profissional}</small>${a.origem === 'publico' ? '<small>Agendamento online</small>' : ''}</div>`).join('') : '<small>Sem agendamentos</small>'}</section>`; }).join('')}</div>`;
  }

  function renderLista(items) {
    view.innerHTML = items.length ? `<div class="agenda-list-wrap"><table class="agenda-list-table"><thead><tr><th>Data</th><th>Hora</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Status</th><th>Ações</th></tr></thead><tbody>${items.map(a => `<tr><td>${formatDate(a.data)}</td><td>${a.hora}</td><td>${a.cliente}${a.origem === 'publico' ? '<br><small>Online</small>' : ''}</td><td>${a.servico}</td><td>${a.profissional}</td><td><span class="status-badge status-${a.status}">${a.status}</span></td><td><div class="agendamento-actions"><button class="btn btn-outline-custom btn-sm" data-action="editar" data-id="${a.id}">Editar</button>${a.status !== 'concluido' && a.status !== 'cancelado' ? `<button class="btn btn-outline-success btn-sm" data-action="concluir" data-id="${a.id}">Concluir</button>` : ''}${a.status !== 'cancelado' ? `<button class="btn btn-outline-danger btn-sm" data-action="cancelar" data-id="${a.id}">Cancelar</button>` : ''}</div></td></tr>`).join('')}</tbody></table></div>` : '';
  }

  function render() {
    const items = dadosFiltrados();
    if (currentView === 'dia') renderDia(items);
    if (currentView === 'semana') renderSemana(items);
    if (currentView === 'lista') renderLista(items);
    empty.classList.toggle('d-none', view.textContent.trim().length > 0);
    atualizarResumo();
  }

  function limparForm() {
    form.reset();
    idField.value = '';
    dataField.value = iso(new Date());
    horaField.value = '09:00';
    statusField.value = 'confirmado';
    conflictAlert.classList.add('d-none');
    conflictAlert.textContent = '';
    modalTitle.textContent = 'Novo agendamento';
    form.classList.remove('was-validated');
  }

  function editar(id) {
    const a = agendamentos.find(x => Number(x.id) === id);
    if (!a) return;
    idField.value = a.id;
    if (!clientes.includes(a.cliente)) { clientes.push(a.cliente); preencherSelects(); }
    if (!servicos.some(s => s.nome === a.servico)) { servicos.push({ nome: a.servico, duracao: Number(a.duracao) || 30 }); preencherSelects(); }
    if (!profissionais.includes(a.profissional)) { profissionais.push(a.profissional); preencherSelects(); }
    clienteField.value = a.cliente;
    servicoField.value = a.servico;
    profissionalField.value = a.profissional;
    dataField.value = a.data;
    horaField.value = a.hora;
    statusField.value = a.status;
    obsField.value = a.observacoes || '';
    modalTitle.textContent = 'Editar agendamento';
    conflictAlert.classList.add('d-none');
    modal.show();
  }

  function temConflito(novo, ignoreId) {
    const servico = servicos.find(s => s.nome === novo.servico);
    const duracao = Number(servico?.duracao) || 30;
    const inicioNovo = toMinutes(novo.hora);
    const fimNovo = inicioNovo + duracao;
    return agendamentos.some(a => {
      if (Number(a.id) === Number(ignoreId) || a.status === 'cancelado' || a.data !== novo.data || a.profissional !== novo.profissional) return false;
      const existente = servicos.find(s => s.nome === a.servico);
      const inicio = toMinutes(a.hora);
      const fim = inicio + (Number(existente?.duracao) || Number(a.duracao) || 30);
      return inicioNovo < fim && fimNovo > inicio;
    });
  }

  const persistItemType = item => item?.origem === 'publico' ? persistPublic() : persistInternal();

  view.addEventListener('click', event => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const item = agendamentos.find(a => Number(a.id) === id);
    if (!item) return;
    if (btn.dataset.action === 'editar') editar(id);
    if (btn.dataset.action === 'concluir') { item.status = 'concluido'; persistItemType(item); render(); }
    if (btn.dataset.action === 'cancelar') { item.status = 'cancelado'; persistItemType(item); render(); }
  });

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.toggle('active', t === tab));
    currentView = tab.dataset.view;
    render();
  }));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const id = Number(idField.value);
    const dados = { cliente: clienteField.value, servico: servicoField.value, profissional: profissionalField.value, data: dataField.value, hora: horaField.value, status: statusField.value, observacoes: obsField.value.trim() };
    if (temConflito(dados, id || null)) {
      conflictAlert.textContent = 'Conflito de horário: este profissional já possui outro atendimento nesse intervalo.';
      conflictAlert.classList.remove('d-none');
      return;
    }

    if (id) {
      const index = agendamentos.findIndex(a => Number(a.id) === id);
      if (index >= 0) {
        const origem = agendamentos[index].origem || 'interno';
        agendamentos[index] = { ...agendamentos[index], ...dados, origem };
        persistItemType(agendamentos[index]);
      }
    } else {
      agendamentos.push({ id: Date.now(), companySlug, ...dados, origem: 'interno' });
      persistInternal();
    }

    modal.hide();
    limparForm();
    render();
  });

  modalEl.addEventListener('hidden.bs.modal', limparForm);
  busca.addEventListener('input', render);
  filtroStatus.addEventListener('change', render);
  filtroProfissional.addEventListener('change', render);

  preencherSelects();
  limparForm();
  render();
});
