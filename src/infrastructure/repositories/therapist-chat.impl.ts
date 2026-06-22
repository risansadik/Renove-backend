import { injectable } from "inversify";
import type { ITherapistChatRepository } from "../../domain/repositories/therapist-chat.repository";
import type { TherapistChatThreadEntity } from "../../domain/entities/TherapistChatThread.entity";
import type { TherapistChatMessageEntity } from "../../domain/entities/TherapistChatMessage.entity";
import type { PaginationParams, PaginatedResult } from "../../domain/interfaces/pagination";
import {
  TherapistChatThreadModel,
  type ITherapistChatThreadRaw,
} from "../databases/schema/therapist-chat-thread.schema";
import {
  TherapistChatMessageModel,
  type ITherapistChatMessageRaw,
} from "../databases/schema/therapist-chat-message.schema";
import { TherapistChatDbMapper } from "../mappers/therapist-chat.db-mapper";

@injectable()
export class TherapistChatRepositoryImpl implements ITherapistChatRepository {
  async findThreadById(id: string): Promise<TherapistChatThreadEntity | null> {
    const doc = await TherapistChatThreadModel.findById(id)
      .populate("userId", "name email")
      .populate("therapistId", "name");
    return doc ? TherapistChatDbMapper.toThreadEntity(doc as unknown as ITherapistChatThreadRaw) : null;
  }

  async findThreadByUserAndTherapist(
    userId: string,
    therapistId: string
  ): Promise<TherapistChatThreadEntity | null> {
    const doc = await TherapistChatThreadModel.findOne({ userId, therapistId })
      .populate("userId", "name email")
      .populate("therapistId", "name");
    return doc ? TherapistChatDbMapper.toThreadEntity(doc as unknown as ITherapistChatThreadRaw) : null;
  }

  async upsertThreadExpiry(input: {
    userId: string;
    therapistId: string;
    bookingId: string;
    expiresAt: Date;
  }): Promise<TherapistChatThreadEntity> {
    const doc = await TherapistChatThreadModel.findOneAndUpdate(
      { userId: input.userId, therapistId: input.therapistId },
      [
        {
          $set: {
            expiresAt: {
              $cond: {
                if: { $gt: [new Date(input.expiresAt), "$expiresAt"] },
                then: new Date(input.expiresAt),
                else: "$expiresAt",
              },
            },
            lastBookingId: input.bookingId,
          },
        },
      ],
      { new: true, upsert: true }
    )
      .populate("userId", "name email")
      .populate("therapistId", "name");

    return TherapistChatDbMapper.toThreadEntity(doc as unknown as ITherapistChatThreadRaw);
  }

  async findThreadsByUserId(
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<TherapistChatThreadEntity>> {
    const query = TherapistChatThreadModel.find({ userId })
      .populate("userId", "name email")
      .populate("therapistId", "name")
      .sort({ updatedAt: -1 });

    if (params) {
      query.skip((params.page - 1) * params.limit).limit(params.limit);
    }

    const [docs, total] = await Promise.all([
      query.lean().exec(),
      TherapistChatThreadModel.countDocuments({ userId }),
    ]);

    return {
      data: docs.map((doc) =>
        TherapistChatDbMapper.toThreadEntity(doc as unknown as ITherapistChatThreadRaw)
      ),
      total,
    };
  }

  async findThreadsByTherapistId(
    therapistId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<TherapistChatThreadEntity>> {
    const query = TherapistChatThreadModel.find({ therapistId })
      .populate("userId", "name email")
      .populate("therapistId", "name")
      .sort({ updatedAt: -1 });

    if (params) {
      query.skip((params.page - 1) * params.limit).limit(params.limit);
    }

    const [docs, total] = await Promise.all([
      query.lean().exec(),
      TherapistChatThreadModel.countDocuments({ therapistId }),
    ]);

    return {
      data: docs.map((doc) =>
        TherapistChatDbMapper.toThreadEntity(doc as unknown as ITherapistChatThreadRaw)
      ),
      total,
    };
  }

  async createMessage(
    message: Omit<TherapistChatMessageEntity, "id" | "createdAt">
  ): Promise<TherapistChatMessageEntity> {
    const doc = await TherapistChatMessageModel.create(message);
    return TherapistChatDbMapper.toMessageEntity(doc as unknown as ITherapistChatMessageRaw);
  }

  async findMessagesByThreadId(
    threadId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<TherapistChatMessageEntity>> {
    const query = TherapistChatMessageModel.find({ threadId }).sort({ createdAt: 1 });

    if (params) {
      query.skip((params.page - 1) * params.limit).limit(params.limit);
    }

    const [docs, total] = await Promise.all([
      query.lean().exec(),
      TherapistChatMessageModel.countDocuments({ threadId }),
    ]);

    return {
      data: docs.map((doc) =>
        TherapistChatDbMapper.toMessageEntity(doc as unknown as ITherapistChatMessageRaw)
      ),
      total,
    };
  }

  async markMessagesAsRead(
    threadId: string,
    readerRole: TherapistChatMessageEntity["senderRole"]
  ): Promise<void> {
    const senderRole = readerRole === "user" ? "therapist" : "user";
    await TherapistChatMessageModel.updateMany(
      { threadId, senderRole, isRead: false },
      { $set: { isRead: true } }
    );
  }

  async countUnreadMessages(
    threadId: string,
    readerRole: TherapistChatMessageEntity["senderRole"]
  ): Promise<number> {
    const senderRole = readerRole === "user" ? "therapist" : "user";
    return TherapistChatMessageModel.countDocuments({ threadId, senderRole, isRead: false });
  }
}