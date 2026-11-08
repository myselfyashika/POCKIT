import { User, Wallet, Transaction, DashboardStats, DemoMerchant } from '../types/index.ts';

const USER_STORAGE_KEY = 'pockit_current_user_id';

export function getStoredUserId(): string {
  if (typeof window === 'undefined') return 'usr_student_demo';
  return localStorage.getItem(USER_STORAGE_KEY) || 'usr_student_demo';
}

export function setStoredUserId(userId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, userId);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const userId = getStoredUserId();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (userId) {
    headers.set('x-user-id', userId);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Network request failed');
  }
  return data;
}

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ user: User }> {
    const data = await request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredUserId(data.user.id);
    return data;
  },

  async signup(name: string, email: string, password: string, college: string): Promise<{ user: User }> {
    const data = await request<{ user: User }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, college }),
    });
    setStoredUserId(data.user.id);
    return data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(updates: { name: string; college: string; avatarColor?: string }): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Account Funds
  async addFunds(amount: number): Promise<{ success: boolean; unallocatedBalance: number; message: string }> {
    return request('/api/account/add-funds', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  // Wallets
  async getWallets(): Promise<{ wallets: Wallet[] }> {
    return request<{ wallets: Wallet[] }>('/api/wallets');
  },

  async createWallet(data: {
    name: string;
    category?: string;
    icon: string;
    color: string;
    monthlyBudget: number;
    initialAllocation?: number;
  }): Promise<{ wallet: Wallet; unallocatedBalance: number }> {
    return request('/api/wallets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateWallet(id: string, data: Partial<Pick<Wallet, 'name' | 'category' | 'icon' | 'color' | 'monthlyBudget'>>): Promise<{ wallet: Wallet }> {
    return request(`/api/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteWallet(id: string): Promise<{ success: boolean; returnedToUnallocated: number; unallocatedBalance: number }> {
    return request(`/api/wallets/${id}`, {
      method: 'DELETE',
    });
  },

  async allocate(walletId: string, amount: number): Promise<{ success: boolean; wallet: Wallet; unallocatedBalance: number }> {
    return request(`/api/wallets/${walletId}/allocate`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  async batchAllocate(allocations: { walletId: string; amount: number }[]): Promise<{ success: boolean; wallets: Wallet[]; unallocatedBalance: number }> {
    return request('/api/wallets/batch-allocate', {
      method: 'POST',
      body: JSON.stringify({ allocations }),
    });
  },

  async transfer(sourceWalletId: string, targetWalletId: string, amount: number): Promise<{ success: boolean; sourceWallet: Wallet; targetWallet: Wallet }> {
    return request('/api/wallets/transfer', {
      method: 'POST',
      body: JSON.stringify({ sourceWalletId, targetWalletId, amount }),
    });
  },

  // Scan & Pay
  async payWithWallet(data: {
    walletId: string;
    merchantName: string;
    merchantUpiId: string;
    amount: number;
    note?: string;
    category?: string;
  }): Promise<{ success: boolean; transaction: Transaction; wallet: Wallet; message: string }> {
    return request('/api/payments/pay', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Transactions
  async getTransactions(params?: { walletId?: string; status?: string; search?: string }): Promise<{ transactions: Transaction[] }> {
    const query = new URLSearchParams();
    if (params?.walletId) query.set('walletId', params.walletId);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ transactions: Transaction[] }>(`/api/transactions${qs}`);
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/api/dashboard/stats');
  },

  // Demo helpers
  async resetDemo(): Promise<{ success: boolean; message: string }> {
    return request('/api/demo/reset', { method: 'POST' });
  },

  async getDemoMerchants(): Promise<{ merchants: DemoMerchant[] }> {
    return request<{ merchants: DemoMerchant[] }>('/api/demo/merchants');
  },
};
