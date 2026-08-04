class GetMessagesUseCase {
    constructor(messageRepository){
        this.messageRepository = messageRepository;
    }

    async execute({roomId, since}){
        return await this.messageRepository.findByRoom(roomId,since);
    }
}