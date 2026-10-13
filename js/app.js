'use strict';
const state = {
    currentPage: 'dashboard',
    theme: 'dark',
    viewMonth: new Date().getMonth(),
    viewYear: new Date().getFullYear(),
    transactions: [],
    budgets: [],
    filters: {
        search: '',
        type: 'all',
        category: 'all',
        sort: 'date-desc',
    },
    editingTxnId: null,
    editingBudgetId: null,
    deleteTarget: null,
    charts: {},
};

document.addEventListener('DOMContentLoaded', () => {
    initData();
    loadFromStorage();
    initTheme();
    initMonthSelector();
    initNavigation();
    initModals();
    initTransactionForm();
    initBudgetForm();
    initFilters();
    initExport();
    populateCategorySelects();
    renderAll();
});

function loadFromStorage() {
    state.transactions = Storage.get('ff_transactions', []);
    state.budgets = Storage.get('ff_budgets', []);
    state.theme = Storage.get('ff_theme', 'dark');
}

function saveTransactions() {
    Storage.set('ff_transactions', state.transactions);
}

function saveBudgets() {
    Storage.set('ff_budgets', state.budgets);
}

function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const isDark = state.theme === 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    toggle.checked = isDark;

    toggle.addEventListener('change', () => {
        state.theme = toggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
        Storage.set('ff_theme', state.theme);
        setTimeout(() => renderCharts(), 100);
    });
}

function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(link.dataset.page);
            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    document.getElementById('viewAllTxn').addEventListener('click', e => {
        e.preventDefault();
        navigateTo('transactions');
    });
    document.getElementById('viewAllBudget').addEventListener('click', e => {
        e.preventDefault();
        navigateTo('budgets');
    });

    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarClose');

    hamburger.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    });
    overlay.addEventListener('click', closeSidebar);
    closeBtn.addEventListener('click', closeSidebar);

    document.getElementById('quickAddBtn').addEventListener('click', () => openTxnModal());
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

function navigateTo(page) {
    state.currentPage = page;
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === page);
    });
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
    });
    const titles = { dashboard: 'Dashboard', transactions: 'Transactions', budgets: 'Budget Goals', analytics: 'Analytics' };
    document.getElementById('topbarTitle').textContent = titles[page] || '';
    renderPage(page);
}

function renderPage(page) {
    if (page === 'dashboard') renderDashboard();
    if (page === 'transactions') renderTransactions();
    if (page === 'budgets') renderBudgets();
    if (page === 'analytics') renderAnalytics();
}

function renderAll() {
    renderDashboard();
    renderTransactions();
    renderBudgets();
    renderAnalytics();
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function initMonthSelector() {
    updateMonthDisplay();
    document.getElementById('currentMonthLabel').textContent = MONTHS[state.viewMonth];
    document.getElementById('prevMonth').addEventListener('click', () => {
        state.viewMonth--;
        if (state.viewMonth < 0) {
            state.viewMonth = 11;
            state.viewYear--;
        }
        updateMonthDisplay();
        renderDashboard();
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
        const now = new Date();
        if (state.viewYear === now.getFullYear() && state.viewMonth === now.getMonth()) return;
        state.viewMonth++;
        if (state.viewMonth > 11) {
            state.viewMonth = 0;
            state.viewYear++;
        }
        updateMonthDisplay();
        renderDashboard();
    });
}

function updateMonthDisplay() {
    document.getElementById('monthDisplay').textContent = `${MONTHS[state.viewMonth]} ${state.viewYear}`;
    document.getElementById('currentMonthLabel').textContent = MONTHS[state.viewMonth];
}

const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtDate = d => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const catInfo = key => CATEGORIES[key] || CATEGORIES['other'];

function getTxnsForMonth(month, year) {
    return state.transactions.filter(t => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getMonth() === month && d.getFullYear() === year;
    });
}

