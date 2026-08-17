class SocketBroadcaster{
    broadcastToRoom(roomId, eventName, data){
        throw new Error('broadcastToRoom() chưa được implement');
    }

    broadcastToUsers(userIds, eventName, data){
        throw new Error('broadcastToUsers() chưa được implement');
    }
}

module.exports = SocketBroadcaster;