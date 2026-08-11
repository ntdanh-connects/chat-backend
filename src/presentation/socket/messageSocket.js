function registerMessageSocketHandlers(io, socket, roomrepository, sendMessageUseCase, onlineUsers){
    socket.on("room:join", async ({ roomId, userId }) =>{
        try{
            const isMember = await roomrepository.isMemberOfRoom(roomId, userId);
            if(!isMember){
                return socket.emit("error", {message: "Bạn không có quyền vào phòng này!"});
            }

            socket.join(roomId);
            onlineUsers.set(socket.id, userId);
            console.log(`[socket] ${userId} joined room ${roomId}`);
            socket.to(roomId).emit("user:online", {userId});
        }catch(error){

        }
    });

    socket.on("message:send", async ({ roomId, senderId, content, clientMessageId })=>{
        try{
            await sendMessageUseCase.execute({
                clientMessageId,
                roomId,
                senderId,
                content
            });
        }catch(error){
            console.error("[socket] Error sending messages: ", error);
            socket.emit("error", {message: "Failed to send Messages"});
        }
    });

    socket.on("typing:start", ({roomId, userId})=>{
        socket.to(roomId).emit("typing:start", {userId});
    });

    socket.on("typing:stop", ({roomId, userId}) =>{
        socket.to(roomId).emit("typing:stop", {userId});
    });

    socket.on("disconnect", ()=>{
        const userId = onlineUsers.get(socket.id);
        onlineUsers.delete(socket.id);
        if(userId){
            io.emit("user:offline", { userId });
        }
    });
}   
module.exports = registerMessageSocketHandlers;