function renderDashboard() {
    const txns = getTxnsForMonth(state.viewMonth, state.viewYear);
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    const rate = income > 0 ? Math.round((balance / income) * 100) : 0;

    let lm = state.viewMonth - 1,
        ly = state.viewYear;
    if (lm < 0) {
        lm = 11;
        ly--;
    }
    const ltxns = getTxnsForMonth(lm, ly);
    const lIncome = ltxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lExpense = ltxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const incChg = lIncome > 0 ? (((income - lIncome) / lIncome) * 100).toFixed(1) : 0;
    const expChg = lExpense > 0 ? (((expense - lExpense) / lExpense) * 100).toFixed(1) : 0;

    document.getElementById('totalIncome').textContent = fmt(income);
    document.getElementById('totalExpense').textContent = fmt(expense);
    document.getElementById('netBalance').textContent = fmt(balance);
    document.getElementById('txnCount').textContent = txns.length;
    document.getElementById('savingsRate').textContent = `Savings rate: ${rate}%`;

    const incEl = document.getElementById('incomeChange');
    const expEl = document.getElementById('expenseChange');
    incEl.className = `stat-change ${incChg >= 0 ? 'positive' : 'negative'}`;
    incEl.innerHTML = `<i class="bi bi-arrow-${incChg >= 0 ? 'up' : 'down'}-short"></i> ${Math.abs(incChg)}% vs last month`;
    expEl.className = `stat-change ${expChg <= 0 ? 'positive' : 'negative'}`;
    expEl.innerHTML = `<i class="bi bi-arrow-${expChg >= 0 ? 'up' : 'down'}-short"></i> ${Math.abs(expChg)}% vs last month`;

    renderRecentTransactions(txns);
    renderBudgetSummary(txns);
    renderCharts();
}

function renderRecentTransactions(txns) {
    const el = document.getElementById('recentTxnList');
    const recent = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

    if (!recent.length) {
        el.innerHTML = `<div class="empty-state"><i class="bi bi-inbox"></i><p>No transactions this month</p></div>`;
        return;
    }

    el.innerHTML = recent.map(t => {
        const cat = catInfo(t.category);
        return `
      <div class="txn-item">
        <div class="txn-cat-icon" style="background:${cat.bg};color:${cat.color}">
          <i class="bi ${cat.icon}"></i>
        </div>
        <div class="txn-info">
          <p class="txn-desc" title="${escHtml(t.description)}">${escHtml(t.description)}</p>
          <p class="txn-date-cat">${fmtDate(t.date)} &bull; ${cat.label}</p>
        </div>
        <span class="txn-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</span>
      </div>`;
    }).join('');
}

function renderBudgetSummary(txns) {
    const el = document.getElementById('budgetSummaryList');
    if (!state.budgets.length) {
        el.innerHTML = `<div class="empty-state" style="padding:30px 10px"><i class="bi bi-bullseye"></i><p>No budgets set</p></div>`;
        return;
    }

    const expTxns = txns.filter(t => t.type === 'expense');
    el.innerHTML = state.budgets.slice(0, 5).map(b => {
        const spent = expTxns.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0);
        const pct = Math.min((spent / b.amount) * 100, 100);
        const status = pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : 'safe';
        const cat = catInfo(b.category);
        return `
      <div class="budget-item-mini">
        <div class="budget-mini-header">
          <span class="budget-mini-label" style="color:${cat.color}">
            <i class="bi ${cat.icon}"></i> ${cat.label}
          </span>
          <span class="budget-mini-values">${fmt(spent)} / ${fmt(b.amount)}</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar ${status}" style="width:${pct}%"></div>
        </div>
      </div>`;
    }).join('');
}

function getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        text: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        income: '#22C55E',
        expense: '#EF4444',
        accent: '#9F7AEA',
    };
}

function renderCharts() {
    renderLineChart();
    renderDoughnutChart();
}

