const SocketBroadcaster = require('../../../domain/interfaces/ISocketBroadcaster.js');

class SocketIOBroadcaster extends SocketBroadcaster{
    constructor(io){
        super();
        this.io = io; // io = instance Socket.IO server, truyền từ bên ngoài
    }

    broadcastToRoom(roomId, eventName, data){
        this.io.to(roomId).emit(eventName,data);
    }

    broadcastToUsers(userIds, eventName, data){
        if(!userIds || userIds.length == 0) return;

        const userChannels = userIds.map(id => `user:${id}`);
        console.log(`[Socket] Bắn ${eventName} tới các kênh:`, userChannels);

        this.io.to(userChannels).emit(eventName,data);
    }
}

module.exports = SocketIOBroadcaster;