export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface IChatService {
  streamReply(
    userId: string,
    userMessage: string,
    history: ChatTurn[],
    onToken: (token: string) => void
  ): Promise<string>;
}