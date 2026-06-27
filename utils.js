/**
 * ============================================================
 * SIMULADOR CAIXA - UTILITÁRIOS
 * Funções auxiliares: máscaras, formatação, validação, DOM
 * ============================================================
 */

const Utils = (() => {

  // ─── FORMATAÇÃO MONETÁRIA ────────────────────────────────────
  const formatCurrency = (value, showPrefix = true) => {
    if (isNaN(value) || value === null || value === undefined) return showPrefix ? 'R$ 0,00' : '0,00';
    const formatted = Math.abs(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    if (!showPrefix) return formatted;
    return value < 0 ? `- R$ ${formatted}` : `R$ ${formatted}`;
  };

  const parseCurrency = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    return parseFloat(str.toString().replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
  };

  // ─── FORMATAÇÃO DE PERCENTUAL ────────────────────────────────
  const formatPercent = (value, decimals = 2) => {
    if (isNaN(value)) return '0,00%';
    return `${value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}%`;
  };

  const parsePercent = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    return parseFloat(str.toString().replace('%', '').replace(',', '.')) || 0;
  };

  // ─── FORMATAÇÃO DE PRAZO ─────────────────────────────────────
  const formatPrazo = (meses) => {
    const anos = Math.floor(meses / 12);
    const m = meses % 12;
    if (m === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${m} ${m === 1 ? 'mês' : 'meses'}`;
  };

  // ─── MÁSCARAS DE INPUT ───────────────────────────────────────
  const maskCPF = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 11);
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const maskPhone = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 10) {
      return v
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return v
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const maskCurrency = (value) => {
    const v = value.replace(/\D/g, '');
    if (!v) return '';
    const num = parseInt(v, 10) / 100;
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const maskPercent = (value) => {
    const v = value.replace(/[^\d,]/g, '').replace(',', '.');
    const num = parseFloat(v);
    if (isNaN(num)) return '';
    return value.replace(/[^\d,]/g, '');
  };

  // ─── APLICAR MÁSCARAS AOS CAMPOS ────────────────────────────
  const applyMasks = () => {
    // Campos monetários
    document.querySelectorAll('[data-mask="currency"]').forEach(el => {
      el.addEventListener('input', (e) => {
        const masked = maskCurrency(e.target.value);
        e.target.value = masked;
        e.target.dispatchEvent(new Event('masked'));
      });
      el.addEventListener('blur', (e) => {
        const val = parseCurrency(e.target.value);
        if (val > 0) e.target.value = formatCurrency(val, false);
      });
    });

    // CPF
    document.querySelectorAll('[data-mask="cpf"]').forEach(el => {
      el.addEventListener('input', (e) => {
        e.target.value = maskCPF(e.target.value);
      });
    });

    // Telefone
    document.querySelectorAll('[data-mask="phone"]').forEach(el => {
      el.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
      });
    });

    // Percentual
    document.querySelectorAll('[data-mask="percent"]').forEach(el => {
      el.addEventListener('input', (e) => {
        let v = e.target.value.replace(/[^\d,\.]/g, '');
        e.target.value = v;
      });
    });
  };

  // ─── VALIDAÇÕES ──────────────────────────────────────────────
  const validators = {
    required: (val) => val !== null && val !== undefined && val.toString().trim() !== '',
    minValue: (val, min) => parseCurrency(val) >= min,
    maxValue: (val, max) => parseCurrency(val) <= max,
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    cpf: (val) => {
      const cpf = val.replace(/\D/g, '');
      if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
      let r = 11 - (sum % 11);
      if (r >= 10) r = 0;
      if (r !== parseInt(cpf[9])) return false;
      sum = 0;
      for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
      r = 11 - (sum % 11);
      if (r >= 10) r = 0;
      return r === parseInt(cpf[10]);
    },
    age: (val) => {
      const age = parseInt(val);
      return age >= 18 && age <= 120;
    },
    positiveNumber: (val) => {
      const n = typeof val === 'string' ? parseCurrency(val) : val;
      return n > 0;
    }
  };

  const validateField = (field, rules) => {
    const val = field.value;
    for (const [rule, param] of Object.entries(rules)) {
      if (rule === 'required' && !validators.required(val)) {
        return { valid: false, message: 'Este campo é obrigatório' };
      }
      if (rule === 'email' && val && !validators.email(val)) {
        return { valid: false, message: 'E-mail inválido' };
      }
      if (rule === 'cpf' && val && !validators.cpf(val)) {
        return { valid: false, message: 'CPF inválido' };
      }
      if (rule === 'minValue' && !validators.minValue(val, param)) {
        return { valid: false, message: `Valor mínimo: ${formatCurrency(param)}` };
      }
      if (rule === 'maxValue' && !validators.maxValue(val, param)) {
        return { valid: false, message: `Valor máximo: ${formatCurrency(param)}` };
      }
      if (rule === 'age' && val && !validators.age(val)) {
        return { valid: false, message: 'Idade deve ser entre 18 e 120 anos' };
      }
    }
    return { valid: true };
  };

  const showFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const wrapper = field.closest('.form-group') || field.parentElement;
    field.classList.add('input-error');
    field.classList.remove('input-success');

    let errEl = wrapper.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-error';
      wrapper.appendChild(errEl);
    }
    errEl.textContent = message;
    errEl.style.display = 'block';
  };

  const clearFieldError = (fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const wrapper = field.closest('.form-group') || field.parentElement;
    field.classList.remove('input-error');
    field.classList.add('input-success');
    const errEl = wrapper.querySelector('.field-error');
    if (errEl) errEl.style.display = 'none';
  };

  const clearAllErrors = () => {
    document.querySelectorAll('.input-error').forEach(el => {
      el.classList.remove('input-error');
    });
    document.querySelectorAll('.field-error').forEach(el => {
      el.style.display = 'none';
    });
  };

  // ─── DOM HELPERS ─────────────────────────────────────────────
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const setInputVal = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };

  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };

  const getNumVal = (id) => {
    return parseCurrency(getVal(id));
  };

  const show = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = '';
      el.classList.remove('hidden');
      requestAnimationFrame(() => el.classList.add('visible'));
    }
  };

  const hide = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('visible');
      el.classList.add('hidden');
    }
  };

  const toggle = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.contains('hidden') ? show(id) : hide(id);
  };

  // ─── ANIMAÇÕES ───────────────────────────────────────────────
  const animateValue = (element, start, end, duration = 800, formatter = formatCurrency) => {
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * eased;
      element.textContent = formatter(current);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  const animateCounter = (element, end, duration = 800) => {
    animateValue(element, 0, end, duration, (v) => Math.round(v).toLocaleString('pt-BR'));
  };

  // ─── SCROLL REVEAL ───────────────────────────────────────────
  const initScrollReveal = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  };

  // ─── TOAST NOTIFICATIONS ─────────────────────────────────────
  const toast = (message, type = 'info', duration = 4000) => {
    const container = document.getElementById('toast-container') || (() => {
      const c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
      return c;
    })();

    const toast = document.createElement('div');
    const icons = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
      error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    };

    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ─── LOADING ─────────────────────────────────────────────────
  const showLoading = (id = 'global-loader') => {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  };

  const hideLoading = (id = 'global-loader') => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  };

  // ─── LOCAL STORAGE ───────────────────────────────────────────
  const storage = {
    save: (key, data) => {
      try {
        localStorage.setItem(`caixa_sim_${key}`, JSON.stringify(data));
        return true;
      } catch (e) {
        console.warn('localStorage indisponível:', e);
        return false;
      }
    },
    load: (key, defaultVal = null) => {
      try {
        const item = localStorage.getItem(`caixa_sim_${key}`);
        return item ? JSON.parse(item) : defaultVal;
      } catch (e) {
        return defaultVal;
      }
    },
    remove: (key) => {
      try {
        localStorage.removeItem(`caixa_sim_${key}`);
      } catch (e) {}
    },
    clear: () => {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith('caixa_sim_'))
          .forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    }
  };

  // ─── NÚMERO PARA EXTENSO ─────────────────────────────────────
  const numberToWords = (value) => {
    const v = Math.round(value);
    if (v >= 1000000) return `${(v / 1000000).toFixed(1).replace('.', ',')} milhão`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)} mil`;
    return formatCurrency(v);
  };

  // ─── DEBOUNCE ────────────────────────────────────────────────
  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // ─── COPIAR PARA CLIPBOARD ───────────────────────────────────
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    }
  };

  // ─── GERAR ID ÚNICO ──────────────────────────────────────────
  const generateId = () => {
    return 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // ─── DATA E HORA ─────────────────────────────────────────────
  const formatDate = (date = new Date()) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Exportar API pública
  return {
    formatCurrency,
    parseCurrency,
    formatPercent,
    parsePercent,
    formatPrazo,
    maskCPF,
    maskPhone,
    maskCurrency,
    maskPercent,
    applyMasks,
    validators,
    validateField,
    showFieldError,
    clearFieldError,
    clearAllErrors,
    $,
    $$,
    setVal,
    setInputVal,
    getVal,
    getNumVal,
    show,
    hide,
    toggle,
    animateValue,
    animateCounter,
    initScrollReveal,
    toast,
    showLoading,
    hideLoading,
    storage,
    numberToWords,
    debounce,
    copyToClipboard,
    generateId,
    formatDate
  };

})();
