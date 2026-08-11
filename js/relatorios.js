document.addEventListener('DOMContentLoaded', () => {
  const periodos = {
    7: {
      faturamento: 2840,
      faturamentoDelta: 18,
      agendamentos: 62,
      agendamentosDelta: 12,
      clientes: 47,
      clientesDelta: 9,
      ticket: 45.81,
      ticketDelta: 5,
      labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
      receita: [320,410,350,470,520,560,210],
      agenda: [7,9,8,11,12,10,5],
      servicos: [
        { nome: 'Corte masculino', qtd: 24, valor: 960 },
        { nome: 'Barba', qtd: 15, valor: 375 },
        { nome: 'Escova', qtd: 13, valor: 780 },
        { nome: 'Manicure', qtd: 10, valor: 400 }
      ],
      profissionais: [
        { nome: 'Carlos Mendes', qtd: 22, valor: 940 },
        { nome: 'Marina Lima', qtd: 16, valor: 820 },
        { nome: 'Ana Souza', qtd: 14, valor: 560 },
        { nome: 'Rafael Alves', qtd: 10, valor: 520 }
      ],
      conclusao: 89
    },
    30: {
      faturamento: 11860,
      faturamentoDelta: 22,
      agendamentos: 248,
      agendamentosDelta: 16,
      clientes: 173,
      clientesDelta: 13,
      ticket: 47.82,
      ticketDelta: 4,
      labels: ['Sem 1','Sem 2','Sem 3','Sem 4'],
      receita: [2480,2860,3010,3510],
      agenda: [51,58,64,75],
      servicos: [
        { nome: 'Corte masculino', qtd: 94, valor: 3760 },
        { nome: 'Barba', qtd: 62, valor: 1550 },
        { nome: 'Escova', qtd: 51, valor: 3060 },
        { nome: 'Manicure', qtd: 41, valor: 1640 }
      ],
      profissionais: [
        { nome: 'Carlos Mendes', qtd: 86, valor: 3690 },
        { nome: 'Marina Lima', qtd: 66, valor: 3330 },
        { nome: 'Ana Souza', qtd: 55, valor: 2260 },
        { nome: 'Rafael Alves', qtd: 41, valor: 2580 }
      ],
      conclusao: 91
    },
    90: {
      faturamento: 35620,
      faturamentoDelta: 31,
      agendamentos: 731,
      agendamentosDelta: 24,
      clientes: 416,
      clientesDelta: 19,
      ticket: 48.73,
      ticketDelta: 7,
      labels: ['Jun','Jul','Ago'],
      receita: [10320,11580,13720],
      agenda: [212,238,281],
      servicos: [
        { nome: 'Corte masculino', qtd: 271, valor: 10840 },
        { nome: 'Barba', qtd: 184, valor: 4600 },
        { nome: 'Escova', qtd: 156, valor: 9360 },
        { nome: 'Manicure', qtd: 120, valor: 4800 }
      ],
      profissionais: [
        { nome: 'Carlos Mendes', qtd: 252, valor: 10870 },
        { nome: 'Marina Lima', qtd: 197, valor: 10020 },
        { nome: 'Ana Souza', qtd: 158, valor: 6480 },
        { nome: 'Rafael Alves', qtd: 124, valor: 8250 }
      ],
      conclusao: 93
    }
  };

  const formatCurrency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const buttons = Array.from(document.querySelectorAll('.btn-period'));
  let faturamentoChart;
  let agendamentosChart;

  function comparisonText(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}% vs. período anterior`;
  }

  function renderRanking(containerId, items, valueFormatter) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map((item, index) => `
      <div class="ranking-item">
        <div class="ranking-position">${index + 1}</div>
        <div class="ranking-copy">
          <strong>${item.nome}</strong>
          <span>${item.qtd} atendimentos</span>
        </div>
        <div class="ranking-value">${valueFormatter(item.valor)}</div>
      </div>
    `).join('');
  }

  function renderCharts(data) {
    if (faturamentoChart) faturamentoChart.destroy();
    if (agendamentosChart) agendamentosChart.destroy();

    faturamentoChart = new Chart(document.getElementById('faturamentoChart'), {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Faturamento',
          data: data.receita,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,.12)',
          fill: true,
          tension: .38,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: value => `R$ ${value}` },
            grid: { color: 'rgba(148,163,184,.14)' }
          },
          x: { grid: { display: false } }
        }
      }
    });

    agendamentosChart = new Chart(document.getElementById('agendamentosChart'), {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Agendamentos',
          data: data.agenda,
          backgroundColor: 'rgba(79,70,229,.78)',
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,.14)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function render(period) {
    const data = periodos[period];
    document.getElementById('kpiFaturamento').textContent = formatCurrency(data.faturamento);
    document.getElementById('kpiAgendamentos').textContent = data.agendamentos;
    document.getElementById('kpiClientes').textContent = data.clientes;
    document.getElementById('kpiTicket').textContent = formatCurrency(data.ticket);

    const comparisons = [
      ['kpiFaturamentoComparacao', data.faturamentoDelta],
      ['kpiAgendamentosComparacao', data.agendamentosDelta],
      ['kpiClientesComparacao', data.clientesDelta],
      ['kpiTicketComparacao', data.ticketDelta]
    ];

    comparisons.forEach(([id, value]) => {
      const element = document.getElementById(id);
      element.textContent = comparisonText(value);
      element.classList.toggle('negative', value < 0);
    });

    renderRanking('rankingServicos', data.servicos, formatCurrency);
    renderRanking('rankingProfissionais', data.profissionais, formatCurrency);

    document.getElementById('destaqueServico').textContent = data.servicos[0].nome;
    document.getElementById('destaqueProfissional').textContent = data.profissionais[0].nome;
    document.getElementById('destaqueConclusao').textContent = `${data.conclusao}%`;

    renderCharts(data);
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      render(Number(button.dataset.period));
    });
  });

  render(7);
});
