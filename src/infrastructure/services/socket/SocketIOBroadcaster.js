const SocketBroadcaster = require('../../../domain/interfaces/ISocketBroadcaster.js');

class SocketIOBroadcaster extends SocketBroadcaster{
    constructor(io){
        super();
        this.io = io; // io = instance Socket.IO server, truyền từ bên ngoài
    }

    broadcastToRoom(roomId, eventName, data){
        this.io.to(roomId).emit(eventName,data);
    }
}

module.exports = SocketIOBroadcaster;