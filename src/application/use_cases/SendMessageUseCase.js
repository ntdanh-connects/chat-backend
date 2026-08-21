const Message = require('../../domain/entities/Message.js');

class SendMessageUseCase {
    constructor(messageRepository, socketBroadcaster, notificationService, onlineUsers,roomRepository) {
        this.messageRepository = messageRepository;
        this.socketBroadcaster = socketBroadcaster;
        this.notificationService = notificationService;
        this.onlineUsers = onlineUsers;
        this.roomRepository = roomRepository;
    }

    async execute({ clientMessageId, roomId, senderId, content, attachmentUrl, receiverId }){
        const message = new Message({
            clientMessageId,
            roomId,
            senderId,
            content,
            attachmentUrl
        });

        const saveMessage = await this.messageRepository.insert(message);

        // 🟢 CHỈ PHÁT 1 LẦN DUY NHẤT VÀO PHÒNG CHAT:
        this.socketBroadcaster.broadcastToRoom(roomId, 'message:new', saveMessage);

        if(this.roomRepository){
            const memberIds = await this.roomRepository.getRoomMemberIds(roomId);
            const otherMembers = memberIds.filter(id => id !== senderId);
            
            // Gửi Push Notification cho những ai đang Offline:
            if(this.notificationService){
                const offlineUserIds = otherMembers.filter(id => !this.onlineUsers?.has(id));
                if (offlineUserIds.length > 0) {
                    await this.notificationService?.sendNotification({
                        userIds: offlineUserIds,
                        title: "Tin nhắn mới",
                        body: content,
                        data: {
                            roomId,
                            messageId: saveMessage.id
                        }
                    })
                }
            }
        }
        return saveMessage;
    }
}

module.exports = SendMessageUseCase;
