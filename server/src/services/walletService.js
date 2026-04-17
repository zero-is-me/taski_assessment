import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/ApiError.js";

const ensurePositiveInteger = (amountInPaise) => {
  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
    throw new ApiError(400, "Bad Request", "amountInPaise must be a positive integer");
  }
};

export const getOrCreateWallet = async (userId, session = null) => {
  let wallet = await Wallet.findOne({ userId }).session(session);

  if (!wallet) {
    wallet = await Wallet.create([{ userId, balanceInPaise: 0 }], { session }).then((docs) => docs[0]);
  }

  return wallet;
};

export const addMoneyToWallet = async ({ userId, amountInPaise, description }, session) => {
  ensurePositiveInteger(amountInPaise);

  const wallet = await getOrCreateWallet(userId, session);

  wallet.balanceInPaise += amountInPaise;
  await wallet.save({ session });

  await Transaction.create(
    [
      {
        userId,
        type: "credit",
        amountInPaise,
        description,
      },
    ],
    { session }
  );

  return wallet;
};

export const debitWallet = async ({ userId, amountInPaise, description, bookingId }, session) => {
  ensurePositiveInteger(amountInPaise);

  const wallet = await Wallet.findOneAndUpdate(
    {
      userId,
      balanceInPaise: { $gte: amountInPaise },
    },
    {
      $inc: { balanceInPaise: -amountInPaise },
    },
    {
      new: true,
      session,
    }
  );

  if (!wallet) {
    throw new ApiError(400, "Bad Request", "Insufficient wallet balance");
  }

  await Transaction.create(
    [
      {
        userId,
        type: "debit",
        amountInPaise,
        description,
        bookingId,
      },
    ],
    { session }
  );

  return wallet;
};

export const debitWalletBalance = async ({ userId, amountInPaise }, session) => {
  ensurePositiveInteger(amountInPaise);

  const wallet = await Wallet.findOneAndUpdate(
    {
      userId,
      balanceInPaise: { $gte: amountInPaise },
    },
    {
      $inc: { balanceInPaise: -amountInPaise },
    },
    {
      new: true,
      session,
    }
  );

  if (!wallet) {
    throw new ApiError(400, "Bad Request", "Insufficient wallet balance");
  }

  return wallet;
};

export const refundWallet = async ({ userId, amountInPaise, description, bookingId }, session) => {
  ensurePositiveInteger(amountInPaise);

  const wallet = await getOrCreateWallet(userId, session);
  wallet.balanceInPaise += amountInPaise;
  await wallet.save({ session });

  await Transaction.create(
    [
      {
        userId,
        type: "refund",
        amountInPaise,
        description,
        bookingId,
      },
    ],
    { session }
  );

  return wallet;
};
