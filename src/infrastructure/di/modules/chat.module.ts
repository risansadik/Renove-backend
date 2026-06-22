// src/infrastructure/di/modules/chat.module.ts

import type { Container } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { ChatMessageRepository } from "../../repositories/chat-message.repository.impl";
import { LangChainChatService } from "../../external-services/rag/chat.service";
import { CreateSessionUseCase, DeleteSessionUseCase, GetSessionMessagesUseCase, GetSessionsUseCase, SendMessageUseCase } from "../../../application/use-cases/chat/chat.usecase";
import { ChatController } from "../../../presentation/controllers/chat.controller"
import { IChatMessageRepository } from "../../../domain/repositories/chat-message.repository";
import { IChatService } from "../../../application/interfaces/services/rag/IChatService";
import {  ICreateSessionUseCase, IDeleteSessionUseCase, IGetSessionMessagesUseCase, IGetSessionsUseCase, ISendMessageUseCase } from "../../../application/interfaces/chat/IChatUseCase";

export const registerChatModule = (container: Container): void => {
    container.bind<IChatMessageRepository>(TYPES.ChatMessageRepository).to(ChatMessageRepository).inSingletonScope();
    container.bind<IChatService>(TYPES.ChatService).to(LangChainChatService).inSingletonScope();

    container.bind<ISendMessageUseCase>(TYPES.SendMessageUseCase).to(SendMessageUseCase);
    container.bind<IGetSessionMessagesUseCase>(TYPES.GetSessionMessagesUseCase).to(GetSessionMessagesUseCase);
    container.bind<IGetSessionsUseCase>(TYPES.GetSessionsUseCase).to(GetSessionsUseCase);
    container.bind<ICreateSessionUseCase>(TYPES.CreateSessionUseCase).to(CreateSessionUseCase);
    container.bind<IDeleteSessionUseCase>(TYPES.DeleteSessionUseCase).to(DeleteSessionUseCase);


    container.bind<ChatController>(TYPES.ChatController).to(ChatController).inSingletonScope();
};