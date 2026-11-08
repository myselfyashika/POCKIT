export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  upiId: string;
  avatarColor: string;
  unallocatedBalance: number;
  createdAt?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  balance: number;
  monthlyBudget: number;
  spentThisMonth: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  walletName: string;
  walletColor: string;
  merchantName: string;
  merchantUpiId: string;
  amount: number;
  type: 'PAYMENT' | 'ALLOCATION' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'DEPOSIT';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  note?: string;
  category?: string;
  upiRefId: string;
  timestamp: string;
  counterpartWalletName?: string;
}

export interface SpendingCategorySummary {
  walletId: string;
  name: string;
  color: string;
  icon: string;
  spent: number;
  budget: number;
  remaining: number;
  percentage: number;
}

export interface DashboardStats {
  totalBalance: number;
  totalAllocated: number;
  unallocatedBalance: number;
  totalMonthlyBudget: number;
  totalSpentThisMonth: number;
  spendingByWallet: SpendingCategorySummary[];
  highestSpending: SpendingCategorySummary | null;
  recentTransactions: Transaction[];
}

export interface DemoMerchant {
  id: string;
  name: string;
  upiId: string;
  category: string;
  recommendedWalletCategory: string;
  suggestedAmounts: number[];
  description: string;
  verified: boolean;
}
