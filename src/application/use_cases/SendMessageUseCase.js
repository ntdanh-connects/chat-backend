const Message = require('../../domain/entities/Message.js');

class SendMessageUseCase {
    constructor(messageRepository, socketBroadcaster, notificationService, onlineUsers, roomRepository, eventRepository, userRepository) {
        this.messageRepository = messageRepository;
        this.socketBroadcaster = socketBroadcaster;
        this.notificationService = notificationService;
        this.onlineUsers = onlineUsers;
        this.roomRepository = roomRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    async execute({ clientMessageId, roomId, senderId, content, attachmentUrl, receiverId }) {
        const message = new Message({
            clientMessageId,
            roomId,
            senderId,
            content,
            attachmentUrl
        });

        // 1. Lưu tin nhắn vào bảng chính
        const saveMessage = await this.messageRepository.insert(message);

        if (this.roomRepository) {
            const memberIds = await this.roomRepository.getRoomMemberIds(roomId);
            const otherMembers = memberIds.filter(id => id !== senderId);

            const payloadData = {
                localId: saveMessage.clientMessageId || saveMessage.id,
                serverId: saveMessage.id,
                roomId: saveMessage.roomId,
                senderId: saveMessage.senderId,
                content: saveMessage.content,
                attachmentUrl: saveMessage.attachmentUrl || "",
                createdAt: saveMessage.createdAt,
                status: 'sent'
            };

            // 2. Fan-out vào user_events và nhận về map seqId của từng người
            let userSeqMap = {};
            if (this.eventRepository && otherMembers.length > 0) {
                userSeqMap = await this.eventRepository.createEventForRecipients({
                    recipientIds: otherMembers,
                    eventType: 'new_message',
                    roomId,
                    messageId: saveMessage.id,
                    payload: payloadData
                });
            }

            // 🔥 3. PHÁT REALTIME TỪNG NGƯỜI KÈM ĐÚNG SEQ_ID CỦA HỌ (NẰM BÊN TRONG IF)
            for (const recipientId of otherMembers) {
                const recipientSeqId = userSeqMap[recipientId] || 0;

                this.socketBroadcaster.broadcastToUser(recipientId, 'event:new', {
                    seqId: recipientSeqId,
                    eventType: 'new_message',
                    roomId: saveMessage.roomId,
                    messageId: saveMessage.id,
                    data: {
                        seqId: recipientSeqId,
                        ...payloadData
                    }
                });
            }

            // 🟢 4. Gửi Push Notification cho những ai đang Offline
            if (this.notificationService) {
                try {
                    const allOnlineUserIds = Array.from(this.onlineUsers ? this.onlineUsers.values() : []);
                    const offlineUserIds = otherMembers.filter(id => !allOnlineUserIds.includes(id));

                    if (offlineUserIds.length > 0) {
                        let senderName = "Người dùng";
                        if (this.userRepository?.findById) {
                            try {
                                const senderUser = await this.userRepository.findById(senderId);
                                if (senderUser?.fullName) senderName = senderUser.fullName;
                            } catch (_) {}
                        }

                        for (const recipientId of offlineUserIds) {
                            const recipientSeqId = userSeqMap[recipientId] || 0;

                            await this.notificationService.sendNotification({
                                userIds: [recipientId],
                                data: {
                                    type: "NEW_MESSAGE",
                                    roomId: String(roomId),
                                    messageId: String(saveMessage.id),
                                    senderId: String(senderId),
                                    seqId: String(recipientSeqId),
                                    senderName: senderName,
                                    preview: content ? String(content).slice(0, 100) : "[Hình ảnh/Tệp tin]",
                                    createdAt: new Date(saveMessage.createdAt).toISOString()
                                }
                            });
                        }
                    }
                } catch (pushErr) {
                    console.error("⚠️ [PushNotification] Lỗi gửi push (không ảnh hưởng chat realtime):", pushErr);
                }
            }
        }
        return saveMessage;
    }
}

module.exports = SendMessageUseCase;
