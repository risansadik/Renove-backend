// src/presentation/controllers/chat.controller.ts

import { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { HttpStatus } from "../../shared/constants/index.ts";
import type { AuthRequest } from "../../shared/types/express.ts";
import type {
    ISendMessageUseCase,
    IGetSessionMessagesUseCase,
    IGetSessionsUseCase,
    ICreateSessionUseCase,
    IDeleteSessionUseCase,
} from "../../application/interfaces/chat/IChatUseCase.ts";
import { ChatMapper } from "../../application/mappers/chat.mapper.ts";

@injectable()
export class ChatController {
    constructor(
        @inject(TYPES.SendMessageUseCase) private readonly _sendMessageUC: ISendMessageUseCase,
        @inject(TYPES.GetSessionMessagesUseCase) private readonly _getSessionMessagesUC: IGetSessionMessagesUseCase,
        @inject(TYPES.GetSessionsUseCase) private readonly _getSessionsUC: IGetSessionsUseCase,
        @inject(TYPES.CreateSessionUseCase) private readonly _createSessionUC: ICreateSessionUseCase,
        @inject(TYPES.DeleteSessionUseCase) private readonly _deleteSessionUC: IDeleteSessionUseCase
    ) { }

    public getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
        const sessions = await this._getSessionsUC.execute(req.user!.id);
        res.status(HttpStatus.OK).json(ResponseModel.success("Sessions fetched", ChatMapper.toSessionDTOList(sessions)));
    };

    public createSession = async (req: AuthRequest, res: Response): Promise<void> => {
        const session = await this._createSessionUC.execute(req.user!.id);
        res.status(HttpStatus.CREATED).json(ResponseModel.created("Session created", ChatMapper.toSessionDTO(session)));
    };

    public deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
        const { sessionId } = req.params;
        await this._deleteSessionUC.execute({ userId: req.user!.id, sessionId });
        res.status(HttpStatus.OK).json(ResponseModel.success("Session deleted", null));
    };

    public getSessionMessages = async (req: AuthRequest, res: Response): Promise<void> => {
        const { sessionId } = req.params;
        const messages = await this._getSessionMessagesUC.execute({ userId: req.user!.id, sessionId });
        res.status(HttpStatus.OK).json(ResponseModel.success("Messages fetched", ChatMapper.toMessageDTOList(messages)));
    };

    public streamMessage = async (req: AuthRequest, res: Response): Promise<void> => {
        const { message, sessionId } = req.body;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        try {
            await this._sendMessageUC.execute({
                userId: req.user!.id,
                sessionId,
                message,
                onToken: (token) => {
                    res.write(`data: ${JSON.stringify({ token })}\n\n`);
                },
            });
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        } catch {
            res.write(`data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`);
        } finally {
            res.end();
        }
    };
}