import React from 'react';
import { QrCode, Plus, User, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types/index.ts';

interface NavbarProps {
  user: UserType | null;
  activeTab: 'dashboard' | 'wallets' | 'transactions' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'wallets' | 'transactions' | 'analytics') => void;
  onOpenScanPay: () => void;
  onOpenAddMoney: () => void;
  onOpenProfile: () => void;
  onOpenDemoQrs: () => void;
  onResetDemo: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenScanPay,
  onOpenAddMoney,
  onOpenProfile,
  onOpenDemoQrs,
  onResetDemo,
  onLogout,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group transition-transform focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
              <span className="font-extrabold text-lg tracking-tighter">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Pockit
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Demo UPI
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 bg-slate-900/90 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'wallets'
                ? 'text-emerald-400 bg-slate-900/90 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            My Wallets
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'transactions'
                ? 'text-emerald-400 bg-slate-900/90 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            Transactions
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'text-emerald-400 bg-slate-900/90 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            Analytics & Budgets
          </button>

          <button
            onClick={onOpenDemoQrs}
            className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 transition-colors whitespace-nowrap shrink-0"
          >
            Sample QRs
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Add Money */}
          <button
            onClick={onOpenAddMoney}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Funds</span>
          </button>

          {/* Primary CTA: Scan & Pay */}
          <button
            onClick={onOpenScanPay}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan & Pay</span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/70 hover:border-slate-500 flex items-center justify-center text-slate-200 transition-colors focus-visible:outline-none"
              title="User Account"
            >
              {user ? (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-slate-950"
                  style={{ backgroundColor: user.avatarColor || '#10b981' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs">
                  <div className="p-2 border-b border-slate-800/80 mb-1">
                    <p className="font-semibold text-white text-sm truncate">{user?.name || 'Student User'}</p>
                    <p className="text-slate-400 truncate">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="font-mono">{user?.upiId || 'student@pockit'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile & Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onOpenDemoQrs();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-slate-400" />
                    <span>View Campus Merchant QRs</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onResetDemo();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-amber-400 hover:bg-amber-950/30 flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Demo Account</span>
                  </button>

                  <div className="border-t border-slate-800/80 my-1" />

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Switch Account / Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden border-t border-slate-900 bg-slate-950 px-2 py-1.5 justify-around text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-semibold bg-slate-900' : 'text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('wallets')}
          className={`px-3 py-1.5 rounded-lg ${
            activeTab === 'wallets' ? 'text-emerald-400 font-semibold bg-slate-900' : 'text-slate-400'
          }`}
        >
          Wallets
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded-lg ${
            activeTab === 'transactions' ? 'text-emerald-400 font-semibold bg-slate-900' : 'text-slate-400'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-lg ${
            activeTab === 'analytics' ? 'text-emerald-400 font-semibold bg-slate-900' : 'text-slate-400'
          }`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
