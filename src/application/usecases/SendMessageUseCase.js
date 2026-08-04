const Message = require('../../domain/entities/Message.js');

class SendMessageUseCase {
    constructor(messageRepository, socketBroadcaster) {
        this.messageRepository = messageRepository;
        this.socketBroadcaster = socketBroadcaster;
    }

    async execute({ clientMessageId, roomId, senderId, content, attachmentUrl}){
        const message = new Message({
            clientMessageId,
            roomId,
            senderId,
            content,
            attachmentUrl
        });

        const saveMessage = await this.messageRepository.insert(message);

        this.socketBroadcaster.broadcastToRoom(roomId, 'message:new', saveMessage);

        return saveMessage;
    }
}

module.exports = SendMessageUseCase;
