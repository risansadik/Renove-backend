import mongoose, { Schema, type Types, type Document } from "mongoose";
import { CHAT_ROLE, type ChatRole } from "../../../shared/constants/index";

// ── Session ─────
export interface IChatSessionDocument extends Document {
  userId: string;
  title: string;
  createdAt: Date;
}

export type IChatSessionRaw = Omit<IChatSessionDocument, keyof mongoose.Document> & {
  _id: Types.ObjectId;
};

const ChatSessionSchema = new Schema<IChatSessionDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const ChatSessionModel = mongoose.model<IChatSessionDocument>(
  "ChatSession",
  ChatSessionSchema
);

// ── Message ────
export interface IChatMessageDocument extends Document {
  userId: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}

export type IChatMessageRaw = Omit<IChatMessageDocument, keyof mongoose.Document> & {
  _id: Types.ObjectId;
};

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: Object.values(CHAT_ROLE), required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const ChatMessageModel = mongoose.model<IChatMessageDocument>(
  "ChatMessage",
  ChatMessageSchema
);