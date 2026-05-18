import mongoose, { Schema, type Document } from "mongoose";

// --- Therapist Wallet ---
export interface IWalletDocument extends Document {
  therapistId: mongoose.Types.ObjectId;
  pendingBalance: number;
  availableBalance: number;
  withdrawnBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWalletDocument>(
  {
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", required: true, unique: true },
    pendingBalance: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    withdrawnBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

WalletSchema.index({ therapistId: 1 });
export const WalletModel = mongoose.model<IWalletDocument>("Wallet", WalletSchema);

// --- User Wallet ---
export interface IUserWalletDocument extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserWalletSchema = new Schema<IUserWalletDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserWalletSchema.index({ userId: 1 });
export const UserWalletModel = mongoose.model<IUserWalletDocument>("UserWallet", UserWalletSchema);

// --- Transactions ---
export interface ITransactionDocument extends Document {
  walletId: mongoose.Types.ObjectId;
  walletType: "TherapistWallet" | "UserWallet";
  amount: number;
  type: "credit" | "debit";
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    walletId: { type: Schema.Types.ObjectId, required: true },
    walletType: { type: String, enum: ["TherapistWallet", "UserWallet"], required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TransactionSchema.index({ walletId: 1, createdAt: -1 });
export const TransactionModel = mongoose.model<ITransactionDocument>("Transaction", TransactionSchema);
