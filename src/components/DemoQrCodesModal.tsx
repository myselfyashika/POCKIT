import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import { DemoMerchant } from '../types/index.ts';

interface DemoQrCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: DemoMerchant[];
  onSelectMerchantForScan: (merchant: DemoMerchant) => void;
}

export const DemoQrCodesModal: React.FC<DemoQrCodesModalProps> = ({
  isOpen,
  onClose,
  merchants,
  onSelectMerchantForScan,
}) => {
  const [selectedMerchant, setSelectedMerchant] = useState<DemoMerchant | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (merchants.length > 0 && (!selectedMerchant || !merchants.some(m => m.id === selectedMerchant.id))) {
      setSelectedMerchant(merchants[0]);
    }
  }, [merchants, isOpen]);

  useEffect(() => {
    if (!selectedMerchant) return;
    const upiUri = `upi://pay?pa=${encodeURIComponent(selectedMerchant.upiId)}&pn=${encodeURIComponent(selectedMerchant.name)}&cu=INR&tn=${encodeURIComponent(selectedMerchant.description)}`;

    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 2,
      color: {
        dark: '#06090e',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed generating QR code:', err));
  }, [selectedMerchant]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sample Merchant UPI QR Codes</h2>
              <p className="text-xs text-slate-400">Real scannable UPI QR codes for testing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Merchant selector tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
            {merchants.map(m => {
              const isSelected = selectedMerchant?.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMerchant(m)}
                  className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>

          {selectedMerchant && (
            <div className="flex flex-col items-center text-center space-y-4">
              {/* QR Container */}
              <div className="p-4 rounded-2xl bg-white shadow-2xl border-4 border-emerald-400/30 flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`${selectedMerchant.name} UPI QR`}
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
                <div className="mt-2 text-slate-900 font-bold text-xs tracking-tight">
                  Scan with Pockit or Phone Camera
                </div>
              </div>

              {/* Merchant Details */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-base font-bold text-white">
                  <span>{selectedMerchant.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs font-mono text-emerald-400">{selectedMerchant.upiId}</p>
                <p className="text-xs text-slate-400 max-w-sm">{selectedMerchant.description}</p>
              </div>

              {/* Action */}
              <div className="flex gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectMerchantForScan(selectedMerchant);
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan & Pay This Merchant Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
