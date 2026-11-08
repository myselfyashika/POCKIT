import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Helper middleware to extract user ID from header or query, fallback to demo user
const getUserId = (req: Request): string => {
  const authHeader = req.headers['x-user-id'] as string;
  if (authHeader && authHeader.trim().length > 0) {
    return authHeader.trim();
  }
  // Default demo user ID
  return 'usr_student_demo';
};

// ==========================================
// API Endpoints
// ==========================================

// 1. Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Try signing up.' });
    }

    if (password && user.passwordHash !== password) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        college: user.college,
        upiId: user.upiId,
        avatarColor: user.avatarColor,
        unallocatedBalance: user.unallocatedBalance,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { name, email, password, college } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const newUser = db.createUser(name, email, password, college || '');
    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        college: newUser.college,
        upiId: newUser.upiId,
        avatarColor: newUser.avatarColor,
        unallocatedBalance: newUser.unallocatedBalance,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Signup failed' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      college: user.college,
      upiId: user.upiId,
      avatarColor: user.avatarColor,
      unallocatedBalance: user.unallocatedBalance,
      createdAt: user.createdAt,
    },
  });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name, college, avatarColor } = req.body;
    const updated = db.updateUserProfile(userId, { name, college, avatarColor });

    res.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        college: updated.college,
        upiId: updated.upiId,
        avatarColor: updated.avatarColor,
        unallocatedBalance: updated.unallocatedBalance,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update profile' });
  }
});

// 2. Account Funds (Add Simulated Funds)
app.post('/api/account/add-funds', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    const user = db.addUnallocatedFunds(userId, amount);
    res.json({
      success: true,
      unallocatedBalance: user.unallocatedBalance,
      message: `₹${amount.toFixed(2)} added to unallocated balance`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add funds' });
  }
});

// 3. Wallets CRUD & Operations
app.get('/api/wallets', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const wallets = db.getWalletsByUser(userId);
  res.json({ wallets });
});

app.post('/api/wallets', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name, category, icon, color, monthlyBudget, initialAllocation } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Wallet name is required' });
    }

    const wallet = db.createWallet({
      userId,
      name,
      category,
      icon,
      color,
      monthlyBudget: Number(monthlyBudget) || 1000,
      initialAllocation: Number(initialAllocation) || 0,
    });

    const user = db.getUserById(userId);
    res.status(201).json({
      wallet,
      unallocatedBalance: user?.unallocatedBalance || 0,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create wallet' });
  }
});

app.put('/api/wallets/:id', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const walletId = req.params.id;
    const { name, category, icon, color, monthlyBudget } = req.body;

    const updated = db.updateWallet(walletId, userId, {
      name,
      category,
      icon,
      color,
      monthlyBudget,
    });

    res.json({ wallet: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update wallet' });
  }
});

app.delete('/api/wallets/:id', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const walletId = req.params.id;
    const result = db.deleteWallet(walletId, userId);
    const user = db.getUserById(userId);

    res.json({
      success: true,
      returnedToUnallocated: result.returnedToUnallocated,
      unallocatedBalance: user?.unallocatedBalance || 0,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete wallet' });
  }
});

app.post('/api/wallets/:id/allocate', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const walletId = req.params.id;
    const amount = Number(req.body.amount);

    if (isNaN(amount) || amount === 0) {
      return res.status(400).json({ error: 'Allocation amount cannot be zero' });
    }

    const result = db.allocateFunds(userId, walletId, amount);
    res.json({
      success: true,
      wallet: result.wallet,
      unallocatedBalance: result.user.unallocatedBalance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Allocation failed' });
  }
});

app.post('/api/wallets/batch-allocate', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { allocations } = req.body;
    if (!Array.isArray(allocations)) {
      return res.status(400).json({ error: 'Allocations array is required' });
    }

    const result = db.batchAllocateFunds(userId, allocations);
    res.json({
      success: true,
      wallets: result.wallets,
      unallocatedBalance: result.user.unallocatedBalance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Batch allocation failed' });
  }
});

