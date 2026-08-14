class MessageSocketController{
    constructor(joinRoomUseCase, sendMessageUseCase, updateLastMessageUseCase, onlineUsers, io){
        this.joinRoomUseCase = joinRoomUseCase;
        this.sendMessageUseCase = sendMessageUseCase;
        this.updateLastMessageUseCase = updateLastMessageUseCase,
        this.onlineUsers = onlineUsers;
        this.io = io;
    }

    onConnect(socket){
        const userId = socket.userId;
        if(userId && this.onlineUsers){
            this.onlineUsers.set(socket.id, userId);
            this.io.emit("user:status_changed", { userId, isOnline: true });
        }
    }

    async handleJoinRoom(socket, { roomId }){
        try{
            const userId = socket.userId;
            await this.joinRoomUseCase.execute({ userId, roomId });

            socket.join(roomId);
            console.log(`[socket] User ${userId} joined room ${ roomId }`);
            socket.to(roomId).emit("user:online", {userId});
        }catch(e){
            socket.emit("error", {message: e.message });
        }
    }

    async handleSendMessage(socket, { roomId, content, clientMessageId, attachmentUrl }){
        try{
            const senderId = socket.userId;
            await this.sendMessageUseCase.execute({
                clientMessageId,
                roomId,
                senderId,
                attachmentUrl
            });
        }catch(e){
            console.log("[socket] Error sending message: ", e);
            socket.emit("Error", { message: "Gửi tin nhắn thất bại!"});
        }
    }

    handleTypingStart(socket, {roomId}){
        socket.to(roomId).emit("typing:start", {userId: socket.userId });
    }

    handleTypingStop(socket, {roomId}){
        socket.to(roomId).emit("typing:stop", { userId: socket.userId} );
    }

    async handleDisconnect(socket){
        const userId = this.onlineUsers ? this.onlineUsers.get(socket.id) : null;
        if(this.onlineUsers) this.onlineUsers.delete(socket.id);

        if(userId){
            if(this.updateLastMessageUseCase){
                await this.updateLastMessageUseCase.execute({ userId });
            }
            const nowIso = new Date().toISOString();
            this.io.emit("user:offline", {userId, isOnline: false, lastSeenAt: nowIso});
        }
    }
}