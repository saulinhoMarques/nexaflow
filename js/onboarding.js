document.addEventListener('DOMContentLoaded', () => {
  const steps = Array.from(document.querySelectorAll('.onboarding-step'));
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const prevBtn = document.querySelector('.btn-prev');
  const nextBtn = document.querySelector('.btn-next');
  const stepPills = Array.from(document.querySelectorAll('.step-pill'));
  const alertBox = document.getElementById('onboardingAlert');
  let currentStep = 0;

  const fields = {
    nome: document.getElementById('company-name'),
    segmento: document.getElementById('industry'),
    telefone: document.getElementById('phone'),
    whatsapp: document.getElementById('whatsapp'),
    cep: document.getElementById('zipcode'),
    cidade: document.getElementById('city'),
    endereco: document.getElementById('address'),
    estado: document.getElementById('state'),
    numero: document.getElementById('number')
  };

  const safeParse = (value, fallback) => {
    try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; }
  };

  const showError = message => {
    if (!alertBox) { window.alert(message); return; }
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
  };

  const clearError = () => alertBox?.classList.add('d-none');

  const validateCurrentStep = () => {
    clearError();
    if (currentStep === 0) {
      if (!fields.nome.value.trim()) { showError('Informe o nome da empresa para continuar.'); fields.nome.focus(); return false; }
      if (!fields.segmento.value) { showError('Selecione o segmento da empresa.'); fields.segmento.focus(); return false; }
    }
    if (currentStep === 1) {
      if (!fields.cidade.value.trim() || !fields.endereco.value.trim() || !fields.estado.value.trim()) {
        showError('Preencha cidade, endereço e estado para continuar.');
        return false;
      }
    }
    return true;
  };

  const collectSchedule = () => Array.from(document.querySelectorAll('.schedule-row')).map(row => {
    const dia = row.querySelector('span')?.textContent.trim() || '';
    const times = Array.from(row.querySelectorAll('input[type="time"]')).map(input => input.value);
    const select = row.querySelector('select');
    if (select) {
      const aberto = select.value !== 'Fechado';
      const match = select.value.match(/(\d{2}:\d{2}).*?(\d{2}:\d{2})/);
      return [dia, match?.[1] || '08:00', match?.[2] || '18:00', aberto];
    }
    return [dia, times[0] || '08:00', times[1] || '18:00', true];
  });

  const saveOnboarding = () => {
    const previous = safeParse(localStorage.getItem('nexaflow-config'), {});
    const contaNome = sessionStorage.getItem('nexaflow-signup-name') || previous?.conta?.nome || 'Administrador';
    const contaEmail = sessionStorage.getItem('nexaflow-signup-email') || previous?.conta?.email || '';

    const data = {
      ...previous,
      empresa: {
        ...(previous.empresa || {}),
        nome: fields.nome.value.trim(),
        segmento: fields.segmento.value,
        telefone: fields.telefone.value.trim(),
        whatsapp: fields.whatsapp.value.trim(),
        cep: fields.cep.value.trim(),
        cidade: fields.cidade.value.trim(),
        endereco: fields.endereco.value.trim(),
        estado: fields.estado.value.trim().toUpperCase(),
        numero: fields.numero.value.trim()
      },
      aparencia: previous.aparencia || { corPrincipal: '#2563eb', corSecundaria: '#7c3aed' },
      notificacoes: previous.notificacoes || { novo: true, cancelamento: true, lembretes: true, resumo: false },
      conta: { ...(previous.conta || {}), nome: contaNome, email: contaEmail },
      horarios: collectSchedule()
    };

    localStorage.setItem('nexaflow-config', JSON.stringify(data));
  };

  const updateStepState = () => {
    steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
    stepPills.forEach((pill, index) => {
      pill.classList.toggle('active', index === currentStep);
      pill.classList.toggle('completed', index < currentStep);
    });
    const percent = ((currentStep + 1) / steps.length) * 100;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `Etapa ${currentStep + 1} de ${steps.length}`;
    if (prevBtn) prevBtn.disabled = currentStep === 0;
    if (nextBtn) nextBtn.textContent = currentStep === steps.length - 1 ? 'Ir para o Dashboard' : 'Continuar';
    clearError();
  };

  prevBtn?.addEventListener('click', () => {
    if (currentStep === 0) return;
    currentStep -= 1;
    updateStepState();
  });

  nextBtn?.addEventListener('click', () => {
    if (currentStep === steps.length - 1) {
      saveOnboarding();
      window.location.href = 'dashboard.html';
      return;
    }
    if (!validateCurrentStep()) return;
    currentStep += 1;
    updateStepState();
  });

  updateStepState();
});
