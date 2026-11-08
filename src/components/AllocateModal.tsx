import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Wallet as WalletIcon, Plus, Minus, Sliders } from 'lucide-react';
import { Wallet } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { renderWalletIcon } from '../lib/icons.tsx';

interface AllocateModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  targetWallet?: Wallet | null;
  unallocatedBalance: number;
  onSuccess: () => void;
}

export const AllocateModal: React.FC<AllocateModalProps> = ({
  isOpen,
  onClose,
  wallets,
  targetWallet,
  unallocatedBalance,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'SINGLE' | 'DISTRIBUTE'>('SINGLE');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [amount, setAmount] = useState<string>('500');
  const [direction, setDirection] = useState<'ALLOCATE' | 'DEALLOCATE'>('ALLOCATE');

  // Multi-wallet distribution state
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetWallet) {
      setSelectedWalletId(targetWallet.id);
      setMode('SINGLE');
    } else if (wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }

    // Default even distribution
    const initialDist: Record<string, number> = {};
    if (wallets.length > 0 && unallocatedBalance > 0) {
      const perWallet = Math.floor(unallocatedBalance / wallets.length);
      wallets.forEach(w => {
        initialDist[w.id] = perWallet;
      });
    } else {
      wallets.forEach(w => {
        initialDist[w.id] = 0;
      });
    }
    setDistribution(initialDist);
    setError(null);
  }, [targetWallet, wallets, unallocatedBalance, isOpen]);

  if (!isOpen) return null;

  const currentWallet = wallets.find(w => w.id === selectedWalletId);
  const enteredAmount = parseFloat(amount) || 0;

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWallet) {
      setError('Please select a wallet');
      return;
    }
    if (enteredAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    const signedAmount = direction === 'ALLOCATE' ? enteredAmount : -enteredAmount;
    if (direction === 'ALLOCATE' && enteredAmount > unallocatedBalance) {
      setError(`Cannot allocate more than available unallocated balance (₹${unallocatedBalance.toFixed(2)})`);
      return;
    }
    if (direction === 'DEALLOCATE' && enteredAmount > currentWallet.balance) {
      setError(`Cannot deallocate more than wallet balance (₹${currentWallet.balance.toFixed(2)})`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.allocate(currentWallet.id, signedAmount);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Allocation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDistributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allocations = Object.entries(distribution).map(([walletId, amt]) => ({
      walletId,
      amount: amt,
    }));

    const totalAlloc = allocations.reduce((sum, item) => sum + item.amount, 0);
    if (totalAlloc > unallocatedBalance) {
      setError(`Total distributed (₹${totalAlloc}) exceeds unallocated balance (₹${unallocatedBalance.toFixed(2)})`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.batchAllocate(allocations);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Distribution failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-base font-bold text-white">Allocate Money to Wallets</h2>
            <p className="text-xs text-slate-400">
              Unallocated Balance Available:{' '}
              <span className="text-emerald-400 font-mono font-bold">
                ₹{unallocatedBalance.toFixed(2)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 pt-4">
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('SINGLE')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                mode === 'SINGLE'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Single Wallet
            </button>
            <button
              type="button"
              onClick={() => setMode('DISTRIBUTE')}
              className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'DISTRIBUTE'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Smart Split All</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {mode === 'SINGLE' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              {/* Direction: Allocate vs Deallocate */}
              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setDirection('ALLOCATE')}
                  className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    direction === 'ALLOCATE'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('DEALLOCATE')}
                  className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    direction === 'DEALLOCATE'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Withdraw to Unallocated</span>
                </button>
              </div>

              {/* Wallet select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Wallet</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {wallets.map(w => {
                    const isSelected = w.id === selectedWalletId;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWalletId(w.id)}
                        className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500/80 text-white shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${w.color}20`, color: w.color }}
                          >
                            {renderWalletIcon(w.icon, 'w-3.5 h-3.5')}
                          </div>
                          <span className="font-semibold text-white">{w.name}</span>
                        </div>
                        <span className="font-mono tabular-nums text-slate-300">
                          ₹{w.balance.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">Amount (₹)</label>
                  <span className="text-slate-400 font-mono">
                    {direction === 'ALLOCATE'
                      ? `Max: ₹${unallocatedBalance.toFixed(2)}`
                      : `Max: ₹${(currentWallet?.balance || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-lg font-bold font-mono tabular-nums text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {/* Shortcuts */}
                <div className="flex gap-2 pt-1">
                  {[200, 500, 1000].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(v.toString())}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white font-mono"
                    >
                      ₹{v}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (direction === 'ALLOCATE') {
                        setAmount(unallocatedBalance.toString());
                      } else {
                        setAmount((currentWallet?.balance || 0).toString());
                      }
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 hover:text-emerald-300 font-mono"
                  >
                    All Available
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || enteredAmount <= 0}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Updating...'
                    : direction === 'ALLOCATE'
                    ? `Allocate ₹${enteredAmount.toFixed(2)} to ${currentWallet?.name || 'Wallet'}`
                    : `Withdraw ₹${enteredAmount.toFixed(2)} to Unallocated Pool`}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDistributeSubmit} className="space-y-4">
              <p className="text-xs text-slate-400">
                Split your unallocated balance across all active wallets:
              </p>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {wallets.map(w => {
                  const val = distribution[w.id] || 0;
                  return (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${w.color}20`, color: w.color }}
                        >
                          {renderWalletIcon(w.icon, 'w-3.5 h-3.5')}
                        </div>
                        <div>
                          <p className="font-semibold text-white truncate">{w.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Current: ₹{w.balance.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-500 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={val}
                          onChange={e => {
                            const newAmt = Math.max(0, parseFloat(e.target.value) || 0);
                            setDistribution(prev => ({ ...prev, [w.id]: newAmt }));
                          }}
                          className="w-20 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono tabular-nums text-white text-right focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total indicator */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Allocated:</span>
                <span className="font-mono tabular-nums font-bold text-emerald-400">
                  ₹
                  {Object.values(distribution)
                    .reduce((sum, v) => sum + (v || 0), 0)
                    .toFixed(2)}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Distributing...' : 'Apply Smart Split'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
