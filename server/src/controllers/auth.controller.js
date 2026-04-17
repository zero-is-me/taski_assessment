import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const makeToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const register = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const email = req.body.email?.toLowerCase();

  if (!name || !email || !password) {
    throw new ApiError(400, "Bad Request", "name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, "Bad Request", "Email already registered");
  }

  const user = await User.create({ name, email, password });
  await Wallet.create({ userId: user._id });

  const safeUser = await User.findById(user._id).select("-password");

  res.status(201).json(new ApiResponse({ user: safeUser, token: makeToken(user._id) }, "Registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const password = req.body.password;
  const email = req.body.email?.toLowerCase();

  if (!email || !password) {
    throw new ApiError(400, "Bad Request", "email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Unauthorized", "Invalid email or password");
  }

  const safeUser = await User.findById(user._id).select("-password");

  res.status(200).json(new ApiResponse({ user: safeUser, token: makeToken(user._id) }, "Logged in successfully"));
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse({ user: req.user }, "Current user fetched"));
});
