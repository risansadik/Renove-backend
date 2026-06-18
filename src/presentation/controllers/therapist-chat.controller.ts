import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens.ts";
import { HttpStatus, MESSAGES, PAGINATION } from "../../shared/constants/index.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import type { AuthenticatedRequest } from "../../shared/types/express.ts";
import type {
  IGetTherapistChatThreadsUseCase,
  IGetTherapistChatMessagesUseCase,
  ISendTherapistChatMessageUseCase,
  IMarkTherapistChatAsReadUseCase,
} from "../../application/interfaces/therapist-chat/ITherapistChatUseCase.ts";
import { TherapistChatMapper } from "../../application/mappers/therapist-chat.mapper.ts";

@injectable()
export class TherapistChatController {
  constructor(
    @inject(TYPES.GetTherapistChatThreadsUseCase) private readonly _getThreadsUC: IGetTherapistChatThreadsUseCase,
    @inject(TYPES.GetTherapistChatMessagesUseCase) private readonly _getMessagesUC: IGetTherapistChatMessagesUseCase,
    @inject(TYPES.SendTherapistChatMessageUseCase) private readonly _sendMessageUC: ISendTherapistChatMessageUseCase,
    @inject(TYPES.MarkTherapistChatAsReadUseCase) private readonly _markReadUC: IMarkTherapistChatAsReadUseCase
  ) {}

  public getThreads = async (req: Request, res: Response): Promise<void> => {
    const { id, role } = (req as AuthenticatedRequest).user;
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;

    const requesterRole = role === "therapist" ? "therapist" : "user";

    const result = await this._getThreadsUC.execute({
      requesterId: id,
      requesterRole,
      params: { page, limit },
    });

    const totalPages = Math.ceil(result.total / limit);

    res.json(
      ResponseModel.success(
        MESSAGES.THERAPIST_CHAT.THREADS_FETCHED,
        TherapistChatMapper.toThreadDTOList(result.data),
        HttpStatus.OK,
        { total: result.total, page, limit, totalPages }
      )
    );
  };

  public getMessages = async (req: Request, res: Response): Promise<void> => {
    const { id, role } = (req as AuthenticatedRequest).user;
    const { threadId } = req.params;
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;

    const requesterRole = role === "therapist" ? "therapist" : "user";

    const result = await this._getMessagesUC.execute({
      threadId,
      requesterId: id,
      requesterRole,
      params: { page, limit },
    });

    const totalPages = Math.ceil(result.total / limit);

    res.json(
      ResponseModel.success(
        MESSAGES.THERAPIST_CHAT.MESSAGES_FETCHED,
        TherapistChatMapper.toMessageDTOList(result.data),
        HttpStatus.OK,
        { total: result.total, page, limit, totalPages }
      )
    );
  };

  public sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { id, role } = (req as AuthenticatedRequest).user;
    const { threadId } = req.params;
    const { content } = req.body;

    const senderRole = role === "therapist" ? "therapist" : "user";

    const message = await this._sendMessageUC.execute({
      threadId,
      senderId: id,
      senderRole,
      content,
    });

    res
      .status(HttpStatus.CREATED)
      .json(
        ResponseModel.created(
          MESSAGES.THERAPIST_CHAT.MESSAGE_SENT,
          TherapistChatMapper.toMessageDTO(message)
        )
      );
  };

  public markAsRead = async (req: Request, res: Response): Promise<void> => {
    const { id, role } = (req as AuthenticatedRequest).user;
    const { threadId } = req.params;

    const readerRole = role === "therapist" ? "therapist" : "user";

    await this._markReadUC.execute({
      threadId,
      readerRole,
      requesterId: id,
    });

    res.json(ResponseModel.success(MESSAGES.THERAPIST_CHAT.MARKED_READ, null));
  };
}