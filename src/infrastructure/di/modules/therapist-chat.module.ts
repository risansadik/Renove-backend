import type { Container } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import type { ITherapistChatRepository } from "../../../domain/repositories/therapist-chat.repository.ts";
import { TherapistChatRepositoryImpl } from "../../repositories/therapist-chat.impl.ts";
import type {
    IExtendTherapistChatWindowUseCase,
    IGetTherapistChatThreadsUseCase,
    IGetTherapistChatMessagesUseCase,
    ISendTherapistChatMessageUseCase,
    IMarkTherapistChatAsReadUseCase,
} from "../../../application/interfaces/therapist-chat/ITherapistChatUseCase.ts";
import {
    ExtendTherapistChatWindowUseCase,
    GetTherapistChatThreadsUseCase,
    GetTherapistChatMessagesUseCase,
    SendTherapistChatMessageUseCase,
    MarkTherapistChatAsReadUseCase,
} from "../../../application/use-cases/therapist-chat/therapist-chat.usecase.ts";
import { TherapistChatController } from "../../../presentation/controllers/therapist-chat.controller.ts";

export const registerTherapistChatModule = (container: Container): void => {
    container.bind<ITherapistChatRepository>(TYPES.TherapistChatRepository).to(TherapistChatRepositoryImpl);
    container.bind<IExtendTherapistChatWindowUseCase>(TYPES.ExtendTherapistChatWindowUseCase).to(ExtendTherapistChatWindowUseCase);
    container.bind<IGetTherapistChatThreadsUseCase>(TYPES.GetTherapistChatThreadsUseCase).to(GetTherapistChatThreadsUseCase);
    container.bind<IGetTherapistChatMessagesUseCase>(TYPES.GetTherapistChatMessagesUseCase).to(GetTherapistChatMessagesUseCase);
    container.bind<ISendTherapistChatMessageUseCase>(TYPES.SendTherapistChatMessageUseCase).to(SendTherapistChatMessageUseCase);
    container.bind<IMarkTherapistChatAsReadUseCase>(TYPES.MarkTherapistChatAsReadUseCase).to(MarkTherapistChatAsReadUseCase);
    container.bind<TherapistChatController>(TYPES.TherapistChatController).to(TherapistChatController).inSingletonScope();
};