import React, { useState } from 'react';
import { X, Plus, Wallet, ShieldCheck, ArrowRight, Building, Sparkles } from 'lucide-react';
import { api } from '../lib/api.ts';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUnallocatedBalance: number) => void;
}

const SOURCES = [
  { id: 'allowance', name: 'Parents Monthly Allowance', icon: 'Building' },
  { id: 'stipend', name: 'Internship / Research Stipend', icon: 'Sparkles' },
  { id: 'scholarship', name: 'Merit Scholarship Grant', icon: 'Sparkles' },
  { id: 'bank', name: 'Demo NetBanking / UPI Transfer', icon: 'Building' },
];

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('2000');
  const [source, setSource] = useState(SOURCES[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.addFunds(amt);
      onSuccess(res.unallocatedBalance);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add funds');
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Simulated Funds</h2>
              <p className="text-xs text-slate-400">Deposits credit to your Unallocated Pool</p>
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
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Amount to Deposit (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-bold">
                ₹
              </span>
              <input
                type="number"
                min="10"
                step="50"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-2xl font-bold font-mono tabular-nums text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[500, 1000, 2000, 5000, 10000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-3 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 font-mono transition-colors"
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Select Source */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Funding Channel (Demo)</label>
            <div className="space-y-1.5">
              {SOURCES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSource(s.id)}
                  className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                    source === s.id
                      ? 'bg-slate-800/90 border-emerald-500/80 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Instant Demo
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prototype disclaimer */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              This deposits simulated mock funds into your Pockit prototype account. You can then distribute these funds into your custom wallets.
            </span>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Processing Deposit...' : 'Confirm Demo Deposit'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
