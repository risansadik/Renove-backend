import { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { logger } from "../../shared/utils/logger.ts";
import { CALL_EVENTS } from "../../shared/constants/index.ts";

const getAllowedOrigins = (): string[] =>
    (process.env.CLIENT_URL ?? "http://localhost:5173")
        .split(",")
        .map((o) => o.trim())
        .concat(["http://localhost:5174", "http://localhost:5173"]);

const registerCallHandlers = (
    socket: Socket,
    io: SocketIOServer
): void => {
    socket.on(CALL_EVENTS.CALL_JOIN, (bookingId: string) => {
        socket.join(bookingId);
        socket.to(bookingId).emit(CALL_EVENTS.PEER_JOINED, {
            socketId: socket.id,
        });
        logger.info(`Socket ${socket.id} joined call room ${bookingId}`);
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
        logger.info(`Socket ${socket.id} left call room ${bookingId}`);
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
};

export class SocketServer {
    public init(httpServer: HttpServer): void {
        const io = new SocketIOServer(httpServer, {
            cors: {
                origin: getAllowedOrigins(),
                credentials: true,
            },
        });

        io.on(CALL_EVENTS.CONNECTION, (socket: Socket) => {
            logger.info(`Socket connected: ${socket.id}`);
            registerCallHandlers(socket, io);

            socket.on(CALL_EVENTS.DISCONNECT, () => {
                logger.info(`Socket disconnected: ${socket.id}`);
            });
        });

        logger.info("Socket.io server initialized");
    }
}

export const socketServer = new SocketServer();