import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addMoneyToWallet, getOrCreateWallet } from "../services/walletService.js";

export const getWallet = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);
  res.status(200).json(new ApiResponse({ wallet }, "Wallet fetched"));
});

export const addMoney = asyncHandler(async (req, res) => {
  const { amountInPaise } = req.body;
  const session = await mongoose.startSession();

  try {
    let wallet;

    await session.withTransaction(async () => {
      wallet = await addMoneyToWallet(
        {
          userId: req.user._id,
          amountInPaise,
          description: "Wallet top up",
        },
        session
      );
    });

    res.status(200).json(new ApiResponse({ wallet }, "Money added to wallet"));
  } finally {
    session.endSession();
  }
});

export const getMyTransactions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments({ userId: req.user._id }),
  ]);

  res.status(200).json(
    new ApiResponse(
      {
        transactions: items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      },
      "Transactions fetched"
    )
  );
});
