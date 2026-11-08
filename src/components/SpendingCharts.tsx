import React from 'react';
import { TrendingUp, PieChart, AlertTriangle, CheckCircle, Flame, Target } from 'lucide-react';
import { SpendingCategorySummary } from '../types/index.ts';
import { renderWalletIcon } from '../lib/icons.tsx';

interface SpendingChartsProps {
  categories: SpendingCategorySummary[];
  totalSpent: number;
  totalBudget: number;
  highestSpending: SpendingCategorySummary | null;
}

export const SpendingCharts: React.FC<SpendingChartsProps> = ({
  categories,
  totalSpent,
  totalBudget,
  highestSpending,
}) => {
  const overallBudgetPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const isBudgetWarning = overallBudgetPercent >= 80 && overallBudgetPercent < 100;
  const isBudgetExceeded = overallBudgetPercent >= 100;

  // Calculate SVG Pie/Donut slices
  let cumulativePercent = 0;
  const donutSlices = categories
    .filter(c => c.spent > 0)
    .map(c => {
      const slicePercent = totalSpent > 0 ? (c.spent / totalSpent) * 100 : 0;
      const startPercent = cumulativePercent;
      cumulativePercent += slicePercent;
      return {
        ...c,
        slicePercent,
        startPercent,
      };
    });

  return (
    <div className="space-y-6">
      {/* Top Highlights Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Monthly Spend */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Spent This Month</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            ₹{totalSpent.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Across {categories.length} active student wallets
          </p>
        </div>

        {/* Highest Spending Category */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Highest Spending Wallet</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          {highestSpending && highestSpending.spent > 0 ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white truncate">{highestSpending.name}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: highestSpending.color }}
                />
              </div>
              <p className="text-base font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                ₹{highestSpending.spent.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({totalSpent > 0 ? Math.round((highestSpending.spent / totalSpent) * 100) : 0}%)
                </span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No expenses recorded yet</p>
          )}
          <p className="text-[11px] text-slate-400 mt-2">
            Top expenditure focus this cycle
          </p>
        </div>

        {/* Aggregate Budget Burn */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Aggregate Budget Health</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {overallBudgetPercent}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                ₹{totalSpent.toFixed(0)} / ₹{totalBudget.toFixed(0)}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isBudgetExceeded
                    ? 'bg-rose-500'
                    : isBudgetWarning
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${overallBudgetPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            ₹{Math.max(0, totalBudget - totalSpent).toFixed(2)} remaining in total budget
          </p>
        </div>
      </div>

      {/* Visual Distribution & Per-Wallet Budget Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Wallet (Donut / Distribution bar) */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Spending by Wallet</h3>
              <p className="text-xs text-slate-400">Where your money went this month</p>
            </div>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          {/* Segmented Distribution Bar */}
          {totalSpent > 0 ? (
            <div className="space-y-4">
              <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex shadow-inner">
                {donutSlices.map(s => (
                  <div
                    key={s.walletId}
                    style={{
                      width: `${s.slicePercent}%`,
                      backgroundColor: s.color,
                    }}
                    title={`${s.name}: ₹${s.spent} (${s.slicePercent.toFixed(1)}%)`}
                    className="h-full transition-all hover:opacity-90 relative group"
                  />
                ))}
              </div>

              {/* Legend with exact percentages and amounts */}
              <div className="space-y-2 pt-2">
                {categories.map(c => {
                  const percentOfTotal = totalSpent > 0 ? (c.spent / totalSpent) * 100 : 0;
                  return (
                    <div
                      key={c.walletId}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-slate-200 font-medium truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-slate-400 text-[11px]">
                          {percentOfTotal.toFixed(1)}%
                        </span>
                        <span className="font-mono tabular-nums font-semibold text-white">
                          ₹{c.spent.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No transactions recorded for this month yet.
            </div>
          )}
        </div>

        {/* Budget vs Actual for Each Wallet */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Remaining Wallet Budgets</h3>
              <p className="text-xs text-slate-400">Track and protect your monthly spending caps</p>
            </div>
            <Target className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {categories.map(c => {
              const pct = c.budget > 0 ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0;
              const isOver = pct >= 100;
              const isClose = pct >= 80 && pct < 100;

              return (
                <div key={c.walletId} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${c.color}20`, color: c.color }}
                      >
                        {renderWalletIcon(c.icon, 'w-3 h-3')}
                      </div>
                      <span className="font-semibold text-white">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono text-slate-300">₹{c.spent.toFixed(0)}</span>
                      <span className="text-slate-600">/</span>
                      <span className="font-mono text-slate-400">₹{c.budget.toFixed(0)}</span>
                      {isOver ? (
                        <span className="text-[10px] text-rose-400 font-bold uppercase">
                          Limit Hit
                        </span>
                      ) : (
                        <span className="font-mono text-slate-400">({pct}%)</span>
                      )}
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver ? 'bg-rose-500' : isClose ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
