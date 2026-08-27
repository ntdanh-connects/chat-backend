class IEventRepository {
    async createEventForRecipients({ recipientIds, eventType, roomId, messageId, payload }) {
        throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
    }

    async getMissedEvents(userId, lastSeqId, limit) {
        throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
    }
}

module.exports = IEventRepository;