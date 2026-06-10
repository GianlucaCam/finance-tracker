// js/app.js
// Utilizza i moduli db e charts esposti a livello globale tramite script standard

// --- STATO DELL'APPLICAZIONE ---
const state = {
  currentTab: 'dashboard',
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth(),
  txYear: new Date().getFullYear(),
  txMonth: new Date().getMonth(),
  categoryChart: null,
  trendChart: null,
  calculator: {
    display: '0',
    isResult: false,
    selectedCategory: null
  }
};

// --- RIFERIMENTI DOM ---
const DOM = {
  // Navigazione
  menuItems: document.querySelectorAll('.menu-item'),
  sections: document.querySelectorAll('.content-section'),
  pageTitle: document.getElementById('page-title'),
  headerSubtitle: document.getElementById('header-subtitle'),
  globalDate: document.getElementById('global-month-year'),
  themeToggle: document.getElementById('theme-toggle'),
  globalBalance: document.getElementById('global-total-balance'),
  
  // Dashboard
  dashIncome: document.getElementById('dash-income'),
  dashExpense: document.getElementById('dash-expense'),
  dashSavings: document.getElementById('dash-savings'),
  recentTxList: document.getElementById('recent-transactions-list'),
  dashBudgetsList: document.getElementById('dash-budgets-list'),
  
  // Transazioni
  txTableBody: document.getElementById('transactions-list-tbody'),
  txPlaceholder: document.getElementById('no-transactions-placeholder'),
  filterSearch: document.getElementById('filter-search'),
  filterType: document.getElementById('filter-type'),
  filterAccount: document.getElementById('filter-account'),
  filterCategory: document.getElementById('filter-category'),
  
  // Conti
  accountsGrid: document.getElementById('accounts-grid-container'),
  addAccountTrigger: document.getElementById('add-account-trigger'),
  
  // Budget & Categorie
  categoryTabBtns: document.querySelectorAll('.category-budget-tabs .tab-btn'),
  categoryTabContents: document.querySelectorAll('.tab-content'),
  expenseCategoriesGrid: document.getElementById('expense-categories-grid'),
  incomeCategoriesGrid: document.getElementById('income-categories-grid'),
  
  // Azioni Globali
  exportBtn: document.getElementById('export-btn'),
  importFile: document.getElementById('import-file'),
  resetBtn: document.getElementById('reset-btn'),
  
  // Modale Transazione
  modalTx: document.getElementById('modal-transaction'),
  formTx: document.getElementById('transaction-form'),
  txId: document.getElementById('tx-id'),
  txTypeRadios: document.getElementsByName('tx-type'),
  txAmount: document.getElementById('tx-amount'),
  txDate: document.getElementById('tx-date'),
  txAccount: document.getElementById('tx-account'),
  txToAccount: document.getElementById('tx-to-account'),
  txCategory: document.getElementById('tx-category'),
  txDescription: document.getElementById('tx-description'),
  groupTxCategory: document.getElementById('group-tx-category'),
  groupTxDestination: document.getElementById('group-tx-destination'),
  labelTxAccount: document.getElementById('label-tx-account'),
  modalTxTitle: document.getElementById('transaction-modal-title'),
  
  // Modale Conto
  modalAcc: document.getElementById('modal-account'),
  formAcc: document.getElementById('account-form'),
  accId: document.getElementById('acc-id'),
  accName: document.getElementById('acc-name'),
  accBalance: document.getElementById('acc-balance'),
  accColor: document.getElementById('acc-color'),
  accIcon: document.getElementById('acc-icon'),
  accDeleteBtn: document.getElementById('acc-delete-btn'),
  modalAccTitle: document.getElementById('account-modal-title'),
  
  // Modale Categoria
  modalCat: document.getElementById('modal-category'),
  formCat: document.getElementById('category-form'),
  catId: document.getElementById('cat-id'),
  catType: document.getElementById('cat-type'),
  catName: document.getElementById('cat-name'),
  catBudget: document.getElementById('cat-budget'),
  catColor: document.getElementById('cat-color'),
  catIconInput: document.getElementById('cat-icon'),
  catDeleteBtn: document.getElementById('cat-delete-btn'),
  modalCatTitle: document.getElementById('category-modal-title'),
  groupCatBudget: document.getElementById('group-cat-budget'),
  emojiPickerContainer: document.getElementById('emoji-picker-container'),

  // Dashboard Cassetti
  cassettiIncomes: document.getElementById('cassetti-incomes'),
  cassettiExpenses: document.getElementById('cassetti-expenses'),

  // Modale Calcolatrice
  modalCalc: document.getElementById('modal-calculator'),
  calcDisplay: document.getElementById('calc-display'),
  calcAccount: document.getElementById('calc-account'),
  calcToAccount: document.getElementById('calc-to-account'),
  calcDate: document.getElementById('calc-date'),
  calcNotes: document.getElementById('calc-notes'),
  formCalculator: document.getElementById('calculator-form'),
  groupCalcDestination: document.getElementById('group-calc-destination'),
  calcModalTitle: document.getElementById('calc-modal-title')
};

// Mappa icone per conti e categorie
const ICON_MAPPING = {
  wallet: 'wallet',
  cash: 'banknote',
  card: 'credit-card',
  'piggy-bank': 'piggy-bank',
  bank: 'landmark',
  briefcase: 'briefcase',
  home: 'home',
  food: 'shopping-bag',
  car: 'car',
  game: 'gamepad-2',
  lightning: 'zap',
  heart: 'heart',
  shopping: 'shopping-cart',
  'trend-up': 'trending-up',
  gift: 'gift',
  dot: 'circle'
};

