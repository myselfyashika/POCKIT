import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  college: string;
  upiId: string;
  avatarColor: string;
  unallocatedBalance: number;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  balance: number;
  monthlyBudget: number;
  spentThisMonth: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  walletName: string;
  walletColor: string;
  merchantName: string;
  merchantUpiId: string;
  amount: number;
  type: 'PAYMENT' | 'ALLOCATION' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'DEPOSIT';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  note?: string;
  category?: string;
  upiRefId: string;
  timestamp: string;
  counterpartWalletName?: string;
}

export interface DatabaseSchema {
  users: User[];
  wallets: Wallet[];
  transactions: Transaction[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'pockit.db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default seed dataset for new database
function getSeedData(): DatabaseSchema {
  const demoUserId = 'usr_student_demo';
  const now = new Date();
  
  // Format dates in past 30 days
  const getDateAgo = (daysAgo: number, hoursAgo = 0) => {
    const d = new Date(now.getTime() - (daysAgo * 24 * 3600 * 1000) - (hoursAgo * 3600 * 1000));
    return d.toISOString();
  };

  const defaultUser: User = {
    id: demoUserId,
    name: 'Aarav Sharma',
    email: 'aarav.student@pockit.me',
    passwordHash: 'pockit123', // In demo prototype, clear or simple hash
    college: 'Delhi Technological University (DTU)',
    upiId: 'aarav@pockit',
    avatarColor: '#10b981',
    unallocatedBalance: 2450,
    createdAt: getDateAgo(45),
  };

  const defaultWallets: Wallet[] = [
    {
      id: 'w_food',
      userId: demoUserId,
      name: 'Food & Mess',
      category: 'Food',
      icon: 'Utensils',
      color: '#10b981', // Emerald
      balance: 1850,
      monthlyBudget: 3500,
      spentThisMonth: 1650,
      createdAt: getDateAgo(40),
      updatedAt: getDateAgo(1),
    },
    {
      id: 'w_travel',
      userId: demoUserId,
      name: 'Metro & Travel',
      category: 'Transit',
      icon: 'Bus',
      color: '#06b6d4', // Cyan
      balance: 620,
      monthlyBudget: 1200,
      spentThisMonth: 580,
      createdAt: getDateAgo(40),
      updatedAt: getDateAgo(2),
    },
    {
      id: 'w_books',
      userId: demoUserId,
      name: 'College & Xerox',
      category: 'Education',
      icon: 'GraduationCap',
      color: '#8b5cf6', // Violet
      balance: 950,
      monthlyBudget: 1500,
      spentThisMonth: 550,
      createdAt: getDateAgo(35),
      updatedAt: getDateAgo(3),
    },
    {
      id: 'w_snacks',
      userId: demoUserId,
      name: 'Midnight Chai & Snacks',
      category: 'Cafeteria',
      icon: 'Coffee',
      color: '#f59e0b', // Amber
      balance: 480,
      monthlyBudget: 1000,
      spentThisMonth: 520,
      createdAt: getDateAgo(30),
      updatedAt: getDateAgo(1),
    },
    {
      id: 'w_fun',
      userId: demoUserId,
      name: 'Weekend & Movies',
      category: 'Entertainment',
      icon: 'Film',
      color: '#ec4899', // Pink
      balance: 1100,
      monthlyBudget: 2000,
      spentThisMonth: 900,
      createdAt: getDateAgo(25),
      updatedAt: getDateAgo(5),
    },
    {
      id: 'w_savings',
      userId: demoUserId,
      name: 'Emergency Savings',
      category: 'Savings',
      icon: 'Sparkles',
      color: '#14b8a6', // Teal
      balance: 3200,
      monthlyBudget: 3000,
      spentThisMonth: 0,
      createdAt: getDateAgo(40),
      updatedAt: getDateAgo(10),
    },
  ];

  const defaultTransactions: Transaction[] = [
    {
      id: 'tx_demo_01',
      userId: demoUserId,
      walletId: 'w_food',
      walletName: 'Food & Mess',
      walletColor: '#10b981',
      merchantName: 'Campus Central Canteen',
      merchantUpiId: 'canteen.dtu@upi',
      amount: 140,
      type: 'PAYMENT',
      status: 'COMPLETED',
      note: 'Lunch: Paneer Thali & Lime Soda',
      category: 'Food',
      upiRefId: 'DEMO-UPI-4921049281',
      timestamp: getDateAgo(0, 2),
    },
    {
      id: 'tx_demo_02',
      userId: demoUserId,
      walletId: 'w_snacks',
      walletName: 'Midnight Chai & Snacks',
      walletColor: '#f59e0b',
      merchantName: 'Sharma Ji Night Tapri',
      merchantUpiId: 'sharmachai@ybl',
      amount: 45,
      type: 'PAYMENT',
      status: 'COMPLETED',
      note: 'Ginger Chai & Bun Maska',
      category: 'Cafeteria',
      upiRefId: 'DEMO-UPI-7821901842',
      timestamp: getDateAgo(0, 14),
    },
    {
      id: 'tx_demo_03',
      userId: demoUserId,
      walletId: 'w_travel',
      walletName: 'Metro & Travel',
      walletColor: '#06b6d4',
      merchantName: 'DMRC Metro Gate 3',
      merchantUpiId: 'dmrc.metro@upi',
      amount: 50,
      type: 'PAYMENT',
      status: 'COMPLETED',
      note: 'Metro card auto-recharge at turnstile',
      category: 'Transit',
      upiRefId: 'DEMO-UPI-3829105423',
      timestamp: getDateAgo(1, 4),
    },
    {
      id: 'tx_demo_04',
      userId: demoUserId,
      walletId: 'w_books',
      walletName: 'College & Xerox',
      walletColor: '#8b5cf6',
      merchantName: 'Gupta Xerox & Stationery',
      merchantUpiId: 'guptaxerox@okaxis',
      amount: 180,
      type: 'PAYMENT',
      status: 'COMPLETED',
      note: 'Compiler Design notes photocopy & spiral',
      category: 'Education',
      upiRefId: 'DEMO-UPI-8923019482',
      timestamp: getDateAgo(2, 6),
    },
    {
      id: 'tx_demo_05',
      userId: demoUserId,
      walletId: 'w_food',
      walletName: 'Food & Mess',
      walletColor: '#10b981',
      merchantName: 'Nescafe Campus Kiosk',
      merchantUpiId: 'nescafe.kiosk@paytm',
      amount: 85,
      type: 'PAYMENT',
      status: 'COMPLETED',
      note: 'Cold coffee & Maggi',
      category: 'Food',
      upiRefId: 'DEMO-UPI-6192049102',
      timestamp: getDateAgo(3, 8),
    },
    {
      id: 'tx_demo_06',
      userId: demoUserId,
      walletId: 'w_fun',
      walletName: 'Weekend & Movies',
      walletColor: '#ec4899',
      merchantName: 'PVR Cinemas Cinepolis',
      merchantUpiId: 'pvr.cinemas@upi',
      amount: 320,
      type: 'PAYMENT',
      status: 'COMPLETED',
      note: 'Movie ticket with friends',
      category: 'Entertainment',
      upiRefId: 'DEMO-UPI-5910294821',
      timestamp: getDateAgo(5, 5),
    },
    {
      id: 'tx_demo_07',
      userId: demoUserId,
      walletId: 'w_food',
      walletName: 'Food & Mess',
      walletColor: '#10b981',
      merchantName: 'QuickBite Burgers',
      merchantUpiId: 'quickbite@upi',
      amount: 220,
      type: 'PAYMENT',
      status: 'COMPLETED',
      note: 'Dinner combo after hackathon kickoff',
      category: 'Food',
      upiRefId: 'DEMO-UPI-2049182049',
      timestamp: getDateAgo(6, 3),
    },
    {
      id: 'tx_demo_08',
      userId: demoUserId,
      walletId: 'w_travel',
      walletName: 'Metro & Travel',
      walletColor: '#06b6d4',
      merchantName: 'Uber Auto Rides',
      merchantUpiId: 'uberauto@hdfcbank',
      amount: 95,
      type: 'PAYMENT',
      status: 'COMPLETED',
      note: 'Late night auto back to hostel',
      category: 'Transit',
      upiRefId: 'DEMO-UPI-1920481029',
      timestamp: getDateAgo(8, 1),
    },
  ];

  return {
    users: [defaultUser],
    wallets: defaultWallets,
    transactions: defaultTransactions,
  };
}

class PockitDatabase {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed reading DB file, recreating seed data:', err);
    }
    const seed = getSeedData();
    this.saveImmediate(seed);
    return seed;
  }

