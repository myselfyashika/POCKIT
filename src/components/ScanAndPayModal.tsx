import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Zap,
  Lock,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Wallet, Transaction, DemoMerchant } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { playSuccessChime } from '../lib/sound.ts';
import { renderWalletIcon } from '../lib/icons.tsx';

interface ScanAndPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  preselectedWalletId?: string | null;
  unallocatedBalance: number;
  onPaymentSuccess: (transaction: Transaction, updatedWallet: Wallet) => void;
  onQuickAllocate: (walletId: string, amount: number) => Promise<void>;
}

type ScanMode = 'CAMERA' | 'PRESETS' | 'MANUAL';

export const ScanAndPayModal: React.FC<ScanAndPayModalProps> = ({
  isOpen,
  onClose,
  wallets,
  preselectedWalletId,
  unallocatedBalance,
  onPaymentSuccess,
  onQuickAllocate,
}) => {
  // Step state: 'SCAN' -> 'DETAILS' -> 'CONFIRM' -> 'PROCESSING' -> 'SUCCESS'
  const [step, setStep] = useState<'SCAN' | 'DETAILS' | 'CONFIRM' | 'PROCESSING' | 'SUCCESS'>('SCAN');
  const [scanMode, setScanMode] = useState<ScanMode>('PRESETS');

  // Selected payment details
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [merchantName, setMerchantName] = useState<string>('');
  const [merchantUpiId, setMerchantUpiId] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [demoPin, setDemoPin] = useState<string>('');

  // Merchants & camera
  const [demoMerchants, setDemoMerchants] = useState<DemoMerchant[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Success result
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [updatedWallet, setUpdatedWallet] = useState<Wallet | null>(null);

  // Loading & error
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isToppingUp, setIsToppingUp] = useState(false);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('SCAN');
      setErrorMessage(null);
      setCompletedTx(null);
      setUpdatedWallet(null);
      setDemoPin('');
      setAmount('');
      setNote('');

      // Determine initial wallet
      if (preselectedWalletId && wallets.some(w => w.id === preselectedWalletId)) {
        setSelectedWalletId(preselectedWalletId);
      } else if (wallets.length > 0) {
        setSelectedWalletId(wallets[0].id);
      }

      // Fetch demo merchants
      api.getDemoMerchants().then(res => {
        setDemoMerchants(res.merchants);
      }).catch(() => {});
    } else {
      stopCamera();
    }
  }, [isOpen, preselectedWalletId, wallets]);

  // Handle Camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
      setCameraError(err.message || 'Unable to access camera. Please allow camera permissions or use sample merchant QRs below.');
      setIsCameraActive(false);
      setScanMode('PRESETS');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && scanMode === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [scanMode, isOpen]);

  if (!isOpen) return null;

  const currentWallet = wallets.find(w => w.id === selectedWalletId);
  const enteredAmountNum = parseFloat(amount) || 0;
  const isInsufficient = currentWallet ? enteredAmountNum > currentWallet.balance : false;
  const deficit = currentWallet ? Math.max(0, enteredAmountNum - currentWallet.balance) : 0;
  const canAutoTopup = unallocatedBalance >= deficit && deficit > 0;

  // Handle selecting a merchant from presets or camera
  const handleSelectMerchant = (m: DemoMerchant) => {
    setMerchantName(m.name);
    setMerchantUpiId(m.upiId);
    setCategory(m.category);
    if (m.suggestedAmounts && m.suggestedAmounts.length > 0) {
      setAmount(m.suggestedAmounts[0].toString());
    }

    // Auto suggest best wallet if not pre-locked
    if (!preselectedWalletId) {
      const matchingWallet = wallets.find(
        w => w.category.toLowerCase() === m.recommendedWalletCategory.toLowerCase() ||
             w.name.toLowerCase().includes(m.recommendedWalletCategory.toLowerCase())
      );
      if (matchingWallet) {
        setSelectedWalletId(matchingWallet.id);
      }
    }

    setStep('DETAILS');
  };

  // Simulate scanning a camera QR code after clicking test QR in viewfinder
  const handleSimulatedCameraScan = (m: DemoMerchant) => {
    stopCamera();
    handleSelectMerchant(m);
  };

  // Parse manual UPI text
  const handleManualUpiSubmit = (raw: string) => {
    // Check if UPI URI: upi://pay?pa=...&pn=...&am=...
    if (raw.startsWith('upi://pay')) {
      try {
        const url = new URL(raw);
        const pa = url.searchParams.get('pa') || 'merchant@upi';
        const pn = url.searchParams.get('pn') || 'Verified Merchant';
        const am = url.searchParams.get('am') || '';
        const tn = url.searchParams.get('tn') || '';
        setMerchantName(decodeURIComponent(pn));
        setMerchantUpiId(decodeURIComponent(pa));
        if (am) setAmount(am);
        if (tn) setNote(decodeURIComponent(tn));
      } catch {
        setMerchantName('Direct Merchant');
        setMerchantUpiId(raw);
      }
    } else if (raw.includes('@')) {
      setMerchantName(raw.split('@')[0].toUpperCase());
      setMerchantUpiId(raw);
    } else {
      setMerchantName('Campus Store');
      setMerchantUpiId(`${raw.toLowerCase().replace(/\s+/g, '')}@upi`);
    }
    setStep('DETAILS');
  };

  // Top up current wallet from unallocated funds
  const handleQuickTopUp = async () => {
    if (!currentWallet || deficit <= 0) return;
    setIsToppingUp(true);
    setErrorMessage(null);
    try {
      await onQuickAllocate(currentWallet.id, deficit);
      // Wait a tick for prop update
    } catch (err: any) {
      setErrorMessage(err.message || 'Top-up failed');
    } finally {
      setIsToppingUp(false);
    }
  };

  // Process the payment
  const handleAuthorizePayment = async () => {
    if (!currentWallet) {
      setErrorMessage('Please select a wallet');
      return;
    }
    if (enteredAmountNum <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    if (isInsufficient) {
      setErrorMessage(`Insufficient balance in ${currentWallet.name}.`);
      return;
    }

    setIsProcessing(true);
    setStep('PROCESSING');
    setErrorMessage(null);

    try {
      // Simulate authentic secure network verification (900ms)
      await new Promise(r => setTimeout(r, 900));

      const res = await api.payWithWallet({
        walletId: currentWallet.id,
        merchantName,
        merchantUpiId,
        amount: enteredAmountNum,
        note,
        category,
      });

      setCompletedTx(res.transaction);
      setUpdatedWallet(res.wallet);
      onPaymentSuccess(res.transaction, res.wallet);

      // Play chime & confetti
      playSuccessChime();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#06b6d4'],
        });
      } catch {}

      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed');
      setStep('DETAILS');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Scan & Pay</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  DEMO UPI
                </span>
              </h2>
              {currentWallet && (
                <p className="text-xs text-slate-400">
                  Target Wallet:{' '}
                  <span className="font-semibold text-slate-200">{currentWallet.name}</span> (₹
                  <span className="font-mono tabular-nums">{currentWallet.balance.toFixed(2)}</span>)
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SCAN OR CHOOSE MERCHANT */}
          {step === 'SCAN' && (
            <div className="space-y-4">
              {/* Scan Mode Switcher */}
              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setScanMode('PRESETS')}
                  className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    scanMode === 'PRESETS' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Campus Merchants</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('CAMERA')}
                  className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    scanMode === 'CAMERA' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera Scanner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('MANUAL')}
                  className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    scanMode === 'MANUAL' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Manual UPI / Link</span>
                </button>
              </div>

              {/* Camera Scanner View */}
              {scanMode === 'CAMERA' && (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Viewfinder Target Overlays */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-0.5 -ml-0.5 rounded-tl" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-0.5 -mr-0.5 rounded-tr" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-0.5 -ml-0.5 rounded-bl" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-0.5 -mr-0.5 rounded-br" />
                        
                        {/* Animated Laser line */}
                        <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-scan-laser" />
                      </div>
                    </div>

                    {!isCameraActive && (
                      <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
                        <Camera className="w-10 h-10 text-slate-600 mb-2" />
                        <p className="text-xs text-slate-400 max-w-xs mb-3">
                          {cameraError || 'Activating camera sensor...'}
                        </p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                        >
                          Allow Camera
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
                    <p className="font-semibold text-slate-300 mb-1">Testing without physical QR?</p>
                    <p className="mb-2 text-[11px]">
                      Click any simulated QR code below to immediately scan into payment flow:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {demoMerchants.slice(0, 3).map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSimulatedCameraScan(m)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[11px] transition-colors"
                        >
                          Scan {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Campus Merchants Preset List */}
              {scanMode === 'PRESETS' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-400">
                    Select a student hotspot QR to simulate instant scan:
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                    {demoMerchants.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMerchant(m)}
                        className="group w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/50 text-left transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                {m.name}
                              </span>
                              {m.verified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="font-mono text-slate-500">{m.upiId}</span>
                              <span aria-hidden="true">·</span>
                              <span>{m.description}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-slate-500 group-hover:text-emerald-400 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual UPI URI Input */}
              {scanMode === 'MANUAL' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Paste any UPI payment link, QR content, or UPI VPA address:
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. upi://pay?pa=canteen@upi&pn=Mess&am=80 or canteen@upi"
                      id="manual-upi-input"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleManualUpiSubmit((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('manual-upi-input') as HTMLInputElement;
                        if (input && input.value) {
                          handleManualUpiSubmit(input.value);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Process UPI Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PAYMENT DETAILS & WALLET SELECTION */}
          {step === 'DETAILS' && (
            <div className="space-y-5">
              {/* Merchant Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                    Paying Merchant
                  </span>
                  <h3 className="text-base font-bold text-white">{merchantName}</h3>
                  <p className="text-xs text-emerald-400 font-mono">{merchantUpiId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('SCAN')}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800"
                >
                  Change
                </button>
              </div>

              {/* Source Wallet Selector - CORE DIFFERENTIATOR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Pay From Which Wallet?
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Pockit balances are deducted per-wallet
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {wallets.map(w => {
                    const isSelected = w.id === selectedWalletId;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWalletId(w.id)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${w.color}20`, color: w.color }}
                          >
                            {renderWalletIcon(w.icon, 'w-3.5 h-3.5')}
                          </div>
                          <span className="text-xs font-semibold text-white truncate">{w.name}</span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Available:</span>
                          <span className="font-mono tabular-nums font-bold text-slate-200">
                            ₹{w.balance.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Payment Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xl font-bold font-mono tabular-nums text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick amount suggestion chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[20, 50, 100, 150, 250].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors font-mono"
                    >
                      +₹{val}
                    </button>
                  ))}
                  {currentWallet && currentWallet.balance > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(currentWallet.balance.toString())}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 hover:border-emerald-500/50 transition-colors font-mono"
                    >
                      Max (₹{currentWallet.balance.toFixed(2)})
                    </button>
                  )}
                </div>
              </div>

              {/* Insufficient Balance Smart Helper */}
              {isInsufficient && currentWallet && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Insufficient funds in {currentWallet.name}</p>
                      <p className="text-[11px] text-amber-300/80">
                        Available: ₹{currentWallet.balance.toFixed(2)} · Needed: ₹{deficit.toFixed(2)} more
                      </p>
                    </div>
                  </div>

                  {canAutoTopup ? (
                    <button
                      type="button"
                      onClick={handleQuickTopUp}
                      disabled={isToppingUp}
                      className="w-full py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {isToppingUp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Moving ₹{deficit.toFixed(2)}...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Auto Top-Up ₹{deficit.toFixed(2)} from Unallocated (₹{unallocatedBalance.toFixed(2)})</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Unallocated balance (₹{unallocatedBalance.toFixed(2)}) is also insufficient. Please reduce amount or top up funds.
                    </p>
                  )}
                </div>
              )}

              {/* Optional Note */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Note / Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Lunch thali, Xerox notes, Chai"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Proceed to Confirm Button */}
              <button
                type="button"
                disabled={!currentWallet || enteredAmountNum <= 0 || isInsufficient}
                onClick={() => setStep('CONFIRM')}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Review & Authorize Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: CONFIRM & PIN AUTHENTICATION */}
          {step === 'CONFIRM' && currentWallet && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                  <span className="text-xs text-slate-400">Recipient</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{merchantName}</p>
                    <p className="text-xs font-mono text-emerald-400">{merchantUpiId}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                  <span className="text-xs text-slate-400">Selected Source Wallet</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${currentWallet.color}20`, color: currentWallet.color }}
                    >
                      {renderWalletIcon(currentWallet.icon, 'w-3 h-3')}
                    </div>
                    <span className="text-xs font-semibold text-white">{currentWallet.name}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                  <span className="text-xs text-slate-400">Balance Before / After</span>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 font-mono">₹{currentWallet.balance.toFixed(2)}</span>
                    <span className="text-slate-500 mx-1.5">→</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      ₹{(currentWallet.balance - enteredAmountNum).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-semibold text-white">Amount to Pay</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                    ₹{enteredAmountNum.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Demo PIN simulation keypad */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Demo 4-Digit UPI PIN</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-filled for demo</span>
                </div>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg font-bold text-emerald-400"
                    >
                      •
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-center text-slate-500">
                  Simulated sandbox verification. No real UPI credentials required.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleAuthorizePayment}
                  disabled={isProcessing}
                  className="flex-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Authorize Pay</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROCESSING ANIMATION */}
          {step === 'PROCESSING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Connecting to UPI Demo Switch...</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authorizing debit from <span className="text-emerald-400">{currentWallet?.name}</span>
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT SUCCESS SCREEN & RECEIPT */}
          {step === 'SUCCESS' && completedTx && (
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              <div className="text-center py-2 space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                    UPI Payment Successful
                  </span>
                  <h3 className="text-3xl font-extrabold font-mono tabular-nums text-white mt-1">
                    ₹{completedTx.amount.toFixed(2)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paid to <span className="text-white font-medium">{completedTx.merchantName}</span>
                  </p>
                </div>
              </div>

              {/* Receipt Breakdown Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Merchant UPI ID:</span>
                  <span className="font-mono text-slate-200">{completedTx.merchantUpiId}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Paid From Wallet:</span>
                  <span className="font-semibold text-emerald-400">{completedTx.walletName}</span>
                </div>
                {updatedWallet && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Remaining Wallet Balance:</span>
                    <span className="font-mono tabular-nums text-slate-200 font-semibold">
                      ₹{updatedWallet.balance.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-400">
                  <span>UPI Reference ID:</span>
                  <span className="font-mono text-slate-300">{completedTx.upiRefId}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Date & Time:</span>
                  <span className="text-slate-300">
                    {new Date(completedTx.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {completedTx.note && (
                  <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-900">
                    <span>Note:</span>
                    <span className="text-slate-300 italic">{completedTx.note}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('SCAN');
                    setAmount('');
                    setNote('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Pay Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
