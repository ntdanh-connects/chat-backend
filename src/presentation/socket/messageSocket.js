function registerMessageSocketHandlers(socket, messageSocketController) {
    messageSocketController.onConnect(socket);

    socket.on("room:join", (data)=> messageSocketController.handleJoinRoom(socket,data));
    socket.on("message:send", (data)=> messageSocketController.handleSendMessage(socket,data));
    socket.on("typing:start", (data) => messageSocketController.handleTypingStart(socket, data));
    socket.on("typing:stop", (data) => messageSocketController.handleTypingStop(socket, data));

    socket.on("disconnect", () => messageSocketController.handleDisconnect(socket));
    socket.on("message:delivered", (data)=> messageSocketController.handleMessageDelivered(socket,data));
    socket.on("room:read", (data)=> messageSocketController.handleRoomRead(socket,data));
    socket.on("sync:more", (data) => messageSocketController.handleSyncMore(socket, data));
}

module.exports = registerMessageSocketHandlers;