  private saveImmediate(data: DatabaseSchema): void {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error writing to DB file:', err);
    }
  }

  private scheduleSave(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    setTimeout(() => {
      this.saveImmediate(this.data);
      this.isSaving = false;
    }, 50);
  }

  // --- Reset to clean demo data ---
  resetToDemo(): DatabaseSchema {
    this.data = getSeedData();
    this.saveImmediate(this.data);
    return this.data;
  }

  // --- Users ---
  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(name: string, email: string, passwordHash: string, college: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const upiUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'student';
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      college: college.trim() || 'University Campus',
      upiId: `${upiUsername}@pockit`,
      avatarColor: '#10b981',
      unallocatedBalance: 5000, // Starter demo grant for new signups
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);

    // Create 3 standard starter wallets
    const starterWallets: Wallet[] = [
      {
        id: `w_food_${Date.now()}`,
        userId: newUser.id,
        name: 'Food & Mess',
        category: 'Food',
        icon: 'Utensils',
        color: '#10b981',
        balance: 1500,
        monthlyBudget: 3000,
        spentThisMonth: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `w_travel_${Date.now()}`,
        userId: newUser.id,
        name: 'Metro & Travel',
        category: 'Transit',
        icon: 'Bus',
        color: '#06b6d4',
        balance: 500,
        monthlyBudget: 1000,
        spentThisMonth: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `w_academic_${Date.now()}`,
        userId: newUser.id,
        name: 'Books & Stationery',
        category: 'Education',
        icon: 'GraduationCap',
        color: '#8b5cf6',
        balance: 500,
        monthlyBudget: 1500,
        spentThisMonth: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.data.wallets.push(...starterWallets);
    this.scheduleSave();
    return newUser;
  }

  updateUserProfile(userId: string, updates: Partial<Pick<User, 'name' | 'college' | 'avatarColor'>>): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found.');

    if (updates.name) user.name = updates.name.trim();
    if (updates.college) user.college = updates.college.trim();
    if (updates.avatarColor) user.avatarColor = updates.avatarColor;

    this.scheduleSave();
    return user;
  }

  addUnallocatedFunds(userId: string, amount: number): User {
    if (amount <= 0) throw new Error('Deposit amount must be greater than zero.');
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found.');

    user.unallocatedBalance += Number(amount.toFixed(2));
    this.scheduleSave();
    return user;
  }

  // --- Wallets ---
  getWalletsByUser(userId: string): Wallet[] {
    return this.data.wallets.filter(w => w.userId === userId);
  }

  getWalletById(id: string): Wallet | undefined {
    return this.data.wallets.find(w => w.id === id);
  }

  createWallet(params: {
    userId: string;
    name: string;
    category?: string;
    icon: string;
    color: string;
    monthlyBudget: number;
    initialAllocation?: number;
  }): Wallet {
    const user = this.getUserById(params.userId);
    if (!user) throw new Error('User not found.');

    const initialAlloc = Number(params.initialAllocation || 0);
    if (initialAlloc > 0) {
      if (user.unallocatedBalance < initialAlloc) {
        throw new Error(`Insufficient unallocated balance (Available: ₹${user.unallocatedBalance}).`);
      }
      user.unallocatedBalance -= initialAlloc;
    }

    const newWallet: Wallet = {
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      name: params.name.trim(),
      category: params.category?.trim() || 'General',
      icon: params.icon || 'Wallet',
      color: params.color || '#10b981',
      balance: initialAlloc,
      monthlyBudget: Math.max(0, Number(params.monthlyBudget) || 1000),
      spentThisMonth: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.wallets.push(newWallet);
    this.scheduleSave();
    return newWallet;
  }

  updateWallet(walletId: string, userId: string, updates: Partial<Pick<Wallet, 'name' | 'category' | 'icon' | 'color' | 'monthlyBudget'>>): Wallet {
    const wallet = this.getWalletById(walletId);
    if (!wallet || wallet.userId !== userId) throw new Error('Wallet not found or unauthorized.');

    if (updates.name) wallet.name = updates.name.trim();
    if (updates.category) wallet.category = updates.category.trim();
    if (updates.icon) wallet.icon = updates.icon;
    if (updates.color) wallet.color = updates.color;
    if (updates.monthlyBudget !== undefined) wallet.monthlyBudget = Math.max(0, Number(updates.monthlyBudget));
    wallet.updatedAt = new Date().toISOString();

    this.scheduleSave();
    return wallet;
  }

  deleteWallet(walletId: string, userId: string): { success: boolean; returnedToUnallocated: number } {
    const walletIndex = this.data.wallets.findIndex(w => w.id === walletId && w.userId === userId);
    if (walletIndex === -1) throw new Error('Wallet not found or unauthorized.');

    const wallet = this.data.wallets[walletIndex];
    const user = this.getUserById(userId);
    const balanceToReturn = wallet.balance;

    if (user && balanceToReturn > 0) {
      user.unallocatedBalance += balanceToReturn;
    }

    this.data.wallets.splice(walletIndex, 1);
    this.scheduleSave();
    return { success: true, returnedToUnallocated: balanceToReturn };
  }

  allocateFunds(userId: string, walletId: string, amount: number): { user: User; wallet: Wallet } {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found.');

    const wallet = this.getWalletById(walletId);
    if (!wallet || wallet.userId !== userId) throw new Error('Wallet not found.');

    const allocAmount = Number(amount);
    if (allocAmount > 0) {
      // Allocate from unallocated to wallet
      if (user.unallocatedBalance < allocAmount) {
        throw new Error(`Insufficient unallocated balance (Available: ₹${user.unallocatedBalance.toFixed(2)}).`);
      }
      user.unallocatedBalance -= allocAmount;
      wallet.balance += allocAmount;
    } else if (allocAmount < 0) {
      // Deallocate from wallet back to unallocated
      const deallocAmount = Math.abs(allocAmount);
      if (wallet.balance < deallocAmount) {
        throw new Error(`Cannot deallocate more than wallet balance (Available: ₹${wallet.balance.toFixed(2)}).`);
      }
      wallet.balance -= deallocAmount;
      user.unallocatedBalance += deallocAmount;
    }

    wallet.updatedAt = new Date().toISOString();
    this.scheduleSave();
    return { user, wallet };
  }

  batchAllocateFunds(userId: string, allocations: { walletId: string; amount: number }[]): { user: User; wallets: Wallet[] } {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found.');

    const totalRequested = allocations.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    if (totalRequested > user.unallocatedBalance) {
      throw new Error(`Total allocation (₹${totalRequested}) exceeds unallocated balance (₹${user.unallocatedBalance}).`);
    }

    for (const item of allocations) {
      const amt = Number(item.amount) || 0;
      if (amt <= 0) continue;
      const wallet = this.getWalletById(item.walletId);
      if (wallet && wallet.userId === userId) {
        user.unallocatedBalance -= amt;
        wallet.balance += amt;
        wallet.updatedAt = new Date().toISOString();
      }
    }

    this.scheduleSave();
    return { user, wallets: this.getWalletsByUser(userId) };
  }

  transferBetweenWallets(userId: string, sourceWalletId: string, targetWalletId: string, amount: number): { source: Wallet; target: Wallet } {
    if (sourceWalletId === targetWalletId) throw new Error('Source and target wallets must be different.');
    if (amount <= 0) throw new Error('Transfer amount must be greater than zero.');

    const source = this.getWalletById(sourceWalletId);
    const target = this.getWalletById(targetWalletId);

    if (!source || source.userId !== userId) throw new Error('Source wallet not found or unauthorized.');
    if (!target || target.userId !== userId) throw new Error('Target wallet not found or unauthorized.');

    const transferAmt = Number(amount.toFixed(2));
    if (source.balance < transferAmt) {
      throw new Error(`Insufficient funds in ${source.name} (Available: ₹${source.balance.toFixed(2)}).`);
    }

    // Atomic execution
    source.balance -= transferAmt;
    target.balance += transferAmt;
    source.updatedAt = new Date().toISOString();
    target.updatedAt = new Date().toISOString();

    // Record internal transfer transaction
    const nowIso = new Date().toISOString();
    const upiRef = `DEMO-TRF-${Date.now().toString().slice(-8)}`;

    this.data.transactions.unshift({
      id: `tx_${Date.now()}_out`,
      userId,
      walletId: source.id,
      walletName: source.name,
      walletColor: source.color,
      merchantName: `Internal Transfer → ${target.name}`,
      merchantUpiId: target.name,
      amount: transferAmt,
      type: 'TRANSFER_OUT',
      status: 'COMPLETED',
      note: `Moved to ${target.name}`,
      upiRefId: upiRef,
      timestamp: nowIso,
      counterpartWalletName: target.name,
    });

    this.scheduleSave();
    return { source, target };
  }

  // --- Transactions & QR Payments ---
  getTransactionsByUser(userId: string, filters?: {
    walletId?: string;
    status?: string;
    search?: string;
  }): Transaction[] {
    let list = this.data.transactions.filter(t => t.userId === userId);

    if (filters?.walletId && filters.walletId !== 'ALL') {
      list = list.filter(t => t.walletId === filters.walletId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(t => t.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t =>
        t.merchantName.toLowerCase().includes(q) ||
        t.walletName.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        t.upiRefId.toLowerCase().includes(q)
      );
    }

    return list;
  }

  processWalletPayment(params: {
    userId: string;
    walletId: string;
    merchantName: string;
    merchantUpiId: string;
    amount: number;
    note?: string;
    category?: string;
    idempotencyKey?: string;
  }): { transaction: Transaction; wallet: Wallet } {
    const { userId, walletId, merchantName, merchantUpiId, amount, note, category } = params;

    const payAmount = Number(Number(amount).toFixed(2));
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const wallet = this.getWalletById(walletId);
    if (!wallet || wallet.userId !== userId) {
      throw new Error('Selected wallet not found or unauthorized.');
    }

    if (wallet.balance < payAmount) {
      throw new Error(
        `Insufficient balance in ${wallet.name}. Available: ₹${wallet.balance.toFixed(2)}, Required: ₹${payAmount.toFixed(2)}.`
      );
    }

    // Atomic deduction
    wallet.balance = Number((wallet.balance - payAmount).toFixed(2));
    wallet.spentThisMonth = Number((wallet.spentThisMonth + payAmount).toFixed(2));
    wallet.updatedAt = new Date().toISOString();

    const upiRefId = `DEMO-UPI-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      walletId: wallet.id,
      walletName: wallet.name,
      walletColor: wallet.color,
      merchantName: merchantName.trim() || 'Verified Merchant',
      merchantUpiId: merchantUpiId.trim() || 'merchant@upi',
      amount: payAmount,
      type: 'PAYMENT',
      status: 'COMPLETED',
      note: note?.trim() || 'Payment via Pockit Wallet',
      category: category || wallet.category || 'General',
      upiRefId,
      timestamp: new Date().toISOString(),
    };

    this.data.transactions.unshift(newTx);
    this.scheduleSave();

    return { transaction: newTx, wallet };
  }

  getDashboardStats(userId: string) {
    const user = this.getUserById(userId);
    const wallets = this.getWalletsByUser(userId);
    const transactions = this.getTransactionsByUser(userId);

    const totalAllocated = wallets.reduce((sum, w) => sum + w.balance, 0);
    const unallocated = user?.unallocatedBalance || 0;
    const totalBalance = totalAllocated + unallocated;

    const totalMonthlyBudget = wallets.reduce((sum, w) => sum + w.monthlyBudget, 0);
    const totalSpentThisMonth = wallets.reduce((sum, w) => sum + w.spentThisMonth, 0);

    // Spending by wallet
    const spendingByWallet = wallets.map(w => ({
      walletId: w.id,
      name: w.name,
      color: w.color,
      icon: w.icon,
      spent: w.spentThisMonth,
      budget: w.monthlyBudget,
      remaining: Math.max(0, w.monthlyBudget - w.spentThisMonth),
      percentage: w.monthlyBudget > 0 ? Math.min(100, Math.round((w.spentThisMonth / w.monthlyBudget) * 100)) : 0,
    }));

    // Find highest spending category/wallet
    const sortedSpending = [...spendingByWallet].sort((a, b) => b.spent - a.spent);
    const highestSpending = sortedSpending[0] || null;

    return {
      totalBalance,
      totalAllocated,
      unallocatedBalance: unallocated,
      totalMonthlyBudget,
      totalSpentThisMonth,
      spendingByWallet,
      highestSpending,
      recentTransactions: transactions.slice(0, 7),
    };
  }
}

export const db = new PockitDatabase();
