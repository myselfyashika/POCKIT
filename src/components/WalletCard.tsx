import React from 'react';
import { QrCode, ArrowRightLeft, Plus, MoreVertical, History, Edit, Trash2 } from 'lucide-react';
import { Wallet } from '../types/index.ts';
import { renderWalletIcon } from '../lib/icons.tsx';

interface WalletCardProps {
  wallet: Wallet;
  onScanPay: (walletId: string) => void;
  onAllocate: (wallet: Wallet) => void;
  onTransfer: (wallet: Wallet) => void;
  onViewHistory: (wallet: Wallet) => void;
  onEdit: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onScanPay,
  onAllocate,
  onTransfer,
  onViewHistory,
  onEdit,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const budget = wallet.monthlyBudget || 1000;
  const spent = wallet.spentThisMonth || 0;
  const percentSpent = Math.min(100, Math.round((spent / budget) * 100));

  // Determine budget status color
  const isBudgetWarning = percentSpent >= 80 && percentSpent < 100;
  const isBudgetExceeded = percentSpent >= 100;

  return (
    <div className="relative group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-sm">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
              style={{
                backgroundColor: `${wallet.color}18`,
                color: wallet.color,
                border: `1px solid ${wallet.color}35`,
              }}
            >
              {renderWalletIcon(wallet.icon, 'w-5 h-5')}
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors truncate max-w-[150px]">
                {wallet.name}
              </h3>
              <p className="text-xs text-slate-400 capitalize">{wallet.category || 'General'}</p>
            </div>
          </div>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Wallet options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-40 rounded-xl bg-slate-950 border border-slate-800 shadow-xl p-1 z-30 text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onViewHistory(wallet);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Statement</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(wallet);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Wallet</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(wallet);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete Wallet</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="space-y-1 mb-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Available Balance
          </span>
          <div className="flex items-baseline gap-1 text-2xl font-bold font-mono tabular-nums text-white">
            <span className="text-slate-500 text-lg">₹</span>
            <span>{wallet.balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-1.5 mb-5 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Monthly Budget</span>
            <div className="flex items-center gap-1 font-mono">
              <span className="text-slate-300">₹{spent.toFixed(0)}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">₹{budget.toFixed(0)}</span>
            </div>
          </div>

          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBudgetExceeded
                  ? 'bg-rose-500'
                  : isBudgetWarning
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>{percentSpent}% spent</span>
            <span>
              {isBudgetExceeded
                ? 'Budget exceeded'
                : `₹${Math.max(0, budget - spent).toFixed(0)} left`}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Dedicated Scan & Pay + Allocate + Transfer */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        {/* Wallet's own Scan & Pay button (The Core Feature) */}
        <button
          onClick={() => onScanPay(wallet.id)}
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 hover:border-emerald-500 text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-500/10 active:scale-98"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan & Pay from {wallet.name}</span>
        </button>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onAllocate(wallet)}
            className="py-1.5 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            title="Add or remove funds to this wallet"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Allocate</span>
          </button>

          <button
            onClick={() => onTransfer(wallet)}
            className="py-1.5 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            title="Move money to another wallet"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
