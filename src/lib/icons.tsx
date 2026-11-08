import React from 'react';
import {
  Utensils,
  Bus,
  ShoppingBag,
  GraduationCap,
  Film,
  Coffee,
  Sparkles,
  BookOpen,
  Heart,
  Dumbbell,
  Zap,
  Plane,
  Car,
  Smartphone,
  Gamepad2,
  Music,
  Wallet,
  PiggyBank,
  Wifi,
  Shield,
  Layers,
  LucideProps,
} from 'lucide-react';

export const WALLET_ICONS: Record<string, React.FC<LucideProps>> = {
  Utensils,
  Bus,
  ShoppingBag,
  GraduationCap,
  Film,
  Coffee,
  Sparkles,
  BookOpen,
  Heart,
  Dumbbell,
  Zap,
  Plane,
  Car,
  Smartphone,
  Gamepad2,
  Music,
  Wallet,
  PiggyBank,
  Wifi,
  Shield,
  Layers,
};

export const WALLET_COLORS = [
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { name: 'Violet', hex: '#8b5cf6', bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  { name: 'Pink', hex: '#ec4899', bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' },
  { name: 'Teal', hex: '#14b8a6', bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  { name: 'Rose', hex: '#f43f5e', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  { name: 'Indigo', hex: '#6366f1', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  { name: 'Lime', hex: '#84cc16', bg: 'bg-lime-500/15', text: 'text-lime-400', border: 'border-lime-500/30' },
];

export function renderWalletIcon(iconName: string, className = 'w-5 h-5') {
  const IconComponent = WALLET_ICONS[iconName] || Wallet;
  return <IconComponent className={className} />;
}
