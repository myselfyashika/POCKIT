import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, ShieldCheck, GraduationCap, RefreshCw, Check } from 'lucide-react';
import { User } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { WALLET_COLORS } from '../lib/icons.tsx';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (updatedUser: User) => void;
  onResetDemo: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
  onResetDemo,
}) => {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [avatarColor, setAvatarColor] = useState('#10b981');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCollege(user.college || '');
      setAvatarColor(user.avatarColor || '#10b981');
    }
    setError(null);
    setSuccess(false);
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.updateProfile({
        name: name.trim(),
        college: college.trim(),
        avatarColor,
      });
      onUpdate(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs"
              style={{ backgroundColor: avatarColor }}
            >
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Student Profile Settings</h2>
              <p className="text-xs text-slate-400">Pockit UPI ID: {user.upiId}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Profile updated successfully!
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Student Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* College */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">University / College Campus</label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. DTU, IIT, BITS Pilani, NIT Trichy"
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Avatar Color */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Avatar Badge Color</label>
            <div className="flex gap-2">
              {WALLET_COLORS.slice(0, 6).map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setAvatarColor(c.hex)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c.hex }}
                >
                  {avatarColor === c.hex && <Check className="w-4 h-4 text-slate-950 font-bold" />}
                </button>
              ))}
            </div>
          </div>

          {/* UPI Address Badge */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Allocated Virtual Payment Address (VPA)
            </span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>{user.upiId}</span>
            </div>
          </div>

          {/* Save button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Reset Demo Account */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-300">Reset Demo Data</p>
                <p className="text-[11px] text-slate-500">Restore starter student wallets and balances</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onResetDemo();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
