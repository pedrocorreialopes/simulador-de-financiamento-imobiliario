/**
 * ============================================================
 * SIMULADOR CAIXA - SCRIPT PRINCIPAL
 * Controla toda a lógica da interface do usuário
 * ============================================================
 */

// ─── ESTADO GLOBAL DA APLICAÇÃO ──────────────────────────────
const AppState = {
  currentResult: null,
  history: [],
  comparacoes: [],
  theme: 'light',
  currentSection: 'inicio',
  initialized: false
};

// ─── INICIALIZAÇÃO ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  if (AppState.initialized) return;
  AppState.initialized = true;

  loadTheme();
  loadHistory();
  Utils.applyMasks();
  initNavigation();
  initForm();
  initToggleFields();
  initRangeInputs();
  initTabs();
  Utils.initScrollReveal();
  initSmoothScroll();
  initThemeToggle();
  initComparador();
  preencherEstados();
  animateHero();
  addTooltips();
  initComprometimentoLive();

  // Mostrar aviso legal
  setTimeout(showLegalNotice, 2000);

  console.log('%c🏠 Simulador Caixa v1.0 carregado!', 'color:#2563EB;font-size:14px;font-weight:bold;');
}

// ─── TEMA CLARO/ESCURO ────────────────────────────────────────
function loadTheme() {
  const saved = Utils.storage.load('theme', 'light');
  AppState.theme = saved;
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
  AppState.theme = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  Utils.storage.save('theme', newTheme);
  updateThemeIcon(newTheme);

  // Atualizar gráficos com novo tema
  if (AppState.currentResult) {
    Charts.updateTheme(AppState.currentResult);
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  icon.innerHTML = theme === 'dark'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// ─── NAVEGAÇÃO ────────────────────────────────────────────────
function initNavigation() {
  const menuLinks = document.querySelectorAll('.nav-link[data-section]');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      navigateTo(section);
      // Fechar menu mobile
      navMenu?.classList.remove('open');
    });
  });

  // Menu mobile toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });
  }

  // Sticky nav
  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // Botão hero "Começar Simulação"
  const heroBtn = document.getElementById('btn-iniciar');
  if (heroBtn) {
    heroBtn.addEventListener('click', () => navigateTo('simulador'));
  }
}

function navigateTo(section) {
  // Esconder todas as seções
  document.querySelectorAll('.page-section').forEach(s => {
    s.classList.remove('active');
  });

  // Mostrar seção alvo
  const target = document.getElementById(`section-${section}`);
  if (target) {
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Atualizar nav links
  document.querySelectorAll('.nav-link[data-section]').forEach(l => {
    l.classList.toggle('active', l.dataset.section === section);
  });

  AppState.currentSection = section;

  // Ações especiais por seção
  if (section === 'historico') renderHistorico();
  if (section === 'mcmv') checkMCMVAuto();
}

function handleNavScroll() {
  const nav = document.getElementById('main-nav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
}

// ─── FORMULÁRIO ───────────────────────────────────────────────
function initForm() {
  const form = document.getElementById('form-simulacao');
  if (!form) return;

  // Calcular automaticamente ao alterar campos
  const autoCalcFields = ['valor-imovel', 'valor-entrada', 'valor-fgts', 'prazo', 'taxa-juros', 'sistema-sac', 'sistema-price'];
  autoCalcFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', Utils.debounce(autoCalcular, 500));
      el.addEventListener('input', Utils.debounce(autoCalcular, 800));
    }
  });

  // Botão calcular principal
  const btnCalc = document.getElementById('btn-calcular');
  if (btnCalc) {
    btnCalc.addEventListener('click', handleCalcular);
  }

  // Botão limpar
  const btnClear = document.getElementById('btn-limpar');
  if (btnClear) {
    btnClear.addEventListener('click', limparFormulario);
  }

  // Calcular entrada automaticamente
  const valorImovelEl = document.getElementById('valor-imovel');
  if (valorImovelEl) {
    valorImovelEl.addEventListener('input', Utils.debounce(sugerirEntrada, 600));
  }

  // Validação em tempo real nos campos principais
  ['valor-imovel', 'valor-entrada', 'renda-bruta', 'prazo', 'taxa-juros'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', () => validateMainField(id));
    }
  });
}

function sugerirEntrada() {
  const valorImovel = Utils.getNumVal('valor-imovel');
  if (valorImovel <= 0) return;

  const tipoImovel = document.getElementById('imovel-novo')?.checked ? 'novo' : 'usado';
  const perc = tipoImovel === 'novo' ? 0.20 : 0.30;
  const entradaSugerida = valorImovel * perc;

  const entradaEl = document.getElementById('valor-entrada');
  if (entradaEl && !entradaEl.value) {
    entradaEl.value = Utils.formatCurrency(entradaSugerida, false);
  }

  atualizarIndicadorEntrada(valorImovel);
}

function atualizarIndicadorEntrada(valorImovel) {
  const entrada = Utils.getNumVal('valor-entrada');
  const fgts = Utils.getNumVal('valor-fgts');
  const total = entrada + fgts;
  const perc = valorImovel > 0 ? (total / valorImovel) * 100 : 0;

  const indicator = document.getElementById('entrada-indicator');
  if (indicator) {
    indicator.textContent = `${perc.toFixed(1)}% do valor do imóvel`;
    indicator.className = `entrada-indicator ${perc >= 30 ? 'good' : perc >= 20 ? 'ok' : 'low'}`;
  }
}

