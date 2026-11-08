import React, { useState, useEffect, useCallback } from 'react';
import {
  QrCode,
  Plus,
  ArrowRightLeft,
  Sliders,
  Wallet as WalletIcon,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  FolderPlus,
  ExternalLink,
} from 'lucide-react';
import { User, Wallet, Transaction, DashboardStats, DemoMerchant } from './types/index.ts';
import { api, getStoredUserId, setStoredUserId } from './lib/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { WalletCard } from './components/WalletCard.tsx';
import { ScanAndPayModal } from './components/ScanAndPayModal.tsx';
import { CreateWalletModal } from './components/CreateWalletModal.tsx';
import { AddMoneyModal } from './components/AddMoneyModal.tsx';
import { AllocateModal } from './components/AllocateModal.tsx';
import { TransferModal } from './components/TransferModal.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { SpendingCharts } from './components/SpendingCharts.tsx';
import { TransactionsTable } from './components/TransactionsTable.tsx';
import { DemoQrCodesModal } from './components/DemoQrCodesModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallets' | 'transactions' | 'analytics'>('dashboard');

  // Core Data
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [merchants, setMerchants] = useState<DemoMerchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [isScanPayOpen, setIsScanPayOpen] = useState(false);
  const [scanPayTargetWalletId, setScanPayTargetWalletId] = useState<string | null>(null);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [allocateTargetWallet, setAllocateTargetWallet] = useState<Wallet | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferSourceWallet, setTransferSourceWallet] = useState<Wallet | null>(null);
  const [isCreateWalletOpen, setIsCreateWalletOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDemoQrsOpen, setIsDemoQrsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initial Load & Refresh
  const loadData = useCallback(async () => {
    try {
      const [userRes, walletsRes, txRes, statsRes, merchantsRes] = await Promise.all([
        api.getCurrentUser(),
        api.getWallets(),
        api.getTransactions(),
        api.getDashboardStats(),
        api.getDemoMerchants(),
      ]);

      setUser(userRes.user);
      setWallets(walletsRes.wallets);
      setTransactions(txRes.transactions);
      setStats(statsRes);
      setMerchants(merchantsRes.merchants);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler: Scan & Pay from specific wallet
  const handleOpenScanPayForWallet = (walletId: string) => {
    setScanPayTargetWalletId(walletId);
    setIsScanPayOpen(true);
  };

  // Handler: Global Scan & Pay
  const handleOpenGlobalScanPay = () => {
    setScanPayTargetWalletId(null);
    setIsScanPayOpen(true);
  };

  // Handler: Allocate for specific wallet
  const handleOpenAllocateForWallet = (w: Wallet) => {
    setAllocateTargetWallet(w);
    setIsAllocateOpen(true);
  };

  // Handler: Transfer from specific wallet
  const handleOpenTransferFromWallet = (w: Wallet) => {
    setTransferSourceWallet(w);
    setIsTransferOpen(true);
  };

  // Handler: View history of specific wallet
  const handleViewWalletHistory = (w: Wallet) => {
    setActiveTab('transactions');
  };

  // Handler: Edit wallet
  const handleEditWallet = (w: Wallet) => {
    setWalletToEdit(w);
    setIsCreateWalletOpen(true);
  };

  // Handler: Delete wallet
  const handleDeleteWallet = async (w: Wallet) => {
    if (confirm(`Delete wallet "${w.name}"? Any remaining balance of ₹${w.balance.toFixed(2)} will be safely returned to your Unallocated Balance.`)) {
      try {
        await api.deleteWallet(w.id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete wallet');
      }
    }
  };

  // Handler: Create or Edit wallet submission
  const handleWalletFormSubmit = async (data: {
    name: string;
    category: string;
    icon: string;
    color: string;
    monthlyBudget: number;
    initialAllocation: number;
  }) => {
    if (walletToEdit) {
      await api.updateWallet(walletToEdit.id, data);
    } else {
      await api.createWallet(data);
    }
    await loadData();
  };

  // Handler: Quick Allocate during Scan & Pay
  const handleQuickAllocate = async (walletId: string, amount: number) => {
    await api.allocate(walletId, amount);
    await loadData();
  };

  // Handler: Payment Success
  const handlePaymentSuccess = async (tx: Transaction, updatedWallet: Wallet) => {
    setSelectedTx(tx);
    await loadData();
  };

  // Handler: Reset demo data
  const handleResetDemo = async () => {
    if (confirm('Reset Pockit to default student demo state with realistic starter wallets and transactions?')) {
      await api.resetDemo();
      await loadData();
    }
  };

  // Handler: Switch/Logout
  const handleLogout = () => {
    setIsAuthOpen(true);
  };

  // Select merchant from Demo QR modal
  const handleSelectMerchantFromQrModal = (merchant: DemoMerchant) => {
    setScanPayTargetWalletId(null);
    setIsScanPayOpen(true);
  };

  // Calculations
  const totalAllocated = wallets.reduce((sum, w) => sum + w.balance, 0);
  const unallocated = user?.unallocatedBalance || 0;
  const totalBalance = totalAllocated + unallocated;

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanPay={handleOpenGlobalScanPay}
        onOpenAddMoney={() => setIsAddMoneyOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenDemoQrs={() => setIsDemoQrsOpen(true)}
        onResetDemo={handleResetDemo}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Greeting & Student Context */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  <span>Hey, {user?.name.split(' ')[0] || 'Student'}</span>
                  <span className="text-xl">👋</span>
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{user?.college || 'University Campus'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-emerald-400">{user?.upiId || 'student@pockit'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500">Student UPI Sandbox</span>
                </div>
              </div>

              {/* Quick sample QR pill */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDemoQrsOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Merchant QRs</span>
                </button>
              </div>
            </div>

            {/* Top 3 KPI Financial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Total Available Balance */}
              <div className="relative p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between overflow-hidden shadow-sm">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Account Balance
                  </span>
                  <div className="flex items-baseline gap-1 text-3xl font-bold font-mono tabular-nums text-white mt-2">
                    <span className="text-slate-500 text-xl">₹</span>
                    <span>{totalBalance.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                  <span>Allocated + Free Pool</span>
                  <span className="font-mono text-slate-300 font-semibold">{wallets.length} Wallets</span>
                </div>
              </div>

              {/* Card 2: Allocated Balance in Wallets */}
              <div className="relative p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between overflow-hidden shadow-sm">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Allocated In Wallets
                  </span>
                  <div className="flex items-baseline gap-1 text-3xl font-bold font-mono tabular-nums text-emerald-400 mt-2">
                    <span className="text-emerald-600 text-xl">₹</span>
                    <span>{totalAllocated.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                  <span>Divided across personal rules</span>
                  <button
                    onClick={() => setActiveTab('wallets')}
                    className="text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 3: Unallocated Free Balance */}
              <div className="relative p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between overflow-hidden shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Unallocated Free Balance
                    </span>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                      Available
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 text-3xl font-bold font-mono tabular-nums text-cyan-300 mt-2">
                    <span className="text-cyan-600 text-xl">₹</span>
                    <span>{unallocated.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                  <span>Ready to distribute</span>
                  <button
                    onClick={() => {
                      setAllocateTargetWallet(null);
                      setIsAllocateOpen(true);
                    }}
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Distribute</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400 font-medium">
                Quick Actions:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenGlobalScanPay}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/15"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan & Pay</span>
                </button>

                <button
                  onClick={() => setIsAddMoneyOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Money</span>
                </button>

                <button
                  onClick={() => {
                    setAllocateTargetWallet(null);
                    setIsAllocateOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Distribute & Allocate</span>
                </button>

                <button
                  onClick={() => {
                    setTransferSourceWallet(null);
                    setIsTransferOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-violet-400" />
                  <span>Transfer Between Wallets</span>
                </button>
              </div>
            </div>

            {/* PERSONAL WALLETS SECTION (Core Product Feature) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Personalized Wallets</span>
                    <span className="text-xs font-normal text-slate-400">
                      ({wallets.length} active)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Each wallet has its own balance and dedicated Scan & Pay capability.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setWalletToEdit(null);
                    setIsCreateWalletOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-emerald-400 font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ New Custom Wallet</span>
                </button>
              </div>

              {/* Wallets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {wallets.map(w => (
                  <WalletCard
                    key={w.id}
                    wallet={w}
                    onScanPay={handleOpenScanPayForWallet}
                    onAllocate={handleOpenAllocateForWallet}
                    onTransfer={handleOpenTransferFromWallet}
                    onViewHistory={handleViewWalletHistory}
                    onEdit={handleEditWallet}
                    onDelete={handleDeleteWallet}
                  />
                ))}

                {/* Create Wallet Empty Slot Card */}
                <button
                  onClick={() => {
                    setWalletToEdit(null);
                    setIsCreateWalletOpen(true);
                  }}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/40 text-center flex flex-col items-center justify-center gap-3 transition-all min-h-[260px] group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-emerald-300 transition-colors">
                      Create New Wallet
                    </span>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Set a custom name, icon, color and monthly budget limit
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Monthly Spending & Budget Health Overview */}
            {stats && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">Monthly Spending & Insights</h2>
                    <p className="text-xs text-slate-400">
                      Understand exactly where your student allowance goes
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
                  >
                    <span>Detailed analytics</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <SpendingCharts
                  categories={stats.spendingByWallet}
                  totalSpent={stats.totalSpentThisMonth}
                  totalBudget={stats.totalMonthlyBudget}
                  highestSpending={stats.highestSpending}
                />
              </div>
            )}

            {/* Recent Transactions Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                  <p className="text-xs text-slate-400">
                    Latest student UPI payments and wallet movements
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
                >
                  <span>View all history</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                {transactions.slice(0, 5).map(tx => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setSelectedTx(tx);
                      setIsReceiptOpen(true);
                    }}
                    className="p-4 hover:bg-slate-850/60 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${tx.walletColor}18`,
                          color: tx.walletColor,
                          border: `1px solid ${tx.walletColor}30`,
                        }}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          {tx.merchantName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span style={{ color: tx.walletColor }} className="font-medium">
                            {tx.walletName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-500 text-[11px]">
                            {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-sm font-bold font-mono tabular-nums text-white">
                          -₹{tx.amount.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                          {tx.status}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY WALLETS DEEP-DIVE */}
        {activeTab === 'wallets' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Personalized Wallets Management
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Organize your money into isolated compartments and set monthly budget caps.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAllocateTargetWallet(null);
                    setIsAllocateOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Batch Allocate</span>
                </button>

                <button
                  onClick={() => {
                    setWalletToEdit(null);
                    setIsCreateWalletOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/15"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>+ Create Wallet</span>
                </button>
              </div>
            </div>

            {/* Wallets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {wallets.map(w => (
                <WalletCard
                  key={w.id}
                  wallet={w}
                  onScanPay={handleOpenScanPayForWallet}
                  onAllocate={handleOpenAllocateForWallet}
                  onTransfer={handleOpenTransferFromWallet}
                  onViewHistory={handleViewWalletHistory}
                  onEdit={handleEditWallet}
                  onDelete={handleDeleteWallet}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTION HISTORY */}
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Transaction Statement & History
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Filter by wallet, timeframe, and payment status. Click any entry to inspect or save its receipt.
              </p>
            </div>

            <TransactionsTable
              transactions={transactions}
              wallets={wallets}
              onSelectTransaction={tx => {
                setSelectedTx(tx);
                setIsReceiptOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 4: SPENDING ANALYTICS & BUDGETS */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Spending Insights & Budget Health
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Visualize wallet allocations, burn rates, and spending distributions.
              </p>
            </div>

            <SpendingCharts
              categories={stats.spendingByWallet}
              totalSpent={stats.totalSpentThisMonth}
              totalBudget={stats.totalMonthlyBudget}
              highestSpending={stats.highestSpending}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Pockit</span>
            <span aria-hidden="true">·</span>
            <span>Your money. Your rules. One place.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400/90 font-mono">DEMO PROTOTYPE · HACKATHON BUILD</span>
            <button
              onClick={handleResetDemo}
              className="text-slate-400 hover:text-amber-400 transition-colors"
            >
              Reset Demo Account
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Flagship Scan & Pay Modal */}
      <ScanAndPayModal
        isOpen={isScanPayOpen}
        onClose={() => setIsScanPayOpen(false)}
        wallets={wallets}
        preselectedWalletId={scanPayTargetWalletId}
        unallocatedBalance={unallocated}
        onPaymentSuccess={handlePaymentSuccess}
        onQuickAllocate={handleQuickAllocate}
      />

      {/* 2. Add Simulated Money Modal */}
      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        onSuccess={newUnallocated => {
          loadData();
        }}
      />

      {/* 3. Allocate Unallocated Money Modal */}
      <AllocateModal
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        wallets={wallets}
        targetWallet={allocateTargetWallet}
        unallocatedBalance={unallocated}
        onSuccess={loadData}
      />

      {/* 4. Inter-Wallet Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        wallets={wallets}
        sourceWallet={transferSourceWallet}
        onSuccess={loadData}
      />

      {/* 5. Create or Edit Wallet Modal */}
      <CreateWalletModal
        isOpen={isCreateWalletOpen}
        onClose={() => {
          setIsCreateWalletOpen(false);
          setWalletToEdit(null);
        }}
        walletToEdit={walletToEdit}
        unallocatedBalance={unallocated}
        onSubmit={handleWalletFormSubmit}
      />

      {/* 6. Official Transaction Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={selectedTx}
      />

      {/* 7. Sample Merchant QRs Modal */}
      <DemoQrCodesModal
        isOpen={isDemoQrsOpen}
        onClose={() => setIsDemoQrsOpen(false)}
        merchants={merchants}
        onSelectMerchantForScan={handleSelectMerchantFromQrModal}
      />

      {/* 8. Student Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdate={updated => {
          setUser(updated);
        }}
        onResetDemo={handleResetDemo}
      />

      {/* 9. Auth Modal (Login / Signup) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={loggedUser => {
          setUser(loggedUser);
          loadData();
        }}
      />
    </div>
  );
}
