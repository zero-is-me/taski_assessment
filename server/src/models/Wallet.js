import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balanceInPaise: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "balanceInPaise must be an integer",
      },
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
