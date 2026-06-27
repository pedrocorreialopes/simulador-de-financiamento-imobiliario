/**
 * ============================================================
 * SIMULADOR CAIXA - ARQUIVO DE CONFIGURAÇÃO CENTRAL
 * Todas as regras, taxas e limites da Caixa Econômica Federal
 * Atualize este arquivo conforme mudanças nas políticas do banco
 * Versão: 1.0.0 | Data: Junho 2026
 * ============================================================
 */

const CONFIG = {

  // ─── VERSÃO E METADADOS ──────────────────────────────────────
  version: '1.0.0',
  lastUpdate: '2026-06-27',
  banco: 'Caixa Econômica Federal',

  // ─── TAXAS DE JUROS PADRÃO (ao ano) ─────────────────────────
  taxas: {
    padrao:           10.49,   // % ao ano - taxa padrão
    servidorPublico:   9.49,   // % ao ano - servidor público
    relacionamento:    9.99,   // % ao ano - cliente com relacionamento
    mcmvFaixa1:        4.50,   // % ao ano - MCMV Faixa 1
    mcmvFaixa2:        5.00,   // % ao ano - MCMV Faixa 2
    mcmvFaixa3:        7.66,   // % ao ano - MCMV Faixa 3
    minima:            2.95,   // % ao ano - taxa mínima possível
    maxima:           14.00,   // % ao ano - taxa máxima
  },

  // ─── PERCENTUAIS MÁXIMOS DE FINANCIAMENTO ───────────────────
  financiamento: {
    imovelNovo:       0.80,    // 80% do valor do imóvel
    imovelUsado:      0.70,    // 70% do valor do imóvel
    imovelNovoMCMV:   0.90,    // 90% MCMV imóvel novo
    imovelUsadoMCMV:  0.80,    // 80% MCMV imóvel usado
    minimo:           0.20,    // 20% mínimo financiado
    comprometimentoRenda: 0.30 // máximo 30% da renda bruta
  },

  // ─── PRAZOS DISPONÍVEIS (em meses) ──────────────────────────
  prazos: [120, 180, 240, 300, 360, 420],
  prazoMaximo: 420,            // 35 anos
  prazoMinimo: 120,            // 10 anos

  // ─── VALORES LIMITES ─────────────────────────────────────────
  limites: {
    imovelMinimo:    100000,   // R$ 100.000
    imovelMaximo:   1500000,   // R$ 1.500.000
    imovelMaximoMCMV: 350000,  // R$ 350.000 MCMV
    financiamentoMinimo: 30000,// R$ 30.000
    financiamentoMaximo: 1200000, // R$ 1.200.000
    idadeMinima:        18,
    idadeMaximaSomaPrazo: 80,  // idade + prazo em anos <= 80
  },

  // ─── SEGURO HABITACIONAL (MIP + DFI) ─────────────────────────
  seguro: {
    mipBase:         0.000240, // MIP base por mês sobre saldo devedor
    dfiBase:         0.000015, // DFI base por mês sobre valor do imóvel
    taxaAdministrativa: 25.00  // R$ taxa admin mensal
  },

  // ─── MINHA CASA MINHA VIDA ───────────────────────────────────
  mcmv: {
    faixas: [
      {
        id: 'faixa1a',
        nome: 'Faixa 1 Urbano',
        rendaMin: 0,
        rendaMax: 2640,
        taxaJuros: 4.50,
        subsidioMax: 55000,
        imovelMaximo: 170000,
        descricao: 'Atendimento Habitacional'
      },
      {
        id: 'faixa1b',
        nome: 'Faixa 1,5 Urbano',
        rendaMin: 2640.01,
        rendaMax: 4400,
        taxaJuros: 4.75,
        subsidioMax: 47500,
        imovelMaximo: 264000,
        descricao: 'Taxa reduzida + subsídio'
      },
      {
        id: 'faixa2',
        nome: 'Faixa 2 Urbano',
        rendaMin: 4400.01,
        rendaMax: 8000,
        taxaJuros: 6.00,
        subsidioMax: 29000,
        imovelMaximo: 350000,
        descricao: 'Taxa reduzida'
      },
      {
        id: 'faixa3',
        nome: 'Faixa 3 Urbano',
        rendaMin: 8000.01,
        rendaMax: 12000,
        taxaJuros: 7.66,
        subsidioMax: 0,
        imovelMaximo: 350000,
        descricao: 'Condições diferenciadas'
      }
    ],
    rendaMaxima: 12000,  // limite máximo para MCMV
  },

  // ─── CUSTOS CARTORIAIS E IMPOSTOS ────────────────────────────
  custos: {
    itbiPercentual:    0.02,   // 2% do valor venal - varia por município
    registroBase:      1500,   // base taxa de registro
    registroPercentual: 0.001, // 0,1% sobre o valor
    escrituraPercentual: 0.002,// 0,2% sobre o valor (imóvel financiado isento FGTS)
    despesasCartorioMin: 2000,
    despesasCartorioMax: 8000,
    avaliacao:          1000,  // avaliação do imóvel pela CAIXA
  },

  // ─── FGTS ────────────────────────────────────────────────────
  fgts: {
    idadeMinimaConta: 36, // meses de contribuição mínima
    usoAbatimentoDivida: true,
    usoEntrada: true,
    limitePercentualAmortizacao: 0.80, // máximo 80% do saldo devedor
    periodoEntreSaques: 24, // meses mínimos entre utilizações
  },

  // ─── TR (TAXA REFERENCIAL) ───────────────────────────────────
  tr: {
    valorAtual: 0.00,    // 0% ao mês (pode ser atualizado)
    aplicada: true       // se TR está sendo aplicada
  },

  // ─── SISTEMAS DE AMORTIZAÇÃO ─────────────────────────────────
  sistemas: {
    sac: {
      nome: 'SAC',
      nomeCompleto: 'Sistema de Amortização Constante',
      descricao: 'Parcelas decrescentes, amortização constante'
    },
    price: {
      nome: 'PRICE / HP',
      nomeCompleto: 'Tabela PRICE',
      descricao: 'Parcelas fixas, amortização crescente'
    }
  },

  // ─── ESTADOS BRASILEIROS ────────────────────────────────────
  estados: [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
    'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
    'RS','RO','RR','SC','SP','SE','TO'
  ],

  // ─── MENSAGENS DO SISTEMA ────────────────────────────────────
  mensagens: {
    aviso: `⚠️ AVISO IMPORTANTE: Esta simulação tem caráter meramente informativo e educacional. 
Os valores apresentados são estimativas baseados nos parâmetros informados e nas regras vigentes 
da Caixa Econômica Federal. As condições reais de financiamento dependem de análise de crédito, 
avaliação do imóvel, comprovação de renda e das normas e políticas vigentes da Caixa Econômica 
Federal no momento da contratação. Consulte sempre uma agência da Caixa para condições oficiais.`,
    versao: 'Simulação baseada nas regras da Caixa Econômica Federal - Versão Junho/2026'
  }
};

// Exportar para uso nos módulos
if (typeof module !== 'undefined') {
  module.exports = CONFIG;
}
