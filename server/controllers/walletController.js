import { Wallet } from '../models/Wallet.js';
import { Payment } from '../models/Payment.js';
import { Task } from '../models/Task.js';

function walletDto(wallet) {
  return {
    id: wallet._id.toString(),
    familyMemberId: wallet.familyMemberId.toString(),
    monthlyBudget: wallet.monthlyBudget,
    remainingBudget: wallet.remainingBudget,
    categoryLimits: wallet.categoryLimits,
  };
}

function paymentDto(p) {
  return {
    id: p._id.toString(),
    amount: p.amount,
    type: p.type,
    status: p.status,
    category: p.category,
    otpRequired: p.otpRequired,
    otpVerified: p.otpVerified,
    receiptUrl: p.receiptUrl,
    note: p.note,
    caregiverId: p.caregiverId ? p.caregiverId.toString() : null,
    taskId: p.taskId ? p.taskId.toString() : null,
    createdAt: p.createdAt,
  };
}

async function getOrCreateWallet(familyMemberId) {
  let wallet = await Wallet.findOne({ familyMemberId });
  if (!wallet) {
    wallet = await Wallet.create({
      familyMemberId,
      monthlyBudget: 0,
      remainingBudget: 0,
    });
  }
  return wallet;
}

export async function getWallet(req, res, next) {
  try {
    const wallet = await getOrCreateWallet(req.auth.userId);
    const payments = await Payment.find({ familyMemberId: req.auth.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ wallet: walletDto(wallet), payments: payments.map(paymentDto) });
  } catch (err) {
    next(err);
  }
}

export async function updateWalletBudget(req, res, next) {
  try {
    const { monthlyBudget, categoryLimits } = req.body;
    const wallet = await getOrCreateWallet(req.auth.userId);
    if (monthlyBudget !== undefined) {
      const budget = Number(monthlyBudget);
      if (Number.isNaN(budget) || budget < 0) {
        return res.status(400).json({ message: 'Invalid monthlyBudget' });
      }
      const delta = budget - wallet.monthlyBudget;
      wallet.monthlyBudget = budget;
      wallet.remainingBudget = Math.max(0, wallet.remainingBudget + delta);
    }
    if (categoryLimits && typeof categoryLimits === 'object') {
      for (const key of ['groceries', 'medicine', 'transport', 'other']) {
        if (categoryLimits[key] !== undefined) {
          wallet.categoryLimits[key] = Number(categoryLimits[key]) || 0;
        }
      }
    }
    await wallet.save();
    res.json({ message: 'Wallet updated', wallet: walletDto(wallet) });
  } catch (err) {
    next(err);
  }
}

export async function loadWallet(req, res, next) {
  try {
    const amount = Number(req.body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'amount must be positive' });
    }
    const wallet = await getOrCreateWallet(req.auth.userId);
    wallet.remainingBudget += amount;
    wallet.monthlyBudget = Math.max(wallet.monthlyBudget, wallet.remainingBudget);
    await wallet.save();

    const payment = await Payment.create({
      walletId: wallet._id,
      familyMemberId: req.auth.userId,
      amount,
      type: 'escrow_load',
      status: 'completed',
      note: 'Mock gateway load',
      receiptUrl: `https://example.local/receipts/load-${Date.now()}.pdf`,
    });

    res.status(201).json({
      message: 'Funds loaded (mock gateway)',
      wallet: walletDto(wallet),
      payment: paymentDto(payment),
    });
  } catch (err) {
    next(err);
  }
}

export async function releasePayment(req, res, next) {
  try {
    const { amount, caregiverId, taskId, category, otp } = req.body;
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      return res.status(400).json({ message: 'amount must be positive' });
    }
    if (!caregiverId) {
      return res.status(400).json({ message: 'caregiverId is required' });
    }

    const wallet = await getOrCreateWallet(req.auth.userId);
    if (wallet.remainingBudget < value) {
      return res.status(400).json({ message: 'Insufficient escrow balance' });
    }

    if (taskId) {
      const task = await Task.findOne({
        _id: taskId,
        familyMemberId: req.auth.userId,
        status: 'completed',
      });
      if (!task) {
        return res.status(400).json({
          message: 'Completed GPS-verified task required for this release',
        });
      }
    }

    const otpRequired = value > 10000;
    if (otpRequired) {
      const expected = '123456';
      if (!otp) {
        const pending = await Payment.create({
          walletId: wallet._id,
          familyMemberId: req.auth.userId,
          caregiverId,
          amount: value,
          type: 'manual_release',
          status: 'pending',
          category: category || 'other',
          taskId: taskId || null,
          otpRequired: true,
          otpCode: expected,
          note: 'OTP required for releases above 10000 BDT (mock OTP 123456)',
        });
        return res.status(202).json({
          message: 'OTP required. Use mock code 123456',
          payment: paymentDto(pending),
        });
      }
      if (String(otp) !== expected) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
    }

    wallet.remainingBudget -= value;
    await wallet.save();

    const payment = await Payment.create({
      walletId: wallet._id,
      familyMemberId: req.auth.userId,
      caregiverId,
      amount: value,
      type: taskId ? 'task_release' : 'manual_release',
      status: 'completed',
      category: category || 'other',
      taskId: taskId || null,
      otpRequired,
      otpVerified: otpRequired,
      receiptUrl: `https://example.local/receipts/release-${Date.now()}.pdf`,
      note: 'Mock escrow release',
    });

    res.json({
      message: 'Payment released',
      wallet: walletDto(wallet),
      payment: paymentDto(payment),
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmReleaseOtp(req, res, next) {
  try {
    const { otp } = req.body;
    const payment = await Payment.findOne({
      _id: req.params.id,
      familyMemberId: req.auth.userId,
      status: 'pending',
      otpRequired: true,
    });
    if (!payment) {
      return res.status(404).json({ message: 'Pending payment not found' });
    }
    if (String(otp) !== payment.otpCode) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const wallet = await Wallet.findById(payment.walletId);
    if (!wallet || wallet.remainingBudget < payment.amount) {
      return res.status(400).json({ message: 'Insufficient escrow balance' });
    }
    wallet.remainingBudget -= payment.amount;
    await wallet.save();

    payment.status = 'completed';
    payment.otpVerified = true;
    payment.receiptUrl = `https://example.local/receipts/release-${Date.now()}.pdf`;
    await payment.save();

    res.json({
      message: 'OTP verified and payment released',
      wallet: walletDto(wallet),
      payment: paymentDto(payment),
    });
  } catch (err) {
    next(err);
  }
}
