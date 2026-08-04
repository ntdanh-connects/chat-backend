//Entity thuần túy không biết gì về DB, Socket, Express
// Giống hệt tính chất MessageEntity của Flutter
class Message{
    constructor({
        id,
        organizationId,
        clientMessageId,
        roomId,
        senderId,
        content,
        attachmentUrl = null,
        createdAt
    }){
        this.id = id,
        this.organizationId = organizationId,
        this.clientMessageId = clientMessageId,
        this.roomId = roomId,
        this.senderId = senderId,
        this.content = content,
        this.attachmentUrl = attachmentUrl,
        this.createdAt = createdAt
    }
}

module.exports = Message;