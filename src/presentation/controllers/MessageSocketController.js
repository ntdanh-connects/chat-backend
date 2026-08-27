class MessageSocketController {
    constructor(joinRoomUseCase, sendMessageUseCase, updateLastSeenUseCase, syncMissedEventsUseCase, onlineUsers, io) {
        this.joinRoomUseCase = joinRoomUseCase;
        this.sendMessageUseCase = sendMessageUseCase;
        this.updateLastSeenUseCase = updateLastSeenUseCase;
        this.syncMissedEventsUseCase = syncMissedEventsUseCase;
        this.onlineUsers = onlineUsers;
        this.io = io;
    }

    async onConnect(socket) {
        const userId = socket.userId;
        if (userId && this.onlineUsers) {
            this.onlineUsers.set(socket.id, userId);
            socket.join(`user:${userId}`);
            console.log(`🟢 [Global Online] User ${userId} vừa mở App`);

            // 1. Phát cho toàn mạng biết user này đang Online:
            this.io.emit("user:status_changed", { userId, isOnline: true });

            const lastSeqId = Number(socket.handshake.auth?.lastSeqId) || 0;
            if (this.syncMissedEventsUseCase) {
                const PAGE_SIZE = 200;
                const { events, hasMore } = await this.syncMissedEventsUseCase.execute({
                    userId,
                    lastSeqId,
                    limit: PAGE_SIZE
                });
                if (events && events.length > 0) {
                    console.log(`📡 [Cursor Sync] Gửi bù ${events.length} sự kiện cho User ${userId}`);
                    socket.emit("sync:delta", {
                        events: events,
                        hasMore: hasMore,
                    });
                }
            }

            // 2. Gửi ngay cho người vừa mở app danh sách những ai đang online từ trước:
            const allOnlineUserIds = Array.from(new Set(this.onlineUsers.values()));
            for (const onlineId of allOnlineUserIds) {
                if (onlineId !== userId) {
                    socket.emit("user:status_changed", { userId: onlineId, isOnline: true });
                }
            }
        }
    }

    async handleJoinRoom(socket, { roomId }) {
        try {
            const userId = socket.userId;
            const { memberIds } = await this.joinRoomUseCase.execute({ userId, roomId });
            socket.join(roomId);
            console.log(`[socket] User ${userId} joined room ${roomId}`);

            if (memberIds && this.onlineUsers) {
                const partnerId = memberIds.find(id => id != userId);
                if (partnerId) {
                    const isPartnerOnline = Array.from(this.onlineUsers.values()).includes(partnerId);

                    let lastSeenAt = null;
                    if (!isPartnerOnline && this.updateLastSeenUseCase?.userRepository?.getLastSeen) {
                        lastSeenAt = await this.updateLastSeenUseCase.userRepository.getLastSeen(partnerId);
                    }

                    console.log(`📡 [Socket handleJoinRoom] Emitting to user ${userId} about partner ${partnerId} | isOnline: ${isPartnerOnline} | lastSeenAt: ${lastSeenAt}`);

                    socket.emit("user:status_changed", {
                        userId: partnerId,
                        isOnline: isPartnerOnline,
                        lastSeenAt: lastSeenAt ? new Date(lastSeenAt).toISOString() : null
                    });
                }
            }
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
            if (!stillOnline) {
                console.log(`User Offline ${userId} out app`);
                if (this.updateLastSeenUseCase) {
                    await this.updateLastSeenUseCase.execute({ userId });
                }
                const nowIso = new Date().toISOString();
                this.io.emit("user:status_changed", { userId, isOnline: false, lastSeenAt: nowIso });
                this.io.emit("user:offline", { userId, isOnline: false, lastSeenAt: nowIso });
            }
        }
    }

    async handleMessageDelivered(socket, { roomId, messageId, senderId }) {
        this.io.to(`user:${senderId}`).emit("message:status_updated", {
            roomId,
            messageId,
            status: "delivered"
        })
    }

    async handleRoomRead(socket, { roomId }) {
        socket.to(roomId).emit("room:messages_read", {
            roomId,
            readerId: socket.userId
        })
    }

    async handleSyncMore(socket, { lastSeqId }) {
        try {
            const userId = socket.userId;
            const PAGE_SIZE = 200;
            if (this.syncMissedEventsUseCase) {
                const { events, hasMore } = await this.syncMissedEventsUseCase.execute({
                    userId,
                    lastSeqId: Number(lastSeqId) || 0,
                    limit: PAGE_SIZE
                });
                socket.emit("sync:delta", {
                    events: events,
                    hasMore: hasMore
                });
            }
        } catch (e) {
            console.error("❌ [handleSyncMore] Lỗi sync thêm:", e);
        }
    }

}

module.exports = MessageSocketController;