import type { TherapistChatThreadEntity } from "../../../domain/entities/TherapistChatThread.entity.ts";
import type { TherapistChatMessageEntity } from "../../../domain/entities/TherapistChatMessage.entity.ts";
import type { IUseCase } from "../IUseCase.ts";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.ts";

export interface ExtendTherapistChatWindowInput {
  userId: string;
  therapistId: string;
  bookingId: string;
}

export type IExtendTherapistChatWindowUseCase = IUseCase<
  ExtendTherapistChatWindowInput,
  TherapistChatThreadEntity
>;

export interface GetTherapistChatThreadsInput {
  requesterId: string;
  requesterRole: "user" | "therapist";
  params?: PaginationParams;
}

export type IGetTherapistChatThreadsUseCase = IUseCase<
  GetTherapistChatThreadsInput,
  PaginatedResult<TherapistChatThreadEntity>
>;

export interface GetTherapistChatMessagesInput {
  threadId: string;
  requesterId: string;
  requesterRole: "user" | "therapist";
  params?: PaginationParams;
}

export type IGetTherapistChatMessagesUseCase = IUseCase<
  GetTherapistChatMessagesInput,
  PaginatedResult<TherapistChatMessageEntity>
>;

export interface SendTherapistChatMessageInput {
  threadId: string;
  senderId: string;
  senderRole: "user" | "therapist";
  content: string;
}

export type ISendTherapistChatMessageUseCase = IUseCase<
  SendTherapistChatMessageInput,
  TherapistChatMessageEntity
>;

export interface MarkTherapistChatAsReadInput {
  threadId: string;
  readerRole: "user" | "therapist";
  requesterId: string;
}

export type IMarkTherapistChatAsReadUseCase = IUseCase<MarkTherapistChatAsReadInput, void>;