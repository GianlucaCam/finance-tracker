// js/db.js

const DB_KEY = 'finance_tracker_data';

const DEFAULT_ACCOUNTS = [
  { id: 'acc_1', name: 'Conto Corrente', balance: 1500.00, color: '#3b82f6', icon: 'wallet' },
  { id: 'acc_2', name: 'Contanti', balance: 100.00, color: '#10b981', icon: 'cash' },
  { id: 'acc_3', name: 'Carta di Credito', balance: 0.00, color: '#f59e0b', icon: 'card' },
  { id: 'acc_4', name: 'Risparmi', balance: 5000.00, color: '#8b5cf6', icon: 'piggy-bank' }
];

const DEFAULT_CATEGORIES = [
  // Uscite (Expenses)
  { id: 'cat_1', name: 'Spesa & Cibo', type: 'expense', color: '#ef4444', icon: 'food', budget: 350 },
  { id: 'cat_2', name: 'Trasporti', type: 'expense', color: '#3b82f6', icon: 'car', budget: 100 },
  { id: 'cat_3', name: 'Intrattenimento', type: 'expense', color: '#a855f7', icon: 'game', budget: 150 },
  { id: 'cat_4', name: 'Bollette & Utenze', type: 'expense', color: '#eab308', icon: 'lightning', budget: 200 },
  { id: 'cat_5', name: 'Salute & Benessere', type: 'expense', color: '#10b981', icon: 'heart', budget: 80 },
  { id: 'cat_6', name: 'Casa', type: 'expense', color: '#f97316', icon: 'home', budget: 120 },
  { id: 'cat_7', name: 'Shopping', type: 'expense', color: '#ec4899', icon: 'shopping', budget: 150 },
  // Entrate (Incomes)
  { id: 'cat_8', name: 'Stipendio', type: 'income', color: '#10b981', icon: 'briefcase', budget: null },
  { id: 'cat_9', name: 'Investimenti', type: 'income', color: '#14b8a6', icon: 'trend-up', budget: null },
  { id: 'cat_10', name: 'Regali', type: 'income', color: '#f43f5e', icon: 'gift', budget: null },
  { id: 'cat_11', name: 'Altro', type: 'income', color: '#6b7280', icon: 'dot', budget: null }
];

function getOffsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

const DEFAULT_TRANSACTIONS = [
  { id: 'tx_1', type: 'income', amount: 1800.00, date: getOffsetDate(-5), category: 'cat_8', accountId: 'acc_1', description: 'Stipendio Mensile' },
  { id: 'tx_2', type: 'expense', amount: 54.20, date: getOffsetDate(-3), category: 'cat_1', accountId: 'acc_1', description: 'Spesa Supermercato' },
  { id: 'tx_3', type: 'expense', amount: 15.00, date: getOffsetDate(-2), category: 'cat_2', accountId: 'acc_2', description: 'Carburante Auto' },
  { id: 'tx_4', type: 'expense', amount: 42.00, date: getOffsetDate(-1), category: 'cat_3', accountId: 'acc_3', description: 'Cena Ristorante' },
  { id: 'tx_5', type: 'transfer', amount: 250.00, date: getOffsetDate(-1), category: null, accountId: 'acc_1', toAccountId: 'acc_4', description: 'Risparmio mensile' },
  { id: 'tx_6', type: 'expense', amount: 84.50, date: getOffsetDate(0), category: 'cat_4', accountId: 'acc_1', description: 'Bolletta Luce' }
];

class FinanceDB {
  constructor() {
    this.accounts = [];
    this.categories = [];
    this.transactions = [];
    this.settings = { currency: '€', theme: 'dark', preferredAccountId: null };
    this.load();
  }

