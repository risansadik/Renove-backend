import type { TherapistWalletEntity } from "../../domain/entities/TherapistWallet.entity";
import type { UserWalletEntity } from "../../domain/entities/UserWallet.entity";
import type { TransactionEntity } from "../../domain/entities/Transaction.entity";

export interface PublicTherapistWalletDTO {
  id?: string;
  therapistId: string;
  pendingBalance: number;
  availableBalance: number;
  withdrawnBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublicUserWalletDTO {
  id?: string;
  userId: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublicTransactionDTO {
  id?: string;
  walletId: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  status: "pending" | "completed" | "failed";
  bookingId?: string;
  consultationFee?: number;
  commissionPercentage?: number;
  platformFee?: number;
  totalPaid?: number;
  therapistEarnings?: number;
  refundAmount?: number;
  createdAt?: Date;
}

export class WalletMapper {
  static toTherapistWalletDTO(entity: TherapistWalletEntity): PublicTherapistWalletDTO {
    return {
      id: entity.id,
      therapistId: entity.therapistId,
      pendingBalance: entity.pendingBalance,
      availableBalance: entity.availableBalance,
      withdrawnBalance: entity.withdrawnBalance,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toUserWalletDTO(entity: UserWalletEntity): PublicUserWalletDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      balance: entity.balance,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toTransactionDTO(entity: TransactionEntity): PublicTransactionDTO {
    return {
      id: entity.id,
      walletId: entity.walletId,
      amount: entity.amount,
      type: entity.type,
      description: entity.description,
      status: entity.status,
      bookingId: entity.bookingId,
      consultationFee: entity.consultationFee,
      commissionPercentage: entity.commissionPercentage,
      platformFee: entity.platformFee,
      totalPaid: entity.totalPaid,
      therapistEarnings: entity.therapistEarnings,
      refundAmount: entity.refundAmount,
      createdAt: entity.createdAt,
    };
  }

  static toTransactionDTOList(entities: TransactionEntity[]): PublicTransactionDTO[] {
    return entities.map(e => this.toTransactionDTO(e));
  }
}