// Emojis per la scelta nelle categorie (Emoji Picker)
const CURATED_EMOJIS = [
  '💵', '💰', '💳', '📊', '💼', '📈', '📉', '🪙', '💸', '🏦',
  '🍔', '🍕', '🍺', '☕', '🛒', '🍎', '🍣', '🍦', '🍩', '🥗',
  '🚗', '✈️', '🚄', '🛵', '🚲', '⛽', '🏨', '🗺️', '🎫',
  '🏠', '⚡', '🔌', '💧', '📶', '🛋️', '🔑', '🧹', '📦',
  '🎮', '📚', '🎭', '🎬', '🎵', '🍿', '🎨', '🎳', '🎸',
  '💇', '🩺', '💊', '⚽', '🏋️', '🏃', '🧘', '🚴', '❤️',
  '🛍️', '👕', '👠', '🕶️', '💄', '🎁', '💎', '📱',
  '↔️', '⭐', '🔥', '📅', '💬', '📎', '📌', '❓', '⚪'
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDatePicker();
  initEmojiPicker();
  setupEventListeners();
  updateGlobalUI();
});

// --- IMPOSIZIONE TEMA ---
function initTheme() {
  const savedTheme = db.settings.theme || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

// --- SETUP SELETTORE DATA GLOBALE ---
function initDatePicker() {
  // Imposta valore iniziale AAAA-MM
  const monthStr = String(state.selectedMonth + 1).padStart(2, '0');
  DOM.globalDate.value = `${state.selectedYear}-${monthStr}`;
}

// --- COLLEGAMENTO EVENTI ---
function setupEventListeners() {
  // Cambio scheda Sidebar
  DOM.menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      switchTab(target);
    });
  });

  // Collegamenti interni (es. "Vedi tutte" della dashboard)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('show-all-tx-link')) {
      switchTab('transactions');
    }
    if (e.target.classList.contains('show-all-budgets-link')) {
      switchTab('budgets');
    }
  });

  // Cambio Data Globale
  DOM.globalDate.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val) {
      const [year, month] = val.split('-');
      state.selectedYear = parseInt(year);
      state.selectedMonth = parseInt(month) - 1; // 0-indexed
      updateGlobalUI();
    }
  });

  // Toggle Tema
  DOM.themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const newTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    db.settings.theme = newTheme;
    db.save();
    
    // Forza il rinfresco dei grafici per i nuovi colori
    if (state.categoryChart) {
      state.categoryChart.destroy();
      state.categoryChart = null;
    }
    if (state.trendChart) {
      state.trendChart.destroy();
      state.trendChart = null;
    }
    renderDashboard();
  });

  // Apertura modali rapida
  if (DOM.quickAddBtn) DOM.quickAddBtn.addEventListener('click', () => openTransactionModal());
  DOM.addAccountTrigger.addEventListener('click', () => openAccountModal());
  
  document.querySelectorAll('.new-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      openCategoryModal(null, type);
    });
  });

  // Chiusura modali
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Chiusura cliccando fuori
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Scelta tipo transazione nel modale (cambia layout form)
  DOM.txTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      adjustTxModalForm(e.target.value);
    });
  });

  // Invio dei moduli
  DOM.formTx.addEventListener('submit', handleTxSubmit);
  DOM.formAcc.addEventListener('submit', handleAccSubmit);
  DOM.formCat.addEventListener('submit', handleCatSubmit);

  // Eliminazione da modali
  DOM.accDeleteBtn.addEventListener('click', handleAccDelete);
  DOM.catDeleteBtn.addEventListener('click', handleCatDelete);

  // Filtri Transazioni
  DOM.filterSearch.addEventListener('input', renderTransactions);
  DOM.filterType.addEventListener('change', renderTransactions);
  DOM.filterAccount.addEventListener('change', renderTransactions);
  DOM.filterCategory.addEventListener('change', renderTransactions);

  // Tab della sezione Budget & Categorie
  DOM.categoryTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.categoryTabBtns.forEach(b => b.classList.remove('active'));
      DOM.categoryTabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Esportazione JSON
  DOM.exportBtn.addEventListener('click', () => {
    const dataStr = db.exportJSON();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `financial_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  });

  // Importazione JSON
  DOM.importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const contents = e.target.result;
      const success = db.importJSON(contents);
      if (success) {
        alert('Dati importati con successo!');
        initTheme();
        initDatePicker();
        updateGlobalUI();
      } else {
        alert('Errore durante l\'importazione. Il file potrebbe non essere valido.');
      }
    };
    reader.readAsText(file);
    // Pulisce l'input
    DOM.importFile.value = '';
  });

  // Ripristino dati predefiniti
  DOM.resetBtn.addEventListener('click', () => {
    if (confirm('Sei sicuro di voler cancellare TUTTE le transazioni e ripristinare i conti e le categorie predefinite? Questa azione non può essere annullata.')) {
      db.reset();
      initTheme();
      initDatePicker();
      updateGlobalUI();
      alert('Applicazione ripristinata con successo!');
    }
  });

  // Navigatore mese transazioni
  document.getElementById('tx-month-prev').addEventListener('click', () => {
    if (state.txMonth === 0) { state.txMonth = 11; state.txYear--; }
    else { state.txMonth--; }
    renderTransactions();
  });
  document.getElementById('tx-month-next').addEventListener('click', () => {
    const now = new Date();
    if (state.txYear === now.getFullYear() && state.txMonth === now.getMonth()) return;
    if (state.txMonth === 11) { state.txMonth = 0; state.txYear++; }
    else { state.txMonth++; }
    renderTransactions();
  });

  // Anteprima colore categoria in tempo reale
  const catColorInput = document.getElementById('cat-color');
  const catColorPreview = document.getElementById('cat-color-preview');
  if (catColorInput && catColorPreview) {
    catColorInput.addEventListener('input', () => {
      catColorPreview.style.backgroundColor = catColorInput.value;
    });
  }

  // Gestione tasti calcolatrice
  document.querySelectorAll('#modal-calculator .calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleCalculatorKeyPress(btn.getAttribute('data-val'));
    });
  });

  // Invio modulo calcolatrice
  DOM.formCalculator.addEventListener('submit', handleCalculatorSubmit);
}

// --- SPA TAB SWITCHING ---
function switchTab(tabName) {
  state.currentTab = tabName;
  
  // Attiva menu item
  DOM.menuItems.forEach(item => {
    if (item.getAttribute('data-target') === tabName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Attiva sezione di contenuto
  DOM.sections.forEach(section => {
    if (section.id === `section-${tabName}`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // Cambia titoli header
  const titleMap = {
    dashboard: { title: 'Dashboard', subtitle: 'Benvenuto nella tua panoramica finanziaria.' },
    transactions: { title: 'Transazioni', subtitle: 'Traccia ed esplora tutti i tuoi movimenti finanziari.' },
    accounts: { title: 'Conti', subtitle: 'Gestisci le tue banche, portafogli e carte.' },
    budgets: { title: 'Budget & Categorie', subtitle: 'Pianifica le tue spese e tieni sotto controllo le categorie.' },
    settings: { title: 'Impostazioni', subtitle: 'Configura la tua applicazione e gestisci i dati.' }
  };

  DOM.pageTitle.textContent = titleMap[tabName].title;
  DOM.headerSubtitle.textContent = titleMap[tabName].subtitle;

  // Renderizza la vista corrente
  renderCurrentView();
}

// --- UI UPDATER GLOBALE ---
function updateGlobalUI() {
  // Saldo Totale Globale
  const total = db.getTotalBalance();
  DOM.globalBalance.textContent = formatCurrency(total);
  DOM.globalBalance.className = `value ${total >= 0 ? '' : 'text-danger'}`;

  // Popola i menu a tendina nei modali e nei filtri
  populateDropdowns();

  // Rende la vista attiva
  renderCurrentView();
}

function renderCurrentView() {
  lucide.createIcons();
  
  if (state.currentTab === 'dashboard') {
    renderDashboard();
  } else if (state.currentTab === 'transactions') {
    renderTransactions();
  } else if (state.currentTab === 'accounts') {
    renderAccounts();
  } else if (state.currentTab === 'budgets') {
    renderBudgets();
  }
}

// --- HELPER DI FORMATTAZIONE ---
function formatCurrency(amount) {
  return amount.toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR'
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getIconHtml(iconKey) {
  const lucideName = ICON_MAPPING[iconKey];
  if (lucideName) {
    return `<i data-lucide="${lucideName}"></i>`;
  }
  // Se non c'è una corrispondenza con Lucide, assumiamo che sia un'emoji o stringa diretta
  return `<span class="emoji-icon">${iconKey}</span>`;
}

// --- POPOLAMENTO TENDINE ---
function populateDropdowns() {
  // Filtri Transazioni
  const filterAcc = DOM.filterAccount;
  const filterCat = DOM.filterCategory;
  
  const savedAccVal = filterAcc.value;
  const savedCatVal = filterCat.value;

  filterAcc.innerHTML = '<option value="all">Tutti i conti</option>';
  db.accounts.forEach(acc => {
    filterAcc.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
  });

  filterCat.innerHTML = '<option value="all">Tutte le categorie</option>';
  db.categories.forEach(cat => {
    const prefix = cat.type === 'expense' ? 'Spesa: ' : 'Entrata: ';
    filterCat.innerHTML += `<option value="${cat.id}">${prefix}${cat.name}</option>`;
  });

  filterAcc.value = savedAccVal || 'all';
  filterCat.value = savedCatVal || 'all';

  // Modale Transazione (Seleziona conti)
  const modalAcc = DOM.txAccount;
  const modalToAcc = DOM.txToAccount;
  const modalCat = DOM.txCategory;

  modalAcc.innerHTML = '';
  modalToAcc.innerHTML = '';
  db.accounts.forEach(acc => {
    modalAcc.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
    modalToAcc.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
  });

  modalCat.innerHTML = '';
  db.categories.forEach(cat => {
    modalCat.innerHTML += `<option value="${cat.id}" data-type="${cat.type}">${cat.name}</option>`;
  });

  // Modale Calcolatrice (Seleziona conti)
  const calcAcc = DOM.calcAccount;
  const calcToAcc = DOM.calcToAccount;
  if (calcAcc && calcToAcc) {
    calcAcc.innerHTML = '';
    calcToAcc.innerHTML = '';
    db.accounts.forEach(acc => {
      calcAcc.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
      calcToAcc.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
    });
  }
}

// --- 1. RENDER DASHBOARD ---
function renderDashboard() {
  const summary = db.getMonthlySummary(state.selectedYear, state.selectedMonth);
  
  // Renderizza i cassetti di registrazione rapida
  renderCategoryDrawers();
  
  DOM.dashIncome.textContent = formatCurrency(summary.income);
  DOM.dashExpense.textContent = formatCurrency(summary.expense);
  DOM.dashSavings.textContent = formatCurrency(summary.savings);
  
  // Colore del risparmio
  if (summary.savings < 0) {
    DOM.dashSavings.className = 'card-value text-danger';
  } else if (summary.savings > 0) {
    DOM.dashSavings.className = 'card-value text-success';
  } else {
    DOM.dashSavings.className = 'card-value';
  }

  // --- RENDERING GRAFICI ---
  const expensesByCat = db.getExpensesByCategory(state.selectedYear, state.selectedMonth);
  state.categoryChart = updateCategoryChart(
    state.categoryChart,
    'chart-categories',
    'chart-no-data-categories',
    expensesByCat,
    db.categories
  );

  state.trendChart = updateTrendChart(
    state.trendChart,
    'chart-trend',
    'chart-no-data-trend',
    db.transactions,
    state.selectedYear,
    state.selectedMonth
  );

  // --- TRANSAZIONI RECENTI ---
  DOM.recentTxList.innerHTML = '';
  // Filtra transazioni nel mese corrente
  const currentMonthTxs = db.transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === state.selectedYear && tDate.getMonth() === state.selectedMonth;
  });

  // Prendi le ultime 5
  const recent = currentMonthTxs.slice(0, 5);

  if (recent.length === 0) {
    DOM.recentTxList.innerHTML = `
      <div class="empty-state-placeholder" style="padding: 20px 0;">
        <i data-lucide="info" style="width: 32px; height: 32px;"></i>
        <p>Nessun movimento inserito questo mese.</p>
      </div>`;
  } else {
    recent.forEach(t => {
      let iconWrapper = '';
      let descMeta = '';
      let amountClass = 'tx-amount';
      let amountPrefix = '';

      if (t.type === 'transfer') {
        const fromAcc = db.accounts.find(a => a.id === t.accountId);
        const toAcc = db.accounts.find(a => a.id === t.toAccountId);
        
        iconWrapper = `<div class="transfer-icon-bg"><i data-lucide="arrow-left-right"></i></div>`;
        descMeta = `<span>${fromAcc ? fromAcc.name : 'Eliminato'}</span> <i data-lucide="arrow-right" style="width: 10px; height: 10px; margin: 0 4px;"></i> <span>${toAcc ? toAcc.name : 'Eliminato'}</span>`;
        amountPrefix = '';
      } else {
        const cat = db.categories.find(c => c.id === t.category);
        const acc = db.accounts.find(a => a.id === t.accountId);
        
        const catColor = cat ? cat.color : '#6b7280';
        const catIcon = cat ? cat.icon : 'dot';
        
        iconWrapper = `
          <div class="category-icon-wrapper" style="background-color: ${catColor}">
            ${getIconHtml(catIcon)}
          </div>`;
        
        descMeta = `<span>${acc ? acc.name : 'Conto eliminato'}</span>`;
        if (t.type === 'expense') {
          amountClass += ' text-danger';
          amountPrefix = '-';
        } else {
          amountClass += ' text-success';
          amountPrefix = '+';
        }
      }

      DOM.recentTxList.innerHTML += `
        <div class="transaction-row" data-id="${t.id}">
          <div class="tx-info">
            ${iconWrapper}
            <div class="tx-details">
              <span class="tx-desc">${t.description || 'Senza descrizione'}</span>
              <div class="tx-meta">
                ${descMeta}
                <div class="separator"></div>
                <span>${formatDate(t.date)}</span>
              </div>
            </div>
          </div>
          <div class="tx-amount-col">
            <span class="${amountClass}">${amountPrefix}${formatCurrency(t.amount)}</span>
          </div>
        </div>`;
    });

    // Aggiungi click listener per aprire la modifica
    DOM.recentTxList.querySelectorAll('.transaction-row').forEach(row => {
      row.addEventListener('click', () => {
        openTransactionModal(row.getAttribute('data-id'));
      });
    });
  }

  // --- STATO DEI BUDGET ---
  DOM.dashBudgetsList.innerHTML = '';
  // Filtra categorie con budget impostato
  const expenseCatsWithBudget = db.categories.filter(c => c.type === 'expense' && c.budget !== null);

  if (expenseCatsWithBudget.length === 0) {
    DOM.dashBudgetsList.innerHTML = `
      <div class="empty-state-placeholder" style="padding: 20px 0;">
        <i data-lucide="pie-chart" style="width: 32px; height: 32px;"></i>
        <p>Nessun budget configurato. Impostalo nella sezione Categorie.</p>
      </div>`;
  } else {
    expenseCatsWithBudget.forEach(cat => {
      const usage = db.getCategoryBudgetUsage(cat.id, state.selectedYear, state.selectedMonth);
      if (!usage) return;

      let fillClass = 'progress-bar-fill';
      let progressColor = cat.color;

      if (usage.percent >= 100) {
        progressColor = 'var(--danger)';
      } else if (usage.percent >= 80) {
        progressColor = 'var(--warning)';
      }

      DOM.dashBudgetsList.innerHTML += `
        <div class="budget-progress-item">
          <div class="budget-info">
            <span class="budget-label">
              <span class="budget-color-dot" style="background-color: ${cat.color}"></span>
              <span>${cat.name}</span>
            </span>
            <span class="budget-limits">
              <span>${formatCurrency(usage.spent)}</span> / ${formatCurrency(usage.budget)}
            </span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${usage.percent}%; background-color: ${progressColor}"></div>
          </div>
        </div>`;
    });
  }

  lucide.createIcons();
}

// --- 2. RENDER TRANSAZIONI ---
function renderTransactions() {
  // Aggiorna label mese
  const monthLabel = document.getElementById('tx-month-label');
  if (monthLabel) {
    const d = new Date(state.txYear, state.txMonth, 1);
    monthLabel.textContent = d.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }
  // Disabilita freccia avanti se siamo nel mese corrente
  const now = new Date();
  const nextBtn = document.getElementById('tx-month-next');
  if (nextBtn) {
    const isCurrentMonth = state.txYear === now.getFullYear() && state.txMonth === now.getMonth();
    nextBtn.disabled = isCurrentMonth;
    nextBtn.style.opacity = isCurrentMonth ? '0.35' : '';
  }

  const query = DOM.filterSearch.value.toLowerCase();
  const typeFilter = DOM.filterType.value;
  const accFilter = DOM.filterAccount.value;
  const catFilter = DOM.filterCategory.value;

  // Filtra l'elenco delle transazioni per mese selezionato + altri filtri
  const filtered = db.transactions.filter(t => {
    const tDate = new Date(t.date);
    const matchMonth = tDate.getFullYear() === state.txYear && tDate.getMonth() === state.txMonth;
    const matchQuery = t.description.toLowerCase().includes(query);
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchAcc = accFilter === 'all' || t.accountId === accFilter || (t.type === 'transfer' && t.toAccountId === accFilter);
    const matchCat = catFilter === 'all' || t.category === catFilter;
    return matchMonth && matchQuery && matchType && matchAcc && matchCat;
  });

  DOM.txTableBody.innerHTML = '';

  if (filtered.length === 0) {
    DOM.txPlaceholder.classList.remove('hidden');
    document.getElementById('transactions-table').classList.add('hidden');
  } else {
    DOM.txPlaceholder.classList.add('hidden');
    document.getElementById('transactions-table').classList.remove('hidden');

    filtered.forEach(t => {
      let catCell = '';
      let accCell = '';
      let amountClass = '';
      let amountPrefix = '';

      // Gestione conto
      const acc = db.accounts.find(a => a.id === t.accountId);
      if (t.type === 'transfer') {
        const toAcc = db.accounts.find(a => a.id === t.toAccountId);
        accCell = `
          <div style="display:flex; align-items:center; gap: 4px;">
            <span>${acc ? acc.name : 'Eliminato'}</span>
            <i data-lucide="arrow-right" style="width: 12px; height: 12px;"></i>
            <span>${toAcc ? toAcc.name : 'Eliminato'}</span>
          </div>`;
        catCell = `<span class="text-muted">Giroconto</span>`;
        amountPrefix = '';
        amountClass = 'text-main';
      } else {
        accCell = acc ? acc.name : '<span class="text-muted">Conto eliminato</span>';
        
        const cat = db.categories.find(c => c.id === t.category);
        if (cat) {
          catCell = `
            <div style="display:flex; align-items:center; gap: 8px;">
              <span class="budget-color-dot" style="background-color: ${cat.color}"></span>
              <span>${cat.name}</span>
            </div>`;
        } else {
          catCell = '<span class="text-muted">Nessuna categoria</span>';
        }

        if (t.type === 'expense') {
          amountClass = 'text-danger';
          amountPrefix = '-';
        } else {
          amountClass = 'text-success';
          amountPrefix = '+';
        }
      }

      DOM.txTableBody.innerHTML += `
        <tr data-id="${t.id}">
          <td style="font-weight: 500;">${formatDate(t.date)}</td>
          <td style="font-weight: 600;">${t.description || 'Senza descrizione'}</td>
          <td>${catCell}</td>
          <td>${accCell}</td>
          <td class="text-right ${amountClass}" style="font-weight: 700;">
            ${amountPrefix}${formatCurrency(t.amount)}
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-icon btn-edit" title="Modifica" data-id="${t.id}">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-icon btn-delete" title="Elimina" data-id="${t.id}">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>`;
    });

    // Eventi pulsanti tabella
    DOM.txTableBody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTransactionModal(btn.getAttribute('data-id'));
      });
    });

    DOM.txTableBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('Sei sicuro di voler eliminare questa transazione?')) {
          db.deleteTransaction(id);
          updateGlobalUI();
        }
      });
    });
  }

  lucide.createIcons();
}

// --- 3. RENDER CONTI ---
function renderAccounts() {
  // Pulisce tutto tranne l'ultimo elemento ("Aggiungi Conto")
  const triggers = DOM.accountsGrid.querySelectorAll('.add-account-card');
  DOM.accountsGrid.innerHTML = '';
  
  db.accounts.forEach(acc => {
    const computedBalance = db.getAccountBalance(acc.id);
    const balanceClass = computedBalance >= 0 ? '' : 'text-danger';
    const isPreferred = db.settings.preferredAccountId === acc.id;
    const preferredBadge = isPreferred
      ? `<span style="font-size: 0.72rem; font-weight: 600; color: var(--accent); background: rgba(99,102,241,0.12); border-radius: 6px; padding: 2px 7px; margin-top: 3px; display: inline-block;">⭐ Preferito</span>`
      : '';
    
    DOM.accountsGrid.innerHTML += `
      <div class="account-card" data-id="${acc.id}" style="--acc-color: ${acc.color}">
        <div class="acc-card-header">
          <div>
            <h3>${acc.name}</h3>
            <span class="text-muted" style="font-size: 0.8rem; font-weight:500;">Saldo iniziale: ${formatCurrency(acc.balance)}</span>
            ${preferredBadge}
          </div>
          <div class="acc-icon-box" style="background-color: ${acc.color}">
            ${getIconHtml(acc.icon)}
          </div>
        </div>
        <div class="acc-card-balance">
          <span class="label">Saldo Attuale</span>
          <span class="value ${balanceClass}">${formatCurrency(computedBalance)}</span>
        </div>
      </div>`;
  });

  // Riaggiunge il trigger per la creazione
  DOM.accountsGrid.appendChild(triggers[0]);

  // Click sulle card dei conti per la modifica
  DOM.accountsGrid.querySelectorAll('.account-card').forEach(card => {
    if (!card.classList.contains('add-account-card')) {
      card.addEventListener('click', () => {
        openAccountModal(card.getAttribute('data-id'));
      });
    }
  });

  lucide.createIcons();
}

// --- 4. RENDER BUDGET & CATEGORIE ---
function renderBudgets() {
  DOM.expenseCategoriesGrid.innerHTML = '';
  DOM.incomeCategoriesGrid.innerHTML = '';

  const expenses = db.categories.filter(c => c.type === 'expense');
  const incomes = db.categories.filter(c => c.type === 'income');

  // Spese
  expenses.forEach(cat => {
    let budgetHtml = '';
    const usage = db.getCategoryBudgetUsage(cat.id, state.selectedYear, state.selectedMonth);

    if (cat.budget !== null && usage) {
      let progressColor = cat.color;
      if (usage.percent >= 100) {
        progressColor = 'var(--danger)';
      } else if (usage.percent >= 80) {
        progressColor = 'var(--warning)';
      }

      budgetHtml = `
        <div class="budget-progress-item" style="margin-top: 10px;">
          <div class="budget-info">
            <span class="text-muted">Progresso budget</span>
            <span class="budget-limits">
              <span>${formatCurrency(usage.spent)}</span> / ${formatCurrency(usage.budget)}
            </span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${usage.percent}%; background-color: ${progressColor}"></div>
          </div>
        </div>`;
    } else {
      budgetHtml = `<p class="text-muted" style="font-size: 0.8rem; margin-top: auto;">Nessun limite di budget mensile impostato.</p>`;
    }

    DOM.expenseCategoriesGrid.innerHTML += `
      <div class="category-budget-card" data-id="${cat.id}">
        <div class="category-card-top">
          <div class="cat-info-block">
            <div class="category-icon-wrapper" style="background-color: ${cat.color}">
              ${getIconHtml(cat.icon)}
            </div>
            <h4>${cat.name}</h4>
          </div>
          <span class="cat-action-hint">Clicca per modificare</span>
        </div>
        ${budgetHtml}
      </div>`;
  });

  // Entrate
  incomes.forEach(cat => {
    DOM.incomeCategoriesGrid.innerHTML += `
      <div class="category-budget-card" data-id="${cat.id}">
        <div class="category-card-top">
          <div class="cat-info-block">
            <div class="category-icon-wrapper" style="background-color: ${cat.color}">
              ${getIconHtml(cat.icon)}
            </div>
            <h4>${cat.name}</h4>
          </div>
          <span class="cat-action-hint">Clicca per modificare</span>
        </div>
      </div>`;
  });

  // Click su categorie per la modifica
  document.querySelectorAll('.category-budget-card').forEach(card => {
    card.addEventListener('click', () => {
      openCategoryModal(card.getAttribute('data-id'));
    });
  });

  lucide.createIcons();
}

// --- GESTIONE MODALI ---

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.classList.remove('open');
  });
}

// --- MODALE TRANSAZIONE ---
function openTransactionModal(editTxId = null) {
  DOM.formTx.reset();
  
  if (editTxId) {
    const tx = db.transactions.find(t => t.id === editTxId);
    if (!tx) return;
    
    DOM.modalTxTitle.textContent = 'Modifica Transazione';
    DOM.txId.value = tx.id;
    DOM.txAmount.value = tx.amount;
    DOM.txDate.value = tx.date;
    DOM.txAccount.value = tx.accountId;
    DOM.txDescription.value = tx.description;

    // Seleziona radio button corretto
    DOM.txTypeRadios.forEach(radio => {
      if (radio.value === tx.type) {
        radio.checked = true;
      }
    });

    adjustTxModalForm(tx.type);
    
    if (tx.type === 'transfer') {
      DOM.txToAccount.value = tx.toAccountId;
    } else {
      DOM.txCategory.value = tx.category;
    }
  } else {
    DOM.modalTxTitle.textContent = 'Nuova Transazione';
    DOM.txId.value = '';
    
    // Imposta data corrente
    DOM.txDate.value = new Date().toISOString().split('T')[0];
    
    // Preseleziona il conto preferito
    const preferredId = db.getPreferredAccountId();
    if (preferredId) DOM.txAccount.value = preferredId;

    // Tipo predefinito
    document.getElementById('type-expense').checked = true;
    adjustTxModalForm('expense');
  }

  DOM.modalTx.classList.add('open');
  lucide.createIcons();
}

function adjustTxModalForm(type) {
  // Filtra categorie visualizzate nel modale a seconda del tipo
  const selectCat = DOM.txCategory;
  const options = selectCat.querySelectorAll('option');
  
  let firstMatch = null;
  options.forEach(opt => {
    const catType = opt.getAttribute('data-type');
    if (catType === type) {
      opt.style.display = '';
      if (!firstMatch) firstMatch = opt.value;
    } else {
      opt.style.display = 'none';
    }
  });

  if (type === 'transfer') {
    DOM.groupTxCategory.style.display = 'none';
    DOM.groupTxDestination.style.display = '';
    DOM.labelTxAccount.textContent = 'Conto di Origine *';
    DOM.txCategory.removeAttribute('required');
    DOM.txToAccount.setAttribute('required', 'required');
  } else {
    DOM.groupTxCategory.style.display = '';
    DOM.groupTxDestination.style.display = 'none';
    DOM.labelTxAccount.textContent = 'Conto *';
    DOM.txCategory.setAttribute('required', 'required');
    DOM.txToAccount.removeAttribute('required');
    
    if (firstMatch) selectCat.value = firstMatch;
  }
}

function handleTxSubmit(e) {
  e.preventDefault();
  
  const id = DOM.txId.value;
  const type = Array.from(DOM.txTypeRadios).find(r => r.checked).value;
  const amount = parseFloat(DOM.txAmount.value);
  const date = DOM.txDate.value;
  const accountId = DOM.txAccount.value;
  const description = DOM.txDescription.value;
  
  const txData = {
    type,
    amount,
    date,
    accountId,
    description
  };

  if (type === 'transfer') {
    txData.toAccountId = DOM.txToAccount.value;
    if (txData.accountId === txData.toAccountId) {
      alert('Il conto di origine e di destinazione devono essere diversi.');
      return;
    }
  } else {
    txData.category = DOM.txCategory.value;
  }

  if (id) {
    db.updateTransaction(id, txData);
  } else {
    db.addTransaction(txData);
  }

  closeAllModals();
  updateGlobalUI();
}

// --- MODALE CONTO ---
function openAccountModal(editAccId = null) {
  DOM.formAcc.reset();

  if (editAccId) {
    const acc = db.accounts.find(a => a.id === editAccId);
    if (!acc) return;

    DOM.modalAccTitle.textContent = 'Modifica Conto';
    DOM.accId.value = acc.id;
    DOM.accName.value = acc.name;
    DOM.accBalance.value = acc.balance;
    DOM.accColor.value = acc.color;
    DOM.accIcon.value = acc.icon;
    DOM.accDeleteBtn.classList.remove('hidden');
    // Imposta checkbox preferito
    const prefCheckbox = document.getElementById('acc-preferred');
    if (prefCheckbox) prefCheckbox.checked = db.settings.preferredAccountId === acc.id;
  } else {
    DOM.modalAccTitle.textContent = 'Aggiungi Conto';
    DOM.accId.value = '';
    DOM.accColor.value = '#3b82f6';
    DOM.accIcon.value = 'wallet';
    DOM.accDeleteBtn.classList.add('hidden');
    const prefCheckbox = document.getElementById('acc-preferred');
    if (prefCheckbox) prefCheckbox.checked = false;
  }

  DOM.modalAcc.classList.add('open');
  lucide.createIcons();
}

function handleAccSubmit(e) {
  e.preventDefault();

  const id = DOM.accId.value;
  const accData = {
    name: DOM.accName.value,
    balance: parseFloat(DOM.accBalance.value),
    color: DOM.accColor.value,
    icon: DOM.accIcon.value
  };

  let savedId = id;
  if (id) {
    db.updateAccount(id, accData);
  } else {
    const newAcc = db.addAccount(accData);
    savedId = newAcc.id;
  }

  // Gestisce la checkbox conto preferito
  const prefCheckbox = document.getElementById('acc-preferred');
  if (prefCheckbox) {
    if (prefCheckbox.checked) {
      db.setPreferredAccount(savedId);
    } else if (db.settings.preferredAccountId === savedId) {
      // Se era preferito e viene deselezionato, rimuovi preferenza
      db.setPreferredAccount(null);
    }
  }

  closeAllModals();
  updateGlobalUI();
}

function handleAccDelete() {
  const id = DOM.accId.value;
  if (!id) return;

  if (confirm('Sei sicuro di voler eliminare questo conto? Attenzione: TUTTE le transazioni associate verranno eliminate permanentemente.')) {
    db.deleteAccount(id);
    closeAllModals();
    updateGlobalUI();
  }
}

// --- MODALE CATEGORIA ---
function openCategoryModal(editCatId = null, type = 'expense') {
  DOM.formCat.reset();

  if (editCatId) {
    const cat = db.categories.find(c => c.id === editCatId);
    if (!cat) return;

    DOM.modalCatTitle.textContent = cat.type === 'expense' ? 'Modifica Categoria Spesa' : 'Modifica Categoria Entrata';
    DOM.catId.value = cat.id;
    DOM.catType.value = cat.type;
    DOM.catName.value = cat.name;
    DOM.catColor.value = cat.color;
    DOM.catIconInput.value = cat.icon || 'dot';
    selectEmoji(cat.icon || 'dot');
    
    if (cat.type === 'expense') {
      DOM.groupCatBudget.style.display = '';
      DOM.catBudget.value = cat.budget !== null ? cat.budget : '';
    } else {
      DOM.groupCatBudget.style.display = 'none';
      DOM.catBudget.value = '';
    }
    
    DOM.catDeleteBtn.classList.remove('hidden');
  } else {
    DOM.modalCatTitle.textContent = type === 'expense' ? 'Aggiungi Categoria Spesa' : 'Aggiungi Categoria Entrata';
    DOM.catId.value = '';
    DOM.catType.value = type;
    DOM.catColor.value = type === 'expense' ? '#ef4444' : '#10b981';
    DOM.catIconInput.value = '⚪';
    selectEmoji('⚪');
    DOM.catDeleteBtn.classList.add('hidden');

    if (type === 'expense') {
      DOM.groupCatBudget.style.display = '';
    } else {
      DOM.groupCatBudget.style.display = 'none';
    }
  }

  DOM.modalCat.classList.add('open');
  // Sincronizza la preview del colore
  const preview = document.getElementById('cat-color-preview');
  if (preview) preview.style.backgroundColor = DOM.catColor.value;
  lucide.createIcons();
}

function handleCatSubmit(e) {
  e.preventDefault();

  const id = DOM.catId.value;
  const type = DOM.catType.value;
  
  const catData = {
    name: DOM.catName.value,
    type,
    color: DOM.catColor.value,
    icon: DOM.catIconInput.value
  };

  if (type === 'expense') {
    const budgetVal = DOM.catBudget.value;
    catData.budget = budgetVal ? parseInt(budgetVal) : null;
  }

  if (id) {
    db.updateCategory(id, catData);
  } else {
    db.addCategory(catData);
  }

  closeAllModals();
  updateGlobalUI();
}

function handleCatDelete() {
  const id = DOM.catId.value;
  if (!id) return;

  if (confirm('Sei sicuro di voler eliminare questa categoria? Le transazioni associate NON verranno eliminate, ma impostate a "nessuna categoria".')) {
    db.deleteCategory(id);
    closeAllModals();
    updateGlobalUI();
  }
}

// --- EMOJI PICKER LOGICA ---
function initEmojiPicker() {
  if (!DOM.emojiPickerContainer) return;
  DOM.emojiPickerContainer.innerHTML = '';
  CURATED_EMOJIS.forEach(emoji => {
    const opt = document.createElement('div');
    opt.className = 'emoji-option';
    opt.textContent = emoji;
    opt.setAttribute('data-emoji', emoji);
    opt.addEventListener('click', () => {
      selectEmoji(emoji);
    });
    DOM.emojiPickerContainer.appendChild(opt);
  });
}

function selectEmoji(emoji) {
  DOM.catIconInput.value = emoji;
  if (!DOM.emojiPickerContainer) return;
  DOM.emojiPickerContainer.querySelectorAll('.emoji-option').forEach(opt => {
    if (opt.getAttribute('data-emoji') === emoji) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });
}

// --- CASSETTI CATEGORIE (DASHBOARD) ---
function renderCategoryDrawers() {
  if (!DOM.cassettiIncomes || !DOM.cassettiExpenses) return;
  
  DOM.cassettiIncomes.innerHTML = '';
  DOM.cassettiExpenses.innerHTML = '';

  const incomes = db.categories.filter(c => c.type === 'income');
  const expenses = db.categories.filter(c => c.type === 'expense');

  // Disegna entrate
  incomes.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'cassetto-card income-cassetto';
    card.setAttribute('data-id', cat.id);
    card.innerHTML = `
      <div class="cassetto-icon-box" style="background-color: ${cat.color}">
        ${getIconHtml(cat.icon)}
      </div>
      <div class="cassetto-name">${cat.name}</div>
    `;
    card.addEventListener('click', () => {
      openCalculatorModal(cat.id);
    });
    DOM.cassettiIncomes.appendChild(card);
  });

  // Disegna uscite
  expenses.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'cassetto-card expense-cassetto';
    card.setAttribute('data-id', cat.id);
    card.innerHTML = `
      <div class="cassetto-icon-box" style="background-color: ${cat.color}">
        ${getIconHtml(cat.icon)}
      </div>
      <div class="cassetto-name">${cat.name}</div>
    `;
    card.addEventListener('click', () => {
      openCalculatorModal(cat.id);
    });
    DOM.cassettiExpenses.appendChild(card);
  });

  // Disegna cassetto Giroconto (Trasferimento) in fondo alle uscite
  const transferCard = document.createElement('div');
  transferCard.className = 'cassetto-card transfer-cassetto';
  transferCard.innerHTML = `
    <div class="cassetto-icon-box" style="background-color: var(--info)">
      <i data-lucide="arrow-left-right"></i>
    </div>
    <div class="cassetto-name">Trasferimento</div>
  `;
  transferCard.addEventListener('click', () => {
    openCalculatorModal('transfer');
  });
  DOM.cassettiExpenses.appendChild(transferCard);

  lucide.createIcons();
}

// --- MODALE CALCOLATRICE E LOGICA ARITMETICA ---
function openCalculatorModal(categoryId) {
  // Resetta i dati
  state.calculator.display = '0';
  state.calculator.isResult = false;
  state.calculator.selectedCategory = categoryId;
  DOM.calcDisplay.textContent = '0';
  DOM.calcNotes.value = '';
  DOM.calcDate.value = new Date().toISOString().split('T')[0];

  // Popola i conti aggiornati
  const calcAcc = DOM.calcAccount;
  const calcToAcc = DOM.calcToAccount;
  if (calcAcc && calcToAcc) {
    calcAcc.innerHTML = '';
    calcToAcc.innerHTML = '';
    db.accounts.forEach(acc => {
      calcAcc.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
      calcToAcc.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
    });
    // Preseleziona il conto preferito
    const preferredId = db.getPreferredAccountId();
    if (preferredId) calcAcc.value = preferredId;
  }

  if (categoryId === 'transfer') {
    DOM.calcModalTitle.textContent = 'Giroconto / Trasferimento';
    DOM.groupCalcDestination.style.display = '';
  } else {
    const cat = db.categories.find(c => c.id === categoryId);
    DOM.calcModalTitle.textContent = cat ? `Registra ${cat.name}` : 'Registra Movimento';
    DOM.groupCalcDestination.style.display = 'none';
  }

  // Apri il modale calcolatrice
  DOM.modalCalc.classList.add('open');
}

function handleCalculatorKeyPress(val) {
  const calc = state.calculator;
  const display = DOM.calcDisplay;

  if (val === 'C') {
    calc.display = '0';
    calc.isResult = false;
  } else if (val === '=') {
    evaluateCalculatorExpression();
  } else if (['+', '-', '*'].includes(val)) {
    calc.isResult = false;
    const lastChar = calc.display.slice(-1);
    if (['+', '-', '*'].includes(lastChar)) {
      calc.display = calc.display.slice(0, -1) + val;
    } else {
      calc.display += val;
    }
  } else if (val === '.') {
    if (calc.isResult) {
      calc.display = '0.';
      calc.isResult = false;
    } else {
      const parts = calc.display.split(/[+\-*]/);
      const lastOperand = parts[parts.length - 1];
      if (!lastOperand.includes('.')) {
        calc.display += '.';
      }
    }
  } else { // Numeri 0-9
    if (calc.display === '0' || calc.isResult) {
      calc.display = val;
      calc.isResult = false;
    } else {
      calc.display += val;
    }
  }

  display.textContent = calc.display.replace(/\*/g, '×');
}

function evaluateCalculatorExpression() {
  const calc = state.calculator;
  try {
    let cleanExpr = calc.display;
    const lastChar = cleanExpr.slice(-1);
    if (['+', '-', '*'].includes(lastChar)) {
      cleanExpr = cleanExpr.slice(0, -1);
    }

    if (/^[0-9.+\-*/\s]+$/.test(cleanExpr)) {
      const result = new Function(`return ${cleanExpr}`)();
      if (isNaN(result) || !isFinite(result)) {
        calc.display = '0';
      } else {
        // Arrotonda a 2 cifre decimali
        calc.display = String(Number(result.toFixed(2)));
      }
      calc.isResult = true;
    }
  } catch (e) {
    console.error('Errore espressione calcolatrice', e);
    calc.display = '0';
    calc.isResult = true;
  }
}

function handleCalculatorSubmit(e) {
  e.preventDefault();

  evaluateCalculatorExpression();
  const amount = parseFloat(state.calculator.display);

  if (isNaN(amount) || amount <= 0) {
    alert('Inserisci un importo valido e positivo.');
    return;
  }

  const accountId = DOM.calcAccount.value;
  const date = DOM.calcDate.value;
  const notes = DOM.calcNotes.value;
  const selectedCat = state.calculator.selectedCategory;

  let txData = {
    amount,
    date,
    accountId,
    description: notes
  };

  if (selectedCat === 'transfer') {
    txData.type = 'transfer';
    txData.toAccountId = DOM.calcToAccount.value;
    if (txData.accountId === txData.toAccountId) {
      alert('Il conto di origine e di destinazione devono essere diversi.');
      return;
    }
  } else {
    const cat = db.categories.find(c => c.id === selectedCat);
    if (!cat) {
      alert('Categoria non valida.');
      return;
    }
    txData.type = cat.type;
    txData.category = selectedCat;
  }

  db.addTransaction(txData);

  closeAllModals();
  updateGlobalUI();
}