function validateMainField(id) {
  const val = Utils.getNumVal(id);
  if (id === 'valor-imovel') {
    if (val < CONFIG.limites.imovelMinimo) {
      Utils.showFieldError(id, `Mínimo: ${Utils.formatCurrency(CONFIG.limites.imovelMinimo)}`);
    } else {
      Utils.clearFieldError(id);
    }
  }
  if (id === 'valor-entrada') {
    const imovel = Utils.getNumVal('valor-imovel');
    if (imovel > 0 && val > imovel) {
      Utils.showFieldError(id, 'Entrada não pode ser maior que o imóvel');
    } else {
      Utils.clearFieldError(id);
    }
  }
}

// ─── CAMPOS CONDICIONAIS ─────────────────────────────────────
function initToggleFields() {
  // FGTS
  const possuiFGTS = document.getElementById('possui-fgts');
  if (possuiFGTS) {
    possuiFGTS.addEventListener('change', () => {
      const fgtsGroup = document.getElementById('group-fgts');
      if (fgtsGroup) {
        fgtsGroup.style.display = possuiFGTS.value === 'sim' ? '' : 'none';
      }
    });
  }

  // Dependentes
  const possuiDep = document.getElementById('possui-dependentes');
  if (possuiDep) {
    possuiDep.addEventListener('change', () => {
      const depGroup = document.getElementById('group-dependentes');
      if (depGroup) {
        depGroup.style.display = possuiDep.value === 'sim' ? '' : 'none';
      }
    });
  }

  // Tipo imóvel
  const radiosImovel = document.querySelectorAll('input[name="tipo-imovel-situacao"]');
  radiosImovel.forEach(r => {
    r.addEventListener('change', () => {
      atualizarLimiteFinanciamento();
      autoCalcular();
    });
  });
}

function atualizarLimiteFinanciamento() {
  const isNovo = document.getElementById('imovel-novo')?.checked;
  const perc = isNovo ? CONFIG.financiamento.imovelNovo * 100 : CONFIG.financiamento.imovelUsado * 100;
  const badge = document.getElementById('badge-perc-max');
  if (badge) badge.textContent = `Máx. ${perc}%`;
}

// ─── RANGE INPUTS ────────────────────────────────────────────
function initRangeInputs() {
  const prazoRange = document.getElementById('prazo-range');
  const prazoSelect = document.getElementById('prazo');

  if (prazoRange && prazoSelect) {
    prazoRange.addEventListener('input', () => {
      prazoSelect.value = prazoRange.value;
      updatePrazoDisplay(parseInt(prazoRange.value));
    });
    prazoSelect.addEventListener('change', () => {
      prazoRange.value = prazoSelect.value;
      updatePrazoDisplay(parseInt(prazoSelect.value));
    });
  }

  // Taxa de juros slider
  const taxaRange = document.getElementById('taxa-range');
  const taxaInput = document.getElementById('taxa-juros');
  if (taxaRange && taxaInput) {
    taxaRange.addEventListener('input', () => {
      taxaInput.value = (parseFloat(taxaRange.value)).toFixed(2).replace('.', ',');
    });
    taxaInput.addEventListener('input', () => {
      const val = Utils.parsePercent(taxaInput.value);
      if (val >= 2 && val <= 20) taxaRange.value = val;
    });
  }
}

function updatePrazoDisplay(meses) {
  const el = document.getElementById('prazo-display');
  if (el) el.textContent = Utils.formatPrazo(meses);
}

