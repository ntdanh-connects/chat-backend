function registerMessageSocketHandlers(socket, messageSocketController) {
    messageSocketController.onConnect(socket);

    socket.on("room:join", (data)=> messageSocketController.handleJoinRoom(socket,data));
    socket.on("message:send", (data)=> messageSocketController.handleSendMessage(socket,data));
    socket.on("typing:start", (data) => messageSocketController.handleTypingStart(socket, data));
    socket.on("typing:stop", (data) => messageSocketController.handleTypingStop(socket, data));

    socket.on("disconnect", () => messageSocketController.handleDisconnect(socket));
}

module.exports = registerMessageSocketHandlers;
