import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Wallet } from '../types/index.ts';
import { WALLET_ICONS, WALLET_COLORS, renderWalletIcon } from '../lib/icons.tsx';

interface CreateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletToEdit?: Wallet | null;
  unallocatedBalance: number;
  onSubmit: (data: {
    name: string;
    category: string;
    icon: string;
    color: string;
    monthlyBudget: number;
    initialAllocation: number;
  }) => Promise<void>;
}

const CATEGORIES = [
  'Food & Dining',
  'Transit & Fuel',
  'Education & Books',
  'Cafeteria & Snacks',
  'Entertainment & Movies',
  'Shopping & Fashion',
  'Fitness & Sports',
  'Savings & Emergency',
  'Hostel & Utility',
  'Personal',
];

export const CreateWalletModal: React.FC<CreateWalletModalProps> = ({
  isOpen,
  onClose,
  walletToEdit,
  unallocatedBalance,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [icon, setIcon] = useState('Utensils');
  const [color, setColor] = useState(WALLET_COLORS[0].hex);
  const [monthlyBudget, setMonthlyBudget] = useState('2500');
  const [initialAllocation, setInitialAllocation] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setCategory(walletToEdit.category || CATEGORIES[0]);
      setIcon(walletToEdit.icon || 'Wallet');
      setColor(walletToEdit.color || WALLET_COLORS[0].hex);
      setMonthlyBudget(walletToEdit.monthlyBudget.toString());
      setInitialAllocation('0');
    } else {
      setName('');
      setCategory(CATEGORIES[0]);
      setIcon('Utensils');
      setColor(WALLET_COLORS[0].hex);
      setMonthlyBudget('2500');
      setInitialAllocation('500');
    }
    setError(null);
  }, [walletToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a wallet name');
      return;
    }

    const budgetNum = parseFloat(monthlyBudget) || 0;
    const initialAllocNum = parseFloat(initialAllocation) || 0;

    if (!walletToEdit && initialAllocNum > unallocatedBalance) {
      setError(`Initial allocation (₹${initialAllocNum}) cannot exceed unallocated balance (₹${unallocatedBalance.toFixed(2)})`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        category,
        icon,
        color,
        monthlyBudget: budgetNum,
        initialAllocation: initialAllocNum,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-base font-bold text-white">
              {walletToEdit ? 'Edit Personal Wallet' : 'Create New Personal Wallet'}
            </h2>
            <p className="text-xs text-slate-400">
              Personalize your category budget and Scan & Pay rules
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Wallet Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Wallet Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Canteen & Mess, Metro Rides, Late Night Snacks"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Category Tag</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Pick Color */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Accent Color</label>
            <div className="flex flex-wrap gap-2.5">
              {WALLET_COLORS.map(c => {
                const isSelected = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-slate-950 font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pick Icon */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Select Icon</label>
            <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto pr-1">
              {Object.keys(WALLET_ICONS).map(iconName => {
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {renderWalletIcon(iconName, 'w-4 h-4')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monthly Budget */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Monthly Spending Budget (₹)</label>
              <span className="text-[11px] text-slate-400">Target spend limit</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="100"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Initial Allocation from Unallocated Balance (only on create) */}
          {!walletToEdit && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Initial Allocation (₹)</label>
                <span className="text-slate-400">
                  Unallocated Available: <span className="text-emerald-400 font-mono">₹{unallocatedBalance.toFixed(2)}</span>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max={unallocatedBalance}
                  step="50"
                  value={initialAllocation}
                  onChange={e => setInitialAllocation(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : walletToEdit
                ? 'Update Wallet'
                : 'Create Wallet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