// ─── CALCULAR ────────────────────────────────────────────────
function handleCalcular() {
  const dados = coletarDados();
  if (!dados) return;

  Utils.showLoading('btn-calcular');
  const btnCalc = document.getElementById('btn-calcular');
  if (btnCalc) {
    btnCalc.disabled = true;
    btnCalc.classList.add('loading');
  }

  setTimeout(() => {
    try {
      const resultado = Finance.simular(dados);
      AppState.currentResult = resultado;

      renderDashboard(resultado);
      renderInsights(resultado.inteligencia);
      renderTabelaComparacao(resultado);
      renderTabelaParcelas(resultado);
      Charts.renderAll(resultado);
      renderCustoTotal(dados);
      renderMCMVInfo(dados.rendaBruta, dados.valorImovel);
      salvarHistorico(resultado);

      // Navegar para resultado
      const resultSection = document.getElementById('resultado-container');
      if (resultSection) {
        resultSection.classList.add('visible');
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      Utils.toast('Simulação realizada com sucesso! 🎉', 'success');
    } catch (e) {
      console.error('Erro no cálculo:', e);
      Utils.toast('Erro ao realizar simulação. Verifique os dados.', 'error');
    } finally {
      if (btnCalc) {
        btnCalc.disabled = false;
        btnCalc.classList.remove('loading');
      }
    }
  }, 600);
}

function autoCalcular() {
  if (!AppState.currentResult) return;
  const dados = coletarDadosBasico();
  if (!dados) return;

  try {
    const resultado = Finance.simular(dados);
    AppState.currentResult = resultado;
    renderDashboardMini(resultado);
  } catch (e) {}
}

function coletarDados() {
  const valorImovel = Utils.getNumVal('valor-imovel');
  const valorEntrada = Utils.getNumVal('valor-entrada');
  const prazo = parseInt(Utils.getVal('prazo')) || 360;
  const taxa = Utils.parsePercent(Utils.getVal('taxa-juros')) || CONFIG.taxas.padrao;

  // Validações
  if (valorImovel < CONFIG.limites.imovelMinimo) {
    Utils.showFieldError('valor-imovel', `Valor mínimo: ${Utils.formatCurrency(CONFIG.limites.imovelMinimo)}`);
    Utils.toast('Informe o valor do imóvel corretamente', 'error');
    return null;
  }

  if (valorEntrada <= 0) {
    Utils.showFieldError('valor-entrada', 'Informe o valor da entrada');
    Utils.toast('Informe o valor da entrada', 'error');
    return null;
  }

  const imovelNovo = document.getElementById('imovel-novo')?.checked ?? true;
  const percMaximo = imovelNovo ? CONFIG.financiamento.imovelNovo : CONFIG.financiamento.imovelUsado;
  const entradaMinima = valorImovel * (1 - percMaximo);
  const fgts = Utils.getNumVal('valor-fgts');
  const entradaTotal = valorEntrada + fgts;

  if (entradaTotal < entradaMinima) {
    Utils.showFieldError('valor-entrada',
      `Entrada + FGTS mínima: ${Utils.formatCurrency(entradaMinima)} (${((1 - percMaximo) * 100).toFixed(0)}%)`
    );
    Utils.toast(`Entrada insuficiente. Mínimo: ${Utils.formatCurrency(entradaMinima)}`, 'warning');
    return null;
  }

  Utils.clearAllErrors();

  const sistema = document.querySelector('input[name="sistema"]:checked')?.value || 'SAC';

  return {
    // Comprador
    nome: Utils.getVal('nome'),
    cpf: Utils.getVal('cpf'),
    idade: parseInt(Utils.getVal('idade')) || 35,
    estadoCivil: Utils.getVal('estado-civil'),
    cidade: Utils.getVal('cidade-comprador'),
    estado: Utils.getVal('estado-comprador'),
    profissao: Utils.getVal('profissao'),
    rendaBruta: Utils.getNumVal('renda-bruta'),
    rendaLiquida: Utils.getNumVal('renda-liquida'),
    telefone: Utils.getVal('telefone'),
    email: Utils.getVal('email'),
    primeiroImovel: document.getElementById('primeiro-imovel')?.checked,
    servidorPublico: document.getElementById('servidor-publico')?.checked,
    possuiOutroFinanciamento: document.getElementById('outro-financiamento')?.checked,

    // Imóvel
    valorImovel,
    valorEntrada,
    valorFGTS: fgts,
    cidadeImovel: Utils.getVal('cidade-imovel'),
    estadoImovel: Utils.getVal('estado-imovel'),
    imovelNovo,
    construtora: Utils.getVal('construtora'),
    areaConstruida: parseFloat(Utils.getVal('area-construida')) || 0,
    tipoImovel: Utils.getVal('tipo-imovel'),

    // Financiamento
    prazoMeses: prazo,
    taxaAnual: taxa,
    sistema,
    incluirSeguro: document.getElementById('incluir-seguro')?.checked ?? true,
    incluirTaxaAdmin: document.getElementById('incluir-taxa-admin')?.checked ?? true
  };
}

function coletarDadosBasico() {
  const valorImovel = Utils.getNumVal('valor-imovel');
  const valorEntrada = Utils.getNumVal('valor-entrada');
  if (!valorImovel || !valorEntrada) return null;

  return {
    valorImovel,
    valorEntrada,
    valorFGTS: Utils.getNumVal('valor-fgts'),
    imovelNovo: document.getElementById('imovel-novo')?.checked ?? true,
    prazoMeses: parseInt(Utils.getVal('prazo')) || 360,
    taxaAnual: Utils.parsePercent(Utils.getVal('taxa-juros')) || CONFIG.taxas.padrao,
    sistema: document.querySelector('input[name="sistema"]:checked')?.value || 'SAC',
    rendaBruta: Utils.getNumVal('renda-bruta'),
    idade: parseInt(Utils.getVal('idade')) || 35
  };
}

// ─── DASHBOARD ───────────────────────────────────────────────
function renderDashboard(resultado) {
  const { valorImovel, entradaTotal, valorFGTS, valorFinanciado, percentualFinanciado, resultadoPrincipal, dados } = resultado;

  // Animar os cards
  const animateCard = (id, value, formatter) => {
    const el = document.getElementById(id);
    if (el) Utils.animateValue(el, 0, value, 1000, formatter || Utils.formatCurrency);
  };

  animateCard('res-valor-imovel', valorImovel);
  animateCard('res-entrada', entradaTotal);
  animateCard('res-fgts', valorFGTS);
  animateCard('res-financiado', valorFinanciado);
  animateCard('res-primeira-parcela', resultadoPrincipal.primeiraParcela);
  animateCard('res-ultima-parcela', resultadoPrincipal.ultimaParcela);
  animateCard('res-parcela-media', resultadoPrincipal.parcelaMedia);
  animateCard('res-total-juros', resultadoPrincipal.totalJuros);
  animateCard('res-total-pago', resultadoPrincipal.totalPago);

  Utils.setVal('res-sistema', resultadoPrincipal.sistema);
  Utils.setVal('res-prazo', Utils.formatPrazo(dados.prazoMeses));
  Utils.setVal('res-taxa', Utils.formatPercent(dados.taxaAnual) + ' a.a.');
  Utils.setVal('res-perc-financiado', Utils.formatPercent(percentualFinanciado));

  // Comprometimento de renda
  if (dados.rendaBruta > 0) {
    const comp = Finance.calcularComprometimento(resultadoPrincipal.primeiraParcela, dados.rendaBruta);
    const compEl = document.getElementById('res-comprometimento');
    if (compEl) {
      compEl.textContent = Utils.formatPercent(comp);
      compEl.className = `stat-value ${comp <= 25 ? 'text-success' : comp <= 30 ? 'text-warning' : 'text-danger'}`;
    }
  }

  // Barra de progresso financiamento
  const progBar = document.getElementById('prog-financiado');
  if (progBar) {
    setTimeout(() => {
      progBar.style.width = `${Math.min(percentualFinanciado, 100)}%`;
    }, 300);
  }
}

function renderDashboardMini(resultado) {
  const { resultadoPrincipal } = resultado;
  const miniParcela = document.getElementById('mini-parcela');
  if (miniParcela) miniParcela.textContent = Utils.formatCurrency(resultadoPrincipal.primeiraParcela);
}

// ─── INSIGHTS ────────────────────────────────────────────────
function renderInsights(insights) {
  const container = document.getElementById('insights-container');
  if (!container) return;

  if (!insights || insights.length === 0) {
    container.innerHTML = '<p class="no-insights">Nenhuma análise disponível</p>';
    return;
  }

  container.innerHTML = insights.map(insight => `
    <div class="insight-card insight-${insight.tipo} reveal">
      <div class="insight-header">
        <span class="insight-icon">${insight.icone}</span>
        <div class="insight-title-group">
          <h4 class="insight-title">${insight.titulo}</h4>
          ${insight.valor ? `<span class="insight-badge">${insight.valor}</span>` : ''}
        </div>
      </div>
      <p class="insight-desc">${insight.descricao}</p>
    </div>
  `).join('');

  Utils.initScrollReveal();
}

// ─── TABELA DE COMPARAÇÃO SAC x PRICE ───────────────────────
function renderTabelaComparacao(resultado) {
  const { resultSAC, resultPRICE } = resultado;
  const economia = resultPRICE.totalPago - resultSAC.totalPago;

  const cells = {
    'comp-sac-primeira': Utils.formatCurrency(resultSAC.primeiraParcela),
    'comp-sac-ultima': Utils.formatCurrency(resultSAC.ultimaParcela),
    'comp-sac-media': Utils.formatCurrency(resultSAC.parcelaMedia),
    'comp-sac-juros': Utils.formatCurrency(resultSAC.totalJuros),
    'comp-sac-total': Utils.formatCurrency(resultSAC.totalPago),
    'comp-price-primeira': Utils.formatCurrency(resultPRICE.primeiraParcela),
    'comp-price-ultima': Utils.formatCurrency(resultPRICE.ultimaParcela),
    'comp-price-media': Utils.formatCurrency(resultPRICE.parcelaMedia),
    'comp-price-juros': Utils.formatCurrency(resultPRICE.totalJuros),
    'comp-price-total': Utils.formatCurrency(resultPRICE.totalPago),
    'comp-economia': Utils.formatCurrency(Math.abs(economia)),
    'comp-economia-desc': economia > 0 ? 'SAC mais econômico' : 'PRICE mais econômico'
  };

  Object.entries(cells).forEach(([id, val]) => Utils.setVal(id, val));
}

// ─── TABELA DE PARCELAS ──────────────────────────────────────
function renderTabelaParcelas(resultado) {
  const { resultadoPrincipal } = resultado;
  const tabela = resultadoPrincipal.tabela;
  const tbody = document.getElementById('tabela-parcelas-body');
  if (!tbody) return;

  // Mostrar apenas os primeiros 24 + últimos 12 para não travar
  const linhas = [];
  for (let i = 0; i < Math.min(24, tabela.length); i++) linhas.push(tabela[i]);

  if (tabela.length > 36) {
    // Reticências
    linhas.push(null);
    for (let i = tabela.length - 12; i < tabela.length; i++) linhas.push(tabela[i]);
  } else {
    for (let i = 24; i < tabela.length; i++) linhas.push(tabela[i]);
  }

  tbody.innerHTML = linhas.map(row => {
    if (row === null) return `<tr class="reticencias"><td colspan="7">⋯ (demais parcelas omitidas por brevidade) ⋯</td></tr>`;
    return `
      <tr>
        <td class="text-center font-medium">${row.mes}</td>
        <td class="text-right text-primary font-semibold">${Utils.formatCurrency(row.parcelaTotal)}</td>
        <td class="text-right text-success">${Utils.formatCurrency(row.amortizacao)}</td>
        <td class="text-right text-danger">${Utils.formatCurrency(row.juros)}</td>
        <td class="text-right text-warning">${Utils.formatCurrency(row.seguro + row.taxaAdmin)}</td>
        <td class="text-right">${Utils.formatCurrency(row.saldoDevedor)}</td>
        <td class="text-center">
          <div class="mini-bar">
            <div class="mini-bar-amort" style="width:${Math.round((row.amortizacao/row.parcela)*100)}%"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── CUSTO TOTAL DA COMPRA ───────────────────────────────────
function renderCustoTotal(dados) {
  const { valorImovel, valorEntrada, valorFGTS = 0 } = dados;
  const entradaTotal = valorEntrada + valorFGTS;
  const valorFinanciado = valorImovel - entradaTotal;

  const custos = Finance.calcularCustoTotal(valorImovel, valorFinanciado, entradaTotal);

  Utils.setVal('custo-itbi', Utils.formatCurrency(custos.itbi));
  Utils.setVal('custo-registro', Utils.formatCurrency(custos.registro));
  Utils.setVal('custo-escritura', custos.escritura === 0 ? 'Isento (financiado)' : Utils.formatCurrency(custos.escritura));
  Utils.setVal('custo-avaliacao', Utils.formatCurrency(custos.avaliacao));
  Utils.setVal('custo-total-extras', Utils.formatCurrency(custos.despesasExtras));
  Utils.setVal('custo-total-compra', Utils.formatCurrency(custos.totalNecessarioNaCompra));
}

// ─── MCMV ────────────────────────────────────────────────────
function renderMCMVInfo(rendaBruta, valorImovel) {
  const mcmv = Finance.verificarMCMV(rendaBruta, valorImovel);
  const container = document.getElementById('mcmv-result');
  if (!container) return;

  if (mcmv.enquadra && mcmv.faixa) {
    container.innerHTML = `
      <div class="mcmv-card mcmv-aprovado">
        <div class="mcmv-badge">✅ Enquadrado</div>
        <h3>${mcmv.faixa.nome}</h3>
        <p>${mcmv.faixa.descricao}</p>
        <div class="mcmv-grid">
          <div class="mcmv-item">
            <span>Taxa de Juros</span>
            <strong>${Utils.formatPercent(mcmv.faixa.taxaJuros)} a.a.</strong>
          </div>
          <div class="mcmv-item">
            <span>Subsídio Estimado</span>
            <strong class="text-success">${Utils.formatCurrency(mcmv.subsidio)}</strong>
          </div>
          <div class="mcmv-item">
            <span>Imóvel Máximo</span>
            <strong>${Utils.formatCurrency(mcmv.faixa.imovelMaximo)}</strong>
          </div>
        </div>
      </div>
    `;
  } else {
    const faixas = CONFIG.mcmv.faixas;
    container.innerHTML = `
      <div class="mcmv-card mcmv-nao">
        <div class="mcmv-badge mcmv-badge-no">ℹ️ Não enquadrado</div>
        <p>${mcmv.motivo}</p>
        <div class="mcmv-faixas">
          <h4>Faixas do Programa:</h4>
          ${faixas.map(f => `
            <div class="faixa-item">
              <strong>${f.nome}</strong>
              <span>Renda: ${Utils.formatCurrency(f.rendaMin)} – ${Utils.formatCurrency(f.rendaMax)}</span>
              <span>Taxa: ${Utils.formatPercent(f.taxaJuros)} a.a.</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

function checkMCMVAuto() {
  const renda = Utils.getNumVal('renda-bruta');
  const imovel = Utils.getNumVal('valor-imovel');
  if (renda > 0 && imovel > 0) {
    renderMCMVInfo(renda, imovel);
  }
}

// ─── HISTÓRICO ────────────────────────────────────────────────
function salvarHistorico(resultado) {
  AppState.history = Utils.storage.load('history', []);
  AppState.history.unshift({
    id: resultado.id,
    timestamp: resultado.timestamp,
    valorImovel: resultado.valorImovel,
    valorFinanciado: resultado.valorFinanciado,
    primeiraParcela: resultado.resultadoPrincipal.primeiraParcela,
    sistema: resultado.sistema,
    prazo: resultado.dados.prazoMeses,
    taxa: resultado.dados.taxaAnual,
    totalPago: resultado.resultadoPrincipal.totalPago,
    dados: resultado.dados
  });

  // Manter apenas os últimos 10
  AppState.history = AppState.history.slice(0, 10);
  Utils.storage.save('history', AppState.history);
}

function loadHistory() {
  AppState.history = Utils.storage.load('history', []);
}

function renderHistorico() {
  const container = document.getElementById('historico-lista');
  if (!container) return;

  if (AppState.history.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
          <path d="M15 7h2a5 5 0 1 1 0 10h-2"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <p>Nenhuma simulação salva ainda.</p>
        <button class="btn btn-primary" onclick="navigateTo('simulador')">Fazer Simulação</button>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.history.map((sim, idx) => `
    <div class="hist-card reveal" data-index="${idx}">
      <div class="hist-header">
        <span class="hist-badge hist-badge-${sim.sistema.toLowerCase()}">${sim.sistema}</span>
        <span class="hist-date">${Utils.formatDate(new Date(sim.timestamp))}</span>
      </div>
      <div class="hist-body">
        <div class="hist-item">
          <span>Imóvel</span>
          <strong>${Utils.formatCurrency(sim.valorImovel)}</strong>
        </div>
        <div class="hist-item">
          <span>Financiado</span>
          <strong>${Utils.formatCurrency(sim.valorFinanciado)}</strong>
        </div>
        <div class="hist-item">
          <span>1ª Parcela</span>
          <strong class="text-primary">${Utils.formatCurrency(sim.primeiraParcela)}</strong>
        </div>
        <div class="hist-item">
          <span>Total Pago</span>
          <strong>${Utils.formatCurrency(sim.totalPago)}</strong>
        </div>
        <div class="hist-item">
          <span>Prazo</span>
          <strong>${Utils.formatPrazo(sim.prazo)}</strong>
        </div>
        <div class="hist-item">
          <span>Taxa</span>
          <strong>${Utils.formatPercent(sim.taxa)} a.a.</strong>
        </div>
      </div>
      <div class="hist-actions">
        <button class="btn btn-sm btn-primary" onclick="recarregarSimulacao(${idx})">
          Usar dados
        </button>
        <button class="btn btn-sm btn-danger" onclick="excluirHistorico(${idx})">
          Excluir
        </button>
      </div>
    </div>
  `).join('');

  Utils.initScrollReveal();
}

function recarregarSimulacao(idx) {
  const sim = AppState.history[idx];
  if (!sim || !sim.dados) return;
  preencherFormulario(sim.dados);
  navigateTo('simulador');
  Utils.toast('Dados carregados! Clique em Calcular para simular.', 'info');
}

function excluirHistorico(idx) {
  AppState.history.splice(idx, 1);
  Utils.storage.save('history', AppState.history);
  renderHistorico();
  Utils.toast('Simulação removida do histórico', 'info');
}

function preencherFormulario(dados) {
  const fields = {
    'nome': dados.nome, 'cpf': dados.cpf, 'idade': dados.idade,
    'renda-bruta': dados.rendaBruta ? Utils.formatCurrency(dados.rendaBruta, false) : '',
    'renda-liquida': dados.rendaLiquida ? Utils.formatCurrency(dados.rendaLiquida, false) : '',
    'valor-imovel': Utils.formatCurrency(dados.valorImovel, false),
    'valor-entrada': Utils.formatCurrency(dados.valorEntrada, false),
    'valor-fgts': dados.valorFGTS ? Utils.formatCurrency(dados.valorFGTS, false) : '',
    'prazo': dados.prazoMeses,
    'taxa-juros': dados.taxaAnual ? dados.taxaAnual.toString().replace('.', ',') : '',
    'tipo-imovel': dados.tipoImovel || 'apartamento'
  };

  Object.entries(fields).forEach(([id, val]) => {
    if (val) Utils.setInputVal(id, val);
  });

  // Sistema
  const sistemaEl = document.querySelector(`input[name="sistema"][value="${dados.sistema}"]`);
  if (sistemaEl) sistemaEl.checked = true;
}

// ─── COMPARADOR ───────────────────────────────────────────────
function initComparador() {
  const btnAdd = document.getElementById('btn-add-comparacao');
  if (btnAdd) {
    btnAdd.addEventListener('click', adicionarComparacao);
  }

  const btnComparar = document.getElementById('btn-comparar');
  if (btnComparar) {
    btnComparar.addEventListener('click', executarComparacao);
  }
}

function adicionarComparacao() {
  if (AppState.comparacoes.length >= 3) {
    Utils.toast('Máximo de 3 financiamentos para comparar', 'warning');
    return;
  }

  const dados = coletarDadosBasico();
  if (!dados) return;

  AppState.comparacoes.push(dados);
  renderComparadorCards();
  Utils.toast(`Financiamento ${AppState.comparacoes.length} adicionado ao comparador`, 'success');
}

function executarComparacao() {
  if (AppState.comparacoes.length < 2) {
    Utils.toast('Adicione pelo menos 2 financiamentos para comparar', 'warning');
    return;
  }

  const resultados = Finance.comparar(AppState.comparacoes);
  renderComparadorResultado(resultados);
}

function renderComparadorCards() {
  const container = document.getElementById('comparador-cards');
  if (!container) return;

  container.innerHTML = AppState.comparacoes.map((dados, idx) => `
    <div class="comp-card">
      <div class="comp-card-header">
        <span class="comp-num">#${idx + 1}</span>
        <button class="comp-remove" onclick="removerComparacao(${idx})">×</button>
      </div>
      <div class="comp-info">
        <span>Imóvel: ${Utils.formatCurrency(dados.valorImovel)}</span>
        <span>Financiado: ${Utils.formatCurrency(dados.valorImovel - dados.valorEntrada - (dados.valorFGTS || 0))}</span>
        <span>Prazo: ${Utils.formatPrazo(dados.prazoMeses)}</span>
        <span>Taxa: ${Utils.formatPercent(dados.taxaAnual)} a.a.</span>
        <span>Sistema: ${dados.sistema}</span>
      </div>
    </div>
  `).join('');
}

function renderComparadorResultado(resultados) {
  const container = document.getElementById('comparador-resultado');
  if (!container) return;

  const menorTotal = Math.min(...resultados.map(r => r.resultadoPrincipal.totalPago));

  container.innerHTML = `
    <div class="comp-results-grid">
      ${resultados.map((r, idx) => `
        <div class="comp-result-card ${r.resultadoPrincipal.totalPago === menorTotal ? 'comp-winner' : ''}">
          ${r.resultadoPrincipal.totalPago === menorTotal ? '<div class="comp-winner-badge">🏆 Melhor opção</div>' : ''}
          <h4>Financiamento #${idx + 1}</h4>
          <div class="comp-result-item"><span>1ª Parcela</span><strong>${Utils.formatCurrency(r.resultadoPrincipal.primeiraParcela)}</strong></div>
          <div class="comp-result-item"><span>Última Parcela</span><strong>${Utils.formatCurrency(r.resultadoPrincipal.ultimaParcela)}</strong></div>
          <div class="comp-result-item"><span>Total de Juros</span><strong class="text-danger">${Utils.formatCurrency(r.resultadoPrincipal.totalJuros)}</strong></div>
          <div class="comp-result-item"><span>Total Pago</span><strong>${Utils.formatCurrency(r.resultadoPrincipal.totalPago)}</strong></div>
          <div class="comp-result-item"><span>Sistema</span><strong>${r.resultadoPrincipal.sistema}</strong></div>
        </div>
      `).join('')}
    </div>
  `;
}

function removerComparacao(idx) {
  AppState.comparacoes.splice(idx, 1);
  renderComparadorCards();
}

// ─── CALCULADORAS AUXILIARES ─────────────────────────────────
function calcularCapacidade() {
  const renda = Utils.getNumVal('cap-renda');
  const prazo = parseInt(Utils.getVal('cap-prazo')) || 360;
  const taxa = Utils.parsePercent(Utils.getVal('cap-taxa')) || CONFIG.taxas.padrao;
  const imovelNovo = document.getElementById('cap-tipo-novo')?.checked ?? true;

  if (!renda) { Utils.toast('Informe a renda bruta', 'warning'); return; }

  const valorMax = Finance.calcularCapacidade(renda, prazo, taxa, imovelNovo);
  const el = document.getElementById('cap-resultado');
  if (el) {
    el.innerHTML = `
      <div class="calc-result">
        <span>Valor máximo do imóvel:</span>
        <strong class="text-primary text-xl">${Utils.formatCurrency(valorMax)}</strong>
        <small>Baseado em 30% da renda bruta na parcela PRICE</small>
      </div>
    `;
  }
}

function calcularRendaMinima() {
  const imovel = Utils.getNumVal('renda-imovel');
  const entrada = Utils.getNumVal('renda-entrada');
  const prazo = parseInt(Utils.getVal('renda-prazo')) || 360;
  const taxa = Utils.parsePercent(Utils.getVal('renda-taxa')) || CONFIG.taxas.padrao;

  if (!imovel) { Utils.toast('Informe o valor do imóvel', 'warning'); return; }

  const financiado = imovel - entrada;
  if (financiado <= 0) { Utils.toast('Entrada maior que o imóvel', 'error'); return; }

  const rendaMin = Finance.calcularRendaMinima(financiado, prazo, taxa);
  const el = document.getElementById('renda-resultado');
  if (el) {
    el.innerHTML = `
      <div class="calc-result">
        <span>Renda mínima necessária:</span>
        <strong class="text-primary text-xl">${Utils.formatCurrency(rendaMin)}</strong>
        <small>Para não comprometer mais de 30% da renda</small>
      </div>
    `;
  }
}

function calcularCustoTotalCompra() {
  const imovel = Utils.getNumVal('ctc-imovel');
  const financiado = Utils.getNumVal('ctc-financiado');
  const entrada = imovel - financiado;

  if (!imovel) { Utils.toast('Informe o valor do imóvel', 'warning'); return; }

  const custos = Finance.calcularCustoTotal(imovel, financiado, entrada);
  const el = document.getElementById('ctc-resultado');
  if (el) {
    el.innerHTML = `
      <div class="calc-result">
        <div class="custo-item"><span>ITBI (2%)</span><strong>${Utils.formatCurrency(custos.itbi)}</strong></div>
        <div class="custo-item"><span>Registro</span><strong>${Utils.formatCurrency(custos.registro)}</strong></div>
        <div class="custo-item"><span>Escritura</span><strong>${custos.escritura === 0 ? 'Isento' : Utils.formatCurrency(custos.escritura)}</strong></div>
        <div class="custo-item"><span>Avaliação</span><strong>${Utils.formatCurrency(custos.avaliacao)}</strong></div>
        <div class="custo-item total"><span>Total necessário na compra</span><strong class="text-primary">${Utils.formatCurrency(custos.totalNecessarioNaCompra)}</strong></div>
      </div>
    `;
  }
}

// ─── ABAS ─────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabGroup = btn.closest('.tabs-container');
      const targetId = btn.dataset.tab;

      tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabGroup.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = tabGroup.querySelector(`#tab-${targetId}`);
      if (panel) panel.classList.add('active');
    });
  });
}

// ─── SMOOTH SCROLL ───────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ─── HERO ANIMATION ──────────────────────────────────────────
function animateHero() {
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroCta = document.querySelector('.hero-cta');

  [heroTitle, heroSubtitle, heroCta].forEach((el, i) => {
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 200 + 300);
    }
  });
}

