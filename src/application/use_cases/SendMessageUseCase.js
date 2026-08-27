const Message = require('../../domain/entities/Message.js');

class SendMessageUseCase {
    constructor(messageRepository, socketBroadcaster, notificationService, onlineUsers,roomRepository,eventRepository) {
        this.messageRepository = messageRepository;
        this.socketBroadcaster = socketBroadcaster;
        this.notificationService = notificationService;
        this.onlineUsers = onlineUsers;
        this.roomRepository = roomRepository;
        this.eventRepository = eventRepository;
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

        if(this.roomRepository){
            const memberIds = await this.roomRepository.getRoomMemberIds(roomId);
            const otherMembers = memberIds.filter(id => id !== senderId);

            if(this.eventRepository && otherMembers.length > 0){
                await this.eventRepository.createEventForRecipients({
                    recipientIds: otherMembers,
                    eventType: 'new_message',
                    roomId,
                    messageId: saveMessage.id,
                    payload: {
                        localId: saveMessage.clientMessageId || saveMessage.id,
                        serverId: saveMessage.id,
                        roomId: saveMessage.roomId,
                        senderId: saveMessage.senderId,
                        content: saveMessage.content,
                        attachmentUrl: saveMessage.attachmentUrl || "",
                        createdAt: saveMessage.createdAt,
                        status: 'sent'
                    }
                })
            }
            
            // 🟢 1. Phát Socket Realtime tới các thành viên khác:
            this.socketBroadcaster.broadcastToUsers(otherMembers, 'message:new', saveMessage);

            // 🟢 2. Gửi Push Notification cho những ai đang Offline:
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
