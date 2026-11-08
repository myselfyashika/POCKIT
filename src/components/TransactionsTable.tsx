import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Transaction, Wallet } from '../types/index.ts';
import { renderWalletIcon } from '../lib/icons.tsx';

interface TransactionsTableProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  wallets,
  onSelectTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Filter logic
  const filtered = transactions.filter(tx => {
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = tx.merchantName.toLowerCase().includes(q);
      const matchUpi = tx.merchantUpiId.toLowerCase().includes(q);
      const matchWallet = tx.walletName.toLowerCase().includes(q);
      const matchRef = tx.upiRefId.toLowerCase().includes(q);
      const matchNote = tx.note?.toLowerCase().includes(q);
      if (!matchName && !matchUpi && !matchWallet && !matchRef && !matchNote) {
        return false;
      }
    }

    // Wallet filter
    if (selectedWalletId !== 'ALL' && tx.walletId !== selectedWalletId) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && tx.status !== selectedStatus) {
      return false;
    }

    // Time filter
    if (timeFilter !== 'ALL') {
      const txDate = new Date(tx.timestamp).getTime();
      const now = Date.now();
      if (timeFilter === 'TODAY' && now - txDate > 24 * 3600 * 1000) return false;
      if (timeFilter === 'WEEK' && now - txDate > 7 * 24 * 3600 * 1000) return false;
      if (timeFilter === 'MONTH' && now - txDate > 30 * 24 * 3600 * 1000) return false;
    }

    return true;
  });

  // CSV export
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Merchant / Recipient', 'Wallet', 'Amount', 'Status', 'Note'];
    const rows = filtered.map(t => [
      t.upiRefId,
      new Date(t.timestamp).toISOString(),
      `"${t.merchantName.replace(/"/g, '""')}"`,
      `"${t.walletName.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.status,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pockit_statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by merchant, UPI ID, wallet or note..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Wallet selector */}
          <select
            value={selectedWalletId}
            onChange={e => setSelectedWalletId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
          >
            <option value="ALL">All Wallets</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Time range tabs */}
          <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-medium ml-auto">
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  timeFilter === t
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'ALL' ? 'All Time' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {filtered.map(tx => {
              const isTransfer = tx.type === 'TRANSFER_OUT' || tx.type === 'TRANSFER_IN';

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="p-4 hover:bg-slate-850/60 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  {/* Left: Icon & Merchant details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${tx.walletColor}18`,
                        color: tx.walletColor,
                        border: `1px solid ${tx.walletColor}30`,
                      }}
                    >
                      {isTransfer ? (
                        <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                          {tx.merchantName}
                        </span>
                        {tx.status === 'COMPLETED' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span
                          className="font-medium truncate"
                          style={{ color: tx.walletColor }}
                        >
                          {tx.walletName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500 text-[11px] whitespace-nowrap">
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

                  {/* Right: Amount & Receipt Arrow */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div className="text-sm font-bold font-mono tabular-nums text-white">
                        -₹{tx.amount.toFixed(2)}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {tx.upiRefId}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 space-y-1">
            <p>No transactions match your current filters.</p>
            <p className="text-[11px]">Make a payment or reset filters to view history.</p>
          </div>
        )}
      </div>
    </div>
  );
};
