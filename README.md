# 🏠 SimulaCaixa — Simulador Inteligente de Financiamento Imobiliário

> Simulador completo baseado nas regras da Caixa Econômica Federal  
> Design premium com Glassmorphism, modo escuro e responsividade total

---

## ✅ Funcionalidades Implementadas

### 🧮 Motor de Cálculo
- [x] **Sistema SAC** — amortização constante, parcelas decrescentes
- [x] **Sistema PRICE (HP)** — parcelas fixas, amortização crescente
- [x] Comparação automática SAC × PRICE com economia calculada
- [x] Cálculo de seguro habitacional (MIP + DFI) por faixa de idade
- [x] Taxa administrativa mensal configurável
- [x] Limite automático de 80% (imóvel novo) e 70% (imóvel usado)
- [x] Utilização de FGTS na entrada

### 📋 Formulário Completo
- [x] Dados do comprador com todas as validações
- [x] Dados do imóvel (novo/usado, tipo, área, construtora)
- [x] Campos condicionais (FGTS, dependentes)
- [x] Máscaras: CPF, telefone, moeda, percentual
- [x] Range sliders para prazo e taxa de juros com gradiente visual
- [x] Prazos: 120, 180, 240, 300, 360 e 420 meses
- [x] Taxa padrão 10,49% a.a. editável

### 📊 Dashboard de Resultados
- [x] 12 cards animados com CountUp
- [x] Barra de progresso do percentual financiado
- [x] Análise de comprometimento de renda (semáforo visual)

### 📈 Gráficos (Chart.js)
- [x] Evolução das parcelas SAC vs PRICE
- [x] Distribuição do pagamento (rosca)
- [x] Evolução do saldo devedor SAC vs PRICE
- [x] Amortização × Juros por parcela (barras empilhadas)

### 🤖 Inteligência Financeira (Insights)
- [x] Comprometimento de renda (semáforo)
- [x] Alerta de entrada insuficiente
- [x] Análise de aproveitamento do FGTS
- [x] Comparação SAC × PRICE com recomendação
- [x] Economia ao reduzir prazo
- [x] Economia ao aumentar entrada

### 🏡 Minha Casa Minha Vida
- [x] Verificação automática de enquadramento por faixa
- [x] Faixas 1, 1.5, 2 e 3 com renda, taxa e subsídio
- [x] Tabela completa das faixas do programa

### 💰 Custos da Compra
- [x] ITBI (2% configurável por alíquota)
- [x] Registro em cartório
- [x] Escritura (isenção para imóvel financiado)
- [x] Avaliação do imóvel
- [x] Total necessário na compra

### 🧰 Calculadoras Auxiliares
- [x] Capacidade máxima de financiamento pela renda
- [x] Renda mínima necessária
- [x] Custo total da compra
- [x] Entrada ideal (20%, 25%, 30%)
- [x] Calculadora de ITBI
- [x] Comprometimento de renda

### 🔄 Comparador
- [x] Comparar até 3 financiamentos simultaneamente
- [x] Destaque automático para a melhor opção
- [x] Dados de cada financiamento exibidos em cards

### 📚 Histórico
- [x] Salvar simulações no localStorage
- [x] Listar últimas 10 simulações
- [x] Recarregar dados de simulação anterior
- [x] Excluir simulações do histórico

### 🎨 Design
- [x] Glassmorphism com backdrop-filter
- [x] Modo Claro / Modo Escuro persistente
- [x] Gradientes modernos e sombras elegantes
- [x] Bordas arredondadas (20-28px)
- [x] Micro-animações em hover
- [x] Scroll Reveal nas seções
- [x] Toast notifications elegantes
- [x] CountUp animado nos valores
- [x] Loading animation com shimmer
- [x] Page Loader com barra de progresso
- [x] Modal de aviso legal
- [x] Tipografia Poppins (Google Fonts)
- [x] Ícones SVG inline
- [x] Range sliders customizados
- [x] Menu mobile responsivo
- [x] Navbar sticky com blur

### 🖨️ Exportação
- [x] Imprimir resultado (CSS print otimizado)
- [x] Compartilhar (copiar para clipboard)

---

## 🗂️ Estrutura de Arquivos

```
├── index.html      — Estrutura principal (89KB)
├── style.css       — Design completo (54KB)
├── config.js       — Parâmetros centralizados da Caixa
├── utils.js        — Utilitários (máscaras, formatação, DOM)
├── finance.js      — Motor de cálculo financeiro
├── charts.js       — Módulo de gráficos Chart.js
├── script.js       — Lógica da interface
└── README.md       — Documentação
```

---

## ⚙️ Parâmetros Configuráveis (`config.js`)

| Parâmetro | Valor Padrão | Descrição |
|-----------|-------------|-----------|
| Taxa padrão | 10,49% a.a. | Taxa de juros padrão |
| Taxa servidor público | 9,49% a.a. | Taxa para servidores |
| Imóvel novo | 80% | Máx. financiável |
| Imóvel usado | 70% | Máx. financiável |
| Prazo máximo | 420 meses | 35 anos |
| Comprometimento renda | 30% | Máx. permitido |
| Seguro MIP base | 0,024%/mês | Sobre saldo devedor |
| Taxa admin | R$ 25/mês | Configurável |
| ITBI | 2% | Configurável por município |

---

## 🛤️ Navegação (Seções)

| Seção | ID | Descrição |
|-------|----|-----------|
| Início | `#section-inicio` | Hero + features |
| Simulador | `#section-simulador` | Formulário + resultado |
| SAC × PRICE | `#section-tabelas` | Comparativo detalhado |
| MCMV | `#section-mcmv` | Minha Casa Minha Vida |
| Calculadoras | `#section-calculadoras` | Ferramentas auxiliares |
| Dicas | `#section-dicas` | 9 dicas financeiras |
| Histórico | `#section-historico` | Histórico + comparador |
| Contato | `#section-contato` | Contato + aviso legal |

---

## 🔧 Tecnologias Utilizadas

- **HTML5** — semântico, acessível, SEO
- **CSS3** — variáveis, glassmorphism, animações
- **JavaScript ES6+** — módulos IIFE, Promises, localStorage
- **Chart.js 4.4** — gráficos responsivos
- **Google Fonts** — Poppins
- **Ícones SVG** — inline, sem dependência externa

---

## ❌ Funcionalidades Não Implementadas

- [ ] Geração de PDF (requer servidor ou biblioteca)
- [ ] Exportação para Excel (requer biblioteca SheetJS)
- [ ] Autenticação de usuários
- [ ] Integração com API oficial da Caixa
- [ ] Cálculo com correção TR dinâmica (API do Banco Central)
- [ ] Simulação com entrada parcelada

---

## 🔮 Próximas Etapas Recomendadas

1. **Integrar SheetJS** para exportação Excel
2. **Integrar jsPDF** para geração de PDF
3. **Adicionar API do BCB** para TR e índices atualizados em tempo real
4. **Sistema de usuários** com banco de dados para histórico na nuvem
5. **Notificações por email** com resumo da simulação
6. **Calculadora de amortização extraordinária** (pagamentos extras)
7. **Comparação com outros bancos** (Itaú, Bradesco, Santander)
8. **Mapa de imóveis** integrado com pesquisa por CEP

---

## ⚠️ Aviso Legal

Esta ferramenta é um **simulador educativo e informativo**. Os valores calculados são estimativas baseadas nos parâmetros da Caixa Econômica Federal vigentes em junho/2026. **Não constitui proposta de crédito.** Consulte sempre uma agência da Caixa para condições oficiais.

---

*Versão 1.0.0 — Junho/2026*
