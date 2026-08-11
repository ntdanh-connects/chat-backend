function registerMessageSocketHandlers(io, socket, roomrepository, sendMessageUseCase, updateLastSeenUseCase, onlineUsers) {
    // 🟢 Lấy userId ngay khi socket vừa kết nối (Handshake Auth)
    const connectedUserId = socket.handshake.auth?.userId || socket.handshake.query?.userId;

    if (connectedUserId && onlineUsers) {
        onlineUsers.set(socket.id, connectedUserId);
        io.emit("user:status_changed", {
            userId: connectedUserId,
            isOnline: true
        });
    }

    socket.on("room:join", async ({ roomId, userId }) => {
        try {
            const isMember = await roomrepository.isMemberOfRoom(roomId, userId);
            if (!isMember) {
                return socket.emit("error", { message: "Bạn không có quyền vào phòng này!" });
            }

            socket.join(roomId);
            if (onlineUsers) onlineUsers.set(socket.id, userId);
            console.log(`[socket] ${userId} joined room ${roomId}`);
            socket.to(roomId).emit("user:online", { userId });
        } catch (error) {
            console.error("[socket] Error joining room: ", error);
        }
    });

    socket.on("message:send", async ({ roomId, senderId, content, clientMessageId }) => {
        try {
            await sendMessageUseCase.execute({
                clientMessageId,
                roomId,
                senderId,
                content
            });
        } catch (error) {
            console.error("[socket] Error sending messages: ", error);
            socket.emit("error", { message: "Failed to send Messages" });
        }
    });

    socket.on("typing:start", ({ roomId, userId }) => {
        socket.to(roomId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ roomId, userId }) => {
        socket.to(roomId).emit("typing:stop", { userId });
    });

    socket.on("disconnect", async () => {
        const userId = onlineUsers ? onlineUsers.get(socket.id) : null;
        if (onlineUsers) onlineUsers.delete(socket.id);

        if (userId) {
            if (updateLastSeenUseCase) {
                await updateLastSeenUseCase.execute({ userId });
            }
            const nowIso = new Date().toISOString();
            io.emit("user:offline", { userId, isOnline: false, lastSeenAt: nowIso });
        }
    });
}

module.exports = registerMessageSocketHandlers;
