document.addEventListener('DOMContentLoaded', () => {
  const tabs = [...document.querySelectorAll('.config-tab')];
  const panels = [...document.querySelectorAll('.config-panel')];
  const toast = document.getElementById('configToast');
  const saveBtn = document.getElementById('salvarTudoBtn');
  const resetBtn = document.getElementById('resetMockBtn');
  const corPrincipal = document.getElementById('corPrincipal');
  const corSecundaria = document.getElementById('corSecundaria');
  const preview = document.getElementById('brandPreview');
  const nomeEmpresa = document.getElementById('empresaNome');
  const logoPreview = document.getElementById('logoPreview');
  const trocarLogoBtn = document.getElementById('trocarLogoBtn');
  const schedule = document.getElementById('scheduleSettings');
  const safeParse = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; } };
  const slugify = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const dias = [
    ['Segunda', '08:00', '18:00', true],
    ['Terça', '08:00', '18:00', true],
    ['Quarta', '08:00', '18:00', true],
    ['Quinta', '08:00', '18:00', true],
    ['Sexta', '08:00', '18:00', true],
    ['Sábado', '08:00', '14:00', true],
    ['Domingo', '08:00', '18:00', false]
  ];

  function renderSchedule() {
    schedule.innerHTML = dias.map((d, i) => `
      <div class="schedule-setting-row">
        <strong>${d[0]}</strong>
        <input type="time" value="${d[1]}" ${d[3] ? '' : 'disabled'} data-day="${i}" data-field="inicio">
        <input type="time" value="${d[2]}" ${d[3] ? '' : 'disabled'} data-day="${i}" data-field="fim">
        <input class="form-check-input" type="checkbox" ${d[3] ? 'checked' : ''} data-day="${i}" data-field="aberto" aria-label="${d[0]} aberto">
      </div>
    `).join('');
  }

  function showToast(message = 'Alterações salvas.') {
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function updatePreview() {
    preview.style.background = `linear-gradient(135deg, ${corPrincipal.value}, ${corSecundaria.value})`;
    const strong = preview.querySelector('strong');
    if (strong) strong.textContent = nomeEmpresa.value || 'Seu negócio';
    const initials = (nomeEmpresa.value || 'NexaFlow').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    if (logoPreview) logoPreview.textContent = initials;
  }

  function activateTab(tabName) {
    const selected = tabs.find(tab => tab.dataset.tab === tabName) || tabs[0];
    if (!selected) return;
    tabs.forEach(tab => tab.classList.toggle('active', tab === selected));
    panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === selected.dataset.tab));
    const url = new URL(window.location.href);
    if (selected.dataset.tab === 'negocio') url.searchParams.delete('tab');
    else url.searchParams.set('tab', selected.dataset.tab);
    window.history.replaceState({}, '', url);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));

  schedule.addEventListener('change', event => {
    const target = event.target;
    const index = Number(target.dataset.day);
    if (Number.isNaN(index) || !dias[index]) return;
    if (target.dataset.field === 'aberto') {
      dias[index][3] = target.checked;
      target.closest('.schedule-setting-row')?.querySelectorAll('input[type=time]').forEach(input => { input.disabled = !target.checked; });
    } else if (target.dataset.field === 'inicio') dias[index][1] = target.value;
    else if (target.dataset.field === 'fim') dias[index][2] = target.value;
  });

  [corPrincipal, corSecundaria, nomeEmpresa].forEach(element => element.addEventListener('input', updatePreview));
  trocarLogoBtn.addEventListener('click', () => { updatePreview(); showToast('Prévia da logo atualizada.'); });

  saveBtn.addEventListener('click', () => {
    const previous = safeParse(localStorage.getItem('nexaflow-config'), {});
    const stableSlug = previous?.empresa?.slug || slugify(previous?.empresa?.nome) || slugify(nomeEmpresa.value) || 'empresa';

    const data = {
      empresa: {
        slug: stableSlug,
        nome: nomeEmpresa.value.trim(),
        segmento: document.getElementById('empresaSegmento').value.trim(),
        telefone: document.getElementById('empresaTelefone').value.trim(),
        whatsapp: document.getElementById('empresaWhatsapp').value.trim(),
        email: document.getElementById('empresaEmail').value.trim(),
        instagram: document.getElementById('empresaInstagram').value.trim(),
        descricao: document.getElementById('empresaDescricao').value.trim(),
        cep: document.getElementById('empresaCep').value.trim(),
        endereco: document.getElementById('empresaEndereco').value.trim(),
        numero: document.getElementById('empresaNumero').value.trim(),
        cidade: document.getElementById('empresaCidade').value.trim(),
        estado: document.getElementById('empresaEstado').value.trim().toUpperCase()
      },
      aparencia: { corPrincipal: corPrincipal.value, corSecundaria: corSecundaria.value },
      notificacoes: {
        novo: document.getElementById('notifNovo').checked,
        cancelamento: document.getElementById('notifCancelamento').checked,
        lembretes: document.getElementById('notifLembretes').checked,
        resumo: document.getElementById('notifResumo').checked
      },
      conta: {
        nome: document.getElementById('contaNome').value.trim(),
        email: document.getElementById('contaEmail').value.trim()
      },
      horarios: dias.map(item => [...item])
    };

    localStorage.setItem('nexaflow-config', JSON.stringify(data));

    const cache = safeParse(localStorage.getItem('nexaflow-public-company-cache'), {});
    const servicos = safeParse(localStorage.getItem('nexaflow-servicos'), []).filter(item => item.ativo !== false);
    const profissionais = safeParse(localStorage.getItem('nexaflow-profissionais'), []).filter(item => item.ativo !== false);
    cache[stableSlug] = {
      ...(cache[stableSlug] || {}),
      ...data.empresa,
      corPrincipal: data.aparencia.corPrincipal,
      corSecundaria: data.aparencia.corSecundaria,
      horarios: data.horarios,
      servicos: servicos.length ? servicos : cache[stableSlug]?.servicos,
      profissionais: profissionais.length ? profissionais : cache[stableSlug]?.profissionais
    };
    localStorage.setItem('nexaflow-public-company-cache', JSON.stringify(cache));
    sessionStorage.removeItem('nexaflow-public-company');
    showToast();
  });

  resetBtn.addEventListener('click', () => {
    if (!window.confirm('Restaurar as configurações de demonstração?')) return;
    const current = safeParse(localStorage.getItem('nexaflow-config'), {});
    const currentSlug = current?.empresa?.slug || slugify(current?.empresa?.nome);
    const cache = safeParse(localStorage.getItem('nexaflow-public-company-cache'), {});
    if (currentSlug && cache[currentSlug]) {
      delete cache[currentSlug];
      localStorage.setItem('nexaflow-public-company-cache', JSON.stringify(cache));
    }
    sessionStorage.removeItem('nexaflow-public-company');
    localStorage.removeItem('nexaflow-config');
    window.location.reload();
  });

  const saved = safeParse(localStorage.getItem('nexaflow-config'), null);
  if (saved) {
    if (saved.empresa) {
      Object.entries({ empresaNome: 'nome', empresaSegmento: 'segmento', empresaTelefone: 'telefone', empresaWhatsapp: 'whatsapp', empresaEmail: 'email', empresaInstagram: 'instagram', empresaDescricao: 'descricao', empresaCep: 'cep', empresaEndereco: 'endereco', empresaNumero: 'numero', empresaCidade: 'cidade', empresaEstado: 'estado' })
        .forEach(([id, key]) => { if (saved.empresa[key] != null) document.getElementById(id).value = saved.empresa[key]; });
    }
    if (saved.aparencia) {
      if (saved.aparencia.corPrincipal) corPrincipal.value = saved.aparencia.corPrincipal;
      if (saved.aparencia.corSecundaria) corSecundaria.value = saved.aparencia.corSecundaria;
    }
    if (saved.notificacoes) {
      document.getElementById('notifNovo').checked = !!saved.notificacoes.novo;
      document.getElementById('notifCancelamento').checked = !!saved.notificacoes.cancelamento;
      document.getElementById('notifLembretes').checked = !!saved.notificacoes.lembretes;
      document.getElementById('notifResumo').checked = !!saved.notificacoes.resumo;
    }
    if (saved.conta) {
      document.getElementById('contaNome').value = saved.conta.nome || '';
      document.getElementById('contaEmail').value = saved.conta.email || '';
    }
    if (Array.isArray(saved.horarios)) saved.horarios.forEach((item, index) => { if (dias[index]) dias[index] = [...item]; });
  }

  renderSchedule();
  updatePreview();
  activateTab(new URLSearchParams(window.location.search).get('tab') || 'negocio');
});
