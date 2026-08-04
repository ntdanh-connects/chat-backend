function registerMessageSocketHandlers(io, socket, sendMessageUseCase, onlineUsers){
    socket.on("room:join", ({ roomId, userId }) =>{
        socket.join(roomId);
        onlineUsers.set(socket.id, userId);
        console.log(`[socket] ${userId} joined room ${roomId}`);
        socket.io(roomId).emit("user:online", {userId});
    });

    socket.on("message:send", async ({ roomId, senderId, content, content, clientMessageId })=>{
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
