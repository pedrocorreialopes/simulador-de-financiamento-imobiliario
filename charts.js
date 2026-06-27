/**
 * ============================================================
 * SIMULADOR CAIXA - MÓDULO DE GRÁFICOS
 * Gerencia todos os gráficos Chart.js do simulador
 * ============================================================
 */

const Charts = (() => {

  // Instâncias dos gráficos
  let chartEvolucao = null;
  let chartDistribuicao = null;
  let chartComparacao = null;
  let chartSaldoDevedor = null;

  // ─── PALETA DE CORES ─────────────────────────────────────────
  const getColors = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      primary: '#2563EB',
      secondary: '#7C3AED',
      success: '#059669',
      warning: '#D97706',
      danger: '#DC2626',
      info: '#0891B2',
      sac: '#2563EB',
      price: '#7C3AED',
      amortizacao: '#059669',
      juros: '#DC2626',
      seguro: '#D97706',
      saldoDevedor: '#0891B2',
      textColor: isDark ? '#E2E8F0' : '#1E293B',
      gridColor: isDark ? 'rgba(226,232,240,0.1)' : 'rgba(30,41,59,0.08)',
      bgColor: isDark ? '#1E293B' : '#FFFFFF',
      gradSAC: ['rgba(37,99,235,0.8)', 'rgba(37,99,235,0.1)'],
      gradPRICE: ['rgba(124,58,237,0.8)', 'rgba(124,58,237,0.1)']
    };
  };

  // ─── CONFIGURAÇÃO GLOBAL ─────────────────────────────────────
  const getDefaults = () => {
    const colors = getColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeInOutQuart' },
      plugins: {
        legend: {
          labels: {
            color: colors.textColor,
            font: { family: 'Poppins', size: 12, weight: '500' },
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 12
          }
        },
        tooltip: {
          backgroundColor: colors.bgColor,
          titleColor: colors.textColor,
          bodyColor: colors.textColor,
          borderColor: colors.primary,
          borderWidth: 1,
          cornerRadius: 12,
          padding: 12,
          titleFont: { family: 'Poppins', weight: '600' },
          bodyFont: { family: 'Poppins' },
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataset.label || '';
              const val = Utils.formatCurrency(ctx.parsed.y ?? ctx.parsed);
              return ` ${label}: ${val}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: colors.textColor,
            font: { family: 'Poppins', size: 11 },
            maxRotation: 0
          },
          grid: { color: colors.gridColor }
        },
        y: {
          ticks: {
            color: colors.textColor,
            font: { family: 'Poppins', size: 11 },
            callback: (val) => Utils.formatCurrency(val, false)
          },
          grid: { color: colors.gridColor }
        }
      }
    };
  };

  // ─── GRÁFICO: EVOLUÇÃO DAS PARCELAS ─────────────────────────
  const renderEvolucao = (resultSAC, resultPRICE) => {
    const ctx = document.getElementById('chartEvolucao');
    if (!ctx) return;

    const colors = getColors();
    const tabSAC = resultSAC.tabela;
    const tabPRICE = resultPRICE.tabela;
    const total = tabSAC.length;

    // Amostrar para não sobrecarregar
    const step = Math.max(1, Math.floor(total / 60));
    const labels = [];
    const dataSAC = [];
    const dataPRICE = [];

    for (let i = 0; i < total; i += step) {
      labels.push(`Mês ${tabSAC[i].mes}`);
      dataSAC.push(tabSAC[i].parcelaTotal);
      dataPRICE.push(tabPRICE[i].parcelaTotal);
    }
    // Garantir último
    if (labels[labels.length - 1] !== `Mês ${total}`) {
      labels.push(`Mês ${total}`);
      dataSAC.push(tabSAC[total - 1].parcelaTotal);
      dataPRICE.push(tabPRICE[total - 1].parcelaTotal);
    }

    if (chartEvolucao) chartEvolucao.destroy();

    const gradSAC = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradSAC.addColorStop(0, colors.gradSAC[0]);
    gradSAC.addColorStop(1, colors.gradSAC[1]);

    const gradPRICE = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradPRICE.addColorStop(0, colors.gradPRICE[0]);
    gradPRICE.addColorStop(1, colors.gradPRICE[1]);

    chartEvolucao = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'SAC',
            data: dataSAC,
            borderColor: colors.sac,
            backgroundColor: gradSAC,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: colors.sac
          },
          {
            label: 'PRICE',
            data: dataPRICE,
            borderColor: colors.price,
            backgroundColor: gradPRICE,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: colors.price,
            borderDash: [6, 3]
          }
        ]
      },
      options: {
        ...getDefaults(),
        plugins: {
          ...getDefaults().plugins,
          title: {
            display: true,
            text: 'Evolução das Parcelas - SAC vs PRICE',
            color: getColors().textColor,
            font: { family: 'Poppins', size: 14, weight: '600' },
            padding: { bottom: 20 }
          }
        }
      }
    });
  };

  // ─── GRÁFICO: DISTRIBUIÇÃO DO PAGAMENTO ─────────────────────
  const renderDistribuicao = (resultado) => {
    const ctx = document.getElementById('chartDistribuicao');
    if (!ctx) return;

    const colors = getColors();
    const { totalAmortizacao, totalJuros, totalSeguro } = resultado;

    if (chartDistribuicao) chartDistribuicao.destroy();

    chartDistribuicao = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Amortização', 'Juros', 'Seguro + Taxas'],
        datasets: [{
          data: [totalAmortizacao, totalJuros, totalSeguro || 1],
          backgroundColor: [colors.amortizacao, colors.juros, colors.warning],
          borderColor: ['#ffffff'],
          borderWidth: 3,
          hoverOffset: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeInOutQuart' },
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colors.textColor,
              font: { family: 'Poppins', size: 12, weight: '500' },
              padding: 16,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: colors.bgColor,
            titleColor: colors.textColor,
            bodyColor: colors.textColor,
            borderColor: colors.primary,
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12,
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const perc = ((ctx.parsed / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${Utils.formatCurrency(ctx.parsed)} (${perc}%)`;
              }
            }
          }
        }
      }
    });
  };

  // ─── GRÁFICO: SALDO DEVEDOR ──────────────────────────────────
  const renderSaldoDevedor = (resultSAC, resultPRICE) => {
    const ctx = document.getElementById('chartSaldoDevedor');
    if (!ctx) return;

    const colors = getColors();
    const tabSAC = resultSAC.tabela;
    const tabPRICE = resultPRICE.tabela;
    const total = tabSAC.length;
    const step = Math.max(1, Math.floor(total / 50));

    const labels = [];
    const sdSAC = [];
    const sdPRICE = [];

    for (let i = 0; i < total; i += step) {
      labels.push(`Mês ${tabSAC[i].mes}`);
      sdSAC.push(tabSAC[i].saldoDevedor);
      sdPRICE.push(tabPRICE[i].saldoDevedor);
    }
    labels.push(`Mês ${total}`);
    sdSAC.push(0);
    sdPRICE.push(0);

    if (chartSaldoDevedor) chartSaldoDevedor.destroy();

    chartSaldoDevedor = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Saldo Devedor SAC',
            data: sdSAC,
            borderColor: colors.sac,
            backgroundColor: 'rgba(37,99,235,0.08)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5
          },
          {
            label: 'Saldo Devedor PRICE',
            data: sdPRICE,
            borderColor: colors.price,
            backgroundColor: 'rgba(124,58,237,0.08)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderDash: [6, 3]
          }
        ]
      },
      options: {
        ...getDefaults(),
        plugins: {
          ...getDefaults().plugins,
          title: {
            display: true,
            text: 'Evolução do Saldo Devedor',
            color: getColors().textColor,
            font: { family: 'Poppins', size: 14, weight: '600' },
            padding: { bottom: 20 }
          }
        }
      }
    });
  };

  // ─── GRÁFICO: AMORTIZAÇÃO vs JUROS ──────────────────────────
  const renderAmortizacaoJuros = (resultado) => {
    const ctx = document.getElementById('chartAmortizacao');
    if (!ctx) return;

    const colors = getColors();
    const tabela = resultado.tabela;
    const total = tabela.length;
    const step = Math.max(1, Math.floor(total / 40));

    const labels = [];
    const dataAmort = [];
    const dataJuros = [];

    for (let i = 0; i < total; i += step) {
      labels.push(`Mês ${tabela[i].mes}`);
      dataAmort.push(tabela[i].amortizacao);
      dataJuros.push(tabela[i].juros);
    }

    if (chartComparacao) chartComparacao.destroy();

    chartComparacao = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Amortização',
            data: dataAmort,
            backgroundColor: 'rgba(5,150,105,0.75)',
            borderColor: colors.amortizacao,
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Juros',
            data: dataJuros,
            backgroundColor: 'rgba(220,38,38,0.65)',
            borderColor: colors.danger,
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        ...getDefaults(),
        scales: {
          ...getDefaults().scales,
          x: {
            ...getDefaults().scales.x,
            stacked: true
          },
          y: {
            ...getDefaults().scales.y,
            stacked: true
          }
        },
        plugins: {
          ...getDefaults().plugins,
          title: {
            display: true,
            text: `Amortização vs Juros por Parcela (${resultado.sistema})`,
            color: getColors().textColor,
            font: { family: 'Poppins', size: 14, weight: '600' },
            padding: { bottom: 20 }
          }
        }
      }
    });
  };

  // ─── GRÁFICO: COMPARAÇÃO SAC x PRICE (barras) ───────────────
  const renderComparacaoBarras = (resultSAC, resultPRICE) => {
    const ctx = document.getElementById('chartComparacaoBarras');
    if (!ctx) return;

    const colors = getColors();

    const data = {
      labels: ['1ª Parcela', 'Última Parcela', 'Total de Juros', 'Total Pago'],
      datasets: [
        {
          label: 'SAC',
          data: [
            resultSAC.primeiraParcela,
            resultSAC.ultimaParcela,
            resultSAC.totalJuros,
            resultSAC.totalPago
          ],
          backgroundColor: 'rgba(37,99,235,0.8)',
          borderColor: colors.sac,
          borderWidth: 2,
          borderRadius: 8
        },
        {
          label: 'PRICE',
          data: [
            resultPRICE.primeiraParcela,
            resultPRICE.ultimaParcela,
            resultPRICE.totalJuros,
            resultPRICE.totalPago
          ],
          backgroundColor: 'rgba(124,58,237,0.8)',
          borderColor: colors.price,
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    };

    new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        ...getDefaults(),
        plugins: {
          ...getDefaults().plugins,
          title: {
            display: true,
            text: 'Comparação SAC × PRICE',
            color: getColors().textColor,
            font: { family: 'Poppins', size: 14, weight: '600' },
            padding: { bottom: 20 }
          }
        }
      }
    });
  };

  // ─── ATUALIZAR TODOS OS GRÁFICOS ─────────────────────────────
  const renderAll = (resultado) => {
    const { resultSAC, resultPRICE, resultadoPrincipal } = resultado;

    setTimeout(() => renderEvolucao(resultSAC, resultPRICE), 100);
    setTimeout(() => renderDistribuicao(resultadoPrincipal), 200);
    setTimeout(() => renderSaldoDevedor(resultSAC, resultPRICE), 300);
    setTimeout(() => renderAmortizacaoJuros(resultadoPrincipal), 400);
  };

  // ─── DESTRUIR TODOS ──────────────────────────────────────────
  const destroyAll = () => {
    [chartEvolucao, chartDistribuicao, chartComparacao, chartSaldoDevedor].forEach(c => {
      if (c) c.destroy();
    });
    chartEvolucao = chartDistribuicao = chartComparacao = chartSaldoDevedor = null;
  };

  // ─── ATUALIZAR TEMA ──────────────────────────────────────────
  const updateTheme = (resultado) => {
    if (resultado) {
      destroyAll();
      renderAll(resultado);
    }
  };

  return {
    renderEvolucao,
    renderDistribuicao,
    renderSaldoDevedor,
    renderAmortizacaoJuros,
    renderComparacaoBarras,
    renderAll,
    destroyAll,
    updateTheme
  };

})();