  load() {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.accounts = parsed.accounts || [];
        this.categories = parsed.categories || [];
        this.transactions = parsed.transactions || [];
        this.settings = parsed.settings || { currency: '€', theme: 'dark' };
      } catch (e) {
        console.error('Errore nel parsing del database locale, caricamento dati predefiniti.', e);
        this.loadDefaults();
      }
    } else {
      this.loadDefaults();
    }
  }

  save() {
    const data = {
      accounts: this.accounts,
      categories: this.categories,
      transactions: this.transactions,
      settings: this.settings
    };
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  loadDefaults() {
    this.accounts = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
    this.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    this.transactions = JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS));
    this.settings = { currency: '€', theme: 'dark' };
    this.save();
  }

  setPreferredAccount(accountId) {
    this.settings.preferredAccountId = accountId || null;
    this.save();
  }

  getPreferredAccountId() {
    // Verifica che il conto preferito esista ancora
    if (this.settings.preferredAccountId) {
      const exists = this.accounts.find(a => a.id === this.settings.preferredAccountId);
      if (exists) return this.settings.preferredAccountId;
    }
    return this.accounts.length > 0 ? this.accounts[0].id : null;
  }

  reset() {
    this.loadDefaults();
  }

  // --- Calcolo Saldi ---
  
  getAccountBalance(accountId) {
    const account = this.accounts.find(a => a.id === accountId);
    if (!account) return 0;
    
    let balance = Number(account.balance); // Saldo iniziale
    
    this.transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'income' && t.accountId === accountId) {
        balance += amount;
      } else if (t.type === 'expense' && t.accountId === accountId) {
        balance -= amount;
      } else if (t.type === 'transfer') {
        if (t.accountId === accountId) {
          balance -= amount; // Esce dal conto sorgente
        }
        if (t.toAccountId === accountId) {
          balance += amount; // Entra nel conto destinazione
        }
      }
    });
    
    return balance;
  }

  getTotalBalance() {
    return this.accounts.reduce((total, acc) => {
      // Per le carte di credito, di solito il saldo è un debito (negativo), ma sommiamo semplicemente tutti i saldi correnti computed
      return total + this.getAccountBalance(acc.id);
    }, 0);
  }

  getMonthlySummary(year, month) {
    // month è 0-indexed (0 = Gennaio, 11 = Dicembre)
    let income = 0;
    let expense = 0;

    this.transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getFullYear() === year && tDate.getMonth() === month) {
        if (t.type === 'income') {
          income += Number(t.amount);
        } else if (t.type === 'expense') {
          expense += Number(t.amount);
        }
        // I trasferimenti tra conti non alterano entrate/uscite totali
      }
    });

    return { income, expense, savings: income - expense };
  }

  getExpensesByCategory(year, month) {
    const data = {};
    
    this.transactions.forEach(t => {
      if (t.type !== 'expense') return;
      
      const tDate = new Date(t.date);
      if (tDate.getFullYear() === year && tDate.getMonth() === month) {
        const catId = t.category || 'cat_11'; // 'Altro' di default
        data[catId] = (data[catId] || 0) + Number(t.amount);
      }
    });

    return data;
  }

  getCategoryBudgetUsage(catId, year, month) {
    const category = this.categories.find(c => c.id === catId);
    if (!category || category.budget === null) return null;

    let spent = 0;
    this.transactions.forEach(t => {
      if (t.type === 'expense' && t.category === catId) {
        const tDate = new Date(t.date);
        if (tDate.getFullYear() === year && tDate.getMonth() === month) {
          spent += Number(t.amount);
        }
      }
    });

    return {
      budget: Number(category.budget),
      spent: spent,
      percent: Math.min((spent / category.budget) * 100, 100)
    };
  }

  // --- Operazioni Transazioni ---
  
  addTransaction(tx) {
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type: tx.type, // 'income' | 'expense' | 'transfer'
      amount: Number(tx.amount),
      date: tx.date || new Date().toISOString().split('T')[0],
      category: tx.type === 'transfer' ? null : tx.category,
      accountId: tx.accountId,
      toAccountId: tx.type === 'transfer' ? tx.toAccountId : null,
      description: tx.description || ''
    };
    this.transactions.push(newTx);
    // Ordina transazioni per data decrescente
    this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.save();
    return newTx;
  }

  updateTransaction(id, updatedFields) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      const current = this.transactions[idx];
      const updated = {
        ...current,
        ...updatedFields,
        id, // Impedisce la sovrascrittura dell'id
        amount: Number(updatedFields.amount !== undefined ? updatedFields.amount : current.amount),
        category: updatedFields.type === 'transfer' ? null : (updatedFields.category !== undefined ? updatedFields.category : current.category),
        toAccountId: updatedFields.type === 'transfer' ? (updatedFields.toAccountId !== undefined ? updatedFields.toAccountId : current.toAccountId) : null
      };
      this.transactions[idx] = updated;
      this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      this.save();
      return updated;
    }
    return null;
  }

  deleteTransaction(id) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.transactions.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Operazioni Conti ---
  
  addAccount(acc) {
    const newAcc = {
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: acc.name,
      balance: Number(acc.balance || 0), // Saldo iniziale
      color: acc.color || '#3b82f6',
      icon: acc.icon || 'wallet'
    };
    this.accounts.push(newAcc);
    this.save();
    return newAcc;
  }

  updateAccount(id, updatedFields) {
    const idx = this.accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      const updated = {
        ...this.accounts[idx],
        ...updatedFields,
        id,
        balance: Number(updatedFields.balance !== undefined ? updatedFields.balance : this.accounts[idx].balance)
      };
      this.accounts[idx] = updated;
      this.save();
      return updated;
    }
    return null;
  }

  deleteAccount(id) {
    const idx = this.accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.accounts.splice(idx, 1);
      // Elimina o pulisci le transazioni collegate per mantenere l'integrità
      this.transactions = this.transactions.filter(t => t.accountId !== id && t.toAccountId !== id);
      this.save();
      return true;
    }
    return false;
  }

  // --- Operazioni Categorie ---
  
  addCategory(cat) {
    const newCat = {
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: cat.name,
      type: cat.type || 'expense', // 'income' | 'expense'
      color: cat.color || '#6b7280',
      icon: cat.icon || 'dot',
      budget: cat.type === 'expense' && cat.budget ? Number(cat.budget) : null
    };
    this.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id, updatedFields) {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      const current = this.categories[idx];
      const updated = {
        ...current,
        ...updatedFields,
        id,
        budget: updatedFields.type === 'income' ? null : (updatedFields.budget !== undefined ? (updatedFields.budget ? Number(updatedFields.budget) : null) : current.budget)
      };
      this.categories[idx] = updated;
      this.save();
      return updated;
    }
    return null;
  }

  deleteCategory(id) {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.categories.splice(idx, 1);
      // Imposta a null la categoria di tutte le transazioni che la usavano
      this.transactions.forEach(t => {
        if (t.category === id) {
          t.category = null;
        }
      });
      this.save();
      return true;
    }
    return false;
  }

  // --- Import / Export ---
  
  exportJSON() {
    const data = {
      accounts: this.accounts,
      categories: this.categories,
      transactions: this.transactions,
      settings: this.settings,
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.accounts && parsed.categories && parsed.transactions) {
        // Rileva se si tratta del formato dell'utente (con initialBalance o categoryId)
        const isUserFormat = parsed.accounts.some(a => 'initialBalance' in a) || 
                             parsed.transactions.some(t => 'categoryId' in t);
        
        if (isUserFormat) {
          return this.importUserFormat(parsed);
        }

        // Formato nativo dell'applicazione
        this.accounts = parsed.accounts;
        this.categories = parsed.categories;
        this.transactions = parsed.transactions;
        if (parsed.settings) this.settings = parsed.settings;
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Errore durante l\'importazione dei dati', e);
    }
    return false;
  }

  importUserFormat(data) {
    try {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f43f5e'];
      
      // 1. Mappatura Conti
      this.accounts = data.accounts.map((acc, index) => {
        let icon = 'wallet';
        const nameLower = acc.name.toLowerCase();
        if (nameLower.includes('oro') || nameLower.includes('risparmi') || nameLower.includes('cassaforte') || nameLower.includes('salvadanaio')) {
          icon = 'piggy-bank';
        } else if (nameLower.includes('bond') || nameLower.includes('msci') || nameLower.includes('etf') || nameLower.includes('investimenti')) {
          icon = 'bank';
        } else if (nameLower.includes('carta') || nameLower.includes('credito')) {
          icon = 'card';
        } else if (nameLower.includes('contanti') || nameLower.includes('portafoglio') || nameLower.includes('cassa')) {
          icon = 'cash';
        }
        
        return {
          id: String(acc.id),
          name: acc.name.trim(),
          balance: Number(acc.initialBalance !== undefined ? acc.initialBalance : 0),
          color: colors[index % colors.length],
          icon: icon
        };
      });

      // 2. Mappatura Categorie
      this.categories = data.categories.map((cat, index) => {
        let color = '#6b7280';
        if (cat.type === 'expense') {
          const expenseColors = ['#ef4444', '#f97316', '#eab308', '#a855f7', '#ec4899', '#f43f5e', '#a855f7'];
          color = expenseColors[index % expenseColors.length];
        } else {
          const incomeColors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6'];
          color = incomeColors[index % incomeColors.length];
        }

        return {
          id: String(cat.id),
          name: cat.name.trim(),
          type: cat.type,
          color: color,
          icon: cat.icon || 'dot', // Emoji diretta
          budget: null
        };
      });

      // 3. Mappatura Transazioni
      this.transactions = data.transactions.map(t => {
        return {
          id: String(t.id),
          type: t.type,
          amount: Number(t.amount),
          date: t.date,
          category: t.categoryId ? String(t.categoryId) : null,
          accountId: t.accountId ? String(t.accountId) : null,
          toAccountId: null,
          description: t.notes ? t.notes.trim() : ''
        };
      });

      // Ordina per data decrescente
      this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Impostazioni standard
      this.settings = { currency: '€', theme: 'dark' };
      this.save();
      return true;
    } catch (e) {
      console.error('Errore durante la conversione del formato utente', e);
      return false;
    }
  }
}

// Esporta l'istanza globale del DB
window.db = new FinanceDB();
