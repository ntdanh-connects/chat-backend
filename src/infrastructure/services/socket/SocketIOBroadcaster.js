const SocketBroadcaster = require('../../../domain/interfaces/ISocketBroadcaster.js');

class SocketIOBroadcaster extends SocketBroadcaster{
    constructor(io){
        super();
        this.io = io; // io = instance Socket.IO server, truyền từ bên ngoài
    }

    broadcastToRoom(roomId, eventName, data){
        this.io.to(roomId).emit(eventName,data);
    }

    broadcastToUser(userId, eventName, data){
        if(!userId) return;
        this.io.to(`user:${userId}`).emit(eventName, data);
    }

    broadcastToUsers(userIds, eventName, data){
        if(!userIds || userIds.length == 0) return;

        userIds.forEach(id => {
            console.log(`📡 [Socket] Bắn ${eventName} tới kênh user:${id}`);
            this.io.to(`user:${id}`).emit(eventName, data);
        });
    }
}

module.exports = SocketIOBroadcaster;