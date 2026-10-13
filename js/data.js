const CATEGORIES = {
    food: { label: 'Food & Dining', icon: 'bi-cup-hot-fill', color: '#F97316', bg: 'hsla(25,95%,53%,0.15)' },
    transport: { label: 'Transport', icon: 'bi-car-front-fill', color: '#3B82F6', bg: 'hsla(217,91%,60%,0.15)' },
    shopping: { label: 'Shopping', icon: 'bi-bag-fill', color: '#EC4899', bg: 'hsla(330,81%,60%,0.15)' },
    health: { label: 'Health & Medical', icon: 'bi-heart-pulse-fill', color: '#EF4444', bg: 'hsla(0,84%,60%,0.15)' },
    entertainment: { label: 'Entertainment', icon: 'bi-controller', color: '#8B5CF6', bg: 'hsla(258,90%,66%,0.15)' },
    education: { label: 'Education', icon: 'bi-mortarboard-fill', color: '#06B6D4', bg: 'hsla(192,91%,36%,0.15)' },
    utilities: { label: 'Utilities', icon: 'bi-lightning-charge-fill', color: '#F59E0B', bg: 'hsla(38,92%,50%,0.15)' },
    rent: { label: 'Rent & Housing', icon: 'bi-house-fill', color: '#10B981', bg: 'hsla(160,84%,39%,0.15)' },
    personal: { label: 'Personal Care', icon: 'bi-person-fill', color: '#6366F1', bg: 'hsla(239,84%,67%,0.15)' },
    travel: { label: 'Travel', icon: 'bi-airplane-fill', color: '#14B8A6', bg: 'hsla(174,72%,40%,0.15)' },
    // Income categories
    salary: { label: 'Salary', icon: 'bi-briefcase-fill', color: '#22C55E', bg: 'hsla(142,71%,45%,0.15)' },
    freelance: { label: 'Freelance', icon: 'bi-laptop-fill', color: '#84CC16', bg: 'hsla(84,81%,44%,0.15)' },
    investment: { label: 'Investment', icon: 'bi-graph-up-arrow', color: '#A3E635', bg: 'hsla(79,75%,55%,0.15)' },
    gift: { label: 'Gift / Bonus', icon: 'bi-gift-fill', color: '#F472B6', bg: 'hsla(330,86%,70%,0.15)' },
    other: { label: 'Other', icon: 'bi-three-dots', color: '#94A3B8', bg: 'hsla(215,16%,47%,0.15)' },
};

