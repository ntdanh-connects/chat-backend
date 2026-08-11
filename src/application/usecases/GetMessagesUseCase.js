class GetMessagesUseCase {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }

    async execute({ roomId, since, userId }) {
        return await this.messageRepository.findByRoom({roomId, since, userId});
    }
}

module.exports = GetMessagesUseCase;