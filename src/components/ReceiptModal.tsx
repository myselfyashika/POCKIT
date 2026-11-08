import React from 'react';
import { X, CheckCircle2, ShieldCheck, Share2, Copy, Download, QrCode } from 'lucide-react';
import { Transaction } from '../types/index.ts';
import { renderWalletIcon } from '../lib/icons.tsx';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !transaction) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.upiRefId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header decoration */}
        <div className="p-6 text-center space-y-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-400/80 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
              <span>Verified UPI Payment</span>
              <span className="text-[10px] bg-emerald-950/60 border border-emerald-500/30 px-1 py-0.2 rounded font-mono">
                DEMO
              </span>
            </div>
            <h3 className="text-3xl font-extrabold font-mono tabular-nums text-white mt-1">
              ₹{transaction.amount.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Paid to <span className="text-white font-semibold">{transaction.merchantName}</span>
            </p>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-3.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Merchant UPI ID:</span>
            <span className="font-mono text-slate-200">{transaction.merchantUpiId}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Paid From Wallet:</span>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <div
                className="w-4 h-4 rounded flex items-center justify-center"
                style={{ backgroundColor: `${transaction.walletColor}20`, color: transaction.walletColor }}
              >
                {renderWalletIcon('Wallet', 'w-3 h-3')}
              </div>
              <span style={{ color: transaction.walletColor }}>{transaction.walletName}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>UPI Reference:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-300 text-[11px]">{transaction.upiRefId}</span>
              <button
                onClick={handleCopyRef}
                className="text-slate-400 hover:text-emerald-400 p-1 rounded"
                title="Copy reference ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {copied && (
            <p className="text-[10px] text-right text-emerald-400 font-medium">Copied to clipboard!</p>
          )}

          <div className="flex justify-between items-center text-slate-400">
            <span>Payment Timestamp:</span>
            <span className="text-slate-300">
              {new Date(transaction.timestamp).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Status:</span>
            <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px] bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {transaction.status}
            </span>
          </div>

          {transaction.note && (
            <div className="pt-2 border-t border-slate-800 text-slate-400">
              <span className="block text-[11px] text-slate-500 mb-0.5">Note:</span>
              <p className="text-slate-200 italic">{transaction.note}</p>
            </div>
          )}

          {/* Prototype note */}
          <div className="pt-3 border-t border-slate-800 flex items-start gap-2 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>Pockit Student Payment Network · Secure Wallet Isolation Protocol</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