app.post('/api/wallets/transfer', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { sourceWalletId, targetWalletId, amount } = req.body;

    if (!sourceWalletId || !targetWalletId) {
      return res.status(400).json({ error: 'Source and target wallet IDs are required' });
    }

    const result = db.transferBetweenWallets(userId, sourceWalletId, targetWalletId, Number(amount));
    res.json({
      success: true,
      sourceWallet: result.source,
      targetWallet: result.target,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Transfer failed' });
  }
});

// 4. Scan & Pay (Flagship Feature)
app.post('/api/payments/pay', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { walletId, merchantName, merchantUpiId, amount, note, category } = req.body;

    if (!walletId) {
      return res.status(400).json({ error: 'Please choose which wallet to pay from' });
    }
    if (!merchantName || !merchantUpiId) {
      return res.status(400).json({ error: 'Merchant details are required' });
    }

    const result = db.processWalletPayment({
      userId,
      walletId,
      merchantName,
      merchantUpiId,
      amount,
      note,
      category,
    });

    res.json({
      success: true,
      transaction: result.transaction,
      wallet: result.wallet,
      message: `₹${result.transaction.amount.toFixed(2)} paid successfully from ${result.wallet.name}`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment processing failed' });
  }
});

// 5. Transactions & Statements
app.get('/api/transactions', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { walletId, status, search } = req.query as { walletId?: string; status?: string; search?: string };

  const transactions = db.getTransactionsByUser(userId, { walletId, status, search });
  res.json({ transactions });
});

// 6. Dashboard & Insights
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const stats = db.getDashboardStats(userId);
  res.json(stats);
});

// 7. Demo Reset & Sample Campus Merchants
app.post('/api/demo/reset', (_req: Request, res: Response) => {
  db.resetToDemo();
  res.json({ success: true, message: 'Reset to realistic student demo state' });
});

app.get('/api/demo/merchants', (_req: Request, res: Response) => {
  const sampleMerchants = [
    {
      id: 'm1',
      name: 'Campus Central Canteen',
      upiId: 'canteen.dtu@upi',
      category: 'Food',
      recommendedWalletCategory: 'Food',
      suggestedAmounts: [40, 80, 140, 220],
      description: 'Hostel mess, rolls, lunch thali, fresh juice',
      verified: true,
    },
    {
      id: 'm2',
      name: 'Delhi Metro Automated Turnstile',
      upiId: 'dmrc.metro@upi',
      category: 'Transit',
      recommendedWalletCategory: 'Transit',
      suggestedAmounts: [30, 50, 100, 200],
      description: 'Quick QR ticket or smart card recharge',
      verified: true,
    },
    {
      id: 'm3',
      name: 'Sharma Ji Night Tapri & Maggi',
      upiId: 'sharmachai@ybl',
      category: 'Cafeteria',
      recommendedWalletCategory: 'Cafeteria',
      suggestedAmounts: [15, 30, 50, 80],
      description: 'Late night study chai, bun maska, double egg maggi',
      verified: true,
    },
    {
      id: 'm4',
      name: 'University Book Depot & Xerox',
      upiId: 'guptaxerox@okaxis',
      category: 'Education',
      recommendedWalletCategory: 'Education',
      suggestedAmounts: [60, 120, 250, 500],
      description: 'Notes printing, spiral binding, lab manuals, registers',
      verified: true,
    },
    {
      id: 'm5',
      name: 'Hostel Laundromat Express',
      upiId: 'campus.laundry@paytm',
      category: 'Services',
      recommendedWalletCategory: 'General',
      suggestedAmounts: [80, 150, 250],
      description: 'Wash & fold, steam press for formals',
      verified: true,
    },
    {
      id: 'm6',
      name: 'PVR City Mall Cinepolis',
      upiId: 'pvr.cinemas@upi',
      category: 'Entertainment',
      recommendedWalletCategory: 'Entertainment',
      suggestedAmounts: [180, 260, 420],
      description: 'Weekend movie tickets & student discount combos',
      verified: true,
    },
  ];

  res.json({ merchants: sampleMerchants });
});

// ==========================================
// Dev & Production Server Mounting
// ==========================================

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pockit Fintech Server running on http://0.0.0.0:${PORT} [${isProduction ? 'prod' : 'dev'}]`);
  });
}

startServer();