// ─── AVISO LEGAL ─────────────────────────────────────────────
function showLegalNotice() {
  const shown = Utils.storage.load('legal_notice_shown', false);
  if (shown) return;

  const modal = document.getElementById('modal-aviso');
  if (modal) {
    modal.classList.add('active');
    Utils.storage.save('legal_notice_shown', true);
  }
}

function fecharAviso() {
  const modal = document.getElementById('modal-aviso');
  if (modal) modal.classList.remove('active');
}

// ─── PREENCHER ESTADOS ────────────────────────────────────────
function preencherEstados() {
  ['estado-comprador', 'estado-imovel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = '<option value="">Selecione...</option>' +
        CONFIG.estados.map(uf => `<option value="${uf}">${uf}</option>`).join('');
    }
  });
}

// ─── LIMPAR FORMULÁRIO ───────────────────────────────────────
function limparFormulario() {
  const form = document.getElementById('form-simulacao');
  if (form) form.reset();
  Utils.clearAllErrors();
  Utils.toast('Formulário limpo!', 'info');
}

// ─── EXPORTAR / IMPRIMIR ────────────────────────────────────
function imprimirResultado() {
  window.print();
}

function compartilharResultado() {
  if (!AppState.currentResult) {
    Utils.toast('Realize uma simulação primeiro', 'warning');
    return;
  }

  const { valorImovel, valorFinanciado, resultadoPrincipal, dados } = AppState.currentResult;
  const texto = `🏠 Simulação de Financiamento Imobiliário - Caixa\n\n` +
    `Valor do Imóvel: ${Utils.formatCurrency(valorImovel)}\n` +
    `Valor Financiado: ${Utils.formatCurrency(valorFinanciado)}\n` +
    `1ª Parcela: ${Utils.formatCurrency(resultadoPrincipal.primeiraParcela)}\n` +
    `Prazo: ${Utils.formatPrazo(dados.prazoMeses)}\n` +
    `Taxa: ${Utils.formatPercent(dados.taxaAnual)} a.a.\n` +
    `Sistema: ${resultadoPrincipal.sistema}\n\n` +
    `Simulação realizada em: ${window.location.href}`;

  Utils.copyToClipboard(texto);
  Utils.toast('Dados copiados para a área de transferência! 📋', 'success');
}

