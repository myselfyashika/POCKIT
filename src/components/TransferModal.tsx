import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Wallet } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { renderWalletIcon } from '../lib/icons.tsx';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  sourceWallet?: Wallet | null;
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  wallets,
  sourceWallet,
  onSuccess,
}) => {
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [amount, setAmount] = useState<string>('200');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sourceWallet) {
      setSourceId(sourceWallet.id);
      const other = wallets.find(w => w.id !== sourceWallet.id);
      if (other) setTargetId(other.id);
    } else if (wallets.length >= 2) {
      setSourceId(wallets[0].id);
      setTargetId(wallets[1].id);
    }
    setError(null);
  }, [sourceWallet, wallets, isOpen]);

  if (!isOpen) return null;

  const currentSource = wallets.find(w => w.id === sourceId);
  const currentTarget = wallets.find(w => w.id === targetId);
  const enteredAmount = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSource || !currentTarget) {
      setError('Please choose source and target wallets');
      return;
    }
    if (sourceId === targetId) {
      setError('Source and target wallets must be different');
      return;
    }
    if (enteredAmount <= 0) {
      setError('Transfer amount must be greater than zero');
      return;
    }
    if (enteredAmount > currentSource.balance) {
      setError(`Insufficient balance in ${currentSource.name} (Available: ₹${currentSource.balance.toFixed(2)})`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.transfer(sourceId, targetId, enteredAmount);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Transfer Between Wallets</h2>
              <p className="text-xs text-slate-400">Rebalance money instantly with zero friction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Source Wallet */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">From (Source Wallet)</label>
            <select
              value={sourceId}
              onChange={e => {
                setSourceId(e.target.value);
                if (e.target.value === targetId) {
                  const alt = wallets.find(w => w.id !== e.target.value);
                  if (alt) setTargetId(alt.id);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} (Balance: ₹{w.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Target Wallet */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">To (Destination Wallet)</label>
            <select
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {wallets
                .filter(w => w.id !== sourceId)
                .map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Balance: ₹{w.balance.toFixed(2)})
                  </option>
                ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Transfer Amount (₹)</label>
              {currentSource && (
                <span className="text-slate-400 font-mono text-[11px]">
                  Available: ₹{currentSource.balance.toFixed(2)}
                </span>
              )}
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
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-lg font-bold font-mono tabular-nums text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {/* Quick chips */}
            <div className="flex gap-2 pt-1">
              {[100, 250, 500].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v.toString())}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white font-mono"
                >
                  ₹{v}
                </button>
              ))}
              {currentSource && currentSource.balance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentSource.balance.toString())}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-mono"
                >
                  Max (₹{currentSource.balance.toFixed(2)})
                </button>
              )}
            </div>
          </div>

          {/* Transfer Preview */}
          {currentSource && currentTarget && enteredAmount > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Instant Rebalance Preview
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-300">{currentSource.name}</p>
                  <p className="font-mono text-rose-400">
                    -₹{enteredAmount.toFixed(2)} → ₹{Math.max(0, currentSource.balance - enteredAmount).toFixed(2)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div className="text-right">
                  <p className="font-semibold text-slate-300">{currentTarget.name}</p>
                  <p className="font-mono text-emerald-400">
                    +₹{enteredAmount.toFixed(2)} → ₹{(currentTarget.balance + enteredAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || enteredAmount <= 0}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Transferring...' : 'Execute Internal Transfer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
