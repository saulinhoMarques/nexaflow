document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const requestedSlug = params.get('slug');
  const safeParse = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch (_) { return fallback; } };
  const criarSlug = valor => String(valor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const empresas = {
    'barbearia-imperial': {
      nome: 'Barbearia Imperial', segmento: 'Barbearia', headline: 'Seu estilo começa aqui.', descricao: 'Corte, barba e estilo com atendimento profissional.',
      telefone: '(11) 4000-1234', whatsapp: '(11) 99999-1234', email: 'contato@barbeariaimperial.com.br', instagram: '@barbeariaimperial', endereco: 'Praça da Sé', numero: '100', cidade: 'São Paulo', estado: 'SP', corPrincipal: '#2563eb', corSecundaria: '#7c3aed',
      servicos: [
        { nome: 'Corte masculino', preco: 35, duracao: 30, descricao: 'Corte personalizado de acordo com seu estilo.' },
        { nome: 'Barba', preco: 25, duracao: 20, descricao: 'Modelagem, acabamento e cuidado completo com a barba.' },
        { nome: 'Corte + Barba', preco: 55, duracao: 50, descricao: 'Combo completo para renovar o visual.' },
        { nome: 'Sobrancelha', preco: 15, duracao: 15, descricao: 'Design e acabamento de sobrancelha.' }
      ],
      profissionais: [
        { nome: 'Carlos Mendes', especialidade: 'Barbeiro', servicos: ['Corte masculino', 'Barba'] },
        { nome: 'Rafael Alves', especialidade: 'Barbeiro', servicos: ['Corte masculino', 'Corte + Barba'] },
        { nome: 'Marina Lima', especialidade: 'Cabeleireira', servicos: ['Sobrancelha'] }
      ],
      horarios: [['Segunda','08:00','18:00',true],['Terça','08:00','18:00',true],['Quarta','08:00','18:00',true],['Quinta','08:00','18:00',true],['Sexta','08:00','18:00',true],['Sábado','08:00','14:00',true],['Domingo','08:00','18:00',false]]
    },
    'studio-ana': {
      nome: 'Studio Ana', segmento: 'Beleza', headline: 'Seu momento de cuidado começa aqui.', descricao: 'Beleza, unhas e autocuidado em um espaço feito para você.', telefone: '(11) 3555-1010', whatsapp: '(11) 98888-2020', email: 'oi@studioana.com.br', instagram: '@studioana', endereco: 'Rua das Flores', numero: '82', cidade: 'Jundiaí', estado: 'SP', corPrincipal: '#db2777', corSecundaria: '#9333ea',
      servicos: [{ nome:'Manicure',preco:32,duracao:45,descricao:'Cuidado completo para unhas das mãos.' },{ nome:'Pedicure',preco:38,duracao:50,descricao:'Cuidado e acabamento para os pés.' },{ nome:'Escova',preco:55,duracao:60,descricao:'Finalização profissional para diferentes tipos de cabelo.' }],
      profissionais: [{ nome:'Ana Souza',especialidade:'Manicure',servicos:['Manicure','Pedicure'] },{ nome:'Marina Lima',especialidade:'Cabeleireira',servicos:['Escova'] }],
      horarios: [['Segunda','09:00','19:00',true],['Terça','09:00','19:00',true],['Quarta','09:00','19:00',true],['Quinta','09:00','19:00',true],['Sexta','09:00','19:00',true],['Sábado','09:00','17:00',true],['Domingo','09:00','17:00',false]]
    },
    'clinica-sorriso': {
      nome: 'Clínica Sorriso', segmento: 'Saúde', headline: 'Cuidar do seu sorriso pode ser simples.', descricao: 'Atendimento odontológico humanizado, organizado e próximo de você.', telefone: '(11) 3222-4500', whatsapp: '(11) 97777-4500', email: 'contato@clinicasorriso.com.br', instagram: '@clinicasorriso', endereco: 'Avenida Central', numero: '450', cidade: 'Campinas', estado: 'SP', corPrincipal: '#0891b2', corSecundaria: '#2563eb',
      servicos: [{ nome:'Avaliação',preco:80,duracao:40,descricao:'Consulta inicial e avaliação completa.' },{ nome:'Limpeza',preco:160,duracao:60,descricao:'Profilaxia profissional para prevenção e cuidado.' },{ nome:'Clareamento',preco:650,duracao:90,descricao:'Tratamento para realçar a aparência do sorriso.' }],
      profissionais: [{ nome:'Dra. Júlia Ramos',especialidade:'Dentista',servicos:['Avaliação','Limpeza']},{nome:'Dr. Pedro Alves',especialidade:'Dentista',servicos:['Avaliação','Clareamento']}],
      horarios: [['Segunda','08:00','18:00',true],['Terça','08:00','18:00',true],['Quarta','08:00','18:00',true],['Quinta','08:00','18:00',true],['Sexta','08:00','18:00',true],['Sábado','08:00','12:00',true],['Domingo','08:00','12:00',false]]
    }
  };

  const cache = safeParse(localStorage.getItem('nexaflow-public-company-cache'), {});
  const config = safeParse(localStorage.getItem('nexaflow-config'), null);
  let slug = requestedSlug || (config?.empresa?.nome ? criarSlug(config.empresa.nome) : 'barbearia-imperial');
  let empresa = structuredClone(empresas[slug] || cache[slug] || empresas['barbearia-imperial']);

  if (!requestedSlug && config) {
    empresa = {
      ...empresa,
      ...(config.empresa || {}),
      corPrincipal: config.aparencia?.corPrincipal || empresa.corPrincipal,
      corSecundaria: config.aparencia?.corSecundaria || empresa.corSecundaria,
      horarios: Array.isArray(config.horarios) ? config.horarios : empresa.horarios
    };
    const servicosLocal = safeParse(localStorage.getItem('nexaflow-servicos'), []).filter(item => item.ativo !== false);
    const profissionaisLocal = safeParse(localStorage.getItem('nexaflow-profissionais'), []).filter(item => item.ativo !== false);
    if (servicosLocal.length) empresa.servicos = servicosLocal.map(item => ({ nome: item.nome, preco: Number(item.preco) || 0, duracao: Number(item.duracao) || 30, descricao: item.descricao || '' }));
    if (profissionaisLocal.length) empresa.profissionais = profissionaisLocal.map(item => ({ nome: item.nome, especialidade: item.especialidade || 'Profissional', servicos: item.servicos || [] }));
  } else if (cache[slug]) {
    empresa = { ...empresa, ...cache[slug] };
  }

  slug = criarSlug(slug) || criarSlug(empresa.nome) || 'empresa';
  empresa.servicos = Array.isArray(empresa.servicos) ? empresa.servicos : [];
  empresa.profissionais = Array.isArray(empresa.profissionais) ? empresa.profissionais : [];
  empresa.horarios = Array.isArray(empresa.horarios) ? empresa.horarios : [];

  cache[slug] = empresa;
  localStorage.setItem('nexaflow-public-company-cache', JSON.stringify(cache));
  sessionStorage.setItem('nexaflow-public-company', JSON.stringify({ slug, empresa }));

  const $ = id => document.getElementById(id);
  const moeda = valor => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);
  const iniciais = nome => String(nome || 'NF').split(' ').filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
  const apenasNumeros = valor => String(valor || '').replace(/\D/g, '');
  const bookingUrl = servico => `agendamento-publico.html?slug=${encodeURIComponent(slug)}${servico ? `&servico=${encodeURIComponent(servico)}` : ''}`;

  document.documentElement.style.setProperty('--brand-primary', empresa.corPrincipal || '#2563eb');
  document.documentElement.style.setProperty('--brand-secondary', empresa.corSecundaria || '#7c3aed');
  document.title = `${empresa.nome} — Agendamento online`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', empresa.descricao || `Agende online na ${empresa.nome}.`);

  const logo = iniciais(empresa.nome);
  $('businessLogo').textContent = logo;
  $('businessCardLogo').textContent = logo;
  $('businessBrandName').textContent = empresa.nome;
  $('businessCardName').textContent = empresa.nome;
  $('businessSegment').textContent = empresa.segmento || 'Serviços';
  $('businessCardSegment').textContent = empresa.segmento || 'Serviços';
  $('businessHeadline').textContent = empresa.headline || `Bem-vindo à ${empresa.nome}.`;
  $('businessDescription').textContent = empresa.descricao || 'Agende seus serviços de forma simples e rápida.';
  $('businessCity').textContent = [empresa.cidade, empresa.estado].filter(Boolean).join(', ') || 'Localização não informada';
  $('businessPhone').textContent = empresa.whatsapp || empresa.telefone || 'Contato não informado';
  $('aboutTitle').textContent = `Conheça a ${empresa.nome}.`;
  $('aboutDescription').textContent = empresa.descricao || 'Atendimento organizado e próximo de você.';
  $('instagramChip').textContent = empresa.instagram || 'Instagram não informado';
  $('emailChip').textContent = empresa.email || 'E-mail não informado';
  $('contactBusinessName').textContent = empresa.nome;
  $('addressText').textContent = [empresa.endereco, empresa.numero, empresa.cidade, empresa.estado].filter(Boolean).join(' — ') || 'Endereço não informado';
  $('footerBusinessName').textContent = empresa.nome;
  $('footerBusinessDescription').textContent = empresa.descricao || 'Agendamento online com NexaFlow.';

  const telefoneNumeros = apenasNumeros(empresa.telefone);
  const whatsappNumeros = apenasNumeros(empresa.whatsapp);
  const whatsappHref = whatsappNumeros ? `https://wa.me/${whatsappNumeros.startsWith('55') ? whatsappNumeros : `55${whatsappNumeros}`}` : '#contato';
  $('whatsappLink').href = whatsappHref;
  $('contactWhatsapp').href = whatsappHref;
  $('contactPhone').href = telefoneNumeros ? `tel:+${telefoneNumeros.startsWith('55') ? telefoneNumeros : `55${telefoneNumeros}`}` : '#contato';

  $('publicServices').innerHTML = empresa.servicos.length ? empresa.servicos.map(servico => `
    <article class="service-card">
      <div class="service-card-top"><h3>${servico.nome}</h3><span class="service-price">${moeda(servico.preco)}</span></div>
      <p>${servico.descricao || 'Serviço disponível para agendamento online.'}</p>
      <div class="service-meta"><span>${servico.duracao || 30} min</span><span>Agendamento online</span></div>
      <button class="service-select-btn" type="button" data-service="${servico.nome}">Escolher serviço</button>
    </article>
  `).join('') : '<p>Nenhum serviço disponível no momento.</p>';

  $('publicProfessionals').innerHTML = empresa.profissionais.length ? empresa.profissionais.map(profissional => `
    <article class="professional-card"><div class="professional-avatar">${iniciais(profissional.nome)}</div><div><h3>${profissional.nome}</h3><p>${profissional.especialidade || 'Profissional'}</p><div class="professional-tags">${(profissional.servicos || []).map(servico => `<span class="professional-tag">${servico}</span>`).join('')}</div></div></article>
  `).join('') : '<p>Nenhum profissional disponível no momento.</p>';

  $('hoursList').innerHTML = empresa.horarios.length ? empresa.horarios.map(([dia, inicio, fim, aberto]) => `<div class="hours-row"><span>${dia}</span><strong>${aberto ? `${inicio} — ${fim}` : 'Fechado'}</strong></div>`).join('') : '<p>Horários não informados.</p>';

  const nomesDias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const hojeNome = nomesDias[new Date().getDay()];
  const horarioHoje = empresa.horarios.find(item => item[0] === hojeNome);
  $('todayHours').textContent = horarioHoje && horarioHoje[3] ? `${horarioHoje[1]} — ${horarioHoje[2]}` : 'Fechado hoje';

  document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
    sessionStorage.setItem('nexaflow-public-service', button.dataset.service);
    window.location.href = bookingUrl(button.dataset.service);
  }));

  document.querySelectorAll('a[href="#agendar"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    window.location.href = bookingUrl(sessionStorage.getItem('nexaflow-public-service') || '');
  }));

  $('bookingDemoBtn').addEventListener('click', () => {
    window.location.href = bookingUrl(sessionStorage.getItem('nexaflow-public-service') || '');
  });
  $('bookingMessage').textContent = 'Escolha um serviço ou clique em “Começar agendamento” para reservar seu horário online.';

  const menuToggle = $('menuToggle');
  const navLinks = $('publicNavLinks');
  menuToggle.addEventListener('click', () => {
    const aberto = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(aberto));
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
});
