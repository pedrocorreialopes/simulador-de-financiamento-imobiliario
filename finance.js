/**
 * ============================================================
 * SIMULADOR CAIXA - MOTOR DE CÁLCULO FINANCEIRO
 * Todos os cálculos de financiamento imobiliário seguindo
 * as regras da Caixa Econômica Federal
 * ============================================================
 */

const Finance = (() => {

  // ─── SAC: SISTEMA DE AMORTIZAÇÃO CONSTANTE ──────────────────
  /**
   * Calcula tabela completa do sistema SAC
   * @param {number} valorFinanciado - Valor a ser financiado
   * @param {number} prazoMeses - Prazo em meses
   * @param {number} taxaAnual - Taxa de juros ao ano em %
   * @param {number} seguroMensal - Seguro mensal (MIP + DFI)
   * @param {number} taxaAdmin - Taxa administrativa mensal
   * @returns {Object} Tabela de amortização e resumo
   */
  const calcularSAC = (valorFinanciado, prazoMeses, taxaAnual, seguroMensal = 0, taxaAdmin = 0) => {
    const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
    const amortizacaoConstante = valorFinanciado / prazoMeses;

    let saldoDevedor = valorFinanciado;
    const tabela = [];
    let totalJuros = 0;
    let totalAmortizacao = 0;
    let totalPago = 0;
    let totalSeguro = 0;

    for (let mes = 1; mes <= prazoMeses; mes++) {
      const juros = saldoDevedor * taxaMensal;
      const parcela = amortizacaoConstante + juros;
      const parcelaTotal = parcela + seguroMensal + taxaAdmin;

      saldoDevedor -= amortizacaoConstante;
      if (saldoDevedor < 0.01) saldoDevedor = 0;

      totalJuros += juros;
      totalAmortizacao += amortizacaoConstante;
      totalPago += parcelaTotal;
      totalSeguro += seguroMensal;

      tabela.push({
        mes,
        parcela: Math.round(parcela * 100) / 100,
        amortizacao: Math.round(amortizacaoConstante * 100) / 100,
        juros: Math.round(juros * 100) / 100,
        seguro: seguroMensal,
        taxaAdmin,
        parcelaTotal: Math.round(parcelaTotal * 100) / 100,
        saldoDevedor: Math.round(saldoDevedor * 100) / 100
      });
    }

    return {
      sistema: 'SAC',
      valorFinanciado,
      prazoMeses,
      taxaAnual,
      taxaMensal: taxaMensal * 100,
      primeiraParcela: tabela[0].parcelaTotal,
      ultimaParcela: tabela[tabela.length - 1].parcelaTotal,
      parcelaMedia: totalPago / prazoMeses,
      totalJuros: Math.round(totalJuros * 100) / 100,
      totalAmortizacao: Math.round(totalAmortizacao * 100) / 100,
      totalSeguro: Math.round(totalSeguro * 100) / 100,
      totalPago: Math.round(totalPago * 100) / 100,
      tabela
    };
  };

  // ─── PRICE: TABELA PRICE / HP ────────────────────────────────
  /**
   * Calcula tabela completa do sistema PRICE
   * @param {number} valorFinanciado
   * @param {number} prazoMeses
   * @param {number} taxaAnual
   * @param {number} seguroMensal
   * @param {number} taxaAdmin
   * @returns {Object}
   */
  const calcularPRICE = (valorFinanciado, prazoMeses, taxaAnual, seguroMensal = 0, taxaAdmin = 0) => {
    const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;

    // Fórmula PRICE: PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
    const fator = Math.pow(1 + taxaMensal, prazoMeses);
    const parcelaBase = valorFinanciado * (taxaMensal * fator) / (fator - 1);

    let saldoDevedor = valorFinanciado;
    const tabela = [];
    let totalJuros = 0;
    let totalAmortizacao = 0;
    let totalPago = 0;
    let totalSeguro = 0;

    for (let mes = 1; mes <= prazoMeses; mes++) {
      const juros = saldoDevedor * taxaMensal;
      const amortizacao = parcelaBase - juros;
      const parcelaTotal = parcelaBase + seguroMensal + taxaAdmin;

      saldoDevedor -= amortizacao;
      if (saldoDevedor < 0.01) saldoDevedor = 0;

      totalJuros += juros;
      totalAmortizacao += amortizacao;
      totalPago += parcelaTotal;
      totalSeguro += seguroMensal;

      tabela.push({
        mes,
        parcela: Math.round(parcelaBase * 100) / 100,
        amortizacao: Math.round(amortizacao * 100) / 100,
        juros: Math.round(juros * 100) / 100,
        seguro: seguroMensal,
        taxaAdmin,
        parcelaTotal: Math.round(parcelaTotal * 100) / 100,
        saldoDevedor: Math.round(saldoDevedor * 100) / 100
      });
    }

    return {
      sistema: 'PRICE',
      valorFinanciado,
      prazoMeses,
      taxaAnual,
      taxaMensal: taxaMensal * 100,
      primeiraParcela: tabela[0].parcelaTotal,
      ultimaParcela: tabela[tabela.length - 1].parcelaTotal,
      parcelaMedia: totalPago / prazoMeses,
      totalJuros: Math.round(totalJuros * 100) / 100,
      totalAmortizacao: Math.round(totalAmortizacao * 100) / 100,
      totalSeguro: Math.round(totalSeguro * 100) / 100,
      totalPago: Math.round(totalPago * 100) / 100,
      tabela
    };
  };

  // ─── CALCULAR SEGURO HABITACIONAL ────────────────────────────
  const calcularSeguro = (saldoDevedor, valorImovel, idade = 30) => {
    // MIP varia com idade do segurado
    let fatorMIP = CONFIG.seguro.mipBase;
    if (idade >= 50) fatorMIP *= 2.5;
    else if (idade >= 40) fatorMIP *= 1.8;
    else if (idade >= 35) fatorMIP *= 1.4;

    const mip = saldoDevedor * fatorMIP;
    const dfi = valorImovel * CONFIG.seguro.dfiBase;
    return Math.round((mip + dfi) * 100) / 100;
  };

  // ─── SIMULAÇÃO PRINCIPAL ─────────────────────────────────────
  /**
   * Realiza simulação completa de financiamento
   * @param {Object} dados - Todos os dados do formulário
   * @returns {Object} Resultado completo da simulação
   */
  const simular = (dados) => {
    const {
      valorImovel,
      valorEntrada,
      valorFGTS = 0,
      prazoMeses,
      taxaAnual,
      sistema,
      idade = 30,
      imovelNovo = true,
      incluirSeguro = true,
      incluirTaxaAdmin = true
    } = dados;

    // Valores básicos
    const entradaTotal = valorEntrada + valorFGTS;
    const valorFinanciado = valorImovel - entradaTotal;
    const percentualFinanciado = (valorFinanciado / valorImovel) * 100;
    const percentualEntrada = (entradaTotal / valorImovel) * 100;

    // Limites
    const percentualMaximo = imovelNovo
      ? CONFIG.financiamento.imovelNovo * 100
      : CONFIG.financiamento.imovelUsado * 100;

    // Seguro (calculado sobre valor médio)
    const seguroMensal = incluirSeguro
      ? calcularSeguro(valorFinanciado, valorImovel, idade)
      : 0;
    const taxaAdmin = incluirTaxaAdmin ? CONFIG.seguro.taxaAdministrativa : 0;

    // Calcular ambos os sistemas
    const resultSAC = calcularSAC(valorFinanciado, prazoMeses, taxaAnual, seguroMensal, taxaAdmin);
    const resultPRICE = calcularPRICE(valorFinanciado, prazoMeses, taxaAnual, seguroMensal, taxaAdmin);

    // Resultado do sistema escolhido
    const resultPrincipal = sistema === 'SAC' ? resultSAC : resultPRICE;

    // Economias SAC vs PRICE
    const economiaSACvsPRICE = resultPRICE.totalPago - resultSAC.totalPago;
    const economiaSACvsPrice_juros = resultPRICE.totalJuros - resultSAC.totalJuros;

    // Inteligência financeira
    const inteligencia = gerarInsights(dados, resultPrincipal, resultSAC, resultPRICE);

    return {
      id: Utils.generateId(),
      timestamp: Date.now(),
      dados,
      valorImovel,
      entradaTotal,
      valorFGTS,
      valorFinanciado,
      percentualFinanciado: Math.round(percentualFinanciado * 100) / 100,
      percentualEntrada: Math.round(percentualEntrada * 100) / 100,
      percentualMaximo,
      seguroMensal,
      taxaAdmin,
      sistema,
      resultadoPrincipal: resultPrincipal,
      resultSAC,
      resultPRICE,
      economiaSACvsPRICE,
      economiaSACvsPrice_juros,
      inteligencia
    };
  };

  // ─── GERADOR DE INSIGHTS INTELIGENTES ───────────────────────
  const gerarInsights = (dados, resultPrincipal, resultSAC, resultPRICE) => {
    const insights = [];
    const { valorImovel, valorEntrada, valorFGTS = 0, rendaBruta = 0, rendaLiquida = 0, prazoMeses, taxaAnual, imovelNovo, sistema } = dados;

    const entradaTotal = valorEntrada + valorFGTS;
    const valorFinanciado = valorImovel - entradaTotal;
    const percentualFinanciado = (valorFinanciado / valorImovel) * 100;
    const percentualMaximo = imovelNovo ? 80 : 70;
    const comprometimentoRenda = rendaBruta > 0
      ? (resultPrincipal.primeiraParcela / rendaBruta) * 100
      : 0;

    // 1. Comprometimento de renda
    if (rendaBruta > 0) {
      if (comprometimentoRenda <= 25) {
        insights.push({
          tipo: 'success',
          icone: '✅',
          titulo: 'Comprometimento de renda saudável',
          descricao: `Sua primeira parcela comprometeria ${comprometimentoRenda.toFixed(1)}% da renda bruta, abaixo do limite recomendado de 30%.`,
          valor: `${comprometimentoRenda.toFixed(1)}%`
        });
      } else if (comprometimentoRenda <= 30) {
        insights.push({
          tipo: 'warning',
          icone: '⚠️',
          titulo: 'Comprometimento próximo ao limite',
          descricao: `Sua primeira parcela comprometeria ${comprometimentoRenda.toFixed(1)}% da renda. A Caixa permite até 30%.`,
          valor: `${comprometimentoRenda.toFixed(1)}%`
        });
      } else {
        const parcelaMaxima = rendaBruta * 0.30;
        const valorMaxFinanciavel = calcularCapacidade(rendaBruta, prazoMeses, taxaAnual, imovelNovo);
        insights.push({
          tipo: 'error',
          icone: '❌',
          titulo: 'Renda insuficiente',
          descricao: `A parcela comprometeria ${comprometimentoRenda.toFixed(1)}% da renda (máximo: 30%). Você precisaria de renda mínima de ${Utils.formatCurrency(resultPrincipal.primeiraParcela / 0.30)} ou reduzir o valor financiado.`,
          valor: `${comprometimentoRenda.toFixed(1)}%`,
          rendaMinima: resultPrincipal.primeiraParcela / 0.30
        });
      }
    }

    // 2. Percentual financiado
    if (percentualFinanciado > percentualMaximo) {
      const entradaMinima = valorImovel * (1 - percentualMaximo / 100);
      insights.push({
        tipo: 'error',
        icone: '🏠',
        titulo: 'Entrada insuficiente',
        descricao: `Para imóvel ${imovelNovo ? 'novo' : 'usado'}, a Caixa financia no máximo ${percentualMaximo}% do valor. Entrada mínima necessária: ${Utils.formatCurrency(entradaMinima)}.`,
        valor: Utils.formatCurrency(entradaMinima - entradaTotal)
      });
    } else if ((entradaTotal / valorImovel) < 0.20) {
      insights.push({
        tipo: 'warning',
        icone: '💰',
        titulo: 'Entrada abaixo do recomendado',
        descricao: 'Especialistas recomendam uma entrada mínima de 20% para reduzir o total de juros pagos.',
        valor: Utils.formatCurrency(valorImovel * 0.20 - entradaTotal)
      });
    }

    // 3. FGTS
    if (valorFGTS > 0) {
      const economiaFGTS = (valorFGTS * taxaAnual / 100) * (prazoMeses / 12);
      insights.push({
        tipo: 'success',
        icone: '💼',
        titulo: 'FGTS sendo bem aproveitado',
        descricao: `O uso do FGTS (${Utils.formatCurrency(valorFGTS)}) na entrada pode economizar aproximadamente ${Utils.formatCurrency(economiaFGTS)} em juros ao longo do financiamento.`,
        valor: Utils.formatCurrency(economiaFGTS)
      });
    }

    // 4. SAC vs PRICE
    const economiaSAC = resultPRICE.totalPago - resultSAC.totalPago;
    if (economiaSAC > 0) {
      insights.push({
        tipo: 'info',
        icone: '📊',
        titulo: 'SAC é mais econômico a longo prazo',
        descricao: `O sistema SAC resulta em ${Utils.formatCurrency(economiaSAC)} a menos no total pago, mas tem parcela inicial ${Utils.formatCurrency(resultSAC.primeiraParcela - resultPRICE.primeiraParcela)} maior que a PRICE.`,
        valor: Utils.formatCurrency(economiaSAC)
      });
    }

    // 5. Prazo
    if (prazoMeses >= 360) {
      insights.push({
        tipo: 'info',
        icone: '📅',
        titulo: 'Prazo longo aumenta os juros totais',
        descricao: `Reduzindo o prazo em 60 meses, você economizaria aproximadamente ${Utils.formatCurrency(calcularEconomiaPrazo(valorFinanciado, prazoMeses, prazoMeses - 60, taxaAnual))}.`,
        valor: `Prazo atual: ${Utils.formatPrazo(prazoMeses)}`
      });
    }

    // 6. Aumento de entrada
    const entradaExtra = valorImovel * 0.05;
    const economiaMaisEntrada = calcularEconomiaEntrada(valorImovel, entradaTotal, entradaExtra, prazoMeses, taxaAnual);
    if (entradaExtra > 0 && economiaMaisEntrada > entradaExtra * 0.5) {
      insights.push({
        tipo: 'success',
        icone: '📈',
        titulo: 'Aumentar a entrada economiza muito',
        descricao: `Adicionando apenas ${Utils.formatCurrency(entradaExtra)} a mais na entrada, você economizaria ${Utils.formatCurrency(economiaMaisEntrada)} em juros.`,
        valor: Utils.formatCurrency(economiaMaisEntrada)
      });
    }

    return insights;
  };

  // ─── CALCULADORAS AUXILIARES ─────────────────────────────────

  // Capacidade máxima de financiamento pela renda
  const calcularCapacidade = (rendaBruta, prazoMeses, taxaAnual, imovelNovo = true) => {
    const parcelaMaxima = rendaBruta * CONFIG.financiamento.comprometimentoRenda;
    const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
    const fator = Math.pow(1 + taxaMensal, prazoMeses);
    // Fórmula inversa PRICE: PV = PMT * [(1+i)^n - 1] / [i * (1+i)^n]
    const valorMaxFinanciado = parcelaMaxima * (fator - 1) / (taxaMensal * fator);
    const percentualFinanciamento = imovelNovo
      ? CONFIG.financiamento.imovelNovo
      : CONFIG.financiamento.imovelUsado;
    return valorMaxFinanciado / percentualFinanciamento;
  };

  // Renda mínima necessária
  const calcularRendaMinima = (valorFinanciado, prazoMeses, taxaAnual) => {
    const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
    const fator = Math.pow(1 + taxaMensal, prazoMeses);
    const primeiraParcela = valorFinanciado / prazoMeses + valorFinanciado * taxaMensal; // SAC
    return primeiraParcela / CONFIG.financiamento.comprometimentoRenda;
  };

  // Entrada ideal (20% do imóvel)
  const calcularEntradaIdeal = (valorImovel) => ({
    minima: valorImovel * 0.20,
    recomendada: valorImovel * 0.25,
    ideal: valorImovel * 0.30
  });

  // Economia ao reduzir prazo
  const calcularEconomiaPrazo = (valorFinanciado, prazoAtual, prazoNovo, taxaAnual) => {
    const r1 = calcularPRICE(valorFinanciado, prazoAtual, taxaAnual);
    const r2 = calcularPRICE(valorFinanciado, prazoNovo, taxaAnual);
    return r1.totalPago - r2.totalPago;
  };

  // Economia ao aumentar entrada
  const calcularEconomiaEntrada = (valorImovel, entradaAtual, entradaExtra, prazoMeses, taxaAnual) => {
    const fin1 = valorImovel - entradaAtual;
    const fin2 = valorImovel - entradaAtual - entradaExtra;
    if (fin2 <= 0) return 0;
    const r1 = calcularPRICE(fin1, prazoMeses, taxaAnual);
    const r2 = calcularPRICE(fin2, prazoMeses, taxaAnual);
    return r1.totalPago - r2.totalPago;
  };

  // ITBI
  const calcularITBI = (valorImovel, percentualITBI = null) => {
    const perc = percentualITBI || CONFIG.custos.itbiPercentual;
    return valorImovel * perc;
  };

  // Registro em cartório
  const calcularRegistro = (valorImovel) => {
    const base = CONFIG.custos.registroBase;
    const perc = valorImovel * CONFIG.custos.registroPercentual;
    return Math.min(base + perc, 8000);
  };

  // Escritura
  const calcularEscritura = (valorImovel, financiado = true) => {
    if (financiado) return 0; // Imóvel financiado pela Caixa é isento
    return valorImovel * CONFIG.custos.escrituraPercentual;
  };

  // Custo total da compra
  const calcularCustoTotal = (valorImovel, valorFinanciado, entradaTotal) => {
    const itbi = calcularITBI(valorImovel);
    const registro = calcularRegistro(valorImovel);
    const escritura = calcularEscritura(valorImovel, true);
    const avaliacao = CONFIG.custos.avaliacao;
    const despesasExtras = itbi + registro + escritura + avaliacao;
    return {
      valorImovel,
      entradaTotal,
      itbi: Math.round(itbi * 100) / 100,
      registro: Math.round(registro * 100) / 100,
      escritura,
      avaliacao,
      despesasExtras: Math.round(despesasExtras * 100) / 100,
      totalNecessarioNaCompra: Math.round((entradaTotal + despesasExtras) * 100) / 100
    };
  };

  // Verificar enquadramento MCMV
  const verificarMCMV = (rendaBruta, valorImovel) => {
    if (rendaBruta > CONFIG.mcmv.rendaMaxima) {
      return { enquadra: false, faixa: null, motivo: 'Renda acima do limite MCMV' };
    }

    for (const faixa of CONFIG.mcmv.faixas) {
      if (rendaBruta >= faixa.rendaMin && rendaBruta <= faixa.rendaMax) {
        const imovelEnquadra = valorImovel <= faixa.imovelMaximo;
        return {
          enquadra: imovelEnquadra,
          faixa,
          subsidio: imovelEnquadra ? faixa.subsidioMax : 0,
          motivo: imovelEnquadra ? `Enquadrado na ${faixa.nome}` : `Valor do imóvel acima do limite para ${faixa.nome} (máx: ${Utils.formatCurrency(faixa.imovelMaximo)})`
        };
      }
    }

    return { enquadra: false, faixa: null, motivo: 'Não enquadrado em nenhuma faixa MCMV' };
  };

  // Comparar 3 financiamentos
  const comparar = (financiamentos) => {
    return financiamentos.map((f, idx) => ({
      id: idx + 1,
      ...simular(f)
    }));
  };

  // Calcular comprometimento de renda
  const calcularComprometimento = (parcela, rendaBruta) => {
    if (!rendaBruta) return 0;
    return (parcela / rendaBruta) * 100;
  };

  // ─── GERAR TABELA DE PARCELAS SIMPLIFICADA ───────────────────
  const gerarTabelaSimplificada = (resultado, maxLinhas = 12) => {
    const { tabela, sistema } = resultado;
    const totalMeses = tabela.length;

    if (totalMeses <= maxLinhas * 2) return tabela;

    // Mostrar primeiros N, últimos N e amostras do meio
    const amostra = [];
    const step = Math.floor(totalMeses / (maxLinhas - 2));

    for (let i = 0; i < totalMeses; i += step) {
      if (i < totalMeses) amostra.push({ ...tabela[i], reticencias: false });
    }
    amostra.push({ ...tabela[totalMeses - 1], reticencias: false });

    return amostra;
  };

  // Exportar API pública
  return {
    calcularSAC,
    calcularPRICE,
    calcularSeguro,
    simular,
    gerarInsights,
    calcularCapacidade,
    calcularRendaMinima,
    calcularEntradaIdeal,
    calcularEconomiaPrazo,
    calcularEconomiaEntrada,
    calcularITBI,
    calcularRegistro,
    calcularEscritura,
    calcularCustoTotal,
    verificarMCMV,
    comparar,
    calcularComprometimento,
    gerarTabelaSimplificada
  };

})();
