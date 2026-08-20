class MessageSocketController {
    constructor(joinRoomUseCase, sendMessageUseCase, updateLastSeenUseCase, onlineUsers, io) {
        this.joinRoomUseCase = joinRoomUseCase;
        this.sendMessageUseCase = sendMessageUseCase;
        this.updateLastSeenUseCase = updateLastSeenUseCase;
        this.onlineUsers = onlineUsers;
        this.io = io;
    }

    onConnect(socket) {
        const userId = socket.userId;
        if (userId && this.onlineUsers) {
            this.onlineUsers.set(socket.id, userId);
            socket.join(`user:${userId}`);
            console.log(`🟢 [Global Online] User ${userId} vừa mở App`);

            // Phát cho toàn mạng biết user này đang Online:
            this.io.emit("user:status_changed", { userId, isOnline: true });

            // Trả về cho socket này danh sách những ai đang online:
            const allOnlineUserIds = Array.from(new Set(this.onlineUsers.values()));
            socket.emit("users:online_list", allOnlineUserIds);
        }
    }

    async handleJoinRoom(socket, { roomId }) {
        try {
            const userId = socket.userId;
            await this.joinRoomUseCase.execute({ userId, roomId });
            socket.join(roomId);
            console.log(`[socket] User ${userId} joined room ${roomId}`);
        } catch (e) {
            socket.emit("error", { message: e.message });
        }
    }

    async handleSendMessage(socket, { roomId, content, clientMessageId, attachmentUrl }) {
        try {
            const senderId = socket.userId;
            const saveMessage = await this.sendMessageUseCase.execute({
                clientMessageId,
                roomId,
                senderId,
                content,
                attachmentUrl
            });
            socket.emit("message:ack", {
                clientMessageId,
                serverId: saveMessage.id,
                status: "sent"
            });
        } catch (e) {
            console.log("[socket] Error sending message: ", e);
            socket.emit("message:failed", { 
                clientMessageId,
                message: e.message || "Gửi tin nhắn thất bại!" 
            });
        }
    }

    handleTypingStart(socket, { roomId }) {
        socket.to(roomId).emit("typing:start", { userId: socket.userId });
    }

    handleTypingStop(socket, { roomId }) {
        socket.to(roomId).emit("typing:stop", { userId: socket.userId });
    }

    async handleDisconnect(socket) {
        const userId = this.onlineUsers ? this.onlineUsers.get(socket.id) : null;
        if (this.onlineUsers) this.onlineUsers.delete(socket.id);

        if (userId) {
            const stillOnline = this.onlineUsers ? Array.from(this.onlineUsers.values()).includes(userId) : false;
            if(!stillOnline){
                console.log(`User Offline ${userId} out app`);
                if (this.updateLastSeenUseCase) {
                    await this.updateLastSeenUseCase.execute({ userId });
                }
                const nowIso = new Date().toISOString();
                this.io.emit("user:offline", { userId, isOnline: false, lastSeenAt: nowIso });
            }
        }
    }
}

module.exports = MessageSocketController;