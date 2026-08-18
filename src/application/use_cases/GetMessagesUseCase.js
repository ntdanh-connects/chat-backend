class GetMessagesUseCase {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }

    async execute({ roomId, before ,since, userId }) {
        return await this.messageRepository.findByRoom({ roomId, before, since, userId });
    }
}

module.exports = GetMessagesUseCase;