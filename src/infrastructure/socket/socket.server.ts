import { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { CALL_EVENTS, NOTIFICATION_EVENTS, THERAPIST_CHAT_EVENTS } from "../../shared/constants/index";
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/constants/tokens";
import type { ILogger } from "../../application/interfaces/services/ILoggerService";
import { NotificationEntity } from "../../domain/entities/Notification.entity";

const getAllowedOrigins = (): string[] =>
    (process.env.CLIENT_URL ?? "http://localhost:5173")
        .split(",")
        .map((o) => o.trim())
        .concat(["http://localhost:5174", "http://localhost:5173"]);

@injectable()
export class SocketServer {

    private _io: SocketIOServer | null = null;
    constructor(@inject(TYPES.Logger) private readonly _logger: ILogger) { }

    private registerCallHandlers(socket: Socket): void {
        socket.on(CALL_EVENTS.CALL_JOIN, (bookingId: string) => {
            socket.join(bookingId);
            socket.to(bookingId).emit(CALL_EVENTS.PEER_JOINED, {
                socketId: socket.id,
            });
            this._logger.info(`Socket ${socket.id} joined call room ${bookingId}`);
        });

        socket.on(
            CALL_EVENTS.CALL_OFFER,
            (payload: { bookingId: string; offer: unknown }) => {
                socket.to(payload.bookingId).emit(CALL_EVENTS.CALL_OFFER, {
                    offer: payload.offer,
                    from: socket.id,
                });
            }
        );

        socket.on(
            CALL_EVENTS.CALL_ANSWER,
            (payload: { bookingId: string; answer: unknown }) => {
                socket.to(payload.bookingId).emit(CALL_EVENTS.CALL_ANSWER, {
                    answer: payload.answer,
                    from: socket.id,
                });
            }
        );

        socket.on(
            CALL_EVENTS.ICE_CANDIDATE,
            (payload: { bookingId: string; candidate: unknown }) => {
                socket.to(payload.bookingId).emit(CALL_EVENTS.ICE_CANDIDATE, {
                    candidate: payload.candidate,
                    from: socket.id,
                });
            }
        );

        socket.on(CALL_EVENTS.CALL_LEAVE, (bookingId: string) => {
            socket.to(bookingId).emit(CALL_EVENTS.PEER_LEFT);
            socket.leave(bookingId);
            this._logger.info(`Socket ${socket.id} left call room ${bookingId}`);
        });

        socket.on(
            CALL_EVENTS.MEDIA_STATE,
            (payload: { bookingId: string; isMuted: boolean; isCameraOff: boolean }) => {
                socket.to(payload.bookingId).emit(CALL_EVENTS.MEDIA_STATE, {
                    isMuted: payload.isMuted,
                    isCameraOff: payload.isCameraOff,
                });
            }
        );
    }

    private registerNotificationHandlers(socket: Socket): void {
    socket.on(
      NOTIFICATION_EVENTS.JOIN_ROOM,
      (payload: { userId: string; role: "user" | "therapist" }) => {
        const room = `notifications:${payload.role}:${payload.userId}`;
        socket.join(room);
        this._logger.info(`Socket ${socket.id} joined notification room ${room}`);
      }
    );
 
    socket.on(
      NOTIFICATION_EVENTS.LEAVE_ROOM,
      (payload: { userId: string; role: "user" | "therapist" }) => {
        const room = `notifications:${payload.role}:${payload.userId}`;
        socket.leave(room);
        this._logger.info(`Socket ${socket.id} left notification room ${room}`);
      }
    );
  }
 
  public emitNotification(
    recipientId: string,
    role: "user" | "therapist",
    notification: NotificationEntity
  ): void {
    if (!this._io) return;
    const room = `notifications:${role}:${recipientId}`;
    this._io.to(room).emit(NOTIFICATION_EVENTS.NEW_NOTIFICATION, notification);
  }

    private registerTherapistChatHandlers(socket: Socket): void {

        socket.on(THERAPIST_CHAT_EVENTS.JOIN, (threadId: string) => {
            socket.join(threadId);
            this._logger.info(
                `Socket ${socket.id} joined therapist-chat room ${threadId}`
            );
        });

        socket.on(THERAPIST_CHAT_EVENTS.LEAVE, (threadId: string) => {
            socket.leave(threadId);
            this._logger.info(
                `Socket ${socket.id} left therapist-chat room ${threadId}`
            );
        });
        socket.on(
            THERAPIST_CHAT_EVENTS.MESSAGE,
            (payload: {
                threadId: string;
                id: string;
                senderId: string;
                senderRole: "user" | "therapist";
                content: string;
                isRead: boolean;
                createdAt: string;
            }) => {
                socket.to(payload.threadId).emit(THERAPIST_CHAT_EVENTS.MESSAGE, payload);
            }
        );

        socket.on(
            THERAPIST_CHAT_EVENTS.READ,
            (payload: { threadId: string; readerRole: "user" | "therapist" }) => {
                socket.to(payload.threadId).emit(THERAPIST_CHAT_EVENTS.READ, {
                    readerRole: payload.readerRole,
                });
            }
        );

        socket.on(
            THERAPIST_CHAT_EVENTS.THREAD_UPDATED,
            (payload: { threadId: string; expiresAt: string }) => {
                socket.to(payload.threadId).emit(THERAPIST_CHAT_EVENTS.THREAD_UPDATED, {
                    expiresAt: payload.expiresAt,
                });
            }
        );
    }

    public init(httpServer: HttpServer): void {
        const io = new SocketIOServer(httpServer, {
            cors: {
                origin: getAllowedOrigins(),
                credentials: true,
            },
        });

        io.on(CALL_EVENTS.CONNECTION, (socket: Socket) => {
            this._logger.info(`Socket connected: ${socket.id}`);
            this.registerCallHandlers(socket);
            this.registerTherapistChatHandlers(socket);
            this.registerNotificationHandlers(socket);

            socket.on(CALL_EVENTS.DISCONNECT, () => {
                this._logger.info(`Socket disconnected: ${socket.id}`);
            });
        });

        this._logger.info("Socket.io server initialized");
    }
}