const EXPENSE_CATS = ['food', 'transport', 'shopping', 'health', 'entertainment', 'education', 'utilities', 'rent', 'personal', 'travel', 'other'];
const INCOME_CATS = ['salary', 'freelance', 'investment', 'gift', 'other'];

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const SAMPLE_TRANSACTIONS = [
    // October 2026
    { id: genId(), type: 'income', amount: 55000, category: 'salary', description: 'Monthly Salary', date: '2026-10-01', note: 'October paycheck' },
    { id: genId(), type: 'expense', amount: 12000, category: 'rent', description: 'House Rent', date: '2026-10-02', note: '' },
    { id: genId(), type: 'expense', amount: 3200, category: 'food', description: 'Monthly Grocery', date: '2026-10-03', note: 'Big Bazaar' },
    { id: genId(), type: 'expense', amount: 899, category: 'utilities', description: 'Electricity Bill', date: '2026-10-04', note: '' },
    { id: genId(), type: 'income', amount: 8500, category: 'freelance', description: 'UI Design Project', date: '2026-10-05', note: 'Client: TechCo' },
    { id: genId(), type: 'expense', amount: 580, category: 'transport', description: 'Metro Card Recharge', date: '2026-10-06', note: '' },
    { id: genId(), type: 'expense', amount: 1299, category: 'entertainment', description: 'Netflix + Hotstar Annual', date: '2026-10-07', note: '' },
    { id: genId(), type: 'expense', amount: 2450, category: 'shopping', description: 'New T-shirts & Jeans', date: '2026-10-08', note: 'Myntra sale' },
    { id: genId(), type: 'expense', amount: 750, category: 'health', description: 'Pharmacy — Medicines', date: '2026-10-09', note: '' },
    { id: genId(), type: 'expense', amount: 1800, category: 'food', description: 'Restaurant Dinner', date: '2026-10-10', note: 'Birthday celebration' },
    { id: genId(), type: 'income', amount: 2000, category: 'gift', description: 'Birthday Gift Money', date: '2026-10-10', note: 'From parents' },
    { id: genId(), type: 'expense', amount: 490, category: 'utilities', description: 'Internet Bill', date: '2026-10-11', note: 'ACT Fibernet' },
    { id: genId(), type: 'expense', amount: 3500, category: 'education', description: 'Online Course — React', date: '2026-10-12', note: 'Udemy' },
    // September 2026
    { id: genId(), type: 'income', amount: 55000, category: 'salary', description: 'Monthly Salary', date: '2026-09-01', note: '' },
    { id: genId(), type: 'expense', amount: 12000, category: 'rent', description: 'House Rent', date: '2026-09-02', note: '' },
    { id: genId(), type: 'expense', amount: 2800, category: 'food', description: 'Monthly Grocery', date: '2026-09-03', note: '' },
    { id: genId(), type: 'expense', amount: 4500, category: 'travel', description: 'Weekend Trip to Goa', date: '2026-09-15', note: '' },
    { id: genId(), type: 'expense', amount: 1200, category: 'shopping', description: 'Books & Stationery', date: '2026-09-18', note: '' },
    { id: genId(), type: 'income', amount: 6000, category: 'freelance', description: 'Logo Design', date: '2026-09-20', note: '' },
    { id: genId(), type: 'expense', amount: 850, category: 'health', description: 'Gym Membership', date: '2026-09-22', note: '' },
    // August 2026
    { id: genId(), type: 'income', amount: 55000, category: 'salary', description: 'Monthly Salary', date: '2026-08-01', note: '' },
    { id: genId(), type: 'expense', amount: 12000, category: 'rent', description: 'House Rent', date: '2026-08-02', note: '' },
    { id: genId(), type: 'expense', amount: 3100, category: 'food', description: 'Monthly Grocery', date: '2026-08-04', note: '' },
    { id: genId(), type: 'income', amount: 12000, category: 'investment', description: 'Mutual Fund Returns', date: '2026-08-10', note: '' },
    { id: genId(), type: 'expense', amount: 5500, category: 'shopping', description: 'New Laptop Accessories', date: '2026-08-15', note: '' },
    { id: genId(), type: 'expense', amount: 2200, category: 'entertainment', description: 'Concert Tickets', date: '2026-08-20', note: '' },
    // July 2026
    { id: genId(), type: 'income', amount: 55000, category: 'salary', description: 'Monthly Salary', date: '2026-07-01', note: '' },
    { id: genId(), type: 'expense', amount: 12000, category: 'rent', description: 'House Rent', date: '2026-07-02', note: '' },
    { id: genId(), type: 'expense', amount: 2900, category: 'food', description: 'Monthly Grocery', date: '2026-07-03', note: '' },
    { id: genId(), type: 'income', amount: 9500, category: 'freelance', description: 'Web Dev Project', date: '2026-07-15', note: '' },
    { id: genId(), type: 'expense', amount: 3200, category: 'travel', description: 'Train Tickets — Home', date: '2026-07-18', note: '' },
    // June 2026
    { id: genId(), type: 'income', amount: 55000, category: 'salary', description: 'Monthly Salary', date: '2026-06-01', note: '' },
    { id: genId(), type: 'expense', amount: 12000, category: 'rent', description: 'House Rent', date: '2026-06-02', note: '' },
    { id: genId(), type: 'expense', amount: 2600, category: 'food', description: 'Monthly Grocery', date: '2026-06-04', note: '' },
    { id: genId(), type: 'expense', amount: 1800, category: 'personal', description: 'Skincare Products', date: '2026-06-12', note: '' },
    { id: genId(), type: 'expense', amount: 4200, category: 'education', description: 'College Exam Fees', date: '2026-06-20', note: '' },
    // May 2026
    { id: genId(), type: 'income', amount: 55000, category: 'salary', description: 'Monthly Salary', date: '2026-05-01', note: '' },
    { id: genId(), type: 'expense', amount: 12000, category: 'rent', description: 'House Rent', date: '2026-05-02', note: '' },
    { id: genId(), type: 'expense', amount: 3000, category: 'food', description: 'Monthly Grocery', date: '2026-05-03', note: '' },
    { id: genId(), type: 'income', amount: 5000, category: 'gift', description: 'Diwali Bonus', date: '2026-05-10', note: '' },
    { id: genId(), type: 'expense', amount: 8000, category: 'shopping', description: 'Diwali Gifts & Decoration', date: '2026-05-12', note: '' },
];

const SAMPLE_BUDGETS = [
    { id: genId(), category: 'food', amount: 4000 },
    { id: genId(), category: 'transport', amount: 1500 },
    { id: genId(), category: 'shopping', amount: 3000 },
    { id: genId(), category: 'entertainment', amount: 2000 },
    { id: genId(), category: 'education', amount: 5000 },
    { id: genId(), category: 'utilities', amount: 1500 },
];

const Storage = {
    get(key, fallback) {
        try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : fallback;
        } catch { return fallback; }
    },
    set(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }
};

function initData() {
    if (!localStorage.getItem('ff_initialized')) {
        Storage.set('ff_transactions', SAMPLE_TRANSACTIONS);
        Storage.set('ff_budgets', SAMPLE_BUDGETS);
        Storage.set('ff_initialized', true);
    }
}