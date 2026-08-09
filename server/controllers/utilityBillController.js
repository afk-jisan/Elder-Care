import { UtilityBill, UTILITY_PROVIDERS } from '../models/UtilityBill.js';
import { Elder } from '../models/Elder.js';
import { Wallet } from '../models/Wallet.js';
import { Payment } from '../models/Payment.js';

function billDto(bill) {
  return {
    id: bill._id.toString(),
    elderId: bill.elderId?._id
      ? bill.elderId._id.toString()
      : bill.elderId.toString(),
    elder: bill.elderId?.name
      ? { id: bill.elderId._id.toString(), name: bill.elderId.name }
      : undefined,
    provider: bill.provider,
    accountNumber: bill.accountNumber,
    amount: bill.amount,
    dueDate: bill.dueDate,
    paid: bill.paid,
    billPhotoUrl: bill.billPhotoUrl,
    receiptUrl: bill.receiptUrl,
    createdAt: bill.createdAt,
  };
}

export async function listUtilityBills(req, res, next) {
  try {
    const filter = { familyMemberId: req.auth.userId };
    if (req.query.elderId) filter.elderId = req.query.elderId;
    const bills = await UtilityBill.find(filter)
      .populate('elderId', 'name')
      .sort({ createdAt: -1 });
    res.json({ bills: bills.map(billDto), providers: UTILITY_PROVIDERS });
  } catch (err) {
    next(err);
  }
}

export async function createUtilityBill(req, res, next) {
  try {
    const { elderId, provider, accountNumber, amount, dueDate, billPhotoUrl } =
      req.body;
    if (!elderId || !provider || !accountNumber || amount === undefined) {
      return res.status(400).json({
        message: 'Elder, provider, accountNumber, and amount are required',
      });
    }
    if (!UTILITY_PROVIDERS.includes(provider)) {
      return res.status(400).json({ message: 'Invalid provider' });
    }
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const elder = await Elder.findOne({
      _id: elderId,
      familyMemberId: req.auth.userId,
    });
    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    const bill = await UtilityBill.create({
      elderId,
      familyMemberId: req.auth.userId,
      provider,
      accountNumber: String(accountNumber).trim(),
      amount: value,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      billPhotoUrl: String(billPhotoUrl || '').trim(),
      paid: false,
    });

    const populated = await UtilityBill.findById(bill._id).populate(
      'elderId',
      'name'
    );
    res.status(201).json({ message: 'Utility bill saved', bill: billDto(populated) });
  } catch (err) {
    next(err);
  }
}

export async function payUtilityBill(req, res, next) {
  try {
    const bill = await UtilityBill.findOne({
      _id: req.params.id,
      familyMemberId: req.auth.userId,
    });
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    if (bill.paid) {
      return res.status(400).json({ message: 'Bill already paid' });
    }

    let wallet = await Wallet.findOne({ familyMemberId: req.auth.userId });
    if (!wallet) {
      wallet = await Wallet.create({
        familyMemberId: req.auth.userId,
        monthlyBudget: 0,
        remainingBudget: 0,
      });
    }
    if (wallet.remainingBudget < bill.amount) {
      return res.status(400).json({
        message: 'Insufficient escrow balance to pay this bill',
      });
    }

    wallet.remainingBudget -= bill.amount;
    await wallet.save();

    const payment = await Payment.create({
      walletId: wallet._id,
      familyMemberId: req.auth.userId,
      amount: bill.amount,
      type: 'utility_bill',
      status: 'completed',
      category: 'other',
      receiptUrl: `https://example.local/receipts/utility-${Date.now()}.pdf`,
      note: `${bill.provider} ${bill.accountNumber}`,
    });

    bill.paid = true;
    bill.paymentId = payment._id;
    bill.receiptUrl = payment.receiptUrl;
    await bill.save();

    const populated = await UtilityBill.findById(bill._id).populate(
      'elderId',
      'name'
    );
    res.json({
      message: 'Bill paid through mock gateway',
      bill: billDto(populated),
      paymentId: payment._id.toString(),
    });
  } catch (err) {
    next(err);
  }
}
