import { z } from "zod";

export const SendMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().min(1),
});

export type SendMessageDTO = z.infer<typeof SendMessageSchema>;