function renderLineChart() {
    const ctx = document.getElementById('lineChart');
    if (!ctx) return;

    const months = parseInt(document.getElementById('chartPeriod').value) || 6;
    const labels = [],
        incomeData = [],
        expenseData = [];

    for (let i = months - 1; i >= 0; i--) {
        let m = state.viewMonth - i;
        let y = state.viewYear;
        while (m < 0) {
            m += 12;
            y--;
        }
        while (m > 11) {
            m -= 12;
            y++;
        }

        labels.push(MONTHS[m].slice(0, 3) + ' ' + String(y).slice(2));
        const txns = getTxnsForMonth(m, y);
        incomeData.push(txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
        expenseData.push(txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
    }

    const c = getChartColors();

    if (state.charts.line) state.charts.line.destroy();
    state.charts.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                    label: 'Income',
                    data: incomeData,
                    borderColor: c.income,
                    backgroundColor: 'rgba(34,197,94,0.12)',
                    borderWidth: 2.5,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: c.income,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: c.expense,
                    backgroundColor: 'rgba(239,68,68,0.10)',
                    borderWidth: 2.5,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: c.expense,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { labels: { color: c.text, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { family: 'Inter', size: 12 } } },
                tooltip: {
                    backgroundColor: '#1e1e2e',
                    titleColor: '#fff',
                    bodyColor: '#aaa',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` }
                }
            },
            scales: {
                x: { grid: { color: c.grid }, ticks: { color: c.text, font: { family: 'Inter', size: 11 } } },
                y: { grid: { color: c.grid }, ticks: { color: c.text, font: { family: 'Inter', size: 11 }, callback: v => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) } }
            }
        }
    });
}

function renderDoughnutChart() {
    const ctx = document.getElementById('doughnutChart');
    if (!ctx) return;

    const txns = getTxnsForMonth(state.viewMonth, state.viewYear).filter(t => t.type === 'expense');
    const catTotals = {};
    txns.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const labels = sorted.map(([k]) => catInfo(k).label);
    const data = sorted.map(([, v]) => v);
    const colors = sorted.map(([k]) => catInfo(k).color);
    const c = getChartColors();

    if (state.charts.doughnut) state.charts.doughnut.destroy();
    if (!data.length) {
        state.charts.doughnut = null;
        return;
    }
    state.charts.doughnut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.map(col => col + 'CC'),
                borderColor: colors,
                borderWidth: 2,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: { position: 'bottom', labels: { color: c.text, usePointStyle: true, pointStyle: 'circle', padding: 10, font: { family: 'Inter', size: 11 }, boxWidth: 10 } },
                tooltip: {
                    backgroundColor: '#1e1e2e',
                    titleColor: '#fff',
                    bodyColor: '#aaa',
                    padding: 12,
                    callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}` }
                }
            }
        }
    });
}

function initFilters() {
    document.getElementById('searchInput').addEventListener('input', e => {
        state.filters.search = e.target.value.toLowerCase();
        renderTransactions();
    });
    document.getElementById('filterType').addEventListener('change', e => {
        state.filters.type = e.target.value;
        renderTransactions();
    });
    document.getElementById('filterCategory').addEventListener('change', e => {
        state.filters.category = e.target.value;
        renderTransactions();
    });
    document.getElementById('sortBy').addEventListener('change', e => {
        state.filters.sort = e.target.value;
        renderTransactions();
    });
    document.getElementById('clearFilters').addEventListener('click', () => {
        state.filters = { search: '', type: 'all', category: 'all', sort: 'date-desc' };
        document.getElementById('searchInput').value = '';
        document.getElementById('filterType').value = 'all';
        document.getElementById('filterCategory').value = 'all';
        document.getElementById('sortBy').value = 'date-desc';
        renderTransactions();
        showToast('Filters cleared', 'info');
    });
    document.getElementById('addTxnBtn').addEventListener('click', () => openTxnModal());
}