// ─── TOOLTIPS DINÂMICOS ──────────────────────────────────────
function addTooltips() {
  const tooltips = {
    'badge-perc-max': 'Percentual máximo que a Caixa financia do valor do imóvel',
    'incluir-seguro': 'MIP (seguro de vida) + DFI (danos físicos do imóvel)',
    'incluir-taxa-admin': `Taxa administrativa mensal: R$ ${CONFIG.seguro.taxaAdministrativa}`,
    'primeiro-imovel': 'Pode beneficiar na isenção de ITBI em alguns municípios',
    'servidor-publico': 'Servidores públicos têm taxas de juros diferenciadas na Caixa'
  };
  Object.entries(tooltips).forEach(([id, tip]) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('data-tooltip', tip);
  });
}

// ─── INDICADOR DE COMPROMETIMENTO AO VIVO ───────────────────
function initComprometimentoLive() {
  ['renda-bruta', 'valor-imovel', 'valor-entrada', 'valor-fgts', 'prazo', 'taxa-juros'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', Utils.debounce(updateLiveIndicator, 600));
  });
}

function updateLiveIndicator() {
  const renda = Utils.getNumVal('renda-bruta');
  const imovel = Utils.getNumVal('valor-imovel');
  const entrada = Utils.getNumVal('valor-entrada');
  const fgts = Utils.getNumVal('valor-fgts');
  const prazo = parseInt(Utils.getVal('prazo')) || 360;
  const taxa = Utils.parsePercent(Utils.getVal('taxa-juros')) || CONFIG.taxas.padrao;

  if (imovel > 0 && entrada >= 0) {
    atualizarIndicadorEntrada(imovel);
  }
}

// ─── SCROLL SUAVE APRIMORADO ─────────────────────────────────
function initParallax() {
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-section');
    if (hero) {
      const offset = window.scrollY * 0.3;
      hero.style.backgroundPositionY = `${offset}px`;
    }
  }, { passive: true });
}

// Expor funções globais necessárias para os botões HTML
window.navigateTo = navigateTo;
window.fecharAviso = fecharAviso;
window.recarregarSimulacao = recarregarSimulacao;
window.excluirHistorico = excluirHistorico;
window.removerComparacao = removerComparacao;
window.calcularCapacidade = calcularCapacidade;
window.calcularRendaMinima = calcularRendaMinima;
window.calcularCustoTotalCompra = calcularCustoTotalCompra;
window.adicionarComparacao = adicionarComparacao;
window.executarComparacao = executarComparacao;
window.imprimirResultado = imprimirResultado;
window.compartilharResultado = compartilharResultado;
window.toggleTheme = toggleTheme;
