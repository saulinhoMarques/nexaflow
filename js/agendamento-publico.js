document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || 'barbearia-imperial';
  const serviceFromUrl = params.get('servico') || sessionStorage.getItem('nexaflow-public-service') || '';
  const safeParse = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; } };
  const slugify = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const fallbackCompanies = {
    'barbearia-imperial': {
      nome: 'Barbearia Imperial', corPrincipal: '#2563eb', corSecundaria: '#7c3aed',
      servicos: [
        { nome: 'Corte masculino', preco: 35, duracao: 30 },
        { nome: 'Barba', preco: 25, duracao: 20 },
        { nome: 'Corte + Barba', preco: 55, duracao: 50 },
        { nome: 'Sobrancelha', preco: 15, duracao: 15 }
      ],
      profissionais: [
        { nome: 'Carlos Mendes', especialidade: 'Barbeiro', servicos: ['Corte masculino', 'Barba'], inicio: '08:00', fim: '18:00' },
        { nome: 'Rafael Alves', especialidade: 'Barbeiro', servicos: ['Corte masculino', 'Corte + Barba'], inicio: '08:00', fim: '17:00' },
        { nome: 'Marina Lima', especialidade: 'Cabeleireira', servicos: ['Sobrancelha'], inicio: '10:00', fim: '18:00' }
      ],
      horarios: [['Segunda','08:00','18:00',true],['Terça','08:00','18:00',true],['Quarta','08:00','18:00',true],['Quinta','08:00','18:00',true],['Sexta','08:00','18:00',true],['Sábado','08:00','14:00',true],['Domingo','08:00','18:00',false]]
    },
    'studio-ana': {
      nome: 'Studio Ana', corPrincipal: '#db2777', corSecundaria: '#9333ea',
      servicos: [{ nome:'Manicure',preco:32,duracao:45 },{ nome:'Pedicure',preco:38,duracao:50 },{ nome:'Escova',preco:55,duracao:60 }],
      profissionais: [
        { nome:'Ana Souza',especialidade:'Manicure',servicos:['Manicure','Pedicure'],inicio:'09:00',fim:'18:00' },
        { nome:'Marina Lima',especialidade:'Cabeleireira',servicos:['Escova'],inicio:'10:00',fim:'19:00' }
      ],
      horarios: [['Segunda','09:00','19:00',true],['Terça','09:00','19:00',true],['Quarta','09:00','19:00',true],['Quinta','09:00','19:00',true],['Sexta','09:00','19:00',true],['Sábado','09:00','17:00',true],['Domingo','09:00','17:00',false]]
    },
    'clinica-sorriso': {
      nome:'Clínica Sorriso', corPrincipal:'#0891b2', corSecundaria:'#2563eb',
      servicos:[{nome:'Avaliação',preco:80,duracao:40},{nome:'Limpeza',preco:160,duracao:60},{nome:'Clareamento',preco:650,duracao:90}],
      profissionais:[
        {nome:'Dra. Júlia Ramos',especialidade:'Dentista',servicos:['Avaliação','Limpeza'],inicio:'08:00',fim:'18:00'},
        {nome:'Dr. Pedro Alves',especialidade:'Dentista',servicos:['Avaliação','Clareamento'],inicio:'09:00',fim:'18:00'}
      ],
      horarios:[['Segunda','08:00','18:00',true],['Terça','08:00','18:00',true],['Quarta','08:00','18:00',true],['Quinta','08:00','18:00',true],['Sexta','08:00','18:00',true],['Sábado','08:00','12:00',true],['Domingo','08:00','12:00',false]]
    }
  };

  const cache = safeParse(localStorage.getItem('nexaflow-public-company-cache'), {});
  let empresa = structuredClone(cache[slug] || fallbackCompanies[slug] || fallbackCompanies['barbearia-imperial']);
  const storedCompany = safeParse(sessionStorage.getItem('nexaflow-public-company'), null);
  if (storedCompany?.slug === slug && storedCompany.empresa) empresa = structuredClone(storedCompany.empresa);

  empresa.servicos = Array.isArray(empresa.servicos) ? empresa.servicos : [];
  empresa.profissionais = Array.isArray(empresa.profissionais) ? empresa.profissionais : [];
  empresa.horarios = Array.isArray(empresa.horarios) ? empresa.horarios : [];

  const activeConfig = safeParse(localStorage.getItem('nexaflow-config'), {});
  const activeSlug = activeConfig?.empresa?.slug || slugify(activeConfig?.empresa?.nome);
  if (activeSlug && activeSlug === slug) {
    const localServices = safeParse(localStorage.getItem('nexaflow-servicos'), null);
    const localProfessionals = safeParse(localStorage.getItem('nexaflow-profissionais'), null);
    if (Array.isArray(localServices)) {
      empresa.servicos = localServices.filter(item => item.ativo !== false).map(item => ({
        nome: item.nome,
        preco: Number(item.preco) || 0,
        duracao: Number(item.duracao) || 30,
        descricao: item.descricao || ''
      }));
    }
    if (Array.isArray(localProfessionals)) {
      empresa.profissionais = localProfessionals.filter(item => item.ativo !== false).map(item => ({
        nome: item.nome,
        especialidade: item.especialidade || 'Profissional',
        servicos: Array.isArray(item.servicos) ? item.servicos : [],
        inicio: item.inicio || '',
        fim: item.fim || ''
      }));
    }
  }

  const state = { step: 0, servico: null, profissional: null, data: null, hora: null };
  const steps = [...document.querySelectorAll('.booking-step')];
  const progressLabels = [...document.querySelectorAll('.booking-progress-labels span')];
  const progressFill = document.getElementById('bookingProgressFill');
  const prevBtn = document.getElementById('bookingPrev');
  const nextBtn = document.getElementById('bookingNext');
  const actions = document.getElementById('bookingActions');
  const alertBox = document.getElementById('bookingAlert');
  const serviceOptions = document.getElementById('serviceOptions');
  const professionalOptions = document.getElementById('professionalOptions');
  const dateOptions = document.getElementById('dateOptions');
  const timeOptions = document.getElementById('timeOptions');
  const timeEmpty = document.getElementById('timeEmpty');
  const customerName = document.getElementById('customerName');
  const customerPhone = document.getElementById('customerPhone');
  const customerEmail = document.getElementById('customerEmail');
  const customerNotes = document.getElementById('customerNotes');

  const moeda = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
  const initials = name => String(name || 'NF').split(' ').filter(Boolean).slice(0, 2).map(v => v[0]).join('').toUpperCase();
  const iso = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
  const dayNames = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const toMinutes = h => { const [hh, mm] = String(h || '00:00').split(':').map(Number); return hh * 60 + mm; };
  const fromMinutes = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  document.documentElement.style.setProperty('--brand-primary', empresa.corPrincipal || '#2563eb');
  document.documentElement.style.setProperty('--brand-secondary', empresa.corSecundaria || '#7c3aed');
  document.getElementById('brandLogo').textContent = initials(empresa.nome);
  document.getElementById('brandName').textContent = empresa.nome;
  document.getElementById('bookingTitle').textContent = `Agende na ${empresa.nome}`;
  document.title = `Agendar — ${empresa.nome}`;
  document.getElementById('backToBusiness').href = `empresa.html?slug=${encodeURIComponent(slug)}`;
  document.getElementById('successBack').href = `empresa.html?slug=${encodeURIComponent(slug)}`;

  const getPublicBookings = () => safeParse(localStorage.getItem('nexaflow-public-bookings'), []);
  const getInternalBookings = () => safeParse(localStorage.getItem('nexaflow-agendamentos'), []);
  const setPublicBookings = items => localStorage.setItem('nexaflow-public-bookings', JSON.stringify(items));

  function updateStep() {
    steps.forEach((el, i) => el.classList.toggle('active', i === state.step));
    progressLabels.forEach((el, i) => el.classList.toggle('active', i <= Math.min(state.step, 5)));
    progressFill.style.width = `${Math.min(((state.step + 1) / 6) * 100, 100)}%`;
    prevBtn.disabled = state.step === 0;
    nextBtn.textContent = state.step === 5 ? 'Confirmar agendamento' : 'Continuar';
    actions.style.display = state.step === 6 ? 'none' : 'flex';
    alertBox.classList.add('d-none');
    if (state.step === 1) renderProfessionals();
    if (state.step === 2) renderDates();
    if (state.step === 3) renderTimes();
    if (state.step === 5) renderSummary();
  }

  function renderServices() {
    serviceOptions.innerHTML = empresa.servicos.length ? empresa.servicos.map(s => `
      <button class="option-card ${state.servico?.nome === s.nome ? 'selected' : ''}" type="button" data-service="${s.nome}">
        <h3>${s.nome}</h3>
        <p>${s.descricao || 'Atendimento disponível para agendamento online.'}</p>
        <div class="option-meta"><span>${s.duracao || 30} min</span><span>${moeda(s.preco)}</span></div>
      </button>
    `).join('') : '<div class="booking-empty">Nenhum serviço disponível.</div>';
  }

  function renderProfessionals() {
    const available = empresa.profissionais.filter(p => !state.servico || (p.servicos || []).includes(state.servico.nome));
    if (state.profissional && !available.some(p => p.nome === state.profissional.nome)) state.profissional = null;
    professionalOptions.innerHTML = available.length ? available.map(p => `
      <button class="option-card ${state.profissional?.nome === p.nome ? 'selected' : ''}" type="button" data-professional="${p.nome}">
        <h3>${p.nome}</h3>
        <p>${p.especialidade || 'Profissional'}</p>
        <div class="option-meta"><span>${(p.servicos || []).join(' · ')}</span><span>${p.inicio && p.fim ? `${p.inicio}–${p.fim}` : 'Disponível'}</span></div>
      </button>
    `).join('') : '<div class="booking-empty">Nenhum profissional disponível para este serviço.</div>';
  }

  function getOpenDates() {
    const result = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let i = 0; i < 30 && result.length < 12; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = dayNames[d.getDay()];
      const schedule = empresa.horarios.find(h => h[0] === dayName);
      if (schedule?.[3]) result.push({ value: iso(d), date: d, schedule });
    }
    return result;
  }

  function renderDates() {
    const dates = getOpenDates();
    dateOptions.innerHTML = dates.length ? dates.map(item => `
      <button class="date-option ${state.data === item.value ? 'selected' : ''}" type="button" data-date="${item.value}">
        <small>${new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(item.date)}</small>
        ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(item.date)}
      </button>
    `).join('') : '<div class="booking-empty">A empresa não possui dias abertos configurados.</div>';
  }

  function allBookings() {
    const publicos = getPublicBookings().filter(b => b.companySlug === slug);
    const internos = getInternalBookings().filter(b => b.companySlug === slug || (!b.companySlug && activeSlug === slug));
    return [...internos, ...publicos.filter(p => !internos.some(i => Number(i.id) === Number(p.id)))];
  }

  function hasConflict(time) {
    if (!time || !state.data || !state.profissional) return false;
    const duration = Number(state.servico?.duracao) || 30;
    const start = toMinutes(time);
    const end = start + duration;
    return allBookings().some(b => {
      if (b.status === 'cancelado' || b.data !== state.data || b.profissional !== state.profissional.nome) return false;
      const otherService = empresa.servicos.find(s => s.nome === b.servico);
      const otherStart = toMinutes(b.hora);
      const otherEnd = otherStart + (Number(otherService?.duracao) || Number(b.duracao) || 30);
      return start < otherEnd && end > otherStart;
    });
  }

  function renderTimes() {
    const item = getOpenDates().find(d => d.value === state.data);
    if (!item || !state.servico || !state.profissional) {
      timeOptions.innerHTML = '';
      timeEmpty.classList.remove('d-none');
      return;
    }

    const [, open, close] = item.schedule;
    const businessStart = toMinutes(open);
    const businessEnd = toMinutes(close);
    const professionalStart = state.profissional.inicio ? toMinutes(state.profissional.inicio) : businessStart;
    const professionalEnd = state.profissional.fim ? toMinutes(state.profissional.fim) : businessEnd;
    const start = Math.max(businessStart, professionalStart);
    const end = Math.min(businessEnd, professionalEnd);
    const duration = Number(state.servico.duracao) || 30;
    const now = new Date();
    const todayIso = iso(now);
    const minToday = now.getHours() * 60 + now.getMinutes();
    const times = [];

    for (let m = start; m + duration <= end; m += 30) {
      if (state.data === todayIso && m <= minToday) continue;
      const time = fromMinutes(m);
      if (!hasConflict(time)) times.push(time);
    }

    if (state.hora && !times.includes(state.hora)) state.hora = null;
    timeOptions.innerHTML = times.map(t => `<button class="time-option ${state.hora === t ? 'selected' : ''}" type="button" data-time="${t}">${t}</button>`).join('');
    timeEmpty.classList.toggle('d-none', times.length > 0);
  }

  function renderSummary() {
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date(`${state.data}T12:00:00`));
    document.getElementById('bookingSummary').innerHTML = [
      ['Empresa', empresa.nome],
      ['Serviço', `${state.servico.nome} · ${moeda(state.servico.preco)}`],
      ['Profissional', state.profissional.nome],
      ['Data', formattedDate],
      ['Horário', state.hora],
      ['Cliente', customerName.value.trim()],
      ['WhatsApp', customerPhone.value.trim()]
    ].map(([label, value]) => `<div class="summary-row"><span>${label}</span><strong>${value}</strong></div>`).join('');
  }

  function validateStep() {
    if (state.step === 0 && !state.servico) return 'Escolha um serviço para continuar.';
    if (state.step === 1 && !state.profissional) return 'Escolha um profissional para continuar.';
    if (state.step === 2 && !state.data) return 'Escolha uma data para continuar.';
    if (state.step === 3 && !state.hora) return 'Escolha um horário para continuar.';
    if (state.step === 4) {
      if (!customerName.value.trim() || !customerPhone.value.trim()) return 'Informe seu nome e WhatsApp para continuar.';
      if (customerEmail.value && !customerEmail.checkValidity()) return 'Informe um e-mail válido ou deixe o campo vazio.';
    }
    return '';
  }

  function confirmBooking() {
    if (hasConflict(state.hora)) {
      alertBox.textContent = 'Este horário acabou de ficar indisponível. Volte e escolha outro horário.';
      alertBox.classList.remove('d-none');
      return;
    }

    const booking = {
      id: Date.now(),
      companySlug: slug,
      companyName: empresa.nome,
      cliente: customerName.value.trim(),
      telefone: customerPhone.value.trim(),
      email: customerEmail.value.trim(),
      servico: state.servico.nome,
      duracao: Number(state.servico.duracao) || 30,
      profissional: state.profissional.nome,
      data: state.data,
      hora: state.hora,
      status: 'pendente',
      observacoes: customerNotes.value.trim(),
      origem: 'publico',
      createdAt: new Date().toISOString()
    };

    const bookings = getPublicBookings();
    bookings.push(booking);
    setPublicBookings(bookings);
    state.step = 6;

    const formattedDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${booking.data}T12:00:00`));
    document.getElementById('successSummary').innerHTML = [
      ['Serviço', booking.servico],
      ['Profissional', booking.profissional],
      ['Data', formattedDate],
      ['Horário', booking.hora],
      ['Status', 'Pendente de confirmação']
    ].map(([label, value]) => `<div class="summary-row"><span>${label}</span><strong>${value}</strong></div>`).join('');

    sessionStorage.removeItem('nexaflow-public-service');
    updateStep();
  }

  serviceOptions.addEventListener('click', event => {
    const btn = event.target.closest('[data-service]');
    if (!btn) return;
    state.servico = empresa.servicos.find(s => s.nome === btn.dataset.service) || null;
    state.profissional = null;
    state.data = null;
    state.hora = null;
    renderServices();
  });

  professionalOptions.addEventListener('click', event => {
    const btn = event.target.closest('[data-professional]');
    if (!btn) return;
    state.profissional = empresa.profissionais.find(p => p.nome === btn.dataset.professional) || null;
    state.data = null;
    state.hora = null;
    renderProfessionals();
  });

  dateOptions.addEventListener('click', event => {
    const btn = event.target.closest('[data-date]');
    if (!btn) return;
    state.data = btn.dataset.date;
    state.hora = null;
    renderDates();
  });

  timeOptions.addEventListener('click', event => {
    const btn = event.target.closest('[data-time]');
    if (!btn) return;
    state.hora = btn.dataset.time;
    renderTimes();
  });

  prevBtn.addEventListener('click', () => {
    if (state.step > 0) {
      state.step -= 1;
      updateStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    const error = validateStep();
    if (error) { window.alert(error); return; }
    if (state.step === 5) { confirmBooking(); return; }
    state.step += 1;
    updateStep();
  });

  renderServices();
  if (serviceFromUrl) state.servico = empresa.servicos.find(s => s.nome === serviceFromUrl) || null;
  if (state.servico) renderServices();
  updateStep();
});