function getFilteredTxns() {
    let txns = [...state.transactions];
    const { search, type, category, sort } = state.filters;
    if (type !== 'all') txns = txns.filter(t => t.type === type);
    if (category !== 'all') txns = txns.filter(t => t.category === category);
    if (search) txns = txns.filter(t =>
        t.description.toLowerCase().includes(search) ||
        catInfo(t.category).label.toLowerCase().includes(search) ||
        t.amount.toString().includes(search)
    );
    txns.sort((a, b) => {
        if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sort === 'amount-desc') return b.amount - a.amount;
        if (sort === 'amount-asc') return a.amount - b.amount;
        return 0;
    });
    return txns;
}

function renderTransactions() {
    const txns = getFilteredTxns();
    const tbody = document.getElementById('txnTableBody');
    const empty = document.getElementById('txnEmptyState');
    const table = document.getElementById('txnTable');
    const label = document.getElementById('txnCountLabel');

    label.textContent = `${txns.length} transaction${txns.length !== 1 ? 's' : ''}`;

    if (!txns.length) {
        tbody.innerHTML = '';
        table.style.display = 'none';
        empty.classList.remove('hidden');
        return;
    }
    table.style.display = '';
    empty.classList.add('hidden');

    tbody.innerHTML = txns.map(t => {
                const cat = catInfo(t.category);
                return `
      <tr>
        <td>${fmtDate(t.date)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="width:32px;height:32px;border-radius:8px;background:${cat.bg};color:${cat.color};display:inline-flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0">
              <i class="bi ${cat.icon}"></i>
            </span>
            <div>
              <div style="font-weight:600">${escHtml(t.description)}</div>
              ${t.note ? `<div style="font-size:0.75rem;color:var(--text-secondary)">${escHtml(t.note)}</div>` : ''}
            </div>
          </div>
        </td>
        <td><span class="cat-badge"><i class="bi ${cat.icon}"></i> ${cat.label}</span></td>
        <td><span class="type-badge ${t.type}"><i class="bi bi-arrow-${t.type === 'income' ? 'down' : 'up'}-circle"></i> ${t.type}</span></td>
        <td style="font-weight:700;color:${t.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'}">
          ${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}
        </td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" title="Edit" onclick="openTxnModal('${t.id}')"><i class="bi bi-pencil-fill"></i></button>
            <button class="action-btn del" title="Delete" onclick="confirmDelete('txn','${t.id}')"><i class="bi bi-trash3-fill"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function initExport() {
  document.getElementById('exportBtn').addEventListener('click', () => {
    const txns = getFilteredTxns();
    if (!txns.length) { showToast('No transactions to export', 'warning'); return; }

    const headers = ['Date','Description','Category','Type','Amount','Note'];
    const rows = txns.map(t => [
      t.date, `"${t.description.replace(/"/g,'""')}"`, catInfo(t.category).label, t.type, t.amount, `"${(t.note||'').replace(/"/g,'""')}"`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'financeflow_transactions.csv';
    a.click(); URL.revokeObjectURL(url);
    showToast('Exported successfully!', 'success');
  });
}

function renderBudgets() {
  const txns = getTxnsForMonth(state.viewMonth, state.viewYear).filter(t => t.type === 'expense');
  const grid  = document.getElementById('budgetsGrid');
  const empty = document.getElementById('budgetEmptyState');

  let safe = 0, near = 0, over = 0;

  if (!state.budgets.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    document.getElementById('budgetOnTrack').textContent = 0;
    document.getElementById('budgetNearLimit').textContent = 0;
    document.getElementById('budgetOverLimit').textContent = 0;
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = state.budgets.map(b => {
    const cat   = catInfo(b.category);
    const spent = txns.filter(t => t.category === b.category).reduce((s,t) => s + t.amount, 0);
    const pct   = Math.min((spent / b.amount) * 100, 100);
    const status = pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : 'safe';
    const remaining = b.amount - spent;

    if (status === 'safe')    safe++;
    else if (status === 'warning') near++;
    else over++;

    return `
      <div class="budget-card">
        <div class="budget-card-header">
          <div class="budget-cat-info">
            <div class="budget-cat-icon" style="background:${cat.bg};color:${cat.color}">
              <i class="bi ${cat.icon}"></i>
            </div>
            <div>
              <div class="budget-cat-name">${cat.label}</div>
              <div class="budget-cat-type">${MONTHS[state.viewMonth]} ${state.viewYear}</div>
            </div>
          </div>
          <div class="budget-actions">
            <button class="action-btn edit" title="Edit budget" onclick="openBudgetModal('${b.id}')"><i class="bi bi-pencil-fill"></i></button>
            <button class="action-btn del" title="Delete budget" onclick="confirmDelete('budget','${b.id}')"><i class="bi bi-trash3-fill"></i></button>
          </div>
        </div>
        <div class="budget-stats">
          <span class="budget-spent" style="color:${cat.color}">${fmt(spent)} spent</span>
          <span class="budget-limit">of ${fmt(b.amount)}</span>
        </div>
        <div class="budget-progress-wrap">
          <div class="budget-progress ${status}" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="budget-footer">
          <span class="budget-remaining ${status}">
            ${status === 'danger' ? `${fmt(Math.abs(remaining))} over budget` : `${fmt(remaining)} remaining`}
          </span>
          <span>${pct.toFixed(0)}% used</span>
        </div>
      </div>`;
  }).join('');

  document.getElementById('budgetOnTrack').textContent  = safe;
  document.getElementById('budgetNearLimit').textContent = near;
  document.getElementById('budgetOverLimit').textContent = over;
}
function renderAnalytics() {
  populateAnalyticsYearSelect();
  const year = parseInt(document.getElementById('analyticsYear').value) || state.viewYear;
  renderBarChart(year);
  renderRadarChart(year);
  renderTopCategories(year);
  renderInsights(year);
}

function populateAnalyticsYearSelect() {
  const sel = document.getElementById('analyticsYear');
  const years = [...new Set(state.transactions.map(t => new Date(t.date).getFullYear()))].sort((a,b) => b-a);
  if (!years.includes(state.viewYear)) years.unshift(state.viewYear);

  if (sel.innerHTML === '') {
    sel.innerHTML = years.map(y => `<option value="${y}" ${y === state.viewYear ? 'selected' : ''}>${y}</option>`).join('');
    sel.addEventListener('change', () => renderAnalytics());
  }
}

function renderBarChart(year) {
  const ctx = document.getElementById('barChart');
  if (!ctx) return;
  const labels = MONTHS.map(m => m.slice(0,3));
  const incomeData  = [], expenseData = [];
  for (let m = 0; m < 12; m++) {
    const txns = getTxnsForMonth(m, year);
    incomeData.push(txns.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0));
    expenseData.push(txns.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0));
  }
  const c = getChartColors();
  if (state.charts.bar) state.charts.bar.destroy();
  state.charts.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',   data: incomeData,  backgroundColor: 'rgba(34,197,94,0.75)',  borderRadius: 6, borderSkipped: false },
        { label: 'Expenses', data: expenseData, backgroundColor: 'rgba(239,68,68,0.75)', borderRadius: 6, borderSkipped: false },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: c.text, usePointStyle: true, pointStyle: 'circle', font: { family: 'Inter', size: 12 } } },
        tooltip: { backgroundColor: '#1e1e2e', titleColor: '#fff', bodyColor: '#aaa', padding: 12, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text, font: { family: 'Inter', size: 11 } } },
        y: { grid: { color: c.grid }, ticks: { color: c.text, font: { family: 'Inter', size: 11 }, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } }
      }
    }
  });
}

function renderRadarChart(year) {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;
  const topCats = EXPENSE_CATS.slice(0, 7);
  const labels  = topCats.map(k => catInfo(k).label);

  const allTxns = state.transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getFullYear() === year && t.type === 'expense';
  });

  const data = topCats.map(k => allTxns.filter(t => t.category === k).reduce((s,t) => s + t.amount, 0));
  const c = getChartColors();

  if (state.charts.radar) state.charts.radar.destroy();
  state.charts.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Spending',
        data,
        backgroundColor: 'rgba(159,122,234,0.2)',
        borderColor: '#9F7AEA',
        borderWidth: 2,
        pointBackgroundColor: '#9F7AEA',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#1e1e2e', titleColor: '#fff', bodyColor: '#aaa', padding: 12, callbacks: { label: ctx => ` ${fmt(ctx.parsed.r)}` } }
      },
      scales: {
        r: {
          grid: { color: c.grid },
          ticks: { color: c.text, font: { family: 'Inter', size: 10 }, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v), backdropColor: 'transparent' },
          pointLabels: { color: c.text, font: { family: 'Inter', size: 11 } }
        }
      }
    }
  });
}

function renderTopCategories(year) {
  const el = document.getElementById('topCategoriesList');
  const txns = state.transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getFullYear() === year && t.type === 'expense';
  });
  const catTotals = {};
  txns.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  const sorted = Object.entries(catTotals).sort((a,b) => b[1]-a[1]).slice(0, 6);
  const maxVal = sorted[0]?.[1] || 1;

  el.innerHTML = sorted.map(([k, v]) => {
    const cat = catInfo(k);
    const pct = ((v / maxVal) * 100).toFixed(1);
    return `
      <div class="top-cat-item">
        <div class="top-cat-icon" style="background:${cat.bg};color:${cat.color}">
          <i class="bi ${cat.icon}"></i>
        </div>
        <div class="top-cat-info">
          <div class="top-cat-name">${cat.label}</div>
          <div class="top-cat-bar-wrap">
            <div class="top-cat-bar" style="width:${pct}%;background:${cat.color}"></div>
          </div>
        </div>
        <span class="top-cat-amount">${fmt(v)}</span>
      </div>`;
  }).join('');
}

function renderInsights(year) {
  const el = document.getElementById('analyticsInsights');
  const txns = state.transactions.filter(t => new Date(t.date).getFullYear() === year);
  const totalIncome  = txns.filter(t => t.type === 'income').reduce((s,t)  => s + t.amount, 0);
  const totalExpense = txns.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const totalSaved   = totalIncome - totalExpense;
  const savRate      = totalIncome > 0 ? ((totalSaved / totalIncome) * 100).toFixed(1) : '0.0';
  const avgMonthExp  = (totalExpense / 12).toFixed(0);
  const txnCount     = txns.length;

  const insights = [
    { icon: 'bi bi-arrow-up-circle-fill', value: fmt(totalIncome), label: 'Total Income' },
    { icon: 'bi bi-arrow-down-circle-fill', value: fmt(totalExpense), label: 'Total Expenses' },
    { icon: 'bi bi-wallet2', value: fmt(Math.max(0, totalSaved)), label: 'Total Saved' },
    { icon: 'bi bi-chart-line', value: savRate + '%', label: 'Savings Rate' },
    { icon: 'bi bi-calendar-month', value: fmt(avgMonthExp), label: 'Avg Monthly Expense' },
    { icon: 'bi bi-list', value: txnCount, label: 'Total Transactions' },
  ];

  el.innerHTML = insights.map(i => `
    <div class="insight-card">
      <div class="insight-icon"><i class="${i.icon}"></i></div>
      <div class="insight-value">${i.value}</div>
      <div class="insight-label">${i.label}</div>
    </div>`).join('');
}

function populateCategorySelects() {
  const filterCat = document.getElementById('filterCategory');
  filterCat.innerHTML = '<option value="all">All Categories</option>' +
    Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('');

  updateTxnCategoryOptions('expense');
}

function updateTxnCategoryOptions(type) {
  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;
  const sel  = document.getElementById('txnCategory');
  sel.innerHTML = '<option value="">Select a category</option>' +
    cats.map(k => `<option value="${k}">${catInfo(k).label}</option>`).join('');
}

function populateBudgetCategorySelect() {
  const used = state.budgets.map(b => b.category);
  const sel  = document.getElementById('budgetCategory');
  sel.innerHTML = '<option value="">Select a category</option>' +
    EXPENSE_CATS
      .filter(k => !used.includes(k) || state.editingBudgetId)
      .map(k => `<option value="${k}">${catInfo(k).label}</option>`).join('');
}

function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  ['txnModalClose','txnCancelBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => closeModal('txnModal'));
  });
  ['budgetModalClose','budgetCancelBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => closeModal('budgetModal'));
  });
  ['deleteModalClose','deleteCancelBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => closeModal('deleteModal'));
  });

  document.getElementById('addBudgetBtn').addEventListener('click', () => openBudgetModal());

  document.getElementById('deleteConfirmBtn').addEventListener('click', handleDelete);

  document.getElementById('chartPeriod').addEventListener('change', () => renderLineChart());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openTxnModal(id = null) {
  state.editingTxnId = id;
  const title = document.getElementById('txnModalTitle');
  const form  = document.getElementById('txnForm');
  clearTxnErrors();

  if (id) {
    const t = state.transactions.find(t => t.id === id);
    if (!t) return;
    title.textContent = 'Edit Transaction';
    setTxnType(t.type);
    updateTxnCategoryOptions(t.type);
    document.getElementById('txnAmount').value      = t.amount;
    document.getElementById('txnDate').value        = t.date;
    document.getElementById('txnDescription').value = t.description;
    document.getElementById('txnCategory').value    = t.category;
    document.getElementById('txnNote').value        = t.note || '';
  } else {
    title.textContent = 'Add Transaction';
    form.reset();
    setTxnType('expense');
    updateTxnCategoryOptions('expense');
    document.getElementById('txnDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('txnType').value = 'expense';
  }
  openModal('txnModal');
  setTimeout(() => document.getElementById('txnAmount').focus(), 150);
}

function setTxnType(type) {
  document.getElementById('txnType').value = type;
  document.getElementById('typeExpense').classList.toggle('active', type === 'expense');
  document.getElementById('typeIncome').classList.toggle('active', type === 'income');
  updateTxnCategoryOptions(type);
}

function initTransactionForm() {
  document.getElementById('typeExpense').addEventListener('click', () => setTxnType('expense'));
  document.getElementById('typeIncome').addEventListener('click',  () => setTxnType('income'));

  document.getElementById('txnForm').addEventListener('submit', handleTxnSubmit);
}

function clearTxnErrors() {
  ['amountError','dateError','descError','catError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function handleTxnSubmit(e) {
  e.preventDefault();
  clearTxnErrors();
  let valid = true;

  const type   = document.getElementById('txnType').value;
  const amount = parseFloat(document.getElementById('txnAmount').value);
  const date   = document.getElementById('txnDate').value;
  const desc   = document.getElementById('txnDescription').value.trim();
  const cat    = document.getElementById('txnCategory').value;
  const note   = document.getElementById('txnNote').value.trim();

  if (!amount || amount <= 0) { document.getElementById('amountError').textContent = 'Please enter a valid amount'; valid = false; }
  if (!date)   { document.getElementById('dateError').textContent = 'Please select a date'; valid = false; }
  if (!desc)   { document.getElementById('descError').textContent = 'Description is required'; valid = false; }
  if (!cat)    { document.getElementById('catError').textContent = 'Please select a category'; valid = false; }
  if (!valid)  return;

  if (state.editingTxnId) {
    const idx = state.transactions.findIndex(t => t.id === state.editingTxnId);
    if (idx !== -1) {
      state.transactions[idx] = { ...state.transactions[idx], type, amount, date, description: desc, category: cat, note };
      showToast('Transaction updated!', 'success');
    }
  } else {
    state.transactions.unshift({ id: genId(), type, amount, date, description: desc, category: cat, note });
    showToast('Transaction added!', 'success');
  }

  saveTransactions();
  closeModal('txnModal');
  renderAll();
}

function openBudgetModal(id = null) {
  state.editingBudgetId = id;
  const title = document.getElementById('budgetModalTitle');
  document.getElementById('budgetCatError').textContent    = '';
  document.getElementById('budgetAmountError').textContent = '';
  populateBudgetCategorySelect();

  if (id) {
    const b = state.budgets.find(b => b.id === id);
    if (!b) return;
    title.textContent = 'Edit Budget';
    document.getElementById('budgetCategory').value = b.category;
    document.getElementById('budgetAmount').value   = b.amount;
  } else {
    title.textContent = 'Set Budget';
    document.getElementById('budgetForm').reset();
  }
  openModal('budgetModal');
}

function initBudgetForm() {
  document.getElementById('budgetForm').addEventListener('submit', handleBudgetSubmit);
}

function handleBudgetSubmit(e) {
  e.preventDefault();
  document.getElementById('budgetCatError').textContent    = '';
  document.getElementById('budgetAmountError').textContent = '';
  let valid = true;

  const cat    = document.getElementById('budgetCategory').value;
  const amount = parseFloat(document.getElementById('budgetAmount').value);

  if (!cat)                 { document.getElementById('budgetCatError').textContent = 'Please select a category'; valid = false; }
  if (!amount || amount < 1){ document.getElementById('budgetAmountError').textContent = 'Please enter a valid amount'; valid = false; }
  if (!valid) return;

  if (state.editingBudgetId) {
    const idx = state.budgets.findIndex(b => b.id === state.editingBudgetId);
    if (idx !== -1) {
      state.budgets[idx] = { ...state.budgets[idx], category: cat, amount };
      showToast('Budget updated!', 'success');
    }
  } else {
    const exists = state.budgets.find(b => b.category === cat);
    if (exists) { document.getElementById('budgetCatError').textContent = 'Budget for this category already exists'; return; }
    state.budgets.push({ id: genId(), category: cat, amount });
    showToast('Budget set!', 'success');
  }

  saveBudgets();
  closeModal('budgetModal');
  renderBudgets();
  renderDashboard();
}

function confirmDelete(type, id) {
  state.deleteTarget = { type, id };
  const msg = type === 'txn'
    ? 'Are you sure you want to delete this transaction? This action cannot be undone.'
    : 'Are you sure you want to delete this budget goal? This action cannot be undone.';
  document.getElementById('deleteModalMsg').textContent = msg;
  openModal('deleteModal');
}

function handleDelete() {
  if (!state.deleteTarget) return;
  const { type, id } = state.deleteTarget;

  if (type === 'txn') {
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveTransactions();
    showToast('Transaction deleted', 'info');
  } else {
    state.budgets = state.budgets.filter(b => b.id !== id);
    saveBudgets();
    showToast('Budget deleted', 'info');
  }

  state.deleteTarget = null;
  closeModal('deleteModal');
  renderAll();
}

const TOAST_ICONS = {
  success: 'bi-check-circle-fill',
  error:   'bi-x-circle-fill',
  info:    'bi-info-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
};

function showToast(msg, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="bi ${TOAST_ICONS[type]} toast-icon"></i><span class="toast-msg">${escHtml(msg)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


window.openTxnModal    = openTxnModal;
window.openBudgetModal = openBudgetModal;
window.confirmDelete   = confirmDelete;l;
window.confirmDelete   = confirmDelete;